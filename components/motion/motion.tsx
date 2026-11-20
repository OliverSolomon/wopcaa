"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";
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
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" unoptimized={src.endsWith(".svg")} />
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
export function HorizontalScroller({ children, className }: { children: ReactNode; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
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
  return (
    <div ref={wrap} className={cn("relative overflow-hidden", className)}>
      <div ref={track} className="flex gap-5 overflow-x-auto px-5 pb-4 md:overflow-visible md:px-[max(2rem,calc((100vw-1200px)/2))] md:pb-0 [scrollbar-width:none]">
        {children}
      </div>
    </div>
  );
}
