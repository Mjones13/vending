# Animation Testing Strategy: Three-Tier Approach

**Purpose**: This document provides a comprehensive guide for testing animations in a JSDOM environment that lacks CSS animation support.

**Created**: June 9, 2025  
**Updated**: June 9, 2025  
**Implementation Plan**: 0609_0114 - CSS Animation and Keyframe Testing Strategy

## Overview

JSDOM, Jest's DOM implementation, doesn't support CSS animations or provide a CSS engine. This creates challenges when testing components with animations, transitions, or keyframe animations. Our three-tier testing strategy solves this by clearly separating what can be tested at different levels.

## The Three-Tier Strategy

### 🎯 **Tier 1: Unit Tests (Logic Only)**

**Purpose**: Test animation state machines, hooks, and logic without any visual rendering or DOM manipulation.

**When to Use Tier 1**:
- Testing animation state transitions (idle → running → completed)
- Testing custom hooks that manage animation state
- Testing animation timing calculations
- Testing animation callbacks and event handlers
- Testing animation configuration logic

**Tools to Use**:
- `AnimationStateMachine` from `test-utils/animation-state-testing.ts`
- `testAnimationHook()` for testing animation hooks
- `renderHook` from React Testing Library
- Existing timer utilities from `timer-helpers.ts`

**What NOT to Test in Tier 1**:
- Visual CSS properties or styles
- DOM element changes
- Component rendering
- User interactions

**Example - Animation State Machine Testing**:
```typescript
import { createTestStateMachine } from '../test-utils/animation-state-testing';

describe('Animation Logic (Tier 1)', () => {
  it('should transition through animation states correctly', () => {
    const { machine, expectTransition, validateTransitions } = createTestStateMachine('idle');
    
    // Define expected state flow
    expectTransition('idle', 'running');
    expectTransition('running', 'completed');
    
    // Execute state transitions
    machine.transition('running', 'user-start');
    machine.transition('completed', 'animation-end');
    
    // Validate the transitions occurred as expected
    validateTransitions();
  });
});
```

**Example - Animation Hook Testing**:
```typescript
import { testAnimationHook } from '../test-utils/animation-state-testing';

describe('useRotatingText Hook (Tier 1)', () => {
  it('should cycle through words correctly', () => {
    const words = ['Word1', 'Word2', 'Word3'];
    const { result, triggerTransition, getAnimationState } = testAnimationHook(
      () => useRotatingText(words)
    );
    
    // Test initial state
    expect(result.current.currentWord).toBe('Word1');
    expect(result.current.currentIndex).toBe(0);
    
    // Trigger animation transition
    triggerTransition('running', 'cycle-start');
    
    // Test state after transition
    expect(getAnimationState().currentState).toBe('running');
  });
});
```

---

### 🔄 **Tier 2: Integration Tests (Behavior Focus)**

**Purpose**: Test component behavior and DOM changes without relying on visual CSS properties.

**When to Use Tier 2**:
- Testing DOM text content changes
- Testing CSS class name changes
- Testing data attribute updates
- Testing component integration with animations
- Testing user interactions that trigger animations
- Testing component behavior over time

**Tools to Use**:
- `render` from React Testing Library
- Existing timer utilities from `timer-helpers.ts` (`setupRealTimers`, `cleanupTimers`)
- `mockAnimationProperties()` from `css-animation-mocking.ts` when CSS state verification is needed
- `waitFor` for timing-based tests

**What NOT to Test in Tier 2**:
- Visual CSS animation execution
- Computed style calculations
- Actual keyframe animation timing

**Example - Rotating Text Component Behavior**:
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { setupRealTimers, cleanupTimers } from '../test-utils/timer-helpers';

describe('Rotating Text Component Behavior (Tier 2)', () => {
  beforeEach(() => {
    setupRealTimers();
  });
  
  afterEach(async () => {
    await cleanupTimers();
  });
  
  it('should change text content over time', async () => {
    const words = ['Workplaces', 'Apartments', 'Gyms'];
    render(<RotatingText words={words} />);
    
    // Test initial content
    expect(screen.getByTestId('rotating-text')).toHaveTextContent('Workplaces');
    
    // Wait for rotation (using real timers)
    await waitFor(() => {
      expect(screen.getByTestId('rotating-text')).toHaveTextContent('Apartments');
    }, { timeout: 4000 });
    
    // Test class name changes
    const element = screen.getByTestId('rotating-text');
    expect(element).toHaveClass('rotating-text-visible');
  });
});
```

**Example - Animation CSS Class Testing**:
```typescript
import { mockAnimationProperties } from '../test-utils/css-animation-mocking';

describe('Animation CSS Classes (Tier 2)', () => {
  beforeEach(() => {
    // Mock CSS animation properties when needed
    mockAnimationProperties('.rotating-text-entering', {
      animationName: 'fadeInUp',
      animationDuration: '0.4s'
    });
  });
  
  it('should apply correct CSS classes during animation', async () => {
    render(<AnimatedComponent />);
    
    const element = screen.getByTestId('animated-element');
    
    // Test class changes (not visual execution)
    fireEvent.click(screen.getByText('Start Animation'));
    
    await waitFor(() => {
      expect(element).toHaveClass('rotating-text-entering');
    });
    
    // Can verify mocked CSS properties if needed
    const animationState = getAnimationState(element);
    expect(animationState.animationName).toBe('fadeInUp');
  });
});
```

---

### 👁️ **Tier 3: E2E Tests (Visual Validation - Future)**

**Purpose**: Test actual visual CSS animation execution and cross-browser compatibility.

**When to Use Tier 3**:
- Testing visual animation smoothness
- Testing CSS keyframe execution
- Testing computed style calculations
- Testing animation performance
- Testing cross-browser animation compatibility

**Tools to Use** (Future Implementation):
- Playwright or Cypress for real browser testing
- Visual regression testing tools
- Performance monitoring tools

**What to Test in Tier 3**:
- Actual CSS animation execution
- Visual animation quality
- Animation performance metrics
- Cross-browser compatibility

**Example - Future E2E Test** (Not Currently Implemented):
```typescript
// playwright test (future implementation)
test('rotating text animation renders smoothly', async ({ page }) => {
  await page.goto('/');
  
  // Test actual CSS animation execution
  const element = page.locator('[data-testid="rotating-text"]');
  
  // Verify CSS animation properties
  const animationName = await element.evaluate(
    el => window.getComputedStyle(el).animationName
  );
  expect(animationName).toBe('textRotate');
  
  // Test visual animation progression
  await expect(element).toHaveCSS('opacity', '1');
  await page.waitForTimeout(2000);
  await expect(element).toHaveCSS('opacity', '0');
});
```

---

## Decision Tree: Choosing the Right Tier

```
🤔 What are you testing?
│
├── 📊 Animation Logic, State, or Hooks?
│   └── ✅ Use Tier 1 (Unit Tests)
│       - AnimationStateMachine
│       - testAnimationHook()
│       - renderHook
│
├── 🔄 Component Behavior or DOM Changes?
│   └── ✅ Use Tier 2 (Integration Tests)
│       - render + timer utilities
│       - mockAnimationProperties() if needed
│       - waitFor for timing
│
└── 👁️ Visual Animation or CSS Execution?
    └── ⏳ Use Tier 3 (Future E2E Tests)
        - Playwright/Cypress
        - Real browser testing
```

## Integration with Existing Timer Utilities

Our animation testing strategy builds on the existing timer utilities from `timer-helpers.ts`:

### **Tier 1 Integration**:
```typescript
import { setupFakeTimers, advanceTimersByTimeAndAct } from '../test-utils/timer-helpers';
import { testAnimationHook } from '../test-utils/animation-state-testing';

// Use timer utilities within animation state testing
const { result } = testAnimationHook(() => useAnimationHook());

await advanceTimersByTimeAndAct(1000); // Advance animation logic timing
```

### **Tier 2 Integration**:
```typescript
import { setupRealTimers, cleanupTimers } from '../test-utils/timer-helpers';

beforeEach(() => {
  setupRealTimers(); // Use real timers for behavior testing
});

afterEach(async () => {
  await cleanupTimers(); // Proper cleanup
});
```

## Common JSDOM Animation Testing Issues & Solutions

### ❌ **Problem**: Tests expecting CSS keyframe animations to execute
```typescript
// WRONG - This will fail in JSDOM
it('should animate opacity from 0 to 1', () => {
  render(<FadeInComponent />);
  const element = screen.getByTestId('element');
  
  // This will fail - JSDOM doesn't execute CSS animations
  expect(getComputedStyle(element).opacity).toBe('1');
});
```

✅ **Solution**: Test behavior, not visual execution
```typescript
// CORRECT - Test the behavior and state changes
it('should apply fade-in class when triggered', () => {
  render(<FadeInComponent />);
  const element = screen.getByTestId('element');
  
  fireEvent.click(screen.getByText('Fade In'));
  
  // Test class application, not CSS execution
  expect(element).toHaveClass('fade-in-active');
});
```

### ❌ **Problem**: Using getComputedStyle for animation properties
```typescript
// WRONG - JSDOM getComputedStyle doesn't return animation values
const animationName = getComputedStyle(element).animationName;
expect(animationName).toBe('slideUp'); // Will be 'none' in JSDOM
```

✅ **Solution**: Use CSS mocking utilities
```typescript
// CORRECT - Mock the CSS properties
mockAnimationProperties('.slide-up', {
  animationName: 'slideUp',
  animationDuration: '0.3s'
});

const animationState = getAnimationState(element);
expect(animationState.animationName).toBe('slideUp');
```

### ❌ **Problem**: Testing visual animation timing
```typescript
// WRONG - Testing actual CSS animation timing
it('should complete animation in 300ms', async () => {
  render(<AnimatedComponent />);
  
  const start = Date.now();
  // Wait for CSS animation to complete (won't work in JSDOM)
  await waitFor(() => {
    expect(getComputedStyle(element).animationPlayState).toBe('finished');
  });
  
  const duration = Date.now() - start;
  expect(duration).toBeCloseTo(300, 50);
});
```

✅ **Solution**: Test animation logic timing
```typescript
// CORRECT - Test the logic timing with keyframe utilities
it('should complete animation logic in 300ms', async () => {
  const timeline = await simulateKeyframePhases({
    name: 'test-animation',
    duration: 300
  });
  
  expect(timeline.endTime - timeline.startTime).toBeCloseTo(300, 50);
});
```

## Migration Guide: Converting Existing Tests

### **Step 1**: Identify the Test Type
- **Logic/State testing** → Tier 1
- **Behavior/DOM testing** → Tier 2  
- **Visual/CSS testing** → Tier 3 (future) or convert to Tier 2

### **Step 2**: Update Imports
```typescript
// Add these imports based on tier
import { testAnimationHook } from '../test-utils/animation-state-testing'; // Tier 1
import { mockAnimationProperties } from '../test-utils/css-animation-mocking'; // Tier 2
import { setupRealTimers, cleanupTimers } from '../test-utils/timer-helpers'; // Tier 2
```

### **Step 3**: Refactor Test Logic
```typescript
// Before (CSS-dependent)
it('should have correct animation', () => {
  render(<Component />);
  const element = screen.getByTestId('element');
  expect(getComputedStyle(element).animationName).toBe('fadeIn');
});

// After (Tier 2 - Behavior focused)
it('should apply animation class', () => {
  mockAnimationProperties('.fade-in', { animationName: 'fadeIn' });
  render(<Component />);
  
  const element = screen.getByTestId('element');
  expect(element).toHaveClass('fade-in');
  
  const animationState = getAnimationState(element);
  expect(animationState.animationName).toBe('fadeIn');
});
```

### **Step 4**: Add Proper Setup/Cleanup
```typescript
describe('Animation Tests', () => {
  beforeEach(() => {
    setupRealTimers(); // For Tier 2 tests
  });
  
  afterEach(async () => {
    await cleanupTimers(); // Always cleanup
  });
  
  // Your tests here
});
```

## API Reference

### **Animation State Testing (`animation-state-testing.ts`)**

| Function | Purpose | Tier |
|----------|---------|------|
| `AnimationStateMachine` | Test state transitions | 1 |
| `testAnimationHook()` | Test animation hooks | 1 |
| `MockAnimationContext` | Provide mock context | 1 |
| `createMockAnimationState()` | Create mock state | 1 |
| `validateStateTransition()` | Validate transitions | 1 |

### **CSS Animation Mocking (`css-animation-mocking.ts`)**

| Function | Purpose | Tier |
|----------|---------|------|
| `mockAnimationProperties()` | Mock CSS properties | 2 |
| `mockKeyframeAnimations()` | Mock keyframe animations | 2 |
| `getAnimationState()` | Get animation state | 2 |
| `hasAnimationProperty()` | Check CSS property | 2 |
| `restoreComputedStyle()` | Cleanup mocking | 2 |

### **Keyframe Testing (`keyframe-testing.ts`)**

| Function | Purpose | Tier |
|----------|---------|------|
| `KeyframeAnimationTester` | Test animation phases | 1-2 |
| `simulateKeyframePhases()` | Simulate progression | 1-2 |
| `MockKeyframeTimeline` | Timeline management | 1-2 |
| `validateAnimationPhase()` | Validate phases | 1-2 |
| `waitForAnimationPhase()` | Wait for phase | 1-2 |

## Best Practices

### ✅ **Do**:
- Use Tier 1 for testing animation logic and state
- Use Tier 2 for testing component behavior and DOM changes
- Use existing timer utilities for proper timing control
- Mock CSS properties when you need to verify animation state
- Clean up properly with `cleanupTimers()` and `restoreComputedStyle()`
- Separate concerns clearly between tiers

### ❌ **Don't**:
- Try to test actual CSS animation execution in JSDOM
- Use `getComputedStyle` for animation properties without mocking
- Mix testing concerns between tiers
- Forget to clean up after tests
- Use fake timers with complex animations (prefer real timers)

## Performance Considerations

- **Tier 1 tests**: < 1 second execution time
- **Tier 2 tests**: < 5 seconds execution time  
- **Tier 3 tests**: < 30 seconds execution time (future)

## Troubleshooting

### **Test hanging indefinitely**:
- Ensure you're using `setupRealTimers()` for animation tests
- Add proper `cleanupTimers()` in `afterEach`
- Check for infinite loops in animation logic

### **CSS properties returning 'none'**:
- Use `mockAnimationProperties()` to mock expected values
- Don't rely on JSDOM's `getComputedStyle` for animation properties

### **Act() warnings in animation tests**:
- Use existing timer utilities from `timer-helpers.ts`
- All timer operations are already wrapped in `act()`

### **Tests failing randomly**:
- Ensure proper test isolation with cleanup functions
- Use consistent timer strategies (real vs fake)
- Check for state bleeding between tests

---

This strategy enables comprehensive animation testing while working within JSDOM's limitations, providing clear guidelines for what to test at each level and how to implement those tests effectively.