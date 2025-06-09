/**
 * Test Isolation Utilities for Parallel Execution
 * Provides utilities to ensure tests run safely in parallel
 */

/**
 * Creates an isolated test environment for parallel execution
 */
export class TestIsolation {
  private originalEnv: Record<string, any> = {}
  private testId: string
  
  constructor() {
    this.testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Set up isolated test environment
   */
  setup() {
    // Store original environment, ensuring RAF/cAF have polyfills
    this.originalEnv = {
      requestAnimationFrame: global.requestAnimationFrame || ((callback: FrameRequestCallback) => {
        return setTimeout(callback, 16) as unknown as number;
      }),
      cancelAnimationFrame: global.cancelAnimationFrame || ((id: number) => {
        clearTimeout(id);
      }),
      setTimeout: global.setTimeout,
      clearTimeout: global.clearTimeout,
      setInterval: global.setInterval,
      clearInterval: global.clearInterval,
    }

    // Use fake timers for deterministic testing
    jest.useFakeTimers()
    
    // Clear all mocks for clean state
    jest.clearAllMocks()
    jest.resetAllMocks()
  }

  /**
   * Clean up test environment
   */
  cleanup() {
    // Restore real timers
    jest.useRealTimers()
    
    // Restore original functions
    Object.assign(global, this.originalEnv)
    
    // Final mock cleanup
    jest.restoreAllMocks()
    
    // Clean up any test-specific DOM elements
    this.cleanupDOM()
  }

  /**
   * Clean up DOM elements created during testing
   */
  private cleanupDOM() {
    // Remove any test-specific styles
    const testStyles = document.querySelectorAll(`[data-test-id="${this.testId}"]`)
    testStyles.forEach(element => element.remove())
    
    // Clean up any remaining test elements
    const testElements = document.querySelectorAll('[data-testid]')
    testElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
  }

  /**
   * Create isolated test data
   */
  createTestData<T>(factory: () => T): T {
    return factory()
  }

  /**
   * Get unique test identifier
   */
  getTestId(): string {
    return this.testId
  }
}

/**
 * Hook for using test isolation in tests
 */
export function useTestIsolation() {
  let isolation: TestIsolation

  beforeEach(() => {
    isolation = new TestIsolation()
    isolation.setup()
  })

  afterEach(() => {
    if (isolation) {
      isolation.cleanup()
    }
  })

  return {
    getIsolation: () => isolation,
    createTestData: <T>(factory: () => T) => isolation.createTestData(factory),
    getTestId: () => isolation.getTestId(),
  }
}

/**
 * Creates isolated mock functions that don't interfere with parallel tests
 */
export function createIsolatedMock<T extends (...args: any[]) => any>(
  implementation?: T
): jest.MockedFunction<T> {
  const mock = jest.fn(implementation) as jest.MockedFunction<T>
  
  // Ensure mock is cleared in this test's cleanup
  beforeEach(() => {
    mock.mockClear()
  })
  
  return mock
}

/**
 * Creates an isolated test database/storage for parallel execution
 */
export function createIsolatedTestStorage<T = any>() {
  const testId = `storage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const storage = new Map<string, T>()

  return {
    testId,
    get: (key: string) => storage.get(key),
    set: (key: string, value: T) => storage.set(key, value),
    delete: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
    has: (key: string) => storage.has(key),
    size: () => storage.size,
  }
}

/**
 * Parallel-safe animation testing utilities
 */
export class AnimationTestIsolation {
  private animationId: string
  private originalAnimationFrame: typeof requestAnimationFrame
  private originalCancelAnimationFrame: typeof cancelAnimationFrame

  constructor() {
    this.animationId = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    // Store current implementations, which should be our polyfills
    // If they don't exist, create polyfills now
    this.originalAnimationFrame = global.requestAnimationFrame || ((callback: FrameRequestCallback) => {
      return setTimeout(callback, 16) as unknown as number;
    })
    this.originalCancelAnimationFrame = global.cancelAnimationFrame || ((id: number) => {
      clearTimeout(id);
    })
  }

  /**
   * Setup isolated animation testing environment
   */
  setupAnimationTesting() {
    // Use fake timers for deterministic animation testing
    jest.useFakeTimers()
    
    // Mock animation frame with immediate execution for testing
    global.requestAnimationFrame = jest.fn((callback) => {
      return setTimeout(callback, 16) // Simulate 60fps
    })
    
    global.cancelAnimationFrame = jest.fn((id) => {
      clearTimeout(id)
    })
  }

  /**
   * Advance animations by specified time
   */
  advanceAnimationTime(ms: number) {
    jest.advanceTimersByTime(ms)
  }

  /**
   * Wait for animation frame
   */
  async waitForAnimationFrame() {
    return new Promise(resolve => {
      const originalRAF = global.requestAnimationFrame
      originalRAF(resolve)
    })
  }

  /**
   * Cleanup animation testing environment
   */
  cleanup() {
    jest.useRealTimers()
    // Restore the implementations we stored, which should be the polyfills
    // Never set these to undefined
    global.requestAnimationFrame = this.originalAnimationFrame || ((callback: FrameRequestCallback) => {
      return setTimeout(callback, 16) as unknown as number;
    })
    global.cancelAnimationFrame = this.originalCancelAnimationFrame || ((id: number) => {
      clearTimeout(id);
    })
  }
}

/**
 * Hook for animation testing isolation
 */
export function useAnimationTestIsolation() {
  let animationIsolation: AnimationTestIsolation

  beforeEach(() => {
    animationIsolation = new AnimationTestIsolation()
    animationIsolation.setupAnimationTesting()
  })

  afterEach(() => {
    if (animationIsolation) {
      animationIsolation.cleanup()
    }
  })

  return {
    advanceTime: (ms: number) => animationIsolation.advanceAnimationTime(ms),
    waitForFrame: () => animationIsolation.waitForAnimationFrame(),
  }
}