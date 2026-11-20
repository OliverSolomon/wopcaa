"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, PhoneCall, Search, ShieldCheck, Users } from "lucide-react";
import { COUNTIES } from "@/lib/report-options";
import { cn } from "@/lib/utils";

/**
 * "Your county": pick where you are and the page answers with what you can do
 * from there right now. Nothing is stored; the choice only fills in the forms.
 */
export function CountyPicker({ heading, intro, hotlines }: { heading: string; intro?: string; hotlines: { label: string; number: string }[] }) {
  const [q, setQ] = useState("");
  const [county, setCounty] = useState<string | null>(null);
  const shown = useMemo(() => COUNTIES.filter((c) => c.toLowerCase().includes(q.trim().toLowerCase())), [q]);
  const enc = county ? encodeURIComponent(county) : "";

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="t-h2">{heading}</h2>
          {intro ? <p className="mt-4 text-lg text-slate">{intro}</p> : null}
          <label className="relative mt-8 block">
            <span className="sr-only">Find your county</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-soft" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find your county" className="w-full rounded-full border border-line bg-white py-3.5 pl-11 pr-4 outline-none focus:border-green focus:ring-4 focus:ring-green/10" />
          </label>
          <div className="mt-4 flex max-h-[260px] flex-wrap gap-2 overflow-y-auto pr-1" role="listbox" aria-label="Counties">
            {shown.map((c) => (
              <button key={c} role="option" aria-selected={county === c} onClick={() => setCounty(c)}
                className={cn("rounded-full border px-3.5 py-1.5 text-[0.95rem] transition-colors", county === c ? "border-green bg-green text-white" : "border-line bg-white hover:border-green hover:text-green")}>
                {c}
              </button>
            ))}
            {!shown.length ? <p className="text-slate">No county matches “{q}”.</p> : null}
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className={cn("h-full rounded-[24px] border p-7 transition-colors duration-500 md:p-9", county ? "border-green bg-white" : "border-dashed border-line bg-mist-deep/50")}>
            {county ? (
              <div key={county} className="animate-[fadeIn_.5s_ease-out]">
                <p className="flex items-center gap-2 font-semibold text-green"><MapPin className="size-4" /> {county}</p>
                <p className="mt-3 text-[1.6rem] font-semibold leading-snug">Here is what you can do from {county} today.</p>
                <ul className="mt-7 grid gap-3">
                  <li>
                    <Link href={`/report?county=${enc}`} className="flex items-start gap-4 rounded-2xl bg-coral-soft p-4 hover:bg-coral-wash">
                      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-coral-ink" />
                      <span><span className="block font-semibold">Report abuse safely</span><span className="text-slate">Anonymously if you choose. Your county is filled in for you.</span></span>
                    </Link>
                  </li>
                  <li>
                    <Link href={`/membership?county=${enc}#apply`} className="flex items-start gap-4 rounded-2xl bg-leaf-soft p-4 hover:bg-leaf-wash">
                      <Users className="mt-0.5 size-5 shrink-0 text-green" />
                      <span><span className="block font-semibold">Join women leading in {county}</span><span className="text-slate">Become a member and work with others near you.</span></span>
                    </Link>
                  </li>
                  {hotlines.length ? (
                    <li className="flex items-start gap-4 rounded-2xl border border-line p-4">
                      <PhoneCall className="mt-0.5 size-5 shrink-0 text-green" />
                      <span>
                        <span className="block font-semibold">Free help lines, anywhere in Kenya</span>
                        <span className="text-slate">{hotlines.map((h, i) => <span key={h.number}>{i ? ", " : ""}<a href={`tel:${h.number.replace(/\s/g, "")}`} className="link">{h.number}</a> {h.label.replace(/\s*\(.*\)/, "")}</span>)}</span>
                      </span>
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : (
              <div className="grid h-full min-h-[280px] place-items-center text-center">
                <p className="max-w-[28ch] text-lg text-slate">Choose your county to see how to get help and get involved where you live.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
