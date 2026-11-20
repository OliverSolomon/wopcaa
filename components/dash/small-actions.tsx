"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { markEnquiry, setRole } from "@/app/actions/admin";

export function MarkHandled({ id, handled }: { id: string; handled: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button disabled={pending} onClick={() => start(async () => { await markEnquiry(id, !handled); })} className="btn btn-ghost self-start">
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} {handled ? "Reopen" : "Mark handled"}
    </button>
  );
}

export function RoleSelect({ userId, role, disabled }: { userId: string; role: string; disabled?: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-2">
      <select
        className="input !w-auto !py-1.5"
        defaultValue={role}
        disabled={disabled || pending}
        onChange={(e) => start(async () => {
          setError(null);
          const r = await setRole(userId, e.target.value as "reporter");
          if (!r.ok) setError(r.error ?? "Could not change role.");
        })}
      >
        <option value="reporter">Reporter</option>
        <option value="editor">Editor (studio)</option>
        <option value="admin">Admin (cases + studio)</option>
        <option value="super_admin">Super admin</option>
      </select>
      {pending ? <Loader2 className="faint size-4 animate-spin" /> : null}
      {error ? <span className="text-xs text-[var(--d-ochre)]">{error}</span> : null}
    </div>
  );
}
