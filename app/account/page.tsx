import Link from "next/link";
import { ArrowUpRight, FilePlus2, Inbox, Lock, MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/session";
import { query } from "@/lib/db";
import { STATUSES, categoryLabel, statusLabel, statusTone } from "@/lib/report-options";
import { formatDate, timeAgo, cn } from "@/lib/utils";
import { PageTitle, Pill, Empty } from "@/components/dash/ui";

export const metadata = { title: "My reports" };

export default async function MyReports() {
  const v = await requireUser("/account");
  const rows = await query<{ id: string; reference_code: string; category: string; status: string; created_at: string; updated_at: string; replies: number }>(
    `select r.id, r.reference_code, r.category, r.status, r.created_at, r.updated_at,
       (select count(*)::int from report_updates u where u.report_id = r.id and u.author_kind = 'admin' and u.kind = 'message') replies
     from reports r where r.reporter_user_id = $1 order by r.updated_at desc`,
    [v.id],
  );
  return (
    <>
      <PageTitle title={`Hello, ${v.name.split(" ")[0]}.`} sub="Your reports, and every message from the case team, in one private place." actions={
        <Link href="/report" className="btn btn-primary"><FilePlus2 className="size-4" /> New report</Link>
      } />
      <div className="mb-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
        <div className="panel p-5"><p className="muted text-[13px]">Reports</p><p className="mt-2 font-semibold text-[2.2rem] leading-none">{rows.length}</p></div>
        <div className="panel p-5"><p className="muted text-[13px]">Open</p><p className="mt-2 font-semibold text-[2.2rem] leading-none">{rows.filter((r) => !["resolved", "closed"].includes(r.status)).length}</p></div>
        <div className="panel col-span-2 flex items-start gap-3 p-5 lg:col-span-1"><Lock className="mt-0.5 size-4 text-[var(--d-accent)]" /><p className="muted text-[13px]">Everything you write is encrypted. Only the WOPCAA case team can read it.</p></div>
      </div>
      <div className="panel">
        {rows.length ? (
          <ul>
            {rows.map((r) => {
              const idx = STATUSES.findIndex((s) => s.id === r.status);
              return (
                <li key={r.id}>
                  <Link href={`/account/reports/${r.id}`} className="row-hover hairline grid gap-3 border-b p-5 last:border-0 md:grid-cols-[1fr_220px_auto] md:items-center">
                    <div>
                      <p className="flex items-center gap-3"><span className="font-mono text-sm font-semibold">{r.reference_code}</span><Pill tone={statusTone(r.status)}>{statusLabel(r.status)}</Pill></p>
                      <p className="mt-1 text-sm">{categoryLabel(r.category)} <span className="faint">· sent {formatDate(r.created_at)}</span></p>
                    </div>
                    <div className="flex gap-1">{STATUSES.map((s, i) => <span key={s.id} className={cn("h-1.5 flex-1 rounded-full", i <= idx ? "bg-[var(--d-accent)]" : "bg-[var(--d-hover)]")} />)}</div>
                    <span className="faint flex items-center gap-3 text-xs">
                      {r.replies ? <span className="flex items-center gap-1"><MessageCircle className="size-3.5" />{r.replies}</span> : null}
                      updated {timeAgo(r.updated_at)} <ArrowUpRight className="size-4" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : <Empty icon={Inbox} title="No reports yet" body="When you report with your account, it appears here so you can follow its progress and talk to the case team." />}
      </div>
    </>
  );
}
