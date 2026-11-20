---
title: Green is a muted acacia olive used only as a signal; warm stone paper and a shuka red for reporting
author: Oliver
date: 2026-11-20
branch: main
id: l-eb3fba1e
scope: repo
status: active
src: agent
touches:
  - app/globals.css
  - public/images/grain.png
  - components/motifs/motifs.tsx
  - components/three/scene.tsx
---

## Decided
Green is a muted acacia olive used only as a signal: primary buttons, links and focus, under about 5% of the screen. The user said the earlier emerald greens (#1BAE70, #06752E) felt AI-made: they are the stock sustainability green, and they were being used as a fill everywhere. The paper is a warm stone with a faint grain. Reporting and safety use a deep shuka red with white text, because salmon coral read as the warm-clay AI accent.

## Tried and ruled out
- An SVG feTurbulence noise as the body background. It repaints across the whole page and made browser screenshots hang, so the grain is a small PNG tile instead.
- Coloured glows behind photos. Hallmark bans chromatic halos, so a neutral warm haze is used instead.

## Watch out
Don't reintroduce bright greens in canvases, motifs or the dashboard. They had hard-coded literals as well as the tokens.

In the code: app/globals.css (@theme tokens, .dash tokens, --tone-* tokens), public/images/grain.png, components/motifs/motifs.tsx and components/three/scene.tsx (colour constants).
