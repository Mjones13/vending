/**
 * E2E tests for homepage functionality
 * Tests basic page load, navigation, and core interactions
 */
import { test, expect } from '@playwright/test'
import { createE2EHelpers } from '../../test-utils/e2e-helpers'

test.describe('Homepage E2E Tests', () => {
  test('should load homepage and verify basic elements @critical', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    // Navigate to homepage
    await helpers.navigation.goToHomepage()
    
    // Verify main hero elements
    await expect(page.locator('h1')).toContainText('Premium Amenity for Modern')
    
    // Verify rotating text is present
    await expect(page.locator('.rotating-text')).toBeVisible()
    
    // Verify basic navigation elements
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('.logo')).toBeVisible()
  })

  test('should verify rotating text animation works', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Test rotating text animation with correct words from homepage
    const rotatingWords = ['Workplaces', 'Apartments', 'Gyms', 'Businesses']
    await helpers.animation.verifyRotatingTextAnimation('.rotating-text', rotatingWords)
  })

  test('should navigate to different pages via menu', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Test navigation to shop page (direct link)
    await helpers.navigation.clickNavigationLink('Shop')
    await helpers.navigation.verifyCurrentURL('/shop')
    
    // Navigate back to home
    await helpers.navigation.goToHomepage()
    
    // Test navigation to contact page  
    await helpers.navigation.clickNavigationLink('Contact')
    await helpers.navigation.verifyCurrentURL('/contact')
  })

  test('should work properly on mobile devices', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    // Set mobile viewport
    await helpers.responsive.setMobileViewport()
    await helpers.navigation.goToHomepage()
    
    // Verify mobile menu is visible
    await helpers.responsive.verifyMobileMenuVisible()
    
    // Test mobile navigation
    await helpers.navigation.testMobileNavigation('Contact')
    await helpers.navigation.verifyCurrentURL('/contact')
  })

  test('should have good accessibility', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Test accessibility requirements
    await helpers.accessibility.verifyHeadingHierarchy()
    await helpers.accessibility.verifyImageAltTexts()
    await helpers.accessibility.testKeyboardAccessibility()
    await helpers.accessibility.verifyAriaLabels()
  })

  test('should load quickly and without errors', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    // Check for console errors
    const errors = await helpers.performance.checkConsoleErrors()
    
    // Measure page performance
    const performance = await helpers.performance.measurePageLoad()
    
    // Verify performance is reasonable (adjust thresholds as needed)
    expect(performance.loadTime).toBeLessThan(5000) // 5 seconds
    expect(performance.domContentLoaded).toBeLessThan(3000) // 3 seconds
    
    // Should have no console errors
    expect(errors.length).toBe(0)
  })

  test('should have optimized images', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Verify image optimization
    await helpers.performance.verifyImageOptimization()
    
    // Verify responsive images load correctly
    await helpers.responsive.verifyResponsiveImages()
  })
})