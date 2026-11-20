"use server";

import { z } from "zod";
import { one, query } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { CATEGORIES, COUNTIES, RELATIONS, SUPPORT } from "@/lib/report-options";
import { accessKey, addUpdate, getThread, hashKey, keyMatches, notifyAdminsOfReport, referenceCode, sealReport } from "@/lib/reports";
import { encryptionConfigured } from "@/lib/crypto";

const ids = <T extends readonly { id: string }[]>(l: T) => l.map((x) => x.id) as [string, ...string[]];

const reportSchema = z.object({
  mode: z.enum(["anonymous", "account"]),
  category: z.enum(ids(CATEGORIES)),
  victim: z.enum(["self", "someone_else"]),
  description: z.string().trim().min(10, "Please describe what happened in a few words (at least 10 characters).").max(8000),
  incident_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  incident_ongoing: z.boolean(),
  county: z.string().refine((c) => c === "" || COUNTIES.includes(c)).optional(),
  location_detail: z.string().trim().max(500).optional(),
  perpetrator_relation: z.enum(ids(RELATIONS)).optional().or(z.literal("")),
  perpetrator_detail: z.string().trim().max(1500).optional(),
  support_needed: z.array(z.enum(ids(SUPPORT))).max(10),
  support_other: z.string().trim().max(500).optional(),
  in_danger: z.boolean(),
  wants_contact: z.boolean(),
  contact_method: z.enum(["phone", "sms", "whatsapp", "email"]).optional().or(z.literal("")),
  contact_value: z.string().trim().max(200).optional(),
  safe_times: z.string().trim().max(200).optional(),
  consent_share: z.boolean(),
  attachments: z.array(z.object({ key: z.string().regex(/^pending\/[A-Za-z0-9_-]{8,40}\/[A-Za-z0-9._-]{1,120}$/), name: z.string().max(200), type: z.string().max(100), size: z.number().int().positive() })).max(6),
});

export type ReportInput = z.infer<typeof reportSchema>;
export type SubmitResult =
  | { ok: true; reference: string; accessKey?: string; id: string; mode: "anonymous" | "account" }
  | { ok: false; error: string };

export async function submitReport(input: ReportInput): Promise<SubmitResult> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.wants_contact && (!d.contact_method || !d.contact_value)) return { ok: false, error: "Tell us how to reach you, or choose not to be contacted." };
  if (!encryptionConfigured()) return { ok: false, error: "Reporting is temporarily unavailable. Please call one of the help lines." };

  const ip = await requestIp();
  const limit = await rateLimit(`report:${ip}`, 3600, 8);
  if (!limit.ok) return { ok: false, error: "Too many reports from this connection. Please wait a little, or call a help line." };

  const viewer = d.mode === "account" ? await getViewer() : null;
  if (d.mode === "account" && !viewer) return { ok: false, error: "Your session ended. Sign in again, or report anonymously." };

  const id = crypto.randomUUID();
  const key = d.mode === "anonymous" ? accessKey() : undefined;
  const urgency = d.in_danger ? "critical" : d.incident_ongoing ? "high" : "normal";
  const sealed = sealReport(id, {
    description: d.description,
    location_detail: d.location_detail || null,
    perpetrator_detail: d.perpetrator_detail || null,
    support_other: d.support_other || null,
    contact_value: d.wants_contact ? d.contact_value : null,
  });

  // A reference code collision is astronomically unlikely, but retry rather than fail.
  let reference = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    reference = referenceCode();
    try {
      await query(
        `insert into reports(id, reference_code, access_key_hash, reporter_user_id, is_anonymous, category, victim, incident_date, incident_ongoing,
           county, description, location_detail, perpetrator_relation, perpetrator_detail, support_needed, support_other, wants_contact,
           contact_method, contact_value, contact_hash, safe_times, urgency, consent_share)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`,
        [
          id, reference, key ? hashKey(key) : null, viewer?.id ?? null, d.mode === "anonymous", d.category, d.victim,
          d.incident_date || null, d.incident_ongoing, d.county || null, sealed.description, sealed.location_detail,
          d.perpetrator_relation || null, sealed.perpetrator_detail, d.support_needed, sealed.support_other, d.wants_contact,
          d.wants_contact ? d.contact_method : null, sealed.contact_value, sealed.contact_hash ?? null, d.wants_contact ? d.safe_times || null : null,
          urgency, d.consent_share,
        ],
      );
      break;
    } catch (e) {
      if (!String((e as Error).message).includes("reports_reference_code_key") || attempt === 3) {
        console.error("[report] insert failed", (e as Error).message);
        return { ok: false, error: "We could not save your report. Please try again, or call a help line." };
      }
    }
  }

  if (d.attachments.length) {
    await query(
      `insert into report_attachments(report_id, object_key, file_name, mime_type, size_bytes)
       select $1, a->>'key', a->>'name', a->>'type', (a->>'size')::int from jsonb_array_elements($2::jsonb) a`,
      [id, JSON.stringify(d.attachments)],
    );
  }
  await addUpdate(id, null, "system", "status", "Report received. A member of the case team will review it.");
  try {
    await notifyAdminsOfReport({ id, reference_code: reference, category: d.category, urgency, county: d.county || null });
  } catch (e) {
    console.error("[report] notify failed", (e as Error).message);
  }
  return { ok: true, reference, accessKey: key, id, mode: d.mode };
}

/* ───────────── Anonymous follow-up ───────────── */

const trackSchema = z.object({ reference: z.string().trim().toUpperCase().regex(/^WP-[A-Z0-9]{4}-[A-Z0-9]{4}$/, "Check the reference: it looks like WP-ABCD-1234."), key: z.string().trim().min(6).max(40) });

async function findAnonymous(reference: string, key: string) {
  const ip = await requestIp();
  const limit = await rateLimit(`track:${ip}`, 900, 20);
  if (!limit.ok) return { error: "Too many attempts. Please wait 15 minutes." } as const;
  const row = await one<{ id: string; access_key_hash: string | null; status: string; category: string; created_at: string; updated_at: string }>(
    "select id, access_key_hash, status, category, created_at, updated_at from reports where reference_code = $1",
    [reference],
  );
  // Same answer whether the code or the key is wrong, so codes cannot be probed.
  if (!row || !keyMatches(key, row.access_key_hash)) return { error: "We could not find a report with that reference and key." } as const;
  return { row } as const;
}

export type TrackResult =
  | { ok: true; reference: string; status: string; category: string; created_at: string; updated_at: string; thread: { id: string; body: string; author_kind: string; kind: string; created_at: string }[] }
  | { ok: false; error: string };

export async function trackReport(reference: string, key: string): Promise<TrackResult> {
  const parsed = trackSchema.safeParse({ reference, key });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const found = await findAnonymous(parsed.data.reference, parsed.data.key);
  if ("error" in found) return { ok: false, error: found.error! };
  const thread = (await getThread(found.row.id, false)).map(({ id, body, author_kind, kind, created_at }) => ({ id, body, author_kind, kind, created_at }));
  return { ok: true, reference: parsed.data.reference, status: found.row.status, category: found.row.category, created_at: found.row.created_at, updated_at: found.row.updated_at, thread };
}

export async function replyAnonymous(reference: string, key: string, body: string): Promise<TrackResult> {
  const parsed = trackSchema.safeParse({ reference, key });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const text = body.trim();
  if (text.length < 2 || text.length > 4000) return { ok: false, error: "Write a message between 2 and 4000 characters." };
  const found = await findAnonymous(parsed.data.reference, parsed.data.key);
  if ("error" in found) return { ok: false, error: found.error! };
  await addUpdate(found.row.id, null, "reporter", "message", text);
  await notifyCaseTeam(found.row.id, parsed.data.reference);
  return trackReport(reference, key);
}

async function notifyCaseTeam(reportId: string, reference: string) {
  const assigned = await one<{ assigned_to: string | null }>("select assigned_to from reports where id = $1", [reportId]);
  const recipients = assigned?.assigned_to
    ? [assigned.assigned_to]
    : (await query<{ user_id: string }>("select user_id from profiles where role in ('admin','super_admin')")).map((r) => r.user_id);
  if (!recipients.length) return;
  await query(
    `insert into notifications(user_id, kind, title, body, link) select x, 'report.reply', $2, 'The reporter sent a new message.', $3 from unnest($1::uuid[]) x`,
    [recipients, `Reply on ${reference}`, `/admin/reports/${reportId}`],
  );
}

/* ───────────── Signed-in reporter ───────────── */

export async function replyAsReporter(reportId: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Please sign in again." };
  const text = body.trim();
  if (text.length < 2 || text.length > 4000) return { ok: false, error: "Write a message between 2 and 4000 characters." };
  const own = await one<{ reference_code: string }>("select reference_code from reports where id = $1 and reporter_user_id = $2", [reportId, viewer.id]);
  if (!own) return { ok: false, error: "Report not found." };
  await addUpdate(reportId, viewer.id, "reporter", "message", text);
  await notifyCaseTeam(reportId, own.reference_code);
  return { ok: true };
}
