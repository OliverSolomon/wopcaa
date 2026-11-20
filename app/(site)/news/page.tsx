import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { getPosts } from "@/lib/content/queries";
import { formatDate } from "@/lib/utils";
import { Container } from "@/components/sections/parts";
import { FadeUp, RevealText } from "@/components/motion/motion";

export const metadata: Metadata = { title: "News & media", description: "Articles, press releases and events from WOPCAA." };

const LABEL = { article: "Article", press: "Press release", event: "Event" } as const;

export default async function NewsPage() {
  const posts = await getPosts("all", 100);
  const [lead, ...rest] = posts;
  const events = posts.filter((p) => p.kind === "event");
  return (
    <>
      <section className="pt-36 md:pt-44">
        <Container>
          <p className="kicker text-ink-500">Media centre</p>
          <RevealText as="h1" text="Stories, statements and *gatherings*." className="display mt-6 max-w-5xl text-[3rem] md:text-[6rem]" />
        </Container>
      </section>

      {lead ? (
        <Container className="mt-16">
          <Link href={`/news/${lead.slug}`} className="group grid gap-8 md:grid-cols-12 md:items-end">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] bg-sand-200 md:col-span-8">
              {lead.cover_image ? <Image src={lead.cover_image} alt="" fill priority sizes="66vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105" /> : null}
            </div>
            <div className="md:col-span-4">
              <p className="kicker text-ochre-600">{LABEL[lead.kind]} · {formatDate(lead.published_at)}</p>
              <h2 className="display mt-4 text-[2.4rem] md:text-[3rem]">{lead.title}</h2>
              <p className="mt-4 text-ink-500">{lead.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 font-semibold">Read <ArrowUpRight className="size-4" /></span>
            </div>
          </Link>
        </Container>
      ) : null}

      <Container className="py-24">
        <FadeUp stagger={0.06} className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <Link key={p.id} href={`/news/${p.slug}`} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-sand-200">
                {p.cover_image ? <Image src={p.cover_image} alt="" fill sizes="33vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-105" /> : null}
              </div>
              <p className="kicker mt-5 flex gap-3 text-ink-400"><span className="text-ochre-600">{LABEL[p.kind]}</span>{formatDate(p.event_start ?? p.published_at)}</p>
              <h3 className="font-display mt-3 text-[1.5rem] leading-snug group-hover:text-moss-600">{p.title}</h3>
              {p.kind === "event" && p.event_location ? <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-500"><MapPin className="size-3.5" />{p.event_location}</p> : null}
            </Link>
          ))}
        </FadeUp>
        {events.length ? (
          <div className="mt-28">
            <p className="kicker text-ink-500">Events</p>
            <div className="mt-8 border-t border-ink-900/10">
              {events.map((e) => (
                <Link key={e.id} href={`/news/${e.slug}`} className="group grid gap-3 border-b border-ink-900/10 py-7 md:grid-cols-12 md:items-center">
                  <span className="kicker flex items-center gap-2 text-ochre-600 md:col-span-3"><CalendarDays className="size-4" />{formatDate(e.event_start, { day: "numeric", month: "long", year: "numeric" })}</span>
                  <span className="font-display text-2xl group-hover:text-moss-600 md:col-span-6">{e.title}</span>
                  <span className="text-sm text-ink-500 md:col-span-3 md:text-right">{e.event_location}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </Container>
    </>
  );
}
