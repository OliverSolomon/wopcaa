import Link from "next/link";
import { FileText, Home } from "lucide-react";
import { requireStaff } from "@/lib/session";
import { query } from "@/lib/db";
import { timeAgo } from "@/lib/utils";
import { PageTitle, Pill } from "@/components/dash/ui";
import { NewPage } from "@/components/studio/new-page";

export const metadata = { title: "Pages · Studio" };

export default async function Pages() {
  await requireStaff();
  const pages = await query<{ id: string; slug: string; title: string; draft_title: string | null; status: string; has_draft: boolean; updated_at: string; sections: number; editor: string | null }>(
    `select p.id, p.slug, p.title, p.draft_title, p.status, (p.draft_sections is not null) has_draft, p.updated_at,
       jsonb_array_length(coalesce(p.draft_sections, p.sections))::int sections, coalesce(pr.full_name, u.name) editor
     from pages p left join profiles pr on pr.user_id = p.updated_by left join neon_auth."user" u on u.id = p.updated_by
     order by (p.slug = 'home') desc, p.title`,
  );
  return (
    <>
      <PageTitle title="Pages" sub="Every page is a stack of sections. Edit a draft, preview it, then publish." actions={<NewPage />} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pages.map((p) => (
          <Link key={p.id} href={`/admin/studio/pages/${p.id}`} className="panel row-hover group p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[var(--d-accent-soft)] text-[var(--d-accent)]">{p.slug === "home" ? <Home className="size-4" /> : <FileText className="size-4" />}</span>
              <Pill tone={p.status === "published" ? (p.has_draft ? "ochre" : "green") : "stone"}>{p.status === "published" ? (p.has_draft ? "Changes" : "Live") : "Draft"}</Pill>
            </div>
            <p className="mt-4 font-semibold">{p.draft_title ?? p.title}</p>
            <p className="faint font-mono text-xs">/{p.slug === "home" ? "" : p.slug}</p>
            <p className="faint mt-4 text-xs">{p.sections} sections · edited {timeAgo(p.updated_at)}{p.editor ? ` by ${p.editor}` : ""}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
