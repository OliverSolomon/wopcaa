"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The hero's photo frame: real photos from WOPCAA's work, cross-fading slowly
 * with a gentle drift. Pauses on hover so a visitor can read the caption.
 */
export function HeroFrame({ images }: { images: { image: string; caption?: string }[] }) {
  const list = images.filter((i) => i.image);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (list.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % list.length), 6000);
    return () => clearInterval(t);
  }, [list.length, paused]);
  if (!list.length) return null;
  return (
    <figure
      className="arch-tl relative aspect-[4/5] overflow-hidden bg-mist-deep shadow-frame sm:aspect-[5/4] lg:aspect-[4/5]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {list.map((img, n) => (
        <div key={img.image + n} className={cn("absolute inset-0 transition-opacity duration-[1400ms]", n === i ? "opacity-100" : "opacity-0")} aria-hidden={n !== i}>
          <Image
            src={img.image}
            alt={img.caption ?? ""}
            fill
            priority={n === 0}
            sizes="(min-width:1024px) 45vw, 100vw"
            quality={90}
            className={cn("object-cover transition-transform duration-[7000ms] ease-linear", n === i ? "scale-[1.06]" : "scale-100")}
          />
        </div>
      ))}
      <figcaption className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-white/90 px-3.5 py-1.5 text-sm text-forest backdrop-blur">{list[i].caption}</span>
        {list.length > 1 ? (
          <span className="flex gap-1.5" role="tablist" aria-label="Photos">
            {list.map((_, n) => (
              <button key={n} role="tab" aria-selected={n === i} aria-label={`Photo ${n + 1}`} onClick={() => setI(n)}
                className={cn("h-1.5 rounded-full bg-white transition-[width,opacity] duration-300", n === i ? "w-6 opacity-100" : "w-1.5 opacity-60")} />
            ))}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

/** Animated count for a figure such as "34%" when it scrolls into view. */
export function Figure({ value }: { value: string }) {
  const m = value.match(/^([^\d]*)([\d.,]+)(.*)$/);
  const [shown, setShown] = useState(m ? m[1] + "0" + m[3] : value);
  const [el, setEl] = useState<HTMLSpanElement | null>(null);
  useEffect(() => {
    if (!m || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(value); return; }
    const target = parseFloat(m[2].replace(/,/g, ""));
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / 1600), eased = 1 - Math.pow(1 - p, 3);
        setShown(m[1] + Math.round(target * eased).toLocaleString("en-KE") + m[3]);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [el]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span ref={setEl}>{shown}</span>;
}
