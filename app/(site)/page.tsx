import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPage, getSettings } from "@/lib/content/queries";
import { SectionRenderer } from "@/components/sections/sections";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPublishedPage("home"), getSettings()]);
  return { title: { absolute: `${settings.shortName} · ${settings.tagline}` }, description: page?.seo_description || settings.seoDescription };
}

export default async function Home() {
  const [page, settings] = await Promise.all([getPublishedPage("home"), getSettings()]);
  if (!page) notFound();
  return <SectionRenderer sections={page.sections} settings={settings} />;
}
