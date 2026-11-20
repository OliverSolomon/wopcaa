# WOPCAA platform

The rebuilt website for the Women Peace Climate Resilience and Justice Association, with a safe abuse-reporting desk and a built-in content studio.

Next.js 16 (App Router, Cache Components) · Neon Postgres, Neon Auth and Neon Object Storage · Tailwind v4 · three.js (react-three-fiber) · GSAP, ScrollTrigger and Lenis.

## What is in it

| Area | Where | Who |
| --- | --- | --- |
| Public site: 3D globe hero, image parallax, word reveals, pinned horizontal gallery, partner marquee | `/`, `/about`, `/cop-mashinani`, `/membership`, `/contact`, `/news` | everyone |
| Safe reporting: 5 steps, anonymous or with an account, evidence upload, quick exit (button or Esc twice) | `/report` | everyone |
| Anonymous follow-up with a reference and private key | `/track` | anonymous reporters |
| Reporter dashboard: my reports, status, messages | `/account` | signed-in reporters |
| Case desk: overview and charts, reports, case view (status, urgency, assignment, messages, internal notes, evidence), enquiries, people and roles | `/admin` | admin, super admin |
| Content studio: pages built from sections with live preview, draft and publish, version history; posts; media library; site settings (menu, contacts, help lines, footer) | `/admin/studio` | editor, admin, super admin |

When a report arrives, every admin gets an in-app notification (the bell polls every 30 s), plus an email when `RESEND_API_KEY` is set. The email says only that a report exists, never what it contains.

## Privacy and safety

- Report text, place, perpetrator details, other-support notes, contact details and every message are encrypted with AES-256-GCM before they are stored (`lib/crypto.ts`, `lib/reports.ts`). The key lives only in the environment.
- Anonymous reporters get a private key. Only its SHA-256 is stored, and lookups are rate limited and give the same answer for a wrong code or a wrong key.
- Evidence goes to a private bucket. Admins download it through a 2-minute signed link, and each download is audited.
- Opening a report, changing it and changing roles are all written to `audit_log`.
- Report pages send `Referrer-Policy: no-referrer` and are never cached.

## Roles

`reporter` (default) · `editor` (studio only) · `admin` (case desk and studio) · `super_admin` (can also change roles in People). Emails in `ADMIN_EMAILS` become super admins on first sign-in. You can also set a role in SQL:

```sql
update profiles set role = 'super_admin' where user_id = (select id from neon_auth."user" where email = 'you@example.org');
```

## Run it

```bash
cp .env.example .env.local   # fill in values (Neon console or MCP)
npm install
npm run db:migrate           # applies db/migrations/*.sql once each
npm run db:seed              # settings, pages, posts, media; add -- --force to overwrite
npm run dev
```

## Adding a section type

1. Add its definition (fields and defaults) to `SECTION_DEFS` in `lib/content/schema.ts`. The studio builds the form from it.
2. Add a component and register it in `MAP` in `components/sections/sections.tsx`.

## Content still to provide

- **Article bodies.** The old WordPress site's articles were seeded with their real titles, dates, authors and images, but with short summary bodies. Paste in the full text in Studio → Posts.
- **Board and Secretariat.** The old site had no content for these. Add a page in Studio → Pages when ready.
- **Statistics.** The home page figures are about the platform and programme (counties served, interventions, partners). Replace them with impact numbers in Studio.
- **Help lines.** 1195 (GBV), 116 (Childline) and 999 (police) are set in Settings → Safety. Confirm or add local partners.
