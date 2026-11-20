import type { ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageTitle({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[2rem] leading-tight tracking-tight">{title}</h1>
        {sub ? <p className="muted mt-1 text-sm">{sub}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Pill({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={cn("pill", `tone-${tone}`)}>{children}</span>;
}

export function Empty({ icon: Icon = X, title, body }: { icon?: LucideIcon; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-[var(--d-hover)]"><Icon className="muted size-5" /></span>
      <p className="mt-4 font-semibold">{title}</p>
      {body ? <p className="muted mt-1 max-w-sm text-sm">{body}</p> : null}
    </div>
  );
}
