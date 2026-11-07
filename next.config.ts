import type { NextConfig } from "next";

// Fully static export: the game needs no server, database or API at runtime.
// `out/` can be hosted on Vercel, Cloudflare (Workers static assets / Pages), Netlify, etc.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
