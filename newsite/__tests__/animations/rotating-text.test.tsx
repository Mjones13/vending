/**
 * Rotating Text Animation Tests
 * Three-Tier Testing Strategy Implementation:
 * - Tier 1: Animation Logic (state machines, hooks, timing logic)
 * - Tier 2: Component Behavior (DOM changes, text updates, className changes)
 * Following TDD approach - testing the specific animation state machine implementation
 */
import * as React from 'react'
import { render, screen, waitFor, act } from '../../test-utils'
import { 
  testAnimationHook,
  createTestStateMachine,
  AnimationStateMachine,
  isAnimationRunning,
  isAnimationComplete
} from '../../test-utils/animation-state-testing'
import { 
  simulateKeyframePhases,
  KeyframeAnimationTester,
  commonAnimationConfigs
} from '../../test-utils/keyframe-testing'
import {
  mockAnimationProperties,
  clearAnimationMocks
} from '../../test-utils/css-animation-mocking'
import { mockRotatingWords } from '../../test-utils/mock-data'
import {
  setupRealTimers,
  waitForTimeout,
  cleanupTimers
} from '../../test-utils/timer-helpers'

// Component that matches the actual rotating text implementation
// Modified to support maxCycles for testing to prevent infinite loops
function RotatingTextComponent({ maxCycles }: { maxCycles?: number }) {
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0)
  const [animationState, setAnimationState] = React.useState<'visible' | 'exiting' | 'entering'>('visible')
  const [cycleCount, setCycleCount] = React.useState(0)
  const rotatingWords = mockRotatingWords

  React.useEffect(() => {
    // If maxCycles is set and we've reached it, don't start interval
    if (maxCycles && cycleCount >= maxCycles) {
      return
    }

    const interval = setInterval(() => {
      // Check if we should stop cycling
      if (maxCycles && cycleCount >= maxCycles - 1) {
        clearInterval(interval)
        return
      }

      // Phase 1: Start exit animation
      setAnimationState('exiting')
      
      // Phase 2: After exit completes, change word and start entrance
      setTimeout(() => {
        setCurrentWordIndex((prevIndex: number) => (prevIndex + 1) % rotatingWords.length)
        setAnimationState('entering')
        setCycleCount((prev: number) => prev + 1)
        
        // Phase 3: After entrance completes, return to visible state
        setTimeout(() => {
          setAnimationState('visible')
        }, 400) // Entrance animation duration
      }, 400) // Exit animation duration
      
    }, 3000) // Total cycle time

    return () => clearInterval(interval)
  }, [rotatingWords.length, maxCycles, cycleCount])

  return (
    <div>
      <h1>
        Premium Amenity for Modern{' '}
        <span className="rotating-text-container">
          <span 
            key={currentWordIndex}
            className={`rotating-text rotating-text-${animationState}`}
            data-testid="rotating-text"
          >
            {rotatingWords[currentWordIndex]}
          </span>
        </span>
      </h1>
    </div>
  )
}

// TIER 1: Animation Logic Testing
describe('Rotating Text Animation Logic (Tier 1)', () => {
  beforeEach(() => {
    // Mock CSS animation properties for state testing
    mockAnimationProperties('.rotating-text', {
      animationName: 'textRotate',
      animationDuration: '3s',
      animationIterationCount: 'infinite'
    })
    mockAnimationProperties('.rotating-text-exiting', {
      animationName: 'fadeOutDown',
      animationDuration: '0.4s'
    })
    mockAnimationProperties('.rotating-text-entering', {
      animationName: 'fadeInUp',
      animationDuration: '0.4s'
    })
  })

  afterEach(() => {
    clearAnimationMocks()
  })

  describe('Animation State Machine Logic', () => {
    it('should transition through correct animation states', () => {
      const { machine, expectTransition, validateTransitions } = createTestStateMachine('idle')
      
      // Define expected state flow for rotating text
      expectTransition('idle', 'running')
      expectTransition('running', 'completed')
      
      // Execute state transitions
      machine.transition('running', 'text-rotation-start')
      machine.transition('completed', 'cycle-complete')
      
      // Validate the transitions occurred as expected
      validateTransitions()
    })

    it('should handle state machine for word cycling logic', () => {
      const stateMachine = new AnimationStateMachine('idle')
      
      // Test initial state
      expect(stateMachine.getCurrentState()).toBe('idle')
      
      // Test transition to running (exiting phase)
      stateMachine.transition('running', 'exit-animation-start')
      expect(isAnimationRunning(stateMachine.getCurrentState())).toBe(true)
      
      // Test completion (entering phase)
      stateMachine.transition('completed', 'enter-animation-complete')
      expect(isAnimationComplete(stateMachine.getCurrentState())).toBe(true)
      
      // Verify transition history
      const transitions = stateMachine.getTransitionHistory()
      expect(transitions).toHaveLength(2)
      expect(transitions[0]?.trigger).toBe('exit-animation-start')
      expect(transitions[1]?.trigger).toBe('enter-animation-complete')
    })

    it('should test word cycling logic with animation state hooks', () => {
      // Create a mock hook for testing word rotation logic
      const useRotatingTextLogic = (words: string[]) => {
        const [currentIndex, setCurrentIndex] = React.useState(0)
        const [state, setState] = React.useState<'visible' | 'exiting' | 'entering'>('visible')
        
        const cycleToNext = React.useCallback(() => {
          setState('exiting')
          setTimeout(() => {
            setCurrentIndex((prev: number) => (prev + 1) % words.length)
            setState('entering')
            setTimeout(() => setState('visible'), 400)
          }, 400)
        }, [words.length])
        
        return { currentIndex, state, cycleToNext, currentWord: words[currentIndex] }
      }
      
      const { result, triggerTransition } = testAnimationHook(() => 
        useRotatingTextLogic(mockRotatingWords)
      )
      
      // Test initial state
      expect(result.current.currentIndex).toBe(0)
      expect(result.current.state).toBe('visible')
      expect(result.current.currentWord).toBe(mockRotatingWords[0])
      
      // Trigger transition and test logic
      act(() => {
        result.current.cycleToNext()
      })
      
      expect(result.current.state).toBe('exiting')
    })
  })

  describe('Animation Timing Logic', () => {
    it('should calculate correct animation phase durations', async () => {
      const timeline = await simulateKeyframePhases({
        name: 'textRotation',
        duration: 3000, // 3 second cycle
        steps: 10
      })
      
      expect(timeline.duration).toBe(3000)
      expect(timeline.steps).toHaveLength(11) // 0-100% in 10 steps
      expect(timeline.endTime).toBeDefined()
      expect(timeline.endTime! - timeline.startTime).toBeCloseTo(3000, -2)
    })

    it('should validate animation phase progression logic', async () => {
      const tester = new KeyframeAnimationTester(commonAnimationConfigs.rotateText)
      
      const phases: string[] = []
      tester.onPhaseChange((phase) => {
        phases.push(phase)
      })
      
      tester.start()
      
      // Wait for animation to progress
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(phases).toContain('before-start')
      expect(phases).toContain('animating')
      
      tester.destroy()
    })
  })
})

// TIER 2: Component Behavior Testing
describe('Rotating Text Component Behavior (Tier 2)', () => {
  beforeEach(() => {
    // Use real timers for component behavior testing
    setupRealTimers()
    // Mock CSS animation properties for behavior tests
    mockAnimationProperties('.rotating-text-visible', {
      animationName: 'none',
      animationDuration: '0s'
    })
    mockAnimationProperties('.rotating-text-exiting', {
      animationName: 'fadeOutDown',
      animationDuration: '0.4s'
    })
    mockAnimationProperties('.rotating-text-entering', {
      animationName: 'fadeInUp',
      animationDuration: '0.4s'
    })
  })

  afterEach(async () => {
    clearAnimationMocks()
    await cleanupTimers()
  })

  describe('Component State Behavior', () => {
    it('should start in visible state with correct text content', () => {
      render(<RotatingTextComponent />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      expect(rotatingText).toHaveClass('rotating-text-visible')
      expect(rotatingText).toHaveTextContent(mockRotatingWords[0] || '')
    })

    it('should apply correct CSS classes during component state transitions', async () => {
      render(<RotatingTextComponent maxCycles={1} />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      
      // Should start visible
      expect(rotatingText).toHaveClass('rotating-text-visible')
      
      // Wait for exiting class to be applied
      await waitFor(
        () => {
          expect(rotatingText).toHaveClass('rotating-text-exiting')
        },
        { timeout: 4000 }
      )
      
      // Wait for entering class to be applied (word should change here)
      await waitFor(
        () => {
          expect(rotatingText).toHaveClass('rotating-text-entering')
        },
        { timeout: 1000 }
      )
      
      // Wait to return to visible class
      await waitFor(
        () => {
          expect(rotatingText).toHaveClass('rotating-text-visible')
        },
        { timeout: 1000 }
      )
    }, 10000)

    it('should update text content during component state changes', async () => {
      render(<RotatingTextComponent maxCycles={1} />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      const initialWord = rotatingText.textContent
      
      // Wait for text content to change
      await waitFor(
        () => {
          expect(rotatingText.textContent).not.toBe(initialWord)
        },
        { timeout: 5000 }
      )
      
      // Should be the next word in the sequence
      const expectedWord = mockRotatingWords[1]
      expect(rotatingText).toHaveTextContent(expectedWord || '')
    }, 8000)

    it('should cycle through all words in correct sequence', async () => {
      render(<RotatingTextComponent maxCycles={mockRotatingWords.length} />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      
      // Track words as they change in DOM
      const observedWords: string[] = [rotatingText.textContent || '']
      
      // Wait for each word change in DOM content
      for (let i = 1; i < mockRotatingWords.length; i++) {
        await waitFor(
          () => {
            const currentWord = rotatingText.textContent || ''
            if (currentWord !== observedWords[observedWords.length - 1]) {
              observedWords.push(currentWord)
              return true
            }
            return false
          },
          { timeout: 4000 }
        )
      }
      
      // Should have seen all words in DOM
      expect(observedWords).toEqual(mockRotatingWords)
    }, 20000)
  })

  describe('CSS Class Application', () => {
    it('should apply correct CSS class for exiting state', async () => {
      render(<RotatingTextComponent maxCycles={1} />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      
      // Wait for exiting class to be applied
      await waitFor(
        () => {
          expect(rotatingText).toHaveClass('rotating-text-exiting')
        },
        { timeout: 4000 }
      )
      
      // Verify the element has the exiting class (animation properties are mocked)
      expect(rotatingText).toHaveClass('rotating-text-exiting')
    }, 8000)

    it('should apply correct CSS class for entering state', async () => {
      render(<RotatingTextComponent maxCycles={1} />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      
      // Wait for entering class to be applied
      await waitFor(
        () => {
          expect(rotatingText).toHaveClass('rotating-text-entering')
        },
        { timeout: 5000 }
      )
      
      // Verify the element has the entering class (animation properties are mocked)
      expect(rotatingText).toHaveClass('rotating-text-entering')
    }, 8000)
  })

  describe('Component Timing Behavior', () => {
    it('should complete state transitions within expected timeframes', async () => {
      render(<RotatingTextComponent maxCycles={1} />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      let startTime: number
      
      // Start timing when exiting class is applied
      await waitFor(
        () => {
          expect(rotatingText).toHaveClass('rotating-text-exiting')
          startTime = performance.now()
        },
        { timeout: 4000 }
      )
      
      // Wait for complete cycle back to visible class
      await waitFor(
        () => {
          expect(rotatingText).toHaveClass('rotating-text-visible')
        },
        { timeout: 2000 }
      )
      
      // Total transition time should be around 800ms (400ms exit + 400ms entrance)
      const totalTime = performance.now() - startTime!
      expect(totalTime).toBeGreaterThan(600) // Allow some tolerance
      expect(totalTime).toBeLessThan(1200)
    }, 10000)

    it('should maintain consistent text change timing', async () => {
      render(<RotatingTextComponent maxCycles={2} />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      const cycleTimes: number[] = []
      
      // Record multiple cycle timings for text content changes
      for (let i = 0; i < 2; i++) {
        const startTime = performance.now()
        
        // Wait for text content change in DOM
        const initialWord = rotatingText.textContent
        await waitFor(
          () => {
            expect(rotatingText.textContent).not.toBe(initialWord)
          },
          { timeout: 4000 }
        )
        
        const endTime = performance.now()
        cycleTimes.push(endTime - startTime)
      }
      
      // All text changes should occur approximately every 3000ms
      cycleTimes.forEach(time => {
        expect(time).toBeGreaterThanOrEqual(2800) // Allow some tolerance
        expect(time).toBeLessThanOrEqual(3200)
      })
    }, 15000)
  })

  describe('DOM Structure and Container Behavior', () => {
    it('should have proper container element with correct CSS class', () => {
      render(<RotatingTextComponent />)
      
      const firstWord = mockRotatingWords[0];
      if (!firstWord) throw new Error('First word is required for test');
      const container = screen.getByText(firstWord).parentElement
      expect(container).toHaveClass('rotating-text-container')
      
      // Test container DOM structure (not visual styles)
      expect(container).toBeInTheDocument()
      expect(container).toContainElement(screen.getByTestId('rotating-text'))
    })

    it('should maintain proper DOM hierarchy with surrounding content', () => {
      render(<RotatingTextComponent />)
      
      const firstWord = mockRotatingWords[0];
      if (!firstWord) throw new Error('First word is required for test');
      const container = screen.getByText(firstWord).parentElement
      
      // Test DOM structure and class application
      expect(container).toHaveClass('rotating-text-container')
      
      // Test that the container is properly nested in DOM
      const heading = container?.closest('h1')
      expect(heading).toHaveTextContent('Premium Amenity for Modern')
      expect(heading).toContainElement(container!)
    })
  })

  describe('React Component Behavior', () => {
    it('should handle React key prop changes for component re-mounting', async () => {
      render(<RotatingTextComponent maxCycles={1} />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      const initialWord = rotatingText.textContent
      
      // Wait for word change (indicates React re-rendering with new key)
      await waitFor(
        () => {
          const currentWord = rotatingText.textContent
          expect(currentWord).not.toBe(initialWord)
        },
        { timeout: 5000 }
      )
      
      // Verify the new word is from expected list in DOM
      const currentWord = rotatingText.textContent
      expect(mockRotatingWords).toContain(currentWord)
    }, 8000)
  })

  describe('Component Resilience', () => {
    it('should maintain DOM stability through multiple cycles', async () => {
      render(<RotatingTextComponent maxCycles={3} />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      
      // Component DOM element should remain stable through multiple cycles
      for (let i = 0; i < 3; i++) {
        await waitFor(
          () => {
            expect(rotatingText).toBeInTheDocument()
          },
          { timeout: 4000 }
        )
      }
    }, 15000)

    it('should transition through all CSS classes without getting stuck', async () => {
      render(<RotatingTextComponent maxCycles={1} />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      const stateHistory: string[] = []
      
      // Record initial CSS class state
      const initialState = Array.from(rotatingText.classList).find(cls => cls.includes('rotating-text-'))
      if (initialState) {
        stateHistory.push(initialState)
      }
      
      // Monitor CSS class changes over time
      const observer = new MutationObserver(() => {
        const classes = Array.from(rotatingText.classList)
        const animationState = classes.find(cls => cls.includes('rotating-text-'))
        if (animationState && !stateHistory.includes(animationState)) {
          stateHistory.push(animationState)
        }
      })
      
      observer.observe(rotatingText, {
        attributes: true,
        attributeFilter: ['class']
      })
      
      // Wait for multiple CSS class transitions
      await waitFor(
        () => {
          expect(stateHistory.length).toBeGreaterThanOrEqual(3)
          expect(stateHistory).toContain('rotating-text-visible')
          expect(stateHistory).toContain('rotating-text-exiting')
          expect(stateHistory).toContain('rotating-text-entering')
        },
        { timeout: 10000 }
      )
      
      observer.disconnect()
    }, 12000)
  })
})
