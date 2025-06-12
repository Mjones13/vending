/**
 * CSS Animation Property Mocking Utilities
 * 
 * These utilities provide mocked CSS animation properties to work around JSDOM's
 * lack of CSS animation support. Designed for tests that need to verify animation
 * state without relying on actual CSS execution.
 */

// Store original getComputedStyle for restoration
const originalGetComputedStyle = window.getComputedStyle;

// Animation property interface
export interface MockAnimationProperties {
  animationName: string;
  animationDuration: string;
  animationDelay: string;
  animationIterationCount: string;
  animationDirection: string;
  animationFillMode: string;
  animationPlayState: string;
  animationTimingFunction: string;
  // Transition properties
  transitionProperty?: string;
  transitionDuration?: string;
  transitionDelay?: string;
  transitionTimingFunction?: string;
  // Layout properties
  display?: string;
  position?: string;
  visibility?: string;
  opacity?: string;
  transform?: string;
  // Filter properties
  backdropFilter?: string;
  filter?: string;
}

// Default animation properties
const DEFAULT_ANIMATION_PROPERTIES: MockAnimationProperties = {
  animationName: 'none',
  animationDuration: '0s',
  animationDelay: '0s',
  animationIterationCount: '1',
  animationDirection: 'normal',
  animationFillMode: 'none',
  animationPlayState: 'running',
  animationTimingFunction: 'ease'
};

// Global mock registry for different elements/selectors
const mockRegistry = new Map<string, Partial<MockAnimationProperties>>();

/**
 * Mock CSS animation properties for specific elements or selectors
 */
export const mockAnimationProperties = (
  selector: string | Element,
  properties: Partial<MockAnimationProperties>
): void => {
  const key = typeof selector === 'string' ? selector : selector.tagName.toLowerCase();
  mockRegistry.set(key, { ...DEFAULT_ANIMATION_PROPERTIES, ...properties });
};

/**
 * Mock keyframe animations with specific names and properties
 */
export const mockKeyframeAnimations = (animations: Array<{
  name: string;
  duration?: string;
  delay?: string;
  iterationCount?: string;
  direction?: string;
  fillMode?: string;
  timingFunction?: string;
}>): void => {
  animations.forEach(animation => {
    mockRegistry.set(`keyframe-${animation.name}`, {
      animationName: animation.name,
      animationDuration: animation.duration || '1s',
      animationDelay: animation.delay || '0s',
      animationIterationCount: animation.iterationCount || '1',
      animationDirection: animation.direction || 'normal',
      animationFillMode: animation.fillMode || 'none',
      animationTimingFunction: animation.timingFunction || 'ease',
      animationPlayState: 'running'
    });
  });
};

/**
 * Enhanced getComputedStyle mock that returns animation properties
 */
const createMockedGetComputedStyle = () => {
  return function(element: Element, pseudoElement?: string | null): CSSStyleDeclaration {
    // Get the original computed style
    const originalStyle = originalGetComputedStyle.call(window, element, pseudoElement);
    
    // Create a mock style object that extends the original
    const mockStyle = {
      ...originalStyle,
      
      // Override animation properties with mocked values
      ...getMockedAnimationProperties(element),
      
      // Override getPropertyValue to handle animation properties
      getPropertyValue: function(property: string): string {
        const animationProps = getMockedAnimationProperties(element);
        
        // Handle animation properties
        if (property.startsWith('animation-') || property === 'animation') {
          const camelCase = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          if (camelCase in animationProps) {
            return (animationProps as any)[camelCase] || '';
          }
        }
        
        // Handle CSS custom properties (CSS variables)
        if (property.startsWith('--')) {
          return handleCSSVariable(property);
        }
        
        // Fall back to original implementation
        return originalStyle.getPropertyValue.call(originalStyle, property) || '';
      }
    };
    
    return mockStyle as CSSStyleDeclaration;
  };
};

/**
 * Get mocked animation properties for a specific element
 */
const getMockedAnimationProperties = (element: Element): Partial<MockAnimationProperties> => {
  // Check for exact element matches first
  for (const [key, properties] of mockRegistry.entries()) {
    if (element.matches && element.matches(key)) {
      return properties;
    }
  }
  
  // Check for tag name matches
  const tagName = element.tagName.toLowerCase();
  if (mockRegistry.has(tagName)) {
    return mockRegistry.get(tagName)!;
  }
  
  // Check for class-based matches
  for (const className of element.classList) {
    const classKey = `.${className}`;
    if (mockRegistry.has(classKey)) {
      return mockRegistry.get(classKey)!;
    }
    
    // Check for keyframe animations by class
    const keyframeKey = `keyframe-${className}`;
    if (mockRegistry.has(keyframeKey)) {
      return mockRegistry.get(keyframeKey)!;
    }
  }
  
  // Check for data attribute matches (commonly used in animations)
  const testId = element.getAttribute('data-testid');
  if (testId && mockRegistry.has(`[data-testid="${testId}"]`)) {
    return mockRegistry.get(`[data-testid="${testId}"]`)!;
  }
  
  // Return defaults
  return DEFAULT_ANIMATION_PROPERTIES;
};

/**
 * Handle CSS custom properties (variables)
 */
const handleCSSVariable = (property: string): string => {
  const cssVarMap: Record<string, string> = {
    '--animation-duration': '0.3s',
    '--animation-delay': '0s',
    '--animation-timing': 'ease-in-out',
    '--transition-duration': '0.3s',
    '--transition-timing': 'ease',
    // Add more CSS variables as needed
  };
  
  return cssVarMap[property] || '';
};

/**
 * Install the mocked getComputedStyle
 */
export const installAnimationPropertyMocks = (): void => {
  // Only install if not already installed
  if (window.getComputedStyle === originalGetComputedStyle) {
    window.getComputedStyle = createMockedGetComputedStyle();
  }
};

/**
 * Restore the original getComputedStyle
 */
export const restoreComputedStyle = (): void => {
  window.getComputedStyle = originalGetComputedStyle;
  mockRegistry.clear();
};

/**
 * Clear all mocked animation properties without restoring getComputedStyle
 */
export const clearAnimationMocks = (): void => {
  mockRegistry.clear();
};

/**
 * Get current mock registry (useful for debugging)
 */
export const getMockRegistry = (): Map<string, Partial<MockAnimationProperties>> => {
  return new Map(mockRegistry);
};

/**
 * Utility for testing if an element has a specific animation
 */
export const hasAnimationProperty = (
  element: Element,
  property: keyof MockAnimationProperties,
  expectedValue: string
): boolean => {
  const computedStyle = window.getComputedStyle(element);
  const actualValue = computedStyle.getPropertyValue(
    property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
  );
  return actualValue === expectedValue;
};

/**
 * Utility for testing animation state
 */
export const getAnimationState = (element: Element): {
  isAnimated: boolean;
  animationName: string;
  duration: string;
  playState: string;
  properties: Partial<MockAnimationProperties>;
} => {
  const computedStyle = window.getComputedStyle(element);
  const properties = getMockedAnimationProperties(element);
  
  return {
    isAnimated: properties.animationName !== 'none',
    animationName: properties.animationName || 'none',
    duration: properties.animationDuration || '0s',
    playState: properties.animationPlayState || 'running',
    properties
  };
};

/**
 * Utility for mocking common animation scenarios
 */
export const mockCommonAnimations = (): void => {
  // Rotating text animations
  mockAnimationProperties('.rotating-text', {
    animationName: 'textRotate',
    animationDuration: '3s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out'
  });
  
  mockAnimationProperties('.rotating-text-entering', {
    animationName: 'fadeInUp',
    animationDuration: '0.4s',
    animationFillMode: 'forwards'
  });
  
  mockAnimationProperties('.rotating-text-exiting', {
    animationName: 'fadeOutDown',
    animationDuration: '0.4s',
    animationFillMode: 'forwards'
  });
  
  // Logo stagger animations
  mockAnimationProperties('.logo-stagger', {
    animationName: 'fadeInScale',
    animationDuration: '0.6s',
    animationFillMode: 'forwards'
  });
  
  // Hover transitions
  mockAnimationProperties('.btn:hover', {
    animationName: 'buttonHover',
    animationDuration: '0.2s',
    animationFillMode: 'forwards'
  });
  
  // Hero background animations
  mockAnimationProperties('.hero-background', {
    animationName: 'parallaxMove',
    animationDuration: '20s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear'
  });
};

/**
 * Test helper for validating animation properties
 */
export const expectAnimationProperties = (
  element: Element,
  expectedProperties: Partial<MockAnimationProperties>
): void => {
  const actualState = getAnimationState(element);
  
  Object.entries(expectedProperties).forEach(([property, expectedValue]) => {
    const actualValue = actualState.properties[property as keyof MockAnimationProperties];
    if (actualValue !== expectedValue) {
      throw new Error(
        `Expected ${property} to be "${expectedValue}", but got "${actualValue}"`
      );
    }
  });
};

/**
 * Auto-installation setup for tests
 * Call this in jest.setup.js or test setup files
 */
export const setupAnimationMocking = (): void => {
  installAnimationPropertyMocks();
  mockCommonAnimations();
};

/**
 * Test-friendly cleanup function
 * Call this in afterEach blocks
 */
export const cleanupAnimationMocking = (): void => {
  clearAnimationMocks();
  // Re-install common animations for next test
  mockCommonAnimations();
};

// Export types for external use
export type { MockAnimationProperties };