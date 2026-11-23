"use client";

import { useState, useTransition } from "react";
import { Check, Copy, KeyRound, Loader2, MoreHorizontal, PauseCircle, PlayCircle, Trash2, UserPlus, X } from "lucide-react";
import { changeRole, createPerson, removePerson, resetPassword, restorePerson, suspendPerson } from "@/app/actions/people";
import { cn } from "@/lib/utils";

const ROLES = [
  { id: "reporter", label: "Reporter", hint: "Sees only their own reports" },
  { id: "editor", label: "Editor", hint: "Content studio" },
  { id: "admin", label: "Admin", hint: "Case desk and studio" },
  { id: "super_admin", label: "Super admin", hint: "Everything, including people" },
] as const;
type Role = (typeof ROLES)[number]["id"];

function Secret({ password, onClose, who }: { password: string; onClose: () => void; who: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="panel w-full max-w-md p-6 !shadow-2xl">
        <p className="font-semibold">Temporary password for {who}</p>
        <p className="muted mt-1 text-sm">Share it privately. It is shown once and is not stored anywhere readable. Ask them to change it after signing in.</p>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--d-panel-2)] p-3">
          <code className="flex-1 break-all text-[15px]">{password}</code>
          <button className="btn btn-ghost !px-2" onClick={() => { navigator.clipboard.writeText(password); setCopied(true); }} aria-label="Copy">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}</button>
        </div>
        <button className="btn btn-primary mt-5 w-full justify-center" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

export function AddPerson() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("admin");
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}><UserPlus className="size-4" /> Add person</button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <form className="panel w-full max-w-md p-6 !shadow-2xl" onClick={(e) => e.stopPropagation()} onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              setError(null);
              const r = await createPerson({ name, email, role });
              if (!r.ok) return setError(r.error ?? "The account could not be created.");
              setOpen(false); setSecret(r.data!.password);
            });
          }}>
            <div className="mb-5 flex items-center justify-between"><p className="font-semibold">Add a person</p><button type="button" onClick={() => setOpen(false)} aria-label="Close"><X className="size-4" /></button></div>
            <label className="label" htmlFor="pn">Name</label><input id="pn" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            <label className="label mt-4" htmlFor="pe">Email</label><input id="pe" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <span className="label mt-4">Role</span>
            <div className="grid gap-1.5">
              {ROLES.map((r) => (
                <button type="button" key={r.id} onClick={() => setRole(r.id)} className={cn("flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm", role === r.id ? "border-[var(--d-accent)] bg-[var(--d-accent-soft)]" : "hairline")}>
                  <span className="font-semibold">{r.label}</span><span className="faint text-xs">{r.hint}</span>
                </button>
              ))}
            </div>
            {error ? <p className="mt-3 text-sm text-[var(--d-ochre)]">{error}</p> : null}
            <button disabled={pending} className="btn btn-primary mt-6 w-full justify-center">{pending ? <Loader2 className="size-4 animate-spin" /> : null} Create account</button>
          </form>
        </div>
      ) : null}
      {secret ? <Secret password={secret} who={name} onClose={() => { setSecret(null); setName(""); setEmail(""); }} /> : null}
    </>
  );
}

export function PersonActions({ id, name, role, banned, canManage, isSelf }: { id: string; name: string; role: Role; banned: boolean; canManage: boolean; isSelf: boolean }) {
  const [pending, start] = useTransition();
  const [menu, setMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const run = (fn: () => Promise<{ ok: boolean; error?: string; data?: { password: string } }>) => start(async () => {
    setError(null); setMenu(false);
    const r = await fn();
    if (!r.ok) setError(r.error ?? "Something went wrong."); else if (r.data?.password) setSecret(r.data.password);
  });

  if (!canManage || isSelf) {
    return <span className="text-sm">{ROLES.find((r) => r.id === role)?.label}{isSelf ? <span className="faint"> (you)</span> : null}</span>;
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select className="input min-w-0 !w-auto flex-1 !py-1.5 md:flex-none" value={role} disabled={pending} onChange={(e) => run(() => changeRole(id, e.target.value as Role))}>
        {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
      </select>
      <div className="relative">
        <button className="btn btn-ghost !px-2" onClick={() => setMenu((m) => !m)} aria-label={`More actions for ${name}`}>{pending ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}</button>
        {menu ? (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenu(false)} />
            <div className="panel absolute right-0 top-10 z-40 w-52 p-1 !shadow-xl">
              <button className="nav-item w-full" onClick={() => run(() => resetPassword(id))}><KeyRound className="size-4" /> Reset password</button>
              {banned
                ? <button className="nav-item w-full" onClick={() => run(() => restorePerson(id))}><PlayCircle className="size-4" /> Restore access</button>
                : <button className="nav-item w-full" onClick={() => { const reason = prompt(`Why are you suspending ${name}?`); if (reason !== null) run(() => suspendPerson(id, reason)); }}><PauseCircle className="size-4" /> Suspend</button>}
              <button className="nav-item w-full !text-[#b3261e]" onClick={() => { if (confirm(`Remove ${name}'s account for good? Their reports stay with the case team.`)) run(() => removePerson(id)); }}><Trash2 className="size-4" /> Remove account</button>
            </div>
          </>
        ) : null}
      </div>
      {error ? <span className="text-xs text-[var(--d-ochre)]">{error}</span> : null}
      {secret ? <Secret password={secret} who={name} onClose={() => setSecret(null)} /> : null}
    </div>
  );
}
