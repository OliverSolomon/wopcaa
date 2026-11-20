import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPage, getPublishedSlugs, getSettings } from "@/lib/content/queries";
import { SectionRenderer } from "@/components/sections/sections";

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  // Cache Components needs at least one entry; pages published later render on first visit.
  return (slugs.length ? slugs : ["about"]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  return page ? { title: page.title, description: page.seo_description ?? undefined } : {};
}

export default async function CmsPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const [page, settings] = await Promise.all([getPublishedPage(slug), getSettings()]);
  if (!page) notFound();
  return <SectionRenderer sections={page.sections} settings={settings} />;
}
