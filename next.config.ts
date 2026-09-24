import type { NextConfig } from "next";

/**
 * The Express backend is hosted on Render (set BACKEND_URL=http://localhost:4000
 * to use a local one). Rewriting /api/* onto it keeps the browser on a single origin, so
 * there is no CORS configuration and no absolute URLs in client code.
 */
const BACKEND_URL = process.env.BACKEND_URL ?? "https://mili-mili-backend.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
