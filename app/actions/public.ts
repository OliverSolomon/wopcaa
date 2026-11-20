"use server";

import { z } from "zod";
import { query } from "@/lib/db";
import { rateLimit, requestIp } from "@/lib/rate-limit";

export type FormState = { ok?: boolean; error?: string; message?: string };

const email = z.string().trim().toLowerCase().email("Enter a valid email address.").max(200);

async function limited(kind: string) {
  const ip = await requestIp();
  const r = await rateLimit(`enquiry:${kind}:${ip}`, 600, 6);
  return !r.ok;
}

async function notifyStaff(title: string, body: string) {
  await query(
    `insert into notifications(user_id, kind, title, body, link)
     select user_id, 'enquiry', $1, $2, '/admin/enquiries' from profiles where role in ('admin','super_admin')`,
    [title, body],
  );
}

export async function subscribe(_: FormState, form: FormData): Promise<FormState> {
  const parsed = email.safeParse(form.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (await limited("newsletter")) return { error: "Too many attempts. Please try again shortly." };
  await query("insert into enquiries(kind, email) values ('newsletter', $1)", [parsed.data]);
  return { ok: true, message: "Thank you. You're on the list." };
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(120),
  email,
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(5, "Write a short message.").max(4000),
});

export async function sendContact(_: FormState, form: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (await limited("contact")) return { error: "Too many messages. Please try again shortly." };
  const d = parsed.data;
  await query("insert into enquiries(kind, name, email, phone, message) values ('contact',$1,$2,$3,$4)", [d.name, d.email, d.phone || null, d.message]);
  await notifyStaff("New contact message", `${d.name} · ${d.email}`);
  return { ok: true, message: "Message sent. We'll get back to you soon." };
}

const memberSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name or organisation.").max(160),
  email,
  phone: z.string().trim().max(40).optional(),
  type: z.enum(["individual", "organisation"]),
  county: z.string().trim().max(60).optional(),
  message: z.string().trim().max(3000).optional(),
});

export async function applyMembership(_: FormState, form: FormData): Promise<FormState> {
  const parsed = memberSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (await limited("membership")) return { error: "Too many attempts. Please try again shortly." };
  const d = parsed.data;
  await query(
    "insert into enquiries(kind, name, email, phone, message, meta) values ('membership',$1,$2,$3,$4,$5)",
    [d.name, d.email, d.phone || null, d.message || null, JSON.stringify({ type: d.type, county: d.county })],
  );
  await notifyStaff("New membership application", `${d.name} · ${d.type}`);
  return { ok: true, message: "Application received. Our secretariat will contact you about the next steps." };
}
