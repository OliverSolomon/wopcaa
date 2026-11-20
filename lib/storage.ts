import "server-only";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Neon Object Storage (S3-compatible). Credentials come from AWS_* in the
 * environment and never reach the browser. Browsers upload with a short-lived
 * signed URL.
 *
 *  media    public read: images used on the website
 *  evidence private: files attached to reports, readable only through a signed link the case team requests
 */
export const BUCKETS = {
  media: { public: true, maxMb: 15, types: /^image\/(png|jpe?g|webp|gif|svg\+xml|avif)$/ },
  evidence: { public: false, maxMb: 20, types: /^(image\/(png|jpe?g|webp|heic)|application\/pdf|audio\/(mpeg|mp4|ogg|webm|wav)|video\/(mp4|webm|quicktime))$/ },
} as const;
export type Bucket = keyof typeof BUCKETS;

let client: S3Client | null = null;
const s3 = () => (client ??= new S3Client({ forcePathStyle: true }));

export const storageConfigured = () => !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ENDPOINT_URL_S3);

export function publicUrl(bucket: Bucket, key: string) {
  const base = (process.env.AWS_ENDPOINT_URL_S3 ?? "").replace(/\/$/, "");
  return `${base}/${bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export function checkFile(bucket: Bucket, type: string, size: number): string | null {
  const b = BUCKETS[bucket];
  if (!b.types.test(type)) return "That file type is not accepted.";
  if (size <= 0 || size > b.maxMb * 1024 * 1024) return `Files must be under ${b.maxMb} MB.`;
  return null;
}

export async function signUpload(bucket: Bucket, key: string, contentType: string, size: number) {
  const cacheControl = BUCKETS[bucket].public ? "public, max-age=31536000, immutable" : "private, no-store";
  const url = await getSignedUrl(
    s3(),
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType, ContentLength: size, CacheControl: cacheControl }),
    { expiresIn: 300, signableHeaders: new Set(["content-type", "cache-control"]) },
  );
  return { url, headers: { "content-type": contentType, "cache-control": cacheControl } };
}

export async function signDownload(bucket: Bucket, key: string, fileName?: string) {
  return getSignedUrl(
    s3(),
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: fileName ? `attachment; filename="${fileName.replace(/[^\w.\- ]/g, "_")}"` : undefined,
    }),
    { expiresIn: 120 },
  );
}

export async function removeObject(bucket: Bucket, key: string) {
  await s3().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
