"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { safeNext } from "@/lib/utils";

const input = "w-full rounded-2xl border border-forest/10 bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-green focus:ring-4 focus:ring-green/10";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const params = useSearchParams();
  const next = safeNext(params.get("next"), "/go");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = mode === "sign-in"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: name || email.split("@")[0] });
      if (res.error) {
        setError(res.error.message ?? "Something went wrong. Please try again.");
        setPending(false);
        return;
      }
      // A full navigation so server components read the new session cookie.
      window.location.assign(next);
    } catch {
      setError("We could not reach the sign-in service. Check your connection and try again.");
      setPending(false);
    }
  }

  async function google() {
    setError(null);
    await authClient.signIn.social({ provider: "google", callbackURL: `${window.location.origin}${next}` });
  }

  return (
    <form onSubmit={submit} className="grid gap-4" autoComplete="off">
      {mode === "sign-up" ? (
        <div><label className="mb-2 block text-sm font-semibold" htmlFor="name">Name <span className="font-normal text-slate-soft">(a nickname is fine)</span></label><input id="name" value={name} onChange={(e) => setName(e.target.value)} className={input} autoComplete="nickname" /></div>
      ) : null}
      <div><label className="mb-2 block text-sm font-semibold" htmlFor="email">Email</label><input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} autoComplete="off" autoCapitalize="none" spellCheck={false} inputMode="email" /></div>
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="pw">Password</label>
        <div className="relative">
          <input id="pw" type={show ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={input} autoComplete={mode === "sign-in" ? "off" : "new-password"} />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-soft hover:text-forest" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {mode === "sign-up" ? <p className="mt-2 text-xs text-slate-soft">At least 8 characters.</p> : null}
      </div>
      {error ? <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral-ink" role="alert">{error}</p> : null}
      <button disabled={pending} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-forest-soft disabled:opacity-60">
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}{mode === "sign-in" ? "Sign in" : "Create account"} <ArrowRight className="size-4" />
      </button>
      <div className="my-2 flex items-center gap-3 text-xs text-slate-soft"><span className="h-px flex-1 bg-forest/10" />or<span className="h-px flex-1 bg-forest/10" /></div>
      <button type="button" onClick={google} className="inline-flex items-center justify-center gap-2 rounded-full border border-forest/10 bg-white px-6 py-3.5 text-sm font-semibold hover:bg-mist-deep">
        <svg viewBox="0 0 24 24" className="size-4"><path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14a6.6 6.6 0 0 1 0-4.1V7.1H2.1a11 11 0 0 0 0 9.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.1 7.1L5.8 10c.9-2.7 3.3-4.6 6.2-4.6z"/></svg>
        Continue with Google
      </button>
      <p className="mt-4 text-center text-sm text-slate">
        {mode === "sign-in" ? <>New here? <Link href={`/sign-up?next=${encodeURIComponent(next)}`} className="font-semibold text-green">Create an account</Link></> : <>Already have an account? <Link href={`/sign-in?next=${encodeURIComponent(next)}`} className="font-semibold text-green">Sign in</Link></>}
      </p>
    </form>
  );
}
