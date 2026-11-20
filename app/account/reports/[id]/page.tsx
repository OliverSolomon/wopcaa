import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { one } from "@/lib/db";
import { getThread, openReport } from "@/lib/reports";
import { STATUSES, categoryLabel, statusLabel, statusTone } from "@/lib/report-options";
import { formatDate, cn } from "@/lib/utils";
import { PageTitle, Pill } from "@/components/dash/ui";
import { Thread } from "@/components/report/thread";
import { ReporterReply } from "@/components/dash/reporter-reply";

export const metadata = { title: "Report" };

export default async function MyReport({ params }: PageProps<"/account/reports/[id]">) {
  const v = await requireUser("/account");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const row = await one<{ id: string; reference_code: string; category: string; status: string; created_at: string; description: string; county: string | null }>(
    "select id, reference_code, category, status, created_at, description, county from reports where id = $1 and reporter_user_id = $2",
    [id, v.id],
  );
  if (!row) notFound();
  const r = openReport(row);
  const thread = await getThread(id, false);
  const idx = STATUSES.findIndex((s) => s.id === r.status);
  return (
    <>
      <Link href="/account" className="muted mb-4 inline-flex items-center gap-1.5 text-sm hover:underline"><ArrowLeft className="size-4" /> My reports</Link>
      <PageTitle title={r.reference_code} sub={`${categoryLabel(r.category)} · sent ${formatDate(r.created_at, { day: "numeric", month: "long", year: "numeric" })}`} actions={<Pill tone={statusTone(r.status)}>{statusLabel(r.status)}</Pill>} />
      <div className="panel mb-4 p-5">
        <ol className="grid grid-cols-5 gap-2">
          {STATUSES.map((s, i) => (
            <li key={s.id}><span className={cn("block h-1.5 rounded-full", i <= idx ? "bg-[var(--d-accent)]" : "bg-[var(--d-hover)]")} /><span className={cn("mt-2 block text-xs", i === idx ? "font-semibold" : "faint")}>{s.label}</span></li>
          ))}
        </ol>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="panel p-6 lg:col-span-2">
          <p className="mb-5 font-semibold">Messages with the case team</p>
          <Thread items={thread} side="reporter" dash />
          <ReporterReply id={id} />
        </section>
        <section className="panel p-6">
          <p className="faint text-xs">What you told us</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{r.description}</p>
          {r.county ? <p className="faint mt-4 text-xs">County: {r.county}</p> : null}
        </section>
      </div>
    </>
  );
}
