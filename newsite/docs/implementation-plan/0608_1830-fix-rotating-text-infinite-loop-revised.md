# Implementation Plan: Fix Rotating Text Animation Infinite Loop (REVISED)

## Background & Motivation

The rotating text animation is experiencing test failures due to an infinite loop. Initial analysis suggested missing `animationState` dependency, but deeper investigation reveals a more complex issue.

## Root Cause Analysis (REVISED)

The issue is NOT simply a missing dependency. Adding `animationState` to dependencies would actually cause MORE problems:

1. **Current Problem**: The animation reads stale `animationState` values from closure
2. **If We Add Dependency**: The effect would re-run every time `animationState` changes, creating multiple overlapping RAF loops
3. **Real Issue**: The animation logic is tightly coupled to React's render cycle in a way that conflicts with RAF's continuous nature

The pattern in the code shows:
- RAF runs continuously checking `animationState`
- When state doesn't match expected value, it updates state
- State updates trigger re-renders but don't restart the effect
- The RAF loop continues with stale closure values

## Research Findings

Based on best practices from CSS-Tricks, MDN, and React documentation:

1. **useRef for Animation Variables**: Animation frame IDs and persistent values should use useRef
2. **Minimize State Updates in RAF**: State updates in RAF loops can cause performance issues
3. **Use Function Updates**: When updating state based on previous values, always use function form
4. **Consider useLayoutEffect**: For timing-critical animations to prevent frame drops
5. **Separate Animation Logic**: Keep animation calculations separate from React lifecycle

## Recommended Solution

Instead of adding `animationState` to dependencies, we should refactor to use a more appropriate pattern:

### Option 1: Timer-Based Approach (Simpler, More Testable)
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    setAnimationState('exiting');
    
    setTimeout(() => {
      setCurrentWordIndex(prev => (prev + 1) % rotatingWords.length);
      setAnimationState('entering');
      
      setTimeout(() => {
        setAnimationState('visible');
      }, 400); // entering duration
    }, 400); // exiting duration
  }, 3000); // cycle duration
  
  return () => clearInterval(interval);
}, [rotatingWords.length]);
```

### Option 2: RAF with Refs (Performance Optimized)
```javascript
const animationStateRef = useRef('visible');
const progressRef = useRef(0);

useEffect(() => {
  let animationId;
  const startTime = performance.now();
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const cycleProgress = (elapsed % 3000) / 3000;
    
    // Use refs to track state without causing re-renders
    const prevState = animationStateRef.current;
    let newState;
    
    if (cycleProgress < 0.8) newState = 'visible';
    else if (cycleProgress < 0.9) newState = 'exiting';
    else newState = 'entering';
    
    // Only update React state when animation state actually changes
    if (newState !== prevState) {
      animationStateRef.current = newState;
      setAnimationState(newState);
      
      if (newState === 'entering') {
        setCurrentWordIndex(prev => (prev + 1) % rotatingWords.length);
      }
    }
    
    animationId = requestAnimationFrame(animate);
  };
  
  animationId = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(animationId);
}, [rotatingWords.length]);
```

## Why This Solution Works

1. **Timer-Based (Option 1)**:
   - No closure issues with state
   - Works well with Jest fake timers
   - Easier to test and debug
   - Slightly less smooth but imperceptible at 60fps

2. **RAF with Refs (Option 2)**:
   - Uses refs to avoid stale closures
   - Minimizes state updates
   - Better performance
   - More complex but follows best practices

## Implementation Plan

### Phase 1: Implement Timer-Based Solution
**Why**: Simpler to implement and test, will immediately fix the infinite loop

#### Task 1.1: Replace RAF with setInterval
- Remove requestAnimationFrame logic
- Implement setInterval-based animation
- Ensure proper cleanup

#### Task 1.2: Test with Jest
- Verify tests pass with fake timers
- Ensure no infinite loops
- Check animation timing

### Phase 2: Optimize if Needed
**Only if timer-based solution has performance issues**

#### Task 2.1: Implement RAF with Refs
- Add refs for animation state tracking
- Minimize React state updates
- Ensure smooth 60fps animation

#### Task 2.2: Add Performance Monitoring
- Measure frame rate
- Check for jank
- Profile memory usage

### Phase 3: Update Tests

#### Task 3.1: Fix Animation Tests
- Update expectations for new timing
- Ensure compatibility with fake timers
- Add tests for edge cases

#### Task 3.2: Add Integration Tests
- Test full animation cycle
- Verify word rotation
- Check state transitions

## Success Criteria

1. All tests pass within 20-second timeout
2. No infinite loops or memory leaks
3. Animation runs at consistent 3-second intervals
4. Smooth visual transitions
5. Works with both real and fake timers

## Risks and Mitigation

1. **Risk**: Timer-based approach might be less smooth
   - **Mitigation**: 60fps is indistinguishable from RAF for this use case
   
2. **Risk**: Tests might become flaky with timing
   - **Mitigation**: Use proper waitFor conditions and timeouts

3. **Risk**: Performance regression on low-end devices
   - **Mitigation**: Profile and optimize only if needed

## Recommended Approach

Start with **Option 1 (Timer-Based)** because:
- Simpler implementation
- Easier to test
- Fixes the immediate problem
- Can be optimized later if needed

The infinite loop issue is caused by the current RAF implementation reading stale state values. A timer-based approach avoids this entirely by using React's built-in scheduling mechanisms that properly capture current state.

## Testing Strategy

1. Unit tests for state transitions
2. Integration tests for full animation cycle
3. Performance tests if using RAF approach
4. Manual browser testing for visual smoothness

## Conclusion

The original plan to add `animationState` to dependencies would have made the problem worse. Instead, we should refactor to use a pattern that better separates animation timing from React's render cycle. The timer-based approach is recommended as it's simpler and more compatible with testing frameworks while still providing smooth animations.