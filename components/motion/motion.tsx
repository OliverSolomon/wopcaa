"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A photograph that drifts a little slower than the page inside its frame.
 * Kept gentle on purpose: the movement should be felt more than seen.
 */
export function ParallaxImage({
  src, alt = "", className, strength = 10, priority, sizes = "100vw", style,
}: { src: string; alt?: string; className?: string; strength?: number; priority?: boolean; sizes?: string; style?: CSSProperties }) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (reduced() || !inner.current) return;
    gsap.fromTo(inner.current, { yPercent: -strength / 2 }, {
      yPercent: strength / 2, ease: "none",
      scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true },
    });
  }, { scope: frame });
  if (!src) return <div className={cn("bg-mist-deep", className)} />;
  return (
    <div ref={frame} className={cn("relative overflow-hidden", className)} style={style}>
      <div ref={inner} className="absolute inset-x-0" style={{ top: `-${strength / 2 + 1}%`, bottom: `-${strength / 2 + 1}%` }}>
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} quality={90} className="object-cover" unoptimized={src.endsWith(".svg")} />
      </div>
    </div>
  );
}

/** The hero's single load moment: text settles in once, nothing else on the page animates on its own. */
export function HeroIn({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (reduced() || !ref.current) return;
    gsap.from(ref.current.children, { y: 16, opacity: 0, duration: 1.1, ease: "power3.out", stagger: 0.12, delay: 0.15 });
  }, { scope: ref });
  return <div ref={ref} className={className}>{children}</div>;
}

/** A pinned row of photographs that moves sideways while the page scrolls down (desktop only). */
export function HorizontalScroller({ children, className, label = "Gallery" }: { children: ReactNode; className?: string; label?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ at: 0, count: 0 });
  useGSAP(() => {
    if (!wrap.current || !track.current) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => track.current!.scrollWidth - window.innerWidth + 64;
      gsap.to(track.current, {
        x: () => -distance(), ease: "none",
        scrollTrigger: { trigger: wrap.current, start: "top top", end: () => `+=${distance()}`, scrub: 0.6, pin: true, invalidateOnRefresh: true },
      });
    });
    return () => mm.revert();
  }, { scope: wrap });

  // Phones swipe the strip natively; this keeps the counter and buttons in step with it.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const slides = () => [...el.children].filter((c) => (c as HTMLElement).offsetParent !== null && !(c as HTMLElement).dataset.intro) as HTMLElement[];
    const update = () => {
      const list = slides();
      const left = el.scrollLeft + el.clientWidth * 0.35;
      let at = 0;
      list.forEach((c, i) => { if (c.offsetLeft <= left) at = i; });
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) at = list.length - 1;
      setPos((p) => (p.at === at && p.count === list.length ? p : { at, count: list.length }));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { el.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  const go = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const list = [...el.children].filter((c) => (c as HTMLElement).offsetParent !== null && !(c as HTMLElement).dataset.intro) as HTMLElement[];
    const next = list[Math.max(0, Math.min(list.length - 1, pos.at + dir))];
    if (next) el.scrollTo({ left: next.offsetLeft - 20, behavior: reduced() ? "auto" : "smooth" });
  };

  return (
    <div ref={wrap} className={cn("relative overflow-hidden", className)} role="region" aria-roledescription="carousel" aria-label={label}>
      <div ref={track} className="flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto overscroll-x-contain px-5 pb-2 *:snap-start md:snap-none md:gap-5 md:overflow-visible md:px-[max(2rem,calc((100vw-1200px)/2))] md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      {pos.count > 1 ? (
        <div className="mt-4 flex items-center gap-4 px-5 md:hidden">
          <span className="text-sm tabular-nums text-slate" aria-live="polite">{pos.at + 1} / {pos.count}</span>
          <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-line" aria-hidden>
            <span className="absolute inset-y-0 left-0 rounded-full bg-forest transition-[width] duration-300" style={{ width: `${((pos.at + 1) / pos.count) * 100}%` }} />
          </span>
          <span className="flex gap-2">
            <button type="button" onClick={() => go(-1)} disabled={pos.at === 0} aria-label="Previous photo" className="grid size-11 place-items-center rounded-full border border-line bg-white text-forest transition-opacity disabled:opacity-35"><ChevronLeft className="size-5" /></button>
            <button type="button" onClick={() => go(1)} disabled={pos.at >= pos.count - 1} aria-label="Next photo" className="grid size-11 place-items-center rounded-full border border-line bg-white text-forest transition-opacity disabled:opacity-35"><ChevronRight className="size-5" /></button>
          </span>
        </div>
      ) : null}
    </div>
  );
}
