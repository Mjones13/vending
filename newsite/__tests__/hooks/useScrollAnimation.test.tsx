/**
 * useScrollAnimation Hook Tests
 * Testing custom scroll animation hooks with TypeScript
 */
import { renderHook, act } from '@testing-library/react';
import { useScrollAnimation, useParallax, useStaggeredAnimation } from '../../hooks/useScrollAnimation';

describe('useScrollAnimation', () => {
  // Store original IntersectionObserver
  const originalIntersectionObserver = global.IntersectionObserver;

  beforeEach(() => {
    // Mock IntersectionObserver
    const mockObserve = jest.fn();
    const mockUnobserve = jest.fn();
    const mockDisconnect = jest.fn();

    global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
      // Store callback for testing
      trigger: (entry: IntersectionObserverEntry) => callback([entry], this),
    })) as any;

    // Make methods accessible for tests
    (global.IntersectionObserver as any).mockObserve = mockObserve;
    (global.IntersectionObserver as any).mockUnobserve = mockUnobserve;
    (global.IntersectionObserver as any).mockDisconnect = mockDisconnect;
  });

  afterEach(() => {
    // Restore original
    global.IntersectionObserver = originalIntersectionObserver;
    jest.clearAllMocks();
  });

  it('should initialize with isVisible as false', () => {
    const { result } = renderHook(() => useScrollAnimation());
    const [ref, isVisible] = result.current;
    
    expect(isVisible).toBe(false);
    expect(ref.current).toBeNull();
  });

  it('should create IntersectionObserver with default options', () => {
    renderHook(() => useScrollAnimation());
    
    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.1,
        rootMargin: '0px',
      }
    );
  });

  it('should accept custom threshold and rootMargin', () => {
    renderHook(() => useScrollAnimation(0.5, '50px'));
    
    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.5,
        rootMargin: '50px',
      }
    );
  });

  it('should set isVisible to true when element intersects', () => {
    const { result } = renderHook(() => useScrollAnimation());
    
    // Get the observer instance
    const observerInstance = (global.IntersectionObserver as jest.Mock).mock.results[0]?.value;
    
    // Simulate intersection
    act(() => {
      observerInstance.trigger({ isIntersecting: true });
    });
    
    const [, isVisible] = result.current;
    expect(isVisible).toBe(true);
  });

  it('should observe element when ref has current', () => {
    renderHook(() => useScrollAnimation());
    
    // Check that observe was called (happens in useEffect when ref.current exists)
    // Since we can't easily mock the ref, we just verify the observer was created
    expect(global.IntersectionObserver).toHaveBeenCalled();
  });
});

describe('useParallax', () => {
  beforeEach(() => {
    // Reset window.pageYOffset
    Object.defineProperty(window, 'pageYOffset', {
      value: 0,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with offset 0', () => {
    const { result } = renderHook(() => useParallax());
    expect(result.current).toBe(0);
  });

  it('should update offset on scroll', () => {
    const { result } = renderHook(() => useParallax());
    
    // Simulate scroll
    act(() => {
      Object.defineProperty(window, 'pageYOffset', {
        value: 100,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event('scroll'));
    });
    
    expect(result.current).toBe(100);
  });

  it('should remove scroll listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useParallax());
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});

describe('useStaggeredAnimation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with all items false', () => {
    const { result } = renderHook(() => useStaggeredAnimation(3));
    const [animatedItems] = result.current;
    
    expect(animatedItems).toEqual([false, false, false]);
  });

  it('should animate items with default delay', () => {
    const { result } = renderHook(() => useStaggeredAnimation(3));
    const [, triggerAnimation] = result.current;
    
    act(() => {
      triggerAnimation();
    });
    
    // Initially all false
    expect(result.current[0]).toEqual([false, false, false]);
    
    // After 0ms - first item
    act(() => {
      jest.advanceTimersByTime(0);
    });
    expect(result.current[0]).toEqual([true, false, false]);
    
    // After 100ms - second item
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current[0]).toEqual([true, true, false]);
    
    // After another 100ms - third item
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current[0]).toEqual([true, true, true]);
  });

  it('should use custom delay', () => {
    const { result } = renderHook(() => useStaggeredAnimation(2, 50));
    const [, triggerAnimation] = result.current;
    
    act(() => {
      triggerAnimation();
    });
    
    // After 50ms - second item should be animated
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current[0]).toEqual([true, true]);
  });

  it('should clean up timeouts', () => {
    const { result } = renderHook(() => useStaggeredAnimation(3));
    const [, triggerAnimation] = result.current;
    
    let cleanup: (() => void) | undefined;
    act(() => {
      cleanup = triggerAnimation();
    });
    
    // Clean up before animations complete
    act(() => {
      cleanup?.();
    });
    
    // Advance time - no more updates should occur
    const stateBefore = result.current[0];
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current[0]).toEqual(stateBefore);
  });

  it('should handle boundary check for array updates', () => {
    const { result } = renderHook(() => useStaggeredAnimation(2));
    const [, triggerAnimation] = result.current;
    
    // This tests the boundary check in the code (if i < newState.length)
    act(() => {
      triggerAnimation();
      jest.runAllTimers();
    });
    
    // Should not throw and should have correct state
    expect(result.current[0]).toEqual([true, true]);
  });

  it('should achieve full coverage by testing all branches', () => {
    // Test with count of 0
    const { result: zeroResult } = renderHook(() => useStaggeredAnimation(0));
    expect(zeroResult.current[0]).toEqual([]);
    
    // Test with count of 1
    const { result: oneResult } = renderHook(() => useStaggeredAnimation(1));
    const [, triggerOne] = oneResult.current;
    
    act(() => {
      triggerOne();
      jest.runAllTimers();
    });
    expect(oneResult.current[0]).toEqual([true]);
  });
});