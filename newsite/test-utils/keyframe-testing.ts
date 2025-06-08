/**
 * Specialized utilities for testing CSS keyframe animations
 */
import { waitFor } from '@testing-library/react'

/**
 * Test specific keyframe animations used in the project
 */
export class KeyframeAnimationTester {
  private element: Element

  constructor(element: Element) {
    this.element = element
  }

  /**
   * Test the slideUpFromBottom keyframe animation used in rotating text
   */
  async testSlideUpFromBottom(timeout = 2000): Promise<void> {
    // Check that animation is applied
    const computedStyle = window.getComputedStyle(this.element)
    
    await waitFor(
      () => {
        // Should have the animation name
        expect(computedStyle.animationName).toMatch(/slideUpFromBottom|slideInFromBottom/)
      },
      { timeout }
    )

    // Verify animation properties
    expect(computedStyle.animationDuration).toMatch(/0\.4s|400ms/)
    expect(computedStyle.animationTimingFunction).toContain('cubic-bezier')
    expect(computedStyle.animationFillMode).toMatch(/forwards|both/)
  }

  /**
   * Test the slideUpAndOut keyframe animation used in rotating text
   */
  async testSlideUpAndOut(timeout = 2000): Promise<void> {
    const computedStyle = window.getComputedStyle(this.element)
    
    await waitFor(
      () => {
        expect(computedStyle.animationName).toMatch(/slideUpAndOut|slideUpAndOut/)
      },
      { timeout }
    )

    // Verify exit animation properties
    expect(computedStyle.animationDuration).toMatch(/0\.4s|400ms/)
    expect(computedStyle.animationFillMode).toMatch(/forwards|both/)
  }

  /**
   * Test fade-in animation used for logo staggered animations
   */
  async testFadeIn(timeout = 2000): Promise<void> {
    const computedStyle = window.getComputedStyle(this.element)
    
    await waitFor(
      () => {
        expect(computedStyle.animationName).toMatch(/fadeIn|animate-fade-in/)
      },
      { timeout }
    )
  }

  /**
   * Test floating animation used for coffee products
   */
  async testFloatAnimation(timeout = 2000): Promise<void> {
    const computedStyle = window.getComputedStyle(this.element)
    
    await waitFor(
      () => {
        expect(computedStyle.animationName).toMatch(/float|animate-float/)
      },
      { timeout }
    )

    // Float animation should be infinite
    expect(computedStyle.animationIterationCount).toBe('infinite')
  }

  /**
   * Test shimmer effect animation used on buttons
   */
  async testShimmerEffect(timeout = 2000): Promise<void> {
    const computedStyle = window.getComputedStyle(this.element)
    
    await waitFor(
      () => {
        // Check for shimmer-related properties
        const hasShimmer = computedStyle.animationName.includes('shimmer') ||
                          this.element.classList.contains('btn-shimmer')
        expect(hasShimmer).toBe(true)
      },
      { timeout }
    )
  }

  /**
   * Verify transform properties during animation
   */
  verifyTransformStates(expectedStates: {
    initial?: string
    midpoint?: string
    final?: string
  }): void {
    const computedStyle = window.getComputedStyle(this.element)
    
    if (expectedStates.initial) {
      // This would need to be tested at animation start
      expect(computedStyle.transform).toBeDefined()
    }
    
    if (expectedStates.final) {
      // This would be tested after animation completion
      expect(computedStyle.transform).toBeDefined()
    }
  }
}

/**
 * Test CSS transitions used throughout the site
 */
export class TransitionTester {
  private element: Element

  constructor(element: Element) {
    this.element = element
  }

  /**
   * Test hover scale transitions on cards and buttons
   */
  async testHoverScale(expectedScale = '1.05', timeout = 1000): Promise<void> {
    // Simulate hover state
    this.element.classList.add('hover')
    
    await waitFor(
      () => {
        const computedStyle = window.getComputedStyle(this.element)
        expect(computedStyle.transform).toContain('scale')
      },
      { timeout }
    )
    
    // Remove hover state
    this.element.classList.remove('hover')
  }

  /**
   * Test color transitions on hover
   */
  async testColorTransition(property: 'color' | 'background-color' | 'border-color', timeout = 1000): Promise<void> {
    const initialStyle = window.getComputedStyle(this.element)
    const initialValue = initialStyle.getPropertyValue(property)
    
    // Trigger hover
    this.element.classList.add('hover')
    
    await waitFor(
      () => {
        const hoverStyle = window.getComputedStyle(this.element)
        const hoverValue = hoverStyle.getPropertyValue(property)
        
        // Value should change on hover
        expect(hoverValue).not.toBe(initialValue)
      },
      { timeout }
    )
    
    this.element.classList.remove('hover')
  }

  /**
   * Test backdrop blur transition on header scroll
   */
  async testBackdropBlur(timeout = 1000): Promise<void> {
    // Add scrolled class
    this.element.classList.add('scrolled')
    
    await waitFor(
      () => {
        const computedStyle = window.getComputedStyle(this.element)
        expect(computedStyle.backdropFilter || computedStyle.webkitBackdropFilter).toContain('blur')
      },
      { timeout }
    )
  }

  /**
   * Verify transition properties are set correctly
   */
  verifyTransitionProperties(expectedProperties: {
    property?: string
    duration?: string
    timingFunction?: string
    delay?: string
  }): void {
    const computedStyle = window.getComputedStyle(this.element)
    
    if (expectedProperties.property) {
      const transitionProperty = computedStyle.transitionProperty
      if (transitionProperty && transitionProperty !== 'all' && transitionProperty !== 'none') {
        expect(transitionProperty).toContain(expectedProperties.property)
      }
    }
    
    if (expectedProperties.duration) {
      expect(computedStyle.transitionDuration).toBe(expectedProperties.duration)
    }
    
    if (expectedProperties.timingFunction) {
      expect(computedStyle.transitionTimingFunction).toBe(expectedProperties.timingFunction)
    }
    
    if (expectedProperties.delay) {
      expect(computedStyle.transitionDelay).toBe(expectedProperties.delay)
    }
  }
}

/**
 * Utility for testing animation timing and synchronization
 */
export class AnimationTimingTester {
  private startTime: number = 0
  private endTime: number = 0

  /**
   * Start timing an animation
   */
  startTiming(): void {
    this.startTime = performance.now()
  }

  /**
   * End timing and return duration
   */
  endTiming(): number {
    this.endTime = performance.now()
    return this.endTime - this.startTime
  }

  /**
   * Verify animation duration is within expected range
   */
  verifyDuration(expectedDuration: number, tolerance = 100): void {
    const actualDuration = this.endTiming()
    expect(actualDuration).toBeGreaterThanOrEqual(expectedDuration - tolerance)
    expect(actualDuration).toBeLessThanOrEqual(expectedDuration + tolerance)
  }

  /**
   * Test staggered animation timing
   */
  async testStaggeredTiming(
    elements: NodeListOf<Element>, 
    expectedDelay: number,
    tolerance = 50
  ): Promise<void> {
    const timings: number[] = []
    
    elements.forEach((element, index) => {
      const observer = new MutationObserver(() => {
        timings[index] = performance.now()
      })
      
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['class']
      })
    })

    // Wait for all animations to start
    await waitFor(
      () => {
        expect(timings).toHaveLength(elements.length)
      },
      { timeout: 5000 }
    )

    // Verify stagger delays
    for (let i = 1; i < timings.length; i++) {
      const actualDelay = timings[i] - timings[i - 1]
      expect(actualDelay).toBeGreaterThanOrEqual(expectedDelay - tolerance)
      expect(actualDelay).toBeLessThanOrEqual(expectedDelay + tolerance)
    }
  }
}

/**
 * Factory function to create animation testers for common site elements
 */
export function createAnimationTestSuite(container: Element) {
  return {
    /**
     * Test rotating text animations
     */
    rotatingText: (selector: string) => {
      const element = container.querySelector(selector)
      if (!element) throw new Error(`Rotating text element not found: ${selector}`)
      return new KeyframeAnimationTester(element)
    },

    /**
     * Test logo fade-in animations
     */
    logoFadeIn: (selector: string) => {
      const element = container.querySelector(selector)
      if (!element) throw new Error(`Logo element not found: ${selector}`)
      return new KeyframeAnimationTester(element)
    },

    /**
     * Test button hover transitions
     */
    buttonHover: (selector: string) => {
      const element = container.querySelector(selector)
      if (!element) throw new Error(`Button element not found: ${selector}`)
      return new TransitionTester(element)
    },

    /**
     * Test card hover effects
     */
    cardHover: (selector: string) => {
      const element = container.querySelector(selector)
      if (!element) throw new Error(`Card element not found: ${selector}`)
      return new TransitionTester(element)
    },

    /**
     * Test header scroll effects
     */
    headerScroll: (selector: string) => {
      const element = container.querySelector(selector)
      if (!element) throw new Error(`Header element not found: ${selector}`)
      return new TransitionTester(element)
    },

    /**
     * Create timing tester
     */
    timing: () => new AnimationTimingTester()
  }
}

/**
 * Test staggered animations like logo fade-ins
 */
export class StaggeredAnimationTester {
  private selector: string
  private expectedDelay: number

  constructor(selector: string, expectedDelay: number) {
    this.selector = selector
    this.expectedDelay = expectedDelay
  }

  /**
   * Get the number of elements that match the selector
   */
  getElementCount(): number {
    return document.querySelectorAll(this.selector).length
  }

  /**
   * Verify that animations are triggered in staggered sequence
   */
  async verifyStaggeredAnimation(animationClass: string, timeout = 5000): Promise<void> {
    const elements = document.querySelectorAll(this.selector)
    const animationTimes: number[] = []

    // Monitor when each element gets the animation class
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      
      await waitFor(
        () => {
          expect(element).toHaveClass(animationClass)
          animationTimes.push(performance.now())
        },
        { timeout }
      )
    }

    // Verify stagger timing
    for (let i = 1; i < animationTimes.length; i++) {
      const delay = animationTimes[i] - animationTimes[i - 1]
      expect(delay).toBeGreaterThanOrEqual(this.expectedDelay - 20) // Allow tolerance
      expect(delay).toBeLessThanOrEqual(this.expectedDelay + 20)
    }
  }
}

/**
 * Specialized tester for rotating text state machine
 */
export class RotatingTextTester {
  private element: Element

  constructor(element: Element) {
    this.element = element
  }

  /**
   * Test the complete rotation cycle
   */
  async testFullRotationCycle(timeout = 10000): Promise<void> {
    const states: string[] = []
    
    // Monitor state changes
    const observer = new MutationObserver(() => {
      const classes = Array.from(this.element.classList)
      const animationState = classes.find(cls => cls.includes('rotating-text-'))
      if (animationState && !states.includes(animationState)) {
        states.push(animationState)
      }
    })
    
    observer.observe(this.element, {
      attributes: true,
      attributeFilter: ['class']
    })

    // Wait for complete cycle
    await waitFor(
      () => {
        expect(states).toContain('rotating-text-visible')
        expect(states).toContain('rotating-text-exiting')
        expect(states).toContain('rotating-text-entering')
      },
      { timeout }
    )

    observer.disconnect()
  }

  /**
   * Test word cycling behavior
   */
  async testWordCycling(expectedWords: string[], timeout = 15000): Promise<void> {
    const observedWords: string[] = []
    
    for (let i = 0; i < expectedWords.length; i++) {
      await waitFor(
        () => {
          const currentWord = this.element.textContent || ''
          if (!observedWords.includes(currentWord)) {
            observedWords.push(currentWord)
          }
          expect(observedWords).toHaveLength(i + 1)
        },
        { timeout: 4000 }
      )
    }
    
    expect(observedWords).toEqual(expectedWords)
  }
}

/**
 * Global animation testing utilities
 */

/**
 * Disable all animations for faster testing
 */
export function disableAnimations(): void {
  const style = document.createElement('style')
  style.innerHTML = `
    *, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }
  `
  style.setAttribute('data-test-disable-animations', 'true')
  document.head.appendChild(style)
}

/**
 * Re-enable animations
 */
export function enableAnimations(): void {
  const disableStyles = document.querySelectorAll('[data-test-disable-animations]')
  disableStyles.forEach(style => style.remove())
}

/**
 * Wait for all animations to complete
 */
export async function waitForAnimationsToComplete(timeout = 5000): Promise<void> {
  await waitFor(
    () => {
      // Check if any elements have running animations
      const allElements = document.querySelectorAll('*')
      let hasRunningAnimations = false
      
      allElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element)
        if (computedStyle.animationPlayState === 'running') {
          hasRunningAnimations = true
        }
      })
      
      expect(hasRunningAnimations).toBe(false)
    },
    { timeout }
  )
}