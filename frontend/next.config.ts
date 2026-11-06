import type { NextConfig } from "next";

const apiBase = process.env.API_INTERNAL_URL
  || process.env.NEXT_PUBLIC_API_URL
  || "http://localhost:8000/api";
const apiOrigin = new URL(apiBase).origin;

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiOrigin}/api/:path*` },
      { source: "/rice-catalog/:path*", destination: `${apiOrigin}/rice-catalog/:path*` },
      { source: "/storage/:path*", destination: `${apiOrigin}/storage/:path*` },
    ];
  },
};

export default nextConfig;
