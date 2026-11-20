"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { one, query } from "@/lib/db";
import { audit, requireStaff } from "@/lib/session";
import { removeObject } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import type { Section } from "@/lib/content/schema";

type Result<T = unknown> = { ok: true; data?: T } | { ok: false; error: string };
const RESERVED = new Set(["admin", "account", "api", "report", "track", "news", "sign-in", "sign-up", "preview", "go", "home"]);

const published = () => updateTag("content");

/* ───────────── Pages ───────────── */

export async function createPage(title: string, slugInput: string): Promise<Result<{ id: string }>> {
  const v = await requireStaff();
  const slug = slugify(slugInput || title);
  if (!title.trim()) return { ok: false, error: "Give the page a title." };
  if (!slug || RESERVED.has(slug)) return { ok: false, error: "Choose a different address for this page." };
  if (await one("select 1 from pages where slug = $1", [slug])) return { ok: false, error: "A page already uses that address." };
  const sections: Section[] = [{ _key: Math.random().toString(36).slice(2, 10), type: "pageHeader", kicker: "", title: `${title.trim()}.`, intro: "", image: "" }];
  const row = await one<{ id: string }>(
    "insert into pages(slug, title, draft_title, sections, draft_sections, updated_by) values ($1,$2,$2,'[]',$3,$4) returning id",
    [slug, title.trim(), JSON.stringify(sections), v.id],
  );
  await audit(v.id, "page.create", row!.id, { slug });
  return { ok: true, data: { id: row!.id } };
}

const draftSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(100),
  seo_description: z.string().max(300).nullable(),
  sections: z.array(z.object({ _key: z.string(), type: z.string() }).passthrough()).max(60),
  show_in_nav: z.boolean(),
  nav_order: z.number().int(),
});

export async function saveDraft(id: string, draft: z.infer<typeof draftSchema>): Promise<Result<{ updated_at: string }>> {
  const v = await requireStaff();
  const p = draftSchema.safeParse(draft);
  if (!p.success) return { ok: false, error: p.error.issues[0].message };
  const current = await one<{ slug: string }>("select slug from pages where id = $1", [id]);
  if (!current) return { ok: false, error: "Page not found." };
  let slug = current.slug;
  if (current.slug !== "home") {
    const wanted = slugify(p.data.slug);
    if (!wanted || RESERVED.has(wanted)) return { ok: false, error: "That address is reserved." };
    if (wanted !== current.slug && (await one("select 1 from pages where slug = $1 and id <> $2", [wanted, id]))) return { ok: false, error: "Another page uses that address." };
    slug = wanted;
  }
  const row = await one<{ updated_at: string }>(
    `update pages set draft_title = $2, draft_seo_description = $3, draft_sections = $4, slug = $5, show_in_nav = $6, nav_order = $7,
       updated_at = now(), updated_by = $8 where id = $1 returning updated_at`,
    [id, p.data.title, p.data.seo_description, JSON.stringify(p.data.sections), slug, p.data.show_in_nav, p.data.nav_order, v.id],
  );
  // Slug and menu changes are live straight away for published pages.
  if (slug !== current.slug) published();
  return { ok: true, data: { updated_at: row!.updated_at } };
}

export async function publishPage(id: string, note?: string): Promise<Result> {
  const v = await requireStaff();
  const page = await one<{ draft_title: string | null; title: string; draft_seo_description: string | null; seo_description: string | null; draft_sections: unknown; sections: unknown }>(
    "select draft_title, title, draft_seo_description, seo_description, draft_sections, sections from pages where id = $1", [id],
  );
  if (!page) return { ok: false, error: "Page not found." };
  const title = page.draft_title ?? page.title;
  const seo = page.draft_seo_description ?? page.seo_description;
  const sections = page.draft_sections ?? page.sections;
  await query(
    `update pages set title = $2, seo_description = $3, sections = $4, draft_title = null, draft_seo_description = null, draft_sections = null,
       status = 'published', published_at = now(), updated_at = now(), updated_by = $5 where id = $1`,
    [id, title, seo, JSON.stringify(sections), v.id],
  );
  await query("insert into page_revisions(page_id, title, seo_description, sections, note, created_by) values ($1,$2,$3,$4,$5,$6)", [id, title, seo, JSON.stringify(sections), note ?? null, v.id]);
  await audit(v.id, "page.publish", id);
  published();
  return { ok: true };
}

export async function unpublishPage(id: string): Promise<Result> {
  const v = await requireStaff();
  const page = await one<{ slug: string }>("select slug from pages where id = $1", [id]);
  if (page?.slug === "home") return { ok: false, error: "The home page cannot be unpublished." };
  await query(
    "update pages set status = 'draft', draft_title = coalesce(draft_title, title), draft_sections = coalesce(draft_sections, sections), updated_at = now() where id = $1",
    [id],
  );
  await audit(v.id, "page.unpublish", id);
  published();
  return { ok: true };
}

export async function discardDraft(id: string): Promise<Result> {
  const v = await requireStaff();
  const page = await one<{ status: string }>("select status from pages where id = $1", [id]);
  if (page?.status !== "published") return { ok: false, error: "This page has never been published, so there is nothing to go back to." };
  await query("update pages set draft_title = null, draft_seo_description = null, draft_sections = null, updated_at = now() where id = $1", [id]);
  await audit(v.id, "page.discard", id);
  return { ok: true };
}

export async function deletePage(id: string): Promise<Result> {
  const v = await requireStaff();
  const page = await one<{ slug: string }>("select slug from pages where id = $1", [id]);
  if (!page) return { ok: false, error: "Page not found." };
  if (page.slug === "home") return { ok: false, error: "The home page cannot be deleted." };
  await query("delete from pages where id = $1", [id]);
  await audit(v.id, "page.delete", id, { slug: page.slug });
  published();
  return { ok: true };
}

export async function restoreRevision(pageId: string, revisionId: string): Promise<Result> {
  const v = await requireStaff();
  const rev = await one<{ title: string; seo_description: string | null; sections: unknown }>("select title, seo_description, sections from page_revisions where id = $1 and page_id = $2", [revisionId, pageId]);
  if (!rev) return { ok: false, error: "Revision not found." };
  await query("update pages set draft_title = $2, draft_seo_description = $3, draft_sections = $4, updated_at = now(), updated_by = $5 where id = $1", [pageId, rev.title, rev.seo_description, JSON.stringify(rev.sections), v.id]);
  await audit(v.id, "page.restore", pageId, { revisionId });
  return { ok: true };
}

/* ───────────── Posts ───────────── */

const postSchema = z.object({
  title: z.string().trim().min(1, "Add a title.").max(220),
  slug: z.string().trim().max(120),
  kind: z.enum(["article", "press", "event"]),
  excerpt: z.string().max(600).nullable(),
  body: z.string().max(100_000),
  cover_image: z.string().max(1000).nullable(),
  author: z.string().max(120).nullable(),
  category: z.string().max(80).nullable(),
  event_start: z.string().nullable(),
  event_location: z.string().max(200).nullable(),
  published_at: z.string().nullable(),
});

export async function savePost(id: string | null, post: z.infer<typeof postSchema>, publish?: boolean): Promise<Result<{ id: string }>> {
  const v = await requireStaff();
  const p = postSchema.safeParse(post);
  if (!p.success) return { ok: false, error: p.error.issues[0].message };
  const d = p.data;
  const slug = slugify(d.slug || d.title);
  if (!slug) return { ok: false, error: "Add an address for this post." };
  if (await one("select 1 from posts where slug = $1 and ($2::uuid is null or id <> $2)", [slug, id])) return { ok: false, error: "Another post uses that address." };
  const vals = [slug, d.kind, d.title, d.excerpt, d.body, d.cover_image, d.author, d.category, d.event_start || null, d.event_location, d.published_at || null];
  let rowId = id;
  if (id) {
    await query(
      `update posts set slug=$2, kind=$3, title=$4, excerpt=$5, body=$6, cover_image=$7, author=$8, category=$9, event_start=$10, event_location=$11,
         published_at = coalesce($12::timestamptz, published_at), updated_at = now() where id = $1`,
      [id, ...vals],
    );
  } else {
    rowId = (await one<{ id: string }>(
      `insert into posts(slug, kind, title, excerpt, body, cover_image, author, category, event_start, event_location, published_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id`, vals,
    ))!.id;
  }
  if (publish !== undefined) {
    await query(`update posts set status = $2, published_at = case when $2 = 'published' then coalesce(published_at, now()) else published_at end where id = $1`, [rowId, publish ? "published" : "draft"]);
  }
  await audit(v.id, "post.save", rowId!, { publish });
  published();
  return { ok: true, data: { id: rowId! } };
}

export async function deletePost(id: string): Promise<Result> {
  const v = await requireStaff();
  await query("delete from posts where id = $1", [id]);
  await audit(v.id, "post.delete", id);
  published();
  return { ok: true };
}

/* ───────────── Settings ───────────── */

export async function saveSettings(data: Record<string, unknown>): Promise<Result> {
  const v = await requireStaff();
  if (!data || typeof data !== "object" || JSON.stringify(data).length > 200_000) return { ok: false, error: "Settings are invalid." };
  await query(
    `insert into site_settings(id, data, updated_by) values ('site', $1, $2)
     on conflict (id) do update set data = $1, updated_at = now(), updated_by = $2`,
    [JSON.stringify(data), v.id],
  );
  await audit(v.id, "settings.save", "site");
  published();
  return { ok: true };
}

/* ───────────── Media ───────────── */

export async function listMedia(): Promise<{ id: string; url: string; alt: string | null; mime_type: string | null }[]> {
  await requireStaff();
  return query("select id, url, alt, mime_type from media order by created_at desc limit 400");
}

export async function updateMediaAlt(id: string, alt: string): Promise<Result> {
  await requireStaff();
  await query("update media set alt = $2 where id = $1", [id, alt.slice(0, 300)]);
  return { ok: true };
}

export async function deleteMedia(id: string): Promise<Result> {
  const v = await requireStaff();
  const m = await one<{ object_key: string | null; url: string }>("select object_key, url from media where id = $1", [id]);
  if (!m) return { ok: false, error: "Not found." };
  const used = await one<{ n: number }>(
    `select ((select count(*) from pages where sections::text like '%' || $1 || '%' or coalesce(draft_sections::text,'') like '%' || $1 || '%')
          + (select count(*) from posts where cover_image = $1 or body like '%' || $1 || '%')
          + (select count(*) from site_settings where data::text like '%' || $1 || '%'))::int n`,
    [m.url],
  );
  if (used && used.n > 0) return { ok: false, error: "This file is used on the site. Remove it from those pages first." };
  if (m.object_key) await removeObject("media", m.object_key).catch(() => {});
  await query("delete from media where id = $1", [id]);
  await audit(v.id, "media.delete", id);
  return { ok: true };
}
