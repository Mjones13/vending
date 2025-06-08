# Implementation Plan: Homepage Rotating Text Fixes

## Background/Motivation

The homepage hero section contains rotating text that displays different words ("Workplaces", "Apartments", "Gyms", "Businesses") after the phrase "Premium Amenity for Modern". Currently, there are three critical issues:

1. **Vertical Alignment Issue**: The rotating words appear slightly higher than the baseline text "Modern", creating a misaligned appearance
2. **Animation Timing Glitches**: The rotation animation occasionally glitches, causing words to not display or display incorrectly
3. **Word Cycling Issue**: When the rotation reaches the end of the word list, it fails to properly cycle back to the first word, causing the sequence to break

These issues impact the professional appearance and user experience of the homepage hero section.

## Key Challenges

1. **CSS Baseline Alignment**: Ensuring rotating text aligns perfectly with static text baseline
2. **Animation State Management**: Preventing timing conflicts and glitches in the rotation cycle
3. **Word List Cycling Logic**: Ensuring proper array index management and seamless looping
4. **Cross-Browser Consistency**: Maintaining alignment across different browsers and screen sizes
5. **Responsive Design**: Ensuring alignment works across all viewport sizes
6. **Performance**: Optimizing animations to prevent frame drops or glitches

## Technical Analysis

### Current Implementation Issues:

#### **Issue 1: Vertical Alignment**
- `.rotating-text` uses `position: absolute` with `top: 0`
- Container has `vertical-align: baseline` but absolute positioning breaks baseline alignment
- No specific baseline correction applied to match surrounding text

#### **Issue 2: Animation Timing**
- Complex state machine with multiple setTimeout calls
- Potential race conditions between exit/enter animations
- No animation frame synchronization
- State transitions can overlap causing glitches

#### **Issue 3: Word Cycling Logic**
- Current modulo operation: `(prevIndex + 1) % rotatingWords.length`
- Array index management fails when timing conflicts occur
- No safeguards against invalid array indices
- Cycling logic doesn't handle edge cases (empty arrays, single words)
- State updates may be lost during React re-renders

## High-Level Task Breakdown

### Phase 1: Analysis and Test Setup
- [x] **Task 1.1**: Analyze current implementation and identify specific alignment issues
- [x] **Task 1.2**: Create comprehensive test framework for rotation timing and alignment
- [x] **Task 1.3**: Set up visual regression testing for alignment verification
- [x] **Task 1.4**: Document current behavior and expected behavior specifications

### Phase 2: CSS Alignment Fixes
- [ ] **Task 2.1**: Fix vertical baseline alignment using CSS transforms and positioning
- [ ] **Task 2.2**: Implement consistent line-height and font metrics alignment
- [ ] **Task 2.3**: Add cross-browser compatibility fixes for text baseline
- [ ] **Task 2.4**: Optimize container sizing and overflow handling

### Phase 3: Animation Timing and Cycling Fixes
- [ ] **Task 3.1**: Refactor animation state management to prevent race conditions
- [ ] **Task 3.2**: Fix word cycling logic with robust array index management
- [ ] **Task 3.3**: Implement requestAnimationFrame-based timing for smooth transitions
- [ ] **Task 3.4**: Add animation event listeners for reliable state transitions
- [ ] **Task 3.5**: Create fail-safe mechanisms to prevent stuck animations

### Phase 4: Comprehensive Testing
- [ ] **Task 4.1**: Create automated tests for baseline alignment verification
- [ ] **Task 4.2**: Implement timing accuracy tests for rotation cadence
- [ ] **Task 4.3**: Add comprehensive word cycling sequence validation
- [ ] **Task 4.4**: Add cross-browser and responsive design validation
- [ ] **Task 4.5**: Performance testing for smooth 60fps animations

### Phase 5: Validation and Documentation
- [ ] **Task 5.1**: User acceptance testing with visual alignment verification
- [ ] **Task 5.2**: Performance benchmarking and optimization
- [ ] **Task 5.3**: Documentation updates for maintenance
- [ ] **Task 5.4**: Implementation of monitoring for ongoing animation health

## Detailed Implementation Strategy

### Task 1.2: Comprehensive Test Framework

#### **Alignment Tests**
```typescript
// Test vertical alignment consistency
describe('Homepage Rotating Text Alignment', () => {
  it('should align rotating text baseline with static text', async () => {
    // Measure baseline positions of "Modern" and rotating word
    // Verify they are within 1px tolerance
  });
  
  it('should maintain alignment across all rotating words', async () => {
    // Test each word individually for consistent alignment
  });
  
  it('should preserve alignment during animations', async () => {
    // Verify alignment during enter/exit transitions
  });
});
```

#### **Timing Tests**
```typescript
// Test animation cadence and reliability
describe('Homepage Rotating Text Timing', () => {
  it('should rotate words every 3 seconds consistently', async () => {
    // Verify precise 3000ms intervals
  });
  
  it('should complete transitions without glitches', async () => {
    // Monitor for stuck animations or incomplete transitions
  });
  
  it('should handle rapid component mounting/unmounting', async () => {
    // Test timing resilience under React lifecycle changes
  });
});
```

#### **Word Cycling Tests**
```typescript
// Test word sequence cycling logic
describe('Homepage Rotating Text Cycling', () => {
  it('should cycle through all words in correct order', async () => {
    // Verify: Workplaces → Apartments → Gyms → Businesses → Workplaces
    const expectedSequence = ['Workplaces', 'Apartments', 'Gyms', 'Businesses'];
    // Test multiple complete cycles
  });
  
  it('should properly loop back to first word after last word', async () => {
    // Specifically test the transition from "Businesses" back to "Workplaces"
  });
  
  it('should handle edge cases with word array changes', async () => {
    // Test cycling with different array lengths and dynamic changes
  });
  
  it('should maintain sequence integrity during timing glitches', async () => {
    // Verify cycling continues correctly even if timing is disrupted
  });
});
```

### Task 2.1: CSS Alignment Solution

#### **Root Cause Analysis**
The alignment issue stems from:
1. `position: absolute` breaking normal text flow baseline alignment
2. No explicit baseline correction to match surrounding text metrics
3. Container dimensions not accounting for proper text baseline

#### **Proposed CSS Fix**
```css
.rotating-text-container {
  display: inline-block;
  position: relative;
  min-width: 330px;
  height: 1.2em;
  overflow: hidden;
  vertical-align: baseline;
  line-height: inherit;
  /* ADD: Baseline correction */
  top: 0.1em; /* Fine-tune based on font metrics */
}

.rotating-text {
  color: var(--color-primary-600);
  display: inline-block;
  position: absolute;
  /* CHANGE: Use baseline-relative positioning */
  top: 0;
  left: 0;
  width: 100%;
  white-space: nowrap;
  line-height: inherit;
  /* ADD: Ensure consistent font baseline */
  font-feature-settings: 'kern' 1;
  text-rendering: geometricPrecision;
}
```

### Task 3.1: Animation State Management Refactor

#### **Current State Machine Issues**
- Multiple nested setTimeout calls create race conditions
- No animation frame synchronization
- State transitions can overlap
- Word cycling logic embedded within timing logic causing coupling

#### **Current Problematic Code**
```typescript
// Current implementation with issues
setCurrentWordIndex((prevIndex) => (prevIndex + 1) % rotatingWords.length);
// Problems:
// 1. State update timing not guaranteed
// 2. No bounds checking for edge cases
// 3. Modulo operation can fail with dynamic array changes
```

#### **Proposed Solution: Robust Cycling with RAF-Based Timer**
```typescript
// Robust word cycling utility
const getNextWordIndex = (currentIndex: number, wordsArray: string[]): number => {
  if (!wordsArray || wordsArray.length === 0) return 0;
  if (wordsArray.length === 1) return 0;
  
  const nextIndex = currentIndex + 1;
  // Explicit bounds checking instead of relying solely on modulo
  return nextIndex >= wordsArray.length ? 0 : nextIndex;
};

useEffect(() => {
  let animationId: number;
  let startTime = performance.now();
  let lastWordChangeTime = startTime;
  
  const CYCLE_DURATION = 3000;
  const TRANSITION_DURATION = 400;
  
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const cycleProgress = (elapsed % CYCLE_DURATION) / CYCLE_DURATION;
    
    // Determine animation state based on cycle progress
    if (cycleProgress < 0.8) {
      // Visible state (80% of cycle)
      if (animationState !== 'visible') {
        setAnimationState('visible');
      }
    } else if (cycleProgress < 0.9) {
      // Exit state (10% of cycle)
      if (animationState !== 'exiting') {
        setAnimationState('exiting');
      }
    } else {
      // Enter state (10% of cycle)
      if (animationState !== 'entering') {
        // Robust word cycling with safety checks
        setCurrentWordIndex((prevIndex) => {
          const nextIndex = getNextWordIndex(prevIndex, rotatingWords);
          console.log(`Word cycling: ${prevIndex} → ${nextIndex} (${rotatingWords[nextIndex]})`);
          return nextIndex;
        });
        setAnimationState('entering');
        lastWordChangeTime = currentTime;
      }
    }
    
    animationId = requestAnimationFrame(animate);
  };
  
  animationId = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(animationId);
}, [rotatingWords.length, animationState]);

// Add safeguard effect for stuck states
useEffect(() => {
  const timeoutId = setTimeout(() => {
    // If animation gets stuck, reset to visible state
    if (animationState !== 'visible') {
      console.warn('Animation state reset due to timeout');
      setAnimationState('visible');
    }
  }, 2000); // Reset if stuck for more than 2 seconds
  
  return () => clearTimeout(timeoutId);
}, [animationState]);
```

### Task 4.1: Automated Alignment Tests

#### **Visual Alignment Verification**
```typescript
// test-utils/alignment-testing.ts
export const measureTextBaseline = async (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  
  // Calculate text baseline using font metrics
  const fontSize = parseFloat(style.fontSize);
  const lineHeight = parseFloat(style.lineHeight);
  const fontFamily = style.fontFamily;
  
  // Use Canvas API to measure precise text metrics
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  context.font = `${fontSize}px ${fontFamily}`;
  const metrics = context.measureText('Modern');
  
  return {
    baseline: rect.top + metrics.actualBoundingBoxAscent,
    height: rect.height,
    width: rect.width
  };
};

export const verifyBaselineAlignment = async (
  staticElement: HTMLElement,
  rotatingElement: HTMLElement,
  tolerance = 1
) => {
  const staticBaseline = await measureTextBaseline(staticElement);
  const rotatingBaseline = await measureTextBaseline(rotatingElement);
  
  const difference = Math.abs(staticBaseline.baseline - rotatingBaseline.baseline);
  
  return {
    aligned: difference <= tolerance,
    difference,
    staticBaseline: staticBaseline.baseline,
    rotatingBaseline: rotatingBaseline.baseline
  };
};
```

#### **Animation Timing Tests**
```typescript
// __tests__/animations/rotating-text-timing.test.tsx
describe('Rotating Text Timing Accuracy', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  
  it('should rotate words at exactly 3-second intervals', async () => {
    const { getByTestId } = render(<Home />);
    const rotatingText = getByTestId('rotating-text');
    
    const initialWord = rotatingText.textContent;
    
    // Advance time by exactly 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    await waitFor(() => {
      expect(rotatingText.textContent).not.toBe(initialWord);
    });
    
    // Verify next rotation
    const secondWord = rotatingText.textContent;
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    await waitFor(() => {
      expect(rotatingText.textContent).not.toBe(secondWord);
    });
  });
  
  it('should never display empty text during transitions', async () => {
    const { getByTestId } = render(<Home />);
    const rotatingText = getByTestId('rotating-text');
    
    // Monitor text content during multiple cycles
    const observations: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      act(() => {
        jest.advanceTimersByTime(300); // Check every 300ms
      });
      
      await waitFor(() => {
        observations.push(rotatingText.textContent || 'EMPTY');
      });
    }
    
    // Verify no empty states
    expect(observations).not.toContain('EMPTY');
    expect(observations).not.toContain('');
  });
  
  it('should complete full word cycling sequence correctly', async () => {
    const { getByTestId } = render(<Home />);
    const rotatingText = getByTestId('rotating-text');
    
    const expectedSequence = ['Workplaces', 'Apartments', 'Gyms', 'Businesses'];
    const observedSequence: string[] = [];
    
    // Capture initial word
    await waitFor(() => {
      observedSequence.push(rotatingText.textContent || '');
    });
    
    // Advance through complete cycles and capture each word
    for (let cycle = 0; cycle < 2; cycle++) { // Test 2 complete cycles
      for (let word = 0; word < expectedSequence.length; word++) {
        act(() => {
          jest.advanceTimersByTime(3000); // Full rotation interval
        });
        
        await waitFor(() => {
          const currentWord = rotatingText.textContent || '';
          observedSequence.push(currentWord);
        });
      }
    }
    
    // Verify proper cycling pattern
    expect(observedSequence[0]).toBe('Workplaces'); // Initial
    expect(observedSequence[1]).toBe('Apartments'); // First transition
    expect(observedSequence[4]).toBe('Workplaces'); // Back to start after full cycle
    expect(observedSequence[5]).toBe('Apartments'); // Second cycle starts correctly
    
    // Verify no unexpected words or empty states
    observedSequence.forEach(word => {
      expect(expectedSequence).toContain(word);
      expect(word).not.toBe('');
    });
  });
});
```

## Success Criteria

### **Alignment Requirements**
- [ ] Rotating text baseline aligns within 1px of static text baseline
- [ ] Alignment maintained across all 4 rotating words
- [ ] Consistent alignment across all viewport sizes (320px - 2560px)
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

### **Timing Requirements**
- [ ] Word rotation occurs every 3000ms ±50ms
- [ ] No glitches, stuck animations, or missing words
- [ ] Smooth 60fps transitions with no frame drops
- [ ] Reliable operation after 100+ rotation cycles

### **Word Cycling Requirements**
- [ ] Complete sequence: Workplaces → Apartments → Gyms → Businesses → Workplaces (loops perfectly)
- [ ] No skipped words or out-of-order sequences
- [ ] Proper cycling after component re-renders or state changes
- [ ] Robust handling of edge cases (empty arrays, single words, dynamic changes)

### **Quality Assurance**
- [ ] 100% automated test coverage for alignment, timing, and cycling
- [ ] Visual regression tests pass across all screen sizes
- [ ] Performance tests show <2ms animation overhead
- [ ] Accessibility tests confirm proper screen reader compatibility
- [ ] Word cycling sequence validation across multiple complete cycles

## Expected Deliverables

### **Code Changes**
1. **CSS fixes** for baseline alignment in rotating text styles
2. **JavaScript refactor** of animation timing using RAF
3. **Robust word cycling logic** with proper array index management
4. **Test data attributes** added for reliable test targeting
5. **Performance optimizations** for smooth animations
6. **Safeguard mechanisms** to prevent stuck animations and cycling issues

### **Test Suite**
1. **Alignment verification tests** with pixel-perfect accuracy
2. **Timing accuracy tests** with millisecond precision
3. **Word cycling sequence validation** with multi-cycle verification
4. **Cross-browser compatibility tests** 
5. **Performance benchmarking tests**
6. **Visual regression test screenshots**
7. **Edge case handling tests** for robust cycling logic

### **Documentation**
1. **Technical documentation** of alignment solution
2. **Animation architecture** documentation for maintenance
3. **Word cycling logic** documentation with edge case handling
4. **Test coverage reports** with detailed metrics
5. **Performance benchmarking results**

## Implementation Timeline

- **Phase 1**: 1-2 hours (analysis and test setup)
- **Phase 2**: 2-3 hours (CSS alignment fixes)
- **Phase 3**: 3-5 hours (animation timing and cycling refactor)
- **Phase 4**: 3-4 hours (comprehensive testing including cycling validation)
- **Phase 5**: 1-2 hours (validation and documentation)

**Total estimated time**: 10-16 hours

## Risk Mitigation

### **Potential Risks**
1. **Cross-browser font rendering differences** affecting alignment
2. **React re-render timing** interfering with animations
3. **Performance impact** from RAF-based timing
4. **Accessibility concerns** with text animations
5. **Word cycling edge cases** with dynamic array changes
6. **State synchronization issues** between animation and cycling logic

### **Mitigation Strategies**
1. **Extensive cross-browser testing** with automated validation
2. **React useCallback optimization** to prevent unnecessary re-renders
3. **Performance monitoring** with frame rate measurement
4. **Accessibility compliance** with prefers-reduced-motion support
5. **Comprehensive edge case testing** for word cycling scenarios
6. **Safeguard mechanisms** with timeout-based state recovery
7. **Explicit bounds checking** and array validation for robust cycling

---

**Status**: 📋 **READY FOR IMPLEMENTATION** - Plan approved and ready for execution