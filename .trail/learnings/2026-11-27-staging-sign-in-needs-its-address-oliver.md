---
title: "Staging sign-in needs its address in Neon Auth's trusted domains"
author: Oliver
date: 2026-11-27
branch: main
cost: { minutes: 1, tokens: 1314 }
id: l-af11911e
scope: repo
status: active
src: agent
touches:
  - scripts/seed-accounts.mjs
  - lib/auth/server.ts
---

## Decided
The staging site at https://wopcaa.vercel.app shares the single Neon branch (main) with local development, so the accounts made by scripts/seed-accounts.mjs work on both. Neon Auth only accepts sign-ins from trusted domains; localhost works by default, but every deployed address has to be added.

## Watch out
A new deployed domain (production, a custom domain) will reject every sign-in through app/api/auth/[...path]/route.ts with 403 INVALID_ORIGIN until it is added to the Neon Auth trusted domains for the branch. This is not a code bug or a bad password.

In the code: lib/auth/server.ts (NEON_AUTH_BASE_URL), app/api/auth/[...path]/route.ts, scripts/seed-accounts.mjs. Neon project wopcaa (tiny-shadow-89838537), branch main (br-patient-poetry-b9bivmiy).
