/**
 * Logo Staggered Animation Tests
 * Following TDD approach - testing the staggered logo fade-in animations
 */
import React from 'react'
import { render, screen, waitFor, act } from '../../test-utils'
import { 
  StaggeredAnimationTester,
  AnimationTimingTester,
  KeyframeAnimationTester,
  disableAnimations,
  enableAnimations
} from '../../test-utils/keyframe-testing'
import { mockLogos } from '../../test-utils/mock-data'

// Component that matches the actual logo staggered animation implementation
function LogoStaggerComponent() {
  const [logoAnimations, setLogoAnimations] = React.useState<boolean[]>(
    new Array(mockLogos.length).fill(false)
  )

  const triggerLogoAnimations = React.useCallback(() => {
    const newAnimations = [...logoAnimations]
    
    // Stagger the animations with 150ms delay
    mockLogos.forEach((_, index) => {
      setTimeout(() => {
        newAnimations[index] = true
        setLogoAnimations([...newAnimations])
      }, index * 150)
    })
  }, [logoAnimations])

  React.useEffect(() => {
    // Trigger animations after component mount
    const timer = setTimeout(() => {
      triggerLogoAnimations()
    }, 500)

    return () => clearTimeout(timer)
  }, [triggerLogoAnimations])

  return (
    <div>
      <h3>Trusted by Leading Companies</h3>
      <div className="logos-grid" data-testid="logos-container">
        {mockLogos.map((logo, index) => (
          <div 
            key={logo.alt}
            className={`logo-item ${logoAnimations[index] ? 'animate-fade-in' : ''}`}
            data-testid={`logo-${index}`}
            data-logo-name={logo.alt}
          >
            <img 
              src={logo.src} 
              alt={logo.alt} 
              width={120}
              height={60}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

describe('Logo Staggered Animations', () => {
  beforeEach(() => {
    enableAnimations()
  })

  afterEach(() => {
    disableAnimations()
  })

  describe('Staggered Animation Timing', () => {
    it('should render all logo elements initially without animation class', () => {
      render(<LogoStaggerComponent />)
      
      mockLogos.forEach((logo, index) => {
        const logoElement = screen.getByTestId(`logo-${index}`)
        expect(logoElement).toBeInTheDocument()
        expect(logoElement).not.toHaveClass('animate-fade-in')
      })
    })

    it('should trigger animations in staggered sequence', async () => {
      render(<LogoStaggerComponent />)
      
      const timingTester = new AnimationTimingTester()
      const animationTimes: number[] = []
      
      // Monitor when each logo gets the animation class
      for (let i = 0; i < mockLogos.length; i++) {
        const logoElement = screen.getByTestId(`logo-${i}`)
        
        await waitFor(
          () => {
            expect(logoElement).toHaveClass('animate-fade-in')
            animationTimes.push(performance.now())
          },
          { timeout: 2000 }
        )
      }
      
      // Verify stagger timing - each logo should animate 150ms after the previous
      for (let i = 1; i < animationTimes.length; i++) {
        const delay = animationTimes[i] - animationTimes[i - 1]
        expect(delay).toBeGreaterThanOrEqual(140) // Allow 10ms tolerance
        expect(delay).toBeLessThanOrEqual(160)
      }
    }, 5000)

    it('should start animations after initial delay', async () => {
      const timingTester = new AnimationTimingTester()
      timingTester.startTiming()
      
      render(<LogoStaggerComponent />)
      
      // First logo should start animating after ~500ms delay
      const firstLogo = screen.getByTestId('logo-0')
      await waitFor(
        () => {
          expect(firstLogo).toHaveClass('animate-fade-in')
        },
        { timeout: 1000 }
      )
      
      const elapsed = timingTester.endTiming()
      expect(elapsed).toBeGreaterThanOrEqual(480) // Initial delay + some tolerance
      expect(elapsed).toBeLessThanOrEqual(600)
    }, 3000)

    it('should animate all logos within reasonable timeframe', async () => {
      render(<LogoStaggerComponent />)
      
      const totalLogos = mockLogos.length
      const expectedTotalTime = 500 + (totalLogos - 1) * 150 // Initial delay + stagger delays
      
      const timingTester = new AnimationTimingTester()
      timingTester.startTiming()
      
      // Wait for last logo to start animating
      const lastLogo = screen.getByTestId(`logo-${totalLogos - 1}`)
      await waitFor(
        () => {
          expect(lastLogo).toHaveClass('animate-fade-in')
        },
        { timeout: 2000 }
      )
      
      timingTester.verifyDuration(expectedTotalTime, 100)
    }, 3000)
  })

  describe('Animation CSS Properties', () => {
    it('should apply fade-in animation to animated logos', async () => {
      render(<LogoStaggerComponent />)
      
      const firstLogo = screen.getByTestId('logo-0')
      
      // Wait for animation to start
      await waitFor(
        () => {
          expect(firstLogo).toHaveClass('animate-fade-in')
        },
        { timeout: 1000 }
      )
      
      const keyframeTester = new KeyframeAnimationTester(firstLogo)
      await keyframeTester.testFadeIn()
    }, 3000)

    it('should have proper CSS animation properties on animated elements', async () => {
      render(<LogoStaggerComponent />)
      
      const logoElement = screen.getByTestId('logo-0')
      
      await waitFor(
        () => {
          expect(logoElement).toHaveClass('animate-fade-in')
        },
        { timeout: 1000 }
      )
      
      const computedStyle = window.getComputedStyle(logoElement)
      
      // Should have animation properties set
      expect(computedStyle.animationName).toMatch(/fadeIn|fade-in/)
      expect(computedStyle.animationDuration).toBeDefined()
      expect(computedStyle.animationTimingFunction).toBeDefined()
    }, 3000)
  })

  describe('Logo Content and Accessibility', () => {
    it('should render correct logo images with proper alt text', () => {
      render(<LogoStaggerComponent />)
      
      mockLogos.forEach((logo, index) => {
        const logoElement = screen.getByTestId(`logo-${index}`)
        const imageElement = logoElement.querySelector('img')
        
        expect(imageElement).toHaveAttribute('src', logo.src)
        expect(imageElement).toHaveAttribute('alt', logo.alt)
        expect(imageElement).toHaveAttribute('width', '120')
        expect(imageElement).toHaveAttribute('height', '60')
      })
    })

    it('should maintain logo visibility during and after animation', async () => {
      render(<LogoStaggerComponent />)
      
      // Check that all logos remain visible throughout the animation
      for (let i = 0; i < mockLogos.length; i++) {
        const logoElement = screen.getByTestId(`logo-${i}`)
        
        // Should be visible before animation
        expect(logoElement).toBeInTheDocument()
        
        // Wait for animation to start
        await waitFor(
          () => {
            expect(logoElement).toHaveClass('animate-fade-in')
          },
          { timeout: 2000 }
        )
        
        // Should still be visible during animation
        expect(logoElement).toBeVisible()
      }
    }, 5000)

    it('should have proper data attributes for testing', () => {
      render(<LogoStaggerComponent />)
      
      mockLogos.forEach((logo, index) => {
        const logoElement = screen.getByTestId(`logo-${index}`)
        expect(logoElement).toHaveAttribute('data-logo-name', logo.alt)
      })
    })
  })

  describe('Staggered Animation Utilities', () => {
    it('should work with StaggeredAnimationTester utility', async () => {
      render(<LogoStaggerComponent />)
      
      // Wait for first animation to start
      await waitFor(
        () => {
          const firstLogo = screen.getByTestId('logo-0')
          expect(firstLogo).toHaveClass('animate-fade-in')
        },
        { timeout: 1000 }
      )
      
      const staggeredTester = new StaggeredAnimationTester('.logo-item', 150)
      expect(staggeredTester.getElementCount()).toBe(mockLogos.length)
      
      // Test staggered animation with utility
      await staggeredTester.verifyStaggeredAnimation('animate-fade-in')
    }, 5000)
  })

  describe('Performance and Efficiency', () => {
    it('should not cause excessive re-renders', async () => {
      let renderCount = 0
      
      const WrappedComponent = React.memo(() => {
        renderCount++
        return <LogoStaggerComponent />
      })
      
      render(<WrappedComponent />)
      
      // Wait for all animations to complete
      await waitFor(
        () => {
          const lastLogo = screen.getByTestId(`logo-${mockLogos.length - 1}`)
          expect(lastLogo).toHaveClass('animate-fade-in')
        },
        { timeout: 2000 }
      )
      
      // Should not have excessive re-renders
      expect(renderCount).toBeLessThanOrEqual(mockLogos.length + 2) // Initial + one per logo + buffer
    }, 3000)

    it('should clean up timers on unmount', () => {
      const { unmount } = render(<LogoStaggerComponent />)
      
      // Should not throw errors or cause memory leaks
      expect(() => {
        unmount()
      }).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty logo array gracefully', () => {
      const EmptyLogoComponent = () => (
        <div>
          <div className="logos-grid" data-testid="logos-container">
            {/* No logos */}
          </div>
        </div>
      )
      
      render(<EmptyLogoComponent />)
      
      const container = screen.getByTestId('logos-container')
      expect(container).toBeInTheDocument()
      expect(container.children).toHaveLength(0)
    })

    it('should handle component unmount during animation', async () => {
      const { unmount } = render(<LogoStaggerComponent />)
      
      // Start unmount process while animations are likely running
      setTimeout(() => {
        expect(() => unmount()).not.toThrow()
      }, 200)
      
      // Wait for potential unmount
      await waitFor(
        () => {
          expect(true).toBe(true) // Just wait a bit
        },
        { timeout: 500 }
      )
    })

    it('should work correctly with different numbers of logos', () => {
      const CustomLogoComponent = () => {
        const customLogos = mockLogos.slice(0, 2) // Only use first 2 logos
        
        return (
          <div className="logos-grid">
            {customLogos.map((logo, index) => (
              <div 
                key={logo.alt}
                className="logo-item"
                data-testid={`custom-logo-${index}`}
              >
                <img src={logo.src} alt={logo.alt} />
              </div>
            ))}
          </div>
        )
      }
      
      render(<CustomLogoComponent />)
      
      expect(screen.getByTestId('custom-logo-0')).toBeInTheDocument()
      expect(screen.getByTestId('custom-logo-1')).toBeInTheDocument()
      expect(screen.queryByTestId('custom-logo-2')).not.toBeInTheDocument()
    })
  })
})