/**
 * Layout Component Tests
 * Following TDD approach - these tests define expected behavior for the Layout component
 */
import { render, screen, simulateScreenSize, SCREEN_SIZES, expectNavigation, hoverElement, unhoverElement, clickElement } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import Layout from '../../components/Layout'

// Mock child component for testing
const MockChild = () => <div data-testid="child-content">Test Content</div>

describe('Layout Component', () => {
  describe('Basic Rendering', () => {
    it('should render children content correctly', () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render header with logo', () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      const logo = screen.getByAltText(/golden coast amenities/i)
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', '/images/logos/Golden Coast Amenities (3).svg')
    })

    it('should render navigation menu', () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      // Check that navigation exists
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      
      // Main navigation items should be visible - using more flexible text matching
      expect(screen.getByText(/vending/i)).toBeInTheDocument()
      expect(screen.getByText(/services/i)).toBeInTheDocument() 
      expect(screen.getByText(/markets/i)).toBeInTheDocument()
      expect(screen.getByText(/about/i)).toBeInTheDocument()
      expect(screen.getAllByText(/contact/i)).toHaveLength(2) // Appears in nav and footer
    })

    it('should render footer', () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      // Footer should contain company information
      expect(screen.getByText(/golden coast amenities/i)).toBeInTheDocument()
    })
  })

  describe('Navigation Functionality', () => {
    it('should navigate to correct pages when nav links are clicked', async () => {
      const { mockRouter } = render(
        <Layout>
          <MockChild />
        </Layout>
      )

      // Test vending machines navigation
      await userEvent.click(screen.getByRole('link', { name: /vending machines/i }))
      expectNavigation(mockRouter, '/vending-machines')

      // Test coffee services navigation
      await userEvent.click(screen.getByRole('link', { name: /coffee services/i }))
      expectNavigation(mockRouter, '/coffee-services')

      // Test mini markets navigation
      await userEvent.click(screen.getByRole('link', { name: /mini markets/i }))
      expectNavigation(mockRouter, '/mini-markets')
    })

    it('should navigate to homepage when logo is clicked', async () => {
      const { mockRouter } = render(
        <Layout>
          <MockChild />
        </Layout>
      )

      const logoLink = screen.getByRole('link', { name: /home/i })
      await userEvent.click(logoLink)
      
      expectNavigation(mockRouter, '/')
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
      
      // Mobile menu button should be visible
      const mobileMenuButton = screen.getByRole('button', { name: /menu/i })
      expect(mobileMenuButton).toBeVisible()
    })

    it('should hide desktop navigation on mobile screens', () => {
      simulateScreenSize(SCREEN_SIZES.mobile.width, SCREEN_SIZES.mobile.height)
      
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      // Desktop navigation should be hidden
      const desktopNav = screen.getByTestId('desktop-navigation')
      expect(desktopNav).not.toBeVisible()
    })

    it('should show desktop navigation on large screens', () => {
      simulateScreenSize(SCREEN_SIZES.desktop.width, SCREEN_SIZES.desktop.height)
      
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      // Desktop navigation should be visible
      const desktopNav = screen.getByTestId('desktop-navigation')
      expect(desktopNav).toBeVisible()
      
      // Mobile menu button should be hidden
      expect(screen.queryByRole('button', { name: /menu/i })).not.toBeVisible()
    })

    it('should toggle mobile menu when button is clicked', async () => {
      simulateScreenSize(SCREEN_SIZES.mobile.width, SCREEN_SIZES.mobile.height)
      
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      const mobileMenuButton = screen.getByRole('button', { name: /menu/i })
      const mobileMenu = screen.getByTestId('mobile-menu')
      
      // Menu should be closed initially
      expect(mobileMenu).not.toBeVisible()
      
      // Click to open menu
      await userEvent.click(mobileMenuButton)
      expect(mobileMenu).toBeVisible()
      
      // Click to close menu
      await userEvent.click(mobileMenuButton)
      expect(mobileMenu).not.toBeVisible()
    })
  })

  describe('Header Scroll Effects', () => {
    it('should add backdrop blur class when scrolled', () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      const header = screen.getByRole('banner')
      
      // Simulate scroll event
      window.scrollY = 100
      window.dispatchEvent(new Event('scroll'))
      
      expect(header).toHaveClass('backdrop-blur')
    })

    it('should maintain fixed positioning on scroll', () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      const header = screen.getByRole('banner')
      expect(header).toHaveStyle({ position: 'fixed' })
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
      expect(logo).toHaveStyle({ 'max-height': '13px' })
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
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
      
      // Navigation should be properly labeled
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      const firstNavLink = screen.getByRole('link', { name: /vending machines/i })
      
      // Tab to first navigation link
      await userEvent.tab()
      expect(firstNavLink).toHaveFocus()
    })

    it('should have proper ARIA labels for mobile menu', () => {
      simulateScreenSize(SCREEN_SIZES.mobile.width, SCREEN_SIZES.mobile.height)
      
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      const mobileMenuButton = screen.getByRole('button', { name: /menu/i })
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Dropdown Menu Functionality', () => {
    it('should show dropdown on hover for coffee services', async () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      const coffeeLink = screen.getByRole('link', { name: /coffee services/i })
      
      await userEvent.hover(coffeeLink)
      
      // Dropdown items should appear
      expect(screen.getByRole('link', { name: /ground & whole bean/i })).toBeVisible()
      expect(screen.getByRole('link', { name: /airpot portion packets/i })).toBeVisible()
      expect(screen.getByRole('link', { name: /accessories/i })).toBeVisible()
    })

    it('should hide dropdown when mouse leaves', async () => {
      render(
        <Layout>
          <MockChild />
        </Layout>
      )
      
      const coffeeLink = screen.getByRole('link', { name: /coffee services/i })
      
      await userEvent.hover(coffeeLink)
      await userEvent.unhover(coffeeLink)
      
      // Dropdown items should be hidden
      expect(screen.queryByRole('link', { name: /ground & whole bean/i })).not.toBeVisible()
    })
  })
})