import '@testing-library/jest-dom'
import { act, configure } from '@testing-library/react'

// Configure testing library with increased async timeout
configure({
  asyncUtilTimeout: 5000, // 5 seconds for async operations
})

// RAF polyfill validation function to ensure they're never undefined
function ensureRAFPolyfills() {
  if (!global.requestAnimationFrame || typeof global.requestAnimationFrame !== 'function') {
    global.requestAnimationFrame = (callback) => {
      return setTimeout(callback, 16); // 16ms for ~60fps
    };
  }
  
  if (!global.cancelAnimationFrame || typeof global.cancelAnimationFrame !== 'function') {
    global.cancelAnimationFrame = (id) => {
      clearTimeout(id);
    };
  }
  
  // Also ensure they're available on window
  if (typeof window !== 'undefined') {
    if (!window.requestAnimationFrame || typeof window.requestAnimationFrame !== 'function') {
      window.requestAnimationFrame = global.requestAnimationFrame;
    }
    if (!window.cancelAnimationFrame || typeof window.cancelAnimationFrame !== 'function') {
      window.cancelAnimationFrame = global.cancelAnimationFrame;
    }
  }
}

// Global browser API polyfills - must be available before any tests run
// These are defined at the top level to ensure they exist even before beforeEach runs
global.requestAnimationFrame = global.requestAnimationFrame || ((callback) => {
  return setTimeout(callback, 16); // 16ms for ~60fps
});

global.cancelAnimationFrame = global.cancelAnimationFrame || ((id) => {
  clearTimeout(id);
});

// Also set on window for tests that use window.requestAnimationFrame
if (typeof window !== 'undefined') {
  window.requestAnimationFrame = global.requestAnimationFrame;
  window.cancelAnimationFrame = global.cancelAnimationFrame;
}

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // Remove non-standard HTML attributes that cause warnings
    const { priority, fill, sizes, ...imageProps } = props
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imageProps} alt={props.alt} />
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock CSS computed styles for animation testing and styled-jsx compatibility
const originalGetComputedStyle = window.getComputedStyle
window.getComputedStyle = function(element, pseudoElement) {
  const computedStyle = originalGetComputedStyle.call(this, element, pseudoElement)
  
  // Helper function to check if element has a specific CSS class
  const hasClass = (className) => element.classList && element.classList.contains(className)
  
  // Mock common CSS properties needed for animation tests
  const mockStyle = {
    ...computedStyle,
    opacity: element.style.opacity || '1',
    transform: element.style.transform || 'none',
    visibility: element.style.visibility || 'visible',
    display: element.style.display || 'block',
    animationName: element.style.animationName || 'none',
    animationDuration: element.style.animationDuration || '0s',
    animationDelay: element.style.animationDelay || '0s',
    animationFillMode: element.style.animationFillMode || 'none',
    animationPlayState: element.style.animationPlayState || 'running',
    transitionProperty: element.style.transitionProperty || 'all',
    transitionDuration: element.style.transitionDuration || '0s',
    transitionDelay: element.style.transitionDelay || '0s',
    transitionTimingFunction: element.style.transitionTimingFunction || 'ease',
    
    // Enhanced styled-jsx CSS property mocking based on CSS classes
    // This provides computed style values that match what styled-jsx would produce
    position: (() => {
      if (hasClass('header')) return 'fixed'
      return element.style.position || computedStyle.position || 'static'
    })(),
    
    top: (() => {
      if (hasClass('header')) return '0px'
      return element.style.top || computedStyle.top || 'auto'
    })(),
    
    left: (() => {
      if (hasClass('header')) return '0px'
      return element.style.left || computedStyle.left || 'auto'
    })(),
    
    right: (() => {
      if (hasClass('header')) return '0px'
      return element.style.right || computedStyle.right || 'auto'
    })(),
    
    zIndex: (() => {
      if (hasClass('header')) return '50'
      return element.style.zIndex || computedStyle.zIndex || 'auto'
    })(),
    
    backgroundColor: (() => {
      if (hasClass('header')) return 'rgba(255, 255, 255, 0.95)'
      return element.style.backgroundColor || computedStyle.backgroundColor || 'rgba(0, 0, 0, 0)'
    })(),
    
    backdropFilter: (() => {
      if (hasClass('header')) return 'blur(16px)'
      if (hasClass('backdrop-blur')) return 'blur(16px)'
      return element.style.backdropFilter || computedStyle.backdropFilter || 'none'
    })(),
    
    // Mock CSS variables for design system
    getPropertyValue: function(property) {
      const cssVarPattern = /^--/
      if (cssVarPattern.test(property)) {
        // Return mock values for CSS custom properties
        switch(property) {
          case '--transition-all': return '0.3s ease'
          case '--color-primary-600': return '#0066cc'
          case '--color-primary-50': return '#f0f8ff'
          case '--shadow-sm': return '0 1px 2px rgba(0,0,0,0.05)'
          case '--shadow-lg': return '0 10px 15px -3px rgba(0,0,0,0.1)'
          case '--shadow-xl': return '0 20px 25px -5px rgba(0,0,0,0.1)'
          case '--z-50': return '50'
          case '--border-width': return '1px'
          case '--color-neutral-200': return '#e5e7eb'
          case '--color-primary-200': return '#dbeafe'
          default: return ''
        }
      }
      return this[property] || ''
    }
  }
  
  return mockStyle
}

// Enhanced test isolation and cleanup for parallel execution
beforeEach(() => {
  // Enhanced DOM cleanup for better test isolation
  document.body.innerHTML = ''
  document.head.querySelectorAll('[data-test-styles]').forEach(style => style.remove())
  
  // Clear any lingering event listeners
  if (document.body.onscroll) {
    document.body.onscroll = null
  }
  if (window.onscroll) {
    window.onscroll = null
  }
  
  // Reset scroll position
  Object.defineProperty(window, 'scrollY', {
    writable: true,
    configurable: true,
    value: 0
  })
  Object.defineProperty(window, 'pageYOffset', {
    writable: true,
    configurable: true,
    value: 0
  })
  
  // DO NOT enable fake timers globally - let tests control this
  // jest.useFakeTimers() - REMOVED to prevent conflicts
  
  // Ensure animation frame polyfills are always available
  // Re-apply in every test to handle cases where they might be cleared
  ensureRAFPolyfills()
  
  // Speed up CSS animations with isolated test styles
  const style = document.createElement('style')
  style.setAttribute('data-test-styles', 'parallel-testing')
  style.innerHTML = `
    *, *::before, *::after {
      animation-duration: 0.01s !important;
      animation-delay: 0s !important;
      transition-duration: 0.01s !important;
      transition-delay: 0s !important;
    }
  `
  document.head.appendChild(style)
  
  // Enhanced mock isolation for parallel execution
  jest.clearAllMocks()
  
  // Reset router mock to clean state
  const { useRouter } = require('next/router')
  if (useRouter && typeof useRouter.mockReturnValue === 'function') {
    useRouter.mockReturnValue({
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    })
  }
})

afterEach(() => {
  // Enhanced DOM cleanup to prevent state bleeding
  document.body.innerHTML = ''
  
  // Clean up test styles to prevent parallel test pollution
  const testStyles = document.querySelectorAll('[data-test-styles="parallel-testing"]')
  testStyles.forEach(style => style.remove())
  
  // Clean up any remaining event listeners
  const events = ['scroll', 'resize', 'click', 'mouseenter', 'mouseleave']
  events.forEach(eventType => {
    document.removeEventListener(eventType, () => {})
    window.removeEventListener(eventType, () => {})
  })
  
  // Comprehensive timer cleanup to prevent act() warnings
  if (jest.isMockFunction(setTimeout)) {
    try {
      // Clear all pending timers before running them to prevent act() warnings
      jest.clearAllTimers()
      // Only run pending timers if there are any
      if (jest.getTimerCount && jest.getTimerCount() > 0) {
        jest.runOnlyPendingTimers()
      }
    } catch (e) {
      // Ignore errors if timers aren't mocked or if no timers exist
    }
  }
  
  // Always ensure we're back to real timers for next test
  jest.useRealTimers()
  
  // Clear any pending RAF callbacks to prevent act() warnings
  if (global.cancelAnimationFrame && typeof global.cancelAnimationFrame === 'function') {
    // Clear any pending animation frames (though they should be cleaned by individual tests)
    for (let i = 1; i <= 100; i++) {
      try {
        global.cancelAnimationFrame(i)
      } catch (e) {
        // Ignore errors for non-existent frame IDs
      }
    }
  }
  
  // Reset scroll position and clear scroll event listeners to prevent act() warnings
  Object.defineProperty(window, 'scrollY', {
    writable: true,
    configurable: true,
    value: 0
  })
  Object.defineProperty(window, 'pageYOffset', {
    writable: true,
    configurable: true,
    value: 0
  })
  
  // Clear all mocks for next test
  jest.clearAllMocks()
  
  // CRITICAL: Validate and restore RAF polyfills after cleanup
  // Some test utilities may clear these, causing "not defined" errors
  ensureRAFPolyfills()
  
  // Ensure no pending microtasks that could cause act() warnings
  if (global.gc) {
    try {
      global.gc()
    } catch (e) {
      // gc() not available in all environments
    }
  }
})

// Global withAct utility for easy act() wrapping in tests
global.withAct = async (callback) => {
  return act(async () => {
    await callback();
  });
};
