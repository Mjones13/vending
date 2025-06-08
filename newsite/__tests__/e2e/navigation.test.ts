/**
 * E2E tests for page navigation and routing
 * Tests navigation between different pages
 */
import { test, expect } from '@playwright/test'
import { createE2EHelpers } from '../../test-utils/e2e-helpers'

test.describe('Navigation E2E Tests', () => {
  test('should navigate to all main pages from header menu @critical', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    // Start at homepage
    await helpers.navigation.goToHomepage()
    
    // Test navigation to Shop page (direct link)
    await helpers.navigation.clickNavigationLink('Shop')
    await helpers.navigation.verifyCurrentURL('/shop')
    await expect(page.locator('h1')).toBeVisible()
    
    // Navigate to Contact page  
    await helpers.navigation.clickNavigationLink('Contact')
    await helpers.navigation.verifyCurrentURL('/contact')
    await expect(page.locator('h1')).toBeVisible()
    
    // Navigate back to Home
    await helpers.navigation.clickNavigationLink('Home')
    await helpers.navigation.verifyCurrentURL('/')
    await expect(page.locator('h1')).toContainText('Premium Amenity for Modern')
  })

  test('should navigate through Services dropdown menu', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Test Services dropdown navigation
    await helpers.navigation.hoverAndClickDropdownItem('Services', 'Coffee Services')
    await helpers.navigation.verifyCurrentURL('/coffee-services')
    await expect(page.locator('h1')).toBeVisible()
    
    // Navigate back to home and test another service
    await helpers.navigation.goToHomepage()
    await helpers.navigation.hoverAndClickDropdownItem('Services', 'Mini Markets')
    await helpers.navigation.verifyCurrentURL('/mini-markets')
    await expect(page.locator('h1')).toBeVisible()
    
    // Test vending machines
    await helpers.navigation.goToHomepage()
    await helpers.navigation.hoverAndClickDropdownItem('Services', 'Vending Machines')
    await helpers.navigation.verifyCurrentURL('/vending-machines')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should navigate using footer links', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded()
    
    // Test footer link navigation  
    await page.locator('footer').getByRole('link', { name: 'Contact' }).click()
    await helpers.navigation.verifyCurrentURL('/contact')
    
    // Go back and test another footer link
    await helpers.navigation.goToHomepage()
    await page.locator('footer').scrollIntoViewIfNeeded()
    await page.locator('footer').getByRole('link', { name: 'Coffee Services' }).click()
    await helpers.navigation.verifyCurrentURL('/coffee-services')
  })

  test('should navigate using CTA buttons', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Test Request Demo button in header
    await helpers.interaction.testButtonClick('Request Demo', '/request-a-demo')
    
    // Go back to home and test Login button
    await helpers.navigation.goToHomepage()
    await helpers.interaction.testLinkClick('Login', '/login')
  })

  test('should handle browser back and forward navigation', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    // Navigate through several pages
    await helpers.navigation.goToHomepage()
    await helpers.navigation.clickNavigationLink('Contact')
    await helpers.navigation.verifyCurrentURL('/contact')
    
    await helpers.navigation.clickNavigationLink('Shop')
    await helpers.navigation.verifyCurrentURL('/shop')
    
    // Test browser back button
    await page.goBack()
    await helpers.navigation.verifyCurrentURL('/contact')
    
    // Test browser forward button
    await page.goForward()
    await helpers.navigation.verifyCurrentURL('/shop')
    
    // Go back to home using navigation
    await helpers.navigation.clickNavigationLink('Home')
    await helpers.navigation.verifyCurrentURL('/')
  })

  test('should maintain state during navigation', async ({ page }) => {
    const helpers = createE2EHelpers(page)
    
    await helpers.navigation.goToHomepage()
    
    // Check that logo is always visible during navigation
    await expect(page.locator('.logo')).toBeVisible()
    
    // Navigate to different page
    await helpers.navigation.clickNavigationLink('Shop')
    await expect(page.locator('.logo')).toBeVisible()
    
    // Navigate to another page
    await helpers.navigation.clickNavigationLink('Contact')
    await expect(page.locator('.logo')).toBeVisible()
    
    // Verify header remains fixed during scroll
    await page.evaluate(() => window.scrollTo(0, 500))
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('.logo')).toBeVisible()
  })
})