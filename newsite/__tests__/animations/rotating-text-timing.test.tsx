/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../pages/index';
import { 
  WordSequenceObserver,
  monitorRotationPerformance 
} from '../../test-utils/rotation-testing';
import { setupRealTimers, cleanupTimers } from '../../test-utils/timer-helpers';

// Mock Next.js dependencies
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

jest.mock('next/image', () => {
  return function Image({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

jest.mock('../../hooks/useScrollAnimation', () => ({
  useStaggeredAnimation: () => [[], jest.fn()],
}));

jest.mock('../../components/Layout', () => {
  return function Layout({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout">{children}</div>;
  };
});

describe('Homepage Rotating Text Timing', () => {
  const expectedWords = ['Workplaces', 'Apartments', 'Gyms', 'Businesses'];
  const ROTATION_INTERVAL = 3000; // 3 seconds
  const TIMING_TOLERANCE = 200; // ±200ms tolerance
  
  beforeEach(() => {
    // Use real timers for rotating text
    setupRealTimers();
    document.body.innerHTML = '';
  });

  afterEach(async () => {
    await cleanupTimers();
    jest.restoreAllMocks();
  });

  describe('Rotation Timing Accuracy', () => {
    it('should rotate words at exactly 3-second intervals', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        const initialWord = rotatingText.textContent;
        
        // Advance exactly 3 seconds
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        await waitFor(() => {
          expect(rotatingText.textContent).not.toBe(initialWord);
        });
        
        // Test multiple intervals
        const timingChecks: { expectedTime: number; actualWord: string }[] = [];
        
        for (let i = 1; i <= 5; i++) {
          const expectedTime = i * 3000;
          
          act(() => {
            jest.advanceTimersByTime(3000);
          });
          
          await waitFor(() => {
            const currentWord = rotatingText.textContent || '';
            timingChecks.push({
              expectedTime,
              actualWord: currentWord
            });
          });
        }
        
        // Verify timing intervals
        const intervals = observer.getTimingIntervals();
        expect(intervals.length).toBeGreaterThan(0);
        
        // Check that intervals are close to expected
        intervals.forEach((interval, index) => {
          const deviation = Math.abs(interval - ROTATION_INTERVAL);
          expect(deviation).toBeLessThanOrEqual(TIMING_TOLERANCE);
          
          if (deviation > TIMING_TOLERANCE) {
            console.log(`Timing deviation at interval ${index}: ${deviation}ms (expected: ${ROTATION_INTERVAL}ms, actual: ${interval}ms)`);
          }
        });
      } finally {
        observer.stop();
      }
    });

    it('should maintain consistent timing across multiple cycles', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Run for multiple complete cycles
        const numCycles = 3;
        const totalRotations = numCycles * expectedWords.length;
        
        for (let i = 0; i < totalRotations; i++) {
          act(() => {
            jest.advanceTimersByTime(ROTATION_INTERVAL);
          });
          
          await waitFor(() => {
            expect(rotatingText.textContent).toBeTruthy();
          });
        }
        
        const timingValidation = observer.validateTiming(ROTATION_INTERVAL, TIMING_TOLERANCE);
        
        expect(timingValidation.timingCorrect).toBe(true);
        expect(timingValidation.averageInterval).toBeCloseTo(ROTATION_INTERVAL, -2); // Within 100ms
        
        if (!timingValidation.timingCorrect) {
          console.log('Timing validation failed:', {
            issues: timingValidation.issues,
            averageInterval: timingValidation.averageInterval,
            intervals: timingValidation.intervals
          });
        }
      } finally {
        observer.stop();
      }
    });

    it('should handle timing precision under stress conditions', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Simulate system load with rapid timer changes
        const stressIntervals = [2950, 3000, 3050, 2980, 3020, 3000, 2990, 3010];
        
        for (const interval of stressIntervals) {
          act(() => {
            jest.advanceTimersByTime(interval);
          });
          
          await waitFor(() => {
            expect(rotatingText.textContent).toBeTruthy();
          });
        }
        
        const intervals = observer.getTimingIntervals();
        
        // Even under stress, most intervals should be within tolerance
        const withinTolerance = intervals.filter(interval => 
          Math.abs(interval - ROTATION_INTERVAL) <= TIMING_TOLERANCE
        ).length;
        
        const toleranceRate = withinTolerance / intervals.length;
        expect(toleranceRate).toBeGreaterThanOrEqual(0.7); // At least 70% should be within tolerance
        
        if (toleranceRate < 0.7) {
          console.log('Stress test timing results:', {
            intervals,
            toleranceRate,
            withinTolerance,
            total: intervals.length
          });
        }
      } finally {
        observer.stop();
      }
    });
  });

  describe('Animation State Timing', () => {
    it('should spend correct amount of time in each animation state', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Monitor for one complete cycle
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        await waitFor(() => {
          expect(rotatingText.textContent).toBeTruthy();
        });
        
        const observations = observer.getObservations();
        const stateTransitions = observations.filter(obs => obs.animationState);
        
        // Group by state
        const stateDurations: Record<string, number[]> = {};
        
        for (let i = 1; i < stateTransitions.length; i++) {
          const prevTransition = stateTransitions[i - 1];
          const currTransition = stateTransitions[i];
          const duration = currTransition.timestamp - prevTransition.timestamp;
          
          if (!stateDurations[prevTransition.animationState!]) {
            stateDurations[prevTransition.animationState!] = [];
          }
          stateDurations[prevTransition.animationState!].push(duration);
        }
        
        // Verify state durations match expectations
        if (stateDurations.visible) {
          const avgVisibleDuration = stateDurations.visible.reduce((a, b) => a + b, 0) / stateDurations.visible.length;
          // Visible state should be ~2400ms (80% of 3000ms cycle)
          expect(avgVisibleDuration).toBeGreaterThan(2000);
          expect(avgVisibleDuration).toBeLessThan(2800);
        }
        
        if (stateDurations.exiting) {
          const avgExitDuration = stateDurations.exiting.reduce((a, b) => a + b, 0) / stateDurations.exiting.length;
          // Exit state should be ~300ms (10% of 3000ms cycle)
          expect(avgExitDuration).toBeLessThan(600);
        }
        
        if (stateDurations.entering) {
          const avgEnterDuration = stateDurations.entering.reduce((a, b) => a + b, 0) / stateDurations.entering.length;
          // Enter state should be ~300ms (10% of 3000ms cycle)
          expect(avgEnterDuration).toBeLessThan(600);
        }
      } finally {
        observer.stop();
      }
    });

    it('should transition between states without timing gaps', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Run for several transitions
        for (let i = 0; i < 3; i++) {
          act(() => {
            jest.advanceTimersByTime(3000);
          });
          
          await waitFor(() => {
            expect(rotatingText.textContent).toBeTruthy();
          });
        }
        
        const observations = observer.getObservations();
        const stateTransitions = observations.filter(obs => obs.animationState);
        
        // Check for timing gaps between transitions
        for (let i = 1; i < stateTransitions.length; i++) {
          const prevTransition = stateTransitions[i - 1];
          const currTransition = stateTransitions[i];
          const gap = currTransition.timestamp - prevTransition.timestamp;
          
          // No transition should take longer than 1 second
          expect(gap).toBeLessThan(1000);
          
          // No negative time gaps
          expect(gap).toBeGreaterThanOrEqual(0);
        }
      } finally {
        observer.stop();
      }
    });
  });

  describe('Performance Impact', () => {
    it('should maintain smooth 60fps during animations', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      jest.useRealTimers(); // Need real timers for performance monitoring
      
      const performance = await monitorRotationPerformance(rotatingText, 5000);
      
      expect(performance.averageFPS).toBeGreaterThanOrEqual(55); // Allow slight deviation from 60fps
      expect(performance.frameDrops).toBeLessThan(performance.averageFPS * 0.1); // Less than 10% frame drops
      expect(performance.performanceIssues.length).toBe(0);
      
      if (performance.performanceIssues.length > 0) {
        console.log('Performance issues detected:', performance.performanceIssues);
      }
      
      if (performance.averageFPS < 55) {
        console.log('Low FPS detected:', performance.averageFPS);
      }
    });

    it('should not interfere with other page animations', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      // Create additional animated element to test interference
      const testElement = document.createElement('div');
      testElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 50px;
        height: 50px;
        background: red;
        transition: transform 0.3s ease;
      `;
      document.body.appendChild(testElement);
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Trigger external animation
        testElement.style.transform = 'translateX(100px)';
        
        // Continue rotation
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        await waitFor(() => {
          expect(rotatingText.textContent).toBeTruthy();
        });
        
        // Verify rotation still works correctly
        const sequence = observer.getWordSequence();
        expect(sequence.length).toBeGreaterThan(1);
        
        sequence.forEach(word => {
          expect(expectedWords).toContain(word);
        });
      } finally {
        observer.stop();
        document.body.removeChild(testElement);
      }
    });
  });

  describe('Component Lifecycle Timing', () => {
    it('should handle rapid component mounting/unmounting', async () => {
      const { getByTestId, unmount } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Start rotation
        act(() => {
          jest.advanceTimersByTime(1500);
        });
        
        // Unmount and remount quickly
        unmount();
        
        const { getByTestId: getByTestId2 } = render(<Home />);
        const rotatingText2 = getByTestId2('rotating-text');
        
        observer.stop();
        
        const observer2 = new WordSequenceObserver(rotatingText2);
        observer2.start();
        
        // Continue timing
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        await waitFor(() => {
          expect(rotatingText2.textContent).toBeTruthy();
        });
        
        // Should still work correctly after remount
        const word = rotatingText2.textContent;
        expect(expectedWords).toContain(word);
        
        observer2.stop();
      } catch (error) {
        observer.stop();
        throw error;
      }
    });

    it('should start timing correctly after component mount', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      
      // Record mount time
      const mountTime = performance.now();
      observer.start();
      
      try {
        // First rotation should occur at expected time
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        await waitFor(() => {
          const currentWord = rotatingText.textContent;
          expect(currentWord).toBeTruthy();
          expect(expectedWords).toContain(currentWord);
        });
        
        const observations = observer.getObservations();
        expect(observations.length).toBeGreaterThan(1);
        
        // Verify timing started properly
        const firstTransition = observations[1];
        if (firstTransition) {
          const timeSinceMount = firstTransition.timestamp - mountTime;
          // Should transition within reasonable time after mount
          expect(timeSinceMount).toBeLessThan(5000);
        }
      } finally {
        observer.stop();
      }
    });
  });

  describe('Error Recovery Timing', () => {
    it('should recover timing after errors', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Normal operation
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        // Simulate error condition with very large time jump
        act(() => {
          jest.advanceTimersByTime(50000);
        });
        
        await waitFor(() => {
          expect(rotatingText.textContent).toBeTruthy();
        });
        
        // Should recover and continue normal timing
        const wordBefore = rotatingText.textContent;
        
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        await waitFor(() => {
          const wordAfter = rotatingText.textContent;
          expect(wordAfter).toBeTruthy();
          expect(expectedWords).toContain(wordAfter);
          // Should have progressed
          expect(wordAfter).not.toBe(wordBefore);
        });
        
        // Verify timing is back to normal
        const recentIntervals = observer.getTimingIntervals().slice(-3);
        if (recentIntervals.length > 0) {
          const avgRecentInterval = recentIntervals.reduce((a, b) => a + b, 0) / recentIntervals.length;
          expect(Math.abs(avgRecentInterval - ROTATION_INTERVAL)).toBeLessThan(TIMING_TOLERANCE * 2);
        }
      } finally {
        observer.stop();
      }
    });
  });
});