import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/session";
import { one } from "@/lib/db";
import { PostEditor, type PostDraft } from "@/components/studio/post-editor";

export const metadata = { title: "Edit post · Studio" };

export default async function EditPost({ params }: PageProps<"/admin/studio/posts/[id]">) {
  const v = await requireStaff();
  const { id } = await params;
  if (id === "new") {
    return <PostEditor id={null} status="draft" initial={{ title: "", slug: "", kind: "article", excerpt: "", body: "", cover_image: "", author: v.name, category: "", event_start: "", event_location: "", published_at: "" }} />;
  }
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const p = await one<PostDraft & { status: "draft" | "published" }>(
    `select title, slug, kind, coalesce(excerpt,'') excerpt, body, coalesce(cover_image,'') cover_image, coalesce(author,'') author, coalesce(category,'') category,
       coalesce(to_char(event_start at time zone 'Africa/Nairobi', 'YYYY-MM-DD"T"HH24:MI'),'') event_start, coalesce(event_location,'') event_location,
       coalesce(to_char(published_at at time zone 'Africa/Nairobi', 'YYYY-MM-DD'),'') published_at, status from posts where id = $1`,
    [id],
  );
  if (!p) notFound();
  const { status, ...initial } = p;
  return <PostEditor id={id} status={status} initial={initial} />;
}
