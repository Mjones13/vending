import React from 'react'
import type { ReactElement } from 'react'
import { render, RenderOptions, waitFor, screen } from '@testing-library/react'
import { useRouter } from 'next/router'

// Mock the useRouter hook for testing
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  router?: Partial<ReturnType<typeof useRouter>>
  verifyMount?: boolean
  mountTimeout?: number
}

/**
 * Verifies that a component has mounted correctly and is not an empty div
 * @param container - The container element from render result
 * @param timeout - Timeout for waiting for mount (default: 5000ms)
 */
export async function verifyComponentMounted(
  container: HTMLElement,
  timeout: number = 5000
): Promise<void> {
  await waitFor(() => {
    // Check that container is not an empty div
    expect(container.innerHTML).not.toBe('<div></div>')
    expect(container.innerHTML).not.toBe('<div />')
    expect(container.innerHTML).not.toBe('')
  }, { timeout })
}

/**
 * Verifies that Layout component has mounted correctly with navigation
 * @param timeout - Timeout for waiting for mount (default: 5000ms)
 */
export async function verifyLayoutMounted(timeout: number = 5000): Promise<void> {
  await waitFor(() => {
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  }, { timeout })
}

/**
 * Enhanced render function with component mounting verification
 * @param ui - React component to render
 * @param options - Render options including router mock and mount verification
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    router = {},
    verifyMount = false,
    mountTimeout = 5000,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Clear DOM state before rendering
  document.body.innerHTML = ''
  
  // Set up router mock with defaults
  const mockRouter = {
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    basePath: '',
    locale: undefined,
    locales: undefined,
    defaultLocale: undefined,
    isReady: true,
    isPreview: false,
    isLocaleDomain: false,
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    ...router,
  }

  mockedUseRouter.mockReturnValue(mockRouter)

  const result = render(ui, renderOptions)

  // Optionally verify component mounted correctly
  if (verifyMount) {
    verifyComponentMounted(result.container, mountTimeout)
  }

  return {
    ...result,
    mockRouter,
    verifyComponentMounted: (timeout?: number) => verifyComponentMounted(result.container, timeout),
    verifyLayoutMounted: (timeout?: number) => verifyLayoutMounted(timeout),
  }
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithProviders as render }