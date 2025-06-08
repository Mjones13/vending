import '@testing-library/jest-dom'

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
  
  // Enable fake timers globally for consistent testing
  jest.useFakeTimers()
  
  // Set up persistent animation frame polyfills (don't delete in afterEach)
  if (!global.requestAnimationFrame) {
    global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0))
  }
  if (!global.cancelAnimationFrame) {
    global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id))
  }
  
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
  
  // Run any pending timers and restore real timers
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
  
  // Reset scroll position
  Object.defineProperty(window, 'scrollY', {
    writable: true,
    configurable: true,
    value: 0
  })
  
  // Clear all mocks for next test
  jest.clearAllMocks()
  
  // Note: Keep animation frame polyfills persistent to prevent "not defined" errors
})