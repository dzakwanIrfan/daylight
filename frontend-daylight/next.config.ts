import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.tripay.co.id',
        pathname: '/upload/payment-icon/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https', // ⚠️ Production domain
        hostname: 'api.daylightapp.asia',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: true,
  output: 'standalone', 
};

export default nextConfig;