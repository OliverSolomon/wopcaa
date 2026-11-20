---
title: Session reads go behind Suspense; background test tabs never reveal streamed content
author: Oliver
date: 2026-11-20
branch: main
id: l-72aef154
scope: repo
status: active
src: agent
touches:
  - components/dash/shell.tsx
---

## Decided
Every session read (getViewer / requireUser) sits behind a Suspense boundary or a route loading.tsx, because with Cache Components a cookies() read outside one fails the build. usePathname in the dashboard shell sits in its own Suspense, because otherwise dynamic routes like /admin/reports/[id] fail to prerender with CLIENT_HOOK_DYNAMIC.

## Watch out
A hidden or background browser tab never reveals streamed Suspense content: it stays in a hidden S:0 div and never hydrates, because React reveals it on animation frames. The report form looked broken for this reason only. Make the tab visible before concluding anything.

In the code: components/dash/shell.tsx (ActiveNav), app/(site)/report/page.tsx (FormWithViewer in Suspense).
