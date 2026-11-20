import { randomBytes } from "node:crypto";
import { z } from "zod";
import { BUCKETS, checkFile, publicUrl, signUpload, storageConfigured } from "@/lib/storage";
import { getViewer, isStaff } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { query } from "@/lib/db";

const body = z.object({ bucket: z.enum(["media", "evidence"]), name: z.string().min(1).max(200), type: z.string().min(3).max(100), size: z.number().int().positive() });

const safeName = (n: string) => n.normalize("NFKD").replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").slice(-100) || "file";

/**
 * Hands the browser a signed URL to PUT one file straight to Neon storage.
 *  media:    staff only, public bucket, recorded in the media library
 *  evidence: anyone filing a report (rate limited), private bucket, under pending/
 */
export async function POST(req: Request) {
  if (!storageConfigured()) return Response.json({ error: "File storage is not configured." }, { status: 503 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const { bucket, name, type, size } = parsed.data;
  const problem = checkFile(bucket, type, size);
  if (problem) return Response.json({ error: problem }, { status: 400 });

  if (bucket === "media") {
    const viewer = await getViewer();
    if (!viewer || !isStaff(viewer.role)) return Response.json({ error: "Not allowed." }, { status: 403 });
    const key = `${new Date().toISOString().slice(0, 7)}/${randomBytes(6).toString("hex")}-${safeName(name)}`;
    const signed = await signUpload(bucket, key, type, size);
    const url = publicUrl(bucket, key);
    await query("insert into media(url, object_key, alt, mime_type, size_bytes, created_by) values ($1,$2,$3,$4,$5,$6)", [url, key, name.replace(/\.[^.]+$/, ""), type, size, viewer.id]);
    return Response.json({ ...signed, key, publicUrl: url });
  }

  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown").trim();
  const limit = await rateLimit(`evidence:${ip}`, 3600, 20);
  if (!limit.ok) return Response.json({ error: "Too many uploads. Please wait a little." }, { status: 429 });
  const key = `pending/${randomBytes(12).toString("base64url")}/${safeName(name)}`;
  const signed = await signUpload(bucket, key, type, size);
  return Response.json({ ...signed, key, maxMb: BUCKETS.evidence.maxMb });
}
