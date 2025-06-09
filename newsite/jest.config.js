const nextJest = require('next/jest')
const os = require('os')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Detect M2 MacBook and optimize workers accordingly
function getOptimalWorkerConfig() {
  const cpus = os.cpus()
  const totalCores = cpus.length
  const isM2 = cpus[0]?.model?.includes('Apple') || process.platform === 'darwin'
  
  // M2 MacBook optimization
  if (isM2 && totalCores >= 8) {
    return {
      maxWorkers: process.env.CI ? '100%' : '75%', // Use 6-8 cores on M2
      workerIdleMemoryLimit: '512MB', // Efficient memory management
      maxConcurrency: 8, // Optimal for M2 unified memory architecture
    }
  }
  
  // Fallback for other systems
  return {
    maxWorkers: process.env.CI ? '100%' : '50%',
    workerIdleMemoryLimit: '256MB',
    maxConcurrency: 4,
  }
}

const workerConfig = getOptimalWorkerConfig()

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  
  // Dynamic parallel execution optimization
  ...workerConfig,
  testTimeout: 20000, // 20 second timeout to prevent tests running indefinitely
  
  // Enhanced test isolation for parallel execution  
  // Note: isolateModules is not a valid Jest option, using resetModules instead
  resetModules: true, // Reset module registry between tests for isolation
  
  // Test isolation for parallel safety
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Performance optimization for parallel execution
  cacheDirectory: '<rootDir>/node_modules/.cache/jest', // Cache compiled modules
  detectOpenHandles: false, // Disable in parallel mode for performance
  forceExit: false, // Let Jest handle cleanup properly
  
  // Parallel execution monitoring and reporting
  verbose: process.env.JEST_VERBOSE === 'true',
  silent: process.env.JEST_SILENT === 'true',
  
  // Advanced parallel test distribution
  testSequencer: require.resolve('./test-utils/parallel-test-sequencer.js'),
  
  // Test environment configuration for parallel execution
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  
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