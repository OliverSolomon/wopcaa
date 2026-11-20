---
title: "The public site follows WOPCAA's own brand and tells its story as a scroll-driven film, without the usual AI-site habits"
author: Oliver
date: 2026-11-20
branch: main
id: l-6d3a4137
scope: repo
status: active
src: agent
touches:
  - components/story/story.tsx
  - components/motifs/motifs.tsx
  - components/story/county-picker.tsx
  - app/globals.css
  - lib/content/schema.ts
---

## Decided
The public site must not look AI-generated, and the home page tells WOPCAA's story as a film driven by scroll. The user asked for both after the first version (cream background, serif display, terracotta accent, eyebrows, italic accent words, 01/03 numbering, arrows on buttons, fade-ups everywhere) read as generic AI. Colours come from WOPCAA's own wopcaa.org palette, and coral is kept only for safety and reporting. One readable font. The story runs establishing scene, consequence, the women affected, action, then a closing line. Its interactions come from the emblem: globe, dove, scales.

## Tried and ruled out
- Copying the reference's all-caps on-screen lines and pure black base. They read as template, so the lines are sentence case and the dark base is the brand forest.
- Invented impact numbers. Figures are shown only with a named source.

## Watch out
- Keep the calm hero with the Report abuse button above the story, because people in danger need it before any film.
- Run the hallmark sloplint over public components after design changes.

In the code: components/story/story.tsx, components/motifs/motifs.tsx, components/story/county-picker.tsx, app/globals.css (brand tokens, .arch-* frames), lib/content/schema.ts (story, county, photoPair, bento, impact section types), 
ode .claude/skills/hallmark/scripts/sloplint.mjs <files>.
