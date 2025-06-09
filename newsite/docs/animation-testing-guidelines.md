# Animation Testing Guidelines

**Last Updated**: June 9, 2025  
**Purpose**: Comprehensive guide for testing CSS animations in JSDOM environment

## Table of Contents
1. [Overview](#overview)
2. [Decision Matrix](#decision-matrix)
3. [Testing Tier Selection](#testing-tier-selection)
4. [API Reference](#api-reference)
5. [Integration Patterns](#integration-patterns)
6. [Troubleshooting Guide](#troubleshooting-guide)

## Overview

JSDOM lacks a CSS engine, which means CSS animations, transitions, and keyframes don't execute. This guide provides a structured approach to testing animation-related functionality despite these limitations.

### Key Principles
- **Separate concerns**: Logic vs. Behavior vs. Visual
- **Mock what you need**: Use CSS property mocking for state verification
- **Test what matters**: Focus on user-observable behavior, not implementation details
- **Avoid visual validation**: Leave visual testing for E2E tools

## Decision Matrix

Use this matrix to determine which testing tier to use:

| What You're Testing | Testing Tier | Tools to Use | Example |
|-------------------|--------------|--------------|---------|
| Animation state machine logic | Tier 1 | `AnimationStateMachine`, `testAnimationHook()` | State transitions (idle → running → complete) |
| Hook behavior in isolation | Tier 1 | `renderHook`, `testAnimationHook()` | useAnimation() hook logic |
| Timing calculations | Tier 1 | Pure functions, `simulateKeyframePhases()` | Duration calculations, intervals |
| DOM text changes | Tier 2 | `render`, `waitFor`, real timers | Rotating text content updates |
| CSS class applications | Tier 2 | `render`, `toHaveClass()` | Animation state classes |
| Element visibility changes | Tier 2 | `render`, `toBeVisible()` | Show/hide animations |
| User interactions | Tier 2 | `userEvent`, `fireEvent` | Hover effects, click animations |
| Visual appearance | Tier 3 | Playwright, Cypress | Actual animation rendering |
| Animation performance | Tier 3 | Browser DevTools | FPS, jank detection |
| Cross-browser behavior | Tier 3 | Multiple browser testing | Safari vs Chrome differences |

### Quick Decision Flow
```
Is it testing visual appearance?
  ├─ YES → Tier 3 (E2E)
  └─ NO → Does it need DOM rendering?
           ├─ YES → Tier 2 (Integration)
           └─ NO → Tier 1 (Unit)
```

## Testing Tier Selection

### Tier 1: Animation Logic Testing (Unit Tests)

**When to use:**
- Testing animation state machines
- Testing hooks that manage animation state
- Testing timing logic or calculations
- Testing animation callbacks

**Specific Scenarios:**
- ✅ Test animation state changes → `idle` to `running` to `completed`
- ✅ Test word cycling logic → Calculate next index without DOM
- ✅ Test timing intervals → Verify 3-second rotation interval
- ✅ Test animation callbacks → onAnimationStart, onAnimationEnd

**Example:**
```typescript
// TIER 1: Testing pure animation logic
it('should transition through correct animation states', () => {
  const stateMachine = new AnimationStateMachine('idle');
  
  stateMachine.transition('running', 'animation-start');
  expect(stateMachine.getCurrentState()).toBe('running');
  
  stateMachine.transition('completed', 'animation-end');
  expect(stateMachine.getCurrentState()).toBe('completed');
});
```

### Tier 2: Component Behavior Testing (Integration Tests)

**When to use:**
- Testing DOM updates triggered by animations
- Testing CSS class changes
- Testing user interactions that trigger animations
- Testing component lifecycle with animations

**Specific Scenarios:**
- ✅ Test DOM updates → Text content changes during rotation
- ✅ Test CSS classes → `.rotating-text-entering` applied at right time
- ✅ Test hover effects → Element gets hover class on mouse enter
- ✅ Test visibility → Element becomes visible after animation

**Example:**
```typescript
// TIER 2: Testing component behavior
it('should update text content during rotation', async () => {
  render(<RotatingText words={['One', 'Two', 'Three']} />);
  
  const element = screen.getByTestId('rotating-text');
  expect(element).toHaveTextContent('One');
  
  // Wait for rotation
  await waitFor(() => {
    expect(element).toHaveTextContent('Two');
  }, { timeout: 4000 });
});
```

### Tier 3: Visual Validation Testing (E2E Tests - Future)

**When to use:**
- Testing actual visual rendering
- Testing animation smoothness
- Testing cross-browser compatibility
- Testing performance metrics

**Specific Scenarios:**
- ❌ Test visual effects → Fade opacity from 1 to 0
- ❌ Test animation curves → ease-in-out timing function
- ❌ Test transform values → translateX animation progress
- ❌ Test computed styles → Actual CSS property values

**Note:** These tests are currently out of scope and would require Playwright or similar tools.

## API Reference

### Animation State Testing Utilities

#### `AnimationStateMachine`
Manages animation state transitions without visual rendering.

```typescript
class AnimationStateMachine {
  constructor(initialState: AnimationState)
  getCurrentState(): AnimationState
  transition(to: AnimationState, trigger?: string): void
  getTransitionHistory(): AnimationStateTransition[]
  reset(): void
}
```

**Usage:**
```typescript
const machine = new AnimationStateMachine('idle');
machine.transition('running', 'user-click');
expect(machine.getCurrentState()).toBe('running');
```

#### `testAnimationHook()`
Tests animation hooks in isolation.

```typescript
function testAnimationHook<T>(
  hook: () => T
): {
  result: { current: T },
  triggerTransition: () => void,
  rerender: () => void
}
```

**Usage:**
```typescript
const { result } = testAnimationHook(() => useAnimation());
expect(result.current.isAnimating).toBe(false);
```

#### `createTestStateMachine()`
Creates a state machine with validation helpers.

```typescript
function createTestStateMachine(initialState: AnimationState): {
  machine: AnimationStateMachine,
  expectTransition: (from: AnimationState, to: AnimationState) => void,
  validateTransitions: () => void
}
```

### CSS Animation Mocking Utilities

#### `mockAnimationProperties()`
Mocks CSS animation properties for elements.

```typescript
function mockAnimationProperties(
  selector: string | Element,
  properties: Partial<MockAnimationProperties>
): void
```

**Properties:**
- `animationName`: Keyframe animation name
- `animationDuration`: Animation duration (e.g., '3s')
- `animationDelay`: Animation delay
- `animationIterationCount`: Number or 'infinite'
- `animationDirection`: 'normal' | 'reverse' | 'alternate'
- `animationFillMode`: 'none' | 'forwards' | 'backwards' | 'both'
- `animationPlayState`: 'running' | 'paused'

**Usage:**
```typescript
mockAnimationProperties('.rotating-text', {
  animationName: 'textRotate',
  animationDuration: '3s',
  animationIterationCount: 'infinite'
});
```

#### `clearAnimationMocks()`
Clears all animation property mocks.

```typescript
function clearAnimationMocks(): void
```

### Keyframe Testing Utilities

#### `KeyframeAnimationTester`
Simulates keyframe animation phases.

```typescript
class KeyframeAnimationTester {
  constructor(config: AnimationConfig)
  start(): void
  pause(): void
  cancel(): void
  onPhaseChange(callback: (phase: AnimationPhase) => void): void
  getCurrentPhase(): AnimationPhase
  destroy(): void
}
```

**Usage:**
```typescript
const tester = new KeyframeAnimationTester({
  name: 'fadeIn',
  duration: 1000
});
tester.onPhaseChange(phase => console.log(phase));
tester.start();
```

#### `simulateKeyframePhases()`
Simulates animation timeline progression.

```typescript
async function simulateKeyframePhases(config: {
  name: string,
  duration: number,
  steps: number
}): Promise<AnimationTimeline>
```

## Integration Patterns

### With Timer Utilities

Animation tests often need precise timer control. Integrate with existing timer utilities:

```typescript
import { setupRealTimers, cleanupTimers } from '../test-utils/timer-helpers';

describe('Animation with Timers', () => {
  beforeEach(() => {
    setupRealTimers(); // Use real timers for accurate timing
    mockAnimationProperties('.element', {
      animationDuration: '2s'
    });
  });

  afterEach(async () => {
    await cleanupTimers();
    clearAnimationMocks();
  });

  it('should complete animation after duration', async () => {
    // Test implementation
  });
});
```

### With React Testing Library

Combine animation utilities with RTL patterns:

```typescript
import { render, waitFor } from '@testing-library/react';

it('should apply animation classes', async () => {
  const { container } = render(<AnimatedComponent />);
  
  // Mock the expected CSS properties
  mockAnimationProperties('.animated-element', {
    animationName: 'slideIn'
  });
  
  // Test behavior, not visual appearance
  await waitFor(() => {
    expect(container.querySelector('.animated-element'))
      .toHaveClass('animation-active');
  });
});
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue: "getComputedStyle returns empty animation properties"
**Cause:** JSDOM doesn't compute CSS animations  
**Solution:** Use `mockAnimationProperties()` to mock the values you need
```typescript
// ❌ Wrong
const styles = getComputedStyle(element);
expect(styles.animationName).toBe('fadeIn'); // Always empty!

// ✅ Correct
mockAnimationProperties(element, { animationName: 'fadeIn' });
// Now test behavior that depends on this property
```

#### Issue: "Animation timing tests are flaky"
**Cause:** Using fake timers incorrectly with animations  
**Solution:** Use real timers for animation timing tests
```typescript
// ❌ Wrong
jest.useFakeTimers();
jest.advanceTimersByTime(3000);

// ✅ Correct
setupRealTimers();
await waitFor(() => {
  // assertion
}, { timeout: 3500 });
```

#### Issue: "Can't test keyframe progress"
**Cause:** Keyframes don't execute in JSDOM  
**Solution:** Test state changes, not visual progress
```typescript
// ❌ Wrong
expect(element.style.opacity).toBe('0.5'); // Mid-animation

// ✅ Correct
expect(element).toHaveClass('fade-in-progress');
expect(mockState.phase).toBe('animating');
```

#### Issue: "Animation callbacks never fire"
**Cause:** No animation events in JSDOM  
**Solution:** Manually trigger or mock callbacks
```typescript
// ❌ Wrong
element.addEventListener('animationend', callback);
// Wait forever...

// ✅ Correct
// Test the callback logic directly
const onAnimationEnd = jest.fn();
renderComponent({ onAnimationEnd });
// Trigger the condition that would cause animation end
act(() => {
  jest.runAllTimers();
});
expect(onAnimationEnd).toHaveBeenCalled();
```

### Best Practices

1. **Always clean up mocks**
   ```typescript
   afterEach(() => {
     clearAnimationMocks();
   });
   ```

2. **Mock only what you need**
   ```typescript
   // Don't mock everything
   mockAnimationProperties('.element', {
     animationName: 'slide' // Only mock what the test checks
   });
   ```

3. **Test behavior, not implementation**
   ```typescript
   // ❌ Testing CSS directly
   expect(styles.transform).toBe('translateX(100px)');
   
   // ✅ Testing behavior
   expect(element).toHaveClass('slid-right');
   ```

4. **Use appropriate timeouts**
   ```typescript
   await waitFor(() => {
     expect(element).toHaveTextContent('New Text');
   }, { 
     timeout: animationDuration + 500 // Buffer for reliability
   });
   ```

5. **Document why you're mocking**
   ```typescript
   // Mock animation duration because JSDOM doesn't execute CSS animations
   // This allows us to test that the component reads the duration correctly
   mockAnimationProperties('.loader', { animationDuration: '2s' });
   ```

### Debug Helpers

When tests fail, use these debugging techniques:

```typescript
// Log animation state
console.log('Current phase:', tester.getCurrentPhase());
console.log('State history:', machine.getTransitionHistory());

// Check mocked properties
const element = screen.getByTestId('animated');
console.log('Mocked properties:', getMockedProperties(element));

// Verify timer state
console.log('Timer count:', jest.getTimerCount());
```

## Migration Guide

### Converting CSS-Dependent Tests

#### Before (JSDOM-Incompatible):
```typescript
it('should fade in element', () => {
  render(<FadeIn />);
  const element = screen.getByTestId('fade-element');
  
  const styles = getComputedStyle(element);
  expect(styles.opacity).toBe('0');
  
  fireEvent.animationEnd(element);
  expect(styles.opacity).toBe('1');
});
```

#### After (JSDOM-Compatible):
```typescript
it('should fade in element', async () => {
  render(<FadeIn />);
  const element = screen.getByTestId('fade-element');
  
  // Test initial state via classes/attributes
  expect(element).toHaveClass('fade-in-start');
  expect(element).toHaveAttribute('data-visible', 'false');
  
  // Wait for behavior change
  await waitFor(() => {
    expect(element).toHaveClass('fade-in-complete');
    expect(element).toHaveAttribute('data-visible', 'true');
  });
});
```

### Common Patterns to Replace

| Old Pattern | New Pattern | Why |
|------------|-------------|-----|
| `getComputedStyle(el).animationName` | `mockAnimationProperties()` + test behavior | JSDOM doesn't compute animations |
| `fireEvent.animationEnd()` | `waitFor()` with timeout | Animation events don't fire |
| `expect(opacity).toBe('0.5')` | `expect(el).toHaveClass('fading')` | Test state, not visual |
| `@keyframes` in test | State machine or phase testing | Keyframes don't execute |
| Visual regression tests | Defer to Tier 3 (E2E) | Not possible in JSDOM |

## Summary

Successful animation testing in JSDOM requires:
1. **Clear separation** of logic, behavior, and visual concerns
2. **Appropriate mocking** of CSS properties when needed
3. **Focus on behavior** rather than visual appearance
4. **Proper timer usage** for reliable async tests
5. **Understanding limitations** and working within them

Remember: You're not testing that CSS animations work (the browser does that), you're testing that your components behave correctly when animations should occur.