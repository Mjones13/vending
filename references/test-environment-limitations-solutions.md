# Test Environment Limitations & Solutions

**Created**: June 8, 2025  
**Purpose**: Comprehensive analysis of test environment issues and recommended solutions  
**Based on**: Individual test analysis report findings  

## Executive Summary

Our test suite is experiencing a 70% failure rate primarily due to test environment limitations rather than application bugs. This document outlines the specific limitations and provides actionable solutions.

## Test Environment Limitations Overview

### Failure Distribution
- **45%** - Environment Setup Issues (missing polyfills, incomplete mocking)
- **30%** - Test Isolation Problems (parallel execution conflicts)
- **15%** - Animation Timing Issues (Jest fake timers incompatibility)
- **10%** - Critical Timeouts (infinite loops, hanging tests)

## Detailed Limitations & Solutions

### 1. Missing Browser API Polyfills (Critical - Blocks 22 Homepage Tests)

**Issue**: 
- `cancelAnimationFrame` is not defined
- `requestAnimationFrame` implementation inconsistent
- Causes immediate failure of all homepage tests

**Root Cause**: 
JSDOM doesn't provide these APIs by default, and our current polyfills aren't persisting through test cleanup.

**Solution**:
```javascript
// jest.setup.js - Add persistent polyfills
beforeEach(() => {
  // Ensure these persist through test cleanup
  if (!global.requestAnimationFrame) {
    global.requestAnimationFrame = (callback) => {
      return setTimeout(callback, 16); // ~60fps
    };
  }
  
  if (!global.cancelAnimationFrame) {
    global.cancelAnimationFrame = (id) => {
      clearTimeout(id);
    };
  }
});

// Alternative: Use raf-stub for more accurate simulation
import createRafStub from 'raf-stub';
const rafStub = createRafStub();
global.requestAnimationFrame = rafStub.requestAnimationFrame;
global.cancelAnimationFrame = rafStub.cancelAnimationFrame;
```

### 2. React act() Warnings (90% of Test Files)

**Issue**: 
- State updates in setTimeout/setInterval not wrapped in act()
- Animation frame callbacks triggering warnings
- Async operations updating state outside React's call stack

**Root Cause**: 
React 18 is stricter about state updates happening outside of its control flow.

**Solutions**:

**Option A - Wrap timer advances in act():**
```javascript
import { act } from '@testing-library/react';

// When using fake timers
act(() => {
  jest.advanceTimersByTime(1000);
});

// For RAF with new Jest API
act(() => {
  jest.advanceTimersToNextFrame();
});
```

**Option B - Create custom timer utilities:**
```javascript
// test-utils/timer-helpers.js
export const advanceTimersByTimeAndAct = async (ms) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

export const runAllTimersAndAct = async () => {
  await act(async () => {
    jest.runAllTimers();
  });
};

export const waitForAnimationFrame = async () => {
  await act(async () => {
    await new Promise(resolve => requestAnimationFrame(resolve));
  });
};
```

### 3. CSS Animation & Keyframe Limitations

**Issue**: 
- JSDOM doesn't support CSS animations
- `getComputedStyle` doesn't return animation properties
- Keyframe animations don't execute
- Can't test visual animation states

**Root Cause**: 
JSDOM is a JavaScript implementation of web standards, but doesn't include a CSS engine or animation runtime.

**Solution - Three-Tier Testing Strategy:**

**Tier 1 - Unit Tests (Logic Only)**
```javascript
// Test animation state logic without visual output
test('animation state transitions correctly', () => {
  const { result } = renderHook(() => useAnimation());
  
  expect(result.current.state).toBe('idle');
  
  act(() => {
    result.current.start();
  });
  
  expect(result.current.state).toBe('running');
});
```

**Tier 2 - Integration Tests (Behavior Focus)**
```javascript
// Use real timers for animation tests
beforeEach(() => {
  jest.useRealTimers();
});

test('component cycles through states', async () => {
  render(<AnimatedComponent />);
  
  expect(screen.getByText('State 1')).toBeInTheDocument();
  
  // Wait for real time to pass
  await waitFor(() => {
    expect(screen.getByText('State 2')).toBeInTheDocument();
  }, { timeout: 4000 });
});
```

**Tier 3 - E2E Tests (Visual Validation)**
```javascript
// playwright test
test('animation renders smoothly', async ({ page }) => {
  await page.goto('/');
  
  // Check CSS animation property
  const animationName = await page.locator('.animated').evaluate(
    el => window.getComputedStyle(el).animationName
  );
  
  expect(animationName).toBe('fadeIn');
});
```

### 4. Timer-Related Infinite Loops

**Issue**: 
- Tests hanging indefinitely (>120 seconds)
- Animation loops never terminating
- Fake timers causing recursive loops

**Root Cause**: 
The rotating text animation uses `setInterval` which, when combined with fake timers and continuous state updates, creates infinite loops.

**Solutions**:

**Option A - Use Real Timers for Problem Tests:**
```javascript
// For specific test files with animation loops
describe('Rotating Text Animation', () => {
  beforeEach(() => {
    jest.useRealTimers();
  });
  
  afterEach(() => {
    jest.useFakeTimers();
  });
  
  // Tests run with real timers
});
```

**Option B - Limit Timer Execution:**
```javascript
// Prevent infinite loops by limiting timer runs
test('animation cycles properly', () => {
  jest.useFakeTimers();
  const maxCycles = 5;
  let cycleCount = 0;
  
  render(<RotatingText />);
  
  while (cycleCount < maxCycles) {
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    cycleCount++;
  }
  
  // Assertions here
});
```

### 5. Test Isolation Problems

**Issue**: 
- Tests passing individually but failing when run together
- State persisting between tests
- Component mounting issues in parallel execution

**Root Cause**: 
Insufficient cleanup between tests and shared global state.

**Solution - Comprehensive Cleanup:**
```javascript
// jest.setup.js
afterEach(() => {
  // Clean up all timers
  jest.clearAllTimers();
  jest.useRealTimers();
  
  // Clear all mocks
  jest.clearAllMocks();
  jest.restoreAllMocks();
  
  // Reset DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Clear any global state
  if (window.__NEXT_DATA__) {
    delete window.__NEXT_DATA__;
  }
  
  // Clear event listeners
  window.removeEventListener = jest.fn();
  document.removeEventListener = jest.fn();
});

// For each test file
beforeEach(() => {
  // Start fresh with fake timers if needed
  jest.useFakeTimers();
  
  // Reset window location
  delete window.location;
  window.location = { href: 'http://localhost/' };
});
```

### 6. JSDOM Alternatives Evaluation

**Current JSDOM Limitations**:
- No CSS animation support
- Performance issues with large test suites
- Incomplete browser API implementation
- Heavy polyfill overhead

**Alternative Options**:

**Option A - Happy-DOM (Recommended for Speed)**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: '@happy-dom/jest-environment',
  testEnvironmentOptions: {
    happyDOM: {
      width: 1024,
      height: 768
    }
  }
};
```

**Pros**:
- 2-10x faster than JSDOM
- Lighter weight
- Better performance for large test suites

**Cons**:
- Less complete browser API coverage
- May require code changes

**Option B - Vitest Browser Mode (Recommended for Accuracy)**
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: true
    }
  }
});
```

**Pros**:
- Real browser environment
- Full CSS support
- Accurate animation testing

**Cons**:
- Slower than JSDOM/Happy-DOM
- Requires migration from Jest

## Implementation Roadmap

### Phase 1: Immediate Fixes (1-2 days)
1. **Add RAF/cAF polyfills** to jest.setup.js
2. **Fix logo text expectations** ("Smarter Vending" → "Golden Coast")
3. **Add missing ARIA labels** to Layout component
4. **Fix duplicate element rendering** issues

### Phase 2: Timer Strategy Overhaul (2-3 days)
1. **Create timer utility helpers** with act() wrapping
2. **Switch animation tests** to use real timers
3. **Simplify animation tests** to check state, not CSS
4. **Fix infinite loop issues** in timeout tests

### Phase 3: Test Architecture Improvements (1 week)
1. **Evaluate Happy-DOM** as JSDOM replacement
2. **Move visual animation tests** to E2E suite
3. **Refactor unit tests** to focus on logic only
4. **Improve test isolation** and cleanup

### Phase 4: Long-term Enhancements (2 weeks)
1. **Consider Vitest migration** for better browser testing
2. **Create animation-specific** test utilities
3. **Document testing strategies** for team
4. **Set up CI/CD** with appropriate timeouts

## Quick Start Implementation

To immediately improve test reliability, add this to your `jest.setup.js`:

```javascript
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({ 
  asyncUtilTimeout: 5000,
  computedStyleSupportsPseudoElements: true 
});

// Fix RAF/cAF immediately
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Ensure persistence
beforeEach(() => {
  if (!global.requestAnimationFrame) {
    global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
  }
  if (!global.cancelAnimationFrame) {
    global.cancelAnimationFrame = (id) => clearTimeout(id);
  }
});

// Global test utilities
global.withAct = async (callback) => {
  const { act } = require('@testing-library/react');
  await act(async () => {
    await callback();
  });
};

// Comprehensive cleanup
afterEach(() => {
  jest.clearAllTimers();
  jest.clearAllMocks();
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});
```

## Expected Outcomes

After implementing these solutions:

1. **Immediate (Phase 1)**:
   - Homepage tests will run (22 tests unblocked)
   - Logo text mismatches resolved
   - Basic accessibility fixed

2. **Short-term (Phase 2)**:
   - React act() warnings eliminated
   - Animation tests no longer timeout
   - Test execution time reduced by 50%

3. **Medium-term (Phase 3)**:
   - Test reliability increased to >90%
   - Clear separation of unit/integration/E2E tests
   - No more flaky tests

4. **Long-term (Phase 4)**:
   - Full animation testing capability
   - Fast, reliable test suite
   - Clear testing patterns established

## Conclusion

The majority of our test failures (70%) stem from test environment limitations rather than application bugs. By implementing this phased approach, we can transform our test suite from unreliable and slow to fast and trustworthy, while maintaining the ability to properly test complex animations and interactions.

The key insight is that we need different testing strategies for different aspects of our application:
- Unit tests for logic
- Integration tests for behavior
- E2E tests for visual validation

This layered approach, combined with proper environment configuration, will resolve our current issues and provide a solid foundation for future development.