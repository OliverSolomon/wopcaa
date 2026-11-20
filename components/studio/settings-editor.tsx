"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { saveSettings } from "@/app/actions/studio";
import { SETTINGS_FIELDS, type SiteSettings } from "@/lib/content/schema";
import { Fields } from "./fields";
import { PageTitle } from "@/components/dash/ui";
import { cn } from "@/lib/utils";

export function SettingsEditor({ initial }: { initial: SiteSettings }) {
  const [d, setD] = useState<SiteSettings>(initial);
  const [tab, setTab] = useState(SETTINGS_FIELDS[0].group);
  const [state, setState] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const group = SETTINGS_FIELDS.find((g) => g.group === tab)!;
  return (
    <>
      <PageTitle title="Settings" sub="Name, menu, contact details, help lines and footer. Changes go live when you save." actions={
        <button disabled={pending} onClick={() => start(async () => {
          const r = await saveSettings(d as unknown as Record<string, unknown>);
          if (r.ok) { setState("saved"); setTimeout(() => setState("idle"), 2000); } else { setState("error"); setError(r.error); }
        })} className="btn btn-primary">{pending ? <Loader2 className="size-4 animate-spin" /> : state === "saved" ? <Check className="size-4" /> : null}{state === "saved" ? "Saved" : "Save settings"}</button>
      } />
      {state === "error" ? <p className="mb-4 text-sm text-[var(--d-ochre)]">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
        <nav className="space-y-0.5">
          {SETTINGS_FIELDS.map((g) => <button key={g.group} onClick={() => setTab(g.group)} className="nav-item w-full" data-active={tab === g.group}>{g.group}</button>)}
        </nav>
        <section className={cn("panel max-w-2xl p-6")}>
          <Fields fields={group.fields} value={d as unknown as Record<string, unknown>} onChange={(v) => setD(v as unknown as SiteSettings)} />
        </section>
      </div>
    </>
  );
}
