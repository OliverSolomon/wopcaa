import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Link as LinkT } from "@/lib/content/schema";
import { RevealText } from "@/components/motion/motion";

export const Container = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("mx-auto w-full max-w-[1400px] px-5 md:px-8", className)}>{children}</div>
);

export function SectionHead({ kicker, heading, intro, dark, className }: { kicker?: string; heading?: string; intro?: string; dark?: boolean; className?: string }) {
  if (!kicker && !heading && !intro) return null;
  return (
    <div className={cn("grid gap-6 md:grid-cols-12 md:items-end", className)}>
      <div className="md:col-span-8">
        {kicker ? <p className={cn("kicker", dark ? "text-sand-300/70" : "text-ink-500")}>{kicker}</p> : null}
        {heading ? <RevealText text={heading} className="display mt-5 text-[2.6rem] md:text-[4.2rem]" /> : null}
      </div>
      {intro ? <p className={cn("text-[17px] leading-relaxed md:col-span-4", dark ? "text-sand-200/75" : "text-ink-500")}>{intro}</p> : null}
    </div>
  );
}

const hasLink = (l?: LinkT | null): l is LinkT => !!l && !!l.label && !!l.href;

export function Button({ link, variant = "primary", className }: { link?: LinkT | null; variant?: "primary" | "ghost" | "light" | "ochre"; className?: string }) {
  if (!hasLink(link)) return null;
  const styles = {
    primary: "bg-forest-900 text-sand-50 hover:bg-forest-800",
    ochre: "bg-ochre-500 text-white hover:bg-ochre-600",
    light: "bg-sand-50 text-forest-950 hover:bg-white",
    ghost: "border border-current/20 hover:bg-current/5",
  }[variant];
  const external = /^https?:/.test(link.href);
  return (
    <Link
      href={link.href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn("group inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-[15px] font-semibold transition-colors", styles, className)}
    >
      {link.label}
      <span className="grid size-6 place-items-center overflow-hidden rounded-full bg-current/10">
        <ArrowUpRight className="size-3.5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
