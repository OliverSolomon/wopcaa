"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Copy, EyeOff, FileUp, Loader2, Lock, Paperclip, ShieldCheck, UserRound, X } from "lucide-react";
import { submitReport, type ReportInput, type SubmitResult } from "@/app/actions/reports";
import { CATEGORIES, COUNTIES, RELATIONS, SUPPORT } from "@/lib/report-options";
import { uploadFile } from "@/lib/upload-client";
import { cn } from "@/lib/utils";

type Viewer = { name: string; email: string } | null;
type Attachment = { key: string; name: string; type: string; size: number };

const STEPS = ["How to report", "What happened", "When and where", "Support and safety", "Review"];
const DRAFT_KEY = "wopcaa.report.draft";

const empty: ReportInput = {
  mode: "anonymous", category: "physical", victim: "self", description: "", incident_date: "", incident_ongoing: false, county: "",
  location_detail: "", perpetrator_relation: "", perpetrator_detail: "", support_needed: [], support_other: "", in_danger: false,
  wants_contact: false, contact_method: "", contact_value: "", safe_times: "", consent_share: false, attachments: [],
};

const input = "w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3.5 text-[15px] outline-none transition placeholder:text-ink-400 focus:border-moss-600 focus:ring-4 focus:ring-moss-600/10";
const lbl = "mb-2 block text-[14px] font-semibold text-ink-900";

function Choice({ active, onClick, children, className }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={cn("rounded-2xl border p-4 text-left transition", active ? "border-moss-600 bg-sage-100 ring-4 ring-moss-600/10" : "border-ink-900/10 bg-white hover:border-ink-900/25", className)}>
      {children}
    </button>
  );
}

function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex w-full items-start gap-4 rounded-2xl border border-ink-900/10 bg-white p-4 text-left">
      <span className={cn("relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition", on ? "bg-moss-600" : "bg-sand-300")}>
        <span className={cn("absolute top-1 size-4 rounded-full bg-white transition-transform", on ? "translate-x-5" : "translate-x-1")} />
      </span>
      <span><span className="block text-[15px] font-semibold">{label}</span>{hint ? <span className="mt-0.5 block text-sm text-ink-500">{hint}</span> : null}</span>
    </button>
  );
}

export function ReportForm({ viewer, hotlines }: { viewer: Viewer; hotlines: { label: string; number: string }[] }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<ReportInput>({ ...empty, mode: viewer ? "account" : "anonymous" });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Extract<SubmitResult, { ok: true }> | null>(null);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const set = <K extends keyof ReportInput>(k: K, v: ReportInput[K]) => setD((p) => ({ ...p, [k]: v }));

  // A draft survives an accidental reload in this tab only, and is wiped on submit or quick exit.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) setD((p) => ({ ...p, ...JSON.parse(raw), mode: viewer ? p.mode : "anonymous" }));
    } catch {}
  }, [viewer]);
  useEffect(() => {
    if (result) return;
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...d, attachments: [] })); } catch {}
  }, [d, result]);

  const go = (n: number) => {
    setError(null);
    setStep(n);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const stepError = useMemo(() => {
    if (step === 0 && d.mode === "account" && !viewer) return "Sign in first, or choose to report anonymously.";
    if (step === 1 && d.description.trim().length < 10) return "Please describe what happened in a few words.";
    if (step === 3 && d.wants_contact && (!d.contact_method || !d.contact_value?.trim())) return "Tell us how to reach you, or turn off contact.";
    return null;
  }, [step, d, viewer]);

  const next = () => (stepError ? setError(stepError) : go(step + 1));

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const f of Array.from(files).slice(0, 6 - d.attachments.length)) {
        const { key } = await uploadFile(f, "evidence");
        setD((p) => ({ ...p, attachments: [...p.attachments, { key, name: f.name, type: f.type, size: f.size } as Attachment] }));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    setError(null);
    start(async () => {
      const r = await submitReport(d);
      if (!r.ok) return setError(r.error);
      try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
      setResult(r);
      top.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (result) return <Submitted result={result} />;

  return (
    <div ref={top} className="scroll-mt-28">
      {/* Progress */}
      <ol className="mb-10 grid grid-cols-5 gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button type="button" disabled={i > step} onClick={() => go(i)} className="w-full text-left disabled:cursor-default">
              <span className={cn("block h-1 rounded-full transition-colors", i <= step ? "bg-moss-600" : "bg-sand-300")} />
              <span className={cn("kicker mt-2 hidden text-[10px] md:block", i === step ? "text-ink-900" : "text-ink-400")}>{String(i + 1).padStart(2, "0")} {s}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="rounded-[28px] bg-sand-100 p-5 md:p-10">
        {step === 0 && (
          <div className="grid gap-6">
            <h2 className="display text-[2.2rem] md:text-[2.8rem]">How would you like to report?</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Choice active={d.mode === "anonymous"} onClick={() => set("mode", "anonymous")} className="p-6">
                <EyeOff className="size-6 text-moss-600" />
                <p className="font-display mt-4 text-2xl">Anonymously</p>
                <p className="mt-2 text-[15px] text-ink-500">No name or account. You get a reference and a private key to check progress and talk to us.</p>
              </Choice>
              <Choice active={d.mode === "account"} onClick={() => set("mode", "account")} className="p-6">
                <UserRound className="size-6 text-moss-600" />
                <p className="font-display mt-4 text-2xl">With my account</p>
                <p className="mt-2 text-[15px] text-ink-500">{viewer ? <>Signed in as <strong>{viewer.name}</strong>. Follow every report from your dashboard.</> : "Follow your reports and messages from a private dashboard."}</p>
              </Choice>
            </div>
            {d.mode === "account" && !viewer ? (
              <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-5">
                <p className="flex-1 text-[15px] text-ink-500">Sign in or create an account first. You will come straight back here.</p>
                <Link href="/sign-in?next=/report" className="rounded-full bg-forest-900 px-5 py-2.5 text-sm font-semibold text-white">Sign in</Link>
                <Link href="/sign-up?next=/report" className="rounded-full border border-ink-900/15 px-5 py-2.5 text-sm font-semibold">Create account</Link>
              </div>
            ) : null}
            <p className="flex items-start gap-3 text-sm text-ink-500"><Lock className="mt-0.5 size-4 shrink-0" /> What you write is encrypted before it is stored. Only the WOPCAA case team can read it.</p>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-8">
            <h2 className="display text-[2.2rem] md:text-[2.8rem]">What happened?</h2>
            <div>
              <span className={lbl}>Choose what fits best</span>
              <div className="grid gap-3 sm:grid-cols-2">
                {CATEGORIES.map((c) => (
                  <Choice key={c.id} active={d.category === c.id} onClick={() => set("category", c.id)}>
                    <span className="block text-[15px] font-semibold">{c.label}</span>
                    <span className="mt-1 block text-[13px] text-ink-500">{c.hint}</span>
                  </Choice>
                ))}
              </div>
            </div>
            <div>
              <span className={lbl}>Who did this happen to?</span>
              <div className="flex gap-3">
                <Choice active={d.victim === "self"} onClick={() => set("victim", "self")} className="flex-1 text-center">Me</Choice>
                <Choice active={d.victim === "someone_else"} onClick={() => set("victim", "someone_else")} className="flex-1 text-center">Someone else</Choice>
              </div>
            </div>
            <div>
              <label htmlFor="desc" className={lbl}>Tell us in your own words</label>
              <textarea id="desc" rows={8} value={d.description} onChange={(e) => set("description", e.target.value)} className={input} placeholder="Share as much or as little as you are comfortable with. You can write in English or Kiswahili." />
              <p className="mt-2 text-right text-xs text-ink-400">{d.description.length} / 8000</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6">
            <h2 className="display text-[2.2rem] md:text-[2.8rem]">When and where?</h2>
            <p className="-mt-2 text-ink-500">All of this is optional. Skip anything you prefer not to share.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className={lbl} htmlFor="date">Date (or roughly)</label><input id="date" type="date" value={d.incident_date} onChange={(e) => set("incident_date", e.target.value)} className={input} /></div>
              <div><label className={lbl} htmlFor="county">County</label>
                <select id="county" value={d.county} onChange={(e) => set("county", e.target.value)} className={input}>
                  <option value="">Prefer not to say</option>
                  {COUNTIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <Toggle on={d.incident_ongoing} onChange={(v) => set("incident_ongoing", v)} label="This is still happening" hint="We will treat the report as a priority." />
            <div><label className={lbl} htmlFor="loc">Place (village, area, landmark)</label><input id="loc" value={d.location_detail} onChange={(e) => set("location_detail", e.target.value)} className={input} placeholder="Only if it is safe to share" /></div>
            <div>
              <label className={lbl} htmlFor="rel">Who was responsible?</label>
              <select id="rel" value={d.perpetrator_relation} onChange={(e) => set("perpetrator_relation", e.target.value as ReportInput["perpetrator_relation"])} className={input}>
                <option value="">Prefer not to say</option>
                {RELATIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
            <div><label className={lbl} htmlFor="perp">Anything else about them</label><textarea id="perp" rows={3} value={d.perpetrator_detail} onChange={(e) => set("perpetrator_detail", e.target.value)} className={input} placeholder="Optional" /></div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-6">
            <h2 className="display text-[2.2rem] md:text-[2.8rem]">How can we support you?</h2>
            <Toggle on={d.in_danger} onChange={(v) => set("in_danger", v)} label="I am in danger right now" hint="Your report goes to the top of the queue." />
            {d.in_danger && hotlines.length ? (
              <div className="rounded-2xl border border-ochre-500/30 bg-ochre-500/10 p-5">
                <p className="flex items-center gap-2 font-semibold text-ochre-600"><AlertTriangle className="size-4" /> Please also call for help now</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {hotlines.map((h) => <a key={h.number} href={`tel:${h.number.replace(/\s/g, "")}`} className="rounded-full bg-white px-4 py-2 text-sm"><strong>{h.number}</strong> · {h.label}</a>)}
                </div>
              </div>
            ) : null}
            <div>
              <span className={lbl}>What support would help? (choose any)</span>
              <div className="flex flex-wrap gap-2">
                {SUPPORT.map((s) => {
                  const on = d.support_needed.includes(s.id);
                  return (
                    <button type="button" key={s.id} onClick={() => setD((p) => ({ ...p, support_needed: p.support_needed.includes(s.id) ? p.support_needed.filter((x) => x !== s.id) : [...p.support_needed, s.id] }))}
                      className={cn("inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition", on ? "border-moss-600 bg-moss-600 text-white" : "border-ink-900/10 bg-white hover:border-ink-900/30")}>
                      {on ? <Check className="size-3.5" /> : null}{s.label}
                    </button>
                  );
                })}
              </div>
              <input value={d.support_other} onChange={(e) => set("support_other", e.target.value)} className={cn(input, "mt-3")} placeholder="Something else (optional)" />
            </div>
            <Toggle on={d.wants_contact} onChange={(v) => set("wants_contact", v)} label="I'd like the case team to contact me" hint="Only if it is safe. We will never share your details." />
            {d.wants_contact ? (
              <div className="grid gap-4 rounded-2xl bg-white p-5 md:grid-cols-2">
                <div>
                  <span className={lbl}>How?</span>
                  <div className="flex flex-wrap gap-2">
                    {(["phone", "sms", "whatsapp", "email"] as const).map((m) => (
                      <button type="button" key={m} onClick={() => set("contact_method", m)} className={cn("rounded-full border px-4 py-2 text-sm capitalize", d.contact_method === m ? "border-moss-600 bg-sage-100 font-semibold" : "border-ink-900/10")}>{m === "sms" ? "SMS" : m === "whatsapp" ? "WhatsApp" : m}</button>
                    ))}
                  </div>
                </div>
                <div><label className={lbl} htmlFor="cv">{d.contact_method === "email" ? "Email" : "Number"}</label><input id="cv" value={d.contact_value} onChange={(e) => set("contact_value", e.target.value)} className={input} inputMode={d.contact_method === "email" ? "email" : "tel"} /></div>
                <div className="md:col-span-2"><label className={lbl} htmlFor="st">When is it safe to reach you?</label><input id="st" value={d.safe_times} onChange={(e) => set("safe_times", e.target.value)} className={input} placeholder="e.g. weekdays after 2pm. Say if we should not leave messages." /></div>
              </div>
            ) : null}
            <div>
              <span className={lbl}>Evidence (optional)</span>
              <label className={cn("flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-900/15 bg-white p-8 text-center transition hover:border-moss-600", uploading && "pointer-events-none opacity-60")}>
                {uploading ? <Loader2 className="size-6 animate-spin text-moss-600" /> : <FileUp className="size-6 text-moss-600" />}
                <span className="text-[15px] font-semibold">Add photos, screenshots, documents or voice notes</span>
                <span className="text-xs text-ink-400">Up to 6 files, 20 MB each. Stored privately.</span>
                <input type="file" multiple className="sr-only" accept="image/*,application/pdf,audio/*,video/*" onChange={(e) => addFiles(e.target.files)} />
              </label>
              {d.attachments.length ? (
                <ul className="mt-3 grid gap-2">
                  {d.attachments.map((a) => (
                    <li key={a.key} className="flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 text-sm">
                      <Paperclip className="size-4 text-ink-400" /><span className="flex-1 truncate">{a.name}</span>
                      <button type="button" onClick={() => set("attachments", d.attachments.filter((x) => x.key !== a.key))} aria-label="Remove"><X className="size-4" /></button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-6">
            <h2 className="display text-[2.2rem] md:text-[2.8rem]">Check and send</h2>
            <dl className="grid gap-px overflow-hidden rounded-2xl bg-ink-900/10 text-[15px]">
              {[
                ["Reporting", d.mode === "anonymous" ? "Anonymously" : `As ${viewer?.name}`],
                ["What happened", CATEGORIES.find((c) => c.id === d.category)?.label],
                ["About", d.victim === "self" ? "Me" : "Someone else"],
                ["Description", d.description],
                ["County", d.county || "—"],
                ["Still happening", d.incident_ongoing ? "Yes" : "No"],
                ["In danger now", d.in_danger ? "Yes" : "No"],
                ["Support", d.support_needed.map((s) => SUPPORT.find((x) => x.id === s)?.label).join(", ") || "—"],
                ["Contact me", d.wants_contact ? `${d.contact_method} · ${d.contact_value}` : "No"],
                ["Files", d.attachments.length ? `${d.attachments.length} attached` : "None"],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-1 bg-white px-5 py-3.5 md:grid-cols-[180px_1fr]">
                  <dt className="text-ink-400">{k}</dt><dd className="whitespace-pre-wrap break-words">{v}</dd>
                </div>
              ))}
            </dl>
            <Toggle on={d.consent_share} onChange={(v) => set("consent_share", v)} label="WOPCAA may share my report with a trusted partner to get me help" hint="Such as a legal aid clinic or a shelter. We will ask you before sharing names." />
          </div>
        )}

        {error ? <p className="mt-6 flex items-center gap-2 rounded-2xl bg-ochre-500/10 px-4 py-3 text-sm text-ochre-600" role="alert"><AlertTriangle className="size-4 shrink-0" /> {error}</p> : null}

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-ink-900/10 pt-6">
          {step > 0 ? <button type="button" onClick={() => go(step - 1)} className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold hover:bg-white"><ArrowLeft className="size-4" /> Back</button> : <span />}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-forest-800">Continue <ArrowRight className="size-4" /></button>
          ) : (
            <button type="button" onClick={submit} disabled={pending || uploading} className="inline-flex items-center gap-2 rounded-full bg-ochre-500 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-ochre-600 disabled:opacity-60">
              {pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />} Send report securely
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4">
      <div><p className="kicker text-ink-400">{label}</p><p className="mt-1 font-mono text-2xl tracking-wider">{value}</p></div>
      <button type="button" onClick={() => { navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1600); }} className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/10 px-4 py-2 text-sm">
        {done ? <Check className="size-4 text-moss-600" /> : <Copy className="size-4" />} {done ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function Submitted({ result }: { result: Extract<SubmitResult, { ok: true }> }) {
  return (
    <div className="rounded-[28px] bg-sand-100 p-6 md:p-12">
      <span className="grid size-14 place-items-center rounded-full bg-moss-600 text-white"><Check className="size-7" /></span>
      <h2 className="display mt-8 text-[2.6rem] md:text-[3.6rem]">Your report is safe with us.</h2>
      <p className="mt-4 max-w-xl text-lg text-ink-500">The case team has been alerted and will review it. Thank you for trusting us.</p>
      {result.mode === "anonymous" ? (
        <>
          <div className="mt-10 grid gap-3">
            <CopyRow label="Reference" value={result.reference} />
            <CopyRow label="Private key" value={result.accessKey!} />
          </div>
          <p className="mt-5 flex items-start gap-3 rounded-2xl bg-ochre-500/10 p-4 text-sm text-ochre-600">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            Write these down somewhere safe. They are the only way to see updates and reply to the case team, and we cannot show the key again.
          </p>
          <Link href="/track" className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest-900 px-6 py-3.5 text-sm font-semibold text-white">Track this report <ArrowRight className="size-4" /></Link>
        </>
      ) : (
        <>
          <div className="mt-10"><CopyRow label="Reference" value={result.reference} /></div>
          <Link href={`/account/reports/${result.id}`} className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest-900 px-6 py-3.5 text-sm font-semibold text-white">Open in my dashboard <ArrowRight className="size-4" /></Link>
        </>
      )}
    </div>
  );
}
