# Animation Testing Examples

**Last Updated**: June 9, 2025  
**Purpose**: Complete working examples for each tier of animation testing

## Table of Contents
1. [Tier 1 Examples - Animation Logic](#tier-1-examples---animation-logic)
2. [Tier 2 Examples - Component Behavior](#tier-2-examples---component-behavior)
3. [Tier 3 Examples - Visual Validation](#tier-3-examples---visual-validation-future)
4. [Before/After Comparisons](#beforeafter-comparisons)

## Tier 1 Examples - Animation Logic

### Example 1: Animation State Machine Testing

**What it tests:** Pure state transition logic without DOM rendering  
**Why this approach:** State machines can be tested in isolation without visual rendering

```typescript
import { AnimationStateMachine, isAnimationRunning } from '../test-utils/animation-state-testing';

describe('Carousel Animation State Machine', () => {
  it('should handle complete animation lifecycle', () => {
    const stateMachine = new AnimationStateMachine('idle');
    
    // Test initial state
    expect(stateMachine.getCurrentState()).toBe('idle');
    expect(isAnimationRunning(stateMachine.getCurrentState())).toBe(false);
    
    // Test transition to loading
    stateMachine.transition('loading', 'data-fetch-start');
    expect(stateMachine.getCurrentState()).toBe('loading');
    
    // Test transition to running
    stateMachine.transition('running', 'data-loaded');
    expect(isAnimationRunning(stateMachine.getCurrentState())).toBe(true);
    
    // Test pause functionality
    stateMachine.transition('paused', 'user-interaction');
    expect(stateMachine.getCurrentState()).toBe('paused');
    expect(isAnimationRunning(stateMachine.getCurrentState())).toBe(false);
    
    // Test resume
    stateMachine.transition('running', 'user-resume');
    expect(isAnimationRunning(stateMachine.getCurrentState())).toBe(true);
    
    // Test completion
    stateMachine.transition('completed', 'animation-end');
    expect(stateMachine.getCurrentState()).toBe('completed');
    
    // Verify transition history
    const history = stateMachine.getTransitionHistory();
    expect(history).toHaveLength(5);
    expect(history[0]).toMatchObject({
      from: 'idle',
      to: 'loading',
      trigger: 'data-fetch-start'
    });
  });
});
```

### Example 2: Animation Hook Testing

**What it tests:** Custom hook logic for managing animations  
**Why this approach:** Hooks can be tested without component rendering using renderHook

```typescript
import { testAnimationHook } from '../test-utils/animation-state-testing';
import { act } from '@testing-library/react';

// The hook we're testing
function useSlideAnimation(duration: number = 300) {
  const [isSliding, setIsSliding] = React.useState(false);
  const [slideDirection, setSlideDirection] = React.useState<'left' | 'right'>('right');
  const [slideCount, setSlideCount] = React.useState(0);
  
  const slide = React.useCallback((direction: 'left' | 'right') => {
    setIsSliding(true);
    setSlideDirection(direction);
    setSlideCount(prev => prev + 1);
    
    setTimeout(() => {
      setIsSliding(false);
    }, duration);
  }, [duration]);
  
  return { isSliding, slideDirection, slideCount, slide };
}

describe('useSlideAnimation Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('should manage slide animation state correctly', () => {
    const { result } = testAnimationHook(() => useSlideAnimation(500));
    
    // Initial state
    expect(result.current.isSliding).toBe(false);
    expect(result.current.slideDirection).toBe('right');
    expect(result.current.slideCount).toBe(0);
    
    // Trigger slide left
    act(() => {
      result.current.slide('left');
    });
    
    expect(result.current.isSliding).toBe(true);
    expect(result.current.slideDirection).toBe('left');
    expect(result.current.slideCount).toBe(1);
    
    // Advance time to half duration
    act(() => {
      jest.advanceTimersByTime(250);
    });
    
    // Should still be sliding
    expect(result.current.isSliding).toBe(true);
    
    // Complete the animation
    act(() => {
      jest.advanceTimersByTime(250);
    });
    
    expect(result.current.isSliding).toBe(false);
    expect(result.current.slideCount).toBe(1); // Count remains
    
    // Test multiple slides
    act(() => {
      result.current.slide('right');
    });
    
    expect(result.current.slideDirection).toBe('right');
    expect(result.current.slideCount).toBe(2);
  });
});
```

### Example 3: Animation Timing Logic Testing

**What it tests:** Complex timing calculations and sequencing  
**Why this approach:** Timing logic can be tested as pure functions without visual rendering

```typescript
import { simulateKeyframePhases } from '../test-utils/keyframe-testing';
import { createTestStateMachine } from '../test-utils/animation-state-testing';

// Animation sequence manager
class AnimationSequencer {
  private sequences: Array<{ name: string; duration: number; delay: number }> = [];
  private currentIndex = 0;
  
  addAnimation(name: string, duration: number, delay: number = 0) {
    this.sequences.push({ name, duration, delay });
  }
  
  getTotalDuration(): number {
    return this.sequences.reduce((total, seq) => {
      return Math.max(total, seq.delay + seq.duration);
    }, 0);
  }
  
  getActiveAnimationAt(time: number): string | null {
    for (const seq of this.sequences) {
      if (time >= seq.delay && time < seq.delay + seq.duration) {
        return seq.name;
      }
    }
    return null;
  }
  
  getOverlappingAnimations(): Array<[string, string]> {
    const overlaps: Array<[string, string]> = [];
    
    for (let i = 0; i < this.sequences.length; i++) {
      for (let j = i + 1; j < this.sequences.length; j++) {
        const a = this.sequences[i];
        const b = this.sequences[j];
        
        const aEnd = a.delay + a.duration;
        const bEnd = b.delay + b.duration;
        
        if ((a.delay < bEnd && aEnd > b.delay)) {
          overlaps.push([a.name, b.name]);
        }
      }
    }
    
    return overlaps;
  }
}

describe('Animation Sequencer Timing Logic', () => {
  it('should calculate correct total duration', () => {
    const sequencer = new AnimationSequencer();
    
    sequencer.addAnimation('fadeIn', 1000, 0);
    sequencer.addAnimation('slideIn', 500, 500);
    sequencer.addAnimation('scaleUp', 300, 800);
    
    expect(sequencer.getTotalDuration()).toBe(1100); // 800 + 300
  });
  
  it('should identify active animation at any time point', () => {
    const sequencer = new AnimationSequencer();
    
    sequencer.addAnimation('intro', 1000, 0);
    sequencer.addAnimation('main', 2000, 1000);
    sequencer.addAnimation('outro', 500, 3000);
    
    expect(sequencer.getActiveAnimationAt(0)).toBe('intro');
    expect(sequencer.getActiveAnimationAt(500)).toBe('intro');
    expect(sequencer.getActiveAnimationAt(1000)).toBe('main');
    expect(sequencer.getActiveAnimationAt(2500)).toBe('main');
    expect(sequencer.getActiveAnimationAt(3200)).toBe('outro');
    expect(sequencer.getActiveAnimationAt(3600)).toBe(null);
  });
  
  it('should detect overlapping animations', () => {
    const sequencer = new AnimationSequencer();
    
    sequencer.addAnimation('fadeIn', 1000, 0);
    sequencer.addAnimation('slideIn', 800, 500); // Overlaps with fadeIn
    sequencer.addAnimation('rotate', 500, 1500);  // No overlap
    
    const overlaps = sequencer.getOverlappingAnimations();
    expect(overlaps).toHaveLength(1);
    expect(overlaps[0]).toEqual(['fadeIn', 'slideIn']);
  });
  
  it('should simulate animation phases correctly', async () => {
    const timeline = await simulateKeyframePhases({
      name: 'complexAnimation',
      duration: 2000,
      steps: 4 // 0%, 25%, 50%, 75%, 100%
    });
    
    expect(timeline.steps).toHaveLength(5);
    expect(timeline.steps[0].progress).toBe(0);
    expect(timeline.steps[1].progress).toBe(0.25);
    expect(timeline.steps[2].progress).toBe(0.5);
    expect(timeline.steps[3].progress).toBe(0.75);
    expect(timeline.steps[4].progress).toBe(1);
    
    // Verify phase transitions
    expect(timeline.steps[0].phase).toBe('before-start');
    expect(timeline.steps[1].phase).toBe('animating');
    expect(timeline.steps[4].phase).toBe('completed');
  });
});
```

## Tier 2 Examples - Component Behavior

### Example 1: Rotating Text Component Behavior

**What it tests:** DOM text content changes and CSS class applications  
**Why this approach:** Tests observable behavior without relying on CSS execution

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { mockAnimationProperties, clearAnimationMocks } from '../test-utils/css-animation-mocking';
import { setupRealTimers, cleanupTimers } from '../test-utils/timer-helpers';

// Component that rotates through words
function RotatingTextBanner({ words, interval = 3000 }: { words: string[], interval?: number }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [animationClass, setAnimationClass] = React.useState('text-visible');
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      // Start exit animation
      setAnimationClass('text-exiting');
      
      setTimeout(() => {
        // Change word and start enter animation
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setAnimationClass('text-entering');
        
        setTimeout(() => {
          // Return to visible state
          setAnimationClass('text-visible');
        }, 300);
      }, 300);
    }, interval);
    
    return () => clearInterval(timer);
  }, [words.length, interval]);
  
  return (
    <div className="rotating-banner">
      <span 
        className={`rotating-text ${animationClass}`}
        data-testid="rotating-text"
      >
        {words[currentIndex]}
      </span>
    </div>
  );
}

describe('Rotating Text Banner Behavior', () => {
  const testWords = ['Welcome', 'Hello', 'Greetings'];
  
  beforeEach(() => {
    setupRealTimers();
    // Mock the CSS animation properties that would normally come from CSS
    mockAnimationProperties('.text-visible', {
      animationName: 'none',
      opacity: '1'
    });
    mockAnimationProperties('.text-exiting', {
      animationName: 'fadeOut',
      animationDuration: '300ms'
    });
    mockAnimationProperties('.text-entering', {
      animationName: 'fadeIn',
      animationDuration: '300ms'
    });
  });
  
  afterEach(async () => {
    clearAnimationMocks();
    await cleanupTimers();
  });
  
  it('should cycle through all words with correct CSS classes', async () => {
    render(<RotatingTextBanner words={testWords} interval={1000} />);
    
    const textElement = screen.getByTestId('rotating-text');
    
    // Initially shows first word with visible class
    expect(textElement).toHaveTextContent('Welcome');
    expect(textElement).toHaveClass('text-visible');
    
    // Wait for first transition to start
    await waitFor(() => {
      expect(textElement).toHaveClass('text-exiting');
    }, { timeout: 1200 });
    
    // Wait for word change and entering animation
    await waitFor(() => {
      expect(textElement).toHaveTextContent('Hello');
      expect(textElement).toHaveClass('text-entering');
    }, { timeout: 400 });
    
    // Wait for return to visible
    await waitFor(() => {
      expect(textElement).toHaveClass('text-visible');
    }, { timeout: 400 });
    
    // Wait for next cycle
    await waitFor(() => {
      expect(textElement).toHaveTextContent('Greetings');
    }, { timeout: 1200 });
    
    // Verify it cycles back to first word
    await waitFor(() => {
      expect(textElement).toHaveTextContent('Welcome');
    }, { timeout: 1200 });
  });
  
  it('should maintain correct DOM structure throughout animation', async () => {
    const { container } = render(<RotatingTextBanner words={testWords} />);
    
    // Check initial structure
    const banner = container.querySelector('.rotating-banner');
    expect(banner).toBeInTheDocument();
    expect(banner?.children).toHaveLength(1);
    
    // Structure should remain stable during animations
    await waitFor(() => {
      expect(screen.getByTestId('rotating-text')).toHaveClass('text-exiting');
    }, { timeout: 3200 });
    
    // Still same structure
    expect(banner?.children).toHaveLength(1);
    expect(container.querySelectorAll('.rotating-text')).toHaveLength(1);
  });
});
```

### Example 2: Hover Animation Behavior

**What it tests:** User interaction triggering CSS class changes  
**Why this approach:** Tests interaction behavior without visual CSS effects

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockAnimationProperties, clearAnimationMocks } from '../test-utils/css-animation-mocking';

// Card component with hover animations
function AnimatedCard({ title, content }: { title: string, content: string }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [hasBeenHovered, setHasBeenHovered] = React.useState(false);
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    setHasBeenHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  return (
    <div
      className={`card ${isHovered ? 'card-hovered' : ''} ${hasBeenHovered ? 'card-animated' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="animated-card"
    >
      <h3 className={`card-title ${isHovered ? 'title-highlighted' : ''}`}>
        {title}
      </h3>
      <p className="card-content">{content}</p>
      {isHovered && (
        <div className="hover-overlay" data-testid="hover-overlay">
          <button className="card-action">Learn More</button>
        </div>
      )}
    </div>
  );
}

describe('Animated Card Hover Behavior', () => {
  beforeEach(() => {
    // Mock the animation properties we're testing
    mockAnimationProperties('.card', {
      transitionProperty: 'transform, box-shadow',
      transitionDuration: '0.3s'
    });
    mockAnimationProperties('.card-hovered', {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    });
  });
  
  afterEach(() => {
    clearAnimationMocks();
  });
  
  it('should apply hover classes and show overlay on mouse enter', async () => {
    const user = userEvent.setup();
    render(<AnimatedCard title="Test Card" content="Test content" />);
    
    const card = screen.getByTestId('animated-card');
    const title = screen.getByText('Test Card');
    
    // Initial state
    expect(card).toHaveClass('card');
    expect(card).not.toHaveClass('card-hovered');
    expect(card).not.toHaveClass('card-animated');
    expect(screen.queryByTestId('hover-overlay')).not.toBeInTheDocument();
    
    // Hover over card
    await user.hover(card);
    
    // Check hover state
    expect(card).toHaveClass('card-hovered');
    expect(card).toHaveClass('card-animated'); // Tracks if ever hovered
    expect(title).toHaveClass('title-highlighted');
    expect(screen.getByTestId('hover-overlay')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
    
    // Mouse leave
    await user.unhover(card);
    
    // Check post-hover state
    expect(card).not.toHaveClass('card-hovered');
    expect(card).toHaveClass('card-animated'); // Persists
    expect(title).not.toHaveClass('title-highlighted');
    expect(screen.queryByTestId('hover-overlay')).not.toBeInTheDocument();
  });
  
  it('should handle rapid hover/unhover interactions', async () => {
    const user = userEvent.setup();
    render(<AnimatedCard title="Test Card" content="Test content" />);
    
    const card = screen.getByTestId('animated-card');
    
    // Rapid hover interactions
    for (let i = 0; i < 5; i++) {
      await user.hover(card);
      expect(card).toHaveClass('card-hovered');
      
      await user.unhover(card);
      expect(card).not.toHaveClass('card-hovered');
    }
    
    // Card should still be functional
    await user.hover(card);
    expect(screen.getByTestId('hover-overlay')).toBeInTheDocument();
  });
});
```

### Example 3: Accordion Animation Behavior

**What it tests:** Component expansion/collapse with height animations  
**Why this approach:** Tests state changes and ARIA attributes instead of visual height

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockAnimationProperties, clearAnimationMocks } from '../test-utils/css-animation-mocking';

// Accordion component with animated expansion
function AnimatedAccordion({ items }: { items: Array<{ title: string, content: string }> }) {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);
  const [animatingIndex, setAnimatingIndex] = React.useState<number | null>(null);
  
  const toggleItem = (index: number) => {
    if (expandedIndex === index) {
      // Collapse
      setAnimatingIndex(index);
      setTimeout(() => {
        setExpandedIndex(null);
        setAnimatingIndex(null);
      }, 300);
    } else {
      // Expand
      setExpandedIndex(index);
      setAnimatingIndex(index);
      setTimeout(() => {
        setAnimatingIndex(null);
      }, 300);
    }
  };
  
  return (
    <div className="accordion" role="region">
      {items.map((item, index) => {
        const isExpanded = expandedIndex === index;
        const isAnimating = animatingIndex === index;
        
        return (
          <div key={index} className="accordion-item">
            <button
              className="accordion-header"
              onClick={() => toggleItem(index)}
              aria-expanded={isExpanded}
              aria-controls={`panel-${index}`}
              data-testid={`accordion-button-${index}`}
            >
              {item.title}
              <span className={`accordion-icon ${isExpanded ? 'icon-rotated' : ''}`}>
                ▼
              </span>
            </button>
            <div
              id={`panel-${index}`}
              className={`accordion-panel ${isExpanded ? 'panel-expanded' : 'panel-collapsed'} ${isAnimating ? 'panel-animating' : ''}`}
              aria-hidden={!isExpanded}
              data-testid={`accordion-panel-${index}`}
            >
              <div className="accordion-content">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

describe('Animated Accordion Behavior', () => {
  const testItems = [
    { title: 'Section 1', content: 'Content for section 1' },
    { title: 'Section 2', content: 'Content for section 2' },
    { title: 'Section 3', content: 'Content for section 3' }
  ];
  
  beforeEach(() => {
    mockAnimationProperties('.accordion-panel', {
      transitionProperty: 'height, opacity',
      transitionDuration: '300ms'
    });
    mockAnimationProperties('.accordion-icon', {
      transitionProperty: 'transform',
      transitionDuration: '200ms'
    });
  });
  
  afterEach(() => {
    clearAnimationMocks();
  });
  
  it('should expand and collapse panels with proper ARIA attributes', async () => {
    const user = userEvent.setup();
    render(<AnimatedAccordion items={testItems} />);
    
    const button1 = screen.getByTestId('accordion-button-0');
    const panel1 = screen.getByTestId('accordion-panel-0');
    
    // Initial state - all collapsed
    expect(button1).toHaveAttribute('aria-expanded', 'false');
    expect(panel1).toHaveClass('panel-collapsed');
    expect(panel1).toHaveAttribute('aria-hidden', 'true');
    
    // Click to expand
    await user.click(button1);
    
    // Check expanded state
    expect(button1).toHaveAttribute('aria-expanded', 'true');
    expect(panel1).toHaveClass('panel-expanded');
    expect(panel1).toHaveClass('panel-animating');
    expect(panel1).toHaveAttribute('aria-hidden', 'false');
    
    // Wait for animation to complete
    await waitFor(() => {
      expect(panel1).not.toHaveClass('panel-animating');
    }, { timeout: 400 });
    
    // Click to collapse
    await user.click(button1);
    
    // Check collapsing state
    expect(panel1).toHaveClass('panel-animating');
    
    // Wait for collapse
    await waitFor(() => {
      expect(button1).toHaveAttribute('aria-expanded', 'false');
      expect(panel1).toHaveClass('panel-collapsed');
      expect(panel1).toHaveAttribute('aria-hidden', 'true');
    }, { timeout: 400 });
  });
  
  it('should only allow one panel open at a time', async () => {
    const user = userEvent.setup();
    render(<AnimatedAccordion items={testItems} />);
    
    const button1 = screen.getByTestId('accordion-button-0');
    const button2 = screen.getByTestId('accordion-button-1');
    const panel1 = screen.getByTestId('accordion-panel-0');
    const panel2 = screen.getByTestId('accordion-panel-1');
    
    // Open first panel
    await user.click(button1);
    expect(panel1).toHaveClass('panel-expanded');
    
    // Open second panel - first should close
    await user.click(button2);
    
    expect(panel1).toHaveClass('panel-collapsed');
    expect(panel2).toHaveClass('panel-expanded');
    
    // Verify ARIA states
    expect(button1).toHaveAttribute('aria-expanded', 'false');
    expect(button2).toHaveAttribute('aria-expanded', 'true');
  });
  
  it('should handle rapid clicking without breaking', async () => {
    const user = userEvent.setup();
    render(<AnimatedAccordion items={testItems} />);
    
    const button = screen.getByTestId('accordion-button-0');
    
    // Rapid clicks
    await user.click(button);
    await user.click(button);
    await user.click(button);
    
    // Wait for any animations to settle
    await waitFor(() => {
      const panel = screen.getByTestId('accordion-panel-0');
      expect(panel).not.toHaveClass('panel-animating');
    }, { timeout: 1000 });
    
    // Should end in a valid state
    const panel = screen.getByTestId('accordion-panel-0');
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
      expect(panel).toHaveClass('panel-expanded');
    } else {
      expect(panel).toHaveClass('panel-collapsed');
    }
  });
});
```

## Tier 3 Examples - Visual Validation (Future)

### Example 1: Fade Animation Visual Test (Playwright)

**What it would test:** Actual opacity values during animation  
**Why E2E:** Only real browsers can execute CSS animations

```typescript
// This would be in a Playwright test file
import { test, expect } from '@playwright/test';

test.describe('Fade Animation Visual Tests', () => {
  test('should animate opacity from 0 to 1', async ({ page }) => {
    await page.goto('/components/fade-in-demo');
    
    const element = page.locator('[data-testid="fade-element"]');
    
    // Check initial opacity
    const initialOpacity = await element.evaluate(el => 
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(initialOpacity)).toBeLessThan(0.1);
    
    // Trigger animation
    await page.click('[data-testid="trigger-fade"]');
    
    // Check opacity during animation (multiple samples)
    const opacities: number[] = [];
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(100);
      const opacity = await element.evaluate(el => 
        window.getComputedStyle(el).opacity
      );
      opacities.push(parseFloat(opacity));
    }
    
    // Verify opacity increased over time
    expect(opacities[0]).toBeLessThan(opacities[9]);
    expect(opacities[9]).toBeGreaterThan(0.9);
    
    // Visual regression test
    await expect(page).toHaveScreenshot('fade-complete.png');
  });
});
```

### Example 2: Transform Animation Visual Test

**What it would test:** Transform values and smoothness  
**Why E2E:** Transform calculations require real browser engine

```typescript
// Playwright test for transform animations
test.describe('Slide Animation Visual Tests', () => {
  test('should slide element smoothly from left to right', async ({ page }) => {
    await page.goto('/components/slide-demo');
    
    const slider = page.locator('[data-testid="sliding-element"]');
    
    // Get initial transform
    const initialTransform = await slider.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    
    // Start animation
    await page.click('[data-testid="slide-trigger"]');
    
    // Capture transform values during animation
    const transforms: string[] = [];
    const startTime = Date.now();
    
    while (Date.now() - startTime < 1000) {
      const transform = await slider.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      transforms.push(transform);
      await page.waitForTimeout(50);
    }
    
    // Parse and verify smooth progression
    const xValues = transforms
      .map(t => {
        const match = t.match(/matrix\(.*?,.*?,.*?,.*?,\s*(-?\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : 0;
      })
      .filter((v, i, arr) => i === 0 || v !== arr[i - 1]);
    
    // Should have smooth incremental changes
    expect(xValues.length).toBeGreaterThan(5);
    
    // Verify no jumps (smooth animation)
    for (let i = 1; i < xValues.length; i++) {
      const diff = Math.abs(xValues[i] - xValues[i - 1]);
      expect(diff).toBeLessThan(50); // No jumps > 50px
    }
  });
});
```

### Example 3: Keyframe Animation Visual Test

**What it would test:** Complex keyframe execution  
**Why E2E:** Keyframes require CSS engine to execute

```typescript
// Playwright test for keyframe animations
test.describe('Keyframe Animation Visual Tests', () => {
  test('should execute bounce keyframes correctly', async ({ page }) => {
    await page.goto('/components/bounce-demo');
    
    const bouncer = page.locator('[data-testid="bouncing-ball"]');
    
    // Start bounce animation
    await page.click('[data-testid="start-bounce"]');
    
    // Capture Y positions during bounce
    const positions: number[] = [];
    for (let i = 0; i < 20; i++) {
      const transform = await bouncer.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      
      // Extract Y translation
      const match = transform.match(/matrix\(.*?,.*?,.*?,.*?,.*?,\s*(-?\d+\.?\d*)/);
      if (match) {
        positions.push(parseFloat(match[1]));
      }
      
      await page.waitForTimeout(50);
    }
    
    // Verify bounce pattern (should go up then down multiple times)
    let directionChanges = 0;
    for (let i = 2; i < positions.length; i++) {
      const prev = positions[i - 1] - positions[i - 2];
      const curr = positions[i] - positions[i - 1];
      
      if (prev * curr < 0) { // Direction changed
        directionChanges++;
      }
    }
    
    // Should have multiple bounces
    expect(directionChanges).toBeGreaterThan(2);
    
    // Capture screenshots at key points
    await expect(page).toHaveScreenshot('bounce-peak.png');
  });
});
```

## Before/After Comparisons

### Comparison 1: Testing Fade Animation

#### Before (JSDOM-Incompatible) ❌
```typescript
// This approach fails because JSDOM doesn't execute CSS animations
it('should fade in element over 1 second', () => {
  render(<FadeInComponent />);
  const element = screen.getByTestId('fade-element');
  
  // This always returns '1' in JSDOM
  let opacity = window.getComputedStyle(element).opacity;
  expect(opacity).toBe('0'); // FAILS!
  
  // Trigger animation
  fireEvent.click(screen.getByText('Fade In'));
  
  // This doesn't work - animations don't run
  act(() => {
    jest.advanceTimersByTime(500);
  });
  
  opacity = window.getComputedStyle(element).opacity;
  expect(opacity).toBe('0.5'); // FAILS! Still '1'
  
  act(() => {
    jest.advanceTimersByTime(500);
  });
  
  opacity = window.getComputedStyle(element).opacity;
  expect(opacity).toBe('1'); // FAILS! Was always '1'
});
```

#### After (JSDOM-Compatible) ✅
```typescript
// This approach tests behavior, not visual appearance
it('should trigger fade in animation behavior', async () => {
  render(<FadeInComponent />);
  const element = screen.getByTestId('fade-element');
  
  // Test initial state via data attributes or classes
  expect(element).toHaveAttribute('data-faded', 'false');
  expect(element).toHaveClass('fade-waiting');
  
  // Mock the CSS properties for any code that checks them
  mockAnimationProperties(element, {
    animationName: 'fadeIn',
    animationDuration: '1s'
  });
  
  // Trigger animation
  const trigger = screen.getByText('Fade In');
  await userEvent.click(trigger);
  
  // Test that animation started via class/attribute changes
  expect(element).toHaveClass('fade-animating');
  expect(element).toHaveAttribute('data-faded', 'true');
  
  // Wait for animation to complete
  await waitFor(() => {
    expect(element).toHaveClass('fade-complete');
  }, { timeout: 1100 });
  
  // Verify final state
  expect(element).not.toHaveClass('fade-animating');
  expect(element).toHaveAttribute('aria-hidden', 'false');
});
```

### Comparison 2: Testing Keyframe Animation

#### Before (JSDOM-Incompatible) ❌
```typescript
// Attempting to test keyframes directly - doesn't work
it('should rotate element 360 degrees', () => {
  render(<SpinnerComponent />);
  const spinner = screen.getByTestId('spinner');
  
  // Keyframes don't run in JSDOM
  const animation = spinner.getAnimations()[0]; // Returns undefined!
  expect(animation.playState).toBe('running'); // FAILS!
  
  // Try to check transform at different points
  act(() => {
    jest.advanceTimersByTime(500); // 50% through
  });
  
  const transform = getComputedStyle(spinner).transform;
  expect(transform).toBe('rotate(180deg)'); // FAILS! Returns 'none'
});
```

#### After (JSDOM-Compatible) ✅
```typescript
// Test the behavior and state, not the visual rotation
it('should manage spinner rotation state', () => {
  const { result } = testAnimationHook(() => useSpinner());
  
  // Test initial state
  expect(result.current.isSpinning).toBe(false);
  expect(result.current.rotations).toBe(0);
  
  // Start spinning
  act(() => {
    result.current.startSpinning();
  });
  
  expect(result.current.isSpinning).toBe(true);
  
  // Simulate rotation completion callback
  act(() => {
    result.current.onRotationComplete();
  });
  
  expect(result.current.rotations).toBe(1);
  
  // Test stopping
  act(() => {
    result.current.stopSpinning();
  });
  
  expect(result.current.isSpinning).toBe(false);
  expect(result.current.rotations).toBe(1);
});
```

### Comparison 3: Testing Transition on Hover

#### Before (JSDOM-Incompatible) ❌
```typescript
// Trying to test CSS transitions - doesn't work
it('should scale up on hover', async () => {
  render(<HoverCard />);
  const card = screen.getByTestId('card');
  
  // Check initial scale
  let transform = getComputedStyle(card).transform;
  expect(transform).toBe('scale(1)'); // FAILS! Returns 'none'
  
  // Hover over element
  fireEvent.mouseEnter(card);
  
  // Transitions don't run
  await waitFor(() => {
    transform = getComputedStyle(card).transform;
    expect(transform).toBe('scale(1.05)'); // FAILS! Still 'none'
  });
});
```

#### After (JSDOM-Compatible) ✅
```typescript
// Test the hover behavior and state changes
it('should handle hover state correctly', async () => {
  const user = userEvent.setup();
  render(<HoverCard />);
  const card = screen.getByTestId('card');
  
  // Verify initial state
  expect(card).not.toHaveClass('card-hovered');
  expect(card).toHaveAttribute('data-scale', 'normal');
  
  // Mock the CSS that would be applied
  mockAnimationProperties('.card-hovered', {
    transform: 'scale(1.05)',
    transitionDuration: '0.3s'
  });
  
  // Test hover interaction
  await user.hover(card);
  
  // Verify hover state applied
  expect(card).toHaveClass('card-hovered');
  expect(card).toHaveAttribute('data-scale', 'enlarged');
  
  // Test unhover
  await user.unhover(card);
  
  expect(card).not.toHaveClass('card-hovered');
  expect(card).toHaveAttribute('data-scale', 'normal');
});
```

## Key Takeaways

1. **Tier 1 (Logic)**: Test pure functions, state machines, and hooks without DOM
2. **Tier 2 (Behavior)**: Test DOM changes, classes, and attributes - not visual styles
3. **Tier 3 (Visual)**: Reserve for E2E tools that run in real browsers
4. **Mocking Strategy**: Mock only what your code needs to check, not visual output
5. **Focus on Behavior**: Test what users experience functionally, not visually

Remember: The goal is to ensure your animation logic and behavior work correctly. Leave visual validation to tools designed for that purpose.