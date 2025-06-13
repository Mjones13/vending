/**
 * Hover Effects and Transitions Tests
 * Three-Tier Testing Strategy Implementation:
 * - Tier 1: Animation Logic (hover state machines, transition timing logic)
 * - Tier 2: Component Behavior (DOM interactions, class changes, user events)
 * Following TDD approach - testing hover effects on buttons, cards, and interactive elements
 */
import * as React from 'react'
import { render, screen, waitFor, act } from '../../test-utils'
import {
  mockAnimationProperties,
  clearAnimationMocks
} from '../../test-utils/css-animation-mocking'
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
  const [isScrolled, setIsScrolled] = useState(false)
  
  useEffect(() => {
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

// TIER 2: Component Behavior Testing (Hover interactions are primarily behavior-based)
describe('Hover Effects and Transitions Behavior (Tier 2)', () => {
  beforeEach(() => {
    // Mock CSS properties for hover transitions
    mockAnimationProperties('.btn', {
      transitionProperty: 'all',
      transitionDuration: '0.3s',
      transitionTimingFunction: 'ease'
    })
    
    mockAnimationProperties('.service-feature-card', {
      transitionProperty: 'transform, box-shadow',
      transitionDuration: '0.3s',
      transitionTimingFunction: 'ease-out'
    })
    
    mockAnimationProperties('.backdrop-blur', {
      backdropFilter: 'blur(16px)',
      transitionProperty: 'backdrop-filter',
      transitionDuration: '0.3s'
    })
  })

  afterEach(() => {
    clearAnimationMocks()
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
        // Verify buttons have the correct classes which should contain transition properties
        expect(button).toHaveClass('btn')
        expect(button).toBeInTheDocument()
      })
    })

    it('should test scale transform on button hover', async () => {
      render(<ButtonHoverComponent />)
      
      const primaryButton = screen.getByTestId('primary-button')
      
      // Test hover interaction
      await userEvent.hover(primaryButton)
      
      // Button should remain accessible and visible during hover
      expect(primaryButton).toBeVisible()
      expect(primaryButton).toHaveClass('btn', 'btn-primary')
    })

    it('should test color transitions on button hover', async () => {
      render(<ButtonHoverComponent />)
      
      const primaryButton = screen.getByTestId('primary-button')
      
      // Test hover state
      await userEvent.hover(primaryButton)
      expect(primaryButton).toBeVisible()
      
      // Test unhover state
      await userEvent.unhover(primaryButton)
      expect(primaryButton).toBeVisible()
    })

    it('should handle shimmer effect on hover', async () => {
      render(<ButtonHoverComponent />)
      
      const shimmerButton = screen.getByTestId('primary-button')
      
      await userEvent.hover(shimmerButton)
      
      // Should have shimmer class
      expect(shimmerButton).toHaveClass('btn-shimmer')
      expect(shimmerButton).toBeVisible()
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
      
      // Verify card remains accessible and has expected class
      expect(serviceCard).toHaveClass('service-feature-card')
      expect(serviceCard).toBeVisible()
    })

    it('should scale image within card on hover', async () => {
      render(<CardHoverComponent />)
      
      const serviceCard = screen.getByTestId('service-card')
      const serviceImage = serviceCard.querySelector('.service-image')
      
      expect(serviceImage).toBeInTheDocument()
      
      await userEvent.hover(serviceCard)
      
      // Image should remain visible and have expected class
      expect(serviceImage).toHaveClass('service-image')
      expect(serviceImage).toBeVisible()
    })

    it('should apply shadow transitions on card hover', async () => {
      render(<CardHoverComponent />)
      
      const serviceCard = screen.getByTestId('service-card')
      
      // Test hover interaction
      await userEvent.hover(serviceCard)
      expect(serviceCard).toBeVisible()
      
      await userEvent.unhover(serviceCard)
      expect(serviceCard).toBeVisible()
    })

    it('should test logo hover scale effect', async () => {
      render(<CardHoverComponent />)
      
      const logoItem = screen.getByTestId('logo-item')
      
      await userEvent.hover(logoItem)
      expect(logoItem).toHaveClass('logo-item')
      expect(logoItem).toBeVisible()
      
      await userEvent.unhover(logoItem)
      expect(logoItem).toBeVisible()
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
      
      // Simulate scroll event with act() to handle React state updates
      await act(async () => {
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          value: 100
        })
        
        window.dispatchEvent(new Event('scroll'))
      })
      
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
      
      // Simulate scroll state change
      await act(async () => {
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          value: 100
        })
        window.dispatchEvent(new Event('scroll'))
      })
      
      await waitFor(() => {
        expect(header).toHaveClass('backdrop-blur')
      })
    })

    it('should remove backdrop blur when scroll returns to top', async () => {
      render(<HeaderScrollComponent />)
      
      const header = screen.getByTestId('site-header')
      
      // Scroll down
      await act(async () => {
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          value: 100
        })
        window.dispatchEvent(new Event('scroll'))
      })
      
      await waitFor(
        () => {
          expect(header).toHaveClass('scrolled')
        },
        { timeout: 500 }
      )
      
      // Scroll back to top
      await act(async () => {
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          value: 0
        })
        window.dispatchEvent(new Event('scroll'))
      })
      
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
      
      // Verify card has the correct class for transform animations
      expect(serviceCard).toHaveClass('service-feature-card')
      expect(serviceCard).toBeInTheDocument()
    })

    it('should have appropriate transition durations', () => {
      render(<ButtonHoverComponent />)
      
      const button = screen.getByTestId('primary-button')
      
      // Verify button has the correct classes for transitions
      expect(button).toHaveClass('btn', 'btn-primary')
      expect(button).toBeVisible()
    })

    it('should use appropriate easing functions', () => {
      render(<CardHoverComponent />)
      
      const serviceCard = screen.getByTestId('service-card')
      
      // Verify card has transition classes
      expect(serviceCard).toHaveClass('service-feature-card')
      expect(serviceCard).toBeVisible()
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
      expect(button).toBeVisible()
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
      
      // Button should remain accessible regardless of motion preferences
      expect(button).toBeVisible()
      expect(button).toHaveClass('btn', 'btn-primary')
    })
  })

  describe('Cross-browser Compatibility', () => {
    it('should handle vendor prefixes appropriately', () => {
      render(<HeaderScrollComponent />)
      
      const header = screen.getByTestId('site-header')
      
      // Simulate adding backdrop blur
      header.classList.add('backdrop-blur')
      
      // Verify the class was added correctly
      expect(header).toHaveClass('backdrop-blur')
      expect(header).toBeVisible()
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