/**
 * Advanced animation testing utilities specifically for CSS animations and React state-based animations
 */
import { waitFor } from '@testing-library/react'

/**
 * Test rotating text animation states
 */
export class RotatingTextTester {
  private element: Element
  private words: string[]
  private currentIndex: number = 0

  constructor(element: Element, words: string[]) {
    this.element = element
    this.words = words
  }

  /**
   * Wait for text to rotate to the next word in sequence
   */
  async waitForNextWord(timeout = 5000): Promise<string> {
    this.currentIndex = (this.currentIndex + 1) % this.words.length
    const expectedWord = this.words[this.currentIndex]
    
    await waitFor(
      () => {
        expect(this.element).toHaveTextContent(expectedWord || '')
      },
      { timeout }
    )
    
    return expectedWord || ''
  }

  /**
   * Wait for a complete rotation cycle through all words
   */
  async waitForCompleteCycle(timeout = 20000): Promise<void> {
    const startWord = this.words[0]
    
    // Wait for each word in sequence
    for (let i = 1; i < this.words.length; i++) {
      await this.waitForNextWord(timeout / this.words.length)
    }
    
    // Wait to return to start word
    await waitFor(
      () => {
        expect(this.element).toHaveTextContent(startWord)
      },
      { timeout: timeout / this.words.length }
    )
  }

  /**
   * Verify animation state classes are applied correctly
   */
  async verifyAnimationStates(
    exitingClass: string,
    enteringClass: string,
    visibleClass: string,
    timeout = 3000
  ): Promise<void> {
    // Should start in visible state
    expect(this.element).toHaveClass(visibleClass)
    
    // Wait for exiting state
    await waitFor(
      () => {
        expect(this.element).toHaveClass(exitingClass)
      },
      { timeout }
    )
    
    // Wait for entering state (word should change here)
    await waitFor(
      () => {
        expect(this.element).toHaveClass(enteringClass)
        expect(this.element).not.toHaveClass(exitingClass)
      },
      { timeout }
    )
    
    // Wait to return to visible state
    await waitFor(
      () => {
        expect(this.element).toHaveClass(visibleClass)
        expect(this.element).not.toHaveClass(enteringClass)
      },
      { timeout }
    )
  }
}

/**
 * Test staggered animations (like logo animations)
 */
export class StaggeredAnimationTester {
  private elements: NodeListOf<Element>
  private staggerDelay: number

  constructor(selector: string, staggerDelay: number = 150) {
    this.elements = document.querySelectorAll(selector)
    this.staggerDelay = staggerDelay
  }

  /**
   * Verify elements animate in with proper staggered timing
   */
  async verifyStaggeredAnimation(
    animationClass: string,
    timeout = 5000
  ): Promise<void> {
    for (let i = 0; i < this.elements.length; i++) {
      const element = this.elements[i]
      
      await waitFor(
        () => {
          expect(element).toHaveClass(animationClass)
        },
        { timeout }
      )
      
      // Wait for stagger delay before checking next element
      if (i < this.elements.length - 1) {
        await new Promise(resolve => setTimeout(resolve, this.staggerDelay))
      }
    }
  }

  /**
   * Get count of elements for verification
   */
  getElementCount(): number {
    return this.elements.length
  }
}

/**
 * Test CSS keyframe animations
 */
export class KeyframeAnimationTester {
  private element: Element

  constructor(element: Element) {
    this.element = element
  }

  /**
   * Verify animation plays and completes
   */
  async verifyAnimationComplete(
    animationName: string,
    duration: number,
    timeout?: number
  ): Promise<void> {
    const actualTimeout = timeout || duration + 1000

    // Check animation starts
    const computedStyle = window.getComputedStyle(this.element)
    expect(computedStyle.animationName).toContain(animationName)

    // Wait for animation to complete
    await waitFor(
      () => {
        // Animation should be completed or not running
        const style = window.getComputedStyle(this.element)
        expect(style.animationPlayState).not.toBe('running')
      },
      { timeout: actualTimeout }
    )
  }

  /**
   * Verify specific animation properties
   */
  verifyAnimationProperties(expectedProperties: {
    name?: string
    duration?: string
    timingFunction?: string
    delay?: string
    iterationCount?: string
    direction?: string
    fillMode?: string
  }): void {
    const style = window.getComputedStyle(this.element)

    if (expectedProperties.name) {
      expect(style.animationName).toContain(expectedProperties.name)
    }
    if (expectedProperties.duration) {
      expect(style.animationDuration).toBe(expectedProperties.duration)
    }
    if (expectedProperties.timingFunction) {
      expect(style.animationTimingFunction).toBe(expectedProperties.timingFunction)
    }
    if (expectedProperties.delay) {
      expect(style.animationDelay).toBe(expectedProperties.delay)
    }
    if (expectedProperties.iterationCount) {
      expect(style.animationIterationCount).toBe(expectedProperties.iterationCount)
    }
    if (expectedProperties.direction) {
      expect(style.animationDirection).toBe(expectedProperties.direction)
    }
    if (expectedProperties.fillMode) {
      expect(style.animationFillMode).toBe(expectedProperties.fillMode)
    }
  }
}

/**
 * Test CSS transition animations
 */
export class TransitionTester {
  private element: Element

  constructor(element: Element) {
    this.element = element
  }

  /**
   * Test hover transition effects
   */
  async testHoverTransition(
    hoverClass: string,
    transitionProperty: string,
    timeout = 2000
  ): Promise<void> {
    // Trigger hover
    this.element.classList.add(hoverClass)

    // Wait for transition to start
    await waitFor(
      () => {
        const style = window.getComputedStyle(this.element)
        expect(style.transitionProperty).toContain(transitionProperty)
      },
      { timeout }
    )

    // Remove hover
    this.element.classList.remove(hoverClass)

    // Wait for transition back
    await waitFor(
      () => {
        const style = window.getComputedStyle(this.element)
        // Transition should complete
        expect(style.transitionProperty).toContain(transitionProperty)
      },
      { timeout }
    )
  }

  /**
   * Verify transition properties
   */
  verifyTransitionProperties(expectedProperties: {
    property?: string
    duration?: string
    timingFunction?: string
    delay?: string
  }): void {
    const style = window.getComputedStyle(this.element)

    if (expectedProperties.property) {
      expect(style.transitionProperty).toContain(expectedProperties.property)
    }
    if (expectedProperties.duration) {
      expect(style.transitionDuration).toBe(expectedProperties.duration)
    }
    if (expectedProperties.timingFunction) {
      expect(style.transitionTimingFunction).toBe(expectedProperties.timingFunction)
    }
    if (expectedProperties.delay) {
      expect(style.transitionDelay).toBe(expectedProperties.delay)
    }
  }
}

/**
 * Utility functions for animation testing
 */

/**
 * Fast-forward all animations for testing
 */
export function fastForwardAnimations(): void {
  const style = document.createElement('style')
  style.innerHTML = `
    *, *::before, *::after {
      animation-duration: 0.01s !important;
      animation-delay: 0s !important;
      transition-duration: 0.01s !important;
      transition-delay: 0s !important;
    }
  `
  document.head.appendChild(style)
}

/**
 * Reset animation styles to normal speed
 */
export function resetAnimationSpeed(): void {
  const existingStyles = document.querySelectorAll('style')
  existingStyles.forEach(style => {
    if (style.innerHTML.includes('animation-duration: 0.01s')) {
      style.remove()
    }
  })
}

/**
 * Create animation test helpers for a specific component
 */
export function createAnimationTestSuite(containerElement: Element) {
  return {
    rotatingText: (selector: string, words: string[]) => {
      const element = containerElement.querySelector(selector)
      if (!element) throw new Error(`Element with selector "${selector}" not found`)
      return new RotatingTextTester(element, words)
    },
    
    staggered: (selector: string, delay?: number) => {
      return new StaggeredAnimationTester(selector, delay)
    },
    
    keyframe: (selector: string) => {
      const element = containerElement.querySelector(selector)
      if (!element) throw new Error(`Element with selector "${selector}" not found`)
      return new KeyframeAnimationTester(element)
    },
    
    transition: (selector: string) => {
      const element = containerElement.querySelector(selector)
      if (!element) throw new Error(`Element with selector "${selector}" not found`)
      return new TransitionTester(element)
    }
  }
}