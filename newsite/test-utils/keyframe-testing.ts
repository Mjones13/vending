/**
 * Keyframe Animation Testing Utilities
 * 
 * These utilities enable testing keyframe animation logic and progression without
 * relying on actual CSS keyframe execution. Designed to work around JSDOM's
 * lack of CSS animation support.
 */

import { act } from '@testing-library/react';

// Animation phase types
export type AnimationPhase = 'before-start' | 'animating' | 'paused' | 'completed' | 'cancelled';

// Keyframe step interface
export interface KeyframeStep {
  percentage: number; // 0-100
  phase: AnimationPhase;
  timestamp: number;
  properties?: Record<string, string>;
}

// Animation timeline interface
export interface AnimationTimeline {
  duration: number; // in milliseconds
  steps: KeyframeStep[];
  currentStep: number;
  startTime: number;
  endTime?: number;
  iterationCount: number;
  currentIteration: number;
}

// Animation configuration
export interface KeyframeAnimationConfig {
  name: string;
  duration: number; // in milliseconds
  iterationCount?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  playState?: 'running' | 'paused';
  steps?: number; // Number of steps to simulate (default: 10)
}

/**
 * KeyframeAnimationTester class for testing animation phases without CSS
 */
export class KeyframeAnimationTester {
  private timeline: AnimationTimeline;
  private config: KeyframeAnimationConfig;
  private phaseListeners: Array<(phase: AnimationPhase, step: KeyframeStep) => void> = [];
  private timeoutId: NodeJS.Timeout | null = null;
  private isDestroying: boolean = false;

  constructor(config: KeyframeAnimationConfig) {
    this.config = {
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'none',
      playState: 'running',
      steps: 10,
      ...config
    };

    this.timeline = {
      duration: this.config.duration,
      steps: [],
      currentStep: 0,
      startTime: 0,
      iterationCount: this.config.iterationCount || 1,
      currentIteration: 0
    };

    this.initializeSteps();
  }

  /**
   * Initialize animation steps based on configuration
   */
  private initializeSteps(): void {
    const stepCount = this.config.steps || 10;
    const stepPercentage = 100 / stepCount;

    for (let i = 0; i <= stepCount; i++) {
      const percentage = Math.min(i * stepPercentage, 100);
      this.timeline.steps.push({
        percentage,
        phase: i === 0 ? 'before-start' : i === stepCount ? 'completed' : 'animating',
        timestamp: 0,
        properties: this.calculatePropertiesAtPercentage(percentage)
      });
    }
  }

  /**
   * Calculate CSS properties at a specific percentage (mock implementation)
   */
  private calculatePropertiesAtPercentage(percentage: number): Record<string, string> {
    // This is a simplified mock - in real scenarios, you'd calculate actual values
    const progress = percentage / 100;
    
    return {
      opacity: this.interpolateValue(0, 1, progress).toString(),
      transform: `translateY(${this.interpolateValue(20, 0, progress)}px)`,
      scale: this.interpolateValue(0.8, 1, progress).toString()
    };
  }

  /**
   * Simple linear interpolation between two values
   */
  private interpolateValue(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  }

  /**
   * Start the animation simulation
   */
  start(): void {
    if (this.config.playState === 'paused') {
      return;
    }

    this.timeline.startTime = Date.now();
    this.timeline.currentStep = 0;
    this.timeline.currentIteration = 0;

    this.simulateProgression();
  }

  /**
   * Pause the animation
   */
  pause(): void {
    this.config.playState = 'paused';
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.notifyPhaseChange('paused');
  }

  /**
   * Resume the animation
   */
  resume(): void {
    this.config.playState = 'running';
    this.simulateProgression();
  }

  /**
   * Cancel the animation
   */
  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.notifyPhaseChange('cancelled');
  }

  /**
   * Simulate animation progression through steps
   */
  private simulateProgression(): void {
    if (this.config.playState !== 'running') {
      return;
    }

    const currentStep = this.timeline.steps[this.timeline.currentStep];
    if (!currentStep) {
      this.handleAnimationComplete();
      return;
    }

    // Update timestamp
    currentStep.timestamp = Date.now();

    // Notify listeners of phase change
    this.notifyPhaseChange(currentStep.phase, currentStep);

    // Schedule next step
    const stepDuration = this.timeline.duration / (this.timeline.steps.length - 1);
    this.timeoutId = setTimeout(() => {
      this.timeline.currentStep++;
      this.simulateProgression();
    }, stepDuration);
  }

  /**
   * Handle animation completion
   */
  private handleAnimationComplete(): void {
    this.timeline.currentIteration++;

    // Check if we need to repeat
    if (this.timeline.currentIteration < this.timeline.iterationCount) {
      this.timeline.currentStep = 0;
      this.simulateProgression();
      return;
    }

    // Animation fully complete
    this.timeline.endTime = Date.now();
    this.notifyPhaseChange('completed');
  }

  /**
   * Notify phase change listeners
   */
  private notifyPhaseChange(phase: AnimationPhase, step?: KeyframeStep): void {
    this.phaseListeners.forEach(listener => {
      listener(phase, step || this.getCurrentStep());
    });
  }

  /**
   * Get current animation step
   */
  getCurrentStep(): KeyframeStep {
    return this.timeline.steps[this.timeline.currentStep] || this.timeline.steps[0];
  }

  /**
   * Get current animation phase
   */
  getCurrentPhase(): AnimationPhase {
    return this.getCurrentStep().phase;
  }

  /**
   * Get animation progress (0-1)
   */
  getProgress(): number {
    const currentStep = this.timeline.currentStep;
    const totalSteps = this.timeline.steps.length - 1;
    return Math.min(currentStep / totalSteps, 1);
  }

  /**
   * Get timeline information
   */
  getTimeline(): AnimationTimeline {
    return { ...this.timeline };
  }

  /**
   * Add phase change listener
   */
  onPhaseChange(callback: (phase: AnimationPhase, step: KeyframeStep) => void): () => void {
    this.phaseListeners.push(callback);
    return () => {
      const index = this.phaseListeners.indexOf(callback);
      if (index > -1) {
        this.phaseListeners.splice(index, 1);
      }
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.isDestroying) {
      return; // Prevent recursive calls
    }
    this.isDestroying = true;
    this.cancel();
    this.phaseListeners = [];
    this.isDestroying = false;
  }
}

/**
 * Mock Keyframe Timeline for testing animation timing without actual CSS
 */
export class MockKeyframeTimeline {
  private animations: Map<string, KeyframeAnimationTester> = new Map();

  /**
   * Register an animation
   */
  registerAnimation(name: string, config: KeyframeAnimationConfig): KeyframeAnimationTester {
    const tester = new KeyframeAnimationTester({ ...config, name });
    this.animations.set(name, tester);
    return tester;
  }

  /**
   * Start animation by name
   */
  startAnimation(name: string): void {
    const animation = this.animations.get(name);
    if (animation) {
      animation.start();
    }
  }

  /**
   * Pause animation by name
   */
  pauseAnimation(name: string): void {
    const animation = this.animations.get(name);
    if (animation) {
      animation.pause();
    }
  }

  /**
   * Get animation by name
   */
  getAnimation(name: string): KeyframeAnimationTester | undefined {
    return this.animations.get(name);
  }

  /**
   * Get all animations
   */
  getAllAnimations(): Record<string, KeyframeAnimationTester> {
    const result: Record<string, KeyframeAnimationTester> = {};
    this.animations.forEach((animation, name) => {
      result[name] = animation;
    });
    return result;
  }

  /**
   * Clear all animations
   */
  clear(): void {
    this.animations.forEach(animation => animation.destroy());
    this.animations.clear();
  }
}

/**
 * Animation Phase Validator for verifying animation phase transitions
 */
export class AnimationPhaseValidator {
  private expectedPhases: AnimationPhase[] = [];
  private actualPhases: Array<{ phase: AnimationPhase; timestamp: number }> = [];

  /**
   * Expect a specific phase in sequence
   */
  expectPhase(phase: AnimationPhase): AnimationPhaseValidator {
    this.expectedPhases.push(phase);
    return this;
  }

  /**
   * Record an actual phase occurrence
   */
  recordPhase(phase: AnimationPhase): void {
    this.actualPhases.push({
      phase,
      timestamp: Date.now()
    });
  }

  /**
   * Validate that actual phases match expected phases
   */
  validate(): {
    isValid: boolean;
    errors: string[];
    expectedPhases: AnimationPhase[];
    actualPhases: AnimationPhase[];
  } {
    const errors: string[] = [];
    const actualPhaseList = this.actualPhases.map(p => p.phase);

    if (actualPhaseList.length !== this.expectedPhases.length) {
      errors.push(
        `Expected ${this.expectedPhases.length} phases, got ${actualPhaseList.length}`
      );
    }

    for (let i = 0; i < Math.min(actualPhaseList.length, this.expectedPhases.length); i++) {
      if (actualPhaseList[i] !== this.expectedPhases[i]) {
        errors.push(
          `Phase ${i}: expected ${this.expectedPhases[i]}, got ${actualPhaseList[i]}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      expectedPhases: [...this.expectedPhases],
      actualPhases: actualPhaseList
    };
  }

  /**
   * Reset validator state
   */
  reset(): void {
    this.expectedPhases = [];
    this.actualPhases = [];
  }
}

/**
 * Utility function to simulate keyframe phases for testing
 */
export const simulateKeyframePhases = async (
  config: KeyframeAnimationConfig,
  phaseCallback?: (phase: AnimationPhase, step: KeyframeStep) => void
): Promise<AnimationTimeline> => {
  return new Promise((resolve) => {
    const tester = new KeyframeAnimationTester(config);

    if (phaseCallback) {
      tester.onPhaseChange(phaseCallback);
    }

    tester.onPhaseChange((phase) => {
      if (phase === 'completed' || phase === 'cancelled') {
        const timeline = tester.getTimeline();
        tester.destroy();
        resolve(timeline);
      }
    });

    act(() => {
      tester.start();
    });
  });
};

/**
 * Utility function to validate animation phase progression
 */
export const validateAnimationPhase = (
  actualPhase: AnimationPhase,
  expectedPhase: AnimationPhase
): boolean => {
  return actualPhase === expectedPhase;
};

/**
 * Utility to create a mock timeline for testing
 */
export const createMockTimeline = (): MockKeyframeTimeline => {
  return new MockKeyframeTimeline();
};

/**
 * Predefined animation configurations for common scenarios
 */
export const commonAnimationConfigs = {
  fadeIn: {
    name: 'fadeIn',
    duration: 300,
    steps: 5
  },
  slideUp: {
    name: 'slideUp',
    duration: 400,
    steps: 8
  },
  rotateText: {
    name: 'rotateText',
    duration: 3000,
    iterationCount: 1, // Changed from Infinity to prevent test hangs
    steps: 20
  },
  logoStagger: {
    name: 'logoStagger',
    duration: 600,
    steps: 10
  },
  buttonHover: {
    name: 'buttonHover',
    duration: 200,
    steps: 4
  }
};

/**
 * Test helper for waiting for animation phase
 */
export const waitForAnimationPhase = async (
  tester: KeyframeAnimationTester,
  targetPhase: AnimationPhase,
  timeout: number = 5000
): Promise<KeyframeStep> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout waiting for animation phase: ${targetPhase}`));
    }, timeout);

    const cleanup = tester.onPhaseChange((phase, step) => {
      if (phase === targetPhase) {
        clearTimeout(timeoutId);
        cleanup();
        resolve(step);
      }
    });
  });
};

/**
 * Test helper for verifying animation duration
 */
export const verifyAnimationDuration = async (
  config: KeyframeAnimationConfig,
  tolerance: number = 50 // milliseconds
): Promise<boolean> => {
  const startTime = Date.now();
  await simulateKeyframePhases(config);
  const actualDuration = Date.now() - startTime;
  
  return Math.abs(actualDuration - config.duration) <= tolerance;
};

// Export types for external use
export type { AnimationPhase, KeyframeStep, AnimationTimeline, KeyframeAnimationConfig };
