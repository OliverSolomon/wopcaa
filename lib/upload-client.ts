"use client";

/** Ask the server for a signed URL, then PUT the file straight to storage. */
export async function uploadFile(file: File, bucket: "media" | "evidence") {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bucket, name: file.name, type: file.type || "application/octet-stream", size: file.size }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Upload failed.");
  const put = await fetch(data.url, { method: "PUT", headers: data.headers, body: file });
  if (!put.ok) throw new Error("Upload failed. Please try again.");
  return { key: data.key as string, publicUrl: data.publicUrl as string | undefined };
}
