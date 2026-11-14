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
    ];
  },
};

export default nextConfig;
