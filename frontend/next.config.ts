import type { NextConfig } from "next";
import { join } from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // // ignoreBuildErrors: true,
  // reactStrictMode: true,
  // outputFileTracingRoot: join(__dirname, ".."),
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
