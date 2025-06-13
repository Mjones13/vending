import { act } from '@testing-library/react';

/**
 * Timer helper utilities that automatically wrap timer operations in React's act()
 * to prevent act() warnings in tests.
 */

/**
 * Advance timers by time with automatic act() wrapping
 * @param ms - Number of milliseconds to advance
 */
export async function advanceTimersByTimeAndAct(ms: number): Promise<void> {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

/**
 * Run all timers with act() wrapping
 */
export async function runAllTimersAndAct(): Promise<void> {
  await act(async () => {
    jest.runAllTimers();
  });
}

/**
 * Run only pending timers with act() wrapping
 */
export async function runOnlyPendingTimersAndAct(): Promise<void> {
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
}

/**
 * Run timers to time with act() wrapping
 * @param ms - Target time in milliseconds
 */
export async function runTimersToTimeAndAct(ms: number): Promise<void> {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

/**
 * Clear all timers with act() wrapping
 */
export async function clearAllTimersAndAct(): Promise<void> {
  await act(async () => {
    jest.clearAllTimers();
  });
}

/**
 * Wait for next animation frame with act() wrapping
 * Works with both real and mocked RAF
 */
export async function waitForAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    act(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

/**
 * Wait for multiple animation frames
 * @param count - Number of frames to wait
 */
export async function waitForAnimationFrames(count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await waitForAnimationFrame();
  }
}

/**
 * Advance timers to next frame (for Jest 27+)
 * Advances timers by 16ms (approximately one frame at 60fps)
 */
export async function advanceTimersToNextFrame(): Promise<void> {
  await advanceTimersByTimeAndAct(16);
}

/**
 * Wait for a specific timeout with act() wrapping
 * Useful for real timer scenarios
 * @param ms - Milliseconds to wait
 */
export async function waitForTimeout(ms: number): Promise<void> {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, ms));
  });
}

/**
 * Execute a callback after advancing timers
 * @param ms - Milliseconds to advance before executing callback
 * @param callback - Function to execute after advancing timers
 */
export async function advanceTimersAndExecute(
  ms: number,
  callback: () => void | Promise<void>
): Promise<void> {
  await advanceTimersByTimeAndAct(ms);
  await act(async () => {
    await callback();
  });
}

/**
 * Flush all pending microtasks and timers
 * Useful for ensuring all async operations complete
 */
export async function flushAllTimersAndMicrotasks(): Promise<void> {
  await act(async () => {
    // Flush microtasks
    await Promise.resolve();
    
    // Run all timers
    if (jest.isMockFunction(setTimeout)) {
      jest.runAllTimers();
    }
  });
}

/**
 * Wait for condition to be true with act() wrapping
 * @param condition - Function that returns true when condition is met
 * @param options - Timeout and check interval options
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await act(async () => {
      return await condition();
    });
    
    if (result) {
      return;
    }
    
    await waitForTimeout(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Helper to run timer cycles with a max limit to prevent infinite loops
 * Particularly useful for rotating text animations
 * @param cycles - Number of cycles to run
 * @param cycleTime - Time per cycle in milliseconds
 */
export async function runTimerCycles(cycles: number, cycleTime: number): Promise<void> {
  for (let i = 0; i < cycles; i++) {
    await advanceTimersByTimeAndAct(cycleTime);
  }
}

/**
 * Setup helper for tests using fake timers
 * Ensures proper configuration and cleanup
 */
export function setupFakeTimers(options: Parameters<typeof jest.useFakeTimers>[0] = {}): void {
  jest.useFakeTimers({
    ...options,
  });
}

/**
 * Setup helper for tests using real timers
 * Ensures fake timers are properly cleared
 */
export function setupRealTimers(): void {
  jest.useRealTimers();
}

/**
 * Cleanup helper to ensure all timers are properly cleared
 * Should be called in afterEach blocks
 */
export async function cleanupTimers(): Promise<void> {
  await act(async () => {
    // Clear all timers if using fake timers
    if (jest.isMockFunction(setTimeout)) {
      jest.clearAllTimers();
    }
    
    // Ensure real timers are restored
    jest.useRealTimers();
  });
}