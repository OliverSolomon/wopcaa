import "server-only";
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { blindIndex, isEncrypted, openValue, sealValue } from "@/lib/crypto";
import { one, query } from "@/lib/db";
import { categoryLabel, urgencyLabel } from "@/lib/report-options";
import { sendEmail } from "@/lib/email";

/** Report columns sealed with AES-256-GCM. The AAD ties each value to its row and column. */
const SEALED = ["description", "location_detail", "perpetrator_detail", "support_other", "contact_value"] as const;
type Row = Record<string, unknown>;

const aad = (table: string, col: string, id: string) => `${table}.${col}.${id}`;

export function sealReport(id: string, fields: Row): Row {
  const out = { ...fields };
  for (const col of SEALED) {
    if (!(col in out)) continue;
    if (col === "contact_value") out.contact_hash = out[col] ? blindIndex(String(out[col])) : null;
    out[col] = sealValue(out[col], aad("reports", col, id));
  }
  return out;
}

export function openReport<T extends Row>(row: T): T {
  const out: Row = { ...row };
  const id = String(row.id);
  for (const col of SEALED) {
    if (!isEncrypted(out[col])) continue;
    try {
      out[col] = openValue<string>(out[col], aad("reports", col, id));
    } catch (e) {
      console.error("[crypto] could not open", col, id, (e as Error).message);
      out[col] = "[could not be decrypted]";
    }
  }
  return out as T;
}

export const sealUpdate = (id: string, body: string) => sealValue(body, aad("report_updates", "body", id));
export function openUpdate<T extends { id: string; body: string }>(u: T): T {
  try {
    return { ...u, body: openValue<string>(u.body, aad("report_updates", "body", u.id)) ?? "" };
  } catch {
    return { ...u, body: "[could not be decrypted]" };
  }
}

/** WP-7K3D-92QF: no 0/O/1/I so it can be read over the phone. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function referenceCode() {
  const pick = (n: number) => Array.from({ length: n }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `WP-${pick(4)}-${pick(4)}`;
}

export function accessKey() {
  return randomBytes(9).toString("base64url").replace(/[-_]/g, "x").slice(0, 12);
}
export const hashKey = (key: string) => createHash("sha256").update(key.trim()).digest("hex");
export function keyMatches(key: string, hash: string | null) {
  if (!hash) return false;
  const a = Buffer.from(hashKey(key), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Every admin gets an in-app notification for a new report, and an email when a mailer is configured. */
export async function notifyAdminsOfReport(report: { id: string; reference_code: string; category: string; urgency: string; county: string | null }) {
  const admins = await query<{ user_id: string; email: string }>(
    `select p.user_id, u.email from profiles p join neon_auth."user" u on u.id = p.user_id
     where p.role in ('admin','super_admin')`,
  );
  if (!admins.length) return;
  const title = `New report ${report.reference_code}`;
  const body = `${categoryLabel(report.category)} · ${urgencyLabel(report.urgency)}${report.county ? ` · ${report.county}` : ""}`;
  const link = `/admin/reports/${report.id}`;
  await query(
    `insert into notifications(user_id, kind, title, body, link)
     select x, 'report.new', $2, $3, $4 from unnest($1::uuid[]) as x`,
    [admins.map((a) => a.user_id), title, body, link],
  );
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  await Promise.all(
    admins.map((a) =>
      sendEmail({
        to: a.email,
        subject: `${report.urgency === "critical" ? "URGENT · " : ""}${title}`,
        // No report content in email: only that one exists and where to read it.
        text: `A new report was submitted (${body}).\n\nOpen it in the dashboard: ${site}${link}\n\nWOPCAA case desk`,
      }),
    ),
  );
}

export async function notifyUser(userId: string, title: string, body: string, link: string) {
  await query("insert into notifications(user_id, kind, title, body, link) values ($1,'report.update',$2,$3,$4)", [userId, title, body, link]);
}

export async function addUpdate(reportId: string, authorId: string | null, authorKind: "admin" | "reporter" | "system", kind: "message" | "note" | "status" | "assignment", body: string) {
  const id = crypto.randomUUID();
  await query(
    "insert into report_updates(id, report_id, author_id, author_kind, kind, body) values ($1,$2,$3,$4,$5,$6)",
    [id, reportId, authorId, authorKind, kind, sealUpdate(id, body)],
  );
  await query("update reports set updated_at = now() where id = $1", [reportId]);
}

export async function getThread(reportId: string, includeInternal: boolean) {
  const rows = await query<{ id: string; body: string; author_kind: string; kind: string; created_at: string; author_name: string | null }>(
    `select ru.id, ru.body, ru.author_kind, ru.kind, ru.created_at, coalesce(p.full_name, u.name) as author_name
     from report_updates ru
     left join profiles p on p.user_id = ru.author_id
     left join neon_auth."user" u on u.id = ru.author_id
     where ru.report_id = $1 ${includeInternal ? "" : "and ru.kind <> 'note'"}
     order by ru.created_at`,
    [reportId],
  );
  return rows.map(openUpdate);
}

export async function reportById(id: string) {
  const row = await one<Row & { id: string }>("select * from reports where id = $1", [id]);
  return row ? openReport(row) : null;
}
