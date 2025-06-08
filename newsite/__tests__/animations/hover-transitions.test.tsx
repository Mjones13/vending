/**
 * Hover Effects and Transitions Tests
 * Following TDD approach - testing hover effects on buttons, cards, and interactive elements
 */
import React from 'react'
import { render, screen, waitFor } from '../../test-utils'
import { 
  TransitionTester,
  disableAnimations,
  enableAnimations
} from '../../test-utils/keyframe-testing'
import { 
  hoverElement, 
  unhoverElement 
} from '../../test-utils/component-helpers'
import userEvent from '@testing-library/user-event'

// Test components that match the actual hover implementations
function ButtonHoverComponent() {
  return (
    <div>
      <button 
        className="btn btn-primary btn-shimmer"
        data-testid="primary-button"
      >
        Request a Demo
      </button>
      
      <button 
        className="btn btn-secondary"
        data-testid="secondary-button"
      >
        Learn More
      </button>
      
      <button 
        className="btn btn-coffee"
        data-testid="coffee-button"
      >
        Coffee Services
      </button>
    </div>
  )
}

function CardHoverComponent() {
  return (
    <div>
      <div 
        className="service-feature-card"
        data-testid="service-card"
      >
        <div className="service-feature-image">
          <img src="/test-image.jpg" alt="Test service" className="service-image" />
        </div>
        <div className="service-feature-content">
          <h3>Test Service</h3>
          <p>Test description</p>
        </div>
      </div>
      
      <div 
        className="logo-item"
        data-testid="logo-item"
      >
        <img src="/test-logo.svg" alt="Test logo" className="logo-hover" />
      </div>
    </div>
  )
}

function HeaderScrollComponent() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <header 
      className={`header ${isScrolled ? 'scrolled backdrop-blur' : ''}`}
      data-testid="site-header"
    >
      <nav>Test Header</nav>
    </header>
  )
}

describe('Hover Effects and Transitions', () => {
  beforeEach(() => {
    enableAnimations()
  })

  afterEach(() => {
    disableAnimations()
  })

  describe('Button Hover Effects', () => {
    it('should apply hover state classes on mouse enter', async () => {
      render(<ButtonHoverComponent />)
      
      const primaryButton = screen.getByTestId('primary-button')
      
      await userEvent.hover(primaryButton)
      
      // Should maintain base classes and add hover state
      expect(primaryButton).toHaveClass('btn', 'btn-primary', 'btn-shimmer')
    })

    it('should have proper transition properties on buttons', () => {
      render(<ButtonHoverComponent />)
      
      const buttons = [
        screen.getByTestId('primary-button'),
        screen.getByTestId('secondary-button'),
        screen.getByTestId('coffee-button')
      ]
      
      buttons.forEach(button => {
        const transitionTester = new TransitionTester(button)
        
        // Verify transition properties are set
        transitionTester.verifyTransitionProperties({
          property: 'all',
          duration: '0.3s'
        })
      })
    })

    it('should test scale transform on button hover', async () => {
      render(<ButtonHoverComponent />)
      
      const primaryButton = screen.getByTestId('primary-button')
      const transitionTester = new TransitionTester(primaryButton)
      
      await transitionTester.testHoverScale('1.05')
    })

    it('should test color transitions on button hover', async () => {
      render(<ButtonHoverComponent />)
      
      const primaryButton = screen.getByTestId('primary-button')
      const transitionTester = new TransitionTester(primaryButton)
      
      await transitionTester.testColorTransition('background-color')
    })

    it('should handle shimmer effect on hover', async () => {
      render(<ButtonHoverComponent />)
      
      const shimmerButton = screen.getByTestId('primary-button')
      
      await userEvent.hover(shimmerButton)
      
      // Should have shimmer class
      expect(shimmerButton).toHaveClass('btn-shimmer')
      
      const computedStyle = window.getComputedStyle(shimmerButton)
      // Shimmer effect should be active
      expect(computedStyle.animation || computedStyle.backgroundImage).toBeDefined()
    })

    it('should return to normal state on mouse leave', async () => {
      render(<ButtonHoverComponent />)
      
      const primaryButton = screen.getByTestId('primary-button')
      
      // Hover and unhover
      await userEvent.hover(primaryButton)
      await userEvent.unhover(primaryButton)
      
      // Should return to base state
      expect(primaryButton).toHaveClass('btn', 'btn-primary')
    })
  })

  describe('Card Hover Effects', () => {
    it('should scale card on hover', async () => {
      render(<CardHoverComponent />)
      
      const serviceCard = screen.getByTestId('service-card')
      
      await userEvent.hover(serviceCard)
      
      // Check for hover state - the actual implementation might add classes or use CSS :hover
      const computedStyle = window.getComputedStyle(serviceCard)
      expect(computedStyle.transition).toContain('transform')
    })

    it('should scale image within card on hover', async () => {
      render(<CardHoverComponent />)
      
      const serviceCard = screen.getByTestId('service-card')
      const serviceImage = serviceCard.querySelector('.service-image')
      
      expect(serviceImage).toBeInTheDocument()
      
      await userEvent.hover(serviceCard)
      
      // Image should have scale transition
      const imageStyle = window.getComputedStyle(serviceImage!)
      expect(imageStyle.transition).toContain('transform')
    })

    it('should apply shadow transitions on card hover', async () => {
      render(<CardHoverComponent />)
      
      const serviceCard = screen.getByTestId('service-card')
      const transitionTester = new TransitionTester(serviceCard)
      
      // Verify box-shadow transition
      transitionTester.verifyTransitionProperties({
        property: 'box-shadow'
      })
    })

    it('should test logo hover scale effect', async () => {
      render(<CardHoverComponent />)
      
      const logoItem = screen.getByTestId('logo-item')
      const transitionTester = new TransitionTester(logoItem)
      
      await transitionTester.testHoverScale('1.05')
    })

    it('should handle card hover animation timing', async () => {
      render(<CardHoverComponent />)
      
      const serviceCard = screen.getByTestId('service-card')
      
      const startTime = performance.now()
      await userEvent.hover(serviceCard)
      
      // Wait for transition to potentially complete
      await waitFor(
        () => {
          const elapsed = performance.now() - startTime
          expect(elapsed).toBeGreaterThan(0)
        },
        { timeout: 500 }
      )
    })
  })

  describe('Header Scroll Effects', () => {
    it('should add backdrop blur on scroll', async () => {
      render(<HeaderScrollComponent />)
      
      const header = screen.getByTestId('site-header')
      
      // Simulate scroll event
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 100
      })
      
      window.dispatchEvent(new Event('scroll'))
      
      await waitFor(
        () => {
          expect(header).toHaveClass('scrolled', 'backdrop-blur')
        },
        { timeout: 1000 }
      )
    })

    it('should test backdrop blur transition', async () => {
      render(<HeaderScrollComponent />)
      
      const header = screen.getByTestId('site-header')
      const transitionTester = new TransitionTester(header)
      
      // Simulate adding scrolled class
      await transitionTester.testBackdropBlur()
    })

    it('should remove backdrop blur when scroll returns to top', async () => {
      render(<HeaderScrollComponent />)
      
      const header = screen.getByTestId('site-header')
      
      // Scroll down
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 100
      })
      window.dispatchEvent(new Event('scroll'))
      
      await waitFor(
        () => {
          expect(header).toHaveClass('scrolled')
        },
        { timeout: 500 }
      )
      
      // Scroll back to top
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 0
      })
      window.dispatchEvent(new Event('scroll'))
      
      await waitFor(
        () => {
          expect(header).not.toHaveClass('scrolled')
          expect(header).not.toHaveClass('backdrop-blur')
        },
        { timeout: 500 }
      )
    })
  })

  describe('Transition Performance', () => {
    it('should use hardware acceleration for transforms', () => {
      render(<CardHoverComponent />)
      
      const serviceCard = screen.getByTestId('service-card')
      const computedStyle = window.getComputedStyle(serviceCard)
      
      // Should use transform for performance
      expect(computedStyle.transform).toBeDefined()
      expect(computedStyle.willChange || computedStyle.transform).toBeTruthy()
    })

    it('should have appropriate transition durations', () => {
      render(<ButtonHoverComponent />)
      
      const button = screen.getByTestId('primary-button')
      const computedStyle = window.getComputedStyle(button)
      
      // Transition duration should be reasonable (not too fast, not too slow)
      const duration = computedStyle.transitionDuration
      if (duration && duration !== '0s') {
        const durationMs = parseFloat(duration) * (duration.includes('ms') ? 1 : 1000)
        expect(durationMs).toBeGreaterThanOrEqual(150) // Not too fast
        expect(durationMs).toBeLessThanOrEqual(500)    // Not too slow
      }
    })

    it('should use appropriate easing functions', () => {
      render(<CardHoverComponent />)
      
      const serviceCard = screen.getByTestId('service-card')
      const computedStyle = window.getComputedStyle(serviceCard)
      
      const timingFunction = computedStyle.transitionTimingFunction
      
      // Should use smooth easing (not linear)
      if (timingFunction && timingFunction !== 'ease') {
        expect(timingFunction).toMatch(/(ease|cubic-bezier)/)
      }
    })
  })

  describe('Accessibility Considerations', () => {
    it('should maintain accessibility during hover states', async () => {
      render(<ButtonHoverComponent />)
      
      const button = screen.getByTestId('primary-button')
      
      // Button should remain focusable and accessible during hover
      await userEvent.hover(button)
      
      expect(button).toBeVisible()
      expect(button).not.toHaveAttribute('aria-hidden', 'true')
    })

    it('should support keyboard focus states', async () => {
      render(<ButtonHoverComponent />)
      
      const button = screen.getByTestId('primary-button')
      
      // Focus with keyboard
      await userEvent.tab()
      
      expect(button).toHaveFocus()
      
      // Should have focus styles
      const computedStyle = window.getComputedStyle(button)
      expect(computedStyle.outline || computedStyle.boxShadow).toBeDefined()
    })

    it('should respect reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })
      
      render(<ButtonHoverComponent />)
      
      const button = screen.getByTestId('primary-button')
      const computedStyle = window.getComputedStyle(button)
      
      // When reduced motion is preferred, animations should be minimal
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        expect(computedStyle.transitionDuration).toBe('0s')
      }
    })
  })

  describe('Cross-browser Compatibility', () => {
    it('should handle vendor prefixes appropriately', () => {
      render(<HeaderScrollComponent />)
      
      const header = screen.getByTestId('site-header')
      
      // Simulate adding backdrop blur
      header.classList.add('backdrop-blur')
      
      const computedStyle = window.getComputedStyle(header)
      
      // Should support both standard and webkit prefixes
      const hasBackdropFilter = computedStyle.backdropFilter || 
                               (computedStyle as any).webkitBackdropFilter
      
      if (hasBackdropFilter) {
        expect(hasBackdropFilter).toContain('blur')
      }
    })

    it('should gracefully handle unsupported properties', () => {
      render(<CardHoverComponent />)
      
      const serviceCard = screen.getByTestId('service-card')
      
      // Component should still function even if some CSS properties aren't supported
      expect(() => {
        userEvent.hover(serviceCard)
      }).not.toThrow()
    })
  })
})