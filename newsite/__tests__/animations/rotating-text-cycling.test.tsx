/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../pages/index';
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

describe('Homepage Rotating Text Cycling', () => {
  const expectedWords = ['Workplaces', 'Apartments', 'Gyms', 'Businesses'];
  
  beforeEach(() => {
    // Use real timers for rotating text
    setupRealTimers();
    document.body.innerHTML = '';
  });

  afterEach(async () => {
    await cleanupTimers();
    jest.restoreAllMocks();
  });

  describe('Word Sequence Cycling', () => {
    it('should cycle through all words in correct order', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        const initialWord = rotatingText.textContent;
        expect(expectedWords).toContain(initialWord);
        
        // Advance through multiple cycles
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
          console.log('Sequence validation failed:', {
            issues: validation.issues,
            actualSequence: validation.actualSequence,
            expectedSequence: validation.expectedSequence
          });
        }
      } finally {
        observer.stop();
      }
    });

    it('should properly loop back to first word after last word', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Wait for the last word in sequence
        await waitFor(() => {
          expect(rotatingText.textContent).toBe('Businesses');
        }, { timeout: 15000 });
        
        // Advance to next word (should cycle back to first)
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
          console.log('Cycling validation failed:', {
            issues: cycling.issues,
            cycleTransitions: cycling.cycleTransitions
          });
        }
      } finally {
        observer.stop();
      }
    });

    it('should handle edge cases with word array changes', async () => {
      // This test would require modifying the component to accept dynamic word arrays
      // For now, we'll test the robustness of the current implementation
      
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Simulate rapid time advancement to stress-test the cycling logic
        for (let i = 0; i < 10; i++) {
          act(() => {
            jest.advanceTimersByTime(300); // Rapid time jumps
          });
          
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Should still have valid word after stress test
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

    it('should maintain sequence integrity during timing glitches', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Record initial state
        const initialWord = rotatingText.textContent;
        
        // Simulate timing irregularities
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
        
        // Verify no invalid words appeared
        sequence.forEach(word => {
          expect(word).toBeTruthy();
          expect(expectedWords).toContain(word);
        });
        
        // Should have progressed through sequence despite irregular timing
        expect(sequence.length).toBeGreaterThan(2);
      } finally {
        observer.stop();
      }
    });
  });

  describe('Complete Cycle Validation', () => {
    it('should complete full cycles without missing words', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      jest.useRealTimers(); // Use real timers for this test
      
      const cycleResult = await waitForCompleteCycle(rotatingText, expectedWords, 20000);
      
      expect(cycleResult.success).toBe(true);
      expect(cycleResult.observedWords).toEqual(expect.arrayContaining(expectedWords));
      expect(cycleResult.observedWords.length).toBe(expectedWords.length);
      
      if (!cycleResult.success) {
        console.log('Complete cycle failed:', {
          observedWords: cycleResult.observedWords,
          duration: cycleResult.duration,
          missingWords: expectedWords.filter(word => !cycleResult.observedWords.includes(word))
        });
      }
    });

    it('should never display empty text during transitions', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Monitor for 10 cycles
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
          console.log('Found empty words in sequence:', sequence);
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

  describe('Animation State Management', () => {
    it('should transition through animation states correctly', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      jest.useRealTimers(); // Use real timers for state transitions
      
      const stateValidation = await validateAnimationStates(rotatingText, 5000);
      
      expect(stateValidation.valid).toBe(true);
      expect(stateValidation.stateTransitions.length).toBeGreaterThan(0);
      
      if (!stateValidation.valid) {
        console.log('Animation state validation failed:', {
          issues: stateValidation.issues,
          stateTransitions: stateValidation.stateTransitions
        });
      }
      
      // Should have at least visible and transition states
      const stateTypes = stateValidation.stateTransitions.map(t => t.state);
      expect(stateTypes).toContain('visible');
    });

    it('should handle component re-renders without breaking cycling', async () => {
      const { getByTestId, rerender } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Record some initial cycling
        act(() => {
          jest.advanceTimersByTime(6000); // 2 cycles
        });
        
        const sequenceBefore = observer.getWordSequence();
        
        // Force re-render
        rerender(<Home />);
        
        await waitFor(() => {
          expect(rotatingText).toBeInTheDocument();
        });
        
        // Continue cycling after re-render
        act(() => {
          jest.advanceTimersByTime(6000); // 2 more cycles
        });
        
        const sequenceAfter = observer.getWordSequence();
        
        // Should have continued cycling after re-render
        expect(sequenceAfter.length).toBeGreaterThan(sequenceBefore.length);
        
        // All words should still be valid
        sequenceAfter.forEach(word => {
          expect(word).toBeTruthy();
          expect(expectedWords).toContain(word);
        });
      } finally {
        observer.stop();
      }
    });
  });

  describe('Edge Case Handling', () => {
    it('should handle rapid state changes gracefully', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Rapid fire state changes
        for (let i = 0; i < 20; i++) {
          act(() => {
            jest.advanceTimersByTime(100);
          });
          
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // Should still be in a valid state
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

    it('should recover from stuck animation states', async () => {
      const { getByTestId } = render(<Home />);
      const rotatingText = getByTestId('rotating-text');
      
      const observer = new WordSequenceObserver(rotatingText);
      observer.start();
      
      try {
        // Normal operation first
        act(() => {
          jest.advanceTimersByTime(3000);
        });
        
        const word1 = rotatingText.textContent;
        
        // Large time jump to test recovery mechanisms
        act(() => {
          jest.advanceTimersByTime(10000);
        });
        
        await waitFor(() => {
          const word2 = rotatingText.textContent;
          expect(word2).toBeTruthy();
          expect(expectedWords).toContain(word2);
          // Should have progressed
          expect(word2).not.toBe(word1);
        });
        
        // Continue normal cycling
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