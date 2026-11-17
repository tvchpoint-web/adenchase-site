import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  // Retired routes from the previous site structure.
  async redirects() {
    return [
      { source: "/approach", destination: "/about", permanent: true },
      { source: "/expertise", destination: "/capabilities", permanent: true },
      { source: "/engagement", destination: "/contact", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // Previews and other *.vercel.app addresses are never indexed (decided per request, by host,
      // so promoting a preview build to production cannot carry it over).
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?<host>.+)\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // Edition PDFs and graphics: the HTML article is the canonical, indexable source.
      {
        source: "/editions/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
          { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
