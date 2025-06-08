import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { useRouter } from 'next/router'

// Mock the useRouter hook for testing
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  router?: Partial<ReturnType<typeof useRouter>>
}

/**
 * Custom render function that provides common test setup
 * @param ui - React component to render
 * @param options - Render options including router mock
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    router = {},
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Set up router mock with defaults
  const mockRouter = {
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
    ...router,
  }

  mockedUseRouter.mockReturnValue(mockRouter)

  return {
    ...render(ui, renderOptions),
    mockRouter,
  }
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithProviders as render }