import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { getPost, getPostSlugs } from "@/lib/content/queries";
import { renderMarkdown } from "@/lib/content/markdown";
import { formatDate } from "@/lib/utils";
import { Container } from "@/components/sections/parts";
import { ParallaxImage } from "@/components/motion/motion";

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return (slugs.length ? slugs : ["welcome"]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt ?? undefined, openGraph: post.cover_image ? { images: [post.cover_image] } : undefined } : {};
}

const KIND = { article: "Article", press: "Press release", event: "Event" } as const;

export default async function PostPage({ params }: PageProps<"/news/[slug]">) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return (
    <article className="pb-24">
      <Container className="max-w-3xl pt-28 md:pt-36">
        <Link href="/news" className="link text-sm">All news and articles</Link>
        <p className="t-meta mt-8">{KIND[post.kind]}{post.category && post.category !== KIND[post.kind] ? `, ${post.category}` : ""}</p>
        <h1 className="t-h1 mt-2">{post.title}</h1>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-slate">
          {post.author ? <span>By {post.author}</span> : null}
          <span>{formatDate(post.published_at, { day: "numeric", month: "long", year: "numeric" })}</span>
          {post.kind === "event" && post.event_start ? <span className="flex items-center gap-1.5"><CalendarDays className="size-4" />{formatDate(post.event_start, { weekday: "short", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" })}</span> : null}
          {post.event_location ? <span className="flex items-center gap-1.5"><MapPin className="size-4" />{post.event_location}</span> : null}
        </div>
      </Container>
      {post.cover_image ? (
        <Container className="mt-10 max-w-5xl">
          <ParallaxImage src={post.cover_image} priority className="aspect-[16/9] rounded-[20px]" strength={10} />
        </Container>
      ) : null}
      <Container className="mt-12 max-w-3xl">
        {post.excerpt ? <p className="t-lead text-forest">{post.excerpt}</p> : null}
        <div className="prose-site mt-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
      </Container>
    </article>
  );
}
