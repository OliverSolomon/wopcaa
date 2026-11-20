import type { Metadata } from "next";
import { Suspense } from "react";
import { Lock, PhoneCall, ShieldCheck } from "lucide-react";
import { getSettings } from "@/lib/content/queries";
import { getViewer } from "@/lib/session";
import { Container } from "@/components/sections/parts";
import { RevealText } from "@/components/motion/motion";
import { QuickExit } from "@/components/site/quick-exit";
import { ReportForm } from "@/components/report/report-form";

export const metadata: Metadata = { title: "Report abuse safely", description: "Report gender-based violence or abuse to WOPCAA, anonymously or with an account." };

async function FormWithViewer({ hotlines }: { hotlines: { label: string; number: string }[] }) {
  const v = await getViewer();
  return <ReportForm viewer={v ? { name: v.name, email: v.email } : null} hotlines={hotlines} />;
}

export default async function ReportPage() {
  const settings = await getSettings();
  return (
    <>
      <QuickExit />
      <section className="pb-28 pt-36 md:pt-44">
        <Container className="grid gap-14 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <p className="kicker text-ink-500">Safe reporting</p>
              <RevealText as="h1" text="You are not *alone*." className="display mt-6 text-[3rem] md:text-[4.6rem]" />
              <p className="mt-6 text-lg leading-relaxed text-ink-500">Tell us what happened. A trained member of our case team reads every report and will help you find support.</p>
              <ul className="mt-10 grid gap-4 text-[15px]">
                <li className="flex gap-3"><Lock className="mt-0.5 size-5 shrink-0 text-moss-600" /> Encrypted before it is stored</li>
                <li className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-moss-600" /> Anonymous if you choose, no name needed</li>
                <li className="flex gap-3"><span className="kicker mt-1 shrink-0 rounded bg-ink-900 px-1.5 py-0.5 text-[9px] text-white">ESC×2</span> Press Escape twice to leave instantly</li>
              </ul>
              {settings.hotlines.length ? (
                <div className="mt-10 rounded-3xl bg-forest-900 p-6 text-sand-50">
                  <p className="kicker flex items-center gap-2 text-sand-300/70"><PhoneCall className="size-3.5" /> In danger now? Call</p>
                  <ul className="mt-4 grid gap-3">
                    {settings.hotlines.map((h) => (
                      <li key={h.number} className="flex items-baseline justify-between gap-3">
                        <span className="text-sm text-sand-200/80">{h.label}</span>
                        <a className="font-display text-2xl" href={`tel:${h.number.replace(/\s/g, "")}`}>{h.number}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </aside>
          <div className="lg:col-span-8">
            <Suspense fallback={<div className="h-[640px] animate-pulse rounded-[28px] bg-sand-100" />}>
              <FormWithViewer hotlines={settings.hotlines} />
            </Suspense>
          </div>
        </Container>
      </section>
    </>
  );
}
