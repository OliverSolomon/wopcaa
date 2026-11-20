import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { requireCaseTeam } from "@/lib/session";
import { query } from "@/lib/db";
import { timeAgo, cn } from "@/lib/utils";
import { PageTitle, Pill, Empty } from "@/components/dash/ui";
import { MarkHandled } from "@/components/dash/small-actions";

export const metadata = { title: "Enquiries" };

const KINDS = [{ id: "contact", label: "Contact" }, { id: "membership", label: "Membership" }, { id: "newsletter", label: "Newsletter" }];

export default async function Enquiries({ searchParams }: PageProps<"/admin/enquiries">) {
  await requireCaseTeam();
  const sp = await searchParams;
  const kind = KINDS.some((k) => k.id === sp.kind) ? (sp.kind as string) : "contact";
  const rows = await query<{ id: string; name: string | null; email: string; phone: string | null; message: string | null; meta: Record<string, string>; handled_at: string | null; created_at: string }>(
    "select id, name, email, phone, message, meta, handled_at, created_at from enquiries where kind = $1 order by handled_at nulls first, created_at desc limit 300",
    [kind],
  );
  return (
    <>
      <PageTitle title="Enquiries" sub="Messages and applications from the public website." />
      <div className="panel mb-4 inline-flex gap-1 p-1">
        {KINDS.map((k) => (
          <Link key={k.id} href={`/admin/enquiries?kind=${k.id}`} className={cn("rounded-lg px-3 py-1.5 text-[13px]", kind === k.id ? "bg-[var(--d-active)] font-semibold" : "muted hover:bg-[var(--d-hover)]")}>{k.label}</Link>
        ))}
      </div>
      <div className="panel">
        {rows.length ? (
          <ul>
            {rows.map((e) => (
              <li key={e.id} className={cn("hairline grid gap-2 border-b p-5 last:border-0 md:grid-cols-[1fr_auto]", e.handled_at && "opacity-60")}>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold">{e.name ?? e.email}</span>
                    <a href={`mailto:${e.email}`} className="text-[var(--d-accent)] hover:underline">{e.email}</a>
                    {e.phone ? <span className="muted">· {e.phone}</span> : null}
                    {e.meta?.type ? <Pill tone="blue">{e.meta.type}</Pill> : null}
                    {e.meta?.county ? <Pill tone="stone">{e.meta.county}</Pill> : null}
                  </p>
                  {e.message ? <p className="muted mt-2 whitespace-pre-wrap text-sm">{e.message}</p> : null}
                  <p className="faint mt-2 text-xs">{timeAgo(e.created_at)}</p>
                </div>
                {kind !== "newsletter" ? <MarkHandled id={e.id} handled={!!e.handled_at} /> : null}
              </li>
            ))}
          </ul>
        ) : <Empty icon={MessagesSquare} title="Nothing here yet" />}
      </div>
    </>
  );
}
