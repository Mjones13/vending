/**
 * Performance Monitoring for Test Suite
 * Utilities to identify slow tests and optimize test execution
 */

interface TestPerformanceData {
  testName: string
  duration: number
  timestamp: number
  category: 'fast' | 'medium' | 'slow' | 'very-slow'
  suite: string
  status: 'passed' | 'failed' | 'skipped'
}

interface TestSuiteMetrics {
  totalTests: number
  totalDuration: number
  averageDuration: number
  slowTests: TestPerformanceData[]
  fastTests: TestPerformanceData[]
  categories: Record<TestPerformanceData['category'], number>
}

class TestPerformanceMonitor {
  private testData: TestPerformanceData[] = []
  private testStartTimes = new Map<string, number>()
  private slowTestThreshold = 5000 // 5 seconds
  private mediumTestThreshold = 2000 // 2 seconds
  private isEnabled = process.env.NODE_ENV === 'test' && process.env.MONITOR_TEST_PERFORMANCE === 'true'

  /**
   * Start monitoring a test
   */
  startTest(testName: string, suiteName: string): void {
    if (!this.isEnabled) return
    
    const key = `${suiteName}::${testName}`
    this.testStartTimes.set(key, Date.now())
  }

  /**
   * End monitoring a test and record performance data
   */
  endTest(testName: string, suiteName: string, status: TestPerformanceData['status']): void {
    if (!this.isEnabled) return
    
    const key = `${suiteName}::${testName}`
    const startTime = this.testStartTimes.get(key)
    
    if (!startTime) {
      console.warn(`Performance monitor: No start time found for test ${key}`)
      return
    }
    
    const duration = Date.now() - startTime
    const category = this.categorizeTestDuration(duration)
    
    const testData: TestPerformanceData = {
      testName,
      duration,
      timestamp: Date.now(),
      category,
      suite: suiteName,
      status
    }
    
    this.testData.push(testData)
    this.testStartTimes.delete(key)
    
    // Log slow tests immediately
    if (category === 'slow' || category === 'very-slow') {
      console.warn(`⚠️ Slow test detected: ${testName} (${duration}ms) in ${suiteName}`)
    }
  }

  /**
   * Categorize test duration
   */
  private categorizeTestDuration(duration: number): TestPerformanceData['category'] {
    if (duration > this.slowTestThreshold) return 'very-slow'
    if (duration > this.mediumTestThreshold) return 'slow'
    if (duration > 1000) return 'medium'
    return 'fast'
  }

  /**
   * Get performance metrics for current test run
   */
  getMetrics(): TestSuiteMetrics {
    const totalTests = this.testData.length
    const totalDuration = this.testData.reduce((sum, test) => sum + test.duration, 0)
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0
    
    const slowTests = this.testData
      .filter(test => test.category === 'slow' || test.category === 'very-slow')
      .sort((a, b) => b.duration - a.duration)
    
    const fastTests = this.testData
      .filter(test => test.category === 'fast')
      .sort((a, b) => a.duration - b.duration)
    
    const categories = this.testData.reduce((acc, test) => {
      acc[test.category] = (acc[test.category] || 0) + 1
      return acc
    }, {} as Record<TestPerformanceData['category'], number>)
    
    return {
      totalTests,
      totalDuration,
      averageDuration,
      slowTests,
      fastTests,
      categories
    }
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = this.getMetrics()
    
    let report = '\n📊 Test Performance Report\n'
    report += '='.repeat(50) + '\n'
    report += `Total Tests: ${metrics.totalTests}\n`
    report += `Total Duration: ${metrics.totalDuration}ms (${(metrics.totalDuration / 1000).toFixed(2)}s)\n`
    report += `Average Duration: ${metrics.averageDuration.toFixed(2)}ms\n\n`
    
    report += '📈 Performance Categories:\n'
    report += `  Fast (< 1s): ${metrics.categories.fast || 0} tests\n`
    report += `  Medium (1-2s): ${metrics.categories.medium || 0} tests\n`
    report += `  Slow (2-5s): ${metrics.categories.slow || 0} tests\n`
    report += `  Very Slow (> 5s): ${metrics.categories['very-slow'] || 0} tests\n\n`
    
    if (metrics.slowTests.length > 0) {
      report += '🐌 Slowest Tests:\n'
      metrics.slowTests.slice(0, 10).forEach((test, index) => {
        report += `  ${index + 1}. ${test.testName} (${test.suite}) - ${test.duration}ms\n`
      })
      report += '\n'
    }
    
    if (metrics.fastTests.length > 0) {
      report += '⚡ Fastest Tests:\n'
      metrics.fastTests.slice(0, 5).forEach((test, index) => {
        report += `  ${index + 1}. ${test.testName} (${test.suite}) - ${test.duration}ms\n`
      })
      report += '\n'
    }
    
    report += '💡 Performance Recommendations:\n'
    if (metrics.slowTests.length > 0) {
      report += '  • Consider optimizing slow tests to improve overall suite performance\n'
      report += '  • Check for unnecessary waiting, complex DOM operations, or heavy computations\n'
    }
    if (metrics.categories['very-slow'] > 0) {
      report += '  • Very slow tests may indicate test environment issues or inefficient patterns\n'
    }
    if (metrics.averageDuration > 1000) {
      report += '  • High average duration suggests room for optimization across the suite\n'
    }
    
    return report
  }

  /**
   * Clear performance data
   */
  clear(): void {
    this.testData = []
    this.testStartTimes.clear()
  }

  /**
   * Export performance data as JSON
   */
  exportData(): TestPerformanceData[] {
    return [...this.testData]
  }
}

// Global performance monitor instance
export const testPerformanceMonitor = new TestPerformanceMonitor()

/**
 * Jest setup hooks for automatic performance monitoring
 */
export function setupPerformanceMonitoring() {
  if (typeof beforeEach === 'function' && typeof afterEach === 'function') {
    let currentTestName = ''
    let currentSuiteName = ''
    
    beforeEach(() => {
      // Get test context from Jest globals
      const testState = (global as any).jasmine?.currentTest || (global as any).jest?.currentTest
      if (testState) {
        currentTestName = testState.fullName || testState.description || 'unknown-test'
        currentSuiteName = testState.parentSuite?.description || 'unknown-suite'
      } else {
        // Fallback: extract from stack trace
        const stack = new Error().stack
        const testMatch = stack?.match(/at.*\s+\(.*[\\\/](.+?)\.test\.[jt]sx?:/)
        currentSuiteName = testMatch?.[1] || 'unknown-suite'
        currentTestName = 'unknown-test'
      }
      
      testPerformanceMonitor.startTest(currentTestName, currentSuiteName)
    })
    
    afterEach(() => {
      // Determine test status (Jest doesn't provide this easily, so we assume passed)
      const status: TestPerformanceData['status'] = 'passed'
      testPerformanceMonitor.endTest(currentTestName, currentSuiteName, status)
    })
  }
}

/**
 * Manual performance measurement for specific test sections
 */
export class TestSectionTimer {
  private startTime: number
  private sectionName: string
  
  constructor(sectionName: string) {
    this.sectionName = sectionName
    this.startTime = Date.now()
  }
  
  end(): number {
    const duration = Date.now() - this.startTime
    
    if (duration > 1000) {
      console.warn(`⏱️ Slow test section: ${this.sectionName} took ${duration}ms`)
    }
    
    return duration
  }
}

/**
 * Utility to measure async operations
 */
export async function measureAsyncOperation<T>(
  name: string,
  operation: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const timer = new TestSectionTimer(name)
  const result = await operation()
  const duration = timer.end()
  
  return { result, duration }
}

/**
 * Hook for measuring component render performance
 */
export function measureRenderPerformance<T extends (...args: any[]) => any>(
  renderFunction: T,
  componentName: string
): T {
  return ((...args: Parameters<T>) => {
    const timer = new TestSectionTimer(`Render ${componentName}`)
    const result = renderFunction(...args)
    timer.end()
    return result
  }) as T
}

/**
 * Performance thresholds for different test categories
 */
export const PERFORMANCE_THRESHOLDS = {
  UNIT_TEST: 500,      // Unit tests should be very fast
  COMPONENT_TEST: 1000, // Component tests can be slightly slower
  INTEGRATION_TEST: 2000, // Integration tests may need more time
  E2E_TEST: 10000,     // E2E tests naturally take longer
  ANIMATION_TEST: 3000, // Animation tests need time for sequences
} as const

/**
 * Assert that a test completes within expected time
 */
export function assertPerformance(
  testType: keyof typeof PERFORMANCE_THRESHOLDS,
  actualDuration: number,
  testName: string = 'test'
): void {
  const threshold = PERFORMANCE_THRESHOLDS[testType]
  
  if (actualDuration > threshold) {
    console.warn(
      `⚠️ Performance assertion failed: ${testName} took ${actualDuration}ms ` +
      `(expected < ${threshold}ms for ${testType})`
    )
  }
}

// Auto-setup performance monitoring if enabled
if (process.env.MONITOR_TEST_PERFORMANCE === 'true') {
  setupPerformanceMonitoring()
}