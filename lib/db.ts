import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Neon over HTTP. One round trip per query, which suits serverless functions.
 * Created on first use so that importing a module during the build does not
 * need DATABASE_URL.
 */
let client: NeonQueryFunction<false, false> | null = null;

export function sql(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set.");
    client = neon(url);
  }
  return client;
}

/** Run a parameterised query written as text ($1, $2 …). */
export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await sql().query(text, params)) as T[];
}

export async function one<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
