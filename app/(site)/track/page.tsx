import type { Metadata } from "next";
import { Container } from "@/components/sections/parts";
import { RevealText } from "@/components/motion/motion";
import { QuickExit } from "@/components/site/quick-exit";
import { TrackReport } from "@/components/report/track";

export const metadata: Metadata = { title: "Track a report", description: "Check the progress of an anonymous report and message the case team." };

export default function TrackPage() {
  return (
    <>
      <QuickExit />
      <section className="pb-28 pt-36 md:pt-44">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="kicker text-ink-500">Anonymous follow-up</p>
            <RevealText as="h1" text="Track your *report*." className="display mt-6 text-[3rem] md:text-[4.6rem]" />
            <p className="mt-6 text-lg text-ink-500">Enter the reference and private key you were given when you sent your report. Reported with an account? Your reports are in your dashboard.</p>
          </div>
          <div className="lg:col-span-7"><TrackReport /></div>
        </Container>
      </section>
    </>
  );
}
