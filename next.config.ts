import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  transpilePackages: ['@shadergradient/react'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shadergradient/react': require('path').resolve(__dirname, 'node_modules/@shadergradient/react/dist/index.mjs'),
    };
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  turbopack: {
    resolveAlias: {
      '@shadergradient/react': require('path').resolve(__dirname, 'node_modules/@shadergradient/react/dist/index.mjs'),
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
