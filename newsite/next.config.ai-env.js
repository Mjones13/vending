// AI Agent Next.js Configuration - Environment-based
// Activated when AI_BUILD=true environment variable is set

const baseConfig = {
  reactStrictMode: true,
};

const aiConfig = {
  ...baseConfig,
  distDir: '.next-ai'
};

// Use AI config when AI_BUILD environment variable is set
module.exports = process.env.AI_BUILD === 'true' ? aiConfig : baseConfig;