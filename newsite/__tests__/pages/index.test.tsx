/**
 * Home Page / Hero Section Tests
 * Following TDD approach - these tests define expected behavior for rotating text animation
 */
import { render, screen, waitFor } from '../../test-utils'
import { RotatingTextTester, createAnimationTestSuite } from '../../test-utils/animation-testing'
import { mockRotatingWords } from '../../test-utils/mock-data'
import Home from '../../pages/index'
import { setupRealTimers, cleanupTimers } from '../../test-utils/timer-helpers'

describe('Home Page', () => {
  beforeEach(() => {
    // Use real timers for rotating text animations
    setupRealTimers()
  })

  afterEach(async () => {
    await cleanupTimers()
  })

  describe('Basic Rendering', () => {
    it('should render the hero section', () => {
      render(<Home />)
      
      expect(screen.getByText(/premium amenity for modern/i)).toBeInTheDocument()
      expect(screen.getByText(/california's #1 choice/i)).toBeInTheDocument()
    })

    it('should render hero description', () => {
      render(<Home />)
      
      expect(screen.getByText(/transform your workplace with comprehensive vending/i)).toBeInTheDocument()
    })

    it('should render call-to-action button', () => {
      render(<Home />)
      
      expect(screen.getByRole('button', { name: /request a demo/i })).toBeInTheDocument()
    })

    it('should render hero stats', () => {
      render(<Home />)
      
      expect(screen.getByText('200+')).toBeInTheDocument()
      expect(screen.getByText('Locations Served')).toBeInTheDocument()
      expect(screen.getByText('50,000+')).toBeInTheDocument()
      expect(screen.getByText('Happy Employees')).toBeInTheDocument()
      expect(screen.getByText('15+')).toBeInTheDocument()
      expect(screen.getByText('Years Experience')).toBeInTheDocument()
    })
  })

  describe('Rotating Text Animation', () => {
    it('should display initial rotating word', () => {
      render(<Home />)
      
      // Should start with first word
      expect(screen.getByText(mockRotatingWords[0])).toBeInTheDocument()
    })

    it('should have rotating text container with proper styling', () => {
      render(<Home />)
      
      const rotatingContainer = screen.getByText(mockRotatingWords[0]).parentElement
      expect(rotatingContainer).toHaveClass('rotating-text-container')
    })

    it('should cycle through all rotating words', async () => {
      render(<Home />)
      
      const rotatingElement = screen.getByText(mockRotatingWords[0])
      const tester = new RotatingTextTester(rotatingElement, mockRotatingWords)
      
      // Wait for complete rotation cycle
      await tester.waitForCompleteCycle()
    }, 30000) // Extended timeout for full cycle

    it('should display each word in the rotation sequence', async () => {
      render(<Home />)
      
      // Check that each word appears during rotation
      for (const word of mockRotatingWords) {
        await waitFor(
          () => {
            expect(screen.getByText(word)).toBeInTheDocument()
          },
          { timeout: 10000 }
        )
      }
    }, 40000)

    it('should apply correct animation state classes', async () => {
      render(<Home />)
      
      const rotatingElement = screen.getByText(mockRotatingWords[0])
      const tester = new RotatingTextTester(rotatingElement, mockRotatingWords)
      
      // Verify animation state transitions
      await tester.verifyAnimationStates(
        'rotating-text-exiting',
        'rotating-text-entering', 
        'rotating-text-visible'
      )
    }, 15000)

    it('should maintain text alignment with static text', () => {
      render(<Home />)
      
      const staticText = screen.getByText(/premium amenity for modern/i)
      const rotatingText = screen.getByText(mockRotatingWords[0])
      
      // Both should be in the same line/container
      expect(staticText).toBeInTheDocument()
      expect(rotatingText).toBeInTheDocument()
      
      // Container should have proper positioning
      const container = rotatingText.parentElement
      expect(container).toHaveStyle({ 
        display: 'inline-block',
        position: 'relative'
      })
    })

    it('should have proper container dimensions to prevent cutoff', () => {
      render(<Home />)
      
      const rotatingText = screen.getByText(mockRotatingWords[0])
      const container = rotatingText.parentElement
      
      // Should have minimum width to accommodate longest word
      const computedStyle = window.getComputedStyle(container!)
      const minWidth = parseInt(computedStyle.minWidth)
      expect(minWidth).toBeGreaterThanOrEqual(280) // Based on our CSS fix
    })
  })

  describe('Hero Image', () => {
    it('should render hero image with proper alt text', () => {
      render(<Home />)
      
      const heroImage = screen.getByAltText(/modern office breakroom/i)
      expect(heroImage).toBeInTheDocument()
      expect(heroImage).toHaveAttribute('src', '/images/hero-backgrounds/home/office-breakroom-hero.jpg')
    })
  })

  describe('Hero Actions', () => {
    it('should navigate to request demo page when button clicked', async () => {
      const { mockRouter } = render(<Home />)
      
      const demoButton = screen.getByRole('button', { name: /request a demo/i })
      await demoButton.click()
      
      expect(mockRouter.push).toHaveBeenCalledWith('/request-a-demo')
    })

    it('should have contact phone number link', () => {
      render(<Home />)
      
      const phoneLink = screen.getByRole('link', { name: /909.258.9848/i })
      expect(phoneLink).toBeInTheDocument()
      expect(phoneLink).toHaveAttribute('href', 'tel:909.258.9848')
    })
  })

  describe('Services Showcase', () => {
    it('should render service cards', () => {
      render(<Home />)
      
      expect(screen.getByText('Custom Micro-Markets')).toBeInTheDocument()
      expect(screen.getByText('Premium Coffee Services')).toBeInTheDocument()
      expect(screen.getByText('Smart Vending Machines')).toBeInTheDocument()
    })

    it('should have service navigation buttons', () => {
      render(<Home />)
      
      const learnMoreButtons = screen.getAllByText('Learn More')
      expect(learnMoreButtons).toHaveLength(3)
    })
  })

  describe('Company Logos Animation', () => {
    it('should render company logos', () => {
      render(<Home />)
      
      expect(screen.getByAltText('Disney')).toBeInTheDocument()
      expect(screen.getByAltText('Sheraton')).toBeInTheDocument()
      expect(screen.getByAltText('Marriott')).toBeInTheDocument()
      expect(screen.getByAltText('Toyota')).toBeInTheDocument()
    })

    it('should trigger staggered logo animations', async () => {
      const { container } = render(<Home />)
      
      // Create animation test suite for the container
      const animationSuite = createAnimationTestSuite(container)
      const logoTester = animationSuite.staggered('.logo-item', 150)
      
      // Should have correct number of logo elements
      expect(logoTester.getElementCount()).toBe(9)
      
      // Wait for animations to trigger (after component mount)
      await waitFor(
        () => {
          const firstLogo = container.querySelector('.logo-item')
          expect(firstLogo).toHaveClass('animate-fade-in')
        },
        { timeout: 1000 }
      )
    })
  })

  describe('Responsive Design', () => {
    it('should adapt hero layout for mobile', () => {
      // This would test responsive CSS classes and layout changes
      render(<Home />)
      
      const heroSection = screen.getByText(/premium amenity for modern/i).closest('section')
      expect(heroSection).toHaveClass('hero-split')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Home />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent(/premium amenity for modern/i)
    })

    it('should have proper image alt texts', () => {
      render(<Home />)
      
      expect(screen.getByAltText(/modern office breakroom/i)).toBeInTheDocument()
      expect(screen.getByAltText('Disney')).toBeInTheDocument()
    })

    it('should have accessible buttons and links', () => {
      render(<Home />)
      
      const demoButton = screen.getByRole('button', { name: /request a demo/i })
      expect(demoButton).toBeInTheDocument()
      
      const phoneLink = screen.getByRole('link', { name: /909.258.9848/i })
      expect(phoneLink).toBeInTheDocument()
    })
  })
})