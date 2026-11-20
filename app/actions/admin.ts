"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { one, query } from "@/lib/db";
import { audit, requireCaseTeam, getViewer } from "@/lib/session";
import { addUpdate, notifyUser } from "@/lib/reports";
import { statusLabel, urgencyLabel } from "@/lib/report-options";

type Result = { ok: boolean; error?: string };

const patchSchema = z.object({
  status: z.enum(["new", "in_review", "referred", "resolved", "closed"]).optional(),
  urgency: z.enum(["low", "normal", "high", "critical"]).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
});

export async function updateReport(id: string, patch: z.infer<typeof patchSchema>): Promise<Result> {
  const v = await requireCaseTeam();
  const p = patchSchema.safeParse(patch);
  if (!p.success) return { ok: false, error: "Invalid change." };
  const before = await one<{ status: string; urgency: string; assigned_to: string | null; reporter_user_id: string | null; reference_code: string }>(
    "select status, urgency, assigned_to, reporter_user_id, reference_code from reports where id = $1", [id],
  );
  if (!before) return { ok: false, error: "Report not found." };

  const { status, urgency, assigned_to } = p.data;
  if (status && status !== before.status) {
    await query("update reports set status = $2, resolved_at = case when $2 in ('resolved','closed') then now() else null end, updated_at = now() where id = $1", [id, status]);
    await addUpdate(id, v.id, "system", "status", `Status changed to ${statusLabel(status)}`);
    if (before.reporter_user_id) await notifyUser(before.reporter_user_id, `Update on ${before.reference_code}`, `Status: ${statusLabel(status)}`, `/account/reports/${id}`);
  }
  if (urgency && urgency !== before.urgency) {
    await query("update reports set urgency = $2, updated_at = now() where id = $1", [id, urgency]);
    await addUpdate(id, v.id, "admin", "note", `Urgency set to ${urgencyLabel(urgency)}`);
  }
  if (assigned_to !== undefined && assigned_to !== before.assigned_to) {
    await query("update reports set assigned_to = $2, updated_at = now() where id = $1", [id, assigned_to]);
    const who = assigned_to ? await one<{ name: string }>(`select coalesce(p.full_name, u.name, u.email) as name from neon_auth."user" u left join profiles p on p.user_id = u.id where u.id = $1`, [assigned_to]) : null;
    await addUpdate(id, v.id, "admin", "assignment", assigned_to ? `Assigned to ${who?.name ?? "a case worker"}` : "Unassigned");
    if (assigned_to && assigned_to !== v.id) await notifyUser(assigned_to, `${before.reference_code} assigned to you`, "A report needs your attention.", `/admin/reports/${id}`);
  }
  await audit(v.id, "report.update", id, p.data);
  refresh();
  return { ok: true };
}

export async function postUpdate(id: string, body: string, internal: boolean): Promise<Result> {
  const v = await requireCaseTeam();
  const text = body.trim();
  if (text.length < 2 || text.length > 4000) return { ok: false, error: "Write between 2 and 4000 characters." };
  const r = await one<{ reporter_user_id: string | null; reference_code: string }>("select reporter_user_id, reference_code from reports where id = $1", [id]);
  if (!r) return { ok: false, error: "Report not found." };
  await addUpdate(id, v.id, "admin", internal ? "note" : "message", text);
  if (!internal && r.reporter_user_id) await notifyUser(r.reporter_user_id, `New message on ${r.reference_code}`, "The case team sent you a message.", `/account/reports/${id}`);
  // Moving a new report forward when someone first replies to it.
  if (!internal) await query("update reports set status = 'in_review' where id = $1 and status = 'new'", [id]);
  await audit(v.id, internal ? "report.note" : "report.message", id);
  refresh();
  return { ok: true };
}

export async function markEnquiry(id: string, handled: boolean): Promise<Result> {
  const v = await requireCaseTeam();
  await query("update enquiries set handled_at = case when $2 then now() else null end where id = $1", [id, handled]);
  await audit(v.id, "enquiry.mark", id, { handled });
  refresh();
  return { ok: true };
}

export async function setRole(userId: string, role: "reporter" | "editor" | "admin" | "super_admin"): Promise<Result> {
  const v = await getViewer();
  if (!v || v.role !== "super_admin") return { ok: false, error: "Only a super admin can change roles." };
  if (userId === v.id) return { ok: false, error: "You cannot change your own role." };
  if (!["reporter", "editor", "admin", "super_admin"].includes(role)) return { ok: false, error: "Unknown role." };
  await query(
    `insert into profiles(user_id, role) values ($1,$2) on conflict (user_id) do update set role = $2, updated_at = now()`,
    [userId, role],
  );
  await audit(v.id, "people.role", userId, { role });
  refresh();
  return { ok: true };
}
