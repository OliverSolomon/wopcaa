// Seeds one sign-in for each role through the app's own Neon Auth route, sets the role,
// proves the sign-in works, and writes the sign-ins to a git-ignored file.
// Needs the app running. Usage: npm run db:seed-accounts  (SEED_BASE_URL overrides the address)
import { neon } from "@neondatabase/serverless";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const base = (process.env.SEED_BASE_URL ?? "http://localhost:3100").replace(/\/$/, "");
const file = join(import.meta.dirname, "..", "SEEDED_CREDENTIALS.local.md");
const sql = neon(process.env.DATABASE_URL);

const people = [
  { email: "superadmin@gmail.com", name: "Super Admin", role: "super_admin", can: "Everything, including managing admins and users" },
  { email: "admin@gmail.com", name: "Case Admin", role: "admin", can: "Case desk, enquiries and content studio" },
  { email: "editor@gmail.com", name: "Content Editor", role: "editor", can: "Content studio only" },
  { email: "user@gmail.com", name: "Test User", role: "reporter", can: "Makes reports and follows their own" },
];

// Every seeded account shares one test password (SEED_PASSWORD overrides it).
const PASSWORD = process.env.SEED_PASSWORD ?? "bassword";
const post = (path, body) => fetch(`${base}/api/auth/${path}`, { method: "POST", headers: { "Content-Type": "application/json", Origin: base }, body: JSON.stringify(body) });

for (const p of people) {
  const [existing] = await sql`select id from neon_auth."user" where lower(email) = ${p.email}`;
  p.password = PASSWORD;
  if (!existing) {
    const res = await post("sign-up/email", { email: p.email, password: p.password, name: p.name });
    if (!res.ok) throw new Error(`sign-up failed for ${p.email}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
  const [u] = await sql`select id from neon_auth."user" where lower(email) = ${p.email}`;
  await sql`insert into profiles(user_id, role, full_name) values (${u.id}, ${p.role}, ${p.name})
            on conflict (user_id) do update set role = ${p.role}, full_name = ${p.name}, updated_at = now()`;
  // Only super admins hold Neon Auth's own admin role.
  await sql`update neon_auth."user" set role = ${p.role === "super_admin" ? "admin" : "user"}, "emailVerified" = true where id = ${u.id}`;
  const login = await post("sign-in/email", { email: p.email, password: p.password });
  if (!login.ok) throw new Error(`sign-in failed for ${p.email}: ${login.status} (an existing account keeps its own password; reset it from People)`);
  console.log("ok", p.role, p.email);
}

writeFileSync(file, `# WOPCAA seeded sign-ins (local only, git-ignored, never commit or share)

Sign in at ${base}/sign-in. Staging: https://wopcaa.vercel.app/sign-in (same database)

| Role | Email | Password | Can do |
| --- | --- | --- | --- |
${people.map((p) => `| ${p.role} | ${p.email} | \`${p.password}\` | ${p.can} |`).join("\n")}
`);
console.log("written", file);
