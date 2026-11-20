import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/session";
import { one, query } from "@/lib/db";
import { PageEditor, type EditorPage, type Revision } from "@/components/studio/page-editor";
import type { Section } from "@/lib/content/schema";

export const metadata = { title: "Edit page · Studio" };

export default async function EditPage({ params }: PageProps<"/admin/studio/pages/[id]">) {
  await requireStaff();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const row = await one<{ id: string; slug: string; status: "draft" | "published"; title: string; draft_title: string | null; seo_description: string | null; draft_seo_description: string | null; sections: Section[]; draft_sections: Section[] | null; show_in_nav: boolean; nav_order: number; updated_at: string; published_at: string | null }>(
    "select * from pages where id = $1", [id],
  );
  if (!row) notFound();
  const revisions = await query<Revision>(
    `select r.id, r.title, r.note, r.created_at, coalesce(p.full_name, u.name) author from page_revisions r
     left join profiles p on p.user_id = r.created_by left join neon_auth."user" u on u.id = r.created_by
     where r.page_id = $1 order by r.created_at desc limit 30`, [id],
  );
  const page: EditorPage = {
    id: row.id, slug: row.slug, status: row.status, title: row.draft_title ?? row.title,
    seo_description: row.draft_seo_description ?? row.seo_description, sections: row.draft_sections ?? row.sections,
    show_in_nav: row.show_in_nav, nav_order: row.nav_order, has_draft: row.draft_sections !== null, updated_at: row.updated_at, published_at: row.published_at,
  };
  return <PageEditor page={page} revisions={revisions} />;
}
