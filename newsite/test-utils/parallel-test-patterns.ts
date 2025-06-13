/**
 * Parallel-Safe Test Patterns
 * Pre-built patterns for common parallel-safe testing scenarios
 */

import * as React from 'react'
import { RenderResult } from '@testing-library/react'
import { 
  TestIsolation, 
  useTestIsolation, 
  useAnimationTestIsolation,
  createIsolatedMock,
  createIsolatedTestStorage
} from './parallel-isolation'
import { render } from './render'

/**
 * Creates a parallel-safe test suite with automatic isolation
 */
export function createParallelSafeTest(suiteName: string, testFn: (isolation: TestIsolation) => void) {
  describe(suiteName, () => {
    const { getIsolation } = useTestIsolation()
    
    testFn(getIsolation())
  })
}

/**
 * Creates a parallel-safe component test with isolated rendering
 */
export function createIsolatedComponentTest<T extends Record<string, any>>(
  componentName: string,
  component: (props: T) => React.ReactElement,
  defaultProps: T
) {
  return {
    describe: (testName: string, testFn: (helpers: ComponentTestHelpers<T>) => void) => {
      describe(`${componentName} - ${testName}`, () => {
        const { getIsolation, createTestData } = useTestIsolation()
        
        const helpers: ComponentTestHelpers<T> = {
          renderComponent: (props?: Partial<T>) => {
            const testProps = createTestData(() => ({ ...defaultProps, ...props }))
            return render(component(testProps))
          },
          
          createMockProps: (overrides?: Partial<T>) => {
            return createTestData(() => ({ ...defaultProps, ...overrides }))
          },
          
          getTestId: () => getIsolation().getTestId(),
          
          createMock: <F extends (...args: any[]) => any>(impl?: F) => createIsolatedMock(impl),
        }
        
        testFn(helpers)
      })
    }
  }
}

interface ComponentTestHelpers<T> {
  renderComponent: (props?: Partial<T>) => RenderResult
  createMockProps: (overrides?: Partial<T>) => T
  getTestId: () => string
  createMock: <F extends (...args: any[]) => any>(impl?: F) => jest.MockedFunction<F>
}

/**
 * Creates a parallel-safe animation test with timing isolation
 */
export function createParallelAnimationTest(
  animationName: string, 
  testFn: (helpers: AnimationTestHelpers) => void
) {
  describe(`${animationName} Animation`, () => {
    const { getIsolation } = useTestIsolation()
    const { advanceTime, waitForFrame } = useAnimationTestIsolation()
    
    const helpers: AnimationTestHelpers = {
      advanceTime,
      waitForFrame,
      getTestId: () => getIsolation().getTestId(),
      createMock: <F extends (...args: any[]) => any>(impl?: F) => createIsolatedMock(impl),
      createStorage: <T = any>() => createIsolatedTestStorage<T>(),
    }
    
    testFn(helpers)
  })
}

interface AnimationTestHelpers {
  advanceTime: (ms: number) => void
  waitForFrame: () => Promise<unknown>
  getTestId: () => string
  createMock: <F extends (...args: any[]) => any>(impl?: F) => jest.MockedFunction<F>
  createStorage: <T = any>() => {
    testId: string
    get: (key: string) => T | undefined
    set: (key: string, value: T) => void
    delete: (key: string) => boolean
    clear: () => void
    has: (key: string) => boolean
    size: () => number
  }
}

/**
 * Parallel-safe page test pattern
 */
export function createParallelPageTest(
  pageName: string,
  pageComponent: () => React.ReactElement
) {
  return {
    describe: (testName: string, testFn: (helpers: PageTestHelpers) => void) => {
      describe(`${pageName} Page - ${testName}`, () => {
        const { getIsolation, createTestData } = useTestIsolation()
        
        const helpers: PageTestHelpers = {
          renderPage: () => render(pageComponent()),
          
          createTestData: <T>(factory: () => T) => createTestData(factory),
          
          getTestId: () => getIsolation().getTestId(),
          
          createMock: <F extends (...args: any[]) => any>(impl?: F) => createIsolatedMock(impl),
          
          mockRouter: (routerProps?: Record<string, any>) => {
            return createIsolatedMock(() => ({
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
              ...routerProps,
            }))
          }
        }
        
        testFn(helpers)
      })
    }
  }
}

interface PageTestHelpers {
  renderPage: () => RenderResult
  createTestData: <T>(factory: () => T) => T
  getTestId: () => string
  createMock: <F extends (...args: any[]) => any>(impl?: F) => jest.MockedFunction<F>
  mockRouter: (routerProps?: Record<string, any>) => jest.MockedFunction<any>
}

/**
 * Parallel-safe E2E test pattern (for Playwright integration)
 */
export function createParallelE2ETest(
  testName: string,
  testFn: (helpers: E2ETestHelpers) => void
) {
  const testId = `e2e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const helpers: E2ETestHelpers = {
    getTestId: () => testId,
    
    createTestData: <T>(factory: () => T) => factory(),
    
    getUniqueSelector: (baseSelector: string) => `${baseSelector}[data-test-id="${testId}"]`,
    
    addTestMarker: (element: any) => {
      if (element && typeof element.setAttribute === 'function') {
        element.setAttribute('data-test-id', testId)
      }
      return element
    }
  }
  
  describe(`E2E - ${testName}`, () => {
    testFn(helpers)
  })
}

interface E2ETestHelpers {
  getTestId: () => string
  createTestData: <T>(factory: () => T) => T
  getUniqueSelector: (baseSelector: string) => string
  addTestMarker: (element: any) => any
}

/**
 * Utility to create parallel-safe test data factories
 */
export function createTestDataFactory<T>(defaultData: T) {
  return {
    create: (overrides?: Partial<T>): T => {
      return { ...defaultData, ...overrides }
    },
    
    createMany: (count: number, overrides?: Partial<T>): T[] => {
      return Array.from({ length: count }, (_, index) => ({
        ...defaultData,
        ...overrides,
        id: `${defaultData.id || 'item'}_${index}_${Date.now()}`,
      }))
    },
    
    createUnique: (overrides?: Partial<T>): T => {
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return {
        ...defaultData,
        ...overrides,
        id: uniqueId,
      }
    }
  }
}

/**
 * Creates parallel-safe mock API responses
 */
export function createMockAPIFactory<T>(baseResponse: T) {
  return {
    success: (data?: Partial<T>) => ({
      ...baseResponse,
      ...data,
      success: true,
      timestamp: Date.now(),
    }),
    
    error: (error: string) => ({
      success: false,
      error,
      timestamp: Date.now(),
    }),
    
    loading: () => ({
      loading: true,
      timestamp: Date.now(),
    })
  }
}