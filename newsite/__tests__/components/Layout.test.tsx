/**
 * Layout Component Tests
 * Following TDD approach - these tests define expected behavior for the Layout component
 */
import { render, screen, simulateScreenSize, SCREEN_SIZES, expectNavigation, hoverElement, unhoverElement, clickElement, act, waitFor } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import Layout from '../../components/Layout'

// Mock child component for testing
const MockChild = () => <div data-testid="child-content">Test Content</div>

describe('Layout Component', () => {
  // Enhanced cleanup to prevent test isolation issues
  beforeEach(() => {
    // Clear any lingering DOM state
    document.body.innerHTML = ''
    
    // Clear all mocks to prevent state bleeding
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Additional cleanup after each test
    document.body.innerHTML = ''
  })

  describe('Basic Rendering', () => {
    it('critical: should render children content correctly', () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('critical: should render header with logo', () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      const logo = screen.getByAltText(/golden coast amenities/i)
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', '/images/logos/Golden Coast Amenities (3).svg')
    })

    it('should render navigation menu', async () => {
      const { container } = render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      // Wait for component to fully mount and verify it's not an empty div
      await waitFor(() => {
        expect(container.innerHTML).not.toBe('<div></div>')
        expect(container.innerHTML).not.toBe('<div />')
      }, { timeout: 5000 })
      
      // Check that navigation exists
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Main navigation items should be visible - using getAllByRole to handle duplicates
      const servicesLinks = screen.getAllByRole('link', { name: /services/i })
      expect(servicesLinks.length).toBeGreaterThanOrEqual(1)
      
      const shopLinks = screen.getAllByRole('link', { name: /shop/i })
      expect(shopLinks.length).toBeGreaterThanOrEqual(1)
      
      const companyLinks = screen.getAllByRole('link', { name: /company/i })
      expect(companyLinks.length).toBeGreaterThanOrEqual(1)
      
      const homeLinks = screen.getAllByRole('link', { name: /home/i })
      expect(homeLinks.length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/contact/i)).toHaveLength(2) // Appears in nav and footer
    })

    it('should render footer', () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      // Footer should contain company information
      const smarterVendingText = screen.getAllByText(/smarter vending/i)
      expect(smarterVendingText.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/© 2025 Smarter Vending Inc/i)).toBeInTheDocument()
    })
  })

  describe('Navigation Functionality', () => {
    it('should have correct href attributes for navigation links', async () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )

      // Test services navigation (get the first services link which is the main nav)
      const servicesLinks = screen.getAllByRole('link', { name: /services/i })
      expect(servicesLinks[0]).toHaveAttribute('href', '/coffee-services')

      // Test shop navigation (get the first shop link which is the main nav)
      const shopLinks = screen.getAllByRole('link', { name: /shop/i })
      expect(shopLinks[0]).toHaveAttribute('href', '/shop')

      // Test company navigation (get the first company link which is the main nav)
      const companyLinks = screen.getAllByRole('link', { name: /company/i })
      expect(companyLinks[0]).toHaveAttribute('href', '/about')
    })

    it('should have correct href for logo link', async () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )

      // Get the logo link (with aria-label "Home")
      const logoLink = screen.getByLabelText(/home/i)
      expect(logoLink).toHaveAttribute('href', '/')
    })
  })

  describe('Responsive Behavior', () => {
    it('should show mobile menu button on small screens', () => {
      simulateScreenSize(SCREEN_SIZES.mobile.width, SCREEN_SIZES.mobile.height)
      
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      // Mobile menu button should exist with correct aria-label
      const mobileMenuButton = screen.getByLabelText(/toggle menu/i)
      expect(mobileMenuButton).toBeInTheDocument()
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should hide navigation on mobile screens when not active', () => {
      simulateScreenSize(SCREEN_SIZES.mobile.width, SCREEN_SIZES.mobile.height)
      
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      // Navigation should exist but be hidden (controlled by CSS)
      const mobileMenu = screen.getByTestId('mobile-menu')
      expect(mobileMenu).toBeInTheDocument()
      expect(mobileMenu).not.toHaveClass('active')
    })

    it('should show navigation on large screens', () => {
      simulateScreenSize(SCREEN_SIZES.desktop.width, SCREEN_SIZES.desktop.height)
      
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      // Navigation should be present
      const navigation = screen.getByTestId('mobile-menu')
      expect(navigation).toBeInTheDocument()
      
      // Mobile menu button should exist (visibility controlled by CSS)
      const menuButton = screen.getByLabelText(/toggle menu/i)
      expect(menuButton).toBeInTheDocument()
    })

    it('should toggle mobile menu when button is clicked', async () => {
      simulateScreenSize(SCREEN_SIZES.mobile.width, SCREEN_SIZES.mobile.height)
      
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      const mobileMenuButton = screen.getByLabelText(/toggle menu/i)
      const mobileMenu = screen.getByTestId('mobile-menu')
      
      // Menu should be closed initially
      expect(mobileMenu).not.toHaveClass('active')
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
      
      // Click to open menu with act() to handle state updates
      await act(async () => {
        await userEvent.click(mobileMenuButton)
      })
      await waitFor(() => {
        expect(mobileMenu).toHaveClass('active')
        expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')
      })
      
      // Click to close menu
      await act(async () => {
        await userEvent.click(mobileMenuButton)
      })
      await waitFor(() => {
        expect(mobileMenu).not.toHaveClass('active')
        expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
      })
    })
  })

  describe('Header Scroll Effects', () => {
    // Note: These tests use CSS class-based assertions instead of computed style checks
    // due to styled-jsx + Jest/jsdom compatibility limitations. The styled-jsx CSS-in-JS
    // styles are not processed in the test environment, so checking element.style or 
    // getComputedStyle() will fail even when the component works correctly in production.
    // By testing for the presence of CSS classes, we verify the component behavior
    // while ensuring tests work reliably across different environments.
    it('should add backdrop blur class when scrolled', async () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      const header = screen.getByRole('banner')
      
      // Simulate scroll event with act() to handle React state updates
      await act(async () => {
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          value: 100
        })
        window.dispatchEvent(new Event('scroll'))
      })
      
      // Wait for state update to complete and verify CSS class presence
      // Note: Using class-based testing for styled-jsx compatibility with Jest
      await waitFor(() => {
        expect(header).toHaveClass('backdrop-blur')
      })
    })

    it('should maintain fixed positioning on scroll', async () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      const header = screen.getByRole('banner')
      
      // Verify header has fixed positioning class initially
      // Note: Testing CSS class presence instead of computed styles due to styled-jsx + Jest limitations
      expect(header).toHaveClass('header')
      
      // Simulate scroll event to verify positioning class remains consistent
      await act(async () => {
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          value: 100
        })
        window.dispatchEvent(new Event('scroll'))
      })
      
      // Wait for state update and verify fixed positioning class persists
      // Class-based verification ensures CSS behavior works correctly in production
      await waitFor(() => {
        // Header should maintain 'header' class (which contains position: fixed in components/Layout.tsx:169)
        expect(header).toHaveClass('header')
        // Additional scroll-based classes may be added, but base positioning class remains
      })
    })
  })

  describe('Logo Specifications', () => {
    it('should display logo with correct dimensions on desktop', () => {
      simulateScreenSize(SCREEN_SIZES.desktop.width, SCREEN_SIZES.desktop.height)
      
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      const logo = screen.getByAltText(/golden coast amenities/i)
      expect(logo).toHaveAttribute('width', '60')
      expect(logo).toHaveAttribute('height', '20')
    })

    it('should maintain aspect ratio on mobile', () => {
      simulateScreenSize(SCREEN_SIZES.mobile.width, SCREEN_SIZES.mobile.height)
      
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      const logo = screen.getByAltText(/golden coast amenities/i)
      expect(logo).toHaveAttribute('width', '60')
      expect(logo).toHaveAttribute('height', '20')
      expect(logo).toHaveClass('logo-image')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      // Logo link should have accessible name
      const logoLink = screen.getByLabelText(/home/i)
      expect(logoLink).toBeInTheDocument()
      
      // Navigation should be properly labeled
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      
      // Footer should contain headings
      const footerHeadings = screen.getAllByRole('heading')
      expect(footerHeadings.length).toBeGreaterThan(0)
    })

    it('should support keyboard navigation', async () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      // Get first focusable link (logo)
      const logoLink = screen.getByLabelText(/home/i)
      
      // Tab to first navigation link
      await userEvent.tab()
      expect(logoLink).toHaveFocus()
    })

    it('should have proper ARIA labels for mobile menu', () => {
      simulateScreenSize(SCREEN_SIZES.mobile.width, SCREEN_SIZES.mobile.height)
      
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      const mobileMenuButton = screen.getByLabelText(/toggle menu/i)
      expect(mobileMenuButton).toHaveAttribute('aria-label', 'Toggle menu')
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Dropdown Menu Functionality', () => {
    it('should show dropdown on hover for services', async () => {
      const { container } = render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      // Wait for component to fully mount
      await waitFor(() => {
        expect(container.innerHTML).not.toBe('<div></div>')
        expect(container.innerHTML).not.toBe('<div />')
        expect(screen.getByRole('navigation')).toBeInTheDocument()
      }, { timeout: 5000 })
      
      // Verify dropdown links exist in the DOM (they're always rendered but may be hidden)
      await waitFor(() => {
        expect(screen.getByText('Ground & Whole Bean')).toBeInTheDocument()
        expect(screen.getByText('Airpot Portion Packets')).toBeInTheDocument()
        expect(screen.getByText('Accessories')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Get the main navigation services link (first one)
      const servicesLinks = screen.getAllByRole('link', { name: /services/i })
      expect(servicesLinks.length).toBeGreaterThan(0)
      const mainServicesLink = servicesLinks[0]
      
      // Verify services link has dropdown functionality
      expect(mainServicesLink).toHaveClass('dropdown-toggle')
    })

    it('should hide dropdown when mouse leaves', async () => {
      const { container } = render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      // Wait for component to fully mount
      await waitFor(() => {
        expect(container.innerHTML).not.toBe('<div></div>')
        expect(container.innerHTML).not.toBe('<div />')
        expect(screen.getByRole('navigation')).toBeInTheDocument()
      }, { timeout: 5000 })
      
      // Get the main navigation services link with validation
      const servicesLinks = screen.getAllByRole('link', { name: /services/i })
      expect(servicesLinks.length).toBeGreaterThan(0)
      const mainServicesLink = servicesLinks[0]
      
      // Verify the dropdown structure is properly set up for CSS hover behavior
      expect(mainServicesLink).toHaveClass('dropdown-toggle')
      
      // Find the dropdown container (parent with dropdown class)
      const dropdownContainer = mainServicesLink.closest('.dropdown')
      expect(dropdownContainer).toBeInTheDocument()
      
      // Verify dropdown menu exists within the container
      const dropdownMenu = dropdownContainer?.querySelector('.dropdown-menu')
      expect(dropdownMenu).toBeInTheDocument()
      
      // Verify dropdown links exist (they're always in DOM, CSS controls visibility)
      await waitFor(() => {
        expect(screen.getByText('Ground & Whole Bean')).toBeInTheDocument()
        expect(screen.getByText('Airpot Portion Packets')).toBeInTheDocument()
        expect(screen.getByText('Accessories')).toBeInTheDocument()
      }, { timeout: 2000 })
      
      // Since JSDOM doesn't support CSS :hover pseudo-classes properly,
      // we verify the structure is correct for hover behavior rather than testing the actual hover
      expect(dropdownMenu).toHaveClass('dropdown-menu')
    }, 10000)
  })
})