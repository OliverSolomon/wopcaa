import { getSettings } from "@/lib/content/queries";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

/** Pages whose first section is dark, so the header starts in light text over it. */
const DARK_TOP = ["/"];

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <>
      <SmoothScroll />
      <Header settings={settings} darkTop={DARK_TOP} />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  );
}
