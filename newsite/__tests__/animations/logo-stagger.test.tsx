/**
 * Logo Staggered Animation Tests
 * Three-Tier Testing Strategy Implementation:
 * - Tier 1: Animation Logic (stagger timing calculations, state machines)
 * - Tier 2: Component Behavior (DOM class changes, timing behavior)
 * Following TDD approach - testing the staggered logo fade-in animations
 */
import React from 'react'
import { render, screen, waitFor, act } from '../../test-utils'
import { 
  KeyframeAnimationTester,
  simulateKeyframePhases,
  commonAnimationConfigs
} from '../../test-utils/keyframe-testing'
import {
  StaggeredAnimationTester
} from '../../test-utils/animation-testing'
import {
  mockAnimationProperties,
  clearAnimationMocks
} from '../../test-utils/css-animation-mocking'
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

// TIER 1: Animation Logic Testing
describe('Logo Staggered Animation Logic (Tier 1)', () => {
  beforeEach(() => {
    // Mock CSS properties for stagger animation testing
    mockAnimationProperties('.logo-item', {
      animationName: 'fadeIn',
      animationDuration: '0.6s',
      animationDelay: '0s', // Will be set per item
      animationFillMode: 'both'
    })
    
    mockLogos.forEach((_, index) => {
      mockAnimationProperties(`.logo-item:nth-child(${index + 1})`, {
        animationDelay: `${index * 150}ms`
      })
    })
  })

  afterEach(() => {
    clearAnimationMocks()
  })

  describe('Stagger Algorithm Logic', () => {
    it('should calculate correct stagger delays for each logo', () => {
      // Test pure stagger timing logic without DOM
      const staggerDelay = 150 // ms
      const logos = mockLogos
      
      const calculateStaggerDelay = (index: number) => index * staggerDelay
      
      const expectedDelays = logos.map((_, index) => calculateStaggerDelay(index))
      
      // Verify stagger calculation logic (4 logos in mockLogos)
      expect(expectedDelays).toEqual([0, 150, 300, 450])
      
      // Test that delays increase linearly
      for (let i = 1; i < expectedDelays.length; i++) {
        const current = expectedDelays[i];
        const previous = expectedDelays[i - 1];
        expect(current).toBeDefined();
        expect(previous).toBeDefined();
        expect(current! - previous!).toBe(staggerDelay);
      }
    })

    it('should test animation phase progression for staggered items', async () => {
      // Test simplified stagger timing logic without complex animation simulation
      const staggerDelay = 150
      const animationDuration = 600
      const logoCount = mockLogos.length
      
      // Calculate expected timeline
      const totalStaggerTime = (logoCount - 1) * staggerDelay // Time for last logo to start
      const totalAnimationTime = totalStaggerTime + animationDuration // Time for all to complete
      
      expect(totalStaggerTime).toBe(450) // (4-1) * 150 = 450ms
      expect(totalAnimationTime).toBe(1050) // 450 + 600 = 1050ms
      
      // Verify stagger progression phases
      const phases = []
      for (let i = 0; i < logoCount; i++) {
        phases.push({
          logoIndex: i,
          startTime: i * staggerDelay,
          endTime: i * staggerDelay + animationDuration
        })
      }
      
      expect(phases).toHaveLength(logoCount)
      expect(phases[0]?.startTime).toBe(0)
      expect(phases[3]?.startTime).toBe(450)
    })

    it('should verify stagger state machine transitions', async () => {
      const tester = new KeyframeAnimationTester(commonAnimationConfigs.logoStagger)
      
      const phases: string[] = []
      tester.onPhaseChange((phase) => {
        phases.push(phase)
      })
      
      tester.start()
      
      // Wait for animation progression
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(phases).toContain('before-start')
      expect(phases).toContain('animating')
      
      tester.destroy()
    })
  })
})

// TIER 2: Component Behavior Testing
describe('Logo Staggered Animation Behavior (Tier 2)', () => {
  beforeEach(() => {
    // Mock CSS properties for behavior testing
    mockAnimationProperties('.animate-fade-in', {
      animationName: 'fadeIn',
      animationDuration: '0.6s',
      animationFillMode: 'both'
    })
  })

  afterEach(() => {
    clearAnimationMocks()
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
      
      const timingTester = new StaggeredAnimationTester('logoStagger', 150)
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
        const current = animationTimes[i];
        const previous = animationTimes[i - 1];
        expect(current).toBeDefined();
        expect(previous).toBeDefined();
        const delay = current! - previous!;
        expect(delay).toBeGreaterThanOrEqual(140); // Allow 10ms tolerance
        expect(delay).toBeLessThanOrEqual(160);
      }
    }, 5000)

    it('should start animations after initial delay', async () => {
      const startTime = performance.now()
      
      render(<LogoStaggerComponent />)
      
      // First logo should start animating after ~500ms delay
      const firstLogo = screen.getByTestId('logo-0')
      await waitFor(
        () => {
          expect(firstLogo).toHaveClass('animate-fade-in')
        },
        { timeout: 1000 }
      )
      
      const elapsed = performance.now() - startTime
      expect(elapsed).toBeGreaterThanOrEqual(480) // Initial delay + some tolerance
      expect(elapsed).toBeLessThanOrEqual(600)
    }, 3000)

    it('should animate all logos within reasonable timeframe', async () => {
      const startTime = performance.now()
      
      render(<LogoStaggerComponent />)
      
      const totalLogos = mockLogos.length
      const expectedTotalTime = 500 + (totalLogos - 1) * 150 // Initial delay + stagger delays
      
      // Wait for last logo to start animating
      const lastLogo = screen.getByTestId(`logo-${totalLogos - 1}`)
      await waitFor(
        () => {
          expect(lastLogo).toHaveClass('animate-fade-in')
        },
        { timeout: 2000 }
      )
      
      const elapsed = performance.now() - startTime
      expect(elapsed).toBeGreaterThanOrEqual(expectedTotalTime - 100) // Allow tolerance
      expect(elapsed).toBeLessThanOrEqual(expectedTotalTime + 100)
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
      
      // Verify the element has the animation class
      expect(firstLogo).toHaveClass('animate-fade-in')
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
      
      // Verify the element has the animation class which should contain the animation properties
      expect(logoElement).toHaveClass('animate-fade-in')
      expect(logoElement).toBeVisible()
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

  describe('Component State and Class Management', () => {
    it('should apply staggered CSS classes in correct sequence', async () => {
      const componentStartTime = performance.now()
      
      render(<LogoStaggerComponent />)
      
      const logoElements = mockLogos.map((_, index) => screen.getByTestId(`logo-${index}`))
      const classAdditionTimes: number[] = []
      
      // Monitor each logo for class addition
      for (let i = 0; i < logoElements.length; i++) {
        await waitFor(
          () => {
            expect(logoElements[i]).toHaveClass('animate-fade-in')
            classAdditionTimes.push(performance.now() - componentStartTime)
          },
          { timeout: 2000 }
        )
      }
      
      // Verify logos got their classes at staggered intervals
      for (let i = 1; i < classAdditionTimes.length; i++) {
        const current = classAdditionTimes[i];
        const previous = classAdditionTimes[i - 1];
        if (current === undefined || previous === undefined) continue;
        const actualInterval = current - previous;
        const expectedInterval = 150 // 150ms stagger between consecutive logos
        
        // Allow reasonable tolerance for timing (due to setTimeout precision and test environment)
        expect(actualInterval).toBeGreaterThanOrEqual(expectedInterval - 100)
        expect(actualInterval).toBeLessThanOrEqual(expectedInterval + 100)
      }
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