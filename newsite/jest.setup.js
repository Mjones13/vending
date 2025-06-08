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

// Global RAF mocks - define once at module level
let rafId = 0
const rafCallbacks = new Map()

global.requestAnimationFrame = jest.fn((callback) => {
  const id = ++rafId
  rafCallbacks.set(id, callback)
  // Execute immediately for testing
  setTimeout(() => {
    if (rafCallbacks.has(id)) {
      callback(performance.now())
      rafCallbacks.delete(id)
    }
  }, 0)
  return id
})

global.cancelAnimationFrame = jest.fn((id) => {
  rafCallbacks.delete(id)
})

// Mock performance.now() globally
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    ...global.performance,
    now: jest.fn(() => Date.now()),
  }
})

// Test isolation and cleanup
beforeEach(() => {
  // Clear RAF callbacks
  rafCallbacks.clear()
  rafId = 0
  
  // Mock Canvas API for text measurement tests
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    measureText: jest.fn(() => ({
      actualBoundingBoxAscent: 20,
      actualBoundingBoxDescent: 5,
      width: 100
    })),
    font: '',
  }))
  
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
  
  // Clear RAF callbacks
  rafCallbacks.clear()
  
  // Final mock cleanup
  jest.restoreAllMocks()
})