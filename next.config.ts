import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Comment out or remove this line to allow for dynamic content fetching at runtime.
  // output: "export",
  images: {
    unoptimized: true,
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
};

export default nextConfig;