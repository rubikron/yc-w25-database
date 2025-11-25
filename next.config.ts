import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Uncomment for static export (requires generateStaticParams)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
