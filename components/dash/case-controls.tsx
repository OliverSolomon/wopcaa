"use client";

import { useState, useTransition } from "react";
import { Loader2, Send, StickyNote } from "lucide-react";
import { postUpdate, updateReport } from "@/app/actions/admin";
import { STATUSES, URGENCY } from "@/lib/report-options";
import { cn } from "@/lib/utils";

export function CaseControls({ id, status, urgency, assigned, team }: { id: string; status: string; urgency: string; assigned: string | null; team: { id: string; name: string }[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const change = (patch: Parameters<typeof updateReport>[1]) =>
    start(async () => {
      setError(null);
      const r = await updateReport(id, patch);
      if (!r.ok) setError(r.error ?? "Could not save.");
    });

  return (
    <section className="panel space-y-4 p-5">
      <div className="flex items-center justify-between"><p className="font-semibold">Case</p>{pending ? <Loader2 className="faint size-4 animate-spin" /> : null}</div>
      <div>
        <span className="label">Status</span>
        <div className="grid gap-1">
          {STATUSES.map((s) => (
            <button key={s.id} disabled={pending} onClick={() => change({ status: s.id })}
              className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition", status === s.id ? "bg-[var(--d-active)] font-semibold" : "hover:bg-[var(--d-hover)]")}>
              <span className={cn("pill !p-0 !bg-transparent", `tone-${s.tone}`)} />{s.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="urg">Urgency</label>
        <select id="urg" className="input" value={urgency} disabled={pending} onChange={(e) => change({ urgency: e.target.value as "low" })}>
          {URGENCY.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="asg">Assigned to</label>
        <select id="asg" className="input" value={assigned ?? ""} disabled={pending} onChange={(e) => change({ assigned_to: e.target.value || null })}>
          <option value="">Nobody yet</option>
          {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      {error ? <p className="text-xs text-[var(--d-ochre)]">{error}</p> : null}
    </section>
  );
}

export function CaseReply({ id, canMessage, anonymous }: { id: string; canMessage: boolean; anonymous: boolean }) {
  const [text, setText] = useState("");
  const [internal, setInternal] = useState(!canMessage);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const send = () =>
    start(async () => {
      setError(null);
      const r = await postUpdate(id, text, internal);
      if (r.ok) setText(""); else setError(r.error ?? "Could not send.");
    });
  return (
    <div className="hairline mt-6 border-t pt-5">
      <div className="mb-3 flex gap-1 rounded-lg bg-[var(--d-hover)] p-1 text-[13px]">
        <button disabled={!canMessage} onClick={() => setInternal(false)} className={cn("flex-1 rounded-md px-3 py-1.5 disabled:opacity-40", !internal && "bg-[var(--d-panel)] font-semibold shadow-sm")}>
          <Send className="mr-1.5 inline size-3.5" />Message reporter
        </button>
        <button onClick={() => setInternal(true)} className={cn("flex-1 rounded-md px-3 py-1.5", internal && "bg-[var(--d-panel)] font-semibold shadow-sm")}>
          <StickyNote className="mr-1.5 inline size-3.5" />Internal note
        </button>
      </div>
      <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} className="input" placeholder={internal ? "Only the case team sees notes." : anonymous ? "The reporter sees this when they open their report with their key." : "The reporter is notified in their dashboard."} />
      {error ? <p className="mt-2 text-xs text-[var(--d-ochre)]">{error}</p> : null}
      <div className="mt-3 flex justify-end">
        <button onClick={send} disabled={pending || text.trim().length < 2} className="btn btn-primary">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}{internal ? "Add note" : "Send message"}
        </button>
      </div>
    </div>
  );
}
