/**
 * React act()-wrapped timer utilities for test isolation
 * Prevents "update was not wrapped in act()" warnings in timer-based tests
 */
import { act } from '@testing-library/react'

/**
 * Advances fake timers by specified milliseconds, wrapped in act()
 * to handle React state updates properly
 */
export const advanceTimersByTimeWithAct = async (ms: number): Promise<void> => {
  await act(async () => {
    jest.advanceTimersByTime(ms)
  })
}

/**
 * Runs all pending timers, wrapped in act()
 * to handle React state updates properly
 */
export const runAllTimersWithAct = async (): Promise<void> => {
  await act(async () => {
    jest.runAllTimers()
  })
}

/**
 * Runs only pending timers, wrapped in act()
 * to handle React state updates properly
 */
export const runOnlyPendingTimersWithAct = async (): Promise<void> => {
  await act(async () => {
    jest.runOnlyPendingTimers()
  })
}

/**
 * Advances timers to next timer, wrapped in act()
 * to handle React state updates properly
 */
export const advanceTimersToNextTimerWithAct = async (): Promise<void> => {
  await act(async () => {
    jest.advanceTimersToNextTimer()
  })
}

/**
 * Fast-forwards time for animations while ensuring React state updates
 * are properly handled. Useful for animation tests that need deterministic timing.
 */
export const fastForwardAnimationTime = async (duration: number): Promise<void> => {
  await act(async () => {
    // Fast-forward in smaller chunks to allow React to process state updates
    const chunkSize = Math.min(duration, 100)
    let remainingTime = duration
    
    while (remainingTime > 0) {
      const timeToAdvance = Math.min(remainingTime, chunkSize)
      jest.advanceTimersByTime(timeToAdvance)
      remainingTime -= timeToAdvance
      
      // Allow React to process any pending updates
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  })
}

/**
 * Waits for animation frame and advances timers appropriately
 * Handles both real and fake timer scenarios
 */
export const waitForAnimationFrameWithAct = async (): Promise<void> => {
  await act(async () => {
    if (typeof jest !== 'undefined' && jest.isMockFunction(global.requestAnimationFrame)) {
      // If RAF is mocked, advance timers to simulate frame
      jest.advanceTimersByTime(16) // ~60fps
    } else {
      // If using real RAF, wait for actual frame
      await new Promise(resolve => requestAnimationFrame(resolve))
    }
  })
}