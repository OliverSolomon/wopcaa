"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import type { SiteSettings } from "@/lib/content/schema";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

export function Header({ settings }: { settings: SiteSettings; darkTop?: string[] }) {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);

  const active = (href: string) => href !== "/" && (path === href || path.startsWith(href + "/"));

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      {settings.announcement?.enabled && settings.announcement.text ? (
        <div className="relative z-50 bg-forest px-4 py-2.5 text-center text-sm text-mist">
          {settings.announcement.href ? <Link href={settings.announcement.href} className="underline underline-offset-4">{settings.announcement.text}</Link> : settings.announcement.text}
        </div>
      ) : null}
      <header className={cn("sticky top-0 z-40 border-b bg-mist/90 backdrop-blur-md transition-[border-color,box-shadow] duration-300", scrolled || open ? "border-line shadow-header" : "border-transparent")}>
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center gap-6 px-5 md:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label={`${settings.shortName} home`}>
            <span className="relative size-10 overflow-hidden rounded-full bg-white ring-1 ring-line">
              <Image src={settings.logo || "/images/logo.png"} alt="" fill sizes="40px" className="object-contain p-0.5" priority />
            </span>
            <span className="text-[1.15rem] font-semibold">{settings.shortName}</span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main">
            {settings.nav.map((item) =>
              item.children?.length ? (
                <div key={item.label} className="group relative">
                  <Link href={item.href || "#"} className={cn("flex items-center gap-1 rounded-lg px-3 py-2 text-[0.95rem] hover:text-green", active(item.href) && "text-green")}>
                    {item.label} <ChevronDown className="size-3.5 opacity-60 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-[opacity,visibility] duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="min-w-56 rounded-xl border border-line bg-white p-1.5 shadow-menu">
                      {item.children.map((c) => (
                        <Link key={c.href + c.label} href={c.href} className="block rounded-lg px-3.5 py-2.5 text-[0.95rem] hover:bg-mist hover:text-green">{c.label}</Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={item.label} href={item.href} className={cn("rounded-lg px-3 py-2 text-[0.95rem] hover:text-green", active(item.href) && "text-green")}>{item.label}</Link>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-4">
            <Link href={session?.user ? "/go" : "/sign-in"} className="hidden rounded-lg px-3 py-2 text-[0.95rem] hover:text-green md:block">
              {session?.user ? "My account" : "Sign in"}
            </Link>
            <Link href="/report" className="inline-flex min-h-11 items-center rounded-full bg-coral px-5 text-[0.95rem] font-semibold text-white transition-[background-color,transform] hover:bg-coral-hover active:translate-y-px">
              Report abuse
            </Link>
            <button onClick={() => setOpen((o) => !o)} className="rounded-lg p-2.5 lg:hidden" aria-label="Menu" aria-expanded={open}>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-line bg-mist px-5 pb-8 pt-2 lg:hidden">
            {settings.nav.map((item) => (
              <div key={item.label} className="border-b border-line py-3">
                <Link href={item.href || "#"} className="text-xl font-semibold">{item.label}</Link>
                {item.children?.length ? (
                  <div className="mt-2 grid gap-1">
                    {item.children.map((c) => <Link key={c.href + c.label} href={c.href} className="py-1 text-slate">{c.label}</Link>)}
                  </div>
                ) : null}
              </div>
            ))}
            <Link href={session?.user ? "/go" : "/sign-in"} className="mt-5 block font-semibold text-green">{session?.user ? "My account" : "Sign in"}</Link>
          </div>
        ) : null}
      </header>
    </>
  );
}
