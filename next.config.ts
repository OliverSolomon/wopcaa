import type { NextConfig } from "next";

const storageHost = (() => {
  try { return new URL(process.env.AWS_ENDPOINT_URL_S3 ?? "").hostname; } catch { return ""; }
})();

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" }, // a report page must never leak where someone came from
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  images: {
    // 90 is for full-bleed and large photos; everything else stays at the default 75.
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
    remotePatterns: storageHost ? [{ protocol: "https", hostname: storageHost }] : [],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The studio preview may be framed by this site only; everything else by nobody.
      { source: "/((?!preview).*)", headers: [{ key: "X-Frame-Options", value: "DENY" }] },
      { source: "/preview/:path*", headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }] },
      { source: "/(admin|account|report|track)/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
};

export default nextConfig;
