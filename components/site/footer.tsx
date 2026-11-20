import Link from "next/link";
import Image from "next/image";
import type { SiteSettings } from "@/lib/content/schema";
import { NewsletterForm } from "./forms";

export async function Footer({ settings }: { settings: SiteSettings }) {
  "use cache";
  const year = new Date().getFullYear();
  return (
    <footer className="mt-10 bg-forest text-mist">
      <div className="mx-auto max-w-[1200px] px-5 pb-10 pt-16 md:px-8 md:pt-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="relative size-12 overflow-hidden rounded-full bg-white"><Image src={settings.logo || "/images/logo.png"} alt="" fill sizes="48px" className="object-contain p-0.5" /></span>
              <span className="text-lg font-semibold">{settings.shortName}</span>
            </div>
            <p className="mt-5 max-w-[42ch] text-mist/70">{settings.footerBlurb || settings.name}</p>
            <h2 className="mt-10 text-lg font-semibold">Get our newsletter</h2>
            <p className="mt-1 text-sm text-mist/60">Stories and events from our work, about once a month.</p>
            <NewsletterForm />
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
            {settings.nav.filter((g) => g.children?.length).slice(0, 3).map((group) => (
              <div key={group.label}>
                <h2 className="font-semibold">{group.label}</h2>
                <ul className="mt-4 space-y-2.5">
                  {group.children!.map((l) => <li key={l.href + l.label}><Link href={l.href} className="text-mist/70 hover:text-white">{l.label}</Link></li>)}
                </ul>
              </div>
            ))}
            <div>
              <h2 className="font-semibold">Contact</h2>
              <ul className="mt-4 space-y-2.5 text-mist/70">
                {settings.email ? <li><a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a></li> : null}
                {settings.phone ? <li><a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-white">{settings.phone}</a></li> : null}
                {settings.address ? <li className="whitespace-pre-line">{settings.address}</li> : null}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold">Follow us</h2>
              <ul className="mt-4 space-y-2.5">
                {settings.socials.map((s) => <li key={s.href}><a href={s.href} target="_blank" rel="noopener noreferrer" className="text-mist/70 hover:text-white">{s.label}</a></li>)}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-mist/15 pt-6 text-sm text-mist/55">
          <p>© {year} {settings.name}</p>
          <p className="flex flex-wrap gap-5">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/track" className="hover:text-white">Follow up on a report</Link>
            <Link href="/sign-in" className="hover:text-white">Staff sign in</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
