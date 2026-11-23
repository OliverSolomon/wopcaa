import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Inbox, MessagesSquare, ShieldCheck, Timer } from "lucide-react";
import { requireCaseTeam } from "@/lib/session";
import { one, query } from "@/lib/db";
import { categoryLabel, statusLabel, statusTone, urgencyLabel } from "@/lib/report-options";
import { formatDate, timeAgo } from "@/lib/utils";
import { PageTitle, Pill, Empty } from "@/components/dash/ui";
import { RankBars, WeeklyBars } from "@/components/dash/charts";

export const metadata = { title: "Overview" };

export default async function AdminHome() {
  const v = await requireCaseTeam();
  const [totals, weekly, cats, recent, enquiries] = await Promise.all([
    one<{ total: number; open: number; fresh: number; critical: number; resolved30: number; median_hours: number | null }>(`
      select count(*)::int total,
        count(*) filter (where status not in ('resolved','closed'))::int open,
        count(*) filter (where status = 'new')::int fresh,
        count(*) filter (where urgency = 'critical' and status not in ('resolved','closed'))::int critical,
        count(*) filter (where resolved_at > now() - interval '30 days')::int resolved30,
        (select round(extract(epoch from percentile_cont(0.5) within group (order by first_reply - created_at)) / 3600)::int from (
          select r.created_at, min(u.created_at) first_reply from reports r join report_updates u on u.report_id = r.id and u.author_kind = 'admin' and u.kind = 'message' group by r.id
        ) x) median_hours
      from reports`),
    query<{ week: string; n: number }>(`
      select to_char(w, 'DD Mon') as week, coalesce(count(r.id), 0)::int as n
      from generate_series(date_trunc('week', now()) - interval '11 weeks', date_trunc('week', now()), interval '1 week') w
      left join reports r on date_trunc('week', r.created_at) = w
      group by w order by w`),
    query<{ category: string; n: number }>("select category, count(*)::int n from reports group by category order by n desc limit 8"),
    query<{ id: string; reference_code: string; category: string; status: string; urgency: string; county: string | null; created_at: string; is_anonymous: boolean }>(
      "select id, reference_code, category, status, urgency, county, created_at, is_anonymous from reports order by (urgency = 'critical' and status not in ('resolved','closed')) desc, created_at desc limit 8"),
    one<{ n: number }>("select count(*)::int n from enquiries where handled_at is null and kind <> 'newsletter'"),
  ]);

  const tiles = [
    { label: "Open reports", value: totals?.open ?? 0, icon: Inbox, hint: `${totals?.total ?? 0} all time` },
    { label: "Awaiting review", value: totals?.fresh ?? 0, icon: Timer, hint: "Status: received" },
    { label: "Critical, open", value: totals?.critical ?? 0, icon: AlertTriangle, hint: "In danger now", warn: (totals?.critical ?? 0) > 0 },
    { label: "Resolved, 30 days", value: totals?.resolved30 ?? 0, icon: ShieldCheck, hint: totals?.median_hours != null ? `Median first reply ${totals.median_hours} h` : "No replies yet" },
  ];

  return (
    <>
      <PageTitle title={`Good to see you, ${v.name.split(" ")[0]}.`} sub="Here is where the case desk stands today." actions={
        <Link href="/admin/reports?status=new" className="btn btn-primary">Review new reports <ArrowUpRight className="size-4" /></Link>
      } />

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="panel min-w-0 p-4 md:p-5">
            <div className="flex items-center justify-between">
              <p className="muted text-[13px] font-medium">{t.label}</p>
              <t.icon className={t.warn ? "size-4 text-[var(--d-ochre)]" : "faint size-4"} />
            </div>
            <p className="mt-3 font-semibold text-[2.4rem] leading-none tabular-nums">{t.value}</p>
            <p className="faint mt-2 text-xs">{t.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="panel p-5 lg:col-span-2">
          <div className="mb-6 flex items-baseline justify-between"><h2 className="font-semibold">Reports per week</h2><p className="faint text-xs">Last 12 weeks</p></div>
          <WeeklyBars data={weekly.map((w) => ({ label: w.week, value: w.n }))} />
        </section>
        <section className="panel p-5">
          <h2 className="mb-6 font-semibold">By type</h2>
          {cats.length ? <RankBars data={cats.map((c) => ({ label: categoryLabel(c.category), value: c.n }))} /> : <p className="muted text-sm">No reports yet.</p>}
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="panel overflow-hidden lg:col-span-2">
          <div className="hairline flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold">Needs attention</h2>
            <Link href="/admin/reports" className="text-xs font-semibold text-[var(--d-accent)]">All reports →</Link>
          </div>
          {recent.length ? (
            <ul>
              {recent.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/reports/${r.id}`} className="row-hover hairline flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-5 py-3.5 last:border-0">
                    <span className="font-mono text-[13px]">{r.reference_code}</span>
                    <span className="min-w-0 flex-1 truncate text-sm">{categoryLabel(r.category)}{r.county ? <span className="faint"> · {r.county}</span> : null}</span>
                    {r.urgency === "critical" || r.urgency === "high" ? <Pill tone="red">{urgencyLabel(r.urgency).split(" ")[0]}</Pill> : null}
                    <Pill tone={statusTone(r.status)}>{statusLabel(r.status)}</Pill>
                    <span className="faint w-16 text-right text-xs">{timeAgo(r.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <Empty icon={Inbox} title="No reports yet" body="New reports appear here, and every admin gets a notification." />}
        </section>
        <section className="panel p-5">
          <h2 className="font-semibold">Inbox</h2>
          <Link href="/admin/enquiries" className="row-hover mt-4 flex items-center gap-4 rounded-xl p-3">
            <span className="grid size-10 place-items-center rounded-full bg-[var(--d-accent-soft)]"><MessagesSquare className="size-4 text-[var(--d-accent)]" /></span>
            <span className="flex-1"><span className="block text-sm font-semibold">{enquiries?.n ?? 0} open enquiries</span><span className="faint text-xs">Contact and membership</span></span>
            <ArrowUpRight className="faint size-4" />
          </Link>
          <p className="faint mt-6 text-xs">Updated {formatDate(new Date(), { hour: "numeric", minute: "2-digit" })}</p>
        </section>
      </div>
    </>
  );
}
