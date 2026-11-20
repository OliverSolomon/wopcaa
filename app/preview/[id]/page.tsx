import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireStaff } from "@/lib/session";
import { one } from "@/lib/db";
import { getSettings } from "@/lib/content/queries";
import { SectionRenderer } from "@/components/sections/sections";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import type { Section } from "@/lib/content/schema";

export const metadata = { title: "Preview", robots: { index: false } };

/** The studio's live preview: renders the saved draft of a page, staff only. */
async function Draft({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [page, settings] = await Promise.all([
    one<{ slug: string; sections: Section[]; draft_sections: Section[] | null }>("select slug, sections, draft_sections from pages where id = $1", [id]),
    getSettings(),
  ]);
  if (!page) notFound();
  const home = page.slug === "home";
  return (
    <>
      <SmoothScroll />
      <Header settings={settings} darkTop={home ? ["/preview/" + id] : []} />
      <main>
        <SectionRenderer sections={page.draft_sections ?? page.sections} settings={settings} />
      </main>
      <Footer settings={settings} />
    </>
  );
}

export default function Preview({ params }: PageProps<"/preview/[id]">) {
  return (
    <Suspense fallback={<div className="grid min-h-svh place-items-center text-sm text-slate-soft">Loading preview…</div>}>
      <Draft params={params} />
    </Suspense>
  );
}
