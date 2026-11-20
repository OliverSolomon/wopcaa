import "server-only";
import { headers } from "next/headers";
import { one } from "@/lib/db";

/**
 * A rate limit kept in Postgres so it holds across serverless instances. If the
 * database cannot be reached the request is allowed: a limiter that fails
 * closed would lock real people out of a safety service.
 */
export async function rateLimit(key: string, windowSeconds: number, max: number) {
  try {
    const row = await one<{ allowed: boolean; retry_after: number }>(
      "select * from rate_limit_hit($1, $2, $3)",
      [key, windowSeconds, max],
    );
    return { ok: row?.allowed ?? true, retryAfter: row?.retry_after ?? 0 };
  } catch (e) {
    console.error("[rate-limit] unavailable:", (e as Error).message);
    return { ok: true, retryAfter: 0 };
  }
}

export async function requestIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}
