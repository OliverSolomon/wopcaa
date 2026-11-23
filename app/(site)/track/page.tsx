import type { Metadata } from "next";
import { Container } from "@/components/sections/parts";
import { QuickExit } from "@/components/site/quick-exit";
import { TrackReport } from "@/components/report/track";

export const metadata: Metadata = { title: "Follow up on a report", description: "Check the progress of an anonymous report and message the case team." };

export default function TrackPage() {
  return (
    <>
      <QuickExit />
      <section className="pb-24 pt-10 md:pt-36">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h1 className="t-h1">Follow up on your report.</h1>
            <p className="t-lead mt-5">Enter the reference and private key you were given when you sent your report. If you reported with an account, your reports are in your dashboard.</p>
          </div>
          <div className="lg:col-span-7"><TrackReport /></div>
        </Container>
      </section>
    </>
  );
}
