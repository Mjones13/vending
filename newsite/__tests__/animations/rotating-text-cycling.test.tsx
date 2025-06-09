/**
 * @jest-environment jsdom
 * 
 * Rotating Text Cycling Tests
 * Three-Tier Testing Strategy Implementation:
 * - Tier 1: Animation Logic (cycling algorithms, state machines)
 * - Tier 2: Component Behavior (DOM text changes, class applications)
 */

import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../pages/index';
import { 
  testAnimationHook,
  createTestStateMachine,
  AnimationStateMachine
} from '../../test-utils/animation-state-testing';
import {
  mockAnimationProperties,
  clearAnimationMocks
} from '../../test-utils/css-animation-mocking';
import { 
  WordSequenceObserver,
  waitForWord,
  waitForCompleteCycle,
  validateAnimationStates
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
describe('Rotating Text Cycling Logic (Tier 1)', () => {
  const expectedWords = ['Workplaces', 'Apartments', 'Gyms', 'Businesses'];
  
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

  describe('Word Cycling Algorithm Logic', () => {
    it('should implement correct cycling algorithm', () => {
      // Test pure cycling logic without DOM
      const words = expectedWords;
      let currentIndex = 0;
      
      const cycleToNext = () => {
        currentIndex = (currentIndex + 1) % words.length;
        return words[currentIndex];
      };
      
      // Test one complete cycle
      const observedWords = [words[0]]; // Start with first word
      
      for (let i = 0; i < words.length; i++) {
        const nextWord = cycleToNext();
        observedWords.push(nextWord);
      }
      
      // Should cycle through all words and back to first
      expect(observedWords).toEqual([
        'Workplaces', 'Apartments', 'Gyms', 'Businesses', 'Workplaces'
      ]);
    });

    it('should handle edge cases in cycling logic', () => {
      const { machine, expectTransition, validateTransitions } = createTestStateMachine('idle');
      
      // Test state transitions for word cycling
      expectTransition('idle', 'running'); // Start cycling
      expectTransition('running', 'completed'); // Complete cycle
      expectTransition('completed', 'running'); // Start next cycle
      
      machine.transition('running', 'cycle-start');
      machine.transition('completed', 'word-changed');
      machine.transition('running', 'next-cycle-start');
      
      validateTransitions();
      
      const transitions = machine.getTransitionHistory();
      expect(transitions).toHaveLength(3);
      expect(transitions[0].trigger).toBe('cycle-start');
      expect(transitions[1].trigger).toBe('word-changed');
      expect(transitions[2].trigger).toBe('next-cycle-start');
    });

    it('should test cycling hook logic in isolation', () => {
      const useCyclingLogic = (words: string[]) => {
        const [currentIndex, setCurrentIndex] = React.useState(0);
        const [isTransitioning, setIsTransitioning] = React.useState(false);
        
        const cycleToNext = React.useCallback(() => {
          setIsTransitioning(true);
          setCurrentIndex((prev) => (prev + 1) % words.length);
          setIsTransitioning(false);
        }, [words.length]);
        
        return { currentIndex, currentWord: words[currentIndex], isTransitioning, cycleToNext };
      };
      
      const { result } = testAnimationHook(() => useCyclingLogic(expectedWords));
      
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.currentWord).toBe('Workplaces');
      expect(result.current.isTransitioning).toBe(false);
      
      act(() => {
        result.current.cycleToNext();
      });
      
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.currentWord).toBe('Apartments');
    });
  });
});

// TIER 2: Component Behavior Testing
describe('Rotating Text Cycling Behavior (Tier 2)', () => {
  const expectedWords = ['Workplaces', 'Apartments', 'Gyms', 'Businesses'];
  
  beforeEach(() => {
    // Use real timers for component behavior testing
    setupRealTimers();
    document.body.innerHTML = '';
    
    // Mock CSS properties for behavior tests
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

  describe('DOM Text Content Cycling', () => {
    it('should update DOM text content through all words in correct order', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        const initialWord = rotatingText.textContent;
        expect(expectedWords).toContain(initialWord);
        
        // Advance through multiple cycles and verify DOM text changes
        for (let cycle = 0; cycle < 2; cycle++) {
          for (let wordIndex = 0; wordIndex < expectedWords.length; wordIndex++) {
            act(() => {
              jest.advanceTimersByTime(3000);
            });
            
            await waitFor(() => {
              const currentWord = rotatingText.textContent;
              expect(expectedWords).toContain(currentWord);
            }, { timeout: 1000 });
          }
        }
        
        const validation = observer.validateExpectedSequence(expectedWords, 2);
        expect(validation.valid).toBe(true);
        
        if (!validation.valid) {
          console.log('DOM text sequence validation failed:', {
            issues: validation.issues,
            actualSequence: validation.actualSequence,
            expectedSequence: validation.expectedSequence
          });
        }
      } finally {
        observer.stop();
      }
    });

    it('should update DOM text to loop back to first word after last word', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Wait for the last word in sequence to appear in DOM
        await waitFor(() => {
          expect(rotatingText.textContent).toBe('Businesses');
        }, { timeout: 15000 });
        
        // Advance to next word (should cycle back to first in DOM)
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        await waitFor(() => {
          expect(rotatingText.textContent).toBe('Workplaces');
        }, { timeout: 5000 });
        
        const cycling = observer.validateCycling(expectedWords);
        expect(cycling.cyclingCorrect).toBe(true);
        expect(cycling.cycleTransitions.length).toBeGreaterThan(0);
        
        if (!cycling.cyclingCorrect) {
          console.log('DOM text cycling validation failed:', {
            issues: cycling.issues,
            cycleTransitions: cycling.cycleTransitions
          });
        }
      } finally {
        observer.stop();
      }
    });

    it('should maintain valid DOM text content under rapid timing changes', async () => {
      // Test the robustness of DOM text updates under stress
      
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Simulate rapid time advancement to stress-test DOM text updates
        for (let i = 0; i < 10; i++) {
          act(() => {
            jest.advanceTimersByTime(300); // Rapid time jumps
          });
          
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // DOM should still contain valid word after stress test
        const currentWord = rotatingText.textContent;
        expect(currentWord).toBeTruthy();
        expect(expectedWords).toContain(currentWord);
        
        const sequence = observer.getWordSequence();
        const emptyWords = sequence.filter(word => !word || word.trim() === '');
        expect(emptyWords.length).toBe(0);
      } finally {
        observer.stop();
      }
    });

    it('should maintain DOM text integrity during timing irregularities', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Record initial DOM text state
        const initialWord = rotatingText.textContent;
        
        // Simulate timing irregularities for DOM updates
        const irregularIntervals = [2000, 4000, 1000, 5000, 3000];
        
        for (const interval of irregularIntervals) {
          act(() => {
            jest.advanceTimersByTime(interval);
          });
          
          await waitFor(() => {
            const word = rotatingText.textContent;
            expect(word).toBeTruthy();
            expect(expectedWords).toContain(word);
          });
        }
        
        const sequence = observer.getWordSequence();
        
        // Verify no invalid words appeared in DOM
        sequence.forEach(word => {
          expect(word).toBeTruthy();
          expect(expectedWords).toContain(word);
        });
        
        // Should have progressed through DOM text sequence despite irregular timing
        expect(sequence.length).toBeGreaterThan(2);
      } finally {
        observer.stop();
      }
    });
  });

  describe('DOM Complete Cycle Validation', () => {
    it('should complete full DOM text cycles without missing words', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      jest.useRealTimers(); // Use real timers for DOM behavior test
      
      const cycleResult = await waitForCompleteCycle(rotatingText, expectedWords, 20000);
      
      expect(cycleResult.success).toBe(true);
      expect(cycleResult.observedWords).toEqual(expect.arrayContaining(expectedWords));
      expect(cycleResult.observedWords.length).toBe(expectedWords.length);
      
      if (!cycleResult.success) {
        console.log('DOM complete cycle failed:', {
          observedWords: cycleResult.observedWords,
          duration: cycleResult.duration,
          missingWords: expectedWords.filter(word => !cycleResult.observedWords.includes(word))
        });
      }
    });

    it('should never display empty DOM text during transitions', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Monitor DOM text content for 10 cycles
        for (let i = 0; i < 10; i++) {
          act(() => {
            jest.advanceTimersByTime(300);
          });
          
          const currentWord = rotatingText.textContent;
          expect(currentWord).toBeTruthy();
          expect(currentWord.trim()).not.toBe('');
        }
        
        const sequence = observer.getWordSequence();
        const emptyWords = sequence.filter(word => !word || word.trim() === '');
        
        expect(emptyWords.length).toBe(0);
        
        if (emptyWords.length > 0) {
          console.log('Found empty words in DOM text sequence:', sequence);
        }
      } finally {
        observer.stop();
      }
    });

    it('should complete full word cycling sequence correctly', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        const observedSequence: string[] = [];
        
        // Capture initial word
        const initialWord = rotatingText.textContent;
        if (initialWord) observedSequence.push(initialWord);
        
        // Advance through 2 complete cycles
        for (let cycle = 0; cycle < 2; cycle++) {
          for (let word = 0; word < expectedWords.length; word++) {
            act(() => {
              jest.advanceTimersByTime(3000);
            });
            
            await waitFor(() => {
              const currentWord = rotatingText.textContent || '';
              if (currentWord && currentWord !== observedSequence[observedSequence.length - 1]) {
                observedSequence.push(currentWord);
              }
            });
          }
        }
        
        // Verify proper cycling pattern
        expect(observedSequence.length).toBeGreaterThanOrEqual(expectedWords.length + 1);
        
        // Find the cycle transition point
        let cycleTransitionFound = false;
        for (let i = 1; i < observedSequence.length; i++) {
          if (observedSequence[i] === expectedWords[0] && observedSequence[i - 1] === expectedWords[expectedWords.length - 1]) {
            cycleTransitionFound = true;
            break;
          }
        }
        
        expect(cycleTransitionFound).toBe(true);
        
        // Verify no unexpected words
        observedSequence.forEach(word => {
          expect(expectedWords).toContain(word);
          expect(word).not.toBe('');
        });
        
        if (!cycleTransitionFound) {
          console.log('Cycle transition not found in sequence:', observedSequence);
        }
      } finally {
        observer.stop();
      }
    });
  });

  describe('Component State and CSS Class Management', () => {
    it('should apply CSS classes correctly during component state transitions', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      jest.useRealTimers(); // Use real timers for CSS class transitions
      
      const stateValidation = await validateAnimationStates(rotatingText, 5000);
      
      expect(stateValidation.valid).toBe(true);
      expect(stateValidation.stateTransitions.length).toBeGreaterThan(0);
      
      if (!stateValidation.valid) {
        console.log('CSS class state validation failed:', {
          issues: stateValidation.issues,
          stateTransitions: stateValidation.stateTransitions
        });
      }
      
      // Should have at least visible CSS class applied
      const stateTypes = stateValidation.stateTransitions.map(t => t.state);
      expect(stateTypes).toContain('visible');
    });

    it('should handle component re-renders without breaking DOM text cycling', async () => {
      const { getByTestId, rerender } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Record some initial DOM text cycling
        act(() => {
          jest.advanceTimersByTime(6000); // 2 cycles
        });
        
        const sequenceBefore = observer.getWordSequence();
        
        // Force component re-render
        rerender(<Home />);
        
        await waitFor(() => {
          expect(rotatingText).toBeInTheDocument();
        });
        
        // Continue DOM text cycling after re-render
        act(() => {
          jest.advanceTimersByTime(6000); // 2 more cycles
        });
        
        const sequenceAfter = observer.getWordSequence();
        
        // Should have continued DOM text cycling after re-render
        expect(sequenceAfter.length).toBeGreaterThan(sequenceBefore.length);
        
        // All DOM text words should still be valid
        sequenceAfter.forEach(word => {
          expect(word).toBeTruthy();
          expect(expectedWords).toContain(word);
        });
      } finally {
        observer.stop();
      }
    });
  });

  describe('Component Edge Case Handling', () => {
    it('should handle rapid component state changes gracefully', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Rapid fire component state changes
        for (let i = 0; i < 20; i++) {
          act(() => {
            jest.advanceTimersByTime(100);
          });
          
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // DOM should still be in a valid state
        const finalWord = rotatingText.textContent;
        expect(finalWord).toBeTruthy();
        expect(expectedWords).toContain(finalWord);
        
        const sequence = observer.getWordSequence();
        sequence.forEach(word => {
          expect(word).toBeTruthy();
          expect(expectedWords).toContain(word);
        });
      } finally {
        observer.stop();
      }
    });

    it('should recover from component state issues', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Normal component operation first
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        const word1 = rotatingText.textContent;
        
        // Large time jump to test component recovery mechanisms
        act(() => {
          jest.advanceTimersByTime(10000);
        });
        
        await waitFor(() => {
          const word2 = rotatingText.textContent;
          expect(word2).toBeTruthy();
          expect(expectedWords).toContain(word2);
          // DOM should have progressed
          expect(word2).not.toBe(word1);
        });
        
        // Continue normal DOM text cycling
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        const word3 = rotatingText.textContent;
        expect(word3).toBeTruthy();
        expect(expectedWords).toContain(word3);
      } finally {
        observer.stop();
      }
    });
  });
});