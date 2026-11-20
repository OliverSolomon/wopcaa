import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { one, query } from "@/lib/db";

export type Role = "reporter" | "editor" | "admin" | "super_admin";

export interface Viewer {
  id: string;
  email: string;
  name: string;
  role: Role;
}

const STAFF: Role[] = ["editor", "admin", "super_admin"];
const CASE_TEAM: Role[] = ["admin", "super_admin"];

export const isStaff = (r: Role) => STAFF.includes(r);
export const isCaseTeam = (r: Role) => CASE_TEAM.includes(r);

/** Emails listed in ADMIN_EMAILS become super admins the first time they sign in. */
function bootstrapRole(email: string): Role {
  const list = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.toLowerCase()) ? "super_admin" : "reporter";
}

/**
 * The signed-in person, or null. Reads the session cookie, so callers must sit
 * behind a Suspense boundary (a loading.tsx counts). A profile row is created on
 * first sight so every account has a role.
 */
export async function getViewer(): Promise<Viewer | null> {
  const { data: session } = await auth.getSession();
  const user = session?.user;
  if (!user) return null;
  let profile = await one<{ role: Role; full_name: string | null }>(
    "select role, full_name from profiles where user_id = $1",
    [user.id],
  );
  if (!profile) {
    profile = await one<{ role: Role; full_name: string | null }>(
      `insert into profiles(user_id, role, full_name) values ($1, $2, $3)
       on conflict (user_id) do update set updated_at = now()
       returning role, full_name`,
      [user.id, bootstrapRole(user.email), user.name || null],
    );
  }
  return {
    id: user.id,
    email: user.email,
    name: profile?.full_name || user.name || user.email.split("@")[0],
    role: profile?.role ?? "reporter",
  };
}

export async function requireUser(next = "/account"): Promise<Viewer> {
  const v = await getViewer();
  if (!v) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return v;
}

/** Editors and above: the content studio. */
export async function requireStaff(): Promise<Viewer> {
  const v = await requireUser("/admin");
  if (!isStaff(v.role)) redirect("/account");
  return v;
}

/** Admins and super admins: reports and people. */
export async function requireCaseTeam(): Promise<Viewer> {
  const v = await requireUser("/admin");
  if (!isCaseTeam(v.role)) redirect(isStaff(v.role) ? "/admin/studio" : "/account");
  return v;
}

export async function audit(actorId: string | null, action: string, target?: string, meta: Record<string, unknown> = {}) {
  try {
    await query("insert into audit_log(actor_id, action, target, meta) values ($1,$2,$3,$4)", [actorId, action, target ?? null, JSON.stringify(meta)]);
  } catch (e) {
    console.error("[audit]", (e as Error).message);
  }
}
