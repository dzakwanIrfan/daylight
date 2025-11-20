import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV !== 'production' || true,
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
        protocol: 'https',
        hostname: 'api.daylightapp.asia',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/**',
      }
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;