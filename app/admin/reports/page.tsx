import Link from "next/link";
import { EyeOff, Inbox, Paperclip, UserRound } from "lucide-react";
import { requireCaseTeam } from "@/lib/session";
import { query } from "@/lib/db";
import { CATEGORIES, STATUSES, categoryLabel, statusLabel, statusTone, urgencyLabel } from "@/lib/report-options";
import { formatDate, timeAgo, cn } from "@/lib/utils";
import { PageTitle, Pill, Empty } from "@/components/dash/ui";

export const metadata = { title: "Reports" };

export default async function ReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  const v = await requireCaseTeam();
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const status = one("status"), category = one("category"), q = one("q").trim().toUpperCase(), mine = one("mine") === "1";

  const where: string[] = [];
  const params: unknown[] = [];
  if (status === "open") where.push("status not in ('resolved','closed')");
  else if (status) { params.push(status); where.push(`status = $${params.length}`); }
  if (category) { params.push(category); where.push(`category = $${params.length}`); }
  if (q) { params.push(`%${q}%`); where.push(`reference_code like $${params.length}`); }
  if (mine) { params.push(v.id); where.push(`assigned_to = $${params.length}`); }

  const rows = await query<{ id: string; reference_code: string; category: string; status: string; urgency: string; county: string | null; created_at: string; updated_at: string; is_anonymous: boolean; files: number; assignee: string | null }>(
    `select r.id, r.reference_code, r.category, r.status, r.urgency, r.county, r.created_at, r.updated_at, r.is_anonymous,
       (select count(*)::int from report_attachments a where a.report_id = r.id) files,
       coalesce(p.full_name, u.name) assignee
     from reports r left join profiles p on p.user_id = r.assigned_to left join neon_auth."user" u on u.id = r.assigned_to
     ${where.length ? `where ${where.join(" and ")}` : ""}
     order by (r.urgency = 'critical' and r.status not in ('resolved','closed')) desc, r.created_at desc limit 200`,
    params,
  );

  const tabs = [{ id: "", label: "All" }, { id: "open", label: "Open" }, ...STATUSES.map((s) => ({ id: s.id, label: s.label }))];
  const href = (patch: Record<string, string>) => {
    const u = new URLSearchParams({ ...(status && { status }), ...(category && { category }), ...(q && { q }), ...(mine && { mine: "1" }), ...patch });
    for (const [k, val] of [...u.entries()]) if (!val) u.delete(k);
    return `/admin/reports${u.size ? `?${u}` : ""}`;
  };

  return (
    <>
      <PageTitle title="Reports" sub="Every report is encrypted at rest. Opening one is logged." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="panel flex flex-wrap gap-1 p-1">
          {tabs.map((t) => (
            <Link key={t.id} href={href({ status: t.id })} className={cn("rounded-lg px-3 py-2.5 text-[13px] md:py-1.5", status === t.id ? "bg-[var(--d-active)] font-semibold" : "muted hover:bg-[var(--d-hover)]")}>{t.label}</Link>
          ))}
        </div>
        <Link href={href({ mine: mine ? "" : "1" })} className={cn("btn", mine ? "btn-primary" : "btn-ghost")}>Assigned to me</Link>
        <form className="flex w-full flex-wrap gap-2 md:ml-auto md:w-auto" action="/admin/reports">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <select name="category" defaultValue={category} className="input min-w-0 !w-auto flex-1 md:flex-none">
            <option value="">All types</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <input name="q" defaultValue={q} placeholder="WP-…" className="input min-w-0 !w-28 flex-1 font-mono md:!w-36 md:flex-none" />
          <button className="btn btn-ghost">Filter</button>
        </form>
      </div>

      <div className="panel overflow-hidden md:overflow-x-auto">
        {rows.length ? (<>
          {/* Phones get a list of cases; the table needs more width than they have. */}
          <ul className="md:hidden">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/reports/${r.id}`} className="row-hover hairline block border-b p-4 last:border-0">
                  <span className="flex items-center justify-between gap-2"><span className="font-mono text-sm font-semibold">{r.reference_code}</span><Pill tone={statusTone(r.status)}>{statusLabel(r.status)}</Pill></span>
                  <span className="mt-1.5 flex items-center gap-2 text-sm">{r.is_anonymous ? <EyeOff className="faint size-3.5 shrink-0" /> : <UserRound className="faint size-3.5 shrink-0" />}{categoryLabel(r.category)}</span>
                  <span className="muted mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    {r.urgency === "critical" || r.urgency === "high" ? <Pill tone="red">{urgencyLabel(r.urgency).split(" ")[0]}</Pill> : null}
                    {r.county ? <span>{r.county}</span> : null}
                    <span>{r.assignee ?? "Unassigned"}</span>
                    <span>{timeAgo(r.created_at)}</span>
                    {r.files ? <span className="flex items-center gap-1"><Paperclip className="size-3" />{r.files}</span> : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <table className="hidden w-full min-w-[820px] text-sm md:table">
            <thead className="hairline border-b"><tr>{["Reference", "Type", "Status", "Urgency", "County", "Assigned", "Received", ""].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="row-hover hairline border-b last:border-0">
                  <td className="px-4 py-3"><Link href={`/admin/reports/${r.id}`} className="font-mono font-semibold hover:underline">{r.reference_code}</Link></td>
                  <td className="px-4 py-3"><span className="flex items-center gap-2">{r.is_anonymous ? <EyeOff className="faint size-3.5" /> : <UserRound className="faint size-3.5" />}{categoryLabel(r.category)}</span></td>
                  <td className="px-4 py-3"><Pill tone={statusTone(r.status)}>{statusLabel(r.status)}</Pill></td>
                  <td className="px-4 py-3">{r.urgency === "critical" || r.urgency === "high" ? <Pill tone="red">{urgencyLabel(r.urgency).split(" ")[0]}</Pill> : <span className="muted">{urgencyLabel(r.urgency)}</span>}</td>
                  <td className="muted px-4 py-3">{r.county ?? "—"}</td>
                  <td className="muted px-4 py-3">{r.assignee ?? "—"}</td>
                  <td className="muted px-4 py-3" title={formatDate(r.created_at, { dateStyle: "full", timeStyle: "short" } as Intl.DateTimeFormatOptions)}>{timeAgo(r.created_at)}</td>
                  <td className="faint px-4 py-3">{r.files ? <span className="flex items-center gap-1"><Paperclip className="size-3.5" />{r.files}</span> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>) : <Empty icon={Inbox} title="No reports match" body="Try a different filter." />}
      </div>
    </>
  );
}
