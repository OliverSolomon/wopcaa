"use server";

import { refresh } from "next/cache";
import { query } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { COUNTIES } from "@/lib/report-options";

export async function saveProfile(_: { ok?: boolean; error?: string }, form: FormData): Promise<{ ok?: boolean; error?: string }> {
  const v = await getViewer();
  if (!v) return { error: "Please sign in again." };
  const name = String(form.get("full_name") ?? "").trim().slice(0, 120);
  const county = String(form.get("county") ?? "");
  if (!name) return { error: "Enter a name or nickname." };
  await query("update profiles set full_name = $2, county = $3, updated_at = now() where user_id = $1", [v.id, name, COUNTIES.includes(county) ? county : null]);
  refresh();
  return { ok: true };
}
