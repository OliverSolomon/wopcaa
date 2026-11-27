import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone, Plus, ShieldCheck } from "lucide-react";
import type { Link as LinkT, Section, SiteSettings } from "@/lib/content/schema";
import { renderMarkdown } from "@/lib/content/markdown";
import { getPosts } from "@/lib/content/queries";
import { formatDate, cn } from "@/lib/utils";
import { HorizontalScroller, HeroIn, ParallaxImage } from "@/components/motion/motion";
import { LazyScene } from "@/components/three/lazy-scene";
import { Motif } from "@/components/motifs/motifs";
import { IslandFacts, type Fact } from "@/components/doodles/island-facts";
import { Cloud, PlantingScene } from "@/components/doodles/kajiado";
import { ContactForm, MembershipForm } from "@/components/site/forms";
import { HeroFrame, Figure } from "./hero-frame";
import { Story, type Scene } from "@/components/story/story";
import { CountyPicker } from "@/components/story/county-picker";
import { Button, Container, SectionHead } from "./parts";

/* eslint-disable @typescript-eslint/no-explicit-any */
type S<T> = Section & T;
const s = (v: unknown) => (typeof v === "string" ? v : "");
const list = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
const plain = (v: unknown) => s(v).replace(/\*/g, "");

/* ───────────── Hero: words on the left, real photos on the right, a soft field behind ───────────── */
export function HeroMedia({ data }: { data: S<{ title?: string; subtitle?: string; primary?: LinkT; secondary?: LinkT; images?: unknown }> }) {
  return (
    <section className="relative isolate overflow-hidden pb-16 pt-28 md:pb-24 md:pt-36">
      <LazyScene variant="field" light className="absolute inset-0 -z-10 opacity-70 [mask-image:linear-gradient(90deg,transparent_30%,black_70%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-mist to-transparent" />
      <Container className="grid items-center gap-12 lg:grid-cols-12">
        <HeroIn className="lg:col-span-6">
          <h1 className="t-hero max-w-[16ch]">{plain(data.title)}</h1>
          <p className="t-lead mt-6 max-w-[46ch]">{data.subtitle}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button link={data.primary} />
            <Button link={data.secondary} variant="safety" />
          </div>
        </HeroIn>
        <div className="lg:col-span-6 lg:pl-6">
          <HeroFrame images={list(data.images)} />
        </div>
      </Container>
    </section>
  );
}

/* Kept for pages built before the redesign: the globe on its own. */
export function Hero3D({ data }: { data: S<{ title?: string; subtitle?: string; primary?: LinkT; secondary?: LinkT }> }) {
  return (
    <section className="relative isolate overflow-hidden bg-forest pb-20 pt-36 text-mist">
      <LazyScene variant="globe" className="absolute inset-y-0 right-0 -z-10 w-full lg:w-3/5" />
      <Container>
        <h1 className="t-hero max-w-[16ch]">{plain(data.title)}</h1>
        <p className="mt-6 max-w-[46ch] text-xl text-mist/80">{data.subtitle}</p>
        <div className="mt-9 flex flex-wrap gap-3"><Button link={data.primary} variant="onDark" /><Button link={data.secondary} variant="safety" /></div>
      </Container>
    </section>
  );
}

/* ───────────── Inner page header ───────────── */
export function PageHeader({ data }: { data: S<{ title?: string; intro?: string; image?: string }> }) {
  return (
    <section className="pt-10 md:pt-40">
      <Container>
        <HeroIn>
          <h1 className="t-h1 max-w-[20ch]">{plain(data.title)}</h1>
          {data.intro ? <p className="t-lead mt-6 max-w-[56ch]">{data.intro}</p> : null}
        </HeroIn>
      </Container>
      {data.image ? (
        <Container className="mt-12 md:mt-16">
          <ParallaxImage src={data.image} priority className="arch-tr aspect-[4/3] md:aspect-[21/9]" strength={14} />
        </Container>
      ) : null}
    </section>
  );
}

/* ───────────── Bento: the work, each card drawn from the emblem ───────────── */
type Card = { title: string; body: string; motif?: "peace" | "justice" | "climate" | "photo"; image?: string; tags?: string; href?: string };

function BentoCard({ c, wide }: { c: Card; wide: boolean }) {
  const photo = c.motif === "photo";
  const inner = (
    <article className={cn(
      "group relative flex h-full min-h-[420px] overflow-hidden rounded-[20px] border",
      photo ? "border-forest bg-forest text-mist" : c.motif === "justice" ? "border-line bg-mist-deep" : "border-line bg-white",
      wide ? "flex-col md:flex-row" : "flex-col",
    )}>
      {!photo ? (
        <div className={cn("relative overflow-hidden", wide ? "order-2 h-60 md:order-none md:h-auto md:w-[55%]" : "h-60")}>
          <Motif kind={(c.motif as "peace" | "justice" | "climate") ?? "climate"} className="absolute inset-0 size-full" />
        </div>
      ) : null}
      <div className={cn("relative z-10 flex flex-1 flex-col p-7 md:p-8", wide && !photo && "md:order-first")}>
        <h3 className="t-h3">{c.title}</h3>
        <p className={cn("mt-3 max-w-[48ch] text-[1rem] leading-relaxed", photo ? "text-mist/80" : "text-slate")}>{c.body}</p>
        {c.tags ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {c.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
              <li key={t} className={cn("rounded-full border px-3 py-1 text-sm", photo ? "border-mist/25" : "border-line bg-white/60")}>{t}</li>
            ))}
          </ul>
        ) : null}
        {c.href ? <span className={cn("mt-auto pt-8 text-[1rem] font-semibold underline decoration-1 underline-offset-4", photo ? "text-leaf" : "text-green")}>Read more</span> : null}
      </div>
      {photo && c.image ? (
        <div className="relative min-h-56 md:w-[42%]">
          <Image src={c.image} alt="" fill sizes="(min-width:768px) 30vw, 100vw" className="object-cover" />
        </div>
      ) : null}
    </article>
  );
  return c.href ? <Link href={c.href} className="block h-full rounded-[20px]">{inner}</Link> : inner;
}

export function Bento({ data }: { data: S<{ heading?: string; intro?: string; items?: unknown }> }) {
  const items = list<Card>(data.items);
  // Wide, narrow / narrow, wide: a rhythm rather than identical tiles.
  const spans = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"];
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="t-h2 md:col-span-6">{data.heading}</h2>
          {data.intro ? <p className="text-lg leading-relaxed text-slate md:col-span-5 md:col-start-8">{data.intro}</p> : null}
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-12">
          {items.map((c, i) => (
            <div key={i} className={spans[i % 4]}>
              <BentoCard c={c} wide={spans[i % 4] === "md:col-span-7"} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ───────────── Why it matters: sourced facts pinned to the places they happen ───────────── */
export function Impact({ data }: { data: S<{ heading?: string; intro?: string; items?: unknown; source?: string }> }) {
  const facts = list<Fact>(data.items).map((f) => ({ ...f, source: f.source || s(data.source) || undefined }));
  return <IslandFacts heading={data.heading} intro={data.intro} facts={facts} />;
}

/* ───────────── Get involved, with women planting an acacia ───────────── */
export function Involve({ data }: { data: S<{ heading?: string; body?: string; primary?: LinkT; secondary?: LinkT }> }) {
  return (
    <section className="px-3 py-3 md:px-5">
      <div className="haze relative overflow-hidden rounded-[28px]">
        <Cloud className="pointer-events-none absolute left-[38%] top-8 w-28 opacity-90 [animation:cloudDrift_16s_ease-in-out_infinite_alternate] motion-reduce:[animation:none]" />
        <Container className="grid items-center gap-8 py-14 md:grid-cols-12 md:py-16">
          <div className="md:col-span-6">
            <PlantingScene className="mx-auto w-full max-w-[520px]" />
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <h2 className="t-h2">{data.heading}</h2>
            {data.body ? <p className="mt-4 text-lg text-slate">{data.body}</p> : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button link={data.primary} />
              <Button link={data.secondary} variant="outline" />
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

/* ───────────── Photo pair: two arch-framed photos, offset, with a soft glow behind ───────────── */
export function PhotoPair({ data }: { data: S<{ heading?: string; body?: string; imageA?: string; imageB?: string; link?: LinkT }> }) {
  return (
    <section className="py-20 md:py-28">
      <Container>
        {data.heading ? <h2 className="t-h2 max-w-[24ch]">{data.heading}</h2> : null}
        <div className="relative mt-12 grid gap-8 md:grid-cols-12 md:gap-10">
          <div className="glow-leaf pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[min(90vw,760px)] -translate-x-1/2 -translate-y-1/2" />
          <div className="md:col-span-6">
            <ParallaxImage src={s(data.imageA)} className="arch-tr aspect-[1/1]" sizes="(min-width:768px) 50vw, 100vw" strength={8} />
          </div>
          <div className="flex flex-col md:col-span-6">
            <ParallaxImage src={s(data.imageB)} className="arch-tl aspect-[3/2]" sizes="(min-width:768px) 50vw, 100vw" strength={8} />
            <div className="prose-site mt-8 md:max-w-[46ch]" dangerouslySetInnerHTML={{ __html: renderMarkdown(s(data.body)) }} />
            <div className="mt-6"><Button link={data.link} variant="outline" /></div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ───────────── Statement ───────────── */
export function Statement({ data }: { data: S<{ text?: string; body?: string; link?: LinkT }> }) {
  return (
    <section className="py-20 md:py-28">
      <Container className="grid gap-10 md:grid-cols-12">
        <p className="text-[1.75rem] font-medium leading-snug md:col-span-7 md:text-[2.1rem]">{plain(data.text)}</p>
        <div className="md:col-span-4 md:col-start-9">
          {data.body ? <div className="prose-site" dangerouslySetInnerHTML={{ __html: renderMarkdown(s(data.body)) }} /> : null}
          <div className="mt-8"><Button link={data.link} variant="outline" /></div>
        </div>
      </Container>
    </section>
  );
}

/* ───────────── Pillars (photo cards) ───────────── */
export function Pillars({ data }: { data: S<{ heading?: string; intro?: string; items?: unknown }> }) {
  const items = list<{ title: string; body: string; image: string; href: string }>(data.items);
  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionHead heading={data.heading} intro={data.intro} />
        <div className={cn("mt-12 grid gap-8", items.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
          {items.map((it, i) => {
            const body = (
              <article className="group">
                <div className={cn("relative aspect-[4/3] overflow-hidden bg-mist-deep", i % 2 ? "arch-tl" : "arch-tr")}>
                  {it.image ? <Image src={it.image} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" /> : null}
                </div>
                <h3 className="t-h3 mt-5">{it.title}</h3>
                <p className="mt-2 text-slate">{it.body}</p>
              </article>
            );
            return it.href ? <Link key={i} href={it.href}>{body}</Link> : <div key={i}>{body}</div>;
          })}
        </div>
      </Container>
    </section>
  );
}

/* ───────────── Parallax banner ───────────── */
export function ParallaxBanner({ data }: { data: S<{ image?: string; heading?: string; body?: string; cta?: LinkT }> }) {
  return (
    <section className="px-3 md:px-5">
      <div className="relative isolate overflow-hidden rounded-[24px] text-white">
        <ParallaxImage src={s(data.image)} className="absolute inset-0 -z-10" strength={18} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest/85 via-forest/35 to-transparent" />
        <Container className="flex min-h-[78svh] flex-col justify-end py-16 md:py-20">
          <h2 className="t-h1 max-w-[18ch]">{data.heading}</h2>
          {data.body ? <p className="mt-5 max-w-[48ch] text-lg text-white/85">{data.body}</p> : null}
          <div className="mt-8"><Button link={data.cta} variant="onDark" /></div>
        </Container>
      </div>
    </section>
  );
}

/* ───────────── Figures (light) ───────────── */
export function Stats({ data }: { data: S<{ heading?: string; items?: unknown; source?: string }> }) {
  const items = list<{ value: string; label: string; note?: string }>(data.items);
  if (!items.length) return null;
  return (
    <section className="py-20">
      <Container>
        <SectionHead heading={data.heading} />
        <dl className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <div key={i} className="border-t border-line pt-5">
              <dd className="text-[2.75rem] font-semibold leading-none text-green"><Figure value={it.value} /></dd>
              <dt className="mt-3 font-semibold">{it.label}</dt>
              {it.note ? <dd className="t-meta mt-1">{it.note}</dd> : null}
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

/* ───────────── Horizontal gallery ───────────── */
export function Gallery({ data }: { data: S<{ heading?: string; items?: unknown }> }) {
  const items = list<{ image: string; caption: string; place?: string }>(data.items);
  const intro = "Photos from our work with women and communities in Kajiado.";
  return (
    <section className="py-16 md:py-0">
      {/* Phones: the heading sits above the strip instead of taking up the first slide. */}
      <div className="mb-6 px-5 md:hidden">
        <h2 className="t-h2">{plain(data.heading)}</h2>
        <p className="mt-3 text-slate">{intro} <span className="whitespace-nowrap">Swipe to see more.</span></p>
      </div>
      <HorizontalScroller label={plain(data.heading) || "Photo gallery"} className="md:flex md:h-[100svh] md:flex-col md:justify-center">
        <div data-intro="1" className="hidden w-[28vw] shrink-0 flex-col justify-center pr-4 md:flex">
          <h2 className="t-h2">{plain(data.heading)}</h2>
          <p className="mt-4 text-slate">{intro}</p>
        </div>
        {items.map((it, i) => (
          <figure key={i} className={cn("w-[84vw] max-w-[420px] shrink-0 md:max-w-none", i % 2 ? "md:mt-20 md:w-[26vw]" : "md:w-[34vw]")}>
            <div className={cn("relative aspect-[4/5] overflow-hidden bg-mist-deep", i % 2 ? "arch-tl md:aspect-[3/4]" : "arch-tr md:aspect-[4/3]")}>
              {it.image ? <Image src={it.image} alt={it.caption ?? ""} fill sizes="(min-width:768px) 35vw, 84vw" className="object-cover" /> : null}
            </div>
            <figcaption className="mt-3"><span className="font-semibold">{it.caption}</span>{it.place ? <span className="t-meta block">{it.place}</span> : null}</figcaption>
          </figure>
        ))}
      </HorizontalScroller>
    </section>
  );
}

/* ───────────── Image + text ───────────── */
export function Split({ data }: { data: S<{ heading?: string; body?: string; image?: string; cta?: LinkT; reverse?: boolean }> }) {
  return (
    <section className="py-20 md:py-28">
      <Container className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
        <div className={cn("md:col-span-6", data.reverse && "md:order-2")}>
          <ParallaxImage src={s(data.image)} className={cn("aspect-[4/5]", data.reverse ? "arch-tl" : "arch-tr")} sizes="(min-width:768px) 50vw, 100vw" />
        </div>
        <div className="md:col-span-6">
          {data.heading ? <h2 className="t-h2">{data.heading}</h2> : null}
          <div className="prose-site mt-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(s(data.body)) }} />
          <div className="mt-8"><Button link={data.cta} /></div>
        </div>
      </Container>
    </section>
  );
}

/* ───────────── Values / objectives: a calm two-column list (no numbers: these are not steps) ───────────── */
export function Values({ data }: { data: S<{ heading?: string; items?: unknown }> }) {
  const items = list<{ title: string; body: string }>(data.items);
  return (
    <section className="py-20 md:py-24">
      <Container className="grid gap-10 md:grid-cols-12">
        <h2 className="t-h2 md:col-span-4">{data.heading}</h2>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 md:col-span-8">
          {items.map((it, i) => (
            <div key={i} className="border-l-2 border-leaf pl-5">
              <h3 className="text-[1.15rem] font-semibold">{it.title}</h3>
              <p className="mt-1.5 text-slate">{it.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ───────────── People ───────────── */
export function Team({ data }: { data: S<{ heading?: string; intro?: string; items?: unknown }> }) {
  const people = list<{ name: string; role: string; photo?: string; bio?: string }>(data.items);
  const initials = (n: string) => n.replace(/^(dr|prof|mr|mrs|ms)\.?\s+/i, "").split(/\s+/).map((p) => p[0]).slice(0, 2).join("");
  return (
    <section className="py-20 md:py-24">
      <Container>
        <SectionHead heading={data.heading} intro={data.intro} />
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p, i) => (
            <li key={i} className="rounded-[20px] border border-line bg-white p-6">
              <div className="flex items-center gap-4">
                <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-leaf-soft text-lg font-semibold text-green">
                  {p.photo ? <Image src={p.photo} alt="" fill sizes="64px" className="object-cover" /> : initials(p.name)}
                </span>
                <span><span className="block text-[1.15rem] font-semibold">{p.name}</span><span className="t-meta">{p.role}</span></span>
              </div>
              {p.bio ? <p className="mt-4 text-slate">{p.bio}</p> : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ───────────── Rich text ───────────── */
export function RichText({ data }: { data: S<{ heading?: string; body?: string; narrow?: boolean }> }) {
  return (
    <section className="py-16 md:py-20">
      <Container className={cn(data.narrow !== false && "max-w-3xl")}>
        {data.heading ? <h2 className="t-h2">{data.heading}</h2> : null}
        <div className="prose-site mt-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(s(data.body)) }} />
      </Container>
    </section>
  );
}

/* ───────────── Timeline (a real sequence, so it is numbered by date) ───────────── */
export function Timeline({ data }: { data: S<{ heading?: string; items?: unknown }> }) {
  const items = list<{ date: string; title: string; body: string }>(data.items);
  return (
    <section className="py-20 md:py-24">
      <Container>
        <SectionHead heading={data.heading} />
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {items.map((it, i) => (
            <li key={i} className="border-t-2 border-green pt-5">
              <p className="font-semibold text-green">{it.date}</p>
              <h3 className="t-h3 mt-2">{it.title}</h3>
              <p className="mt-2 text-slate">{it.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ───────────── Membership tiers ───────────── */
export function Tiers({ data }: { data: S<{ heading?: string; intro?: string; items?: unknown }> }) {
  const items = list<{ name: string; price: string; note?: string; features?: string; cta?: LinkT; featured?: boolean }>(data.items);
  return (
    <section className="py-20 md:py-24">
      <Container>
        <SectionHead heading={data.heading} intro={data.intro} />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {items.map((t, i) => (
            <div key={i} className={cn("flex flex-col rounded-[20px] border p-8", t.featured ? "border-green bg-leaf-soft" : "border-line bg-white")}>
              <h3 className="t-h3">{t.name}</h3>
              <p className="mt-6 text-[2.5rem] font-semibold leading-none">{t.price}</p>
              {t.note ? <p className="t-meta mt-2">{t.note}</p> : null}
              <ul className="mt-7 grid gap-2.5 border-t border-line pt-7">
                {s(t.features).split("\n").filter(Boolean).map((f, j) => <li key={j} className="flex gap-3"><Plus className="mt-1 size-4 shrink-0 text-green" />{f}</li>)}
              </ul>
              <div className="mt-auto pt-8"><Button link={t.cta} variant={t.featured ? "primary" : "outline"} /></div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ───────────── Partners ───────────── */
export function Partners({ data }: { data: S<{ heading?: string; items?: unknown }> }) {
  const items = list<{ name: string; logo: string; href?: string }>(data.items);
  if (!items.length) return null;
  return (
    <section className="py-14">
      <Container className="flex flex-col gap-8 md:flex-row md:items-center md:gap-14">
        <p className="shrink-0 font-semibold text-slate">{data.heading}</p>
        <ul className="flex flex-1 flex-wrap items-center gap-x-14 gap-y-8">
          {items.map((p, i) => {
            const logo = <span className="relative block h-16 w-44 grayscale transition-[filter,opacity] duration-300 hover:grayscale-0 md:h-20 md:w-56" title={p.name}><Image src={p.logo} alt={p.name} fill sizes="(min-width:768px) 224px, 176px" className="object-contain" unoptimized={p.logo.endsWith(".svg")} /></span>;
            return <li key={i} className="opacity-85 hover:opacity-100">{p.href ? <a href={p.href} target="_blank" rel="noopener noreferrer">{logo}</a> : logo}</li>;
          })}
        </ul>
      </Container>
    </section>
  );
}

/* ───────────── Posts ───────────── */
const KIND = { article: "Article", press: "Press release", event: "Event" } as const;
export async function Posts({ data }: { data: S<{ heading?: string; kind?: string; limit?: number }> }) {
  const posts = await getPosts(data.kind || "all", Number(data.limit) || 3);
  if (!posts.length) return null;
  return (
    <section className="py-20 md:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="t-h2">{data.heading}</h2>
          <Link href="/news" className="link font-semibold">All news and articles</Link>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} href={`/news/${p.slug}`} className="group">
              <div className="relative aspect-[3/2] overflow-hidden rounded-[14px] bg-mist-deep">
                {p.cover_image ? <Image src={p.cover_image} alt="" fill sizes="33vw" className="object-cover" /> : null}
              </div>
              <h3 className="mt-4 text-[1.2rem] font-semibold leading-snug underline-offset-4 group-hover:text-green group-hover:underline">{p.title}</h3>
              <p className="t-meta mt-1.5">{KIND[p.kind]}, {formatDate(p.event_start ?? p.published_at)}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ───────────── FAQ ───────────── */
export function Faq({ data }: { data: S<{ heading?: string; items?: unknown }> }) {
  const items = list<{ q: string; a: string }>(data.items);
  return (
    <section className="py-20 md:py-24">
      <Container className="grid gap-10 md:grid-cols-12">
        <h2 className="t-h2 md:col-span-4">{data.heading}</h2>
        <div className="md:col-span-8">
          {items.map((it, i) => (
            <details key={i} className="group border-t border-line py-5 last:border-b">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[1.15rem] font-semibold">
                {it.q}<Plus className="size-5 shrink-0 text-green transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="mt-3 max-w-[60ch] text-slate">{it.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ───────────── Safe reporting band (coral is reserved for this) ───────────── */
export function ReportCta({ data, settings }: { data: S<{ heading?: string; body?: string; showHotlines?: boolean }>; settings: SiteSettings }) {
  return (
    <section className="px-3 py-3 md:px-5">
      <div className="rounded-[24px] bg-coral-soft">
        <Container className="grid gap-10 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-7">
            <ShieldCheck className="size-8 text-coral-ink" strokeWidth={1.6} />
            <h2 className="t-h2 mt-5 max-w-[20ch]">{data.heading}</h2>
            {data.body ? <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-slate">{data.body}</p> : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button link={{ label: "Make a report", href: "/report" }} variant="safety" />
              <Button link={{ label: "Follow up on a report", href: "/track" }} variant="outline" />
            </div>
          </div>
          {data.showHotlines !== false && settings.hotlines.length ? (
            <div className="self-end md:col-span-5">
              <p className="font-semibold">In danger right now? Call</p>
              <ul className="mt-3 divide-y divide-coral/40 border-y border-coral/40">
                {settings.hotlines.map((h) => (
                  <li key={h.number} className="flex items-center justify-between gap-4 py-3.5">
                    <span className="text-slate">{h.label}</span>
                    <a href={`tel:${h.number.replace(/\s/g, "")}`} className="text-2xl font-semibold text-coral-ink hover:underline">{h.number}</a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Container>
      </div>
    </section>
  );
}

/* ───────────── Closing band ───────────── */
export function Cta({ data }: { data: S<{ heading?: string; body?: string; primary?: LinkT; secondary?: LinkT; tone?: string }> }) {
  const dark = data.tone === "forest";
  return (
    <section className="px-3 py-3 md:px-5">
      <div className={cn("rounded-[24px]", dark ? "bg-forest text-mist" : data.tone === "ochre" ? "bg-coral-soft" : "bg-leaf-soft")}>
        <Container className="flex flex-col items-start gap-8 py-16 md:flex-row md:items-end md:justify-between md:py-20">
          <div className="max-w-2xl">
            <h2 className="t-h2">{data.heading}</h2>
            {data.body ? <p className={cn("mt-4 text-lg", dark ? "text-mist/75" : "text-slate")}>{data.body}</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button link={data.primary} variant={dark ? "onDark" : "primary"} />
            <Button link={data.secondary} variant="outline" className={dark ? "border-mist/30 text-mist hover:border-mist" : ""} />
          </div>
        </Container>
      </div>
    </section>
  );
}

/* ───────────── Contact ───────────── */
export function Contact({ data, settings }: { data: S<{ heading?: string; intro?: string }>; settings: SiteSettings }) {
  const rows = [
    settings.email && { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    settings.phone && { icon: Phone, label: "Phone", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    settings.address && { icon: MapPin, label: "Office", value: settings.address },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];
  return (
    <section className="pb-20 pt-32 md:pb-28 md:pt-40">
      <Container className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <h1 className="t-h1">{data.heading}</h1>
          {data.intro ? <p className="t-lead mt-5">{data.intro}</p> : null}
          <ul className="mt-10 grid gap-5">
            {rows.map((r) => (
              <li key={r.label} className="flex items-start gap-4">
                <r.icon className="mt-1 size-5 shrink-0 text-green" strokeWidth={1.8} />
                <span><span className="t-meta block">{r.label}</span>{r.href ? <a href={r.href} className="link">{r.value}</a> : <span className="whitespace-pre-line">{r.value}</span>}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[20px] border border-line bg-white p-6 md:col-span-7 md:p-8"><ContactForm /></div>
      </Container>
    </section>
  );
}

/* ───────────── Membership form ───────────── */
export function FormSection({ data }: { data: S<{ heading?: string; intro?: string }> }) {
  return (
    <section id="apply" className="scroll-mt-24 py-20 md:py-24">
      <Container className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 className="t-h2">{data.heading}</h2>
          {data.intro ? <p className="mt-4 text-lg text-slate">{data.intro}</p> : null}
        </div>
        <div className="rounded-[20px] border border-line bg-white p-6 md:col-span-7 md:p-8"><MembershipForm /></div>
      </Container>
    </section>
  );
}

function StorySection({ data }: { data: S<{ scenes?: unknown; endingLine?: string; primary?: LinkT; secondary?: LinkT }> }) {
  const scenes = list<Scene>(data.scenes).filter((x) => x.image && x.line);
  if (!scenes.length) return null;
  return <Story scenes={scenes} ending={data.endingLine ? { line: data.endingLine, primary: data.primary, secondary: data.secondary } : undefined} />;
}
function CountySection({ data, settings }: { data: S<{ heading?: string; intro?: string }>; settings: SiteSettings }) {
  return <CountyPicker heading={s(data.heading) || "Your county. Your next step."} intro={data.intro} hotlines={settings.hotlines} />;
}

const MAP: Record<string, (p: { data: any; settings: SiteSettings }) => React.ReactNode> = {
  story: StorySection, county: CountySection, photoPair: PhotoPair, involve: Involve,
  heroMedia: HeroMedia, hero3d: Hero3D, pageHeader: PageHeader, bento: Bento, impact: Impact, team: Team,
  statement: Statement, pillars: Pillars, parallaxBanner: ParallaxBanner, stats: Stats, gallery: Gallery, split: Split,
  values: Values, richText: RichText, timeline: Timeline, tiers: Tiers, partners: Partners, posts: Posts, faq: Faq,
  reportCta: ReportCta, cta: Cta, contact: Contact, form: FormSection,
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
