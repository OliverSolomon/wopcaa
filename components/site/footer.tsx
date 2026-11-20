import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { SiteSettings } from "@/lib/content/schema";
import { NewsletterForm } from "./forms";

export async function Footer({ settings }: { settings: SiteSettings }) {
  "use cache";
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark relative overflow-hidden bg-forest-950 text-sand-100">
      <div className="mx-auto max-w-[1400px] px-5 pb-10 pt-24 md:px-8">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="kicker text-sand-300/60">Keep in touch</p>
            <h2 className="display mt-5 max-w-xl text-5xl md:text-6xl">Stories from the <em>grassroots</em>, in your inbox.</h2>
            <NewsletterForm />
          </div>
          <div className="grid grid-cols-2 gap-10 md:col-span-6 md:grid-cols-3">
            {settings.nav.slice(0, 3).map((group) => (
              <div key={group.label}>
                <p className="kicker text-sand-300/60">{group.label}</p>
                <ul className="mt-5 space-y-2.5 text-[15px]">
                  {(group.children?.length ? group.children : [group]).map((l) => (
                    <li key={l.href + l.label}><Link href={l.href} className="link-underline text-sand-100/85 hover:text-white">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="kicker text-sand-300/60">Contact</p>
              <ul className="mt-5 space-y-2.5 text-[15px] text-sand-100/85">
                {settings.email ? <li><a href={`mailto:${settings.email}`} className="link-underline">{settings.email}</a></li> : null}
                {settings.phone ? <li><a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="link-underline">{settings.phone}</a></li> : null}
                {settings.address ? <li className="whitespace-pre-line">{settings.address}</li> : null}
              </ul>
            </div>
            <div>
              <p className="kicker text-sand-300/60">Follow</p>
              <ul className="mt-5 space-y-2.5 text-[15px]">
                {settings.socials.map((s) => (
                  <li key={s.href}><a href={s.href} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-1 text-sand-100/85 hover:text-white">{s.label} <ArrowUpRight className="size-3.5" /></a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-24 flex items-end justify-between gap-6 border-t border-white/10 pt-10">
          <div className="flex items-center gap-4">
            <span className="relative size-14 overflow-hidden rounded-full bg-white">
              <Image src={settings.logo || "/images/logo.png"} alt="" fill sizes="56px" className="object-contain p-1" />
            </span>
            <p className="max-w-md text-sm text-sand-100/60">{settings.footerBlurb || settings.name}</p>
          </div>
          <Link href="/report" className="hidden items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm hover:bg-white/5 md:inline-flex">
            Report abuse safely <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <p className="font-display mt-14 select-none text-[19vw] leading-[0.8] tracking-[-0.05em] text-white/[0.04] md:text-[15vw]" aria-hidden>{settings.shortName}</p>
        <div className="mt-6 flex flex-wrap justify-between gap-4 text-xs text-sand-100/45">
          <p>© {year} {settings.name}</p>
          <p className="flex gap-5"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/track" className="hover:text-white">Track a report</Link><Link href="/admin" className="hover:text-white">Staff</Link></p>
        </div>
      </div>
    </footer>
  );
}
