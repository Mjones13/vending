/**
 * @jest-environment jsdom
 * 
 * Rotating Text Timing Tests
 * Three-Tier Testing Strategy Implementation:
 * - Tier 1: Animation Logic (timing calculations, interval management)
 * - Tier 2: Component Behavior (DOM timing, performance behavior)
 */

import * as React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../pages/index';
import {
  testAnimationHook,
  createTestStateMachine
} from '../../test-utils/animation-state-testing';
import {
  simulateKeyframePhases,
  verifyAnimationDuration,
  commonAnimationConfigs
} from '../../test-utils/keyframe-testing';
import {
  mockAnimationProperties,
  clearAnimationMocks
} from '../../test-utils/css-animation-mocking';
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

// TIER 1: Animation Logic Testing
describe('Rotating Text Timing Logic (Tier 1)', () => {
  const expectedWords = ['Workplaces', 'Apartments', 'Gyms', 'Businesses'];
  const ROTATION_INTERVAL = 3000; // 3 seconds
  const TIMING_TOLERANCE = 200; // ±200ms tolerance
  
  beforeEach(() => {
    mockAnimationProperties('.rotating-text', {
      animationName: 'textRotate',
      animationDuration: '3s',
      animationIterationCount: 'infinite'
    });
  });

  afterEach(() => {
    clearAnimationMocks();
  });

  describe('Timing Algorithm Logic', () => {
    it('should calculate correct timing intervals', async () => {
      const timeline = await simulateKeyframePhases({
        name: 'rotationTiming',
        duration: ROTATION_INTERVAL,
        steps: 10
      });
      
      expect(timeline.duration).toBe(ROTATION_INTERVAL);
      expect(timeline.endTime! - timeline.startTime).toBeCloseTo(ROTATION_INTERVAL, -2);
    });

    it('should verify animation duration calculations', async () => {
      const isAccurate = await verifyAnimationDuration({
        name: 'textRotation',
        duration: ROTATION_INTERVAL
      }, TIMING_TOLERANCE);
      
      expect(isAccurate).toBe(true);
    });

    it('should test timing hook logic', () => {
      const useTimingLogic = (interval: number) => {
        const [lastTick, setLastTick] = React.useState(Date.now());
        const [intervalCount, setIntervalCount] = React.useState(0);
        
        const tick = React.useCallback(() => {
          const now = Date.now();
          const actualInterval = now - lastTick;
          setLastTick(now);
          setIntervalCount((prev: number) => prev + 1);
          return actualInterval;
        }, [lastTick]);
        
        return { tick, intervalCount, lastTick };
      };
      
      const { result } = testAnimationHook(() => useTimingLogic(ROTATION_INTERVAL));
      
      expect(result.current.intervalCount).toBe(0);
      
      act(() => {
        const actualInterval = result.current.tick();
        // First tick will have no meaningful interval
        expect(typeof actualInterval).toBe('number');
      });
      
      expect(result.current.intervalCount).toBe(1);
    });

    it('should validate timing state machine logic', () => {
      const { machine, expectTransition, validateTransitions } = createTestStateMachine('idle');
      
      // Define expected timing state flow
      expectTransition('idle', 'running'); // Start timing
      expectTransition('running', 'completed'); // Complete interval
      expectTransition('completed', 'running'); // Start next interval
      
      machine.transition('running', 'interval-start');
      machine.transition('completed', 'interval-complete');
      machine.transition('running', 'next-interval-start');
      
      validateTransitions();
      
      const transitions = machine.getTransitionHistory();
      expect(transitions).toHaveLength(3);
      expect(transitions[0]?.trigger).toBe('interval-start');
      expect(transitions[1]?.trigger).toBe('interval-complete');
    });
  });
});

// TIER 2: Component Behavior Testing
describe('Rotating Text Timing Behavior (Tier 2)', () => {
  const expectedWords = ['Workplaces', 'Apartments', 'Gyms', 'Businesses'];
  const ROTATION_INTERVAL = 3000; // 3 seconds
  const TIMING_TOLERANCE = 200; // ±200ms tolerance
  
  beforeEach(() => {
    // Use real timers for component timing behavior
    setupRealTimers();
    document.body.innerHTML = '';
    
    // Mock CSS properties for timing tests
    mockAnimationProperties('.rotating-text', {
      animationName: 'textRotate',
      animationDuration: '3s'
    });
  });

  afterEach(async () => {
    await cleanupTimers();
    clearAnimationMocks();
    jest.restoreAllMocks();
  });

  describe('Component Timing Accuracy', () => {
    it('should update DOM text at exactly 3-second intervals', async () => {
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
        
        // Test multiple DOM update intervals
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
        
        // Verify DOM update timing intervals
        const intervals = observer.getTimingIntervals();
        expect(intervals.length).toBeGreaterThan(0);
        
        // Check that DOM update intervals are close to expected
        intervals.forEach((interval, index) => {
          const deviation = Math.abs(interval - ROTATION_INTERVAL);
          expect(deviation).toBeLessThanOrEqual(TIMING_TOLERANCE);
          
          if (deviation > TIMING_TOLERANCE) {
            console.log(`DOM update timing deviation at interval ${index}: ${deviation}ms (expected: ${ROTATION_INTERVAL}ms, actual: ${interval}ms)`);
          }
        });
      } finally {
        observer.stop();
      }
    });

    it('should maintain consistent DOM update timing across multiple cycles', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Run for multiple complete DOM update cycles
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
          console.log('DOM update timing validation failed:', {
            issues: timingValidation.issues,
            averageInterval: timingValidation.averageInterval,
            intervals: timingValidation.intervals
          });
        }
      } finally {
        observer.stop();
      }
    });

    it('should handle DOM update timing precision under stress conditions', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Simulate system load with rapid timer changes affecting DOM updates
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
        
        // Even under stress, most DOM update intervals should be within tolerance
        const withinTolerance = intervals.filter(interval => 
          Math.abs(interval - ROTATION_INTERVAL) <= TIMING_TOLERANCE
        ).length;
        
        const toleranceRate = withinTolerance / intervals.length;
        expect(toleranceRate).toBeGreaterThanOrEqual(0.7); // At least 70% should be within tolerance
        
        if (toleranceRate < 0.7) {
          console.log('DOM update stress test timing results:', {
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

  describe('Component State Timing Behavior', () => {
    it('should spend correct amount of time in each component state', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Monitor for one complete component cycle
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        await waitFor(() => {
          expect(rotatingText.textContent).toBeTruthy();
        });
        
        const observations = observer.getObservations();
        const stateTransitions = observations.filter(obs => obs.animationState);
        
        // Group by component state
        const stateDurations: Record<string, number[]> = {};
        
        for (let i = 1; i < stateTransitions.length; i++) {
          const prevTransition = stateTransitions[i - 1];
          const currTransition = stateTransitions[i];
          if (!prevTransition || !currTransition) continue;
          const duration = currTransition.timestamp - prevTransition.timestamp;
          
          const state = prevTransition.animationState;
          if (!state) continue;
          if (!stateDurations[state]) {
            stateDurations[state] = [];
          }
          stateDurations[state]?.push(duration);
        }
        
        // Verify component state durations match expectations
        if (stateDurations.visible) {
          const avgVisibleDuration = stateDurations.visible.reduce((a, b) => a + b, 0) / stateDurations.visible.length;
          // Visible component state should be ~2400ms (80% of 3000ms cycle)
          expect(avgVisibleDuration).toBeGreaterThan(2000);
          expect(avgVisibleDuration).toBeLessThan(2800);
        }
        
        if (stateDurations.exiting) {
          const avgExitDuration = stateDurations.exiting.reduce((a, b) => a + b, 0) / stateDurations.exiting.length;
          // Exit component state should be ~300ms (10% of 3000ms cycle)
          expect(avgExitDuration).toBeLessThan(600);
        }
        
        if (stateDurations.entering) {
          const avgEnterDuration = stateDurations.entering.reduce((a, b) => a + b, 0) / stateDurations.entering.length;
          // Enter component state should be ~300ms (10% of 3000ms cycle)
          expect(avgEnterDuration).toBeLessThan(600);
        }
      } finally {
        observer.stop();
      }
    });

    it('should transition between component states without timing gaps', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Run for several component state transitions
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
        
        // Check for timing gaps between component state transitions
        for (let i = 1; i < stateTransitions.length; i++) {
          const prevTransition = stateTransitions[i - 1];
          const currTransition = stateTransitions[i];
          if (!prevTransition || !currTransition) continue;
          const gap = currTransition.timestamp - prevTransition.timestamp;
          
          // No component state transition should take longer than 1 second
          expect(gap).toBeLessThan(1000);
          
          // No negative time gaps between state transitions
          expect(gap).toBeGreaterThanOrEqual(0);
        }
      } finally {
        observer.stop();
      }
    });
  });

  describe('Component Performance Behavior', () => {
    it('should maintain smooth component performance during DOM updates', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      jest.useRealTimers(); // Need real timers for component performance monitoring
      
      const performance = await monitorRotationPerformance(rotatingText, 5000);
      
      expect(performance.averageFPS).toBeGreaterThanOrEqual(55); // Allow slight deviation from 60fps
      expect(performance.frameDrops).toBeLessThan(performance.averageFPS * 0.1); // Less than 10% frame drops
      expect(performance.performanceIssues.length).toBe(0);
      
      if (performance.performanceIssues.length > 0) {
        console.log('Component performance issues detected:', performance.performanceIssues);
      }
      
      if (performance.averageFPS < 55) {
        console.log('Low component FPS detected:', performance.averageFPS);
      }
    });

    it('should not interfere with other page component behavior', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      // Create additional element to test component interference
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
        // Trigger external element change
        testElement.style.transform = 'translateX(100px)';
        
        // Continue component behavior
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        await waitFor(() => {
          expect(rotatingText.textContent).toBeTruthy();
        });
        
        // Verify component behavior still works correctly
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

  describe('Component Lifecycle Timing Behavior', () => {
    it('should handle rapid component mounting/unmounting timing', async () => {
      const { getByTestId, unmount } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Start component behavior
        act(() => {
          jest.advanceTimersByTime(1500);
        });
        
        // Unmount and remount component quickly
        unmount();
        
        const { getByTestId: getByTestId2 } = render(<Home />);
        const rotatingText2 = getByTestId2('rotating-text');
        
        observer.stop();
        
        const observer2 = new WordSequenceObserver(rotatingText2);
        observer2.start();
        
        // Continue component timing behavior
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        await waitFor(() => {
          expect(rotatingText2.textContent).toBeTruthy();
        });
        
        // Component should still work correctly after remount
        const word = rotatingText2.textContent;
        expect(expectedWords).toContain(word);
        
        observer2.stop();
      } catch (error) {
        observer.stop();
        throw error;
      }
    });

    it('should start component timing correctly after mount', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      
      // Record component mount time
      const mountTime = performance.now();
      observer.start();
      
      try {
        // First DOM update should occur at expected time
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
        
        // Verify component timing started properly
        const firstTransition = observations[1];
        if (firstTransition) {
          const timeSinceMount = firstTransition.timestamp - mountTime;
          // Component should transition within reasonable time after mount
          expect(timeSinceMount).toBeLessThan(5000);
        }
      } finally {
        observer.stop();
      }
    });
  });

  describe('Component Error Recovery Timing', () => {
    it('should recover component timing after errors', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Normal component operation
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        // Simulate error condition with very large time jump affecting component
        act(() => {
          jest.advanceTimersByTime(50000);
        });
        
        await waitFor(() => {
          expect(rotatingText.textContent).toBeTruthy();
        });
        
        // Component should recover and continue normal timing behavior
        const wordBefore = rotatingText.textContent;
        
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        await waitFor(() => {
          const wordAfter = rotatingText.textContent;
          expect(wordAfter).toBeTruthy();
          expect(expectedWords).toContain(wordAfter);
          // DOM should have progressed
          expect(wordAfter).not.toBe(wordBefore);
        });
        
        // Verify component timing is back to normal
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