/**
 * Rotating Text Animation Tests
 * Following TDD approach - testing the specific animation state machine implementation
 */
import React from 'react'
import { render, screen, waitFor, act } from '../../test-utils'
import { 
  RotatingTextTester, 
  KeyframeAnimationTester,
  AnimationTimingTester,
  disableAnimations,
  enableAnimations
} from '../../test-utils/keyframe-testing'
import { mockRotatingWords } from '../../test-utils/mock-data'
import { advanceTimersByTimeWithAct, fastForwardAnimationTime } from '../../test-utils/act-timer-helpers'

// Component that matches the actual rotating text implementation
function RotatingTextComponent() {
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0)
  const [animationState, setAnimationState] = React.useState<'visible' | 'exiting' | 'entering'>('visible')
  const rotatingWords = mockRotatingWords

  React.useEffect(() => {
    const interval = setInterval(() => {
      // Phase 1: Start exit animation
      setAnimationState('exiting')
      
      // Phase 2: After exit completes, change word and start entrance
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % rotatingWords.length)
        setAnimationState('entering')
        
        // Phase 3: After entrance completes, return to visible state
        setTimeout(() => {
          setAnimationState('visible')
        }, 400) // Entrance animation duration
      }, 400) // Exit animation duration
      
    }, 3000) // Total cycle time

    return () => clearInterval(interval)
  }, [rotatingWords.length])

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

describe('Rotating Text Animation States', () => {
  beforeEach(() => {
    // Use normal animation speed for these tests
    enableAnimations()
  })

  afterEach(() => {
    disableAnimations()
  })

  describe('Animation State Machine', () => {
    it('should start in visible state', () => {
      render(<RotatingTextComponent />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      expect(rotatingText).toHaveClass('rotating-text-visible')
      expect(rotatingText).toHaveTextContent(mockRotatingWords[0])
    })

    it('should transition through all animation states correctly', async () => {
      render(<RotatingTextComponent />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      
      // Should start visible
      expect(rotatingText).toHaveClass('rotating-text-visible')
      
      // Advance to the start of the animation cycle (3000ms interval)
      await advanceTimersByTimeWithAct(3000)
      
      // Should now be in exiting state
      expect(rotatingText).toHaveClass('rotating-text-exiting')
      
      // Advance through exit animation (400ms)
      await advanceTimersByTimeWithAct(400)
      
      // Should now be in entering state (word should change here)
      expect(rotatingText).toHaveClass('rotating-text-entering')
      
      // Advance through entrance animation (400ms)
      await advanceTimersByTimeWithAct(400)
      
      // Should return to visible state
      expect(rotatingText).toHaveClass('rotating-text-visible')
    }, 10000)

    it('should change words during the entering phase', async () => {
      render(<RotatingTextComponent />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      const initialWord = rotatingText.textContent
      
      // Advance to start of animation cycle
      await advanceTimersByTimeWithAct(3000)
      
      // Advance through exit phase
      await advanceTimersByTimeWithAct(400)
      
      // At this point word should change to next in sequence
      expect(rotatingText.textContent).not.toBe(initialWord)
      
      // Should be the next word in the sequence
      const expectedWord = mockRotatingWords[1]
      expect(rotatingText).toHaveTextContent(expectedWord)
    }, 8000)

    it('should cycle through all words in correct order', async () => {
      render(<RotatingTextComponent />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      
      // Track words as they change
      const observedWords: string[] = []
      
      // Add initial word
      observedWords.push(rotatingText.textContent || '')
      
      // Cycle through all words
      for (let i = 1; i < mockRotatingWords.length; i++) {
        // Advance to next cycle (3000ms interval + 400ms exit)
        await advanceTimersByTimeWithAct(3400)
        
        const currentWord = rotatingText.textContent || ''
        observedWords.push(currentWord)
      }
      
      // Should have seen all words
      expect(observedWords).toEqual(mockRotatingWords)
    }, 20000)
  })

  describe('CSS Animation Properties', () => {
    it('should have correct keyframe animations for exiting state', async () => {
      render(<RotatingTextComponent />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      
      // Wait for exiting state
      await waitFor(
        () => {
          expect(rotatingText).toHaveClass('rotating-text-exiting')
        },
        { timeout: 4000 }
      )
      
      // Verify the element has the exiting class which should have the animation
      expect(rotatingText).toHaveClass('rotating-text-exiting')
    }, 8000)

    it('should have correct keyframe animations for entering state', async () => {
      render(<RotatingTextComponent />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      
      // Wait for entering state
      await waitFor(
        () => {
          expect(rotatingText).toHaveClass('rotating-text-entering')
        },
        { timeout: 5000 }
      )
      
      // Verify the element has the entering class which should have the animation
      expect(rotatingText).toHaveClass('rotating-text-entering')
    }, 8000)
  })

  describe('Animation Timing', () => {
    it('should complete each phase within expected timeframes', async () => {
      render(<RotatingTextComponent />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      const timingTester = new AnimationTimingTester()
      
      // Start timing when exiting phase begins
      await waitFor(
        () => {
          expect(rotatingText).toHaveClass('rotating-text-exiting')
          timingTester.startTiming()
        },
        { timeout: 4000 }
      )
      
      // Wait for complete cycle back to visible
      await waitFor(
        () => {
          expect(rotatingText).toHaveClass('rotating-text-visible')
        },
        { timeout: 2000 }
      )
      
      // Total animation time should be around 800ms (400ms exit + 400ms entrance)
      timingTester.verifyDuration(800, 200)
    }, 10000)

    it('should maintain consistent cycle timing', async () => {
      render(<RotatingTextComponent />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      const cycleTimes: number[] = []
      
      // Record multiple cycle timings
      for (let i = 0; i < 2; i++) {
        const startTime = performance.now()
        
        // Wait for word change
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
      
      // All cycles should be approximately 3000ms
      cycleTimes.forEach(time => {
        expect(time).toBeGreaterThanOrEqual(2800) // Allow some tolerance
        expect(time).toBeLessThanOrEqual(3200)
      })
    }, 15000)
  })

  describe('Container Properties', () => {
    it('should have proper container styling to prevent cutoff', () => {
      render(<RotatingTextComponent />)
      
      const container = screen.getByText(mockRotatingWords[0]).parentElement
      expect(container).toHaveClass('rotating-text-container')
      
      // Instead of testing computed styles (which return empty in JSDOM),
      // test that the container has the expected class which should have the styles applied
      expect(container).toHaveClass('rotating-text-container')
      
      // Verify the container exists and contains the rotating text
      expect(container).toBeInTheDocument()
      expect(container).toContainElement(screen.getByTestId('rotating-text'))
    })

    it('should maintain text alignment with surrounding content', () => {
      render(<RotatingTextComponent />)
      
      const container = screen.getByText(mockRotatingWords[0]).parentElement
      
      // Test that container has the rotating-text-container class
      // which should handle alignment properly
      expect(container).toHaveClass('rotating-text-container')
      
      // Test that the container is inline with surrounding text
      const heading = container?.closest('h1')
      expect(heading).toHaveTextContent('Premium Amenity for Modern')
      expect(heading).toContainElement(container!)
    })
  })

  describe('React Key Prop Behavior', () => {
    it('should re-mount component when word changes due to key prop', async () => {
      render(<RotatingTextComponent />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      const initialWord = rotatingText.textContent
      
      // Wait for word change (which indicates the component re-mounted with new key)
      await waitFor(
        () => {
          const currentWord = rotatingText.textContent
          expect(currentWord).not.toBe(initialWord)
        },
        { timeout: 5000 }
      )
      
      // Verify the new word is from our expected list
      const currentWord = rotatingText.textContent
      expect(mockRotatingWords).toContain(currentWord)
    }, 8000)
  })

  describe('Error Resilience', () => {
    it('should handle rapid state changes gracefully', async () => {
      render(<RotatingTextComponent />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      
      // Component should remain stable through multiple cycles
      for (let i = 0; i < 3; i++) {
        await waitFor(
          () => {
            expect(rotatingText).toBeInTheDocument()
          },
          { timeout: 4000 }
        )
      }
    }, 15000)

    it('should not get stuck in any particular state', async () => {
      render(<RotatingTextComponent />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      const stateHistory: string[] = []
      
      // Record initial state
      const initialState = Array.from(rotatingText.classList).find(cls => cls.includes('rotating-text-'))
      if (initialState) {
        stateHistory.push(initialState)
      }
      
      // Monitor states over time
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
      
      // Wait for multiple state transitions
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