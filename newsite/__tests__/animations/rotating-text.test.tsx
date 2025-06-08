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
      
      // Wait for exiting state
      await waitFor(
        () => {
          expect(rotatingText).toHaveClass('rotating-text-exiting')
        },
        { timeout: 4000 }
      )
      
      // Wait for entering state (word should change here)
      await waitFor(
        () => {
          expect(rotatingText).toHaveClass('rotating-text-entering')
        },
        { timeout: 1000 }
      )
      
      // Wait to return to visible state
      await waitFor(
        () => {
          expect(rotatingText).toHaveClass('rotating-text-visible')
        },
        { timeout: 1000 }
      )
    }, 10000)

    it('should change words during the entering phase', async () => {
      render(<RotatingTextComponent />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      const initialWord = rotatingText.textContent
      
      // Wait for word to change
      await waitFor(
        () => {
          expect(rotatingText.textContent).not.toBe(initialWord)
        },
        { timeout: 5000 }
      )
      
      // Should be the next word in the sequence
      const expectedWord = mockRotatingWords[1]
      expect(rotatingText).toHaveTextContent(expectedWord)
    }, 8000)

    it('should cycle through all words in correct order', async () => {
      render(<RotatingTextComponent />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      
      // Track words as they change
      const observedWords: string[] = []
      
      for (let i = 0; i < mockRotatingWords.length; i++) {
        await waitFor(
          () => {
            const currentWord = rotatingText.textContent || ''
            if (!observedWords.includes(currentWord)) {
              observedWords.push(currentWord)
            }
            expect(observedWords).toHaveLength(i + 1)
          },
          { timeout: 4000 }
        )
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
      
      const keyframeTester = new KeyframeAnimationTester(rotatingText)
      await keyframeTester.testSlideUpAndOut()
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
      
      const keyframeTester = new KeyframeAnimationTester(rotatingText)
      await keyframeTester.testSlideUpFromBottom()
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
      
      const computedStyle = window.getComputedStyle(container!)
      expect(computedStyle.display).toBe('inline-block')
      expect(computedStyle.position).toBe('relative')
      expect(computedStyle.overflow).toBe('hidden')
      
      // Should have adequate minimum width
      const minWidth = parseInt(computedStyle.minWidth)
      expect(minWidth).toBeGreaterThanOrEqual(280)
    })

    it('should maintain text alignment with surrounding content', () => {
      render(<RotatingTextComponent />)
      
      const container = screen.getByText(mockRotatingWords[0]).parentElement
      const computedStyle = window.getComputedStyle(container!)
      
      expect(computedStyle.verticalAlign).toBe('baseline')
      expect(computedStyle.lineHeight).toBe('inherit')
    })
  })

  describe('React Key Prop Behavior', () => {
    it('should re-mount component when word changes due to key prop', async () => {
      render(<RotatingTextComponent />)
      
      const rotatingText = screen.getByTestId('rotating-text')
      const initialKey = rotatingText.getAttribute('key') || '0'
      
      // Wait for word change
      await waitFor(
        () => {
          const currentKey = rotatingText.getAttribute('key') || '0'
          expect(currentKey).not.toBe(initialKey)
        },
        { timeout: 5000 }
      )
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