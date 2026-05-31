import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: 'loremflickr.com' }],
  },
};

export default nextConfig;
