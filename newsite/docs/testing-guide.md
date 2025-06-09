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

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- --testPathPattern=HeroSection

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run E2E tests for specific browser
npm run test:e2e -- --project=chromium
```

## Setting Up Tests

### 1. Configure Test Environment

The test environment is pre-configured with:
- JSDOM for DOM simulation
- React Testing Library for component testing
- Custom render function with all necessary providers
- Animation frame polyfills for smooth animation testing
- Timer utilities for predictable async testing

### 2. Writing Your First Test

```typescript
// Basic component test example
import { render, screen } from '../test-utils';
import HeroSection from '../components/HeroSection';

describe('HeroSection', () => {
  it('should render with correct heading', () => {
    render(<HeroSection />);
    
    expect(screen.getByRole('heading', { level: 1 }))
      .toHaveTextContent('Premium Amenity Solutions');
  });
});
```

### 3. Testing Components with Animations

```typescript
import { render, screen, waitFor } from '../test-utils';
import { setupRealTimers, cleanupTimers } from '../test-utils/timer-helpers';
import RotatingText from '../components/RotatingText';

describe('RotatingText', () => {
  beforeEach(() => {
    setupRealTimers(); // Use real timers for animations
  });
  
  afterEach(async () => {
    await cleanupTimers();
  });

  it('should rotate through words', async () => {
    render(<RotatingText words={['Hello', 'World']} />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('World')).toBeInTheDocument();
    }, { timeout: 4000 });
  });
});
```

## Testing Best Practices

### General Guidelines

1. **Test Behavior, Not Implementation**
   ```typescript
   // ❌ Bad: Testing implementation details
   expect(component.state.isOpen).toBe(true);
   
   // ✅ Good: Testing user-visible behavior
   expect(screen.getByRole('dialog')).toBeVisible();
   ```

2. **Use Semantic Queries**
   ```typescript
   // ❌ Bad: Fragile selectors
   screen.getByClassName('btn-primary');
   
   // ✅ Good: Accessible queries
   screen.getByRole('button', { name: 'Submit' });
   ```

3. **Wait for Async Operations**
   ```typescript
   // ❌ Bad: No waiting
   fireEvent.click(button);
   expect(screen.getByText('Loaded')).toBeInTheDocument();
   
   // ✅ Good: Proper async handling
   fireEvent.click(button);
   await waitFor(() => {
     expect(screen.getByText('Loaded')).toBeInTheDocument();
   });
   ```

### Component Testing

**Setup and Teardown**
```typescript
describe('Component', () => {
  let mockFn;
  
  beforeEach(() => {
    mockFn = jest.fn();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
});
```

**Testing User Interactions**
```typescript
it('should handle user input', async () => {
  const user = userEvent.setup();
  render(<Form />);
  
  const input = screen.getByLabelText('Email');
  await user.type(input, 'test@example.com');
  
  expect(input).toHaveValue('test@example.com');
});
```

### Animation Testing

**Timer Strategy**
```typescript
// For components with intervals (rotating text, carousels)
beforeEach(() => {
  setupRealTimers();
});

// For simple timeout testing
beforeEach(() => {
  jest.useFakeTimers();
});
```

**Testing CSS Classes**
```typescript
it('should apply animation classes', async () => {
  render(<AnimatedCard />);
  const card = screen.getByTestId('card');
  
  fireEvent.mouseEnter(card);
  expect(card).toHaveClass('hover-state');
  
  fireEvent.mouseLeave(card);
  expect(card).not.toHaveClass('hover-state');
});
```

## Advanced Testing Patterns

### Custom Render with Providers

```typescript
// test-utils/render.tsx
export function render(ui, options = {}) {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider>
        <RouterContext.Provider value={mockRouter}>
          {children}
        </RouterContext.Provider>
      </ThemeProvider>
    ),
    ...options,
  });
}
```

### Mocking External Dependencies

```typescript
// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    push: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock API calls
jest.mock('../utils/api', () => ({
  fetchData: jest.fn(() => Promise.resolve({ data: [] })),
}));
```

### Testing Accessibility

```typescript
it('should have no accessibility violations', async () => {
  const { container } = render(<Page />);
  const results = await axe(container);
  
  expect(results).toHaveNoViolations();
});

it('should be keyboard navigable', async () => {
  const user = userEvent.setup();
  render(<Navigation />);
  
  await user.tab();
  expect(screen.getByText('Home')).toHaveFocus();
  
  await user.tab();
  expect(screen.getByText('About')).toHaveFocus();
});
```

## E2E Testing with Playwright

### Basic E2E Test

```typescript
import { test, expect } from '@playwright/test';

test('should complete purchase flow', async ({ page }) => {
  await page.goto('/shop');
  
  // Select product
  await page.click('[data-testid="product-card"]');
  
  // Add to cart
  await page.click('button:has-text("Add to Cart")');
  
  // Checkout
  await page.click('button:has-text("Checkout")');
  
  // Verify on checkout page
  await expect(page).toHaveURL('/checkout');
  await expect(page.locator('h1')).toHaveText('Checkout');
});
```

### Cross-Browser Testing

```typescript
test.describe('Cross-browser compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should work in ${browserName}`, async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1')).toBeVisible();
    });
  });
});
```

## Debugging Tests

### Debugging Tools

**React Testing Library**
```typescript
// Print current DOM
screen.debug();

// Print specific element
screen.debug(screen.getByRole('button'));

// Use logRoles for accessibility tree
import { logRoles } from '@testing-library/react';
logRoles(container);
```

**Playwright**
```typescript
// Pause test execution
await page.pause();

// Take screenshot
await page.screenshot({ path: 'debug.png' });

// Slow down execution
test.use({ slowMo: 500 });
```

### Common Issues and Solutions

**Async test timeouts**
- Increase timeout for slow operations
- Use proper wait conditions
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

## CSS Animation Testing in JSDOM

### Understanding JSDOM Limitations

JSDOM, the DOM implementation used by Jest, doesn't have a CSS engine. This means:
- ❌ CSS animations don't execute
- ❌ `getComputedStyle()` returns empty animation properties
- ❌ Keyframe animations don't run
- ❌ Transition events don't fire
- ❌ Transform calculations aren't available

### Three-Tier Testing Strategy

We use a three-tier approach to test animations despite JSDOM limitations:

#### Tier 1: Animation Logic Testing (Unit Tests)
Test animation state machines, hooks, and timing logic without DOM rendering.

```typescript
import { AnimationStateMachine } from '../test-utils/animation-state-testing';

it('should transition animation states correctly', () => {
  const machine = new AnimationStateMachine('idle');
  
  machine.transition('running', 'user-interaction');
  expect(machine.getCurrentState()).toBe('running');
  
  machine.transition('completed', 'animation-end');
  expect(machine.getCurrentState()).toBe('completed');
});
```

#### Tier 2: Component Behavior Testing (Integration Tests)
Test DOM changes, class applications, and user interactions without visual validation.

```typescript
import { mockAnimationProperties, clearAnimationMocks } from '../test-utils/css-animation-mocking';

beforeEach(() => {
  // Mock CSS properties that components might check
  mockAnimationProperties('.fade-in', {
    animationName: 'fadeIn',
    animationDuration: '1s'
  });
});

afterEach(() => {
  clearAnimationMocks();
});

it('should apply animation classes on trigger', async () => {
  render(<AnimatedComponent />);
  
  const element = screen.getByTestId('animated');
  expect(element).toHaveClass('idle');
  
  fireEvent.click(screen.getByText('Animate'));
  
  await waitFor(() => {
    expect(element).toHaveClass('animating');
  });
});
```

#### Tier 3: Visual Validation (E2E Tests - Playwright)
Reserve actual visual testing for real browser environments.

### Do's and Don'ts

#### ✅ DO:
- Test animation state changes and logic
- Test CSS class applications
- Test DOM content changes during animations
- Mock CSS properties when components check them
- Use data attributes to track animation states
- Test user interactions that trigger animations

#### ❌ DON'T:
- Try to test actual CSS property values
- Expect `getComputedStyle()` to return animation properties
- Test visual opacity, transform, or position changes
- Fire animation events manually (they won't work correctly)
- Test animation performance in JSDOM
- Verify computed transform matrices

### Code Review Checklist for Animation Tests

When reviewing animation tests, ensure:

1. **Correct Tier Usage**
   - [ ] Logic tests use Tier 1 patterns (no DOM rendering)
   - [ ] Behavior tests use Tier 2 patterns (DOM but no visual validation)
   - [ ] Visual tests are deferred to E2E (Tier 3)

2. **Proper Mocking**
   - [ ] CSS properties are mocked only when needed
   - [ ] Mocks are cleaned up in `afterEach`
   - [ ] Only necessary properties are mocked

3. **Timer Management**
   - [ ] Real timers used for interval-based animations
   - [ ] Proper cleanup with `cleanupTimers()`
   - [ ] Reasonable timeout values in `waitFor`

4. **Test Focus**
   - [ ] Tests focus on behavior, not implementation
   - [ ] No attempts to test visual CSS properties
   - [ ] Clear test descriptions indicating what's being tested

### Animation Testing Utilities

#### `mockAnimationProperties(selector, properties)`
Mocks CSS animation properties for elements matching the selector.

```typescript
mockAnimationProperties('.rotating-text', {
  animationName: 'rotate',
  animationDuration: '3s',
  animationIterationCount: 'infinite'
});
```

#### `AnimationStateMachine`
Manages animation state transitions for logic testing.

```typescript
const machine = new AnimationStateMachine('idle');
machine.transition('running', 'trigger-event');
expect(machine.getCurrentState()).toBe('running');
```

#### `KeyframeAnimationTester`
Simulates keyframe animation phases without CSS.

```typescript
const tester = new KeyframeAnimationTester({
  name: 'slideIn',
  duration: 1000
});
tester.onPhaseChange(phase => console.log(phase));
tester.start();
```

### Common Mistakes and Solutions

#### Mistake 1: Testing Visual Properties
```typescript
// ❌ Wrong - This won't work in JSDOM
expect(getComputedStyle(element).opacity).toBe('0.5');

// ✅ Correct - Test behavior instead
expect(element).toHaveClass('fade-half');
expect(element).toHaveAttribute('data-opacity', '0.5');
```

#### Mistake 2: Expecting Keyframes to Execute
```typescript
// ❌ Wrong - Keyframes don't run
await waitFor(() => {
  expect(element.style.transform).toBe('translateX(100px)');
});

// ✅ Correct - Test state changes
await waitFor(() => {
  expect(element).toHaveClass('slide-complete');
});
```

#### Mistake 3: Using getComputedStyle for Animations
```typescript
// ❌ Wrong - Returns empty/default values
const animationName = getComputedStyle(element).animationName;
expect(animationName).toBe('fadeIn');

// ✅ Correct - Mock what you need
mockAnimationProperties(element, { animationName: 'fadeIn' });
// Now test behavior that depends on this property
```

#### Mistake 4: Testing Transform Matrices
```typescript
// ❌ Wrong - Complex calculations not available
const transform = getComputedStyle(element).transform;
expect(transform).toBe('matrix(1, 0, 0, 1, 100, 0)');

// ✅ Correct - Test position state
expect(element).toHaveAttribute('data-position', 'moved');
expect(element).toHaveClass('translated-right');
```

### Migration Guide for CSS-Dependent Tests

If you have existing tests that depend on CSS animations:

1. **Identify CSS dependencies**
   ```typescript
   // Look for patterns like:
   getComputedStyle(element).animationName
   element.style.opacity
   expect(transform).toBe(...)
   ```

2. **Categorize by tier**
   - Can it be tested as pure logic? → Tier 1
   - Does it need DOM but not visuals? → Tier 2
   - Does it need actual rendering? → Tier 3 (defer)

3. **Refactor to appropriate pattern**
   ```typescript
   // Before: CSS-dependent
   expect(getComputedStyle(el).opacity).toBe('0');
   
   // After: Behavior-focused
   expect(el).toHaveAttribute('aria-hidden', 'true');
   expect(el).toHaveClass('invisible');
   ```

4. **Add necessary mocks**
   ```typescript
   beforeEach(() => {
     mockAnimationProperties('.component', {
       animationDuration: '2s'
     });
   });
   ```

5. **Update assertions**
   Focus on observable behavior rather than visual properties.

### Animation Testing Resources

- **Guidelines**: See `/docs/animation-testing-guidelines.md` for detailed strategies
- **Examples**: See `/docs/animation-testing-examples.md` for complete examples
- **Utilities**: Check `/test-utils/` for animation testing helpers
- **Performance**: See `/docs/animation-test-performance-report.md` for metrics

Remember: You're testing that your components behave correctly when animations should occur, not that CSS animations work (browsers handle that).