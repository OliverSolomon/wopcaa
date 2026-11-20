import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone, ShieldCheck, Plus } from "lucide-react";
import type { Link as LinkT, Section, SiteSettings } from "@/lib/content/schema";
import { emphasise, renderMarkdown } from "@/lib/content/markdown";
import { getPosts } from "@/lib/content/queries";
import { formatDate, cn } from "@/lib/utils";
import { CountUp, FadeUp, HorizontalScroller, ParallaxImage, RevealText, ScrubText } from "@/components/motion/motion";
import { LazyScene } from "@/components/three/lazy-scene";
import { ContactForm, MembershipForm } from "@/components/site/forms";
import { Button, Container, SectionHead } from "./parts";

/* eslint-disable @typescript-eslint/no-explicit-any */
type S<T> = Section & T;
const s = (v: unknown) => (typeof v === "string" ? v : "");
const list = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
const num = (i: number) => String(i + 1).padStart(2, "0");

/* ───────────── Hero with 3D ───────────── */
export function Hero3D({ data }: { data: S<{ eyebrow?: string; title?: string; subtitle?: string; primary?: LinkT; secondary?: LinkT; variant?: "globe" | "field" }> }) {
  return (
    <section className="on-dark grain relative isolate flex min-h-[100svh] items-end overflow-hidden bg-forest-950 text-sand-50">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_40%,#1f4634_0%,#0a1a14_60%)]" />
      <LazyScene variant={data.variant ?? "globe"} className="absolute inset-0 -z-10" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-forest-950 to-transparent" />
      <Container className="pb-16 pt-40 md:pb-24">
        {data.eyebrow ? <p className="kicker text-sand-300/80">{data.eyebrow}</p> : null}
        <RevealText as="h1" text={s(data.title)} className="display mt-6 max-w-5xl text-[3.2rem] sm:text-[4.5rem] md:text-[6.6rem]" />
        <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
          <FadeUp delay={0.5} className="md:col-span-5">
            <p className="text-[17px] leading-relaxed text-sand-200/80">{data.subtitle}</p>
          </FadeUp>
          <FadeUp delay={0.65} className="flex flex-wrap gap-3 md:col-span-7 md:justify-end">
            <Button link={data.primary} variant="light" />
            <Button link={data.secondary} variant="ochre" />
          </FadeUp>
        </div>
        <div className="kicker mt-16 flex items-center justify-between border-t border-white/10 pt-5 text-sand-300/50">
          <span>Kajiado · Kenya · Africa</span>
          <span className="hidden sm:inline">Move your cursor over the globe</span>
          <span>Scroll ↓</span>
        </div>
      </Container>
    </section>
  );
}

/* ───────────── Inner page header ───────────── */
export function PageHeader({ data }: { data: S<{ kicker?: string; title?: string; intro?: string; image?: string }> }) {
  return (
    <section className="pt-36 md:pt-44">
      <Container>
        {data.kicker ? <p className="kicker text-ink-500">{data.kicker}</p> : null}
        <RevealText as="h1" text={s(data.title)} className="display mt-6 max-w-5xl text-[3rem] md:text-[6rem]" />
        {data.intro ? <FadeUp delay={0.4}><p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-500">{data.intro}</p></FadeUp> : null}
      </Container>
      {data.image ? (
        <Container className="mt-14 md:mt-20">
          <ParallaxImage src={data.image} priority className="aspect-[4/3] rounded-[28px] md:aspect-[21/9]" strength={20} />
        </Container>
      ) : null}
    </section>
  );
}

/* ───────────── Statement ───────────── */
export function Statement({ data }: { data: S<{ kicker?: string; text?: string; body?: string; link?: LinkT }> }) {
  return (
    <section className="py-28 md:py-40">
      <Container className="grid gap-10 md:grid-cols-12">
        <p className="kicker text-ink-500 md:col-span-3">{data.kicker}</p>
        <div className="md:col-span-9">
          <ScrubText text={s(data.text)} className="display text-[2.2rem] leading-[1.08] md:text-[3.8rem]" />
          {data.body ? <div className="prose-site mt-10 max-w-2xl" dangerouslySetInnerHTML={{ __html: renderMarkdown(s(data.body)) }} /> : null}
          <div className="mt-10"><Button link={data.link} variant="ghost" /></div>
        </div>
      </Container>
    </section>
  );
}

/* ───────────── Pillars ───────────── */
export function Pillars({ data }: { data: S<{ kicker?: string; heading?: string; intro?: string; items?: unknown }> }) {
  const items = list<{ title: string; body: string; image: string; href: string }>(data.items);
  return (
    <section className="py-24 md:py-32">
      <Container>
        <SectionHead kicker={data.kicker} heading={data.heading} intro={data.intro} />
        <FadeUp stagger={0.12} className={cn("mt-16 grid gap-6", items.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
          {items.map((it, i) => {
            const Card = (
              <article className="group relative flex h-full flex-col">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-sand-200">
                  {it.image ? <Image src={it.image} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]" /> : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-transparent to-transparent opacity-80" />
                  <span className="kicker absolute left-5 top-5 rounded-full bg-sand-50/90 px-3 py-1.5 text-ink-900 backdrop-blur">{num(i)} / {String(items.length).padStart(2, "0")}</span>
                  {it.href ? <span className="absolute bottom-5 right-5 grid size-11 place-items-center rounded-full bg-sand-50 text-ink-900 transition-transform duration-500 group-hover:rotate-45"><ArrowUpRight className="size-5" /></span> : null}
                </div>
                <h3 className="font-display mt-6 text-[1.75rem] leading-tight tracking-tight">{it.title}</h3>
                <p className="mt-3 text-[15.5px] leading-relaxed text-ink-500">{it.body}</p>
              </article>
            );
            return it.href ? <Link key={i} href={it.href}>{Card}</Link> : <div key={i}>{Card}</div>;
          })}
        </FadeUp>
      </Container>
    </section>
  );
}

/* ───────────── Parallax banner ───────────── */
export function ParallaxBanner({ data }: { data: S<{ image?: string; kicker?: string; heading?: string; body?: string; cta?: LinkT }> }) {
  return (
    <section className="on-dark relative isolate overflow-hidden text-sand-50">
      <ParallaxImage src={s(data.image)} className="absolute inset-0 -z-10" strength={28} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-950/85 via-forest-950/50 to-forest-950/10" />
      <Container className="flex min-h-[88svh] flex-col justify-end py-24">
        {data.kicker ? <p className="kicker text-sand-300/80">{data.kicker}</p> : null}
        <RevealText text={s(data.heading)} className="display mt-6 max-w-4xl text-[2.8rem] md:text-[5.2rem]" />
        {data.body ? <p className="mt-8 max-w-xl text-lg text-sand-200/80">{data.body}</p> : null}
        <div className="mt-10"><Button link={data.cta} variant="light" /></div>
      </Container>
    </section>
  );
}

/* ───────────── Stats ───────────── */
export function Stats({ data }: { data: S<{ kicker?: string; heading?: string; items?: unknown }> }) {
  const items = list<{ value: string; label: string; note?: string }>(data.items);
  return (
    <section className="py-24 md:py-28">
      <Container>
        <SectionHead kicker={data.kicker} heading={data.heading} />
        <div className={cn("grid border-t border-ink-900/10 sm:grid-cols-2", items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3", data.heading ? "mt-14" : "")}>
          {items.map((it, i) => (
            <div key={i} className="border-b border-ink-900/10 py-10 sm:pr-8 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0">
              <CountUp value={it.value} className="display block text-[4rem] text-forest-800 md:text-[5rem]" />
              <p className="mt-3 text-[15px] font-semibold">{it.label}</p>
              {it.note ? <p className="mt-1 text-sm text-ink-400">{it.note}</p> : null}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ───────────── Horizontal gallery ───────────── */
export function Gallery({ data }: { data: S<{ kicker?: string; heading?: string; items?: unknown }> }) {
  const items = list<{ image: string; caption: string; place?: string }>(data.items);
  return (
    <section className="bg-sand-100 py-20 md:py-0">
      <HorizontalScroller counter={items.length} className="md:flex md:h-[100svh] md:flex-col md:justify-center">
        <div className="flex w-[80vw] shrink-0 flex-col justify-center pr-6 md:w-[34vw]">
          <p className="kicker text-ink-500">{data.kicker}</p>
          <h2 className="display mt-5 text-[2.6rem] md:text-[4.4rem]" dangerouslySetInnerHTML={{ __html: emphasise(s(data.heading)) }} />
        </div>
        {items.map((it, i) => (
          <figure key={i} className={cn("shrink-0", i % 2 ? "w-[70vw] md:mt-24 md:w-[30vw]" : "w-[80vw] md:w-[38vw]")}>
            <div className={cn("relative overflow-hidden rounded-[22px] bg-sand-200", i % 2 ? "aspect-[3/4]" : "aspect-[4/3]")}>
              {it.image ? <Image src={it.image} alt={it.caption ?? ""} fill sizes="40vw" className="object-cover" /> : null}
            </div>
            <figcaption className="mt-4 flex items-baseline justify-between gap-4">
              <span className="font-display text-xl">{it.caption}</span>
              <span className="kicker shrink-0 text-ink-400">{it.place}</span>
            </figcaption>
          </figure>
        ))}
      </HorizontalScroller>
    </section>
  );
}

/* ───────────── Image + text ───────────── */
export function Split({ data }: { data: S<{ kicker?: string; heading?: string; body?: string; image?: string; cta?: LinkT; reverse?: boolean }> }) {
  return (
    <section className="py-24 md:py-32">
      <Container className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
        <div className={cn("md:col-span-6", data.reverse && "md:order-2")}>
          <ParallaxImage src={s(data.image)} className="aspect-[4/5] rounded-[28px]" sizes="(min-width:768px) 50vw, 100vw" />
        </div>
        <div className="md:col-span-6 md:px-4">
          {data.kicker ? <p className="kicker text-ink-500">{data.kicker}</p> : null}
          {data.heading ? <RevealText text={s(data.heading)} className="display mt-5 text-[2.4rem] md:text-[3.6rem]" /> : null}
          <FadeUp><div className="prose-site mt-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(s(data.body)) }} /></FadeUp>
          <div className="mt-10"><Button link={data.cta} /></div>
        </div>
      </Container>
    </section>
  );
}

/* ───────────── Numbered list ───────────── */
export function Values({ data }: { data: S<{ kicker?: string; heading?: string; items?: unknown }> }) {
  const items = list<{ title: string; body: string }>(data.items);
  return (
    <section className="py-24 md:py-32">
      <Container className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-32">
            {data.kicker ? <p className="kicker text-ink-500">{data.kicker}</p> : null}
            <RevealText text={s(data.heading)} className="display mt-5 text-[2.6rem] md:text-[3.8rem]" />
          </div>
        </div>
        <FadeUp stagger={0.08} className="md:col-span-8">
          {items.map((it, i) => (
            <div key={i} className="group grid grid-cols-[3.5rem_1fr] gap-4 border-t border-ink-900/10 py-8 transition-colors last:border-b hover:bg-sand-100/60 md:grid-cols-[5rem_1fr_1.2fr] md:gap-8 md:px-4">
              <span className="kicker pt-2 text-ochre-500">{num(i)}</span>
              <h3 className="font-display text-[1.6rem] leading-tight md:text-[1.9rem]">{it.title}</h3>
              <p className="col-start-2 text-[15.5px] leading-relaxed text-ink-500 md:col-start-3 md:pt-1.5">{it.body}</p>
            </div>
          ))}
        </FadeUp>
      </Container>
    </section>
  );
}

/* ───────────── Rich text ───────────── */
export function RichText({ data }: { data: S<{ kicker?: string; heading?: string; body?: string; narrow?: boolean }> }) {
  return (
    <section className="py-20 md:py-24">
      <Container className={cn(data.narrow !== false && "max-w-3xl")}>
        {data.kicker ? <p className="kicker text-ink-500">{data.kicker}</p> : null}
        {data.heading ? <RevealText text={s(data.heading)} className="display mt-5 text-[2.4rem] md:text-[3.4rem]" /> : null}
        <div className="prose-site mt-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(s(data.body)) }} />
      </Container>
    </section>
  );
}

/* ───────────── Timeline ───────────── */
export function Timeline({ data }: { data: S<{ kicker?: string; heading?: string; items?: unknown }> }) {
  const items = list<{ date: string; title: string; body: string }>(data.items);
  return (
    <section className="py-24 md:py-32">
      <Container>
        <SectionHead kicker={data.kicker} heading={data.heading} />
        <FadeUp stagger={0.1} className="relative mt-16 grid gap-10 md:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="relative border-t-2 border-forest-800 pt-6">
              <span className="absolute -top-[7px] left-0 size-3 rounded-full bg-ochre-500 ring-4 ring-sand-50" />
              <p className="kicker text-ochre-600">{it.date}</p>
              <h3 className="font-display mt-3 text-2xl">{it.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-500">{it.body}</p>
            </div>
          ))}
        </FadeUp>
      </Container>
    </section>
  );
}

/* ───────────── Membership tiers ───────────── */
export function Tiers({ data }: { data: S<{ kicker?: string; heading?: string; intro?: string; items?: unknown }> }) {
  const items = list<{ name: string; price: string; note?: string; features?: string; cta?: LinkT; featured?: boolean }>(data.items);
  return (
    <section className="py-24 md:py-32">
      <Container>
        <SectionHead kicker={data.kicker} heading={data.heading} intro={data.intro} />
        <FadeUp stagger={0.12} className="mt-16 grid gap-6 md:grid-cols-2">
          {items.map((t, i) => (
            <div key={i} className={cn("flex flex-col rounded-[28px] p-8 md:p-10", t.featured ? "on-dark bg-forest-900 text-sand-50" : "bg-sand-100")}>
              <p className="kicker opacity-60">{num(i)} · {t.name}</p>
              <p className="display mt-8 text-[3.4rem]">{t.price}</p>
              {t.note ? <p className="mt-2 text-sm opacity-70">{t.note}</p> : null}
              <ul className="mt-8 grid gap-3 border-t border-current/10 pt-8 text-[15px]">
                {s(t.features).split("\n").filter(Boolean).map((f, j) => (
                  <li key={j} className="flex gap-3"><Plus className="mt-1 size-4 shrink-0 text-ochre-500" />{f}</li>
                ))}
              </ul>
              <div className="mt-auto pt-10"><Button link={t.cta} variant={t.featured ? "light" : "primary"} /></div>
            </div>
          ))}
        </FadeUp>
      </Container>
    </section>
  );
}

/* ───────────── Partners marquee ───────────── */
export function Partners({ data }: { data: S<{ kicker?: string; heading?: string; items?: unknown }> }) {
  const items = list<{ name: string; logo: string; href?: string }>(data.items);
  if (!items.length) return null;
  const row = [...items, ...items, ...items, ...items];
  return (
    <section className="border-y border-ink-900/10 py-16">
      <Container className="mb-10 flex items-baseline justify-between gap-6">
        <p className="kicker text-ink-500">{data.kicker || "Partners"}</p>
        <p className="font-display text-xl md:text-2xl">{data.heading}</p>
      </Container>
      <div className="marquee overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="marquee-track flex w-max items-center gap-20">
          {row.map((p, i) => (
            <a key={i} href={p.href || undefined} target="_blank" rel="noopener noreferrer" className="relative block h-16 w-40 opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" title={p.name}>
              {p.logo ? <Image src={p.logo} alt={p.name} fill sizes="160px" className="object-contain" unoptimized={p.logo.endsWith(".svg")} /> : <span className="font-display text-xl">{p.name}</span>}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Posts ───────────── */
export async function Posts({ data }: { data: S<{ kicker?: string; heading?: string; kind?: string; limit?: number }> }) {
  const posts = await getPosts(data.kind || "all", Number(data.limit) || 3);
  if (!posts.length) return null;
  const kindLabel = { article: "Article", press: "Press release", event: "Event" } as const;
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead kicker={data.kicker} heading={data.heading} className="flex-1" />
          <Link href="/news" className="link-underline inline-flex items-center gap-1.5 text-[15px] font-semibold">All stories <ArrowUpRight className="size-4" /></Link>
        </div>
        <FadeUp stagger={0.1} className="mt-14 grid gap-8 md:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} href={`/news/${p.slug}`} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-sand-200">
                {p.cover_image ? <Image src={p.cover_image} alt="" fill sizes="33vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-105" /> : null}
              </div>
              <p className="kicker mt-5 flex gap-3 text-ink-400"><span className="text-ochre-600">{kindLabel[p.kind]}</span>{formatDate(p.event_start ?? p.published_at)}</p>
              <h3 className="font-display mt-3 text-[1.55rem] leading-snug tracking-tight group-hover:text-moss-600">{p.title}</h3>
            </Link>
          ))}
        </FadeUp>
      </Container>
    </section>
  );
}

/* ───────────── FAQ ───────────── */
export function Faq({ data }: { data: S<{ kicker?: string; heading?: string; items?: unknown }> }) {
  const items = list<{ q: string; a: string }>(data.items);
  return (
    <section className="py-24 md:py-32">
      <Container className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          {data.kicker ? <p className="kicker text-ink-500">{data.kicker}</p> : null}
          <RevealText text={s(data.heading)} className="display mt-5 text-[2.6rem] md:text-[3.6rem]" />
        </div>
        <div className="md:col-span-8">
          {items.map((it, i) => (
            <details key={i} className="group border-t border-ink-900/10 py-6 last:border-b">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-[1.4rem]">
                {it.q}
                <Plus className="size-5 shrink-0 transition-transform duration-500 group-open:rotate-45" />
              </summary>
              <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-ink-500">{it.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ───────────── Safe reporting band ───────────── */
export function ReportCta({ data, settings }: { data: S<{ kicker?: string; heading?: string; body?: string; showHotlines?: boolean }>; settings: SiteSettings }) {
  return (
    <section className="px-3 py-3 md:px-5">
      <div className="on-dark grain relative isolate overflow-hidden rounded-[32px] bg-forest-900 text-sand-50">
        <LazyScene variant="field" className="absolute inset-0 -z-10 opacity-80" />
        <Container className="grid gap-12 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-7">
            <p className="kicker flex items-center gap-2 text-sand-300/80"><ShieldCheck className="size-4" /> {data.kicker}</p>
            <RevealText text={s(data.heading)} className="display mt-6 text-[2.6rem] md:text-[4.6rem]" />
            {data.body ? <p className="mt-8 max-w-xl text-lg leading-relaxed text-sand-200/80">{data.body}</p> : null}
            <div className="mt-10 flex flex-wrap gap-3">
              <Button link={{ label: "Make a report", href: "/report" }} variant="ochre" />
              <Button link={{ label: "Track a report", href: "/track" }} variant="ghost" className="text-sand-50" />
            </div>
          </div>
          {data.showHotlines !== false && settings.hotlines.length ? (
            <div className="self-end md:col-span-5">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
                <p className="kicker text-sand-300/70">If you are in danger now, call</p>
                <ul className="mt-4 divide-y divide-white/10">
                  {settings.hotlines.map((h) => (
                    <li key={h.number} className="flex items-center justify-between gap-4 py-3.5">
                      <span className="text-[15px] text-sand-100/85">{h.label}</span>
                      <a href={`tel:${h.number.replace(/\s/g, "")}`} className="font-display text-2xl tracking-tight hover:text-ochre-300">{h.number}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </Container>
      </div>
    </section>
  );
}

/* ───────────── CTA band ───────────── */
export function Cta({ data }: { data: S<{ heading?: string; body?: string; primary?: LinkT; secondary?: LinkT; tone?: string }> }) {
  const tone = data.tone ?? "forest";
  const bg = { forest: "on-dark bg-forest-900 text-sand-50", sand: "bg-sand-200 text-ink-900", ochre: "on-dark bg-ochre-500 text-white" }[tone] ?? "";
  return (
    <section className="px-3 py-3 md:px-5">
      <div className={cn("relative overflow-hidden rounded-[32px]", bg)}>
        <Container className="flex flex-col items-start gap-10 py-20 md:flex-row md:items-end md:justify-between md:py-24">
          <div className="max-w-3xl">
            <RevealText text={s(data.heading)} className="display text-[2.6rem] md:text-[4.4rem]" />
            {data.body ? <p className="mt-6 max-w-xl text-lg opacity-80">{data.body}</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button link={data.primary} variant={tone === "sand" ? "primary" : "light"} />
            <Button link={data.secondary} variant="ghost" />
          </div>
        </Container>
      </div>
    </section>
  );
}

/* ───────────── Contact ───────────── */
export function Contact({ data, settings }: { data: S<{ kicker?: string; heading?: string; intro?: string }>; settings: SiteSettings }) {
  const rows = [
    settings.email && { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    settings.phone && { icon: Phone, label: "Phone", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    settings.address && { icon: MapPin, label: "Visit", value: settings.address },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];
  return (
    <section className="py-24 md:py-32">
      <Container className="grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          {data.kicker ? <p className="kicker text-ink-500">{data.kicker}</p> : null}
          <RevealText text={s(data.heading)} className="display mt-5 text-[2.6rem] md:text-[4rem]" />
          {data.intro ? <p className="mt-6 text-lg text-ink-500">{data.intro}</p> : null}
          <ul className="mt-10 grid gap-3">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center gap-4 rounded-2xl bg-sand-100 p-4">
                <span className="grid size-11 place-items-center rounded-full bg-sand-50"><r.icon className="size-5 text-moss-600" /></span>
                <span><span className="kicker block text-ink-400">{r.label}</span>{r.href ? <a href={r.href} className="link-underline">{r.value}</a> : <span className="whitespace-pre-line">{r.value}</span>}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-7"><ContactForm /></div>
      </Container>
    </section>
  );
}

/* ───────────── Membership form ───────────── */
export function FormSection({ data }: { data: S<{ kicker?: string; heading?: string; intro?: string }> }) {
  return (
    <section id="apply" className="py-24 md:py-32">
      <Container className="grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          {data.kicker ? <p className="kicker text-ink-500">{data.kicker}</p> : null}
          <RevealText text={s(data.heading)} className="display mt-5 text-[2.6rem] md:text-[4rem]" />
          {data.intro ? <p className="mt-6 text-lg text-ink-500">{data.intro}</p> : null}
        </div>
        <div className="md:col-span-7"><MembershipForm /></div>
      </Container>
    </section>
  );
}

const MAP: Record<string, (p: { data: any; settings: SiteSettings }) => React.ReactNode> = {
  hero3d: Hero3D, pageHeader: PageHeader, statement: Statement, pillars: Pillars, parallaxBanner: ParallaxBanner,
  stats: Stats, gallery: Gallery, split: Split, values: Values, richText: RichText, timeline: Timeline, tiers: Tiers,
  partners: Partners, posts: Posts, faq: Faq, reportCta: ReportCta, cta: Cta, contact: Contact, form: FormSection,
};

export function SectionRenderer({ sections, settings }: { sections: Section[]; settings: SiteSettings }) {
  return (
    <>
      {sections.filter((x) => !x.hidden).map((section) => {
        const C = MAP[section.type];
        return C ? <C key={section._key} data={section} settings={settings} /> : null;
      })}
    </>
  );
}
