"use client";

import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export function UserMenu({ name, email, role }: { name: string; email: string; role: string }) {
  const initials = name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex items-center gap-3 rounded-[10px] px-2 py-2">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--d-accent-soft)] text-xs font-bold text-[var(--d-accent)]">{initials}</span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[13px] font-semibold">{name}</span>
        <span className="faint block truncate text-[11px]">{role.replace("_", " ")} · {email}</span>
      </span>
      <button
        onClick={async () => { await authClient.signOut(); window.location.assign("/"); }}
        className="muted rounded-md p-1.5 hover:bg-[var(--d-hover)]"
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}
