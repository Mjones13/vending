import * as React from 'react';
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
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
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
  const [frame, setFrame] = React.useState(0);
  
  React.useEffect(() => {
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
      setupFakeTimers();
      const mockFn = jest.fn();
      
      // Schedule microtask first
      Promise.resolve().then(() => mockFn('microtask'));
      
      // Then schedule timer
      setTimeout(() => mockFn('timer'), 1000);
      
      await flushAllTimersAndMicrotasks();
      
      // Check both were called (order may vary)
      expect(mockFn).toHaveBeenCalledWith('timer');
      expect(mockFn).toHaveBeenCalledWith('microtask');
      expect(mockFn).toHaveBeenCalledTimes(2);
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
      const useFakeTimersSpy = jest.spyOn(jest, 'useFakeTimers');
      
      setupFakeTimers({ 
        advanceTimers: false,
        doNotFake: ['setTimeout']
      });
      
      expect(useFakeTimersSpy).toHaveBeenCalledWith({
        advanceTimers: false,
        doNotFake: ['setTimeout']
      });
      
      useFakeTimersSpy.mockRestore();
      jest.useRealTimers();
    });
    
    it('should use default advanceTimers=true', () => {
      const useFakeTimersSpy = jest.spyOn(jest, 'useFakeTimers');
      
      setupFakeTimers();
      
      expect(useFakeTimersSpy).toHaveBeenCalledWith({
        advanceTimers: true
      });
      
      useFakeTimersSpy.mockRestore();
      jest.useRealTimers();
    });
  });
  
  describe('setupRealTimers', () => {
    it('should restore real timers', () => {
      const useRealTimersSpy = jest.spyOn(jest, 'useRealTimers');
      
      setupFakeTimers();
      setupRealTimers();
      
      expect(useRealTimersSpy).toHaveBeenCalled();
      
      useRealTimersSpy.mockRestore();
    });
  });
  
  describe('cleanupTimers', () => {
    it('should clear fake timers and restore real timers', async () => {
      setupFakeTimers();
      const clearAllTimersSpy = jest.spyOn(jest, 'clearAllTimers');
      const useRealTimersSpy = jest.spyOn(jest, 'useRealTimers');
      
      const mockFn = jest.fn();
      setTimeout(mockFn, 1000);
      
      await cleanupTimers();
      
      expect(clearAllTimersSpy).toHaveBeenCalled();
      expect(useRealTimersSpy).toHaveBeenCalled();
      
      clearAllTimersSpy.mockRestore();
      useRealTimersSpy.mockRestore();
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
        if (rafCallbacks.length > 0 && rafCallbacks[0]) {
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