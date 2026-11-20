"use server";

import { randomBytes } from "node:crypto";
import { refresh } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { one, query } from "@/lib/db";
import { audit, getViewer, type Role } from "@/lib/session";

/**
 * People management, for super admins only.
 *
 * Accounts live in Neon Auth, so creating, suspending, resetting and removing
 * go through its admin endpoints. Those endpoints accept only callers whose Neon
 * Auth role is "admin", so that role is given to super admins alone (see
 * syncAuthRole); admins and editors get their powers from profiles.role, which
 * this app checks on the server.
 */
type Result<T = { password: string }> = { ok: boolean; error?: string; data?: T };

/** The Better Auth admin endpoints exposed by the Neon server SDK, typed for the calls used here. */
type Res = Promise<{ data?: { user?: { id: string } } | null; error?: { message?: string } | null }>;
interface AdminApi {
  createUser(b: { email: string; password: string; name: string; role?: string }): Res;
  banUser(b: { userId: string; banReason?: string }): Res;
  unbanUser(b: { userId: string }): Res;
  setUserPassword(b: { userId: string; newPassword: string }): Res;
  removeUser(b: { userId: string }): Res;
}
const admin = () => (auth as unknown as { admin: AdminApi }).admin;
const ROLES = ["reporter", "editor", "admin", "super_admin"] as const;

async function superAdmin() {
  const v = await getViewer();
  if (!v || v.role !== "super_admin") throw new Error("Only a super admin can manage people.");
  return v;
}

const tempPassword = () => `${randomBytes(9).toString("base64url")}-${randomBytes(3).toString("hex")}`;

/** Neon Auth's own role follows ours: "admin" for super admins, "user" for everyone else. */
export async function syncAuthRole(userId: string, role: Role) {
  await query(`update neon_auth."user" set role = $2, "updatedAt" = now() where id = $1`, [userId, role === "super_admin" ? "admin" : "user"]);
}

async function guardTarget(actorId: string, userId: string, action: string): Promise<string | null> {
  if (userId === actorId) return `You cannot ${action} your own account.`;
  const target = await one<{ role: Role }>("select role from profiles where user_id = $1", [userId]);
  if (target?.role === "super_admin") {
    const n = await one<{ n: number }>("select count(*)::int n from profiles where role = 'super_admin'");
    if ((n?.n ?? 0) <= 1) return "This is the last super admin. Make someone else a super admin first.";
  }
  return null;
}

const createSchema = z.object({
  name: z.string().trim().min(2, "Enter a name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  role: z.enum(ROLES),
});

export async function createPerson(input: z.infer<typeof createSchema>): Promise<Result> {
  let v;
  try { v = await superAdmin(); } catch (e) { return { ok: false, error: (e as Error).message }; }
  const p = createSchema.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0].message };
  if (await one(`select 1 from neon_auth."user" where lower(email) = $1`, [p.data.email])) return { ok: false, error: "Someone already has an account with that email." };

  const password = tempPassword();
  const res = await admin().createUser({ email: p.data.email, password, name: p.data.name, role: p.data.role === "super_admin" ? "admin" : "user" });
  const created = (res as { data?: { user?: { id: string } }; error?: { message?: string } | null });
  if (created.error || !created.data?.user?.id) return { ok: false, error: created.error?.message ?? "The account could not be created." };
  const id = created.data.user.id;
  await query(
    `insert into profiles(user_id, role, full_name) values ($1,$2,$3) on conflict (user_id) do update set role = $2, full_name = $3, updated_at = now()`,
    [id, p.data.role, p.data.name],
  );
  await audit(v.id, "people.create", id, { role: p.data.role });
  refresh();
  return { ok: true, data: { password } };
}

export async function changeRole(userId: string, role: Role): Promise<Result> {
  let v;
  try { v = await superAdmin(); } catch (e) { return { ok: false, error: (e as Error).message }; }
  if (!ROLES.includes(role)) return { ok: false, error: "Unknown role." };
  const blocked = await guardTarget(v.id, userId, "change the role of");
  if (blocked && role !== "super_admin") return { ok: false, error: blocked };
  await query(`insert into profiles(user_id, role) values ($1,$2) on conflict (user_id) do update set role = $2, updated_at = now()`, [userId, role]);
  await syncAuthRole(userId, role);
  await audit(v.id, "people.role", userId, { role });
  refresh();
  return { ok: true };
}

export async function suspendPerson(userId: string, reason: string): Promise<Result> {
  let v;
  try { v = await superAdmin(); } catch (e) { return { ok: false, error: (e as Error).message }; }
  const blocked = await guardTarget(v.id, userId, "suspend");
  if (blocked) return { ok: false, error: blocked };
  const res = (await admin().banUser({ userId, banReason: reason.trim().slice(0, 300) || "Suspended by a super admin" })) as { error?: { message?: string } | null };
  if (res.error) return { ok: false, error: res.error.message ?? "Could not suspend this account." };
  await audit(v.id, "people.suspend", userId, { reason });
  refresh();
  return { ok: true };
}

export async function restorePerson(userId: string): Promise<Result> {
  let v;
  try { v = await superAdmin(); } catch (e) { return { ok: false, error: (e as Error).message }; }
  const res = (await admin().unbanUser({ userId })) as { error?: { message?: string } | null };
  if (res.error) return { ok: false, error: res.error.message ?? "Could not restore this account." };
  await audit(v.id, "people.restore", userId);
  refresh();
  return { ok: true };
}

export async function resetPassword(userId: string): Promise<Result> {
  let v;
  try { v = await superAdmin(); } catch (e) { return { ok: false, error: (e as Error).message }; }
  if (userId === v.id) return { ok: false, error: "Change your own password from your account instead." };
  const password = tempPassword();
  const res = (await admin().setUserPassword({ userId, newPassword: password })) as { error?: { message?: string } | null };
  if (res.error) return { ok: false, error: res.error.message ?? "Could not reset the password." };
  await audit(v.id, "people.reset_password", userId);
  return { ok: true, data: { password } };
}

export async function removePerson(userId: string): Promise<Result> {
  let v;
  try { v = await superAdmin(); } catch (e) { return { ok: false, error: (e as Error).message }; }
  const blocked = await guardTarget(v.id, userId, "remove");
  if (blocked) return { ok: false, error: blocked };
  // Reports they made stay with the case team (reporter_user_id becomes empty), so no case is lost.
  const res = (await admin().removeUser({ userId })) as { error?: { message?: string } | null };
  if (res.error) return { ok: false, error: res.error.message ?? "Could not remove this account." };
  await audit(v.id, "people.remove", userId);
  refresh();
  return { ok: true };
}
