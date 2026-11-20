"use client";

import { useEffect, useRef, type ReactNode } from "react";

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

/* ───────────── small parts ───────────── */

export function Acacia({ x, y, s = 1, light = LAND.acaciaLight, dark = LAND.acacia }: { x: number; y: number; s?: number; light?: string; dark?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 C 1 -14, -2 -24, -10 -36 M0 -12 C 4 -22, 10 -30, 16 -38 M-2 -20 C -6 -28, -18 -34, -26 -38" stroke={LAND.bark} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <ellipse cx="-4" cy="-42" rx="40" ry="10" fill={dark} />
      <ellipse cx="-10" cy="-46" rx="26" ry="7" fill={light} />
      <ellipse cx="14" cy="-44" rx="18" ry="6" fill={light} opacity="0.85" />
    </g>
  );
}

function Manyatta({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-22 0 Q -22 -24 0 -26 Q 22 -24 22 0 Z" fill={LAND.hut} />
      <path d="M-18 -10 Q 0 -14 18 -10 M-20 -4 Q 0 -8 20 -4" stroke={LAND.hutDark} strokeWidth="1.4" fill="none" opacity="0.7" />
      <path d="M-5 0 Q -5 -10 0 -10 Q 5 -10 5 0 Z" fill={LAND.earthDark} />
    </g>
  );
}

function Cow({ x, y, s = 1, light }: { x: number; y: number; s?: number; light?: boolean }) {
  const body = light ? "#efe9df" : "#7b4a2e";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-11 0 V 7 M-5 0 V 7 M6 0 V 7 M11 0 V 7" stroke={LAND.earthDark} strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="0" cy="-2" rx="14" ry="7" fill={body} />
      {light ? <ellipse cx="4" cy="-3" rx="5" ry="3.5" fill="#7b4a2e" /> : null}
      <path d="M12 -6 L 20 -9 L 21 -3 L 13 -1 Z" fill={body} />
      <path d="M17 -10 C 18 -14, 22 -14, 23 -12 M16 -9 C 14 -13, 11 -13, 10 -11" stroke="#efe6d2" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** A Maasai woman in a shuka with a beaded collar; optionally holding a seedling or with an arm raised. */
export function Woman({ x, y, s = 1, shuka = LAND.shukaRed, pose = "stand" }: { x: number; y: number; s?: number; shuka?: string; pose?: "stand" | "seedling" | "raise" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-9 0 L -6 -30 Q 0 -36 6 -30 L 9 0 Z" fill={shuka} />
      <path d="M-7 -14 L 7 -18 M-8 -6 L 8 -10" stroke="#00000022" strokeWidth="2" />
      {pose === "raise" ? <path d="M5 -28 L 13 -44" stroke={LAND.skin} strokeWidth="3" strokeLinecap="round" /> : <path d="M5 -27 L 9 -14" stroke={LAND.skin} strokeWidth="3" strokeLinecap="round" />}
      {pose === "seedling" ? (
        <g transform="translate(10 -14)">
          <path d="M0 0 V -8" stroke={LAND.grass} strokeWidth="1.6" />
          <ellipse cx="-3" cy="-8" rx="3.2" ry="1.8" fill={LAND.grass} transform="rotate(-30 -3 -8)" />
          <ellipse cx="3" cy="-10" rx="3.2" ry="1.8" fill={LAND.acaciaLight} transform="rotate(30 3 -10)" />
          <rect x="-3" y="0" width="6" height="4" rx="1" fill={LAND.earthDeep} />
        </g>
      ) : null}
      <ellipse cx="0" cy="-31" rx="8" ry="3.2" fill={LAND.beadBlue} />
      <ellipse cx="0" cy="-32" rx="6.5" ry="2.4" fill={LAND.beadWhite} />
      <ellipse cx="0" cy="-33" rx="5" ry="1.8" fill={LAND.beadOrange} />
      <circle cx="0" cy="-40" r="6" fill={LAND.skin} />
    </g>
  );
}

function Turbine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-1.6 0 L -0.8 -62 L 0.8 -62 L 1.6 0 Z" fill="#eef2f3" />
      <g style={{ transformOrigin: "0px -62px", animation: "spin 6s linear infinite" }} className="motion-reduce:[animation:none]">
        {[0, 120, 240].map((a) => <path key={a} d="M0 -62 L 2 -84 Q 0 -88 -2 -84 Z" fill="#f7f9fa" stroke="#cfd8dc" strokeWidth="0.6" transform={`rotate(${a} 0 -62)`} />)}
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

export function Dove({ x, y, s = 1, delay = 0 }: { x: number; y: number; s?: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g style={{ animation: `drift 9s ease-in-out ${delay}s infinite alternate` }} className="motion-reduce:[animation:none]">
        {/* body and fanned tail, facing right */}
        <path d="M-14 1 L -20 -2 L -19 4 L -12 4 C -6 7, 4 7, 9 3 C 11 1, 12 -1, 11 -3 C 9 -5, 6 -4, 4 -2 C -2 -2, -8 -1, -14 1 Z" fill="#fff" stroke="#1d3328" strokeWidth=".9" strokeLinejoin="round" />
        <path d="M11 -3 L 15 -2 L 11 -1 Z" fill="#e8a23a" />
        <circle cx="8" cy="-2.4" r=".8" fill="#1d3328" />
        {/* wing, beating */}
        <path d="M2 0 C 0 -8, -6 -16, -16 -18 C -12 -12, -10 -6, -6 0 Z" fill="#fff" stroke="#1d3328" strokeWidth=".9" strokeLinejoin="round"
          style={{ transformOrigin: "0px 0px", animation: `flap .6s ease-in-out ${delay}s infinite alternate` }} className="motion-reduce:[animation:none]" />
      </g>
    </g>
  );
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
            {/* roots */}
            <path d="M372 540 C 368 560, 380 572, 372 590 M448 530 C 456 552, 444 566, 452 584 M300 500 C 290 522, 302 536, 294 552 M560 470 C 572 492, 562 506, 570 520" stroke={LAND.earthDark} strokeWidth="2.2" fill="none" strokeLinecap="round" />
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
            <Woman x={ISLAND_ANCHORS.women.x} y={346} s={1.05} pose="seedling" />
            <Woman x={ISLAND_ANCHORS.women.x + 26} y={350} s={1} shuka={LAND.shukaBlue} pose="raise" />
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
    <svg viewBox="70 120 320 165" className={className} role="img" aria-label="Two women planting a young acacia tree while a third waters it">
      <ellipse cx="210" cy="262" rx="190" ry="22" fill={LAND.savanna} />
      <ellipse cx="210" cy="258" rx="150" ry="14" fill={LAND.grass} opacity=".45" />
      <g transform="translate(208 252)">
        <path d="M0 0 V -46" stroke={LAND.bark} strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="0" cy="-52" rx="30" ry="8" fill={LAND.acacia} />
        <ellipse cx="-6" cy="-55" rx="18" ry="5" fill={LAND.acaciaLight} />
        <ellipse cx="0" cy="2" rx="22" ry="5" fill={LAND.earthDeep} />
      </g>
      <Woman x={150} y={258} s={2.1} pose="seedling" />
      <Woman x={276} y={258} s={2.1} shuka={LAND.shukaBlue} pose="raise" />
      <g transform="translate(330 258)">
        <Woman x={0} y={0} s={1.7} shuka="#6b3f8f" />
        <path d="M14 -40 L 34 -46 L 36 -36 L 18 -32 Z" fill="#9fb3bf" />
        <path d="M36 -40 Q 46 -30 42 -14" stroke={LAND.water} strokeWidth="1.6" strokeDasharray="2 3" fill="none" />
      </g>
      <Dove x={110} y={150} s={1.1} />
      <Dove x={350} y={140} s={0.85} delay={0.5} />
    </svg>
  );
}

/* ───────────── The savanna skyline above the footer ───────────── */

export function Horizon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 140" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <path d="M760 140 L 900 58 Q 930 46 960 45 L 1010 44 Q 1040 47 1060 58 L 1200 140 Z" fill="#2b4436" />
      <path d="M900 58 Q 930 46 960 45 L 1010 44 Q 1040 47 1060 58 L 1046 66 L 1030 60 L 1012 70 L 990 62 L 970 72 L 950 63 L 930 71 L 914 64 Z" fill="#dfe8e3" opacity=".9" />
      <path d="M0 140 L 0 112 Q 180 96 360 108 T 720 104 T 1080 110 T 1440 100 L 1440 140 Z" fill="#14261c" />
      {[[120, 112, 1.1], [300, 108, 0.8], [520, 106, 1.3], [1180, 108, 1], [1330, 102, 0.75]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M0 0 C 1 -14, -2 -24, -10 -36 M0 -12 C 4 -22, 10 -30, 16 -38" stroke="#14261c" strokeWidth="3.4" fill="none" />
          <ellipse cx="-2" cy="-42" rx="40" ry="10" fill="#14261c" />
        </g>
      ))}
      <g transform="translate(640 104)" fill="#14261c">
        <path d="M0 0 L 2 -26 L 6 -26 L 8 0 Z M12 0 L 13 -24 L 17 -24 L 18 0 Z" />
        <path d="M-2 -24 Q 8 -34 22 -26 L 20 -20 Q 8 -26 0 -18 Z" />
        <path d="M18 -26 L 24 -58 L 30 -60 L 26 -24 Z" />
        <ellipse cx="30" cy="-61" rx="7" ry="4" />
      </g>
    </svg>
  );
}
