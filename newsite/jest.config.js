const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  
  // Parallel execution optimization for M2 MacBook
  maxWorkers: process.env.CI ? '100%' : '75%', // Use 6-8 cores on M2, leave some for system
  workerIdleMemoryLimit: '512MB', // Manage memory per worker
  maxConcurrency: 8, // Limit concurrent tests per worker
  testTimeout: 30000, // Increased timeout for parallel execution overhead
  
  // Test isolation for parallel safety
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Test categorization for selective parallel execution
  projects: [
    {
      displayName: 'unit',
      testMatch: [
        '<rootDir>/__tests__/components/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/__tests__/hooks/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/__tests__/utils/**/*.test.{js,jsx,ts,tsx}'
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testEnvironment: 'jsdom',
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/__tests__/pages/**/*.test.{js,jsx,ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testEnvironment: 'jsdom',
    },
    {
      displayName: 'animations',
      testMatch: ['<rootDir>/__tests__/animations/**/*.test.{js,jsx,ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testEnvironment: 'jsdom',
    }
  ],
  
  // Default test matching (when not using projects)
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/e2e/'
  ],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!pages/_app.tsx',
    '!pages/_document.tsx',
    '!pages/api/**/*',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Specific thresholds for critical components
    'components/Layout.tsx': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'pages/index.tsx': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  coverageDirectory: 'coverage',
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)