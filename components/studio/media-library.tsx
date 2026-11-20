"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Trash2, Upload } from "lucide-react";
import { deleteMedia, updateMediaAlt } from "@/app/actions/studio";
import { uploadFile } from "@/lib/upload-client";
import { cn } from "@/lib/utils";

type Item = { id: string; url: string; alt: string | null; mime_type: string | null; size_bytes: number | null };

export function MediaLibrary({ items }: { items: Item[] }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sel, setSel] = useState<Item | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setError(null);
    try { for (const f of Array.from(files)) await uploadFile(f, "media"); router.refresh(); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div>
        <label className={cn("panel mb-4 flex cursor-pointer items-center justify-center gap-3 border-dashed p-6 text-sm font-semibold text-[var(--d-accent)]", busy && "pointer-events-none opacity-60")}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload images or videos (up to 80 MB each)
          <input type="file" accept="image/*,video/mp4,video/webm" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
        </label>
        {error ? <p className="mb-4 text-sm text-[var(--d-ochre)]">{error}</p> : null}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {items.map((m) => (
            <button key={m.id} onClick={() => setSel(m)} className={cn("hairline aspect-square overflow-hidden rounded-xl border bg-[var(--d-panel-2)]", sel?.id === m.id && "ring-2 ring-[var(--d-accent)]")}>
              <img src={m.url} alt={m.alt ?? ""} className="size-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
      <aside className="panel h-fit p-5 lg:sticky lg:top-20">
        {sel ? (
          <div className="space-y-4">
            <img src={sel.url} alt={sel.alt ?? ""} className="w-full rounded-lg" />
            <div><label className="label">Alt text</label>
              <textarea key={sel.id} rows={3} className="input" defaultValue={sel.alt ?? ""} onBlur={(e) => start(async () => { await updateMediaAlt(sel.id, e.target.value); router.refresh(); })} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(sel.url)} className="btn btn-ghost flex-1 justify-center"><Copy className="size-4" /> Copy URL</button>
              <button onClick={() => start(async () => { const r = await deleteMedia(sel.id); if (!r.ok) setError(r.error); else { setSel(null); router.refresh(); } })} className="btn btn-danger">{pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}</button>
            </div>
            <p className="faint break-all font-mono text-[11px]">{sel.url}</p>
          </div>
        ) : <p className="muted text-sm">Select an image to edit its alt text or remove it.</p>}
      </aside>
    </div>
  );
}
