"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Cloud, ISLAND_ANCHORS, KajiadoIsland, type Anchor } from "./kajiado";

export type Fact = { value: string; label: string; place?: Anchor; source?: string };

/**
 * Where each card sits around the island (in the island's 800 × 600 space) and
 * where its leader line leaves the card. Up to four places are laid out.
 */
const SLOTS = [
  { card: { left: "0%", top: "6%" }, joint: { x: 196, y: 108 } },
  { card: { left: "0%", top: "62%" }, joint: { x: 196, y: 420 } },
  { card: { left: "73%", top: "4%" }, joint: { x: 604, y: 100 } },
  { card: { left: "73%", top: "60%" }, joint: { x: 604, y: 408 } },
];
const DEFAULT_PLACES: Anchor[] = ["women", "home", "water", "turbine"];

export function IslandFacts({ heading, intro, facts }: { heading?: string; intro?: string; facts: Fact[] }) {
  const [active, setActive] = useState<number | null>(null);
  const items = facts.slice(0, 4).map((f, i) => ({ ...f, place: f.place ?? DEFAULT_PLACES[i], slot: SLOTS[i] }));

  return (
    <section className="haze relative overflow-hidden py-20 md:py-28">
      <Cloud className="pointer-events-none absolute left-[58%] top-10 w-40 opacity-90 [animation:cloudDrift_14s_ease-in-out_infinite_alternate] motion-reduce:[animation:none]" />
      <Cloud className="pointer-events-none absolute right-[6%] top-28 w-28 opacity-80 [animation:cloudDrift_18s_ease-in-out_infinite_alternate-reverse] motion-reduce:[animation:none]" />
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="max-w-2xl">
          {heading ? <h2 className="t-h2">{heading}</h2> : null}
          {intro ? <p className="mt-4 text-lg leading-relaxed text-slate">{intro}</p> : null}
        </div>

        <div className="relative mx-auto mt-10 aspect-[4/3] max-w-[1100px]">
          <KajiadoIsland className="absolute inset-0 size-full">
            {items.map((f, i) => {
              const a = ISLAND_ANCHORS[f.place];
              const on = active === i;
              return (
                <g key={i} className="hidden md:inline">
                  <path d={`M${f.slot.joint.x} ${f.slot.joint.y} C ${(f.slot.joint.x + a.x) / 2} ${f.slot.joint.y}, ${(f.slot.joint.x + a.x) / 2} ${a.y}, ${a.x} ${a.y}`}
                    stroke={on ? "#06752e" : "#14261c"} strokeOpacity={on ? 0.9 : 0.35} strokeWidth={on ? 1.6 : 1} strokeDasharray={on ? "0" : "3 4"} fill="none" />
                  <circle cx={a.x} cy={a.y} r="7" fill="#06752e" opacity=".5" className="motion-safe:[animation:pinPulse_2.4s_ease-out_infinite]" />
                  <circle cx={a.x} cy={a.y} r="5" fill="#fff" stroke="#06752e" strokeWidth="2.5" />
                </g>
              );
            })}
          </KajiadoIsland>

          {/* Cards, pinned around the island on larger screens */}
          {items.map((f, i) => (
            <button key={i} type="button"
              onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}
              className={cn(
                "absolute hidden w-[25%] rounded-2xl border border-white/70 bg-white/65 p-4 text-left shadow-[0_18px_40px_-24px_rgb(20_38_28/0.45)] backdrop-blur-md transition-[transform,border-color] duration-300 md:block lg:p-5",
                active === i && "-translate-y-1 border-green/40",
              )}
              style={f.slot.card}>
              <span className="block text-[2rem] font-semibold leading-none text-forest lg:text-[2.4rem]">{f.value}</span>
              <span className="mt-2 block text-[0.92rem] leading-snug text-slate">{f.label}</span>
              {f.source ? <span className="mt-2 block text-xs text-slate-soft">{f.source}</span> : null}
            </button>
          ))}
        </div>

        {/* Small screens: the same facts as a list under the island */}
        <ul className="mt-6 grid gap-3 md:hidden">
          {items.map((f, i) => (
            <li key={i} className="rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur">
              <span className="block text-[1.8rem] font-semibold leading-none">{f.value}</span>
              <span className="mt-1.5 block text-slate">{f.label}</span>
              {f.source ? <span className="mt-1.5 block text-xs text-slate-soft">{f.source}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
