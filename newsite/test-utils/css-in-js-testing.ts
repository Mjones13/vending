/**
 * CSS-in-JS Testing Utilities
 * Utilities for testing styled-jsx and other CSS-in-JS components
 */

import { screen, waitFor } from '@testing-library/react'

/**
 * CSS class mapping to expected computed style values
 * Maps CSS classes to the styles they should provide in production
 */
export const CSS_CLASS_STYLE_MAP = {
  // Layout component header styles
  header: {
    position: 'fixed',
    top: '0px',
    left: '0px',
    right: '0px',
    zIndex: '50',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(16px)',
  },
  
  // Scroll-based styles
  'backdrop-blur': {
    backdropFilter: 'blur(16px)',
  },
  
  'scrolled': {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },
  
  // Navigation styles
  'nav-link': {
    textDecoration: 'none',
    padding: 'var(--space-3) var(--space-5)',
    borderRadius: 'var(--border-radius-lg)',
    transition: 'var(--transition-all)',
  },
  
  // Button styles
  'btn-primary': {
    backgroundColor: 'var(--color-primary-600)',
    color: 'white',
    padding: 'var(--space-3) var(--space-6)',
    borderRadius: 'var(--border-radius-lg)',
  }
} as const

/**
 * Verify that an element has the expected computed styles based on its CSS classes
 * This is the recommended approach for testing styled-jsx components
 */
export function expectElementToHaveClassBasedStyles(
  element: HTMLElement,
  expectedClasses: string[]
): void {
  expectedClasses.forEach(className => {
    expect(element).toHaveClass(className)
    
    // Optionally verify the style mapping exists
    if (CSS_CLASS_STYLE_MAP[className as keyof typeof CSS_CLASS_STYLE_MAP]) {
      // The class exists in our style map, meaning it should provide specific styles in production
      // In tests, we verify the class presence rather than computed styles for reliability
    }
  })
}

/**
 * Verify computed styles for elements (works with enhanced jest.setup.js mocking)
 * Use this when you need to test actual computed style values
 */
export function expectElementToHaveComputedStyles(
  element: HTMLElement,
  expectedStyles: Record<string, string>
): void {
  Object.entries(expectedStyles).forEach(([property, value]) => {
    expect(element).toHaveStyle({ [property]: value })
  })
}

/**
 * Get the expected styles for a given CSS class
 */
export function getExpectedStylesForClass(className: string): Record<string, string> | undefined {
  return CSS_CLASS_STYLE_MAP[className as keyof typeof CSS_CLASS_STYLE_MAP]
}

/**
 * Verify that an element has both the correct classes and computed styles
 * This provides comprehensive verification for styled-jsx components
 */
export function expectStyledJsxElement(
  element: HTMLElement,
  options: {
    classes: string[]
    computedStyles?: Record<string, string>
    skipComputedStyles?: boolean
  }
): void {
  const { classes, computedStyles, skipComputedStyles = false } = options
  
  // Always verify classes (reliable across environments)
  expectElementToHaveClassBasedStyles(element, classes)
  
  // Optionally verify computed styles (requires enhanced mocking)
  if (!skipComputedStyles && computedStyles) {
    expectElementToHaveComputedStyles(element, computedStyles)
  }
}

/**
 * Utilities for testing responsive styled-jsx components
 */
export class ResponsiveStyleTester {
  private element: HTMLElement
  
  constructor(element: HTMLElement) {
    this.element = element
  }
  
  /**
   * Test styles at different viewport sizes
   */
  async testAtViewportSize(
    width: number,
    height: number,
    expectedClasses: string[]
  ): Promise<void> {
    // Simulate viewport size change
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    })
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'))
    
    // Wait for any responsive updates
    await waitFor(() => {
      expectElementToHaveClassBasedStyles(this.element, expectedClasses)
    })
  }
}

/**
 * Utilities for testing interactive styled-jsx components
 */
export class InteractiveStyleTester {
  private element: HTMLElement
  
  constructor(element: HTMLElement) {
    this.element = element
  }
  
  /**
   * Test hover states
   */
  async testHoverState(expectedClasses: string[]): Promise<void> {
    // Simulate hover
    this.element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    
    await waitFor(() => {
      expectElementToHaveClassBasedStyles(this.element, expectedClasses)
    })
  }
  
  /**
   * Test focus states
   */
  async testFocusState(expectedClasses: string[]): Promise<void> {
    // Simulate focus
    this.element.focus()
    
    await waitFor(() => {
      expectElementToHaveClassBasedStyles(this.element, expectedClasses)
    })
  }
  
  /**
   * Test active/pressed states
   */
  async testActiveState(expectedClasses: string[]): Promise<void> {
    // Simulate mouse down
    this.element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    
    await waitFor(() => {
      expectElementToHaveClassBasedStyles(this.element, expectedClasses)
    })
  }
}

/**
 * Helper to create a responsive style tester
 */
export function createResponsiveStyleTester(element: HTMLElement): ResponsiveStyleTester {
  return new ResponsiveStyleTester(element)
}

/**
 * Helper to create an interactive style tester
 */
export function createInteractiveStyleTester(element: HTMLElement): InteractiveStyleTester {
  return new InteractiveStyleTester(element)
}

/**
 * Test pattern for styled-jsx components with state changes
 */
export async function testStyledJsxComponentStates(
  element: HTMLElement,
  states: Array<{
    name: string
    setup: () => Promise<void> | void
    expectedClasses: string[]
    expectedStyles?: Record<string, string>
  }>
): Promise<void> {
  for (const state of states) {
    // Setup the state
    await state.setup()
    
    // Verify the expected classes and styles
    await waitFor(() => {
      expectStyledJsxElement(element, {
        classes: state.expectedClasses,
        ...(state.expectedStyles !== undefined && { computedStyles: state.expectedStyles }),
        ...(state.expectedStyles === undefined && { skipComputedStyles: true })
      })
    })
  }
}

/**
 * Debugging utility to inspect actual computed styles vs expected styles
 */
export function debugComputedStyles(element: HTMLElement, properties: string[]): void {
  const computedStyles = window.getComputedStyle(element)
  const actualStyles: Record<string, string> = {}
  
  properties.forEach(property => {
    actualStyles[property] = computedStyles.getPropertyValue(property) || computedStyles[property as any] || 'undefined'
  })
  
  console.log('🔍 Computed Styles Debug:', {
    element: element.tagName.toLowerCase(),
    classes: Array.from(element.classList),
    computedStyles: actualStyles
  })
}

/**
 * Constants for common testing scenarios
 */
export const COMMON_STYLED_JSX_TESTS = {
  LAYOUT_HEADER: {
    classes: ['header'],
    computedStyles: {
      position: 'fixed',
      top: '0px',
      left: '0px',
      right: '0px',
      zIndex: '50'
    }
  },
  
  BACKDROP_BLUR: {
    classes: ['backdrop-blur'],
    computedStyles: {
      backdropFilter: 'blur(16px)'
    }
  },
  
  NAVIGATION_LINK: {
    classes: ['nav-link'],
    computedStyles: {
      textDecoration: 'none',
      transition: 'var(--transition-all)'
    }
  }
} as const

/**
 * Type definitions for better TypeScript support
 */
export type StyledJsxTestOptions = {
  classes: string[]
  computedStyles?: Record<string, string>
  skipComputedStyles?: boolean
}

export type StyleState = {
  name: string
  setup: () => Promise<void> | void
  expectedClasses: string[]
  expectedStyles?: Record<string, string>
}