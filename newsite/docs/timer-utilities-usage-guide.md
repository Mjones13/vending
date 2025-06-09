# Timer Utilities Usage Guide

This guide explains how to use the timer utilities to prevent React act() warnings in tests.

## Overview

React 18 introduced stricter enforcement of the act() boundary, requiring all state updates to be wrapped in act(). Our timer utilities automatically handle this wrapping for common timer operations.

## Available Utilities

### Basic Timer Operations

```typescript
import {
  advanceTimersByTimeAndAct,
  runAllTimersAndAct,
  runOnlyPendingTimersAndAct,
  runTimersToTimeAndAct,
  clearAllTimersAndAct,
} from '../test-utils/timer-helpers';

// Advance timers by specific time
await advanceTimersByTimeAndAct(1000); // Advance by 1 second

// Alternative method for advancing timers (same as above)
await runTimersToTimeAndAct(1000);

// Run all timers (careful with intervals - may cause infinite loops)
await runAllTimersAndAct();

// Run only currently pending timers (safer for intervals)
await runOnlyPendingTimersAndAct();

// Clear all timers
await clearAllTimersAndAct();
```

### Animation Frame Utilities

```typescript
import {
  waitForAnimationFrame,
  waitForAnimationFrames,
  advanceTimersToNextFrame,
} from '../test-utils/timer-helpers';

// Wait for next animation frame
await waitForAnimationFrame();

// Wait for multiple frames
await waitForAnimationFrames(3);

// Advance timers by ~16ms (one frame at 60fps)
await advanceTimersToNextFrame();
```

### Advanced Utilities

```typescript
import {
  waitForTimeout,
  waitForCondition,
  runTimerCycles,
  advanceTimersAndExecute,
  flushAllTimersAndMicrotasks,
} from '../test-utils/timer-helpers';

// Wait for real timeout (useful with real timers)
await waitForTimeout(500);

// Wait for condition to be true
await waitForCondition(() => screen.getByText('Loaded'), {
  timeout: 3000,
  interval: 100,
});

// Run specific number of timer cycles (useful for animations)
await runTimerCycles(5, 1000); // 5 cycles of 1 second each

// Advance timers then execute callback
await advanceTimersAndExecute(1000, () => {
  fireEvent.click(button);
});

// Flush all timers and microtasks (ensures all async operations complete)
await flushAllTimersAndMicrotasks();
```

### Timer Setup Helpers

```typescript
import {
  setupFakeTimers,
  setupRealTimers,
  cleanupTimers,
} from '../test-utils/timer-helpers';

beforeEach(() => {
  setupFakeTimers(); // Use fake timers with default settings
});

afterEach(async () => {
  await cleanupTimers(); // Proper cleanup
});

// For tests that need real timers
it('should work with real timers', async () => {
  setupRealTimers();
  // ... test code
});
```

## Common Patterns

### Testing Components with setInterval

```typescript
it('should rotate text every 3 seconds', async () => {
  setupFakeTimers();
  render(<RotatingText items={['One', 'Two', 'Three']} />);
  
  expect(screen.getByText('One')).toBeInTheDocument();
  
  // Advance to next rotation
  await advanceTimersByTimeAndAct(3000);
  expect(screen.getByText('Two')).toBeInTheDocument();
  
  // Use cycles to test multiple rotations
  await runTimerCycles(2, 3000);
  expect(screen.getByText('One')).toBeInTheDocument(); // Back to first
});
```

### Testing Animation Components

```typescript
it('should animate on scroll', async () => {
  render(<AnimatedComponent />);
  
  // Trigger scroll
  fireEvent.scroll(window, { target: { scrollY: 100 } });
  
  // Wait for animation frame
  await waitForAnimationFrame();
  
  // Check animation state
  expect(screen.getByTestId('animated')).toHaveStyle({
    opacity: '1',
  });
});
```

### Using Real Timers for Complex Animations

```typescript
it('should handle complex animation sequence', async () => {
  setupRealTimers(); // Use real timers to avoid infinite loops
  
  render(<ComplexAnimation />);
  
  // Wait for animation to complete
  await waitForTimeout(300);
  
  // Or wait for specific condition
  await waitForCondition(() => {
    const element = screen.getByTestId('animated');
    return element.style.opacity === '1';
  });
});
```

### Global withAct Utility

For simple async operations, use the global `withAct` utility:

```typescript
it('should update state asynchronously', async () => {
  render(<AsyncComponent />);
  
  await global.withAct(async () => {
    // Any async operation that updates state
    await userEvent.click(screen.getByText('Load Data'));
  });
  
  expect(screen.getByText('Data Loaded')).toBeInTheDocument();
});
```

## Best Practices

1. **Choose the Right Timer Mode**
   - Use fake timers for predictable, controlled tests
   - Use real timers for complex animations or when fake timers cause issues

2. **Prevent Infinite Loops**
   - Use `runOnlyPendingTimersAndAct()` instead of `runAllTimersAndAct()` when dealing with intervals
   - Use `runTimerCycles()` to limit the number of iterations

3. **Always Clean Up**
   - Call `cleanupTimers()` in `afterEach` to ensure proper cleanup
   - This prevents timer leakage between tests

4. **Handle Animation Frames Properly**
   - Use `waitForAnimationFrame()` for RAF-based animations
   - Mock RAF when testing complex animation sequences

5. **Use Appropriate Timeouts**
   - The testing library is configured with a 5-second async timeout
   - Use `waitForCondition` with custom timeouts for longer operations

## Troubleshooting

### "Warning: An update inside a test was not wrapped in act(...)"

This warning means a state update occurred outside React's control. Use the appropriate timer utility to wrap the operation.

### Tests hanging or timing out

- Check for infinite loops in intervals
- Use `setupRealTimers()` if fake timers are causing issues
- Limit iterations with `runTimerCycles()`

### Animation tests failing

- Ensure RAF polyfills are working (they're set up in jest.setup.js)
- Use `waitForAnimationFrame()` to sync with animation updates
- Consider using real timers for complex animations

## Migration Guide

To fix existing tests with act() warnings:

1. Import the necessary timer utilities
2. Replace direct timer calls with wrapped versions:
   - `jest.advanceTimersByTime(1000)` → `await advanceTimersByTimeAndAct(1000)`
   - `jest.runAllTimers()` → `await runAllTimersAndAct()`
3. Add `async/await` to test functions
4. Ensure proper cleanup in `afterEach`

Example migration:

```typescript
// Before
it('updates after timeout', () => {
  jest.useFakeTimers();
  render(<TimerComponent />);
  
  jest.advanceTimersByTime(1000);
  
  expect(screen.getByText('Updated')).toBeInTheDocument();
  jest.useRealTimers();
});

// After
it('updates after timeout', async () => {
  setupFakeTimers();
  render(<TimerComponent />);
  
  await advanceTimersByTimeAndAct(1000);
  
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

The `cleanupTimers()` in the global `afterEach` handles timer cleanup automatically.