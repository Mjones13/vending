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

    it('should be restorable after cleanup', () => {
      // Save original implementations
      const originalRAF = global.requestAnimationFrame;
      const originalCAF = global.cancelAnimationFrame;
      
      // Simulate cleanup that removes RAF polyfills
      delete (global as any).requestAnimationFrame;
      delete (global as any).cancelAnimationFrame;
      delete (window as any).requestAnimationFrame;
      delete (window as any).cancelAnimationFrame;
      
      // Verify they're gone
      expect(global.requestAnimationFrame).toBeUndefined();
      expect(global.cancelAnimationFrame).toBeUndefined();
      
      // Now restore RAF polyfills (this is what ensureRAFPolyfills does)
      global.requestAnimationFrame = (callback: FrameRequestCallback) => {
        return setTimeout(callback, 16);
      };
      global.cancelAnimationFrame = (id: number) => {
        clearTimeout(id);
      };
      window.requestAnimationFrame = global.requestAnimationFrame;
      window.cancelAnimationFrame = global.cancelAnimationFrame;
      
      // Verify they're restored
      expect(typeof global.requestAnimationFrame).toBe('function');
      expect(typeof global.cancelAnimationFrame).toBe('function');
      expect(typeof window.requestAnimationFrame).toBe('function');
      expect(typeof window.cancelAnimationFrame).toBe('function');
      
      // Test that they work
      let callbackExecuted = false;
      const id = requestAnimationFrame(() => {
        callbackExecuted = true;
      });
      expect(typeof id).toBe('number');
      
      // Cleanup: Restore original implementations for other tests
      global.requestAnimationFrame = originalRAF;
      global.cancelAnimationFrame = originalCAF;
      window.requestAnimationFrame = originalRAF;
      window.cancelAnimationFrame = originalCAF;
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