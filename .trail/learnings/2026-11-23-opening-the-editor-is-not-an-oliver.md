---
title: "Opening the editor is not an edit, and the sign-in form does not offer saved logins"
author: Oliver
date: 2026-11-23
branch: main
id: l-6ab424c1
scope: repo
status: active
src: agent
touches:
  - "app/(site)/news/[slug]/page.tsx"
  - app/(site)/news/page.tsx
  - app/(site)/report/page.tsx
  - app/(site)/track/page.tsx
  - app/account/page.tsx
  - app/admin/enquiries/page.tsx
  - app/admin/page.tsx
  - app/admin/people/page.tsx
  - app/admin/reports/page.tsx
  - app/admin/studio/posts/page.tsx
---

## Decided
Opening the page editor must never count as an edit. Autosave compares the draft with what the server last holds, because React re-running effects in development made the old first-run flag save on open and marked pages as having unpublished changes.

The sign-in form turns autofill off: this is a safety site often used on shared phones, and a browser-saved login (caroline.muito) appeared there although it exists nowhere in the code or database.

## Watch out
A password saved in a browser can still be offered despite autocomplete off, so remove it in the browser. Seeded passwords live only in the git-ignored SEEDED_CREDENTIALS.local.md.

In the code: components/studio/page-editor.tsx (lastSaved), components/auth/auth-form.tsx, scripts/seed-accounts.mjs.
