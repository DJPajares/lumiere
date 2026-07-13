import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "@lumiere/api-client",
    "@lumiere/dashboard-ui",
    "@lumiere/themes",
    "@lumiere/types",
  ],
};

export default nextConfig;
