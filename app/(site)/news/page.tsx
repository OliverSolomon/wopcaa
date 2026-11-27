import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getPosts } from "@/lib/content/queries";
import { formatDate, cn } from "@/lib/utils";
import { Container } from "@/components/sections/parts";

export const metadata: Metadata = { title: "News and articles", description: "Articles, press releases and events from WOPCAA." };

const KIND = { article: "Article", press: "Press release", event: "Event" } as const;
const TABS = [{ id: "all", label: "Everything" }, { id: "article", label: "Articles" }, { id: "press", label: "Press releases" }, { id: "event", label: "Events" }];

async function List({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = (await searchParams).kind;
  const kind = TABS.some((t) => t.id === raw) ? String(raw) : "all";
  const posts = await getPosts(kind, 100);
  const [lead, ...rest] = posts;
  return (
    <>
      <nav className="mt-10 flex flex-wrap gap-2" aria-label="Filter">
        {TABS.map((t) => (
          <Link key={t.id} href={t.id === "all" ? "/news" : `/news?kind=${t.id}`} aria-current={kind === t.id ? "page" : undefined}
            className={cn("rounded-full border px-4 py-2 text-[0.95rem] transition-colors", kind === t.id ? "border-green bg-green text-white" : "border-line bg-white hover:border-green hover:text-green")}>
            {t.label}
          </Link>
        ))}
      </nav>
      {lead ? (
        <Link href={`/news/${lead.slug}`} className="group mt-12 grid gap-8 md:grid-cols-12 md:items-center">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-mist-deep md:col-span-7">
            {lead.cover_image ? <Image src={lead.cover_image} alt="" fill priority sizes="(min-width:768px) 60vw, 100vw" quality={90} className="object-cover" /> : null}
          </div>
          <div className="md:col-span-5">
            <h2 className="t-h2 group-hover:text-green">{lead.title}</h2>
            <p className="t-meta mt-3">{KIND[lead.kind]}, {formatDate(lead.event_start ?? lead.published_at)}</p>
            {lead.excerpt ? <p className="mt-4 text-slate">{lead.excerpt}</p> : null}
          </div>
        </Link>
      ) : <p className="mt-12 text-slate">Nothing here yet.</p>}
      <div className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <Link key={p.id} href={`/news/${p.slug}`} className="group">
            <div className="relative aspect-[3/2] overflow-hidden rounded-[14px] bg-mist-deep">
              {p.cover_image ? <Image src={p.cover_image} alt="" fill sizes="33vw" className="object-cover" /> : null}
            </div>
            <h3 className="mt-4 text-[1.2rem] font-semibold leading-snug underline-offset-4 group-hover:text-green group-hover:underline">{p.title}</h3>
            <p className="t-meta mt-1.5">{KIND[p.kind]}, {formatDate(p.event_start ?? p.published_at)}</p>
            {p.kind === "event" && p.event_location ? <p className="t-meta mt-1 flex items-center gap-1.5"><MapPin className="size-3.5" />{p.event_location}</p> : null}
          </Link>
        ))}
      </div>
    </>
  );
}

export default function NewsPage({ searchParams }: PageProps<"/news">) {
  return (
    <section className="pb-24 pt-10 md:pt-36">
      <Container>
        <h1 className="t-h1">News and articles</h1>
        <p className="t-lead mt-4 max-w-[56ch]">Writing, statements and gatherings from our work with women.</p>
        <Suspense fallback={<div className="mt-12 h-96 animate-pulse rounded-[20px] bg-mist-deep" />}>
          <List searchParams={searchParams} />
        </Suspense>
      </Container>
    </section>
  );
}
