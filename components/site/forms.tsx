"use client";

import { useActionState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { applyMembership, sendContact, subscribe, type FormState } from "@/app/actions/public";
import { COUNTIES } from "@/lib/report-options";

const field = "w-full rounded-2xl border border-forest/10 bg-white/70 px-4 py-3.5 text-[15px] outline-none transition placeholder:text-slate-soft focus:border-green focus:bg-white focus:ring-4 focus:ring-green/10";

function Status({ state }: { state: FormState }) {
  if (state.error) return <p className="text-sm text-coral-ink" role="alert">{state.error}</p>;
  if (state.ok) return <p className="flex items-center gap-2 text-sm text-green" role="status"><Check className="size-4" /> {state.message}</p>;
  return null;
}

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, {});
  return (
    <form action={action} className="mt-8 max-w-md">
      <div className="flex items-center rounded-full border border-white/15 bg-white/5 p-1.5 focus-within:border-white/40">
        <input name="email" type="email" required placeholder="Your email address" className="min-w-0 flex-1 bg-transparent px-4 text-[15px] text-white outline-none placeholder:text-white/40" />
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-mist px-5 py-2.5 text-sm font-semibold text-forest transition hover:bg-white disabled:opacity-60">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <>Subscribe <ArrowRight className="size-4" /></>}
        </button>
      </div>
      <div className="mt-3 [&_p]:text-line"><Status state={state} /></div>
    </form>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, {});
  if (state.ok) return <div className="rounded-3xl bg-leaf-soft p-8"><Status state={state} /></div>;
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Your name" className={field} />
        <input name="email" type="email" required placeholder="Email" className={field} />
      </div>
      <input name="phone" placeholder="Phone (optional)" className={field} />
      <textarea name="message" required rows={6} placeholder="How can we help?" className={field} />
      <Status state={state} />
      <button disabled={pending} className="inline-flex w-fit items-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-mist transition hover:bg-forest-soft disabled:opacity-60">
        {pending ? <Loader2 className="size-4 animate-spin" /> : null} Send message <ArrowRight className="size-4" />
      </button>
    </form>
  );
}

export function MembershipForm() {
  const [state, action, pending] = useActionState(applyMembership, {});
  if (state.ok) return <div className="rounded-3xl bg-leaf-soft p-8"><Status state={state} /></div>;
  return (
    <form action={action} className="grid gap-4">
      <div className="flex gap-2">
        {[["individual", "Individual"], ["organisation", "Organisation"]].map(([v, l], i) => (
          <label key={v} className="flex-1 cursor-pointer">
            <input type="radio" name="type" value={v} defaultChecked={i === 0} className="peer sr-only" />
            <span className="block rounded-2xl border border-forest/10 bg-white/70 px-4 py-3.5 text-center text-[15px] transition peer-checked:border-green peer-checked:bg-leaf-soft peer-checked:font-semibold">{l}</span>
          </label>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Full name or organisation" className={field} />
        <input name="email" type="email" required placeholder="Email" className={field} />
        <input name="phone" placeholder="Phone" className={field} />
        <select name="county" className={field} defaultValue="">
          <option value="">County</option>
          {COUNTIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <textarea name="message" rows={4} placeholder="Tell us about your work and why you'd like to join" className={field} />
      <Status state={state} />
      <button disabled={pending} className="inline-flex w-fit items-center gap-2 rounded-full bg-coral px-6 py-3.5 text-sm font-semibold text-forest transition hover:bg-coral-hover disabled:opacity-60">
        {pending ? <Loader2 className="size-4 animate-spin" /> : null} Submit application <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
