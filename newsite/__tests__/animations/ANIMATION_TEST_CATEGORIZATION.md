# Animation Test Categorization

This document categorizes all animation tests according to the Three-Tier Testing Strategy for CSS animations in JSDOM environments.

## Testing Strategy Overview

### Tier 1: Animation Logic Testing
Tests pure logic, state machines, calculations, and algorithms without DOM rendering.
- Uses animation state utilities (`testAnimationHook`, `createTestStateMachine`, `AnimationStateMachine`)
- No DOM dependencies
- Fast execution
- Focuses on the "what" and "when" of animations

### Tier 2: Component Behavior Testing  
Tests DOM interactions, class changes, timing behavior, and component responses.
- Uses existing timer utilities and CSS mocking
- Tests DOM changes and user interactions
- Medium execution time
- Focuses on the "how" animations affect the component

### Tier 3: Visual/E2E Testing (Future)
Tests actual visual effects and cross-browser compatibility.
- Requires real browsers or visual testing tools
- Not implemented in current JSDOM test suite
- Reserved for future Playwright/Cypress integration

## Test File Categorization

### Tier 1 & 2 Mixed Files

#### `rotating-text.test.tsx`
- **Tier 1 Tests**: Animation Logic
  - Animation State Machine Logic
  - Animation Timing Logic  
- **Tier 2 Tests**: Component Behavior
  - Component State Behavior
  - CSS Class Application
  - Component Timing Behavior
  - DOM Structure and Container Behavior
  - React Component Behavior
  - Component Resilience

#### `rotating-text-cycling.test.tsx`
- **Tier 1 Tests**: Animation Logic
  - Word Cycling Algorithm Logic
- **Tier 2 Tests**: Component Behavior
  - DOM Text Content Cycling
  - DOM Complete Cycle Validation
  - Component State and CSS Class Management
  - Component Edge Case Handling

#### `rotating-text-timing.test.tsx`
- **Tier 1 Tests**: Animation Logic
  - Timing Algorithm Logic
- **Tier 2 Tests**: Component Behavior
  - Component Timing Accuracy
  - Component State Timing Behavior
  - Component Performance Behavior
  - Component Lifecycle Timing Behavior
  - Component Error Recovery Timing

#### `logo-stagger.test.tsx`
- **Tier 1 Tests**: Animation Logic
  - Stagger Algorithm Logic
- **Tier 2 Tests**: Component Behavior
  - Staggered Animation Timing
  - Animation CSS Properties
  - Logo Content and Accessibility
  - Component State and Class Management
  - Performance and Efficiency
  - Edge Cases

### Tier 2 Focused Files

#### `hover-transitions.test.tsx` - Component Behavior
- Button Hover Effects
- Card Hover Effects  
- Header Scroll Effects
- Transition Performance
- Accessibility Considerations
- Cross-browser Compatibility

#### `rotating-text-alignment.test.tsx` - Component Behavior
- Baseline Alignment
- Responsive Alignment
- DOM Structure and Behavior Analysis
- Font Loading and Rendering

## Testing Utilities Usage

### Tier 1 Utilities
- `testAnimationHook()` - Test React hooks with animation logic
- `createTestStateMachine()` - Create and validate animation state machines
- `AnimationStateMachine` - State machine for animation phases
- `KeyframeAnimationTester` - Simulate keyframe progressions
- `simulateKeyframePhases()` - Test animation timing without CSS

### Tier 2 Utilities
- `mockAnimationProperties()` - Mock CSS animation properties
- `clearAnimationMocks()` - Clean up CSS mocks
- Timer utilities from `timer-helpers.ts` - Handle component timing
- Standard testing library utilities for DOM interactions

### CSS Property Mocking Examples

```typescript
// Tier 2 setup for animation behavior testing
beforeEach(() => {
  mockAnimationProperties('.rotating-text', {
    animationName: 'textRotate',
    animationDuration: '3s',
    animationIterationCount: 'infinite'
  })
  
  mockAnimationProperties('.btn', {
    transitionProperty: 'all',
    transitionDuration: '0.3s',
    transitionTimingFunction: 'ease'
  })
})

afterEach(() => {
  clearAnimationMocks()
})
```

## Test Distribution Summary

- **Total Animation Test Files**: 6
- **Files with Tier 1 + Tier 2**: 4 (rotating-text.test.tsx, rotating-text-cycling.test.tsx, rotating-text-timing.test.tsx, logo-stagger.test.tsx)
- **Files with Tier 2 Only**: 2 (hover-transitions.test.tsx, rotating-text-alignment.test.tsx)
- **Files with Tier 1 Only**: 0 (All logic tests include some component behavior verification)

## Future Tier 3 Test Placeholders

The following test scenarios should be implemented as Tier 3 visual/E2E tests when browser testing is available:

### Visual Animation Effects
- Smooth transition appearances (opacity, transforms)
- Stagger animation visual synchronization
- Cross-browser animation rendering consistency
- Animation performance under various system loads

### User Experience Testing
- Animation responsiveness to user interactions
- Visual feedback timing perception
- Accessibility motion preferences respect
- Touch/mobile interaction animations

### Integration Testing
- Multiple concurrent animation interactions
- Page-level animation coordination
- Real font loading impact on animations
- Performance impact on page rendering

## Maintenance Guidelines

1. **New Animation Features**: Always start with Tier 1 logic tests, then add Tier 2 behavior tests
2. **CSS Changes**: Update corresponding `mockAnimationProperties()` calls in affected tests
3. **Performance Issues**: Use Tier 1 tests for algorithm optimization, Tier 2 for component performance
4. **Browser Issues**: Document as Tier 3 requirements for future implementation

## Related Documentation

- [Three-Tier Testing Strategy](../docs/animation-testing-strategy.md)
- [Timer Utilities Guide](../docs/testing-guide.md)
- [CSS Animation Mocking](../test-utils/css-animation-mocking.ts)
- [Animation State Testing](../test-utils/animation-state-testing.ts)