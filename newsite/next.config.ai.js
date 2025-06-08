// AI Agent Next.js Configuration
// Uses separate build directory to prevent conflicts with developer builds

/** @type {import('next').NextConfig} */
const aiConfig = {
  // Copy base configuration from next.config.ts
  reactStrictMode: true,
  
  // AI Agent builds use separate directory to prevent conflicts
  distDir: '.next-ai',
  
  // Ensure AI builds don't interfere with developer environment
  experimental: {
    // Add any AI-specific experimental features if needed
  }
};

module.exports = aiConfig;