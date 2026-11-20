// Creates the WOPCAA staff accounts through the app's own Neon Auth route, then sets roles.
import { neon } from "@neondatabase/serverless";
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

const base = "http://localhost:3100";
const sql = neon(process.env.DATABASE_URL);
const pw = () => `${randomBytes(12).toString("base64url")}-${randomBytes(2).toString("hex")}`;
const people = [
  { email: "superadmin@wopcaa.org", name: "WOPCAA Super Admin", role: "super_admin", password: pw() },
  { email: "admin@wopcaa.org", name: "WOPCAA Case Desk", role: "admin", password: pw() },
];

for (const p of people) {
  const res = await fetch(`${base}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base },
    body: JSON.stringify({ email: p.email, password: p.password, name: p.name }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) { console.error("sign-up failed", p.email, res.status, JSON.stringify(body).slice(0, 200)); process.exit(1); }
  const [u] = await sql`select id from neon_auth."user" where lower(email) = ${p.email}`;
  await sql`insert into profiles(user_id, role, full_name) values (${u.id}, ${p.role}, ${p.name})
            on conflict (user_id) do update set role = ${p.role}, full_name = ${p.name}, updated_at = now()`;
  await sql`update neon_auth."user" set role = ${p.role === "super_admin" ? "admin" : "user"}, "emailVerified" = true where id = ${u.id}`;
  console.log("created", p.email, p.role);
}
const out = process.argv[2];
writeFileSync(out, `# WOPCAA staff accounts (local only, never commit)\n\n${people.map((p) => `- ${p.role}: ${p.email} / ${p.password}`).join("\n")}\n\nChange these passwords after first sign-in.\n`);
console.log("written", out);
