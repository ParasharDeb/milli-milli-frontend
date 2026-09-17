import type { NextConfig } from "next";

/**
 * The Express backend runs on its own port (4000 by default, since Next holds
 * 3000). Rewriting /api/* onto it keeps the browser on a single origin, so
 * there is no CORS configuration and no absolute URLs in client code.
 */
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
