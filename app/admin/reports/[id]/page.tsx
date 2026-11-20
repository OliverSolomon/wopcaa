import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, EyeOff, Lock, Paperclip, Phone, UserRound } from "lucide-react";
import { audit, requireCaseTeam } from "@/lib/session";
import { query, one } from "@/lib/db";
import { getThread, reportById } from "@/lib/reports";
import { categoryLabel, relationLabel, statusLabel, statusTone, supportLabel } from "@/lib/report-options";
import { formatDate } from "@/lib/utils";
import { PageTitle, Pill } from "@/components/dash/ui";
import { Thread } from "@/components/report/thread";
import { CaseControls, CaseReply } from "@/components/dash/case-controls";

export const metadata = { title: "Report" };

type R = Record<string, unknown> & { id: string };
const str = (v: unknown) => (v == null || v === "" ? null : String(v));

export default async function ReportDetail({ params }: PageProps<"/admin/reports/[id]">) {
  const v = await requireCaseTeam();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const r = (await reportById(id)) as R | null;
  if (!r) notFound();
  await audit(v.id, "report.view", id);

  const [thread, files, team, reporter] = await Promise.all([
    getThread(id, true),
    query<{ id: string; file_name: string; mime_type: string; size_bytes: number }>("select id, file_name, mime_type, size_bytes from report_attachments where report_id = $1 order by created_at", [id]),
    query<{ id: string; name: string }>(`select p.user_id id, coalesce(p.full_name, u.name, u.email) name from profiles p join neon_auth."user" u on u.id = p.user_id where p.role in ('admin','super_admin') order by name`),
    r.reporter_user_id ? one<{ name: string; email: string }>(`select coalesce(p.full_name, u.name) name, u.email from neon_auth."user" u left join profiles p on p.user_id = u.id where u.id = $1`, [r.reporter_user_id]) : null,
  ]);

  const facts: [string, string | null][] = [
    ["Type", categoryLabel(str(r.category))],
    ["About", r.victim === "self" ? "The reporter" : "Someone else"],
    ["Date", r.incident_date ? formatDate(String(r.incident_date)) : null],
    ["Still happening", r.incident_ongoing ? "Yes" : "No"],
    ["County", str(r.county)],
    ["Place", str(r.location_detail)],
    ["Responsible", r.perpetrator_relation ? relationLabel(String(r.perpetrator_relation)) : null],
    ["About them", str(r.perpetrator_detail)],
    ["Support wanted", ((r.support_needed as string[]) ?? []).map(supportLabel).join(", ") || null],
    ["Other support", str(r.support_other)],
    ["May share with partners", r.consent_share ? "Yes" : "No"],
  ];

  return (
    <>
      <Link href="/admin/reports" className="muted mb-4 inline-flex items-center gap-1.5 text-sm hover:underline"><ArrowLeft className="size-4" /> Reports</Link>
      <PageTitle
        title={String(r.reference_code)}
        sub={`Received ${formatDate(String(r.created_at), { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" })}`}
        actions={<Pill tone={statusTone(String(r.status))}>{statusLabel(String(r.status))}</Pill>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="panel p-6">
            <p className="faint mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"><Lock className="size-3.5" /> What happened</p>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{str(r.description)}</p>
          </section>
          <section className="panel p-6">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {facts.filter(([, val]) => val).map(([k, val]) => (
                <div key={k}><dt className="faint text-xs">{k}</dt><dd className="mt-0.5 whitespace-pre-wrap text-sm">{val}</dd></div>
              ))}
            </dl>
          </section>
          {files.length ? (
            <section className="panel p-6">
              <p className="mb-3 font-semibold">Evidence</p>
              <ul className="grid gap-2">
                {files.map((f) => (
                  <li key={f.id} className="hairline flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm">
                    <Paperclip className="faint size-4" /><span className="flex-1 truncate">{f.file_name}</span>
                    <span className="faint text-xs">{(f.size_bytes / 1024 / 1024).toFixed(1)} MB</span>
                    <a href={`/api/evidence/${f.id}`} className="btn btn-ghost !py-1"><Download className="size-3.5" /> Download</a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="panel p-6">
            <p className="mb-5 font-semibold">Conversation and history</p>
            <Thread items={thread} side="admin" dash />
            <CaseReply id={id} canMessage={!r.is_anonymous || !!r.access_key_hash} anonymous={!!r.is_anonymous} />
          </section>
        </div>

        <aside className="space-y-4">
          <CaseControls id={id} status={String(r.status)} urgency={String(r.urgency)} assigned={str(r.assigned_to)} team={team} />
          <section className="panel p-5">
            <p className="mb-3 font-semibold">Reporter</p>
            {r.is_anonymous ? (
              <p className="flex items-center gap-2 text-sm"><EyeOff className="faint size-4" /> Anonymous · follows up with a private key</p>
            ) : (
              <p className="flex items-center gap-2 text-sm"><UserRound className="faint size-4" /> {reporter?.name} <span className="faint">{reporter?.email}</span></p>
            )}
            {r.wants_contact ? (
              <div className="mt-4 rounded-xl bg-[var(--d-accent-soft)] p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold"><Phone className="size-4" /> Wants contact by {String(r.contact_method)}</p>
                <p className="mt-1 font-mono">{str(r.contact_value)}</p>
                {r.safe_times ? <p className="muted mt-2 text-xs">Safe times: {String(r.safe_times)}</p> : null}
              </div>
            ) : <p className="faint mt-3 text-xs">Did not ask to be contacted.</p>}
          </section>
        </aside>
      </div>
    </>
  );
}
