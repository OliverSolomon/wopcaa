"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import type { SiteSettings } from "@/lib/content/schema";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

export function Header({ settings, darkTop }: { settings: SiteSettings; darkTop: string[] }) {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const overDark = darkTop.includes(path) && !scrolled && !open;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);

  return (
    <>
      {settings.announcement?.enabled && settings.announcement.text ? (
        <div className="relative z-50 bg-ochre-500 px-4 py-2 text-center text-[13px] text-white">
          {settings.announcement.href ? <Link href={settings.announcement.href} className="link-underline">{settings.announcement.text} →</Link> : settings.announcement.text}
        </div>
      ) : null}
      <header
        className={cn(
          "sticky top-0 z-40 transition-[background,color,box-shadow,backdrop-filter] duration-500",
          overDark ? "text-sand-50" : "text-ink-900",
          scrolled || open ? "bg-sand-50/85 shadow-[0_1px_0_rgb(0_0_0/0.06)] backdrop-blur-xl" : "bg-transparent",
          darkTop.includes(path) ? "-mb-[76px]" : "",
        )}
      >
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center gap-6 px-5 md:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label={`${settings.shortName} home`}>
            <span className="relative size-10 overflow-hidden rounded-full bg-white ring-1 ring-black/5">
              <Image src={settings.logo || "/images/logo.png"} alt="" fill sizes="40px" className="object-contain p-0.5" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[19px] tracking-tight">{settings.shortName}</span>
              <span className={cn("kicker hidden text-[9.5px] sm:block", overDark ? "text-sand-200/70" : "text-ink-500")}>Peace · Climate · Justice</span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main">
            {settings.nav.map((item) =>
              item.children?.length ? (
                <div key={item.label} className="group relative">
                  <Link href={item.href || "#"} className="flex items-center gap-1 rounded-full px-3.5 py-2 text-[14.5px] transition-colors hover:bg-black/5 group-hover:bg-black/5">
                    {item.label} <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="min-w-60 rounded-2xl bg-sand-50 p-2 text-ink-900 shadow-[0_20px_60px_-20px_rgb(0_0_0/0.35)] ring-1 ring-black/5">
                      {item.children.map((c) => (
                        <Link key={c.href + c.label} href={c.href} className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[14px] hover:bg-sand-100">
                          {c.label} <ArrowUpRight className="size-3.5 opacity-40" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={item.label} href={item.href} className={cn("rounded-full px-3.5 py-2 text-[14.5px] transition-colors hover:bg-black/5", path === item.href && "font-semibold")}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-4">
            <Link href={session?.user ? "/account" : "/sign-in"} className="hidden rounded-full px-3.5 py-2 text-[14px] hover:bg-black/5 md:block">
              {session?.user ? "My account" : "Sign in"}
            </Link>
            <Link href="/report" className="group inline-flex items-center gap-2 rounded-full bg-ochre-500 px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-ochre-600">
              Report abuse <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <button onClick={() => setOpen((o) => !o)} className="rounded-full p-2.5 hover:bg-black/5 lg:hidden" aria-label="Menu" aria-expanded={open}>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="max-h-[calc(100dvh-76px)] overflow-y-auto border-t border-black/5 bg-sand-50 px-5 pb-8 pt-4 lg:hidden">
            {settings.nav.map((item) => (
              <div key={item.label} className="border-b border-black/5 py-3">
                <Link href={item.href || "#"} className="font-display text-2xl">{item.label}</Link>
                {item.children?.length ? (
                  <div className="mt-2 grid gap-1 pl-1">
                    {item.children.map((c) => <Link key={c.href + c.label} href={c.href} className="py-1 text-ink-500">{c.label}</Link>)}
                  </div>
                ) : null}
              </div>
            ))}
            <Link href={session?.user ? "/account" : "/sign-in"} className="mt-5 block font-semibold">{session?.user ? "My account" : "Sign in"}</Link>
          </div>
        ) : null}
      </header>
    </>
  );
}
