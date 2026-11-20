"use client";

import { useEffect, useRef } from "react";

/**
 * Three small interactive drawings taken from the WOPCAA emblem: the dove
 * (peace), the scales (justice) and the land (climate). Each runs on a 2D canvas,
 * reacts to the pointer, sleeps when off screen and draws a still frame when the
 * visitor prefers reduced motion.
 */

type Ctx = { ctx: CanvasRenderingContext2D; w: number; h: number; t: number; px: number | null; py: number | null; dt: number };
type Draw = (c: Ctx) => void;

const FOREST = "#14261c";
const GREEN = "#06752e";
const LEAF = "#1bae70";

function useCanvas(setup: (w: number, h: number) => Draw, className?: string) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, draw: Draw | null = null, raf = 0, visible = false, last = performance.now(), t = 0;
    let px: number | null = null, py: number | null = null;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw = setup(w, h);
      if (reduced || !visible) frame(performance.now(), true);
    };
    const frame = (now: number, once = false) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      ctx.clearRect(0, 0, w, h);
      draw?.({ ctx, w, h, t, px, py, dt });
      if (!once && visible && !reduced) raf = requestAnimationFrame((n) => frame(n));
    };
    // The pointer is tracked on the whole card, not just the canvas, so the drawing answers wherever the hand is.
    const host = canvas.parentElement ?? canvas;
    const move = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; };
    const leave = () => { px = null; py = null; };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) { last = performance.now(); raf = requestAnimationFrame((n) => frame(n)); }
    });
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave); };
  }, [setup]);
  return <canvas ref={ref} className={className} aria-hidden />;
}

/* ───────────── Peace: a flock of doves that parts around the pointer ───────────── */

const peace = (w: number, h: number): Draw => {
  const n = Math.max(14, Math.round((w * h) / 9000));
  const birds = Array.from({ length: n }, () => ({
    x: Math.random() * w, y: Math.random() * h, vx: 20 + Math.random() * 18, vy: (Math.random() - 0.5) * 10,
    phase: Math.random() * Math.PI * 2, size: 5 + Math.random() * 4,
  }));
  return ({ ctx, t, px, py, dt }) => {
    for (const b of birds) {
      // Gentle cohesion with neighbours and a steady drift to the right.
      let cx = 0, cy = 0, k = 0;
      for (const o of birds) { const d = Math.hypot(o.x - b.x, o.y - b.y); if (o !== b && d < 70) { cx += o.vx; cy += o.vy; k++; if (d < 16) { b.vx -= (o.x - b.x) * 0.6 * dt; b.vy -= (o.y - b.y) * 0.6 * dt; } } }
      if (k) { b.vx += (cx / k - b.vx) * 0.6 * dt; b.vy += (cy / k - b.vy) * 0.6 * dt; }
      if (px !== null && py !== null) {
        const d = Math.hypot(b.x - px, b.y - py);
        if (d < 110) { const f = (110 - d) / 110; b.vx += ((b.x - px) / (d || 1)) * 260 * f * dt; b.vy += ((b.y - py) / (d || 1)) * 260 * f * dt; }
      }
      b.vy += (h * 0.5 - b.y) * 0.05 * dt;
      const sp = Math.hypot(b.vx, b.vy), max = 70, min = 18;
      if (sp > max) { b.vx *= max / sp; b.vy *= max / sp; } else if (sp < min) { b.vx *= min / sp; b.vy *= min / sp; }
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x > w + 20) b.x = -20; if (b.x < -20) b.x = w + 20;
      if (b.y > h + 20) b.y = -20; if (b.y < -20) b.y = h + 20;

      const a = Math.atan2(b.vy, b.vx), flap = Math.sin(t * 9 + b.phase) * 0.8, s = b.size;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a);
      ctx.fillStyle = "#ffffff"; ctx.strokeStyle = FOREST; ctx.lineWidth = 1.1; ctx.lineJoin = "round";
      ctx.beginPath(); // body
      ctx.ellipse(0, 0, s, s * 0.38, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); // wings, flapping
      ctx.moveTo(-s * 0.2, 0); ctx.quadraticCurveTo(-s * 0.6, -s * (1.3 * flap + 0.2), -s * 1.2, -s * 1.4 * flap);
      ctx.moveTo(-s * 0.2, 0); ctx.quadraticCurveTo(-s * 0.6, s * (1.3 * flap + 0.2), -s * 1.2, s * 1.4 * flap);
      ctx.stroke();
      ctx.restore();
    }
  };
};

/* ───────────── Justice: scales that tip toward the pointer and settle level ───────────── */

const justice = (w: number, h: number): Draw => {
  let angle = 0, vel = 0;
  return ({ ctx, t, px, dt }) => {
    const cx = w / 2, top = h * 0.22, beam = Math.min(w * 0.36, 150);
    const target = px === null ? Math.sin(t * 0.8) * 0.015 : Math.max(-0.32, Math.min(0.32, ((px - cx) / (w / 2)) * 0.32));
    vel += ((target - angle) * 14 - vel * 3.2) * dt; // spring, so it rocks and settles
    angle += vel * dt;

    ctx.lineCap = "round"; ctx.strokeStyle = FOREST; ctx.fillStyle = FOREST;
    // Pillar and base
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, h * 0.84); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, h * 0.86, 42, 7, 0, 0, Math.PI * 2); ctx.fillStyle = GREEN; ctx.fill();
    // Beam
    const dx = Math.cos(angle) * beam, dy = Math.sin(angle) * beam;
    ctx.lineWidth = 3; ctx.strokeStyle = FOREST;
    ctx.beginPath(); ctx.moveTo(cx - dx, top - dy); ctx.lineTo(cx + dx, top + dy); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, top, 6, 0, Math.PI * 2); ctx.fillStyle = LEAF; ctx.fill();
    // Pans hang straight down from each end
    for (const side of [-1, 1]) {
      const ex = cx + side * dx, ey = top + side * dy, drop = h * 0.3, pw = Math.min(46, w * 0.12);
      ctx.lineWidth = 1.2; ctx.strokeStyle = FOREST;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - pw, ey + drop); ctx.moveTo(ex, ey); ctx.lineTo(ex + pw, ey + drop); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex - pw - 6, ey + drop); ctx.quadraticCurveTo(ex, ey + drop + 22, ex + pw + 6, ey + drop); ctx.closePath();
      ctx.fillStyle = side === -1 ? LEAF : "#ffffff"; ctx.fill(); ctx.lineWidth = 1.6; ctx.stroke();
    }
  };
};

/* ───────────── Climate: grass that bends in the pointer's wind ───────────── */

const climate = (w: number, h: number): Draw => {
  const n = Math.round(w / 4.5);
  const blades = Array.from({ length: n }, (_, i) => ({
    x: (i / n) * w + Math.random() * 4, len: h * (0.35 + Math.random() * 0.45), lean: 0, phase: Math.random() * 6, hue: Math.random(),
  }));
  return ({ ctx, t, px, py, dt }) => {
    for (const b of blades) {
      let wind = Math.sin(t * 1.3 + b.x * 0.012 + b.phase * 0.2) * 0.12;
      if (px !== null && py !== null) {
        const d = Math.abs(px - b.x);
        if (d < 120 && py > h - b.len - 40) wind += (b.x < px ? -1 : 1) * ((120 - d) / 120) * 0.9;
      }
      b.lean += (wind - b.lean) * Math.min(1, dt * 6);
      const tipX = b.x + Math.sin(b.lean) * b.len, tipY = h - Math.cos(b.lean) * b.len;
      ctx.strokeStyle = b.hue > 0.7 ? LEAF : b.hue > 0.25 ? GREEN : "#3f8f5c";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(b.x, h); ctx.quadraticCurveTo(b.x, h - b.len * 0.5, tipX, tipY); ctx.stroke();
    }
  };
};

export function Motif({ kind, className }: { kind: "peace" | "justice" | "climate"; className?: string }) {
  const setup = kind === "peace" ? peace : kind === "justice" ? justice : climate;
  return useCanvas(setup, className);
}
