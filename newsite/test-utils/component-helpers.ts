import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Helper to test responsive behavior by simulating different screen sizes
 */
export function simulateScreenSize(width: number, height: number) {
  // Mock window.innerWidth and window.innerHeight
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
  fireEvent(window, new Event('resize'))
  
  // Update matchMedia mock
  window.matchMedia = jest.fn().mockImplementation((query: string) => {
    const matches = checkMediaQuery(query, width)
    return {
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }
  })
}

/**
 * Check if a media query matches the given width
 */
function checkMediaQuery(query: string, width: number): boolean {
  // Simple media query parser for common breakpoints
  if (query.includes('max-width: 768px')) return width <= 768
  if (query.includes('max-width: 1024px')) return width <= 1024
  if (query.includes('min-width: 769px')) return width >= 769
  if (query.includes('min-width: 1025px')) return width >= 1025
  return false
}

/**
 * Common screen size presets for testing
 */
export const SCREEN_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
  largeDesktop: { width: 1920, height: 1080 },
} as const

/**
 * Helper to test hover interactions
 */
export async function hoverElement(element: Element) {
  await userEvent.hover(element)
}

/**
 * Helper to test unhover interactions
 */
export async function unhoverElement(element: Element) {
  await userEvent.unhover(element)
}

/**
 * Helper to test click interactions with proper event handling
 */
export async function clickElement(element: Element) {
  await userEvent.click(element)
}

/**
 * Helper to test keyboard interactions
 */
export async function pressKey(key: string) {
  await userEvent.keyboard(key)
}

/**
 * Helper to test form interactions
 */
export async function typeInInput(element: Element, text: string) {
  await userEvent.type(element, text)
}

/**
 * Helper to wait for element to be visible
 */
export async function waitForElementToBeVisible(
  selector: string,
  timeout = 5000
): Promise<HTMLElement> {
  return await waitFor(
    () => {
      const element = screen.getByTestId(selector) || screen.getByRole('button', { name: selector })
      expect(element).toBeVisible()
      return element
    },
    { timeout }
  )
}

/**
 * Helper to test navigation behavior
 */
export function expectNavigation(mockRouter: any, expectedPath: string) {
  expect(mockRouter.push).toHaveBeenCalledWith(expectedPath)
}

/**
 * Helper to reset all mocks between tests
 */
export function resetAllMocks() {
  jest.clearAllMocks()
  jest.resetAllMocks()
}

/**
 * Helper to test image loading
 */
export function getImageElement(altText: string): HTMLImageElement {
  return screen.getByAltText(altText) as HTMLImageElement
}

/**
 * Helper to test link elements
 */
export function getLinkElement(text: string): HTMLAnchorElement {
  return screen.getByRole('link', { name: text }) as HTMLAnchorElement
}

/**
 * Helper to test button elements
 */
export function getButtonElement(text: string): HTMLButtonElement {
  return screen.getByRole('button', { name: text }) as HTMLButtonElement
}

/**
 * Helper to test heading elements
 */
export function getHeadingElement(text: string, level?: number): HTMLHeadingElement {
  const options = level ? { level } : {}
  return screen.getByRole('heading', { name: text, ...options }) as HTMLHeadingElement
}

/**
 * Helper to check if element has specific CSS class
 */
export function expectElementToHaveClass(element: Element, className: string) {
  expect(element).toHaveClass(className)
}

/**
 * Helper to check if element has specific style
 */
export function expectElementToHaveStyle(element: Element, styles: Record<string, string>) {
  expect(element).toHaveStyle(styles)
}