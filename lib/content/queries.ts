import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { one, query } from "@/lib/db";
import { DEFAULT_SETTINGS, type Section, type SiteSettings } from "./schema";

/**
 * Published content, cached and tagged "content". The studio calls
 * updateTag("content") when something is published, so visitors see the change
 * on their next request while every other request is served from the cache.
 */

export interface PublishedPage {
  id: string;
  slug: string;
  title: string;
  seo_description: string | null;
  sections: Section[];
}

export interface Post {
  id: string;
  slug: string;
  kind: "article" | "press" | "event";
  title: string;
  excerpt: string | null;
  body: string;
  cover_image: string | null;
  author: string | null;
  category: string | null;
  event_start: string | null;
  event_location: string | null;
  published_at: string | null;
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("content");
  cacheLife("max");
  try {
    const row = await one<{ data: Partial<SiteSettings> }>("select data from site_settings where id = 'site'");
    return { ...DEFAULT_SETTINGS, ...(row?.data ?? {}) };
  } catch (e) {
    console.error("[content] settings", (e as Error).message);
    return DEFAULT_SETTINGS;
  }
}

export async function getPublishedPage(slug: string): Promise<PublishedPage | null> {
  "use cache";
  cacheTag("content");
  cacheLife("max");
  return one<PublishedPage>(
    "select id, slug, title, seo_description, sections from pages where slug = $1 and status = 'published'",
    [slug],
  );
}

export async function getPublishedSlugs(): Promise<string[]> {
  "use cache";
  cacheTag("content");
  cacheLife("max");
  try {
    const rows = await query<{ slug: string }>("select slug from pages where status = 'published' and slug <> 'home'");
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
}

const POST_COLUMNS = "id, slug, kind, title, excerpt, body, cover_image, author, category, event_start, event_location, published_at";

export async function getPosts(kind: string = "all", limit = 50): Promise<Post[]> {
  "use cache";
  cacheTag("content");
  cacheLife("max");
  return query<Post>(
    `select ${POST_COLUMNS} from posts where status = 'published' and ($1 = 'all' or kind = $1)
     order by coalesce(event_start, published_at) desc nulls last limit $2`,
    [kind, limit],
  );
}

export async function getPost(slug: string): Promise<Post | null> {
  "use cache";
  cacheTag("content");
  cacheLife("max");
  return one<Post>(`select ${POST_COLUMNS} from posts where slug = $1 and status = 'published'`, [slug]);
}

export async function getPostSlugs(): Promise<string[]> {
  "use cache";
  cacheTag("content");
  cacheLife("max");
  try {
    return (await query<{ slug: string }>("select slug from posts where status = 'published'")).map((r) => r.slug);
  } catch {
    return [];
  }
}
