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

// Test isolation and cleanup
beforeEach(() => {
  // Enable fake timers globally for consistent testing
  jest.useFakeTimers()
  
  // Mock requestAnimationFrame for consistent animation testing
  global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0))
  global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id))
  
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
  jest.resetAllMocks()
})

afterEach(() => {
  // Clean up test styles to prevent parallel test pollution
  const testStyles = document.querySelectorAll('[data-test-styles="parallel-testing"]')
  testStyles.forEach(style => style.remove())
  
  // Run any pending timers and restore real timers
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
  
  // Restore original animation frame functions
  delete global.requestAnimationFrame
  delete global.cancelAnimationFrame
  
  // Final mock cleanup
  jest.restoreAllMocks()
})