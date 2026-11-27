---
title: "Site photos are upscaled by mixing AI and plain enlargement, never AI alone"
author: Oliver
date: 2026-11-27
branch: main
cost: { minutes: 61, tokens: 518400 }
id: l-768f3a3b
scope: repo
status: active
src: agent
touches:
  - components/doodles/dove-paths.ts
  - next.config.ts
  - components/story/story.tsx
  - components/motion/motion.tsx
  - components/sections/hero-frame.tsx
  - components/motifs/motifs.tsx
  - components/doodles/island-facts.tsx
---

## Decided
Blurry photos in public/images were enlarged with Real-ESRGAN (realesrgan-x4plus) and then mixed about 45% AI with 55% of a lanczos enlargement of the original, lightly sharpened. Full-bleed photos go to 2560px wide, article PNGs to about 2x. Large photos are served at quality 90 (images.qualities [75, 90] in next.config.ts) because the default 75 softened them again.

## Tried and ruled out
- AI upscale on its own: faces and skin came out waxy and plastic. On photos of real Maasai women that is worse than slight blur.

## Watch out
- Next 16 requires every quality value used by an Image to be listed in images.qualities, or it falls back to the nearest one.
- Floating seeds and embers over the story photographs were removed at the user's request; only rain remains. Don't add drifting particles back.

In the code: next.config.ts (images.qualities, formats), components/story/story.tsx (WeatherLayer, rain only), components/motion/motion.tsx (ParallaxImage quality), components/sections/hero-frame.tsx, public/images/.
