/**
 * Phase 4 Verification Tests - Core E2E functionality working
 * These tests verify that the essential E2E testing framework is operational
 */
import { test, expect } from '@playwright/test'
import { createE2EHelpers } from '../../test-utils/e2e-helpers'

test.describe('Phase 4 Core E2E Framework Verification', () => {
  test('should load homepage and core elements work', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    // Basic homepage loading
    await helpers.navigation.goToHomepage()
    await expect(page.locator('h1')).toContainText('Premium Amenity for Modern')
    await expect(page.locator('.rotating-text')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('.logo')).toBeVisible()
  })

  test('should verify rotating text animation works in E2E', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Test that rotating text animation is working
    const rotatingWords = ['Workplaces', 'Apartments', 'Gyms', 'Businesses']
    await helpers.animation.verifyRotatingTextAnimation('.rotating-text', rotatingWords)
  })

  test('should handle basic navigation between pages', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Test navigation to Contact page
    await helpers.navigation.clickNavigationLink('Contact')
    await helpers.navigation.verifyCurrentURL('/contact')
    await expect(page.locator('h1')).toBeVisible()
    
    // Navigate back to home
    await helpers.navigation.clickNavigationLink('Home')
    await helpers.navigation.verifyCurrentURL('/')
  })

  test('should work on different viewport sizes', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    // Test desktop
    await helpers.responsive.setDesktopViewport()
    await helpers.navigation.goToHomepage()
    await helpers.responsive.verifyDesktopMenuVisible()
    
    // Test mobile viewport
    await helpers.responsive.setMobileViewport()
    await helpers.responsive.verifyMobileMenuVisible()
    
    // Test tablet
    await helpers.responsive.setTabletViewport()
    await expect(page.locator('.nav-menu')).toBeVisible()
  })

  test('should handle link interactions and CTA buttons', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Test Request Demo link (it's actually a link, not a button)
    await helpers.interaction.testLinkClick('Request Demo', '/request-a-demo')
    
    // Go back and test Login
    await helpers.navigation.goToHomepage()
    await helpers.interaction.testLinkClick('Login', '/login')
  })

  test('should have good accessibility basics', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Test basic accessibility
    await helpers.accessibility.verifyHeadingHierarchy()
    await helpers.accessibility.verifyImageAltTexts()
    await helpers.accessibility.verifyAriaLabels()
  })

  test('should perform reasonably on different browsers', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    // Measure basic performance
    const performance = await helpers.performance.measurePageLoad()
    
    // Should load within reasonable time
    expect(performance.loadTime).toBeLessThan(10000) // 10 seconds
    expect(performance.domContentLoaded).toBeLessThan(5000) // 5 seconds
    
    // Should have no console errors
    const errors = await helpers.performance.checkConsoleErrors()
    expect(errors.length).toBe(0)
  })
})