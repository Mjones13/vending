# Testing Guide for Golden Coast Amenities Website

## Overview

This project uses a comprehensive automated testing framework designed to ensure reliability, maintainability, and quality across all website features. The testing framework follows Test-Driven Development (TDD) principles and covers unit tests, component tests, animation testing, and end-to-end testing.

## Testing Stack

### Core Technologies
- **Jest**: JavaScript testing framework for unit and component tests
- **React Testing Library**: Component testing utilities focused on user interactions
- **Playwright**: End-to-end testing framework for cross-browser testing
- **@testing-library/jest-dom**: Extended DOM matchers for Jest

### Test Types
1. **Unit Tests**: Individual function and utility testing
2. **Component Tests**: React component behavior and rendering
3. **Animation Tests**: CSS animations, transitions, and timing
4. **E2E Tests**: Complete user workflows across browsers
5. **Accessibility Tests**: Screen reader, keyboard navigation, ARIA compliance
6. **Performance Tests**: Page load times, resource optimization

## Project Structure

```
newsite/
├── __tests__/
│   ├── components/         # Component unit tests
│   ├── pages/             # Page integration tests  
│   ├── animations/        # Animation-specific tests
│   ├── utils/            # Utility function tests
│   └── e2e/              # End-to-end tests
├── test-utils/
│   ├── render.tsx        # Custom render with providers
│   ├── animation-testing.ts # Animation testing utilities
│   ├── keyframe-testing.ts  # CSS keyframe testing
│   ├── component-helpers.ts # Component testing helpers
│   ├── e2e-helpers.ts    # E2E testing helpers
│   └── mock-data.ts      # Test data and mocks
├── jest.config.js        # Jest configuration
├── jest.setup.js         # Jest setup and global mocks
└── playwright.config.ts  # Playwright configuration
```

## Testing Commands

```bash
# Run all unit and component tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run all tests (unit + E2E)
npm run test:all
```

## Test-Driven Development Workflow

### 1. Write Failing Tests First
Before implementing any feature or fix:

```typescript
// Example: Writing a failing test for new functionality
describe('New Feature Component', () => {
  it('should display expected behavior', () => {
    // Test the expected behavior before implementing
    const result = newFeatureFunction('input')
    expect(result).toBe('expected-output')
  })
})
```

### 2. Implement Code to Pass Tests
Only after writing failing tests, implement the minimal code to make tests pass.

### 3. Refactor and Verify
Refactor implementation while ensuring all tests continue to pass.

### 4. Integration Testing
Add E2E tests to verify the feature works in real browser environment.

## Component Testing Patterns

### Basic Component Test
```typescript
import { render, screen } from '../test-utils/render'
import ComponentName from '../components/ComponentName'

describe('ComponentName', () => {
  it('renders correctly with props', () => {
    render(<ComponentName title="Test Title" />)
    
    expect(screen.getByRole('heading')).toHaveTextContent('Test Title')
    expect(screen.getByRole('heading')).toBeVisible()
  })
})
```

### Testing User Interactions
```typescript
import { render, screen, fireEvent } from '../test-utils/render'
import userEvent from '@testing-library/user-event'

describe('Interactive Component', () => {
  it('handles user clicks', async () => {
    const user = userEvent.setup()
    const mockHandler = jest.fn()
    
    render(<Button onClick={mockHandler}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(mockHandler).toHaveBeenCalledTimes(1)
  })
})
```

### Testing with Custom Hooks
```typescript
import { renderHook, act } from '@testing-library/react'
import { useCustomHook } from '../hooks/useCustomHook'

describe('useCustomHook', () => {
  it('returns expected state', () => {
    const { result } = renderHook(() => useCustomHook())
    
    expect(result.current.isLoading).toBe(false)
    
    act(() => {
      result.current.startLoading()
    })
    
    expect(result.current.isLoading).toBe(true)
  })
})
```

## Animation Testing Patterns

### Testing CSS Animations
```typescript
import { RotatingTextTester } from '../test-utils/animation-testing'

describe('Rotating Text Animation', () => {
  it('cycles through words correctly', async () => {
    render(<RotatingTextComponent words={['Word1', 'Word2']} />)
    
    const tester = new RotatingTextTester('.rotating-text', ['Word1', 'Word2'])
    await tester.waitForCompleteCycle()
    
    expect(tester.getCurrentWord()).toBe('Word1')
  })
})
```

### Testing Keyframe Animations
```typescript
import { KeyframeAnimationTester } from '../test-utils/keyframe-testing'

describe('CSS Keyframe Animations', () => {
  it('applies fade-in animation correctly', async () => {
    render(<AnimatedComponent />)
    
    const tester = new KeyframeAnimationTester('.animated-element')
    await tester.testFadeIn()
    
    // Verify animation properties
    expect(tester.getAnimationDuration()).toBe('0.5s')
  })
})
```

## E2E Testing Patterns

### Page Navigation Testing
```typescript
import { test, expect } from '@playwright/test'
import { createE2EHelpers } from '../test-utils/e2e-helpers'

test('navigates between pages correctly', async ({ page }) => {
  const helpers = createE2EHelpers(page)
  
  await helpers.navigation.goToHomepage()
  await helpers.navigation.clickNavigationLink('Contact')
  await helpers.navigation.verifyCurrentURL('/contact')
})
```

### Responsive Design Testing
```typescript
test('works on mobile devices', async ({ page }) => {
  const helpers = createE2EHelpers(page)
  
  await helpers.responsive.setMobileViewport()
  await helpers.navigation.goToHomepage()
  await helpers.responsive.verifyMobileMenuVisible()
})
```

### Animation Testing in E2E
```typescript
test('rotating text animation works', async ({ page }) => {
  const helpers = createE2EHelpers(page)
  
  await helpers.navigation.goToHomepage()
  
  const words = ['Workplaces', 'Apartments', 'Gyms', 'Businesses']
  await helpers.animation.verifyRotatingTextAnimation('.rotating-text', words)
})
```

## Accessibility Testing Patterns

### Component Accessibility
```typescript
describe('Component Accessibility', () => {
  it('has proper ARIA labels', () => {
    render(<Component />)
    
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Expected label')
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
  
  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Component />)
    
    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()
    
    await user.keyboard('{Enter}')
    // Verify expected behavior
  })
})
```

### E2E Accessibility Testing
```typescript
test('maintains accessibility standards', async ({ page }) => {
  const helpers = createE2EHelpers(page)
  
  await helpers.navigation.goToHomepage()
  await helpers.accessibility.verifyHeadingHierarchy()
  await helpers.accessibility.verifyImageAltTexts()
  await helpers.accessibility.testKeyboardAccessibility()
})
```

## Performance Testing Patterns

### Component Performance
```typescript
describe('Component Performance', () => {
  it('renders quickly with large datasets', () => {
    const largeDataset = Array(1000).fill({ id: 1, name: 'Item' })
    
    const startTime = performance.now()
    render(<ListComponent items={largeDataset} />)
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(100) // 100ms
  })
})
```

### E2E Performance Testing
```typescript
test('loads page within acceptable time', async ({ page }) => {
  const helpers = createE2EHelpers(page)
  
  const performance = await helpers.performance.measurePageLoad()
  
  expect(performance.loadTime).toBeLessThan(5000) // 5 seconds
  expect(performance.domContentLoaded).toBeLessThan(3000) // 3 seconds
})
```

## Best Practices

### Test Organization
1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain expected behavior
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Keep tests isolated** - each test should be independent
5. **Clean up after tests** - reset state, clear mocks

### Test Data Management
```typescript
// Use consistent test data
const mockUserData = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com'
}

// Create factories for complex objects
const createMockUser = (overrides = {}) => ({
  ...mockUserData,
  ...overrides
})
```

### Mock Management
```typescript
// Mock external dependencies
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {}
  })
}))

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})
```

### Async Testing
```typescript
// Use async/await for async operations
it('handles async operations', async () => {
  const user = userEvent.setup()
  render(<AsyncComponent />)
  
  await user.click(screen.getByRole('button'))
  
  // Wait for async operation to complete
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})
```

## Debugging Tests

### Running Specific Tests
```bash
# Run specific test file
npm test ComponentName.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should handle clicks"

# Run with verbose output
npm test -- --verbose
```

### Debugging E2E Tests
```bash
# Run with browser visible
npm run test:e2e -- --headed

# Run with debug mode
npm run test:e2e -- --debug

# Run specific E2E test
npm run test:e2e -- --grep "test name"
```

### Common Debugging Techniques
1. **Use `screen.debug()`** to see rendered HTML
2. **Add `await page.pause()`** to pause E2E tests
3. **Check test screenshots/videos** in `test-results/` directory
4. **Use `console.log`** sparingly for debugging
5. **Review test error messages** for specific failure details

## Coverage Requirements

- **Minimum 80% code coverage** for all new features
- **100% coverage required** for critical user flows
- **Animation tests required** for all CSS animations
- **E2E tests required** for all user-facing features
- **Accessibility tests required** for all interactive components

## Continuous Integration

Tests run automatically on:
- **Pre-commit hooks** - Basic unit tests
- **Pull requests** - Full test suite including E2E
- **Main branch pushes** - Complete test suite with coverage reporting
- **Nightly builds** - Performance regression testing

## Troubleshooting

### Common Issues

**Test timeouts**
- Increase timeout for slow operations
- Use `waitFor` for async state changes
- Mock slow external dependencies

**Flaky E2E tests**
- Add proper wait conditions
- Use stable selectors
- Reset state between tests

**Animation test failures**
- Verify CSS is loaded in test environment
- Check animation timing expectations
- Mock timers for predictable timing

### Getting Help
- Check existing test examples in codebase
- Review error messages and stack traces
- Use test debugging tools (screen.debug, page.pause)
- Consult team documentation in `/docs` directory

## React act() Best Practices

### Understanding act() Warnings

React 18 introduced stricter enforcement of the act() boundary. All state updates that occur during testing must be wrapped in `act()` to prevent warnings like:

```
Warning: An update inside a test was not wrapped in act(...)
```

### When act() Warnings Occur

1. **Timer-based state updates** (setTimeout, setInterval)
2. **Animation frame callbacks** (requestAnimationFrame)  
3. **Async operations** that update component state
4. **Event handlers** that trigger state changes
5. **Cleanup functions** that modify state

### Timer Utilities for act() Compliance

Use our custom timer utilities that automatically wrap operations in act():

```typescript
import { 
  setupRealTimers, 
  setupFakeTimers,
  advanceTimersByTimeAndAct,
  cleanupTimers 
} from '../test-utils/timer-helpers';

describe('Component with Timers', () => {
  beforeEach(() => {
    // Use real timers for components with setInterval/setTimeout
    setupRealTimers();
  });

  afterEach(async () => {
    await cleanupTimers();
  });

  it('should handle timer-based state updates', async () => {
    render(<TimerComponent />);
    
    // For fake timers - advance time with act() wrapping
    await advanceTimersByTimeAndAct(1000);
    
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});
```

### Real vs Fake Timers Strategy

**Use Real Timers When:**
- Components use `setInterval` (prevents infinite loops)
- Complex animation sequences
- RAF-based animations
- Real-time user interactions

```typescript
beforeEach(() => {
  setupRealTimers(); // Prevents act() warnings in setInterval components
});
```

**Use Fake Timers When:**
- You need precise control over timing
- Testing timeout behaviors
- Simple timer-based logic

```typescript
beforeEach(() => {
  setupFakeTimers();
});

it('should timeout after delay', async () => {
  render(<TimeoutComponent />);
  
  await advanceTimersByTimeAndAct(5000);
  
  expect(screen.getByText('Timeout')).toBeInTheDocument();
});
```

### Global act() Utility

For simple async operations, use the global `withAct` utility:

```typescript
it('should handle async state updates', async () => {
  render(<AsyncComponent />);
  
  await global.withAct(async () => {
    fireEvent.click(screen.getByText('Load Data'));
    await waitFor(() => screen.getByText('Loaded'));
  });
});
```

### Preventing act() Warnings in Animation Tests

```typescript
describe('Animation Component', () => {
  beforeEach(() => {
    // Real timers prevent infinite loops in animations
    setupRealTimers();
  });

  it('should animate without act() warnings', async () => {
    render(<AnimatedComponent />);
    
    // Trigger animation
    fireEvent.click(screen.getByText('Animate'));
    
    // Wait for animation with act() compliant timing
    await waitFor(() => {
      expect(screen.getByTestId('animated')).toHaveClass('active');
    });
  });
});
```

### Scroll Event Testing

```typescript
it('should handle scroll events', async () => {
  render(<ScrollComponent />);
  
  // Wrap scroll events in act() to prevent warnings
  await act(async () => {
    Object.defineProperty(window, 'scrollY', { value: 100 });
    window.dispatchEvent(new Event('scroll'));
  });
  
  expect(screen.getByTestId('header')).toHaveClass('scrolled');
});
```

### Automated Detection

Use our detection script to verify no act() warnings:

```bash
# Run act() warning detection
node scripts/detect-act-warnings.js

# Results show 100% clean files
Coverage: 100% of files are act() warning-free
```

### Migration Checklist

When fixing act() warnings in existing tests:

1. ✅ Import timer utilities: `setupRealTimers`, `cleanupTimers`
2. ✅ Add setup in `beforeEach()` and cleanup in `afterEach()`  
3. ✅ Replace direct timer calls with act()-wrapped versions
4. ✅ Use real timers for setInterval components
5. ✅ Wrap scroll events and async operations in act()
6. ✅ Run detection script to verify no warnings

### Rules of Thumb

- **Always use `setupRealTimers()`** for rotating text and interval-based animations
- **Always use `cleanupTimers()`** in afterEach for proper cleanup
- **Wrap all state-updating operations** in act() or use our utilities
- **Run the detection script** before committing changes
- **Prefer real timers** over fake timers for complex timing scenarios