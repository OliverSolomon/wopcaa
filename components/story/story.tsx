"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Scene = { image: string; line: string; sub?: string; note?: string; weather?: "none" | "rain" | "embers" | "seeds" };
type Weather = NonNullable<Scene["weather"]>;

/**
 * The home page's film. Scroll is the timeline: the section pins, and each
 * scene's photograph pushes in slowly while its line arrives like a subtitle,
 * holds, and gives way to the next. A weather layer (rain, embers, rising
 * seeds) sits over the photographs and changes with the scene.
 *
 * With reduced motion the scenes are simply stacked, one per screen, still.
 */
export function Story({ scenes, ending }: { scenes: Scene[]; ending?: { line: string; primary?: { label: string; href: string }; secondary?: { label: string; href: string } } }) {
  const root = useRef<HTMLDivElement>(null);
  const weather = useRef<Weather>("none");
  const progressBar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const shots = gsap.utils.toArray<HTMLElement>("[data-shot]", el);
      const lines = gsap.utils.toArray<HTMLElement>("[data-line]", el);
      const end = el.querySelector<HTMLElement>("[data-end]");
      gsap.set(shots.slice(1), { autoAlpha: 0 });
      gsap.set(lines, { autoAlpha: 0, y: 40 });
      if (end) gsap.set(end, { autoAlpha: 0, y: 40 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el, pin: true, start: "top top", end: () => `+=${(scenes.length + 1) * window.innerHeight * 0.9}`, scrub: 0.8,
          onUpdate: (st) => {
            const i = Math.min(scenes.length - 1, Math.floor(st.progress * (scenes.length + 0.6)));
            weather.current = scenes[i]?.weather ?? "none";
            if (progressBar.current) progressBar.current.style.transform = `scaleX(${st.progress})`;
          },
        },
      });
      shots.forEach((shot, i) => {
        const img = shot.querySelector("[data-cam]");
        const at = i * 1;
        if (i > 0) tl.to(shot, { autoAlpha: 1, duration: 0.35 }, at - 0.15);
        // A slow camera move on every shot: push in, drift a little.
        tl.fromTo(img, { scale: 1.18, xPercent: i % 2 ? -2 : 2 }, { scale: 1.02, xPercent: 0, duration: 1.2 }, at - 0.15);
        tl.to(lines[i], { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" }, at + 0.05)
          .to(lines[i], { autoAlpha: 0, y: -30, duration: 0.2, ease: "power2.in" }, at + 0.72);
      });
      if (end) tl.to(end, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, scenes.length - 0.1).to({}, { duration: 0.4 });
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [scenes.length] });

  return (
    <section aria-label="Our story" className="relative bg-forest text-white">
      <div ref={root} className="relative overflow-hidden motion-safe:h-[100svh] motion-reduce:space-y-0">
        {scenes.map((s, i) => (
          <div key={i} data-shot className="inset-0 motion-safe:absolute motion-reduce:relative motion-reduce:h-[100svh]">
            <div data-cam className="absolute inset-0 will-change-transform">
              <Image src={s.image} alt="" fill sizes="100vw" priority={i === 0} className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/45 to-forest/20" />
            <div data-line className="absolute inset-x-0 bottom-0 mx-auto max-w-[1200px] px-5 pb-24 md:px-8 md:pb-28">
              <p className="max-w-[18ch] text-[clamp(2.2rem,5.5vw,4.4rem)] font-semibold leading-[1.05] tracking-[-0.015em]">{s.line}</p>
              {s.sub ? <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-white/85 md:text-xl">{s.sub}</p> : null}
              {s.note ? <p className="mt-4 text-sm text-white/60">{s.note}</p> : null}
            </div>
          </div>
        ))}

        {ending ? (
          <div data-end className="inset-0 z-10 grid place-items-center bg-forest/80 px-5 text-center backdrop-blur-[2px] motion-safe:absolute motion-reduce:relative motion-reduce:py-28">
            <div>
              <p className="mx-auto max-w-[20ch] text-[clamp(2.2rem,5.5vw,4.4rem)] font-semibold leading-[1.05]">{ending.line}</p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {ending.primary?.label ? <Link href={ending.primary.href} className="inline-flex min-h-12 items-center rounded-full bg-mist px-6 font-semibold text-forest hover:bg-white">{ending.primary.label}</Link> : null}
                {ending.secondary?.label ? <Link href={ending.secondary.href} className="inline-flex min-h-12 items-center rounded-full bg-coral px-6 font-semibold text-forest hover:bg-coral-hover">{ending.secondary.label}</Link> : null}
              </div>
            </div>
          </div>
        ) : null}

        <WeatherLayer mode={weather} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-white/10 motion-reduce:hidden">
          <div ref={progressBar} className="h-full origin-left scale-x-0 bg-leaf" />
        </div>
      </div>
    </section>
  );
}

/* ───────────── Weather: rain for the floods, embers for the drought, seeds for what grows back ───────────── */

function WeatherLayer({ mode }: { mode: React.RefObject<Weather> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = ref.current!, ctx = c.getContext("2d")!;
    let w = 0, h = 0, raf = 0, visible = false, last = performance.now(), mix = { rain: 0, embers: 0, seeds: 0 };
    const N = 220;
    const ps = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), s: Math.random(), v: 0.5 + Math.random() }));
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const m = mode.current ?? "none";
      // Cross-fade between weathers instead of switching.
      (["rain", "embers", "seeds"] as const).forEach((k) => { mix[k] += ((m === k ? 1 : 0) - mix[k]) * Math.min(1, dt * 2.5); });
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        if (mix.rain > 0.01) {
          p.y += dt * (1.3 + p.v) ; p.x += dt * 0.12;
          ctx.strokeStyle = `rgba(220,236,245,${0.35 * mix.rain * (0.4 + p.s)})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x * w, p.y * h); ctx.lineTo(p.x * w - 6, p.y * h - 22 - p.s * 14); ctx.stroke();
        }
        if (mix.embers > 0.01) {
          p.y -= dt * 0.05 * p.v; p.x += Math.sin(now / 900 + p.s * 10) * dt * 0.02;
          ctx.fillStyle = `rgba(228,161,150,${0.55 * mix.embers * p.s})`;
          ctx.beginPath(); ctx.arc(p.x * w, p.y * h, 1 + p.s * 2.2, 0, Math.PI * 2); ctx.fill();
        }
        if (mix.seeds > 0.01) {
          p.y -= dt * 0.035 * p.v; p.x += Math.sin(now / 1400 + p.s * 6) * dt * 0.015;
          ctx.fillStyle = `rgba(27,174,112,${0.6 * mix.seeds * p.s})`;
          ctx.beginPath(); ctx.ellipse(p.x * w, p.y * h, 1.4 + p.s * 2, 0.8 + p.s, p.s * 3, 0, Math.PI * 2); ctx.fill();
        }
        if (p.y > 1.05) { p.y = -0.05; p.x = Math.random(); }
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        if (p.x > 1.05) p.x = -0.05; if (p.x < -0.05) p.x = 1.05;
      }
      if (visible) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; cancelAnimationFrame(raf); if (visible) { last = performance.now(); raf = requestAnimationFrame(tick); } });
    io.observe(c);
    const ro = new ResizeObserver(resize); ro.observe(c); resize();
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  }, [mode]);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0 z-[5] size-full motion-reduce:hidden" aria-hidden />;
}
