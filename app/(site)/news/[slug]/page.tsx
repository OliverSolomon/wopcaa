import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { getPost, getPostSlugs } from "@/lib/content/queries";
import { renderMarkdown } from "@/lib/content/markdown";
import { formatDate } from "@/lib/utils";
import { Container } from "@/components/sections/parts";
import { ParallaxImage, RevealText } from "@/components/motion/motion";

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return (slugs.length ? slugs : ["welcome"]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt ?? undefined, openGraph: post.cover_image ? { images: [post.cover_image] } : undefined } : {};
}

const LABEL = { article: "Article", press: "Press release", event: "Event" } as const;

export default async function PostPage({ params }: PageProps<"/news/[slug]">) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return (
    <article className="pb-28">
      <Container className="max-w-4xl pt-36 md:pt-44">
        <Link href="/news" className="kicker inline-flex items-center gap-2 text-ink-500 hover:text-ink-900"><ArrowLeft className="size-3.5" /> All stories</Link>
        <p className="kicker mt-10 text-ochre-600">{LABEL[post.kind]}{post.category ? ` · ${post.category}` : ""}</p>
        <RevealText as="h1" text={post.title} className="display mt-5 text-[2.6rem] md:text-[4.6rem]" />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
          {post.author ? <span>By {post.author}</span> : null}
          <span>{formatDate(post.published_at, { day: "numeric", month: "long", year: "numeric" })}</span>
          {post.kind === "event" && post.event_start ? <span className="flex items-center gap-1.5"><CalendarDays className="size-4" />{formatDate(post.event_start, { weekday: "short", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" })}</span> : null}
          {post.event_location ? <span className="flex items-center gap-1.5"><MapPin className="size-4" />{post.event_location}</span> : null}
        </div>
      </Container>
      {post.cover_image ? (
        <Container className="mt-14">
          <ParallaxImage src={post.cover_image} priority className="aspect-[16/9] rounded-[28px]" strength={18} />
        </Container>
      ) : null}
      <Container className="mt-16 max-w-3xl">
        {post.excerpt ? <p className="font-display text-[1.6rem] leading-snug text-ink-900">{post.excerpt}</p> : null}
        <div className="prose-site mt-10" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
      </Container>
    </article>
  );
}
