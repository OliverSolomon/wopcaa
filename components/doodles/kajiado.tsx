"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { DOVE, DOVE_TONES, WING_PIVOT } from "./dove-paths";

/**
 * Hand-built illustrations of WOPCAA's own landscape: Kajiado savanna with
 * Kilimanjaro behind, acacias, manyattas, a water pan, cattle and women in
 * shukas. Colours are taken from that land, not from a UI palette.
 */
export const LAND = {
  savanna: "#dcc47e", savannaDeep: "#c6a85c", grass: "#8fae52", acacia: "#5f7f2e", acaciaLight: "#7fa043",
  bark: "#5b3d26", earth: "#b4643a", earthDeep: "#7a4528", earthDark: "#4c2d1c", stone: "#a39888",
  kili: "#8ea3b3", kiliShade: "#7a8fa0", snow: "#f6f8f9", water: "#4fa3a0", waterLight: "#8fd0c8",
  hut: "#a07b55", hutDark: "#7d5c3d", shukaRed: "#b23a2e", shukaBlue: "#2f5d9b", skin: "#5a3a28",
  beadBlue: "#2e6db4", beadWhite: "#f4f1ea", beadOrange: "#e8a23a", cloud: "#ffffff", cloudShade: "#d5e6ee",
} as const;

/* ───────────── small parts ─────────────
 * Every part is drawn standing on its local 0,0 (feet, roots or hooves on y = 0).
 * Animated groups use the .ill-* classes in globals.css and pivot at their own 0,0:
 * the group is translated to the pivot, animated, and its artwork translated back.
 */

const SKIN_DEEP = "#47291b";

/** Umbrella thorn acacia: a forked trunk under a flat, two-layer canopy. */
export function Acacia({ x, y, s = 1, light = LAND.acaciaLight, dark = LAND.acacia, bark = LAND.bark }: { x: number; y: number; s?: number; light?: string; dark?: string; bark?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 C -0.6 -7 0.4 -13 -1 -20" stroke={bark} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M-1 -20 C -6 -26 -14 -32 -24 -38 M-1 -20 C 2 -28 8 -33 18 -39 M-1 -22 C -2 -29 -4 -34 -6 -40 M0 -14 C 4 -18 9 -22 13 -25" stroke={bark} strokeWidth="1.9" fill="none" strokeLinecap="round" />
      <path d="M-44 -38 C -46 -44 -36 -48 -28 -47 C -24 -52 -12 -53 -6 -50 C 0 -55 14 -54 18 -50 C 26 -53 38 -50 40 -45 C 46 -44 46 -38 40 -37 C 20 -35 -24 -35 -44 -38 Z" fill={dark} />
      <path d="M-34 -46 C -32 -51 -22 -53 -16 -51 C -10 -55 2 -55 6 -52 C 12 -55 24 -53 26 -49 C 18 -47.6 -20 -47 -34 -46 Z" fill={light} />
    </g>
  );
}

function Manyatta({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-22 0 C -23 -14 -14 -25 0 -26 C 14 -25 23 -14 22 0 Z" fill={LAND.hut} />
      <path d="M-18 -10 Q 0 -14 18 -10 M-20 -4 Q 0 -8 20 -4 M-14 -17 Q 0 -20 14 -17" stroke={LAND.hutDark} strokeWidth="1.3" fill="none" opacity="0.6" />
      <path d="M-5 0 C -5 -6 -3 -9 0 -9 C 3 -9 5 -6 5 0 Z" fill={LAND.earthDark} />
    </g>
  );
}

/** A zebu cow grazing: humped back, head down, curved horns. */
function Cow({ x, y, s = 1, light }: { x: number; y: number; s?: number; light?: boolean }) {
  const body = light ? "#ece5d8" : "#7b4a2e";
  return (
    <g transform={`translate(${x} ${y - 8 * s}) scale(${s})`}>
      <path d="M-11 0 V 8 M-7.4 0 V 8 M7 0 V 8 M10.4 0 V 8" stroke={LAND.earthDark} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M-14 -6 C -16.4 -3 -16.6 1 -15.6 4" stroke={body} strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M-14 -4 C -14 -9 -10 -11 -4 -11 C -1 -11 1 -13.6 4 -13.4 C 7 -13 8 -11 10 -10 C 13 -9 14 -7 14 -4 C 14 -1 11 1 6 1 L -9 1 C -12.6 1 -14 -1 -14 -4 Z" fill={body} />
      {light ? <path d="M-8 -9 C -4 -10 -1 -8 -2 -4 C -4 -1 -9 -2 -10 -5 Z" fill="#7b4a2e" opacity=".85" /> : null}
      <path d="M12 -8 C 15 -8 18 -4 19.4 0.4 C 19.8 1.8 18.4 2.6 17.4 1.6 C 15.6 -1 13.4 -3 11.6 -4 Z" fill={body} />
      <path d="M14.6 -7.6 C 15.4 -11 17.8 -12 19.4 -11 M13.6 -7.6 C 12.4 -10.8 10.2 -11.4 9 -10.4" stroke="#efe6d2" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </g>
  );
}

/**
 * A Maasai woman in a shuka with a second cloth over the shoulder, a beaded
 * collar, headband and earrings. Poses: standing, holding a seedling (its
 * leaves sway), waving (the arm swings at the shoulder) or watering (the
 * stream falls). `flip` mirrors her to face left.
 */
export function Woman({ x, y, s = 1, shuka = LAND.shukaRed, pose = "stand", flip }: { x: number; y: number; s?: number; shuka?: string; pose?: "stand" | "seedling" | "raise" | "water"; flip?: boolean }) {
  const arm = { stroke: LAND.skin, strokeWidth: 3, fill: "none", strokeLinecap: "round" as const };
  const hand = (cx: number, cy: number, r = 1.7) => <circle cx={cx} cy={cy} r={r} fill={LAND.skin} />;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx="-3.6" cy="-0.6" rx="3" ry="1.3" fill={SKIN_DEEP} />
      <ellipse cx="3.6" cy="-0.6" rx="3" ry="1.3" fill={SKIN_DEEP} />
      {/* arms that hang behind the cloth */}
      {pose === "stand" || pose === "raise" ? <>{<path d="M-7.6 -32 C -9.8 -26 -10.4 -20 -9.8 -15.4" {...arm} />}{hand(-9.8, -14.8)}</> : null}
      {pose === "stand" ? <>{<path d="M7.6 -32 C 9.8 -26 10.4 -20 9.8 -15.4" {...arm} />}{hand(9.8, -14.8)}</> : null}
      {/* shuka and the cloth over the shoulder */}
      <path d="M-11 -1.4 C -10 -14 -9 -26 -7.6 -33 C -5 -36.4 5 -36.4 7.6 -33 C 9 -26 10 -14 11 -1.4 C 4 0.4 -4 0.4 -11 -1.4 Z" fill={shuka} />
      <path d="M-7.6 -33 C -2 -32 4 -26 9.6 -12 L 10.4 -7.6 C 4 -18 -2 -24 -8.8 -26 Z" fill="#000" opacity=".16" />
      <path d="M-6 -30.6 C -1 -28 3.6 -23 7.6 -15 M-7.6 -28 C -3 -25.6 1.4 -21 5.6 -13.4" stroke="#fff" strokeOpacity=".28" strokeWidth=".8" fill="none" />
      <path d="M-10.6 -2.4 C -4 -0.8 4 -0.8 10.6 -2.4" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" strokeDasharray="1.2 1.6" fill="none" />
      {pose === "seedling" ? (
        <>
          <path d="M-7.6 -32 C -9.6 -27 -8 -23 -3.4 -21.6" {...arm} />
          <path d="M7.6 -32 C 9.6 -27 8 -23 3.4 -21.6" {...arm} />
          <g transform="translate(0 -23) scale(1.5)">
            <g className="ill-pivot ill-leaf">
              <path d="M0 0 C 0.4 -3 -0.2 -5 0 -7.4" stroke={LAND.grass} strokeWidth="1.1" fill="none" strokeLinecap="round" />
              <path d="M0 -4.6 C -2.6 -6.8 -5.2 -6.2 -5.6 -4.6 C -3.6 -3.6 -1.6 -3.8 0 -4.6 Z" fill={LAND.grass} />
              <path d="M0 -6.8 C 2.4 -9.4 5.2 -9 5.8 -7.4 C 3.8 -6.2 1.6 -6.2 0 -6.8 Z" fill={LAND.acaciaLight} />
            </g>
          </g>
          <path d="M-3.6 -23 L 3.6 -23 L 2.8 -18.4 L -2.8 -18.4 Z" fill={LAND.earthDeep} />
          {hand(-3.4, -21)}{hand(3.4, -21)}
        </>
      ) : null}
      {pose === "raise" ? (
        <g transform="translate(7.6 -32.4)">
          <g className="ill-pivot ill-wave">
            <path d="M0 0 C 3 -3.6 5 -9 5.6 -15.6" {...arm} />
            {hand(5.7, -17.2, 1.8)}
          </g>
        </g>
      ) : null}
      {pose === "water" ? (
        <>
          <path d="M29.6 -30.6 C 32.6 -24.6 33.6 -12 33.8 0" stroke={LAND.water} strokeWidth="1.2" strokeDasharray="1.6 3.9" strokeLinecap="round" fill="none" className="ill-pour" />
          <path d="M14 -29.6 C 15 -33.6 20 -33.6 21 -29.6" stroke="#7f9099" strokeWidth="1.1" fill="none" />
          <path d="M21.6 -26 L 28.4 -31.6" stroke="#9fb0b8" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M27.6 -32.8 L 30 -30.4" stroke="#8a9ba4" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M13 -29.6 L 22 -29.6 L 21.2 -21.4 L 13.8 -21.4 Z" fill="#9fb0b8" />
          <path d="M-7.6 -32 C -6 -26 0 -24.6 9.4 -25.4" {...arm} />
          <path d="M7.6 -32 C 10.4 -29 12.6 -27 14.6 -26.2" {...arm} />
          {hand(9.8, -25.4)}{hand(14.6, -26.2)}
        </>
      ) : null}
      {/* neck, collar, head */}
      <rect x="-2" y="-39" width="4" height="4.6" rx="1" fill={LAND.skin} />
      <ellipse cx="0" cy="-34.4" rx="8.4" ry="3.1" fill={LAND.beadBlue} />
      <ellipse cx="0" cy="-34.9" rx="6.8" ry="2.4" fill={LAND.beadWhite} />
      <ellipse cx="0" cy="-35.4" rx="5.2" ry="1.8" fill={LAND.beadOrange} />
      <ellipse cx="0" cy="-35.8" rx="3.4" ry="1.1" fill={LAND.shukaRed} />
      <ellipse cx="0" cy="-43.4" rx="5" ry="5.9" fill={LAND.skin} />
      <path d="M-4.7 -46.2 C -2 -47.8 2 -47.8 4.7 -46.2" stroke={LAND.beadWhite} strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M-4.7 -46.2 C -2 -47.8 2 -47.8 4.7 -46.2" stroke={LAND.beadOrange} strokeWidth="1.1" strokeDasharray=".9 1.8" fill="none" />
      <path d="M-5 -42 L -5.4 -38.4 M5 -42 L 5.4 -38.4" stroke={LAND.beadWhite} strokeWidth=".8" strokeLinecap="round" />
      <circle cx="-5.4" cy="-38" r=".9" fill={LAND.beadOrange} />
      <circle cx="5.4" cy="-38" r=".9" fill={LAND.beadOrange} />
    </g>
  );
}

function Turbine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-1.6 0 L -0.8 -62 L 0.8 -62 L 1.6 0 Z" fill="#eef2f3" />
      <g transform="translate(0 -62)">
        <g className="ill-pivot motion-safe:[animation:spin_6s_linear_infinite]">
          {[0, 120, 240].map((a) => <path key={a} d="M0 0 L 2 -22 Q 0 -26 -2 -22 Z" fill="#f7f9fa" stroke="#cfd8dc" strokeWidth="0.6" transform={`rotate(${a})`} />)}
        </g>
      </g>
      <circle cx="0" cy="-62" r="2.4" fill="#cfd8dc" />
    </g>
  );
}

function Solar({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 V -8" stroke="#6b6f72" strokeWidth="1.4" />
      <path d="M-14 -8 L 12 -8 L 16 -20 L -10 -20 Z" fill="#2f4e7a" />
      <path d="M-5 -8 L -1 -20 M4 -8 L 8 -20 M-12 -14 L 14 -14" stroke="#7fa4cf" strokeWidth="0.7" />
    </g>
  );
}

/** A dove in flight: the wings beat through the shoulder and the body lifts on each downstroke. */
export function Dove({ x, y, s = 1, delay = 0 }: { x: number; y: number; s?: number; delay?: number }) {
  const d = { animationDelay: `${-delay}s` };
  const P = WING_PIVOT;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * 0.62})`}>
      <g style={{ animation: `drift 9s ease-in-out ${delay}s infinite alternate` }} className="motion-reduce:[animation:none]">
        <g className="ill-pivot ill-bob" style={d}>
          <g transform={`translate(${P.x} ${P.y})`}>
            <g className="ill-pivot ill-wing-far" style={d}>
              <path d={DOVE.wing} transform={`translate(${-P.x - 2} ${-P.y + 0.6}) scale(.88)`} fill={DOVE_TONES.farWing} stroke={DOVE_TONES.line} strokeWidth=".5" strokeLinejoin="round" />
            </g>
          </g>
          <path d={DOVE.body} fill={DOVE_TONES.feather} stroke={DOVE_TONES.line} strokeWidth=".6" strokeLinejoin="round" />
          <path d={DOVE.belly} fill={DOVE_TONES.shade} />
          <path d={DOVE.tail} stroke={DOVE_TONES.line} strokeWidth=".5" strokeLinecap="round" />
          <path d={DOVE.beak} fill={DOVE_TONES.beak} />
          <circle {...DOVE.eye} fill={DOVE_TONES.eye} />
          <g transform={`translate(${P.x} ${P.y})`}>
            <g className="ill-pivot ill-wing" style={d}>
              <g transform={`translate(${-P.x} ${-P.y})`}>
                <path d={DOVE.wing} fill={DOVE_TONES.feather} stroke={DOVE_TONES.line} strokeWidth=".6" strokeLinejoin="round" />
                <path d={DOVE.wingLines} stroke={DOVE_TONES.line} strokeOpacity=".55" strokeWidth=".45" fill="none" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

/** A giraffe in silhouette whose neck lowers slowly to browse, pivoting at the shoulders. */
function Giraffe({ x, y, s = 1, fill, flip, delay = 0 }: { x: number; y: number; s?: number; fill: string; flip?: boolean; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill={fill}>
      <path d="M-12 -29 L -12.6 -14 L -12 0 M-9.4 -29 L -9 -14 L -9.6 0 M7.4 -29 L 8 -14 L 7.6 0 M10.4 -29 L 10.8 -14 L 11 0" stroke={fill} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M-15 -31 C -17 -26 -17 -22 -16.5 -18" stroke={fill} strokeWidth="1" fill="none" strokeLinecap="round" />
      <ellipse cx="-16.5" cy="-17.4" rx="1" ry="1.8" />
      <path d="M-15 -31 C -15 -35 -10 -37 -2 -39 C 4 -41 10 -42 12 -38 C 14 -34 12 -29 7 -28 L -11 -27.5 C -14 -27.5 -15 -29 -15 -31 Z" />
      <g transform="translate(9 -37)">
        <g className="ill-pivot ill-browse" style={{ animationDelay: `${-delay}s` }}>
          <g transform="translate(-9 37)">
            <path d="M5.6 -37 C 10 -46 15 -56 18 -64 L 22.6 -63 C 20 -54 15.4 -44 12.6 -35.6 Z" />
            <path d="M17.5 -66 C 19 -68.5 23 -68.5 26.5 -66.5 L 30.5 -64.2 C 31.6 -63.4 31 -62 29.8 -62.2 L 22.5 -62.4 C 20 -62.6 17.6 -64 17.5 -66 Z" />
            <path d="M18.5 -66 L 15.4 -66.8 L 18 -64.4 Z" />
            <path d="M19.6 -67.4 L 19.2 -71 M21.8 -67.8 L 21.9 -71.4" stroke={fill} strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="19.2" cy="-71.2" r="1" /><circle cx="21.9" cy="-71.6" r="1" />
          </g>
        </g>
      </g>
    </g>
  );
}

function Tufts({ at, fill }: { at: [number, number, number][]; fill: string }) {
  return <>{at.map(([x, y, s], i) => <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M-6 0 C -5 -4 -4 -7 -5 -10 C -2 -7 -1 -4 -1 0 Z M-2 0 C -1 -6 0 -10 2 -13 C 2 -9 2 -4 2 0 Z M1 0 C 3 -4 5 -6 8 -8 C 6 -5 5 -2 5 0 Z" fill={fill} />)}</>;
}

export function Cloud({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 160 70" className={className} style={style} aria-hidden>
      <path d="M22 58 C 4 58 2 36 20 34 C 22 16 46 10 58 22 C 66 6 96 6 102 26 C 120 18 142 30 136 46 C 152 48 150 62 134 62 Z" fill={LAND.cloudShade} transform="translate(4 4)" />
      <path d="M22 58 C 4 58 2 36 20 34 C 22 16 46 10 58 22 C 66 6 96 6 102 26 C 120 18 142 30 136 46 C 152 48 150 62 134 62 Z" fill={LAND.cloud} />
    </svg>
  );
}

/* ───────────── The floating island ───────────── */

export const ISLAND_ANCHORS = {
  women: { x: 268, y: 330 },
  home: { x: 338, y: 300 },
  water: { x: 528, y: 322 },
  turbine: { x: 588, y: 236 },
  mountain: { x: 400, y: 172 },
  acacia: { x: 222, y: 252 },
} as const;
export type Anchor = keyof typeof ISLAND_ANCHORS;

/**
 * A chunk of Kajiado floating in the air, bobbing gently and tilting toward the
 * pointer. `children` is drawn on top in the same 800 × 600 space (pins, lines).
 */
export function KajiadoIsland({ children, className }: { children?: ReactNode; className?: string }) {
  const tilt = useRef<SVGGElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = tilt.current?.ownerSVGElement?.parentElement;
    if (!el) return;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2; };
    const leave = () => { tx = 0; ty = 0; };
    const loop = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      tilt.current?.querySelectorAll<SVGGElement>("[data-depth]").forEach((g) => {
        const d = Number(g.dataset.depth);
        g.setAttribute("transform", `translate(${(cx * d).toFixed(2)} ${(cy * d * 0.5).toFixed(2)})`);
      });
      raf = requestAnimationFrame(loop);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, []);

  return (
    <svg viewBox="0 0 800 600" className={className} role="img" aria-label="An illustration of Kajiado: savanna with Kilimanjaro behind, acacia trees, homesteads, a water pan, cattle and women, floating like an island">
      <defs>
        <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={LAND.earth} /><stop offset="0.45" stopColor={LAND.earthDeep} /><stop offset="1" stopColor={LAND.earthDark} />
        </linearGradient>
        <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={LAND.savanna} /><stop offset="1" stopColor={LAND.savannaDeep} />
        </linearGradient>
        <radialGradient id="shadow"><stop offset="0" stopColor="#14261c" stopOpacity=".22" /><stop offset="1" stopColor="#14261c" stopOpacity="0" /></radialGradient>
      </defs>

      <ellipse cx="410" cy="572" rx="190" ry="18" fill="url(#shadow)" style={{ transformOrigin: "410px 572px", animation: "shadowPulse 7s ease-in-out infinite" }} className="motion-reduce:[animation:none]" />

      <g style={{ animation: "bob 7s ease-in-out infinite" }} className="motion-reduce:[animation:none]">
        <g ref={tilt}>
          {/* far: Kilimanjaro */}
          <g data-depth="-6">
            <path d="M150 262 L 292 168 Q 330 150 362 148 L 424 146 Q 458 150 482 168 L 640 262 Z" fill={LAND.kili} />
            <path d="M420 146 Q 458 150 482 168 L 640 262 L 520 262 Z" fill={LAND.kiliShade} opacity=".55" />
            <path d="M292 168 Q 330 150 362 148 L 424 146 Q 458 150 482 168 L 466 180 L 449 172 L 433 186 L 412 175 L 392 189 L 371 177 L 350 190 L 330 178 L 312 185 Z" fill={LAND.snow} />
          </g>

          {/* the earth chunk */}
          <g data-depth="0">
            <path d="M100 300 C 112 382, 214 468, 326 520 C 380 548, 444 552, 486 522 C 600 452, 690 380, 700 300 Z" fill="url(#soil)" />
            <path d="M118 340 C 220 372, 330 380, 470 372 C 560 366, 630 350, 684 336" stroke="#d08a5c" strokeWidth="3" fill="none" opacity=".35" />
            <path d="M170 404 C 270 430, 380 436, 520 420 C 580 412, 620 400, 650 390" stroke="#c07a4c" strokeWidth="2.5" fill="none" opacity=".3" />
            <ellipse cx="258" cy="392" rx="14" ry="8" fill={LAND.stone} opacity=".85" />
            <ellipse cx="540" cy="404" rx="10" ry="6" fill={LAND.stone} opacity=".8" />
            <ellipse cx="410" cy="468" rx="12" ry="7" fill={LAND.stone} opacity=".7" />
            {/* short tapered roots tucked under the soil, so nothing hangs like legs */}
            <path d="M380 538 C 382 548 378 556 382 562 C 386 554 388 546 388 536 Z M420 540 C 424 550 422 558 428 562 C 428 552 428 544 426 536 Z M330 522 C 328 530 324 536 326 540 C 332 534 336 528 338 522 Z M500 512 C 504 520 504 526 510 530 C 510 522 508 516 506 510 Z" fill={LAND.earthDark} opacity=".8" />
            {/* grass lip over the rim */}
            <path d="M104 304 C 120 322 150 332 170 336 C 160 326 150 318 146 310 C 170 330 210 344 236 348 C 226 340 220 332 218 326 C 260 346 320 356 360 358 L 440 358 C 490 356 560 344 600 330 C 594 338 588 344 582 348 C 616 340 650 328 670 316 C 664 326 658 332 652 336 C 676 328 692 316 696 304 Z" fill={LAND.grass} opacity=".35" />
            {/* top surface */}
            <ellipse cx="400" cy="300" rx="300" ry="70" fill="url(#top)" />
            <path d="M100 300 C 140 352, 300 372, 400 370 C 520 370, 660 352, 700 300 C 680 340, 540 362, 400 362 C 270 362, 130 344, 100 300 Z" fill={LAND.grass} opacity=".55" />
            <ellipse cx="300" cy="286" rx="70" ry="16" fill={LAND.grass} opacity=".5" />
            <ellipse cx="520" cy="270" rx="90" ry="14" fill={LAND.grass} opacity=".4" />
            <ellipse cx={ISLAND_ANCHORS.water.x} cy={ISLAND_ANCHORS.water.y} rx="58" ry="13" fill={LAND.water} />
            <ellipse cx={ISLAND_ANCHORS.water.x - 10} cy={ISLAND_ANCHORS.water.y - 3} rx="30" ry="5" fill={LAND.waterLight} opacity=".7" />
          </g>

          {/* things on the land, back to front */}
          <g data-depth="3">
            <Acacia x={ISLAND_ANCHORS.acacia.x} y={262} s={1.25} />
            <Acacia x={612} y={276} s={0.85} />
            <Turbine x={ISLAND_ANCHORS.turbine.x} y={300} s={1} />
            <Manyatta x={ISLAND_ANCHORS.home.x} y={306} />
            <Manyatta x={382} y={314} s={0.8} />
            <Solar x={420} y={320} s={0.9} />
          </g>
          <g data-depth="6">
            <Cow x={448} y={346} s={0.9} />
            <Cow x={480} y={354} s={0.85} light />
            <Woman x={ISLAND_ANCHORS.women.x} y={346} s={0.95} pose="seedling" />
            <Woman x={ISLAND_ANCHORS.women.x + 26} y={350} s={0.9} shuka={LAND.shukaBlue} pose="raise" />
            <Acacia x={160} y={330} s={0.75} />
          </g>

          <g data-depth="10">
            <Dove x={520} y={150} s={1.2} />
            <Dove x={560} y={128} s={0.9} delay={0.4} />
            <Dove x={250} y={170} s={1} delay={0.8} />
          </g>
          {children}
        </g>
      </g>
    </svg>
  );
}

/* ───────────── A scene for "Get involved": women planting an acacia ───────────── */

export function PlantingScene({ className }: { className?: string }) {
  return (
    <svg viewBox="40 20 340 190" className={className} role="img" aria-label="Three Maasai women around a young acacia: one holds a seedling, one waters the tree, one waves">
      <ellipse cx="210" cy="194" rx="196" ry="18" fill={LAND.savanna} />
      <ellipse cx="210" cy="190" rx="150" ry="10" fill={LAND.grass} opacity=".4" />
      <Tufts fill={LAND.savannaDeep} at={[[70, 196, 1], [112, 202, .8], [300, 200, .9], [362, 196, 1.1], [170, 203, .7]]} />
      <Acacia x={205} y={188} s={0.95} />
      <ellipse cx="205" cy="189" rx="20" ry="4.4" fill={LAND.earthDeep} />
      <Woman x={132} y={194} s={2} pose="seedling" />
      <Woman x={262} y={194} s={1.75} shuka="#6b3f8f" pose="water" flip />
      <Woman x={336} y={194} s={1.95} shuka={LAND.shukaBlue} pose="raise" />
      <Dove x={84} y={58} s={1.3} />
      <Dove x={318} y={42} s={1} delay={0.45} />
    </svg>
  );
}

/* ───────────── The savanna skyline above the footer ───────────── */

const NIGHT = { ground: "#252b21", ridge: "#343c2e", kili: "#4d5843", kiliShade: "#434d3a", snow: "#e6e4d8" } as const;

export function Horizon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 140" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <path d="M0 140 L 0 104 Q 220 88 470 98 T 960 94 T 1440 92 L 1440 140 Z" fill={NIGHT.ridge} />
      {/* Kilimanjaro: Mawenzi's jagged shoulder on the left, Kibo's flat top with snow */}
      <path d="M740 140 C 790 116 830 96 850 88 L 866 78 L 874 82 L 884 74 L 896 68 C 920 56 940 50 968 48 L 1012 47 C 1036 48 1052 52 1066 58 C 1110 78 1170 112 1220 140 Z" fill={NIGHT.kili} />
      <path d="M1012 47 C 1036 48 1052 52 1066 58 C 1110 78 1170 112 1220 140 L 1080 140 C 1060 100 1040 70 1012 47 Z" fill={NIGHT.kiliShade} />
      <path d="M900 64 C 920 56 940 50 968 48 L 1012 47 C 1036 48 1052 52 1066 58 L 1056 64 L 1046 60 L 1038 68 L 1026 61 L 1014 70 L 1002 62 L 988 69 L 976 61 L 962 67 L 950 60 L 938 66 L 926 60 L 914 66 Z" fill={NIGHT.snow} opacity=".92" />
      <path d="M0 140 L 0 114 Q 180 100 360 110 T 720 106 T 1080 112 T 1440 102 L 1440 140 Z" fill={NIGHT.ground} />
      <Tufts fill={NIGHT.ground} at={[[60, 116, 1], [250, 112, .9], [430, 110, 1.1], [820, 110, .9], [1010, 113, 1], [1250, 108, 1], [1400, 104, .9]]} />
      {([[120, 114, 1.05], [330, 110, 0.78], [575, 108, 1.2], [1180, 110, 1], [1330, 105, 0.72]] as const).map(([x, y, s], i) => (
        <Acacia key={i} x={x} y={y} s={s} light={NIGHT.ground} dark={NIGHT.ground} bark={NIGHT.ground} />
      ))}
      <Giraffe x={640} y={107} s={1} fill={NIGHT.ground} flip />
      <Giraffe x={700} y={107} s={0.74} fill={NIGHT.ground} delay={2.5} />
    </svg>
  );
}
