"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Loader2, LogOut, Send } from "lucide-react";
import { replyAnonymous, trackReport, type TrackResult } from "@/app/actions/reports";
import { categoryLabel, statusLabel, STATUSES } from "@/lib/report-options";
import { formatDate, cn } from "@/lib/utils";
import { Thread } from "./thread";

const input = "w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-moss-600 focus:ring-4 focus:ring-moss-600/10";

export function TrackReport() {
  const [ref, setRef] = useState("");
  const [key, setKey] = useState("");
  const [data, setData] = useState<Extract<TrackResult, { ok: true }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const open = () => start(async () => {
    setError(null);
    const r = await trackReport(ref, key);
    if (r.ok) setData(r); else setError(r.error);
  });
  const send = () => start(async () => {
    setError(null);
    const r = await replyAnonymous(ref, key, msg);
    if (r.ok) { setData(r); setMsg(""); } else setError(r.error);
  });

  if (!data) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); open(); }} className="grid gap-4 rounded-[28px] bg-sand-100 p-6 md:p-10">
        <div><label className="mb-2 block text-sm font-semibold" htmlFor="ref">Reference</label><input id="ref" value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} placeholder="WP-ABCD-1234" className={cn(input, "font-mono tracking-wider")} autoComplete="off" /></div>
        <div><label className="mb-2 block text-sm font-semibold" htmlFor="key">Private key</label><input id="key" type="password" value={key} onChange={(e) => setKey(e.target.value)} className={cn(input, "font-mono")} autoComplete="off" /></div>
        {error ? <p className="text-sm text-ochre-600" role="alert">{error}</p> : null}
        <button disabled={pending || !ref || !key} className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-forest-900 px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-50">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null} Open my report <ArrowRight className="size-4" />
        </button>
      </form>
    );
  }

  const idx = STATUSES.findIndex((s) => s.id === data.status);
  return (
    <div className="grid gap-6">
      <div className="rounded-[28px] bg-sand-100 p-6 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="kicker text-ink-400">Report {data.reference}</p>
            <h2 className="display mt-3 text-[2.4rem]">{statusLabel(data.status)}</h2>
            <p className="mt-2 text-sm text-ink-500">{categoryLabel(data.category)} · sent {formatDate(data.created_at)}</p>
          </div>
          <button onClick={() => { setData(null); setKey(""); }} className="inline-flex items-center gap-2 rounded-full border border-ink-900/10 px-4 py-2 text-sm"><LogOut className="size-4" /> Close</button>
        </div>
        <ol className="mt-8 grid grid-cols-5 gap-2">
          {STATUSES.map((s, i) => (
            <li key={s.id}>
              <span className={cn("block h-1.5 rounded-full", i <= idx ? "bg-moss-600" : "bg-sand-300")} />
              <span className={cn("mt-2 block text-[11px] md:text-xs", i === idx ? "font-semibold" : "text-ink-400")}>{s.label}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-[28px] bg-sand-100 p-6 md:p-10">
        <p className="kicker mb-6 text-ink-400">Messages with the case team</p>
        <Thread items={data.thread} side="reporter" />
        <div className="mt-8 grid gap-3">
          <textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Write to the case team…" className={input} />
          {error ? <p className="text-sm text-ochre-600">{error}</p> : null}
          <button onClick={send} disabled={pending || msg.trim().length < 2} className="inline-flex w-fit items-center gap-2 rounded-full bg-forest-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send
          </button>
        </div>
      </div>
    </div>
  );
}
