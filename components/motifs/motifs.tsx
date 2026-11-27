"use client";

import { useEffect, useRef } from "react";
import { DOVE, DOVE_TONES, WING_PIVOT } from "@/components/doodles/dove-paths";

/**
 * Three small interactive scenes taken from the WOPCAA emblem: doves (peace),
 * the scales (justice) and savanna grass (climate). Each is a 2D canvas that
 * paints its own backdrop, answers the pointer anywhere on its card, sleeps
 * when off screen and draws one still frame for people who prefer less motion.
 */

type Ctx = { ctx: CanvasRenderingContext2D; w: number; h: number; t: number; dt: number; px: number | null; py: number | null; pvx: number };
type Draw = (c: Ctx) => void;

/* Tones taken from the land and the emblem, kept low in saturation. */
const T = {
  ink: "#2b2f26", olive: "#5f6e36", oliveDeep: "#46532a", sage: "#9aa275", straw: "#cdb877", strawDeep: "#b39a58", dryGrass: "#d9c896",
  brassLight: "#e6cf93", brass: "#c09a4f", brassDeep: "#87672e", stone: "#d6cfbf", stoneDeep: "#b7ae9a",
  skyTop: "#e9ecea", skyLow: "#f4ede0", sun: "rgba(232,196,128,", hillFar: "#dcd8c8", hillNear: "#cfcab5",
};

function useCanvas(setup: (w: number, h: number) => Draw, className?: string) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, draw: Draw | null = null, raf = 0, visible = false, last = performance.now(), t = 0;
    let px: number | null = null, py: number | null = null, lastPx: number | null = null, pvx = 0;

    const frame = (now: number, once = false) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      pvx = px !== null && lastPx !== null ? (px - lastPx) / Math.max(dt, 0.001) : 0;
      lastPx = px;
      ctx.clearRect(0, 0, w, h);
      draw?.({ ctx, w, h, t, dt, px, py, pvx });
      if (!once && visible && !reduced) raf = requestAnimationFrame((n) => frame(n));
    };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw = setup(w, h);
      if (reduced || !visible) { t = reduced ? 2.2 : t; frame(performance.now(), true); }
    };
    const host = canvas.parentElement?.closest("article") ?? canvas.parentElement ?? canvas;
    const move = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; };
    const leave = () => { px = null; py = null; lastPx = null; };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    // Touch: a tap or drag counts as the pointer, and lifting the finger lets the scene settle.
    host.addEventListener("pointerdown", move);
    host.addEventListener("pointerup", leave);
    host.addEventListener("pointercancel", leave);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) { last = performance.now(); raf = requestAnimationFrame((n) => frame(n)); }
    });
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave); host.removeEventListener("pointerdown", move); host.removeEventListener("pointerup", leave); host.removeEventListener("pointercancel", leave); };
  }, [setup]);
  return <canvas ref={ref} className={className} aria-hidden />;
}

/* ───────────── shared backdrop: a soft dusk sky with a low sun and hills ───────────── */

function sky(ctx: CanvasRenderingContext2D, w: number, h: number, sunX: number, sunY: number, hills = true) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, T.skyTop); g.addColorStop(1, T.skyLow);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const r = Math.min(w, h) * 0.42;
  const s = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, r);
  s.addColorStop(0, T.sun + "0.55)"); s.addColorStop(0.18, T.sun + "0.35)"); s.addColorStop(1, T.sun + "0)");
  ctx.fillStyle = s; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = T.sun + "0.75)";
  ctx.beginPath(); ctx.arc(sunX, sunY, r * 0.13, 0, Math.PI * 2); ctx.fill();
  if (!hills) return;
  ctx.fillStyle = T.hillFar;
  ctx.beginPath(); ctx.moveTo(0, h * 0.86);
  ctx.bezierCurveTo(w * 0.25, h * 0.74, w * 0.45, h * 0.8, w * 0.62, h * 0.76);
  ctx.bezierCurveTo(w * 0.8, h * 0.72, w * 0.92, h * 0.8, w, h * 0.78);
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  ctx.fillStyle = T.hillNear;
  ctx.beginPath(); ctx.moveTo(0, h * 0.93);
  ctx.bezierCurveTo(w * 0.3, h * 0.86, w * 0.6, h * 0.95, w, h * 0.88);
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  // one acacia on the far ridge
  const ax = w * 0.7, ay = h * 0.765, k = Math.min(w, h) / 260;
  ctx.strokeStyle = "#b8b39c"; ctx.lineWidth = 1.6 * k;
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay - 14 * k); ctx.stroke();
  ctx.fillStyle = "#b8b39c";
  ctx.beginPath(); ctx.ellipse(ax, ay - 16 * k, 17 * k, 3.6 * k, 0, 0, Math.PI * 2); ctx.fill();
}

/* ───────────── Peace: doves that part around the pointer ───────────── */

let DOVE_PATHS: Record<"body" | "belly" | "beak" | "tail" | "wing" | "wingLines", Path2D> | null = null;
const dovePaths = () => (DOVE_PATHS ??= {
  body: new Path2D(DOVE.body), belly: new Path2D(DOVE.belly), beak: new Path2D(DOVE.beak),
  tail: new Path2D(DOVE.tail), wing: new Path2D(DOVE.wing), wingLines: new Path2D(DOVE.wingLines),
});

/**
 * The same dove as the SVG scenes (components/doodles/dove-paths.ts), facing +x.
 * `beat` runs 0..1 per wingbeat: a quick downstroke to 45%, a slower recovery.
 * The wing squashes through the shoulder from scaleY 1 (up) to -0.6 (down).
 */
function dove(ctx: CanvasRenderingContext2D, size: number, beat: number, far: number) {
  const P = dovePaths();
  const e = beat < 0.45 ? beat / 0.45 : 1 - (beat - 0.45) / 0.55;
  const ease = e * e * (3 - 2 * e);
  const wing = 1 - 1.6 * ease;
  ctx.save();
  ctx.scale(size / 22, size / 22);
  ctx.translate(0, -1.4 * ease);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  const flap = (path: Path2D, k: number, dx: number, dy: number, fill: string, lines?: Path2D) => {
    ctx.save();
    ctx.translate(WING_PIVOT.x, WING_PIVOT.y); ctx.scale(1, k); ctx.translate(-WING_PIVOT.x + dx, -WING_PIVOT.y + dy);
    ctx.fillStyle = fill; ctx.fill(path); ctx.lineWidth = 0.55; ctx.strokeStyle = DOVE_TONES.line; ctx.stroke(path);
    if (lines) { ctx.globalAlpha *= 0.55; ctx.lineWidth = 0.45; ctx.stroke(lines); }
    ctx.restore();
  };
  flap(P.wing, wing * 0.9, -2, 0.6, DOVE_TONES.farWing);
  ctx.fillStyle = DOVE_TONES.feather; ctx.fill(P.body);
  ctx.lineWidth = 0.6; ctx.strokeStyle = DOVE_TONES.line; ctx.stroke(P.body);
  ctx.fillStyle = DOVE_TONES.shade; ctx.fill(P.belly);
  ctx.lineWidth = 0.5; ctx.stroke(P.tail);
  ctx.fillStyle = DOVE_TONES.beak; ctx.fill(P.beak);
  if (far > 0.5) { ctx.fillStyle = DOVE_TONES.eye; ctx.beginPath(); ctx.arc(DOVE.eye.cx, DOVE.eye.cy, DOVE.eye.r, 0, Math.PI * 2); ctx.fill(); }
  flap(P.wing, wing, 0, 0, DOVE_TONES.feather, P.wingLines);
  ctx.restore();
}

const peace = (w: number, h: number): Draw => {
  const k = Math.max(0.75, Math.min(1.7, h / 190));
  const n = Math.max(5, Math.min(9, Math.round((w * h) / 18000)));
  // A loose, spread-out flock: evenly spaced across the width, each at its own height and depth.
  const birds = Array.from({ length: n }, (_, i) => {
    const z = 0.5 + ((i * 7) % n) / n * 0.5; // far to near, shuffled
    return { x: ((i + 0.5) / n) * w + (Math.random() - 0.5) * 30, y: h * (0.16 + ((i * 5) % n) / n * 0.42), vx: (14 + Math.random() * 6) * (0.6 + z), vy: 0, beat: Math.random(), z, rate: 1.05 + Math.random() * 0.2, home: 0 };
  });
  birds.forEach((b) => { b.home = b.y; });
  return ({ ctx, t, dt, px, py }) => {
    sky(ctx, w, h, w * 0.78, h * 0.42);
    for (const b of birds) {
      let fright = 0;
      if (px !== null && py !== null) {
        const dx = b.x - px, dy = b.y - py, d = Math.hypot(dx, dy), R = 120 * k;
        if (d < R) { fright = 1 - d / R; b.vx += (dx / (d || 1)) * 340 * fright * dt; b.vy += (dy / (d || 1)) * 340 * fright * dt; }
      }
      // drift back to a calm right-hand glide at the bird's own height
      b.vx += ((15 + 8 * b.z) * k - b.vx) * 0.6 * dt;
      b.vy += (b.home - b.y) * 0.5 * dt - b.vy * 0.8 * dt;
      b.x += b.vx * dt; b.y += b.vy * dt + Math.sin(t * 1.2 + b.home) * 3 * dt;
      if (b.x > w + 40) b.x = -40; if (b.x < -40) b.x = w + 40;
      b.y = Math.max(h * 0.08, Math.min(h * 0.72, b.y));
      // 900ms per wingbeat at rest, twice as fast when startled
      b.beat = (b.beat + dt * b.rate * (1 + fright * 1.2)) % 1;
    }
    for (const b of [...birds].sort((a, c) => a.z - c.z)) {
      ctx.save();
      ctx.globalAlpha = 0.55 + 0.45 * b.z;
      ctx.translate(b.x, b.y);
      const heading = Math.max(-0.4, Math.min(0.4, Math.atan2(b.vy, Math.abs(b.vx))));
      if (b.vx < 0) ctx.scale(-1, 1);
      ctx.rotate(heading);
      dove(ctx, (19 + 15 * b.z) * k, b.beat, b.z);
      ctx.restore();
    }
  };
};

/* ───────────── Justice: brass scales that tip toward the pointer and settle level ───────────── */

function brassGradient(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, T.brassDeep); g.addColorStop(0.35, T.brassLight); g.addColorStop(0.6, T.brass); g.addColorStop(1, T.brassDeep);
  return g;
}

const justice = (w: number, h: number): Draw => {
  let angle = 0, vel = 0;
  return ({ ctx, t, dt, px }) => {
    // warm wall with a pool of light
    const bg = ctx.createRadialGradient(w / 2, h * 0.25, 0, w / 2, h * 0.25, Math.max(w, h) * 0.8);
    bg.addColorStop(0, "#f7f2e7"); bg.addColorStop(1, "#e4dfd2");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    const k = Math.min(w / 300, h / 215);
    const cx = w / 2, floor = h * 0.9, top = h * 0.2;
    const L = Math.min(w * 0.36, 140 * k);
    const target = px === null ? Math.sin(t * 0.9) * 0.02 : Math.max(-0.3, Math.min(0.3, ((px - cx) / (w / 2)) * 0.3));
    vel += ((target - angle) * 16 - vel * 3.4) * dt;
    angle += vel * dt;

    // floor shadow and stone plinth
    ctx.fillStyle = "rgba(60,50,30,0.12)";
    ctx.beginPath(); ctx.ellipse(cx, floor + 2 * k, 90 * k, 9 * k, 0, 0, Math.PI * 2); ctx.fill();
    const stone = ctx.createLinearGradient(0, floor - 26 * k, 0, floor);
    stone.addColorStop(0, T.stone); stone.addColorStop(1, T.stoneDeep);
    ctx.fillStyle = stone;
    ctx.beginPath(); ctx.roundRect(cx - 70 * k, floor - 14 * k, 140 * k, 14 * k, 3 * k); ctx.fill();
    ctx.beginPath(); ctx.roundRect(cx - 46 * k, floor - 26 * k, 92 * k, 13 * k, 3 * k); ctx.fill();

    // pillar
    ctx.fillStyle = brassGradient(ctx, cx - 6 * k, 0, cx + 6 * k, 0);
    ctx.beginPath();
    ctx.moveTo(cx - 6 * k, floor - 26 * k); ctx.lineTo(cx - 3.5 * k, top + 6 * k); ctx.lineTo(cx + 3.5 * k, top + 6 * k); ctx.lineTo(cx + 6 * k, floor - 26 * k);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = brassGradient(ctx, cx - 14 * k, 0, cx + 14 * k, 0);
    ctx.beginPath(); ctx.roundRect(cx - 14 * k, floor - 34 * k, 28 * k, 8 * k, 3 * k); ctx.fill();

    // pans first (they hang behind the beam ends)
    const ends = [-1, 1].map((side) => ({ side, x: cx + side * Math.cos(angle) * L, y: top + side * Math.sin(angle) * L }));
    for (const e of ends) {
      const drop = h * 0.38, rimY = e.y + drop, pw = 36 * k;
      // shadow under the pan moves with it
      ctx.fillStyle = "rgba(60,50,30,0.10)";
      ctx.beginPath(); ctx.ellipse(e.x, floor + 1 * k, pw * 0.8, 4 * k, 0, 0, Math.PI * 2); ctx.fill();
      // chains
      ctx.strokeStyle = T.brassDeep; ctx.lineWidth = 1.1 * k;
      ctx.beginPath();
      for (const dx of [-pw * 0.92, 0, pw * 0.92]) { ctx.moveTo(e.x, e.y + 4 * k); ctx.lineTo(e.x + dx, rimY); }
      ctx.stroke();
      // contents: a seedling on the left, river stones on the right
      if (e.side < 0) {
        ctx.strokeStyle = T.oliveDeep; ctx.lineWidth = 1.6 * k;
        ctx.beginPath(); ctx.moveTo(e.x, rimY); ctx.quadraticCurveTo(e.x + 1 * k, rimY - 10 * k, e.x, rimY - 18 * k); ctx.stroke();
        ctx.fillStyle = T.olive;
        ctx.beginPath(); ctx.ellipse(e.x - 6 * k, rimY - 14 * k, 6.5 * k, 2.8 * k, -0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = T.sage;
        ctx.beginPath(); ctx.ellipse(e.x + 6 * k, rimY - 19 * k, 6.5 * k, 2.8 * k, 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#7a5a3a";
        ctx.beginPath(); ctx.ellipse(e.x, rimY - 1 * k, 12 * k, 3.4 * k, 0, 0, Math.PI * 2); ctx.fill();
      } else {
        for (const [dx, dy, r, c] of [[-8, -3, 6, "#a49d8f"], [5, -3.5, 7, "#8f887b"], [-1, -10, 5.5, "#b9b2a4"]] as const) {
          ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(e.x + dx * k, rimY + dy * k, r * k, r * 0.72 * k, 0, 0, Math.PI * 2); ctx.fill();
        }
      }
      // the bowl
      ctx.fillStyle = brassGradient(ctx, e.x - pw, 0, e.x + pw, 0);
      ctx.beginPath(); ctx.moveTo(e.x - pw, rimY); ctx.quadraticCurveTo(e.x, rimY + 24 * k, e.x + pw, rimY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = T.brassLight;
      ctx.beginPath(); ctx.ellipse(e.x, rimY, pw, 3.4 * k, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = T.brassDeep; ctx.lineWidth = 0.8 * k; ctx.stroke();
    }

    // beam with a glint
    ctx.save();
    ctx.translate(cx, top); ctx.rotate(angle);
    ctx.fillStyle = brassGradient(ctx, 0, -4 * k, 0, 4 * k);
    ctx.beginPath(); ctx.roundRect(-L, -3.5 * k, 2 * L, 7 * k, 3.5 * k); ctx.fill();
    ctx.strokeStyle = "rgba(255,248,225,0.7)"; ctx.lineWidth = 1 * k;
    ctx.beginPath(); ctx.moveTo(-L + 6 * k, -1.8 * k); ctx.lineTo(L - 6 * k, -1.8 * k); ctx.stroke();
    for (const s of [-1, 1]) {
      ctx.fillStyle = brassGradient(ctx, s * L - 5 * k, -5 * k, s * L + 5 * k, 5 * k);
      ctx.beginPath(); ctx.arc(s * L, 0, 5 * k, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // finial
    const fin = ctx.createRadialGradient(cx - 3 * k, top - 4 * k, 1, cx, top, 10 * k);
    fin.addColorStop(0, "#fff3cf"); fin.addColorStop(0.4, T.brassLight); fin.addColorStop(1, T.brassDeep);
    ctx.fillStyle = fin;
    ctx.beginPath(); ctx.arc(cx, top, 9 * k, 0, Math.PI * 2); ctx.fill();
  };
};

/* ───────────── Climate: savanna grass in three depths, parted by the pointer ───────────── */

type Blade = { x: number; len: number; bw: number; color: string; phase: number; lean: number; v: number; seed: boolean };

const climate = (w: number, h: number): Draw => {
  const k = Math.max(0.8, Math.min(1.6, h / 200));
  const layer = (count: number, minL: number, maxL: number, bw: number, colors: string[], seedRate: number): Blade[] =>
    Array.from({ length: count }, (_, i) => ({
      x: (i / count) * (w + 20) - 10 + Math.random() * 6,
      len: h * (minL + Math.random() * (maxL - minL)), bw: bw * k * (0.7 + Math.random() * 0.6),
      color: colors[Math.floor(Math.random() * colors.length)], phase: Math.random() * 6, lean: 0, v: 0, seed: Math.random() < seedRate,
    }));
  // Grass height follows the card's width as well as its height, so a tall card shows sky and mountain above it.
  const g = Math.min(h, w * 0.95);
  const layers = [
    { blades: layer(Math.round(w / 7), 0.16 * g / h, 0.26 * g / h, 2, ["#c9c3a2", "#bfba96", "#d3c9a0"], 0.06), base: h * 0.86, sway: 0.7 },
    { blades: layer(Math.round(w / 6.5), 0.22 * g / h, 0.36 * g / h, 2.6, [T.sage, T.straw, "#a9a777", T.dryGrass], 0.1), base: h * 0.93, sway: 1 },
    { blades: layer(Math.round(w / 8), 0.28 * g / h, 0.46 * g / h, 3.4, [T.olive, T.oliveDeep, T.strawDeep, "#76803f"], 0.14), base: h + 2, sway: 1.2 },
  ];
  const fluff: { x: number; y: number; vx: number; vy: number; life: number; s: number }[] = [];

  return ({ ctx, t, dt, px, py, pvx }) => {
    sky(ctx, w, h, w * 0.22, h * 0.3, false);
    // Kilimanjaro, faint behind the grass
    ctx.fillStyle = "#d9d6c8";
    ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.8); ctx.lineTo(w * 0.62, h * 0.42); ctx.quadraticCurveTo(w * 0.68, h * 0.38, w * 0.74, h * 0.4); ctx.lineTo(w * 0.98, h * 0.8); ctx.fill();
    ctx.fillStyle = "#f3f1ea";
    ctx.beginPath(); ctx.moveTo(w * 0.62, h * 0.42); ctx.quadraticCurveTo(w * 0.68, h * 0.38, w * 0.74, h * 0.4); ctx.lineTo(w * 0.77, h * 0.46); ctx.lineTo(w * 0.73, h * 0.44); ctx.lineTo(w * 0.69, h * 0.47); ctx.lineTo(w * 0.65, h * 0.44); ctx.lineTo(w * 0.6, h * 0.46); ctx.fill();
    // ground
    const ground = ctx.createLinearGradient(0, h * 0.78, 0, h);
    ground.addColorStop(0, "#e2d6ad"); ground.addColorStop(1, "#cdb980");
    ctx.fillStyle = ground; ctx.fillRect(0, h * 0.8, w, h * 0.2);

    for (const { blades, base, sway } of layers) {
      for (const b of blades) {
        // a breeze rolling across, plus the pointer pushing blades aside
        let wind = (Math.sin(t * 1.1 - b.x * 0.012) * 0.1 + Math.sin(t * 2.3 - b.x * 0.031 + b.phase) * 0.035) * sway;
        if (px !== null && py !== null) {
          const d = Math.abs(px - b.x), R = 110 * k;
          if (d < R && py > base - b.len - 50 * k) wind += (b.x < px ? -1 : 1) * Math.pow(1 - d / R, 1.4) * 0.85 * sway + pvx * 0.0004;
        }
        b.v += ((wind - b.lean) * 30 - b.v * 6) * dt;
        b.lean += b.v * dt;
        const tipX = b.x + Math.sin(b.lean) * b.len, tipY = base - Math.cos(b.lean) * b.len;
        const cxm = b.x + Math.sin(b.lean) * b.len * 0.35, cym = base - b.len * 0.55;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.moveTo(b.x - b.bw, base);
        ctx.quadraticCurveTo(cxm - b.bw * 0.5, cym, tipX, tipY);
        ctx.quadraticCurveTo(cxm + b.bw * 0.5, cym, b.x + b.bw, base);
        ctx.closePath(); ctx.fill();
        if (b.seed) {
          // an oat-like seed head that lets go of fluff when the pointer brushes it fast
          ctx.fillStyle = "#c9a85e";
          for (let i = 0; i < 4; i++) {
            const sx = tipX - Math.sin(b.lean) * i * 3.2 * k + (i % 2 ? 2 : -2) * k, sy = tipY + Math.cos(b.lean) * i * 3.2 * k;
            ctx.beginPath(); ctx.ellipse(sx, sy, 1.6 * k, 3 * k, b.lean + (i % 2 ? 0.5 : -0.5), 0, Math.PI * 2); ctx.fill();
          }
          if (px !== null && Math.abs(px - tipX) < 18 * k && Math.abs(pvx) > 140 && fluff.length < 60 && Math.random() < 0.25) {
            fluff.push({ x: tipX, y: tipY, vx: pvx * 0.05 + (Math.random() - 0.5) * 20, vy: -20 - Math.random() * 25, life: 1, s: 0.7 + Math.random() * 0.6 });
          }
        }
      }
    }
    // fluff drifting up and away
    for (let i = fluff.length - 1; i >= 0; i--) {
      const f = fluff[i];
      f.vx *= 1 - 0.8 * dt; f.vy += -6 * dt; f.x += (f.vx + Math.sin(t * 3 + i) * 12) * dt; f.y += f.vy * dt; f.life -= 0.28 * dt;
      if (f.life <= 0) { fluff.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, f.life * 1.4);
      ctx.strokeStyle = "#efe6cf"; ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (let a = 0; a < 6; a++) { const r = 4 * f.s * k; ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r); }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  };
};

export function Motif({ kind, className }: { kind: "peace" | "justice" | "climate"; className?: string }) {
  const setup = kind === "peace" ? peace : kind === "justice" ? justice : climate;
  return useCanvas(setup, className);
}
