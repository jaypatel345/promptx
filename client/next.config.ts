import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Old capitalized route paths redirect to their new lowercase slugs via
  // middleware.ts instead of this redirects() config — Next's redirects()
  // path matching is case-insensitive, which would make a rule for
  // "/Enhancer" also match (and redirect-loop) the new "/enhancer" path.
  async rewrites() {
    const target = process.env.API_PROXY_TARGET?.trim().replace(/\/+$/, "");
    if (!target) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${target}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
