"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import {
  Bell, Menu, Moon, Sun, X, ExternalLink, LayoutDashboard, Inbox, Users, MessagesSquare, FileText, Newspaper, Settings,
  ImageIcon, FilePlus2, ShieldCheck, UserRound, type LucideIcon,
} from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";

const ICONS = { LayoutDashboard, Inbox, Users, MessagesSquare, FileText, Newspaper, Settings, ImageIcon, FilePlus2, ShieldCheck, UserRound, Bell };
const Icons = ICONS as Record<string, LucideIcon>;
export type NavLink = { href: string; label: string; icon: keyof typeof ICONS; exact?: boolean };
export type NavGroup = { title?: string; links: NavLink[] };

const THEME_KEY = "wopcaa.dash.theme";

/** The links themselves. Reading the path is request data, so this sits in its own Suspense boundary. */
function NavLinks({ nav, active }: { nav: NavGroup[]; active: boolean }) {
  return active ? <ActiveNav nav={nav} /> : <NavList nav={nav} path="" />;
}
function ActiveNav({ nav }: { nav: NavGroup[] }) {
  return <NavList nav={nav} path={usePathname()} />;
}
function NavList({ nav, path }: { nav: NavGroup[]; path: string }) {
  const isActive = (l: NavLink) => (l.exact ? path === l.href : path === l.href || path.startsWith(l.href + "/"));
  return (
    <>
      {nav.map((g, i) => (
        <div key={i}>
          {g.title ? <p className="faint mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em]">{g.title}</p> : null}
          <div className="space-y-0.5">
            {g.links.map((l) => {
              const Icon = Icons[l.icon];
              return (
                <Link key={l.href} href={l.href} className="nav-item" data-active={isActive(l)}>
                  <Icon className="size-[17px]" strokeWidth={1.75} /> {l.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

export function DashShell({ nav, title, user, children }: { nav: NavGroup[]; title: string; user: ReactNode; children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem(THEME_KEY);
      if (t === "dark" || t === "light") setTheme(t);
    } catch {}
  }, []);
  const flip = () => {
    const t = theme === "dark" ? "light" : "dark";
    setTheme(t);
    try { localStorage.setItem(THEME_KEY, t); } catch {}
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-3 px-3 py-4">
        <span className="relative size-9 overflow-hidden rounded-full bg-white ring-1 ring-black/5"><Image src="/images/logo.png" alt="" fill sizes="36px" className="object-contain p-0.5" /></span>
        <span className="leading-tight"><span className="block font-display text-[17px]">WOPCAA</span><span className="faint block text-[11px]">{title}</span></span>
      </Link>
      {/* Clicking a link closes the mobile drawer. */}
      <nav className="mt-4 flex-1 space-y-6 overflow-y-auto px-2" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}>
        <Suspense fallback={<NavLinks nav={nav} active={false} />}>
          <NavLinks nav={nav} active />
        </Suspense>
      </nav>
      <div className="hairline space-y-1 border-t p-2">
        <Link href="/" className="nav-item" target="_blank"><ExternalLink className="size-[17px]" strokeWidth={1.75} /> View website</Link>
        {user}
      </div>
    </div>
  );

  return (
    <div className="dash min-h-svh" data-theme={theme}>
      <aside className="hairline fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r bg-[var(--d-panel)] lg:block">{sidebar}</aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[268px] bg-[var(--d-panel)] shadow-2xl">{sidebar}</aside>
        </div>
      ) : null}
      <div className="lg:pl-[248px]">
        <header className="hairline sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-[color-mix(in_srgb,var(--d-bg)_85%,transparent)] px-4 backdrop-blur-md md:px-8">
          <div className="lg:hidden"><button className="btn btn-ghost !px-2" onClick={() => setOpen(true)} aria-label="Menu"><Menu className="size-4" /></button></div>
          <div className="ml-auto flex items-center gap-1.5">
            <Bellbox />
            <button onClick={flip} className="btn btn-ghost !px-2.5" aria-label="Toggle dark mode" title={theme === "dark" ? "Light mode" : "Dark mode"}>
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}

type Note = { id: string; title: string; body: string | null; link: string | null; read_at: string | null; created_at: string };

/** Notifications: polled every 30 seconds while the tab is visible. */
function Bellbox() {
  const [items, setItems] = useState<Note[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      if (document.hidden) return;
      try {
        const r = await fetch("/api/notifications", { cache: "no-store" });
        if (!r.ok || stop) return;
        const d = await r.json();
        setItems(d.items);
        setUnread(d.unread);
      } catch {}
    };
    load();
    const t = setInterval(load, 30_000);
    document.addEventListener("visibilitychange", load);
    return () => { stop = true; clearInterval(t); document.removeEventListener("visibilitychange", load); };
  }, []);

  const markAll = async () => {
    await fetch("/api/notifications", { method: "POST", body: JSON.stringify({ all: true }) });
    setUnread(0);
    setItems((x) => x.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="btn btn-ghost relative !px-2.5" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
        <Bell className="size-4" />
        {unread ? <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-[var(--d-ochre)] px-1 text-[10px] font-bold text-white">{unread > 9 ? "9+" : unread}</span> : null}
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="panel absolute right-0 top-11 z-40 w-[340px] overflow-hidden !shadow-2xl">
            <div className="hairline flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              {unread ? <button onClick={markAll} className="text-xs font-semibold text-[var(--d-accent)]">Mark all read</button> : null}
            </div>
            <ul className="max-h-[420px] overflow-y-auto">
              {items.length ? items.map((n) => (
                <li key={n.id}>
                  <Link href={n.link ?? "#"} onClick={() => { setOpen(false); fetch("/api/notifications", { method: "POST", body: JSON.stringify({ id: n.id }) }); }} className="row-hover hairline flex gap-3 border-b px-4 py-3 last:border-0">
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read_at ? "bg-transparent" : "bg-[var(--d-ochre)]")} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{n.title}</span>
                      {n.body ? <span className="muted block truncate text-xs">{n.body}</span> : null}
                      <span className="faint mt-0.5 block text-[11px]">{timeAgo(n.created_at)}</span>
                    </span>
                  </Link>
                </li>
              )) : <li className="muted px-4 py-10 text-center text-sm">You're all caught up.</li>}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
