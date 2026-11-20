"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Scene = dynamic(() => import("./scene"), { ssr: false });

/**
 * Loads the WebGL scene only on the client, only when it is near the viewport,
 * and not at all for people who ask for reduced motion or whose browser has no WebGL.
 */
export function LazyScene({ variant = "globe", light, className }: { variant?: "globe" | "field"; light?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      const c = document.createElement("canvas");
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) return;
    } catch { return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect(); } }, { rootMargin: "200px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} aria-hidden>
      {show ? <Scene variant={variant} light={light} /> : null}
    </div>
  );
}
