import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["SOFT", "opsz"], style: ["normal", "italic"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "WOPCAA · Women Peace Climate Resilience and Justice Association", template: "%s · WOPCAA" },
  description: "WOPCAA empowers women to lead peacebuilding, climate action and justice across Africa.",
  icons: { icon: "/images/logo.png" },
};

export const viewport: Viewport = { themeColor: "#0f241b" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
