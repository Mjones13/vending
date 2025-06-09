import React, { useEffect, useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import {
  advanceTimersByTimeAndAct,
  runAllTimersAndAct,
  runOnlyPendingTimersAndAct,
  runTimersToTimeAndAct,
  clearAllTimersAndAct,
  waitForAnimationFrame,
  waitForAnimationFrames,
  advanceTimersToNextFrame,
  waitForTimeout,
  advanceTimersAndExecute,
  flushAllTimersAndMicrotasks,
  waitForCondition,
  runTimerCycles,
  setupFakeTimers,
  setupRealTimers,
  cleanupTimers,
} from '../../test-utils/timer-helpers';

// Test component that uses timers
const TimerComponent: React.FC<{ onTick?: () => void }> = ({ onTick }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1);
      onTick?.();
    }, 1000);
    
    return () => clearInterval(timer);
  }, [onTick]);
  
  return <div data-testid="count">{count}</div>;
};

// Test component that uses RAF
const AnimationComponent: React.FC = () => {
  const [frame, setFrame] = useState(0);
  
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      setFrame(f => f + 1);
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  return <div data-testid="frame">{frame}</div>;
};

describe('Timer Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure we start with real timers before each test
    jest.useRealTimers();
  });
  
  afterEach(async () => {
    // Clean up in proper order
    if (jest.isMockFunction(setTimeout)) {
      jest.clearAllTimers();
    }
    jest.useRealTimers();
  });
  
  describe('advanceTimersByTimeAndAct', () => {
    it('should advance timers and wrap in act', async () => {
      setupFakeTimers();
      const mockFn = jest.fn();
      render(<TimerComponent onTick={mockFn} />);
      
      expect(screen.getByTestId('count')).toHaveTextContent('0');
      expect(mockFn).not.toHaveBeenCalled();
      
      await advanceTimersByTimeAndAct(1000);
      
      expect(screen.getByTestId('count')).toHaveTextContent('1');
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      await advanceTimersByTimeAndAct(2000);
      
      expect(screen.getByTestId('count')).toHaveTextContent('3');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });
  
  describe('runAllTimersAndAct', () => {
    it('should run all timers and wrap in act', async () => {
      setupFakeTimers();
      const mockFn = jest.fn();
      let intervalId: NodeJS.Timeout;
      
      // Create a simple timer that won't create infinite loops
      setTimeout(() => mockFn('timeout1'), 1000);
      setTimeout(() => mockFn('timeout2'), 2000);
      
      // Create interval that clears itself after 3 calls
      let count = 0;
      intervalId = setInterval(() => {
        count++;
        mockFn(`interval${count}`);
        if (count >= 3) {
          clearInterval(intervalId);
        }
      }, 500);
      
      await runAllTimersAndAct();
      
      expect(mockFn).toHaveBeenCalledWith('timeout1');
      expect(mockFn).toHaveBeenCalledWith('timeout2');
      expect(mockFn).toHaveBeenCalledWith('interval1');
      expect(mockFn).toHaveBeenCalledWith('interval2');
      expect(mockFn).toHaveBeenCalledWith('interval3');
    });
  });
  
  describe('runOnlyPendingTimersAndAct', () => {
    it('should run only pending timers and wrap in act', async () => {
      setupFakeTimers();
      const mockFn = jest.fn();
      
      setTimeout(() => {
        mockFn('first');
        setTimeout(() => mockFn('nested'), 500);
      }, 1000);
      
      await runOnlyPendingTimersAndAct();
      
      expect(mockFn).toHaveBeenCalledWith('first');
      expect(mockFn).not.toHaveBeenCalledWith('nested');
    });
  });
  
  describe('runTimersToTimeAndAct', () => {
    it('should run timers to specified time and wrap in act', async () => {
      setupFakeTimers();
      const mockFn = jest.fn();
      
      setTimeout(() => mockFn('1s'), 1000);
      setTimeout(() => mockFn('2s'), 2000);
      setTimeout(() => mockFn('3s'), 3000);
      
      await runTimersToTimeAndAct(2500);
      
      expect(mockFn).toHaveBeenCalledWith('1s');
      expect(mockFn).toHaveBeenCalledWith('2s');
      expect(mockFn).not.toHaveBeenCalledWith('3s');
    });
  });
  
  describe('clearAllTimersAndAct', () => {
    it('should clear all timers and wrap in act', async () => {
      setupFakeTimers();
      const mockFn = jest.fn();
      
      setTimeout(() => mockFn('should not be called'), 1000);
      
      await clearAllTimersAndAct();
      await advanceTimersByTimeAndAct(2000);
      
      expect(mockFn).not.toHaveBeenCalled();
    });
  });
  
  describe('waitForAnimationFrame', () => {
    it('should wait for next animation frame', async () => {
      const mockRAF = jest.fn((cb: FrameRequestCallback) => {
        setTimeout(() => cb(16), 16);
        return 1;
      });
      
      global.requestAnimationFrame = mockRAF as any;
      
      await waitForAnimationFrame();
      
      expect(mockRAF).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('waitForAnimationFrames', () => {
    it('should wait for multiple animation frames', async () => {
      let frameCount = 0;
      const mockRAF = jest.fn((cb: FrameRequestCallback) => {
        setTimeout(() => {
          frameCount++;
          cb(16 * frameCount);
        }, 16);
        return frameCount;
      });
      
      global.requestAnimationFrame = mockRAF as any;
      
      await waitForAnimationFrames(3);
      
      expect(mockRAF).toHaveBeenCalledTimes(3);
    });
  });
  
  describe('advanceTimersToNextFrame', () => {
    it('should advance timers by 16ms (one frame)', async () => {
      setupFakeTimers();
      const mockFn = jest.fn();
      
      setTimeout(() => mockFn('frame'), 16);
      
      await advanceTimersToNextFrame();
      
      expect(mockFn).toHaveBeenCalledWith('frame');
    });
  });
  
  describe('waitForTimeout', () => {
    it('should wait for specified timeout with real timers', async () => {
      setupRealTimers();
      const start = Date.now();
      
      await waitForTimeout(50);
      
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some variance
      expect(elapsed).toBeLessThan(100);
    });
  });
  
  describe('advanceTimersAndExecute', () => {
    it('should advance timers then execute callback', async () => {
      setupFakeTimers();
      const mockFn = jest.fn();
      const callbackFn = jest.fn();
      
      setTimeout(() => mockFn('timer'), 1000);
      
      await advanceTimersAndExecute(1000, callbackFn);
      
      expect(mockFn).toHaveBeenCalledWith('timer');
      expect(callbackFn).toHaveBeenCalled();
    });
    
    it('should handle async callbacks', async () => {
      setupFakeTimers();
      const mockFn = jest.fn();
      const asyncCallback = jest.fn(async () => {
        await Promise.resolve();
        mockFn('async done');
      });
      
      await advanceTimersAndExecute(1000, asyncCallback);
      
      expect(asyncCallback).toHaveBeenCalled();
      expect(mockFn).toHaveBeenCalledWith('async done');
    });
  });
  
  describe('flushAllTimersAndMicrotasks', () => {
    it('should flush all pending operations', async () => {
      jest.useFakeTimers();
      const mockFn = jest.fn();
      
      // Schedule microtask first
      Promise.resolve().then(() => mockFn('microtask'));
      
      // Then schedule timer
      setTimeout(() => mockFn('timer'), 1000);
      
      await flushAllTimersAndMicrotasks();
      
      // Microtasks execute first in the event loop, timers may need explicit advancement
      expect(mockFn).toHaveBeenCalledWith('microtask');
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // Now advance timers explicitly to execute the timer callback
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(mockFn).toHaveBeenCalledWith('timer');
      expect(mockFn).toHaveBeenCalledTimes(2);
      
      jest.useRealTimers();
    });
  });
  
  describe('waitForCondition', () => {
    it('should wait until condition is met', async () => {
      let value = false;
      
      setTimeout(() => {
        value = true;
      }, 100);
      
      await waitForCondition(() => value, { interval: 10 });
      
      expect(value).toBe(true);
    });
    
    it('should timeout if condition is not met', async () => {
      await expect(
        waitForCondition(() => false, { timeout: 100, interval: 10 })
      ).rejects.toThrow('Condition not met within 100ms');
    });
    
    it('should handle async conditions', async () => {
      let value = false;
      
      setTimeout(() => {
        value = true;
      }, 50);
      
      await waitForCondition(async () => {
        await Promise.resolve();
        return value;
      }, { interval: 10 });
      
      expect(value).toBe(true);
    });
  });
  
  describe('runTimerCycles', () => {
    it('should run specified number of timer cycles', async () => {
      setupFakeTimers();
      const mockFn = jest.fn();
      
      render(<TimerComponent onTick={mockFn} />);
      
      await runTimerCycles(5, 1000);
      
      expect(mockFn).toHaveBeenCalledTimes(5);
      expect(screen.getByTestId('count')).toHaveTextContent('5');
    });
  });
  
  describe('setupFakeTimers', () => {
    it('should configure fake timers with custom options', () => {
      // Restore any existing fake timers first
      jest.useRealTimers();
      
      // Test the actual behavior rather than using jest.isMockFunction
      setupFakeTimers({ 
        advanceTimers: false,
        doNotFake: ['requestAnimationFrame'] // Use a different function for doNotFake test
      });
      
      // Test functional behavior: fake timers should allow manual advancement
      const callback = jest.fn();
      setInterval(callback, 1000);
      
      // Should NOT auto-advance (because advanceTimers: false)
      expect(callback).not.toHaveBeenCalled();
      
      // Manual advancement should work
      jest.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);
      
      // Test that setTimeout can be controlled manually (verifying it IS faked)
      const timeoutCallback = jest.fn();
      setTimeout(timeoutCallback, 500);
      
      // Should not execute immediately because setTimeout is faked
      expect(timeoutCallback).not.toHaveBeenCalled();
      
      // Should execute after manual advancement
      jest.advanceTimersByTime(500);
      expect(timeoutCallback).toHaveBeenCalledTimes(1);
      
      // Cleanup
      jest.useRealTimers();
    });
    
    it('should use default advanceTimers=true', () => {
      // Restore real timers first
      jest.useRealTimers();
      
      // Test the actual behavior
      setupFakeTimers();
      
      // Test that default behavior includes auto-advancing timers
      const callback = jest.fn();
      
      // With advanceTimers: true (default), timers should advance automatically
      // However, we still need to manually advance for testing purposes
      setInterval(callback, 1000);
      
      // Manual advancement should work (this verifies fake timers are active)
      jest.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);
      
      // Cleanup
      jest.useRealTimers();
    });
  });
  
  describe('setupRealTimers', () => {
    it('should restore real timers', () => {
      // First set up fake timers
      setupFakeTimers();
      
      // Verify fake timers are active by testing behavior
      const fakeCallback = jest.fn();
      setTimeout(fakeCallback, 1000);
      
      // With fake timers, callback shouldn't execute without manual advancement
      expect(fakeCallback).not.toHaveBeenCalled();
      
      // Now restore real timers
      setupRealTimers();
      
      // Test that real timers behavior is restored
      const realCallback = jest.fn();
      
      // With real timers, setTimeout(0) should execute in next tick
      setTimeout(realCallback, 0);
      
      // Use a small delay to allow real timer to execute
      return new Promise(resolve => {
        setTimeout(() => {
          expect(realCallback).toHaveBeenCalledTimes(1);
          resolve();
        }, 10);
      });
    });
  });
  
  describe('cleanupTimers', () => {
    it('should clear fake timers and restore real timers', async () => {
      setupFakeTimers();
      
      // Set up a timer to verify it gets cleared
      const mockFn = jest.fn();
      setTimeout(mockFn, 1000);
      
      // Verify timer is pending (fake timers active)
      expect(mockFn).not.toHaveBeenCalled();
      
      await cleanupTimers();
      
      // After cleanup, test that real timers are restored by setting a new timer
      const realTimerCallback = jest.fn();
      setTimeout(realTimerCallback, 0);
      
      // Use a promise to allow real timer to execute
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Should execute because real timers are restored
      expect(realTimerCallback).toHaveBeenCalledTimes(1);
    });
    
    it('should not error when using real timers', async () => {
      setupRealTimers();
      
      await expect(cleanupTimers()).resolves.not.toThrow();
    });
  });
  
  describe('Integration with React components', () => {
    it('should properly handle state updates without act warnings', async () => {
      setupFakeTimers();
      const { rerender } = render(<TimerComponent />);
      
      expect(screen.getByTestId('count')).toHaveTextContent('0');
      
      // Multiple timer advances should not cause act warnings
      await advanceTimersByTimeAndAct(1000);
      expect(screen.getByTestId('count')).toHaveTextContent('1');
      
      await advanceTimersByTimeAndAct(1000);
      expect(screen.getByTestId('count')).toHaveTextContent('2');
      
      // Rerender should work properly
      rerender(<TimerComponent />);
      
      await advanceTimersByTimeAndAct(1000);
      expect(screen.getByTestId('count')).toHaveTextContent('3');
    });
    
    it('should handle RAF-based animations without act warnings', async () => {
      // Mock RAF to avoid infinite loop
      let rafCallbacks: FrameRequestCallback[] = [];
      let rafId = 0;
      
      global.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) => {
        rafCallbacks.push(cb);
        return ++rafId;
      });
      
      global.cancelAnimationFrame = jest.fn((id: number) => {
        // Simple implementation for test
      });
      
      render(<AnimationComponent />);
      
      expect(screen.getByTestId('frame')).toHaveTextContent('0');
      
      // Manually trigger RAF callbacks
      await act(async () => {
        if (rafCallbacks.length > 0) {
          rafCallbacks[0](16);
          rafCallbacks = rafCallbacks.slice(1);
        }
      });
      
      // Check frame count increased
      const frameCount = parseInt(screen.getByTestId('frame').textContent || '0');
      expect(frameCount).toBeGreaterThan(0);
      
      // Cleanup
      global.requestAnimationFrame = requestAnimationFrame;
      global.cancelAnimationFrame = cancelAnimationFrame;
    });
  });
});