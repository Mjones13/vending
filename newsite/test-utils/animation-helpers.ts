import { waitFor } from '@testing-library/react'

/**
 * Waits for an element to have a specific CSS class
 * @param element - The DOM element to watch
 * @param className - The CSS class to wait for
 * @param timeout - Maximum time to wait in milliseconds
 */
export async function waitForClass(
  element: Element,
  className: string,
  timeout = 5000
): Promise<void> {
  await waitFor(
    () => {
      expect(element).toHaveClass(className)
    },
    { timeout }
  )
}

/**
 * Waits for an element to not have a specific CSS class
 * @param element - The DOM element to watch
 * @param className - The CSS class to wait for removal
 * @param timeout - Maximum time to wait in milliseconds
 */
export async function waitForClassRemoval(
  element: Element,
  className: string,
  timeout = 5000
): Promise<void> {
  await waitFor(
    () => {
      expect(element).not.toHaveClass(className)
    },
    { timeout }
  )
}

/**
 * Waits for an animation to complete by watching for CSS class changes
 * @param element - The DOM element with the animation
 * @param animatingClass - The class applied during animation
 * @param finalClass - The class expected after animation
 * @param timeout - Maximum time to wait in milliseconds
 */
export async function waitForAnimationComplete(
  element: Element,
  animatingClass: string,
  finalClass?: string,
  timeout = 5000
): Promise<void> {
  // First wait for animation to start
  await waitForClass(element, animatingClass, timeout)
  
  // Then wait for animation to finish
  await waitForClassRemoval(element, animatingClass, timeout)
  
  // If a final class is specified, wait for it
  if (finalClass) {
    await waitForClass(element, finalClass, timeout)
  }
}

/**
 * Waits for text content to change in an element
 * @param element - The DOM element to watch
 * @param expectedText - The text content to wait for
 * @param timeout - Maximum time to wait in milliseconds
 */
export async function waitForTextChange(
  element: Element,
  expectedText: string,
  timeout = 5000
): Promise<void> {
  await waitFor(
    () => {
      expect(element).toHaveTextContent(expectedText)
    },
    { timeout }
  )
}

/**
 * Waits for multiple text changes in sequence (useful for rotating text)
 * @param element - The DOM element to watch
 * @param textSequence - Array of text values to wait for in order
 * @param intervalMs - Time to wait between text changes
 * @param timeout - Maximum time to wait for each change
 */
export async function waitForTextSequence(
  element: Element,
  textSequence: string[],
  intervalMs = 1000,
  timeout = 5000
): Promise<void> {
  for (const text of textSequence) {
    await waitForTextChange(element, text, timeout)
    if (text !== textSequence[textSequence.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
  }
}

/**
 * Triggers a CSS animation by adding/removing classes
 * @param element - The DOM element to animate
 * @param triggerClass - The class to add to trigger animation
 * @param removeAfterMs - Time to wait before removing the class (optional)
 */
export function triggerAnimation(
  element: Element,
  triggerClass: string,
  removeAfterMs?: number
): void {
  element.classList.add(triggerClass)
  
  if (removeAfterMs !== undefined) {
    setTimeout(() => {
      element.classList.remove(triggerClass)
    }, removeAfterMs)
  }
}

/**
 * Custom matcher to check if element has CSS transform
 */
export function hasTransform(element: Element): boolean {
  const style = window.getComputedStyle(element)
  return style.transform !== 'none'
}

/**
 * Custom matcher to check if element has CSS transition
 */
export function hasTransition(element: Element): boolean {
  const style = window.getComputedStyle(element)
  return style.transition !== 'all 0s ease 0s'
}