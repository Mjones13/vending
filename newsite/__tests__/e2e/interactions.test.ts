/**
 * E2E tests for form interactions and user interactions
 * Tests buttons, links, and interactive elements
 */
import { test, expect } from '@playwright/test'
import { createE2EHelpers } from '../../test-utils/e2e-helpers'

test.describe('User Interactions E2E Tests', () => {
  test('should handle button interactions correctly', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Test Request Demo button
    await helpers.interaction.testButtonClick('Request Demo', '/request-a-demo')
    
    // Go back and test other buttons
    await helpers.navigation.goToHomepage()
    
    // Test Login link
    await helpers.interaction.testLinkClick('Login', '/login')
  })

  test('should handle phone number interactions', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Scroll to footer where phone number is located
    await page.locator('footer').scrollIntoViewIfNeeded()
    
    // Test phone number link
    await helpers.interaction.testPhoneLink('909.258.9848')
  })

  test('should handle keyboard navigation properly', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Test keyboard navigation
    await helpers.interaction.testKeyboardNavigation()
    
    // Test that tab order makes sense
    await page.keyboard.press('Tab') // Should focus first interactive element
    const firstFocused = page.locator(':focus')
    await expect(firstFocused).toBeVisible()
    
    // Continue tabbing to verify logical tab order
    await page.keyboard.press('Tab')
    const secondFocused = page.locator(':focus')
    await expect(secondFocused).toBeVisible()
    
    // Test that Enter key works on focused links
    const focusedElement = await page.locator(':focus').getAttribute('href')
    if (focusedElement) {
      await page.keyboard.press('Enter')
      await page.waitForLoadState('networkidle')
      // Should have navigated
      expect(page.url()).toContain(focusedElement)
    }
  })

  test('should handle mobile touch interactions', async ({ page, browserName }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.responsive.setMobileViewport()
    await helpers.navigation.goToHomepage()
    
    // Test mobile menu toggle (use click for better compatibility)
    if (browserName === 'chromium' || browserName === 'firefox') {
      await page.locator('.menu-toggle').click()
    } else {
      await page.locator('.menu-toggle').tap()
    }
    await expect(page.locator('.nav-menu.active')).toBeVisible()
    
    // Test touch navigation
    const contactLink = page.locator('.nav-menu.active').getByRole('link', { name: 'Contact' })
    if (browserName === 'chromium' || browserName === 'firefox') {
      await contactLink.click()
    } else {
      await contactLink.tap()
    }
    await helpers.navigation.verifyCurrentURL('/contact')
    
    // Test that touch events work properly
    await helpers.navigation.goToHomepage()
    
    // Test button tap
    const demoButton = page.getByRole('link', { name: /request demo/i })
    if (await demoButton.isVisible()) {
      if (browserName === 'chromium' || browserName === 'firefox') {
        await demoButton.click()
      } else {
        await demoButton.tap()
      }
      await helpers.navigation.verifyCurrentURL('/request-a-demo')
    }
  })

  test('should handle hover interactions on desktop', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.responsive.setDesktopViewport()
    await helpers.navigation.goToHomepage()
    
    // Test logo hover effect
    await helpers.animation.testHoverAnimation('.logo')
    
    // Test navigation link hover effects
    const navLinks = page.locator('.nav-link')
    const count = await navLinks.count()
    
    if (count > 0) {
      const firstLink = navLinks.first()
      await firstLink.hover()
      
      // Verify hover state is applied
      await expect(firstLink).toHaveCSS('color', /(rgb\(37, 99, 235\)|#2563eb)/i) // Primary color
    }
    
    // Test dropdown hover interactions
    await page.locator('.nav-link:has-text("Services")').hover()
    await expect(page.locator('.dropdown-menu')).toBeVisible()
  })

  test('should handle focus states for accessibility', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Test focus states on various elements
    const focusableElements = [
      '.logo',
      '.nav-link',
      '.btn-demo',
      '.btn-login'
    ]
    
    for (const selector of focusableElements) {
      const element = page.locator(selector).first()
      if (await element.isVisible()) {
        await element.focus()
        
        // Verify element is focused and has focus styles
        await expect(element).toBeFocused()
        
        // Check for visible focus indicator (outline or box-shadow)
        const outline = await element.evaluate(el => {
          const styles = window.getComputedStyle(el)
          return styles.outline !== 'none' || styles.outlineStyle !== 'none' || 
                 styles.boxShadow.includes('rgb') || styles.border.includes('rgb')
        })
        expect(outline).toBe(true)
      }
    }
  })

  test('should handle error states gracefully', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    // Test navigation to non-existent page
    await page.goto('/non-existent-page', { waitUntil: 'networkidle' })
    
    // Should handle 404 gracefully (Next.js default 404 or custom)
    await expect(page.locator('body')).toBeVisible()
    
    // Navigate back to working page
    await helpers.navigation.goToHomepage()
    await expect(page.locator('h1')).toContainText('Premium Amenity for Modern')
  })

  test('should maintain state during rapid interactions', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Test rapid navigation clicks
    await helpers.navigation.clickNavigationLink('Contact')
    await helpers.navigation.clickNavigationLink('About')
    await helpers.navigation.clickNavigationLink('Home')
    
    // Verify we end up at home and state is consistent
    await helpers.navigation.verifyCurrentURL('/')
    await expect(page.locator('h1')).toContainText('Premium Amenity for Modern')
    
    // Verify rotating text is still working after rapid navigation
    const rotatingWords = ['Workplaces', 'Apartments', 'Gyms', 'Businesses']
    await helpers.animation.verifyRotatingTextAnimation('.rotating-text', rotatingWords)
  })

  test('should handle external link interactions', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Look for any external links (they should open in new tab/window)
    const externalLinks = page.locator('a[href^="http"]:not([href*="localhost"])')
    const count = await externalLinks.count()
    
    if (count > 0) {
      const firstExternalLink = externalLinks.first()
      const href = await firstExternalLink.getAttribute('href')
      const target = await firstExternalLink.getAttribute('target')
      
      // External links should either have target="_blank" or handle appropriately
      if (href && !href.includes('localhost')) {
        expect(target).toBe('_blank')
      }
    }
  })

  test('should handle loading states during navigation', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Monitor for loading indicators during navigation
    let loadingStateHandled = false
    
    page.on('request', (request) => {
      if (request.resourceType() === 'document') {
        loadingStateHandled = true
      }
    })
    
    // Navigate to different page
    await helpers.navigation.clickNavigationLink('About')
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    // Verify page content is visible (not stuck in loading state)
    await expect(page.locator('h1')).toBeVisible()
    expect(loadingStateHandled).toBe(true)
  })
})