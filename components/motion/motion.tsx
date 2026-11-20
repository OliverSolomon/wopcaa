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
 * An image that drifts slower than the page inside its frame. `strength` is the
 * travel as a percentage of the frame height; the image is oversized to cover it.
 */
export function ParallaxImage({
  src, alt = "", className, strength = 14, priority, sizes = "100vw", scale = true, style,
}: { src: string; alt?: string; className?: string; strength?: number; priority?: boolean; sizes?: string; scale?: boolean; style?: CSSProperties }) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (reduced() || !inner.current) return;
    gsap.fromTo(inner.current, { yPercent: -strength / 2, scale: scale ? 1.08 : 1 }, {
      yPercent: strength / 2, scale: 1, ease: "none",
      scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true },
    });
  }, { scope: frame });
  if (!src) return <div className={cn("bg-sand-200", className)} />;
  return (
    <div ref={frame} className={cn("relative overflow-hidden", className)} style={style}>
      <div ref={inner} className="absolute inset-x-0" style={{ top: `-${strength / 2 + 2}%`, bottom: `-${strength / 2 + 2}%` }}>
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" unoptimized={src.endsWith(".svg")} />
      </div>
    </div>
  );
}

/** Splits text into words that rise out of a mask when scrolled into view. */
export function RevealText({ text, as: Tag = "h2", className, delay = 0, html }: { text: string; as?: "h1" | "h2" | "h3" | "p" | "div"; className?: string; delay?: number; html?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (reduced() || !ref.current) return;
    gsap.fromTo(ref.current.querySelectorAll(".reveal-word > span"), { yPercent: 110 }, {
      yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.035, delay,
      scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
    });
  }, { scope: ref });
  // Split on spaces, keeping *emphasis* markers as <em>.
  const words = text.split(/\s+/).filter(Boolean);
  let inEm = false;
  return (
    <Tag ref={ref as never} className={className}>
      {words.map((w, i) => {
        const starts = w.startsWith("*");
        const ends = w.replace(/[.,;:!?]+$/, "").endsWith("*");
        if (starts) inEm = true;
        const clean = html ? w.replace(/\*/g, "") : w.replace(/\*/g, "");
        const node = inEm ? <em>{clean}</em> : clean;
        if (ends) inEm = false;
        return (
          <span key={i} className="reveal-word">
            <span>{node}</span>
            {i < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </Tag>
  );
}

/** A statement whose words brighten one by one as the reader scrolls through it. */
export function ScrubText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useGSAP(() => {
    if (reduced() || !ref.current) return;
    gsap.fromTo(ref.current.querySelectorAll("span[data-w]"), { opacity: 0.16 }, {
      opacity: 1, ease: "none", stagger: 0.1,
      scrollTrigger: { trigger: ref.current, start: "top 80%", end: "bottom 45%", scrub: true },
    });
  }, { scope: ref });
  return (
    <p ref={ref} className={className}>
      {text.split(/\s+/).map((w, i) => (
        <span key={i} data-w>{w.replace(/\*/g, "")} </span>
      ))}
    </p>
  );
}

/** Children fade up as they enter, staggered when `stagger` is set on a group. */
export function FadeUp({ children, className, delay = 0, stagger, y = 28 }: { children: ReactNode; className?: string; delay?: number; stagger?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (reduced() || !ref.current) return;
    const targets = stagger ? ref.current.children : ref.current;
    gsap.fromTo(targets, { y, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1, ease: "expo.out", delay, stagger: stagger ?? 0,
      scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
    });
  }, { scope: ref });
  return <div ref={ref} className={className}>{children}</div>;
}

/** Counts a figure such as "1,200+" or "47" up from zero when it is seen. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const m = value.match(/^([^\d]*)([\d,.]+)(.*)$/);
  useGSAP(() => {
    if (!m || reduced() || !ref.current) return;
    const target = parseFloat(m[2].replace(/,/g, ""));
    const decimals = (m[2].split(".")[1] ?? "").length;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 2, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
      onUpdate: () => {
        if (ref.current) ref.current.textContent = m[1] + obj.v.toLocaleString("en-KE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + m[3];
      },
    });
  }, { scope: ref });
  return <span ref={ref} className={className}>{value}</span>;
}

/** A pinned row that scrolls sideways while the page scrolls down. */
export function HorizontalScroller({ children, className, counter }: { children: ReactNode; className?: string; counter?: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    if (!wrap.current || !track.current) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => track.current!.scrollWidth - window.innerWidth + 64;
      gsap.to(track.current, {
        x: () => -distance(), ease: "none",
        scrollTrigger: {
          trigger: wrap.current, start: "top top", end: () => `+=${distance()}`, scrub: 0.6, pin: true, invalidateOnRefresh: true,
          onUpdate: (st) => {
            if (count.current && counter) count.current.textContent = String(Math.min(counter, Math.floor(st.progress * counter) + 1)).padStart(2, "0");
          },
        },
      });
    });
    return () => mm.revert();
  }, { scope: wrap });
  return (
    <div ref={wrap} className={cn("relative overflow-hidden", className)}>
      {counter ? (
        <div className="kicker pointer-events-none absolute right-6 top-8 z-10 hidden text-ink-500 md:block">
          <span ref={count}>01</span> / {String(counter).padStart(2, "0")} · Scroll to explore
        </div>
      ) : null}
      <div ref={track} className="flex gap-6 overflow-x-auto px-4 pb-6 md:overflow-visible md:px-16 md:pb-0 [scrollbar-width:none]">
        {children}
      </div>
    </div>
  );
}
