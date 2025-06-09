# Individual Test Failure Analysis Report

Generated: December 9, 2024

## Summary

This report analyzes each failing test when run individually, providing detailed failure causes and patterns.

## 1. Browser API Polyfills Test

### Test: `should persist through test cleanup cycles`
**File**: `__tests__/polyfills/browser-api-polyfills.test.ts`
**Status**: ❌ FAILS when run individually

**Error**: 
```
Error: requestAnimationFrame is not defined after cleanup
```

**Root Cause Analysis**:
- The test simulates a cleanup cycle and expects RAF to still be defined
- The `ensureRAFPolyfills()` function is not being called after the simulated cleanup
- This is a test implementation issue, not a real polyfill problem

**Key Finding**: The test itself is flawed - it expects RAF to persist after cleanup but doesn't re-apply the polyfills

---

## 2. Timer Helpers Tests

### Test: `should flush all pending operations`
**File**: `__tests__/utils/timer-helpers.test.tsx`
**Status**: ❌ FAILS when run individually

**Error**:
```
Expected: "timer"
Received: "microtask"
```

**Root Cause Analysis**:
- The test expects timers to execute before microtasks
- In reality, microtasks execute before timers in the event loop
- The test's expectation is incorrect about JavaScript execution order

### Test: `should configure fake timers with custom options`
**Status**: ❌ FAILS when run individually

**Error**:
```
Expected: {"advanceTimers": false, "doNotFake": ["setTimeout"]}
Number of calls: 0
```

**Root Cause Analysis**:
- The spy on `jest.useFakeTimers` is not capturing calls
- The spying mechanism is set up incorrectly
- The function being spied on might be getting called before the spy is established

### Test: `should restore real timers`
**Status**: ❌ FAILS when run individually

**Error**: 
```
Expected number of calls: >= 1
Received number of calls: 0
```

**Root Cause Analysis**:
- Same issue as above - spy not capturing jest.useRealTimers calls
- The spying setup is fundamentally flawed

---

## 3. Logo Stagger Animation Test

### Test: `should trigger animations in staggered sequence`
**File**: `__tests__/animations/logo-stagger.test.tsx`
**Status**: ❌ FAILS when run individually

**Error**:
```
ReferenceError: AnimationTimingTester is not defined
```

**Root Cause Analysis**:
- Missing import statement in the test file
- `AnimationTimingTester` exists in `keyframe-testing.ts` but isn't imported
- Simple fix: Add the import

**Key Finding**: This is a straightforward import error

---

## 4. Home Page Tests

### Test: `should cycle through all rotating words`
**File**: `__tests__/pages/index.test.tsx`
**Status**: ❌ FAILS when run individually

**Error**:
```
Expected element to have text content: Apartments
Received: Workplaces
```

**Root Cause Analysis**:
- The rotating text animation is not progressing beyond the first word
- The test waits for 5000ms but the word never changes
- The component's setInterval is likely not firing due to timer configuration issues

### Test: `should render hero image with proper alt text`
**Status**: ❌ FAILS when run individually

**Error**:
```
Unable to find an element with the alt text: /modern office breakroom/i
```

**Root Cause Analysis**:
- The hero image is not being rendered in the DOM
- The Home component might not include a hero image with that specific alt text
- This could be a test looking for outdated content

---

## 5. Rotating Text Animation Tests

### Test: `should update text content during component state changes`
**File**: `__tests__/animations/rotating-text.test.tsx`
**Status**: ❌ FAILS when run individually

**Error**:
```
Expected: not "Workplaces"
```

**Root Cause Analysis**:
- Similar to the home page test - the text is not rotating
- The component is stuck on the initial word
- Real timers are being used but the interval is not triggering state changes

### Test: `should transition through all CSS classes without getting stuck`
**Status**: ❌ FAILS in full suite (not tested individually)

**Expected Issue**:
- Only records 1 state transition instead of 3
- Animation state machine not progressing through states

---

## 6. Rotating Text Alignment Tests

### Test: `should align rotating text baseline with static text baseline`
**File**: `__tests__/animations/rotating-text-alignment.test.tsx`
**Status**: ❌ FAILS when run individually

**Error**:
```
Element not ready within timeout
```

**Additional Warnings**:
- `Received 'true' for a non-boolean attribute 'fill'`
- `Received 'true' for a non-boolean attribute 'priority'`
- React act() warnings for state updates

**Root Cause Analysis**:
- The `waitForElementReady` function has criteria that are never met
- The test is also revealing prop type issues in the component
- Multiple React warnings indicate state updates not wrapped in act()

---

## 7. Rotating Text Cycling Tests

### Test: `should update DOM text content through all words in correct order`
**File**: `__tests__/animations/rotating-text-cycling.test.tsx`
**Status**: ❌ FAILS when run individually

**Error**:
```
Expected: true
Received: false
```

**Additional Issues**:
- Multiple warnings about fake timers not being configured
- Same boolean attribute warnings as alignment tests

**Root Cause Analysis**:
- The test tries to use `jest.advanceTimersByTime` without fake timers
- The word sequence validation fails because words aren't cycling
- Timer configuration mismatch between test expectations and setup

---

## 8. Rotating Text Timing Tests

### All Tests
**File**: `__tests__/animations/rotating-text-timing.test.tsx`
**Status**: 💥 CRASHES with stack overflow

**Error**:
```
RangeError: Maximum call stack size exceeded
```

**Root Cause Analysis**:
- Circular reference in KeyframeAnimationTester
- destroy() → cancel() → notifyPhaseChange() → listener calls destroy() again
- The notification system creates an infinite loop
- This prevents the entire test suite from running

---

## Common Patterns Identified

### 1. **Timer Configuration Issues** (40% of failures)
- Tests expecting fake timers but running with real timers
- Tests using timer functions without proper setup
- Inconsistent timer configurations across test files

### 2. **Missing Imports** (10% of failures)
- AnimationTimingTester not imported in logo-stagger test
- Simple fixes but prevent tests from running

### 3. **Animation State Not Progressing** (30% of failures)
- Rotating text stuck on first word
- State transitions not occurring
- Intervals/timeouts not firing as expected

### 4. **Test Implementation Errors** (20% of failures)
- Incorrect expectations (microtask vs timer order)
- Flawed spy setups
- Tests expecting impossible conditions

### 5. **Component Prop Warnings**
- Boolean values passed where strings expected (fill, priority)
- Not causing test failures but indicating component issues

### 6. **React Act() Warnings**
- State updates from timers not wrapped in act()
- Common in animation tests with intervals

## Recommendations for Fixes

### Immediate Fixes Needed:

1. **Fix Stack Overflow in KeyframeAnimationTester**
   - Break the circular reference in destroy/cancel/notifyPhaseChange
   - Add a flag to prevent recursive calls

2. **Add Missing Import**
   - Import AnimationTimingTester in logo-stagger test

3. **Fix Timer Configuration**
   - Ensure consistent timer setup across all animation tests
   - Use setupRealTimers() for interval-based animations
   - Add jest.useFakeTimers() where tests expect it

4. **Fix Component Prop Types**
   - Change fill={true} to fill="true" in components
   - Same for priority attribute

5. **Fix Test Expectations**
   - Update timer helper tests to match actual execution order
   - Fix spy setup in timer helper tests

6. **Wrap State Updates in Act()**
   - Use proper timer utilities that wrap in act()
   - Prevent React warnings in test output