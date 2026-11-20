"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Eye, ImagePlus, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import type { Field } from "@/lib/content/schema";
import { listMedia } from "@/app/actions/studio";
import { uploadFile } from "@/lib/upload-client";
import { renderMarkdown } from "@/lib/content/markdown";
import { cn } from "@/lib/utils";

type Value = unknown;
type Obj = Record<string, Value>;

export function Fields({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void }) {
  return (
    <div className="grid gap-5">
      {fields.map((f) => (
        <FieldInput key={f.name} field={f} value={value[f.name]} onChange={(v) => onChange({ ...value, [f.name]: v })} />
      ))}
    </div>
  );
}

export function FieldInput({ field, value, onChange }: { field: Field; value: Value; onChange: (v: Value) => void }) {
  const help = "help" in field && field.help ? <p className="faint mt-1.5 text-[11.5px]">{field.help}</p> : null;
  const s = typeof value === "string" ? value : value == null ? "" : String(value);

  switch (field.type) {
    case "text":
      return <div><label className="label">{field.label}</label><input className="input" value={s} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />{help}</div>;
    case "number":
      return <div><label className="label">{field.label}</label><input type="number" className="input !w-32" value={s} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />{help}</div>;
    case "textarea":
      return <div><label className="label">{field.label}</label><textarea className="input" rows={field.rows ?? 3} value={s} onChange={(e) => onChange(e.target.value)} />{help}</div>;
    case "markdown":
      return <Markdown label={field.label} value={s} onChange={onChange} help={help} />;
    case "boolean":
      return (
        <button type="button" onClick={() => onChange(!value)} className="flex items-center gap-3 text-left">
          <span className="switch" data-on={!!value} /><span className="text-sm">{field.label}</span>
        </button>
      );
    case "select":
      return (
        <div><label className="label">{field.label}</label>
          <select className="input" value={s} onChange={(e) => onChange(e.target.value)}>{field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{help}
        </div>
      );
    case "link": {
      const l = (value as { label?: string; href?: string }) ?? {};
      return (
        <div><label className="label">{field.label}</label>
          <div className="grid grid-cols-2 gap-2">
            <input className="input" placeholder="Label" value={l.label ?? ""} onChange={(e) => onChange({ ...l, label: e.target.value })} />
            <input className="input font-mono !text-[13px]" placeholder="/page or https://" value={l.href ?? ""} onChange={(e) => onChange({ ...l, href: e.target.value })} />
          </div>{help}
        </div>
      );
    }
    case "image":
      return <ImageField label={field.label} value={s} onChange={onChange} help={help} />;
    case "object":
      return (
        <fieldset className="hairline rounded-xl border p-4">
          <legend className="label px-1">{field.label}</legend>
          <Fields fields={field.of} value={(value as Obj) ?? {}} onChange={onChange} />
        </fieldset>
      );
    case "list":
      return <ListField field={field} value={Array.isArray(value) ? (value as Obj[]) : []} onChange={onChange} />;
  }
}

function Markdown({ label, value, onChange, help }: { label: string; value: string; onChange: (v: string) => void; help: React.ReactNode }) {
  const [preview, setPreview] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between"><label className="label">{label}</label>
        <button type="button" onClick={() => setPreview((p) => !p)} className="faint mb-1.5 flex items-center gap-1 text-[11px] font-semibold">{preview ? <Pencil className="size-3" /> : <Eye className="size-3" />}{preview ? "Edit" : "Preview"}</button>
      </div>
      {preview ? (
        <div className="input prose-site min-h-40 !text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(value) || "<p>Nothing yet.</p>" }} />
      ) : (
        <textarea className="input font-mono !text-[13px] leading-relaxed" rows={9} value={value} onChange={(e) => onChange(e.target.value)} placeholder={"## Heading\n\nA paragraph with **bold**, *italic* and a [link](/about).\n\n- A list item"} />
      )}
      <p className="faint mt-1.5 text-[11.5px]">Markdown: ## heading, **bold**, *italic*, [link](/url), - list.</p>
      {help}
    </div>
  );
}

function ListField({ field, value, onChange }: { field: Extract<Field, { type: "list" }>; value: Obj[]; onChange: (v: Obj[]) => void }) {
  const [open, setOpen] = useState<number | null>(value.length ? null : null);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen(j);
  };
  const blank = () => Object.fromEntries(field.of.map((f) => [f.name, f.type === "list" ? [] : f.type === "boolean" ? false : f.type === "link" ? { label: "", href: "" } : ""]));
  return (
    <div>
      <label className="label">{field.label} <span className="faint font-normal">· {value.length}</span></label>
      <div className="hairline overflow-hidden rounded-xl border">
        {value.map((item, i) => {
          const title = String((field.itemLabel && item[field.itemLabel]) || `Item ${i + 1}`);
          const isOpen = open === i;
          return (
            <div key={i} className="hairline border-b last:border-0">
              <div className="flex items-center gap-1 px-2 py-1.5">
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-[var(--d-hover)]">
                  {typeof item.image === "string" && item.image ? <img src={item.image} alt="" className="size-6 rounded object-cover" /> : typeof item.logo === "string" && item.logo ? <img src={item.logo} alt="" className="size-6 rounded object-contain" /> : null}
                  <span className="truncate">{title}</span>
                </button>
                <button type="button" className="faint rounded p-1 hover:bg-[var(--d-hover)]" onClick={() => move(i, -1)} aria-label="Move up"><ChevronUp className="size-4" /></button>
                <button type="button" className="faint rounded p-1 hover:bg-[var(--d-hover)]" onClick={() => move(i, 1)} aria-label="Move down"><ChevronDown className="size-4" /></button>
                <button type="button" className="faint rounded p-1 hover:bg-[var(--d-hover)]" onClick={() => { const n = [...value]; n.splice(i + 1, 0, structuredClone(item)); onChange(n); }} aria-label="Duplicate"><Copy className="size-3.5" /></button>
                <button type="button" className="faint rounded p-1 hover:bg-[var(--d-hover)] hover:text-red-500" onClick={() => { onChange(value.filter((_, j) => j !== i)); setOpen(null); }} aria-label="Remove"><Trash2 className="size-3.5" /></button>
              </div>
              {isOpen ? <div className="bg-[var(--d-panel-2)] p-4"><Fields fields={field.of} value={item} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} /></div> : null}
            </div>
          );
        })}
        <button type="button" onClick={() => { onChange([...value, blank()]); setOpen(value.length); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[var(--d-accent)] hover:bg-[var(--d-hover)]">
          <Plus className="size-4" /> Add
        </button>
      </div>
    </div>
  );
}

function ImageField({ label, value, onChange, help }: { label: string; value: string; onChange: (v: string) => void; help: React.ReactNode }) {
  const [picking, setPicking] = useState(false);
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setPicking(true)} className="hairline relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border bg-[var(--d-panel-2)] hover:border-[var(--d-accent)]">
          {value ? <img src={value} alt="" className="size-full object-cover" /> : <ImagePlus className="faint size-5" />}
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <input className="input font-mono !text-[12px]" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Choose or paste an image URL" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setPicking(true)} className="btn btn-ghost !py-1 !text-xs">Choose…</button>
            {value ? <button type="button" onClick={() => onChange("")} className="btn btn-ghost !py-1 !text-xs">Remove</button> : null}
          </div>
        </div>
      </div>
      {help}
      {picking ? <MediaPicker onClose={() => setPicking(false)} onPick={(url) => { onChange(url); setPicking(false); }} /> : null}
    </div>
  );
}

export function MediaPicker({ onClose, onPick }: { onClose: () => void; onPick: (url: string) => void }) {
  const [items, setItems] = useState<{ id: string; url: string; alt: string | null }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = () => listMedia().then(setItems).catch(() => setItems([]));
  useEffect(() => { load(); }, []);
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setError(null);
    try {
      let last = "";
      for (const f of Array.from(files)) last = (await uploadFile(f, "media")).publicUrl ?? "";
      await load();
      if (files.length === 1 && last) onPick(last);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="panel flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden !shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="hairline flex items-center justify-between border-b px-5 py-3.5">
          <p className="font-semibold">Media library</p>
          <div className="flex items-center gap-2">
            <label className={cn("btn btn-primary cursor-pointer", busy && "pointer-events-none opacity-60")}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload
              <input type="file" accept="image/*,video/mp4,video/webm" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
            </label>
            <button onClick={onClose} className="btn btn-ghost !px-2" aria-label="Close"><X className="size-4" /></button>
          </div>
        </div>
        {error ? <p className="px-5 pt-3 text-sm text-[var(--d-ochre)]">{error}</p> : null}
        <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-5 sm:grid-cols-4 md:grid-cols-5">
          {items === null ? <Loader2 className="faint size-5 animate-spin" /> : items.map((m) => (
            <button key={m.id} onClick={() => onPick(m.url)} className="hairline group relative aspect-square overflow-hidden rounded-xl border bg-[var(--d-panel-2)] hover:ring-2 hover:ring-[var(--d-accent)]">
              <img src={m.url} alt={m.alt ?? ""} className="size-full object-cover" loading="lazy" />
              <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-2 py-1 text-left text-[10px] text-white opacity-0 group-hover:opacity-100">{m.alt}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
