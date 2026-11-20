import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import "./globals.css";

/**
 * One family for everything. Atkinson Hyperlegible Next was drawn by the
 * Braille Institute to stay readable for people with low vision or under
 * stress, which suits a site where people report abuse, often on small phones.
 */
const atkinson = Atkinson_Hyperlegible_Next({ variable: "--font-atkinson", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "WOPCAA, Women Peace Climate Resilience and Justice Association", template: "%s | WOPCAA" },
  description: "WOPCAA empowers women to lead peacebuilding, climate action and justice across Africa.",
  icons: { icon: "/images/logo.png" },
};

export const viewport: Viewport = { themeColor: "#f4f6f4" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
