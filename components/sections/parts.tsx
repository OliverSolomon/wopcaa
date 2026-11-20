import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Link as LinkT } from "@/lib/content/schema";

export const Container = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("mx-auto w-full max-w-[1200px] px-5 md:px-8", className)}>{children}</div>
);

/** A section heading with an optional short intro. No eyebrow labels: the heading says what the section is. */
export function SectionHead({ heading, intro, className, light }: { heading?: string; intro?: string; className?: string; light?: boolean }) {
  if (!heading && !intro) return null;
  return (
    <div className={cn("max-w-2xl", className)}>
      {heading ? <h2 className="t-h2">{heading}</h2> : null}
      {intro ? <p className={cn("mt-4 text-lg leading-relaxed", light ? "text-mist/80" : "text-slate")}>{intro}</p> : null}
    </div>
  );
}

const hasLink = (l?: LinkT | null): l is LinkT => !!l && !!l.label && !!l.href;

/**
 * One primary style (deep green), one for safety actions (coral), and a quiet
 * outline. Labels say what happens; no arrows glued on.
 */
export function Button({ link, variant = "primary", className }: { link?: LinkT | null; variant?: "primary" | "safety" | "outline" | "onDark"; className?: string }) {
  if (!hasLink(link)) return null;
  const styles = {
    primary: "bg-green text-white hover:bg-green-hover",
    safety: "bg-coral text-white hover:bg-coral-hover",
    outline: "border border-forest/25 text-forest hover:border-forest/60",
    onDark: "bg-mist text-forest hover:bg-white",
  }[variant];
  const external = /^https?:/.test(link.href);
  return (
    <Link
      href={link.href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn("inline-flex min-h-12 items-center rounded-lg px-5 text-[1rem] font-semibold transition-[color,background-color,border-color,transform] duration-200 active:translate-y-px", styles, className)}
    >
      {link.label}
    </Link>
  );
}
