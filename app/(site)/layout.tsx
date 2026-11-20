import { getSettings } from "@/lib/content/queries";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <>
      <SmoothScroll />
      <Header settings={settings} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
