"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Loader2, Trash2, Upload } from "lucide-react";
import { deletePost, savePost } from "@/app/actions/studio";
import { Fields } from "./fields";
import type { Field } from "@/lib/content/schema";
import { cn } from "@/lib/utils";

export type PostDraft = { title: string; slug: string; kind: "article" | "press" | "event"; excerpt: string; body: string; cover_image: string; author: string; category: string; event_start: string; event_location: string; published_at: string };

const MAIN: Field[] = [
  { name: "title", label: "Title", type: "text" },
  { name: "excerpt", label: "Summary", type: "textarea", rows: 3, help: "Shown on cards and at the top of the post." },
  { name: "body", label: "Body", type: "markdown" },
];
const SIDE: Field[] = [
  { name: "kind", label: "Type", type: "select", options: [{ value: "article", label: "Article" }, { value: "press", label: "Press release" }, { value: "event", label: "Event" }] },
  { name: "slug", label: "Address (/news/…)", type: "text" },
  { name: "cover_image", label: "Cover image", type: "image" },
  { name: "author", label: "Author", type: "text" },
  { name: "category", label: "Category", type: "text", placeholder: "e.g. Climate Action" },
];

export function PostEditor({ id, status, initial }: { id: string | null; status: "draft" | "published"; initial: PostDraft }) {
  const [d, setD] = useState<PostDraft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const live = status === "published";

  const save = (publish?: boolean) => start(async () => {
    setError(null);
    const toIso = (v: string) => (v ? new Date(v).toISOString() : null);
    const r = await savePost(id, {
      ...d, excerpt: d.excerpt || null, cover_image: d.cover_image || null, author: d.author || null, category: d.category || null,
      event_start: d.kind === "event" ? toIso(d.event_start) : null, event_location: d.kind === "event" ? d.event_location || null : null,
      published_at: d.published_at ? toIso(d.published_at) : null,
    }, publish);
    if (!r.ok) return setError(r.error);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    if (!id) router.replace(`/admin/studio/posts/${r.data!.id}`); else router.refresh();
  });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/studio/posts" className="btn btn-ghost !px-2"><ArrowLeft className="size-4" /></Link>
        <h1 className="font-display text-2xl">{id ? "Edit post" : "New post"}</h1>
        <span className={cn("pill", live ? "tone-green" : "tone-stone")}>{live ? "Live" : "Draft"}</span>
        <div className="ml-auto flex flex-wrap gap-2">
          {id ? <button onClick={() => confirm("Delete this post?") && start(async () => { await deletePost(id); router.push("/admin/studio/posts"); })} className="btn btn-danger"><Trash2 className="size-4" /></button> : null}
          {live && d.slug ? <a href={`/news/${d.slug}`} target="_blank" className="btn btn-ghost"><Eye className="size-4" /> View</a> : null}
          <button onClick={() => save()} disabled={pending} className="btn btn-ghost">{saved ? "Saved" : "Save"}</button>
          {live ? <button onClick={() => save(false)} disabled={pending} className="btn btn-ghost">Unpublish</button> : null}
          <button onClick={() => save(true)} disabled={pending} className="btn btn-primary">{pending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} {live ? "Update" : "Publish"}</button>
        </div>
      </div>
      {error ? <p className="mb-4 rounded-lg bg-[var(--d-ochre-soft)] px-4 py-2 text-sm text-[var(--d-ochre)]">{error}</p> : null}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="panel p-6 lg:col-span-2"><Fields fields={MAIN} value={d} onChange={(v) => setD(v as PostDraft)} /></section>
        <aside className="panel space-y-5 p-6">
          <Fields fields={SIDE} value={d} onChange={(v) => setD(v as PostDraft)} />
          <div><label className="label">Publish date</label><input type="date" className="input" value={d.published_at} onChange={(e) => setD({ ...d, published_at: e.target.value })} /></div>
          {d.kind === "event" ? (
            <>
              <div><label className="label">Starts</label><input type="datetime-local" className="input" value={d.event_start} onChange={(e) => setD({ ...d, event_start: e.target.value })} /></div>
              <div><label className="label">Location</label><input className="input" value={d.event_location} onChange={(e) => setD({ ...d, event_location: e.target.value })} /></div>
            </>
          ) : null}
        </aside>
      </div>
    </>
  );
}
