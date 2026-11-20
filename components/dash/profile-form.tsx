"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { saveProfile } from "@/app/actions/account";
import { COUNTIES } from "@/lib/report-options";

export function ProfileForm({ name, county, email }: { name: string; county: string; email: string }) {
  const [state, action, pending] = useActionState(saveProfile, {});
  return (
    <form action={action} className="grid max-w-lg gap-4">
      <div><label className="label" htmlFor="n">Name or nickname</label><input id="n" name="full_name" defaultValue={name} className="input" /></div>
      <div><label className="label" htmlFor="e">Email</label><input id="e" value={email} disabled className="input opacity-70" /></div>
      <div><label className="label" htmlFor="c">County</label>
        <select id="c" name="county" defaultValue={county} className="input"><option value="">Prefer not to say</option>{COUNTIES.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      <div className="flex items-center gap-3">
        <button disabled={pending} className="btn btn-primary">{pending ? <Loader2 className="size-4 animate-spin" /> : null} Save</button>
        {state.ok ? <span className="flex items-center gap-1 text-sm text-[var(--d-accent)]"><Check className="size-4" /> Saved</span> : null}
        {state.error ? <span className="text-sm text-[var(--d-ochre)]">{state.error}</span> : null}
      </div>
    </form>
  );
}
