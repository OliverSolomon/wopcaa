"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { createPage } from "@/app/actions/studio";
import { slugify } from "@/lib/utils";

export function NewPage() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus className="size-4" /> New page</button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <form className="panel w-full max-w-md p-6 !shadow-2xl" onClick={(e) => e.stopPropagation()} onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await createPage(title, slug);
              if (r.ok) router.push(`/admin/studio/pages/${r.data!.id}`); else setError(r.error);
            });
          }}>
            <div className="mb-5 flex items-center justify-between"><p className="font-semibold">New page</p><button type="button" onClick={() => setOpen(false)}><X className="size-4" /></button></div>
            <label className="label">Title</label>
            <input autoFocus className="input" value={title} onChange={(e) => { setTitle(e.target.value); if (!touched) setSlug(slugify(e.target.value)); }} />
            <label className="label mt-4">Address</label>
            <div className="flex items-center gap-1"><span className="faint font-mono">/</span><input className="input font-mono" value={slug} onChange={(e) => { setTouched(true); setSlug(e.target.value); }} /></div>
            {error ? <p className="mt-3 text-sm text-[var(--d-ochre)]">{error}</p> : null}
            <button disabled={pending || !title} className="btn btn-primary mt-6 w-full justify-center">{pending ? <Loader2 className="size-4 animate-spin" /> : null} Create and edit</button>
          </form>
        </div>
      ) : null}
    </>
  );
}
