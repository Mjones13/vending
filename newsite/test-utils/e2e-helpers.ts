/**
 * End-to-end testing helper utilities for Playwright
 */
import { Page, Locator, expect } from '@playwright/test'

/**
 * Navigation helper class for testing page navigation
 */
export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to homepage and verify it loads correctly
   */
  async goToHomepage(): Promise<void> {
    await this.page.goto('/')
    await expect(this.page).toHaveTitle(/SMARTER VENDING/)
    await expect(this.page.locator('h1')).toContainText('Premium Amenity for Modern')
  }

  /**
   * Navigate to a specific page and verify it loads
   */
  async goToPage(path: string, expectedTitle?: string, expectedHeading?: string): Promise<void> {
    await this.page.goto(path)
    
    if (expectedTitle) {
      await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'))
    }
    
    if (expectedHeading) {
      await expect(this.page.locator('h1').first()).toContainText(expectedHeading)
    }
    
    // Ensure page is fully loaded
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Test navigation via menu links
   */
  async clickNavigationLink(linkText: string): Promise<void> {
    const link = this.page.locator('nav').getByRole('link', { name: new RegExp(linkText, 'i') }).first()
    await link.click()
    await this.page.waitForLoadState('networkidle')
    // Add small delay to ensure page is fully loaded
    await this.page.waitForTimeout(500)
  }

  /**
   * Test dropdown menu navigation
   */
  async hoverAndClickDropdownItem(menuText: string, itemText: string): Promise<void> {
    // Hover over main menu item to show dropdown
    await this.page.locator('nav').getByText(menuText).hover()
    
    // Wait for dropdown to appear
    await this.page.waitForSelector('.dropdown-menu:visible', { timeout: 2000 })
    
    // Click dropdown item
    await this.page.locator('.dropdown-menu').getByRole('link', { name: new RegExp(itemText, 'i') }).click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Test mobile menu navigation
   */
  async testMobileNavigation(linkText: string): Promise<void> {
    // Open mobile menu
    await this.page.locator('.menu-toggle').click()
    
    // Wait for menu to become active
    await expect(this.page.locator('.nav-menu.active')).toBeVisible()
    
    // Click navigation link and wait for navigation
    const link = this.page.locator('.nav-menu.active').getByRole('link', { name: new RegExp(linkText, 'i') }).first()
    await link.click()
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(500)
  }

  /**
   * Verify current page URL
   */
  async verifyCurrentURL(expectedPath: string): Promise<void> {
    // Wait a bit for URL to stabilize after navigation
    await this.page.waitForTimeout(200)
    const currentURL = this.page.url()
    expect(currentURL).toContain(expectedPath)
  }
}

/**
 * Animation testing helper for E2E tests
 */
export class AnimationHelper {
  constructor(private page: Page) {}

  /**
   * Wait for and verify rotating text animation
   */
  async verifyRotatingTextAnimation(containerSelector: string, expectedWords: string[]): Promise<void> {
    const container = this.page.locator(containerSelector)
    await expect(container).toBeVisible()
    
    // Get current text
    const currentText = await container.textContent()
    
    // Verify current text is one of the expected words
    const isValidWord = expectedWords.some(word => currentText?.includes(word))
    expect(isValidWord).toBe(true)
    
    // Wait for text to change - check that we get a different word
    let changedToNewWord = false
    let attempts = 0
    const maxAttempts = 10
    
    while (!changedToNewWord && attempts < maxAttempts) {
      await this.page.waitForTimeout(800) // Wait between checks
      const newText = await container.textContent()
      if (newText !== currentText) {
        changedToNewWord = true
        // Verify new text is also a valid word
        const isNewWordValid = expectedWords.some(word => newText?.includes(word))
        expect(isNewWordValid).toBe(true)
      }
      attempts++
    }
    
    expect(changedToNewWord).toBe(true)
  }

  /**
   * Verify staggered logo animations
   */
  async verifyLogoStaggerAnimation(): Promise<void> {
    // Wait for logos to be visible
    await expect(this.page.locator('.logo-item').first()).toBeVisible()
    
    // Check that animation classes are applied
    const logoItems = this.page.locator('.logo-item')
    const count = await logoItems.count()
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      await expect(logoItems.nth(i)).toHaveClass(/animate-fade-in/, { timeout: 2000 })
    }
  }

  /**
   * Test hover animations on elements
   */
  async testHoverAnimation(selector: string, expectedTransform?: string): Promise<void> {
    const element = this.page.locator(selector)
    await expect(element).toBeVisible()
    
    // Hover over element
    await element.hover()
    
    // Verify transform or other hover effects
    if (expectedTransform) {
      await expect(element).toHaveCSS('transform', expectedTransform)
    }
    
    // Verify element responds to hover
    await expect(element).toHaveCSS('transition', /transform/)
  }

  /**
   * Wait for all animations to complete
   */
  async waitForAnimationsToComplete(): Promise<void> {
    await this.page.waitForTimeout(1000) // Allow animations to settle
  }
}

/**
 * Responsive design testing helper
 */
export class ResponsiveHelper {
  constructor(private page: Page) {}

  /**
   * Test mobile viewport
   */
  async setMobileViewport(): Promise<void> {
    await this.page.setViewportSize({ width: 375, height: 667 })
  }

  /**
   * Test tablet viewport
   */
  async setTabletViewport(): Promise<void> {
    await this.page.setViewportSize({ width: 768, height: 1024 })
  }

  /**
   * Test desktop viewport
   */
  async setDesktopViewport(): Promise<void> {
    await this.page.setViewportSize({ width: 1440, height: 900 })
  }

  /**
   * Verify mobile menu is visible on small screens
   */
  async verifyMobileMenuVisible(): Promise<void> {
    await expect(this.page.locator('.menu-toggle')).toBeVisible()
    // Check that nav-menu is not in active state (mobile menu not open)
    const navMenu = this.page.locator('.nav-menu')
    await expect(navMenu).not.toHaveClass(/active/)
  }

  /**
   * Verify desktop menu is visible on large screens
   */
  async verifyDesktopMenuVisible(): Promise<void> {
    await expect(this.page.locator('.menu-toggle')).not.toBeVisible()
    await expect(this.page.locator('.nav-menu')).toBeVisible()
  }

  /**
   * Test responsive image loading
   */
  async verifyResponsiveImages(): Promise<void> {
    const images = this.page.locator('img')
    const count = await images.count()
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i)
      await expect(img).toHaveAttribute('alt')
      
      // Verify image loads
      await expect(img).toHaveJSProperty('complete', true)
      await expect(img).toHaveJSProperty('naturalWidth', expect.any(Number))
    }
  }
}

/**
 * Form and interaction testing helper
 */
export class InteractionHelper {
  constructor(private page: Page) {}

  /**
   * Test button clicks and navigation
   */
  async testButtonClick(buttonText: string, expectedResult?: string): Promise<void> {
    const button = this.page.getByRole('button', { name: new RegExp(buttonText, 'i') })
    await expect(button).toBeVisible()
    await expect(button).toBeEnabled()
    
    await button.click()
    
    if (expectedResult) {
      await expect(this.page).toHaveURL(new RegExp(expectedResult))
    }
  }

  /**
   * Test link clicks
   */
  async testLinkClick(linkText: string, expectedURL?: string): Promise<void> {
    const link = this.page.getByRole('link', { name: new RegExp(linkText, 'i') }).first()
    await expect(link).toBeVisible()
    
    await link.click()
    await this.page.waitForLoadState('networkidle')
    
    if (expectedURL) {
      expect(this.page.url()).toContain(expectedURL)
    }
  }

  /**
   * Test form submissions
   */
  async testFormSubmission(formSelector: string, formData: Record<string, string>): Promise<void> {
    const form = this.page.locator(formSelector)
    await expect(form).toBeVisible()
    
    // Fill form fields
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(`${formSelector} [name="${field}"]`, value)
    }
    
    // Submit form
    await this.page.locator(`${formSelector} [type="submit"]`).click()
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(): Promise<void> {
    // Tab through interactive elements
    await this.page.keyboard.press('Tab')
    await expect(this.page.locator(':focus')).toBeVisible()
    
    // Test Enter key on focused element
    await this.page.keyboard.press('Enter')
  }

  /**
   * Test phone number link
   */
  async testPhoneLink(phoneNumber: string): Promise<void> {
    const phoneLink = this.page.getByRole('link', { name: phoneNumber }).first()
    await expect(phoneLink).toBeVisible()
    await expect(phoneLink).toHaveAttribute('href', `tel:${phoneNumber.replace(/\D/g, '')}`)
  }
}

/**
 * Performance testing helper
 */
export class PerformanceHelper {
  constructor(private page: Page) {}

  /**
   * Measure page load performance
   */
  async measurePageLoad(): Promise<{ loadTime: number; domContentLoaded: number }> {
    const startTime = Date.now()
    
    await this.page.goto('/')
    await this.page.waitForLoadState('domcontentloaded')
    const domContentLoaded = Date.now() - startTime
    
    await this.page.waitForLoadState('load')
    const loadTime = Date.now() - startTime
    
    return { loadTime, domContentLoaded }
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors(): Promise<string[]> {
    const errors: string[] = []
    
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    return errors
  }

  /**
   * Verify images are optimized
   */
  async verifyImageOptimization(): Promise<void> {
    const images = this.page.locator('img')
    const count = await images.count()
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const img = images.nth(i)
      
      // Check for loading attribute (but be flexible as Next.js handles this)
      const loading = await img.getAttribute('loading')
      if (loading) {
        expect(['lazy', 'eager']).toContain(loading)
      }
      
      // Check for sizes attribute on responsive images (if present)
      const sizes = await img.getAttribute('sizes')
      if (sizes) {
        expect(sizes).toMatch(/\d+(px|vw)/)
      }
      
      // Verify image has alt attribute
      await expect(img).toHaveAttribute('alt')
    }
  }
}

/**
 * Accessibility testing helper
 */
export class AccessibilityHelper {
  constructor(private page: Page) {}

  /**
   * Verify heading hierarchy
   */
  async verifyHeadingHierarchy(): Promise<void> {
    const h1 = this.page.locator('h1')
    await expect(h1).toHaveCount(1) // Should have exactly one H1
    
    const headings = this.page.locator('h1, h2, h3, h4, h5, h6')
    const count = await headings.count()
    
    expect(count).toBeGreaterThan(0)
  }

  /**
   * Verify image alt texts
   */
  async verifyImageAltTexts(): Promise<void> {
    const images = this.page.locator('img')
    const count = await images.count()
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      await expect(img).toHaveAttribute('alt')
    }
  }

  /**
   * Test keyboard accessibility
   */
  async testKeyboardAccessibility(): Promise<void> {
    const focusableElements = this.page.locator('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
    const count = await focusableElements.count()
    
    // Tab through first few elements
    for (let i = 0; i < Math.min(count, 5); i++) {
      await this.page.keyboard.press('Tab')
      const focused = this.page.locator(':focus')
      await expect(focused).toBeVisible()
    }
  }

  /**
   * Verify ARIA labels and roles
   */
  async verifyAriaLabels(): Promise<void> {
    // Check navigation has proper ARIA
    await expect(this.page.locator('nav')).toHaveCount(1)
    
    // Check buttons have accessible names
    const buttons = this.page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const ariaLabel = await button.getAttribute('aria-label')
      const textContent = await button.textContent()
      
      // Button should have either aria-label or text content
      expect(ariaLabel || textContent).toBeTruthy()
    }
  }
}

/**
 * Factory function to create all helpers for a page
 */
export function createE2EHelpers(page: Page) {
  return {
    navigation: new NavigationHelper(page),
    animation: new AnimationHelper(page),
    responsive: new ResponsiveHelper(page),
    interaction: new InteractionHelper(page),
    performance: new PerformanceHelper(page),
    accessibility: new AccessibilityHelper(page),
  }
}