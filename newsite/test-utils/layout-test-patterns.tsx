/**
 * Layout Component Testing Patterns
 * Reusable test utilities for consistent Layout component testing
 */

import React from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, verifyComponentMounted, verifyLayoutMounted } from './render'
import Layout from '../components/Layout'

// Mock child component for testing
export const MockChild = () => <div data-testid="child-content">Test Content</div>

/**
 * Standard Layout render with enhanced verification
 */
export async function renderLayoutWithVerification(options?: {
  timeout?: number
  verifyNavigation?: boolean
}) {
  const { timeout = 5000, verifyNavigation = true } = options || {}
  
  const result = render(
    <Layout>
      <MockChild />
    </Layout>
  )
  
  // Verify component mounted correctly
  await verifyComponentMounted(result.container, timeout)
  
  // Optionally verify navigation elements
  if (verifyNavigation) {
    await verifyLayoutMounted(timeout)
  }
  
  return result
}

/**
 * Verify navigation menu structure and links
 */
export async function verifyNavigationMenu(options?: { timeout?: number }) {
  const { timeout = 3000 } = options || {}
  
  await waitFor(() => {
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  }, { timeout })
  
  // Check main navigation links exist
  const servicesLinks = screen.getAllByRole('link', { name: /services/i })
  expect(servicesLinks.length).toBeGreaterThanOrEqual(1)
  
  const shopLinks = screen.getAllByRole('link', { name: /shop/i })
  expect(shopLinks.length).toBeGreaterThanOrEqual(1)
  
  const companyLinks = screen.getAllByRole('link', { name: /company/i })
  expect(companyLinks.length).toBeGreaterThanOrEqual(1)
  
  const homeLinks = screen.getAllByRole('link', { name: /home/i })
  expect(homeLinks.length).toBeGreaterThanOrEqual(1)
  
  // Contact appears in both nav and footer
  expect(screen.getAllByText(/contact/i)).toHaveLength(2)
  
  return {
    servicesLinks,
    shopLinks,
    companyLinks,
    homeLinks
  }
}

/**
 * Verify dropdown menu structure for services
 */
export async function verifyServicesDropdown(options?: { timeout?: number }) {
  const { timeout = 3000 } = options || {}
  
  // Wait for dropdown content to be available
  await waitFor(() => {
    expect(screen.getByText('Ground & Whole Bean')).toBeInTheDocument()
    expect(screen.getByText('Airpot Portion Packets')).toBeInTheDocument()
    expect(screen.getByText('Accessories')).toBeInTheDocument()
  }, { timeout })
  
  // Get the main services link and verify it has dropdown functionality
  const servicesLinks = screen.getAllByRole('link', { name: /services/i })
  expect(servicesLinks.length).toBeGreaterThan(0)
  const mainServicesLink = servicesLinks[0]
  
  // Verify dropdown structure
  expect(mainServicesLink).toHaveClass('dropdown-toggle')
  
  const dropdownContainer = mainServicesLink?.closest('.dropdown')
  expect(dropdownContainer).toBeInTheDocument()
  
  const dropdownMenu = dropdownContainer?.querySelector('.dropdown-menu')
  expect(dropdownMenu).toBeInTheDocument()
  expect(dropdownMenu).toHaveClass('dropdown-menu')
  
  return {
    mainServicesLink,
    dropdownContainer,
    dropdownMenu
  }
}

/**
 * Verify logo and branding elements
 */
export async function verifyLogoAndBranding() {
  const logo = screen.getByAltText(/golden coast amenities/i)
  expect(logo).toBeInTheDocument()
  expect(logo).toHaveAttribute('src', '/images/logos/Golden Coast Amenities (3).svg')
  
  const logoLink = screen.getByLabelText(/home/i)
  expect(logoLink).toHaveAttribute('href', '/')
  
  return { logo, logoLink }
}

/**
 * Verify footer content and structure
 */
export async function verifyFooter() {
  // Footer should contain company information
  const smarterVendingText = screen.getAllByText(/smarter vending/i)
  expect(smarterVendingText.length).toBeGreaterThanOrEqual(1)
  expect(screen.getByText(/© 2025 Smarter Vending Inc/i)).toBeInTheDocument()
  
  // Footer should contain headings
  const footerHeadings = screen.getAllByRole('heading')
  expect(footerHeadings.length).toBeGreaterThan(0)
}

/**
 * Test mobile menu functionality with enhanced error handling
 */
export async function testMobileMenuToggle(options?: { timeout?: number }) {
  const { timeout = 5000 } = options || {}
  
  // Find mobile menu elements
  const mobileMenuButton = screen.getByLabelText(/toggle menu/i)
  const mobileMenu = screen.getByTestId('mobile-menu')
  
  // Verify initial state
  expect(mobileMenu).not.toHaveClass('active')
  expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
  
  // Test opening menu
  await userEvent.click(mobileMenuButton)
  await waitFor(() => {
    expect(mobileMenu).toHaveClass('active')
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')
  }, { timeout })
  
  // Test closing menu
  await userEvent.click(mobileMenuButton)
  await waitFor(() => {
    expect(mobileMenu).not.toHaveClass('active')
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
  }, { timeout })
  
  return { mobileMenuButton, mobileMenu }
}

/**
 * Test scroll effects with enhanced state management
 */
export async function testHeaderScrollEffects(options?: { timeout?: number }) {
  const { timeout = 3000 } = options || {}
  
  const header = screen.getByRole('banner')
  
  // Test scroll effect
  Object.defineProperty(window, 'scrollY', {
    writable: true,
    value: 100
  })
  window.dispatchEvent(new Event('scroll'))
  
  await waitFor(() => {
    expect(header).toHaveClass('backdrop-blur')
  }, { timeout })
  
  // Verify fixed positioning
  expect(header).toHaveStyle({ position: 'fixed' })
  
  return { header }
}

/**
 * Verify navigation link href attributes
 */
export async function verifyNavigationHrefs() {
  // Services navigation
  const servicesLinks = screen.getAllByRole('link', { name: /services/i })
  expect(servicesLinks[0]).toHaveAttribute('href', '/coffee-services')
  
  // Shop navigation
  const shopLinks = screen.getAllByRole('link', { name: /shop/i })
  expect(shopLinks[0]).toHaveAttribute('href', '/shop')
  
  // Company navigation
  const companyLinks = screen.getAllByRole('link', { name: /company/i })
  expect(companyLinks[0]).toHaveAttribute('href', '/about')
}

/**
 * Test accessibility features
 */
export async function verifyAccessibilityFeatures() {
  // Logo link should have accessible name
  const logoLink = screen.getByLabelText(/home/i)
  expect(logoLink).toBeInTheDocument()
  
  // Navigation should be properly labeled
  expect(screen.getByRole('navigation')).toBeInTheDocument()
  
  // Mobile menu button should have proper ARIA attributes
  const mobileMenuButton = screen.getByLabelText(/toggle menu/i)
  expect(mobileMenuButton).toHaveAttribute('aria-label', 'Toggle menu')
  expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
  
  return { logoLink, mobileMenuButton }
}

/**
 * Test keyboard navigation
 */
export async function testKeyboardNavigation() {
  // Get first focusable link (logo)
  const logoLink = screen.getByLabelText(/home/i)
  
  // Tab to first navigation link
  await userEvent.tab()
  expect(logoLink).toHaveFocus()
  
  return { logoLink }
}

/**
 * Complete Layout component test pattern
 * Combines all verification steps for comprehensive testing
 */
export async function runCompleteLayoutTest(options?: {
  timeout?: number
  skipMobile?: boolean
  skipScroll?: boolean
}) {
  const { timeout = 5000, skipMobile = false, skipScroll = false } = options || {}
  
  // Render and verify component mounted
  const renderResult = await renderLayoutWithVerification({ timeout })
  
  // Verify core components
  await verifyNavigationMenu({ timeout })
  await verifyLogoAndBranding()
  await verifyFooter()
  await verifyNavigationHrefs()
  
  // Verify dropdown functionality
  await verifyServicesDropdown({ timeout })
  
  // Verify accessibility
  await verifyAccessibilityFeatures()
  
  // Optional mobile testing
  if (!skipMobile) {
    await testMobileMenuToggle({ timeout })
  }
  
  // Optional scroll testing
  if (!skipScroll) {
    await testHeaderScrollEffects({ timeout })
  }
  
  return renderResult
}

/**
 * Layout test error patterns for graceful handling
 */
export class LayoutTestError extends Error {
  constructor(message: string, public readonly step: string) {
    super(`Layout test failed at step "${step}": ${message}`)
    this.name = 'LayoutTestError'
  }
}

/**
 * Wrapper for running Layout tests with error handling
 */
export async function runLayoutTestWithErrorHandling<T>(
  testFunction: () => Promise<T>,
  stepName: string
): Promise<T> {
  try {
    return await testFunction()
  } catch (error) {
    throw new LayoutTestError(
      error instanceof Error ? error.message : 'Unknown error',
      stepName
    )
  }
}