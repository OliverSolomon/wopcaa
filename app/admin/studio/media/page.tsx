import { requireStaff } from "@/lib/session";
import { query } from "@/lib/db";
import { PageTitle } from "@/components/dash/ui";
import { MediaLibrary } from "@/components/studio/media-library";

export const metadata = { title: "Media · Studio" };

export default async function Media() {
  await requireStaff();
  const items = await query<{ id: string; url: string; alt: string | null; mime_type: string | null; size_bytes: number | null }>(
    "select id, url, alt, mime_type, size_bytes from media order by created_at desc limit 500",
  );
  return (
    <>
      <PageTitle title="Media" sub="Images used across the website. Add alt text so everyone can understand them." />
      <MediaLibrary items={items} />
    </>
  );
}
