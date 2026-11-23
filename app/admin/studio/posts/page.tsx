import Link from "next/link";
import { Newspaper, Plus } from "lucide-react";
import { requireStaff } from "@/lib/session";
import { query } from "@/lib/db";
import { formatDate, cn } from "@/lib/utils";
import { PageTitle, Pill, Empty } from "@/components/dash/ui";

export const metadata = { title: "Posts · Studio" };
const KINDS = [{ id: "", label: "All" }, { id: "article", label: "Articles" }, { id: "press", label: "Press releases" }, { id: "event", label: "Events" }];

export default async function Posts({ searchParams }: PageProps<"/admin/studio/posts">) {
  await requireStaff();
  const kind = String((await searchParams).kind ?? "");
  const rows = await query<{ id: string; title: string; kind: string; status: string; published_at: string | null; event_start: string | null; cover_image: string | null; author: string | null }>(
    "select id, title, kind, status, published_at, event_start, cover_image, author from posts where ($1 = '' or kind = $1) order by coalesce(published_at, created_at) desc",
    [kind],
  );
  return (
    <>
      <PageTitle title="Posts" sub="Articles, press releases and events." actions={<Link href="/admin/studio/posts/new" className="btn btn-primary"><Plus className="size-4" /> New post</Link>} />
      <div className="panel mb-4 inline-flex gap-1 p-1">
        {KINDS.map((k) => <Link key={k.id} href={`/admin/studio/posts${k.id ? `?kind=${k.id}` : ""}`} className={cn("rounded-lg px-3 py-2.5 text-[13px] md:py-1.5", kind === k.id ? "bg-[var(--d-active)] font-semibold" : "muted hover:bg-[var(--d-hover)]")}>{k.label}</Link>)}
      </div>
      <div className="panel">
        {rows.length ? (
          <ul>
            {rows.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/studio/posts/${p.id}`} className="row-hover hairline flex items-center gap-4 border-b p-4 last:border-0">
                  <span className="size-14 shrink-0 overflow-hidden rounded-lg bg-[var(--d-hover)]">{p.cover_image ? <img src={p.cover_image} alt="" className="size-full object-cover" /> : null}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{p.title}</span>
                    <span className="faint text-xs capitalize">{p.kind === "press" ? "Press release" : p.kind} · {formatDate(p.event_start ?? p.published_at)}{p.author ? ` · ${p.author}` : ""}</span>
                  </span>
                  <Pill tone={p.status === "published" ? "green" : "stone"}>{p.status === "published" ? "Live" : "Draft"}</Pill>
                </Link>
              </li>
            ))}
          </ul>
        ) : <Empty icon={Newspaper} title="No posts yet" />}
      </div>
    </>
  );
}
