import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Improve hot reload and development experience
  experimental: {
    // Enable faster refresh
    optimizeCss: false, // Disable CSS optimization in dev for faster builds
  },
  
  // Ensure proper file watching
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Improve file watching for hot reload
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
        ignored: /node_modules/,
      };
    }
    return config;
  },
  
  // Enable source maps for better debugging
  productionBrowserSourceMaps: false,
  
  // Optimize images
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
