/**
 * Test to demonstrate browser API polyfill issues
 */

describe('Browser API Polyfills', () => {
  describe('requestAnimationFrame and cancelAnimationFrame', () => {
    it('should have requestAnimationFrame defined globally', () => {
      expect(typeof global.requestAnimationFrame).toBe('function');
      expect(typeof window.requestAnimationFrame).toBe('function');
    });

    it('should have cancelAnimationFrame defined globally', () => {
      expect(typeof global.cancelAnimationFrame).toBe('function');
      expect(typeof window.cancelAnimationFrame).toBe('function');
    });

    it('should execute requestAnimationFrame callbacks', (done) => {
      let callbackExecuted = false;
      
      requestAnimationFrame(() => {
        callbackExecuted = true;
        expect(callbackExecuted).toBe(true);
        done();
      });
    });

    it('should be able to cancel animation frames', (done) => {
      let callbackExecuted = false;
      
      const id = requestAnimationFrame(() => {
        callbackExecuted = true;
      });
      
      cancelAnimationFrame(id);
      
      // Wait to ensure callback doesn't execute
      setTimeout(() => {
        expect(callbackExecuted).toBe(false);
        done();
      }, 50);
    });

    it('should persist through test cleanup cycles', () => {
      // Simulate what happens in afterEach
      const originalRAF = global.requestAnimationFrame;
      const originalCAF = global.cancelAnimationFrame;
      
      // This is what AnimationTestIsolation does
      global.requestAnimationFrame = undefined as any;
      global.cancelAnimationFrame = undefined as any;
      
      // After cleanup, polyfills should be restored
      // This test will fail with current implementation
      expect(() => {
        if (typeof requestAnimationFrame !== 'function') {
          throw new Error('requestAnimationFrame is not defined after cleanup');
        }
      }).not.toThrow();
      
      // Restore for other tests
      global.requestAnimationFrame = originalRAF;
      global.cancelAnimationFrame = originalCAF;
    });

    it('should work with fake timers', () => {
      jest.useFakeTimers();
      
      let callbackExecuted = false;
      requestAnimationFrame(() => {
        callbackExecuted = true;
      });
      
      // Advance timers by 16ms (one frame at 60fps)
      jest.advanceTimersByTime(16);
      
      expect(callbackExecuted).toBe(true);
      
      jest.useRealTimers();
    });

    it('should maintain proper frame timing', (done) => {
      const startTime = Date.now();
      
      requestAnimationFrame(() => {
        const elapsed = Date.now() - startTime;
        // Should be approximately 16ms for 60fps
        // Allow some variance for test environment
        expect(elapsed).toBeGreaterThanOrEqual(10);
        expect(elapsed).toBeLessThanOrEqual(30);
        done();
      });
    });
  });
});