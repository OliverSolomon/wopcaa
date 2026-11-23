import type { Metadata } from "next";
import { Suspense } from "react";
import { Lock, PhoneCall, ShieldCheck, LogOut } from "lucide-react";
import { getSettings } from "@/lib/content/queries";
import { getViewer } from "@/lib/session";
import { Container } from "@/components/sections/parts";
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
      <section className="pb-24 pt-10 md:pt-36">
        <Container className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <h1 className="t-h1">You are not alone.</h1>
              <p className="t-lead mt-5">Tell us what happened. A trained case worker reads every report.</p>
              {/* On a phone the form comes first: help lines stay one tap away, the rest waits for wider screens. */}
              {settings.hotlines.length ? (
                <div className="mt-5 flex flex-wrap items-center gap-2 lg:hidden">
                  <span className="text-sm font-semibold">In danger? Call</span>
                  {settings.hotlines.map((h) => <a key={h.number} href={`tel:${h.number.replace(/\s/g, "")}`} aria-label={`Call ${h.label}`} className="inline-flex min-h-11 items-center rounded-full bg-coral-soft px-4 font-semibold text-coral-ink">{h.number}</a>)}
                </div>
              ) : null}
              <ul className="mt-8 hidden gap-4 lg:grid">
                <li className="flex gap-3"><Lock className="mt-1 size-5 shrink-0 text-green" /> What you write is encrypted before it is stored.</li>
                <li className="flex gap-3"><ShieldCheck className="mt-1 size-5 shrink-0 text-green" /> You can report without giving your name.</li>
                <li className="flex gap-3"><LogOut className="mt-1 size-5 shrink-0 text-green" /> Press Escape twice, or the button at the bottom, to leave this site at once.</li>
              </ul>
              {settings.hotlines.length ? (
                <div className="mt-8 hidden rounded-[20px] bg-coral-soft p-6 lg:block">
                  <p className="flex items-center gap-2 font-semibold"><PhoneCall className="size-4 text-coral-ink" /> In danger right now? Call</p>
                  <ul className="mt-3 grid gap-2.5">
                    {settings.hotlines.map((h) => (
                      <li key={h.number} className="flex items-baseline justify-between gap-3">
                        <span className="text-slate">{h.label}</span>
                        <a className="text-2xl font-semibold text-coral-ink" href={`tel:${h.number.replace(/\s/g, "")}`}>{h.number}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </aside>
          <div className="min-w-0 lg:col-span-8">
            <Suspense fallback={<div className="h-[640px] animate-pulse rounded-[20px] bg-mist-deep" />}>
              <FormWithViewer hotlines={settings.hotlines} />
            </Suspense>
          </div>
        </Container>
      </section>
    </>
  );
}
