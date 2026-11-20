"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, BadgeCheck, BarChart3, Check, ClipboardList, Columns2, Copy, EyeOff, Eye, GalleryHorizontal, GripVertical, Handshake, HelpCircle,
  History, Image as ImageIcon, LayoutGrid, ListOrdered, Loader2, Mail, Milestone, Monitor, MousePointerClick, MoreHorizontal, Newspaper, Orbit,
  PanelTop, Plus, Quote, RotateCcw, ShieldCheck, Smartphone, Trash2, Type, Undo2, Upload, X, Clapperboard, MapPin, Users, Images, Sprout, type LucideIcon,
} from "lucide-react";
import { SECTION_DEFS, newSection, sectionDef, type Section } from "@/lib/content/schema";
import { deletePage, discardDraft, publishPage, restoreRevision, saveDraft, unpublishPage } from "@/app/actions/studio";
import { Fields } from "./fields";
import { cn, timeAgo } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = { Orbit, PanelTop, Quote, LayoutGrid, Image: ImageIcon, BarChart3, GalleryHorizontal, Columns2, ListOrdered, Type, Milestone, BadgeCheck, Handshake, Newspaper, HelpCircle, ShieldCheck, MousePointerClick, Mail, ClipboardList, Clapperboard, MapPin, Users, Images, Sprout };

export interface EditorPage {
  id: string; slug: string; status: "draft" | "published"; title: string; seo_description: string | null; sections: Section[];
  show_in_nav: boolean; nav_order: number; has_draft: boolean; updated_at: string; published_at: string | null;
}
export interface Revision { id: string; title: string; note: string | null; created_at: string; author: string | null }

type Draft = { title: string; slug: string; seo_description: string | null; sections: Section[]; show_in_nav: boolean; nav_order: number };

export function PageEditor({ page, revisions }: { page: EditorPage; revisions: Revision[] }) {
  const router = useRouter();
  const [d, setD] = useState<Draft>({ title: page.title, slug: page.slug, seo_description: page.seo_description, sections: page.sections, show_in_nav: page.show_in_nav, nav_order: page.nav_order });
  const [selected, setSelected] = useState<string | "page" | null>(page.sections[0]?._key ?? "page");
  const [saveState, setSaveState] = useState<"saved" | "dirty" | "saving" | "error">("saved");
  const [error, setError] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(page.has_draft);
  const [status, setStatus] = useState(page.status);
  const [previewKey, setPreviewKey] = useState(0);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [adding, setAdding] = useState<number | null>(null);
  const [panel, setPanel] = useState<"history" | null>(null);
  const [menu, setMenu] = useState(false);
  const [pending, start] = useTransition();
  const dragFrom = useRef<number | null>(null);
  const first = useRef(true);

  const update = (patch: Partial<Draft>) => setD((p) => ({ ...p, ...patch }));
  const setSection = (key: string, value: Section) => update({ sections: d.sections.map((s) => (s._key === key ? value : s)) });

  // Autosave the draft a moment after the last change, then refresh the preview.
  const save = useCallback(async (draft: Draft) => {
    setSaveState("saving");
    const r = await saveDraft(page.id, draft);
    if (r.ok) { setSaveState("saved"); setHasDraft(true); setError(null); setPreviewKey((k) => k + 1); }
    else { setSaveState("error"); setError(r.error); }
  }, [page.id]);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setSaveState("dirty");
    const t = setTimeout(() => save(d), 900);
    return () => clearTimeout(t);
  }, [d, save]);

  const publish = () => start(async () => {
    if (saveState !== "saved") await save(d);
    const r = await publishPage(page.id);
    if (r.ok) { setStatus("published"); setHasDraft(false); router.refresh(); } else setError(r.error);
  });
  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) => start(async () => {
    setMenu(false);
    const r = await fn();
    if (r.ok) { after?.(); router.refresh(); } else setError(r.error ?? "Something went wrong.");
  });

  const insert = (type: string, at: number) => {
    const s = newSection(type);
    const next = [...d.sections];
    next.splice(at, 0, s);
    update({ sections: next });
    setSelected(s._key);
    setAdding(null);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= d.sections.length || from === to) return;
    const next = [...d.sections];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    update({ sections: next });
  };

  const current = d.sections.find((s) => s._key === selected);
  const def = current ? sectionDef(current.type) : null;
  const liveUrl = page.slug === "home" ? "/" : `/${d.slug}`;

  return (
    <div className="-mx-4 -my-8 flex h-[calc(100svh-56px)] flex-col md:-mx-8">
      {/* Top bar */}
      <div className="hairline flex flex-wrap items-center gap-3 border-b bg-[var(--d-panel)] px-4 py-2.5">
        <Link href="/admin/studio/pages" className="btn btn-ghost !px-2" aria-label="Back to pages"><ArrowLeft className="size-4" /></Link>
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">{d.title || "Untitled"}</p>
          <p className="faint font-mono text-[11px]">{liveUrl}</p>
        </div>
        <span className={cn("pill ml-1", status === "published" ? (hasDraft ? "tone-ochre" : "tone-green") : "tone-stone")}>
          {status === "published" ? (hasDraft ? "Published · unpublished changes" : "Published") : "Draft"}
        </span>
        <span className="faint flex items-center gap-1.5 text-xs">
          {saveState === "saving" ? <><Loader2 className="size-3 animate-spin" /> Saving</> : saveState === "dirty" ? "Editing…" : saveState === "error" ? <span className="text-[var(--d-ochre)]">Not saved</span> : <><Check className="size-3" /> Draft saved</>}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <div className="hairline hidden rounded-lg border p-0.5 md:flex">
            <button onClick={() => setDevice("desktop")} className={cn("rounded-md p-1.5", device === "desktop" && "bg-[var(--d-active)]")} aria-label="Desktop preview"><Monitor className="size-4" /></button>
            <button onClick={() => setDevice("mobile")} className={cn("rounded-md p-1.5", device === "mobile" && "bg-[var(--d-active)]")} aria-label="Mobile preview"><Smartphone className="size-4" /></button>
          </div>
          <button onClick={() => setPanel(panel === "history" ? null : "history")} className="btn btn-ghost !px-2.5" title="History"><History className="size-4" /></button>
          {status === "published" ? <a href={liveUrl} target="_blank" className="btn btn-ghost hidden sm:inline-flex"><Eye className="size-4" /> Live</a> : null}
          <div className="relative">
            <button onClick={() => setMenu((m) => !m)} className="btn btn-ghost !px-2.5" aria-label="More"><MoreHorizontal className="size-4" /></button>
            {menu ? (
              <div className="panel absolute right-0 top-11 z-30 w-56 p-1 !shadow-xl">
                {status === "published" && hasDraft ? <button onClick={() => act(() => discardDraft(page.id), () => window.location.reload())} className="nav-item w-full"><Undo2 className="size-4" /> Discard changes</button> : null}
                {status === "published" && page.slug !== "home" ? <button onClick={() => act(() => unpublishPage(page.id), () => setStatus("draft"))} className="nav-item w-full"><EyeOff className="size-4" /> Unpublish</button> : null}
                {page.slug !== "home" ? <button onClick={() => confirm("Delete this page for good?") && act(() => deletePage(page.id), () => router.push("/admin/studio/pages"))} className="nav-item w-full !text-red-500"><Trash2 className="size-4" /> Delete page</button> : null}
              </div>
            ) : null}
          </div>
          <button onClick={publish} disabled={pending || (status === "published" && !hasDraft && saveState === "saved")} className="btn btn-primary">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Publish
          </button>
        </div>
      </div>
      {error ? <div className="flex items-center justify-between bg-[var(--d-ochre-soft)] px-4 py-2 text-sm text-[var(--d-ochre)]">{error}<button onClick={() => setError(null)}><X className="size-4" /></button></div> : null}

      <div className="flex min-h-0 flex-1">
        {/* Outline */}
        <aside className="hairline w-[260px] shrink-0 overflow-y-auto border-r bg-[var(--d-panel)] p-3">
          <button onClick={() => setSelected("page")} className="nav-item w-full" data-active={selected === "page"}><PanelTop className="size-4" /> Page settings</button>
          <p className="faint mb-1 mt-4 px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em]">Sections</p>
          <ol className="space-y-0.5">
            {d.sections.map((s, i) => {
              const sd = sectionDef(s.type);
              const Icon = ICONS[sd?.icon ?? "Type"] ?? Type;
              const label = String(s.heading || s.title || s.text || s.kicker || sd?.title || s.type).replace(/\*/g, "");
              return (
                <li key={s._key}
                  draggable
                  onDragStart={() => { dragFrom.current = i; }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (dragFrom.current !== null) move(dragFrom.current, i); dragFrom.current = null; }}
                  className="group">
                  <div className="nav-item !pr-1" data-active={selected === s._key}>
                    <GripVertical className="faint size-3.5 shrink-0 cursor-grab opacity-0 group-hover:opacity-100" />
                    <button onClick={() => setSelected(s._key)} className={cn("flex min-w-0 flex-1 items-center gap-2 text-left", s.hidden && "opacity-40")}>
                      <Icon className="size-4 shrink-0" />
                      <span className="min-w-0"><span className="block truncate text-[13px]">{label}</span><span className="faint block text-[10.5px]">{sd?.title}</span></span>
                    </button>
                    <button onClick={() => setSection(s._key, { ...s, hidden: !s.hidden })} className="faint rounded p-1 opacity-0 hover:bg-[var(--d-hover)] group-hover:opacity-100" title={s.hidden ? "Show" : "Hide"}>{s.hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}</button>
                  </div>
                </li>
              );
            })}
          </ol>
          <button onClick={() => setAdding(d.sections.length)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--d-border-strong)] py-2.5 text-sm font-semibold text-[var(--d-accent)] hover:bg-[var(--d-hover)]">
            <Plus className="size-4" /> Add section
          </button>
        </aside>

        {/* Fields */}
        <section className="w-[400px] shrink-0 overflow-y-auto bg-[var(--d-bg)] p-5 xl:w-[440px]">
          {selected === "page" ? (
            <div className="grid gap-5">
              <div><p className="font-semibold">Page settings</p><p className="faint text-xs">Title, address, search description and menu.</p></div>
              <div><label className="label">Title</label><input className="input" value={d.title} onChange={(e) => update({ title: e.target.value })} /></div>
              <div><label className="label">Address</label>
                <div className="flex items-center gap-1"><span className="faint font-mono text-sm">/</span><input className="input font-mono" disabled={page.slug === "home"} value={page.slug === "home" ? "" : d.slug} onChange={(e) => update({ slug: e.target.value })} /></div>
              </div>
              <div><label className="label">Search description</label><textarea className="input" rows={3} maxLength={300} value={d.seo_description ?? ""} onChange={(e) => update({ seo_description: e.target.value })} /><p className="faint mt-1 text-right text-[11px]">{(d.seo_description ?? "").length}/300</p></div>
              <button type="button" onClick={() => update({ show_in_nav: !d.show_in_nav })} className="flex items-center gap-3 text-left"><span className="switch" data-on={d.show_in_nav} /><span className="text-sm">List in the studio's page menu helper</span></button>
              <p className="faint text-xs">The main menu itself is edited in Settings → Navigation.</p>
            </div>
          ) : current && def ? (
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div><p className="font-semibold">{def.title}</p><p className="faint text-xs">{def.description}</p></div>
                <div className="flex shrink-0 gap-1">
                  {(() => { const i = d.sections.findIndex((s) => s._key === current._key); return (<>
                    <button onClick={() => move(i, i - 1)} className="btn btn-ghost !px-2 !py-1" title="Move up">↑</button>
                    <button onClick={() => move(i, i + 1)} className="btn btn-ghost !px-2 !py-1" title="Move down">↓</button>
                    <button onClick={() => { const c = { ...structuredClone(current), _key: Math.random().toString(36).slice(2, 10) }; const n = [...d.sections]; n.splice(i + 1, 0, c); update({ sections: n }); setSelected(c._key); }} className="btn btn-ghost !px-2 !py-1" title="Duplicate"><Copy className="size-3.5" /></button>
                    <button onClick={() => { update({ sections: d.sections.filter((s) => s._key !== current._key) }); setSelected("page"); }} className="btn btn-danger !px-2 !py-1" title="Remove"><Trash2 className="size-3.5" /></button>
                  </>); })()}
                </div>
              </div>
              <Fields fields={def.fields} value={current} onChange={(v) => setSection(current._key, v as Section)} />
              <button onClick={() => setAdding(d.sections.findIndex((s) => s._key === current._key) + 1)} className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--d-border-strong)] py-2.5 text-sm font-semibold text-[var(--d-accent)] hover:bg-[var(--d-hover)]"><Plus className="size-4" /> Add a section below</button>
            </div>
          ) : <p className="muted text-sm">Choose a section on the left.</p>}
        </section>

        {/* Preview */}
        <section className="hairline relative hidden min-w-0 flex-1 border-l bg-[var(--d-hover)] lg:block">
          <div className={cn("mx-auto h-full bg-white transition-all", device === "mobile" ? "my-4 h-[calc(100%-2rem)] w-[390px] overflow-hidden rounded-[28px] shadow-2xl ring-8 ring-black/80" : "w-full")}>
            <iframe key={previewKey} src={`/preview/${page.id}`} title="Preview" className="size-full" />
          </div>
          {saveState === "saving" ? <span className="panel absolute right-4 top-4 flex items-center gap-2 px-3 py-1.5 text-xs"><Loader2 className="size-3 animate-spin" /> Updating preview</span> : null}
        </section>

        {panel === "history" ? (
          <aside className="hairline w-[300px] shrink-0 overflow-y-auto border-l bg-[var(--d-panel)] p-4">
            <div className="mb-4 flex items-center justify-between"><p className="font-semibold">Published versions</p><button onClick={() => setPanel(null)}><X className="size-4" /></button></div>
            {revisions.length ? (
              <ul className="space-y-1">
                {revisions.map((r, i) => (
                  <li key={r.id} className="row-hover flex items-center gap-3 rounded-lg p-2.5">
                    <span className="min-w-0 flex-1"><span className="block text-sm">{i === 0 ? "Current live version" : timeAgo(r.created_at)}</span><span className="faint block truncate text-xs">{r.author ?? "Someone"} · {new Date(r.created_at).toLocaleString("en-KE")}</span></span>
                    {i > 0 ? <button onClick={() => act(() => restoreRevision(page.id, r.id), () => window.location.reload())} className="btn btn-ghost !px-2 !py-1 !text-xs" title="Load into draft"><RotateCcw className="size-3.5" /> Restore</button> : null}
                  </li>
                ))}
              </ul>
            ) : <p className="muted text-sm">Versions appear here each time you publish.</p>}
          </aside>
        ) : null}
      </div>

      {adding !== null ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setAdding(null)}>
          <div className="panel max-h-[85vh] w-full max-w-3xl overflow-y-auto p-5 !shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><p className="font-semibold">Add a section</p><button onClick={() => setAdding(null)}><X className="size-4" /></button></div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SECTION_DEFS.map((sd) => {
                const Icon = ICONS[sd.icon] ?? Type;
                return (
                  <button key={sd.type} onClick={() => insert(sd.type, adding)} className="hairline row-hover rounded-xl border p-4 text-left">
                    <Icon className="size-5 text-[var(--d-accent)]" />
                    <p className="mt-3 text-sm font-semibold">{sd.title}</p>
                    <p className="faint mt-1 text-xs leading-snug">{sd.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
