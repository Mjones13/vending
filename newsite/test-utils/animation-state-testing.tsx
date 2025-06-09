import { renderHook, RenderHookResult } from '@testing-library/react';
import { act } from '@testing-library/react';
import React, { createContext, useContext, ReactNode } from 'react';

/**
 * Animation State Testing Utilities
 * 
 * These utilities enable testing animation logic and state machines without
 * relying on visual CSS rendering or DOM manipulation. Designed for Tier 1
 * testing (logic-only) in our three-tier testing strategy.
 */

// Animation state type definitions
export type AnimationState = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled';

export interface AnimationStateTransition {
  from: AnimationState;
  to: AnimationState;
  timestamp: number;
  trigger?: string;
}

export interface MockAnimationState {
  currentState: AnimationState;
  previousState: AnimationState | null;
  transitions: AnimationStateTransition[];
  duration?: number;
  progress: number; // 0-1
  iterationCount: number;
}

/**
 * Animation State Machine for testing state transitions
 */
export class AnimationStateMachine {
  private state: AnimationState = 'idle';
  private transitions: AnimationStateTransition[] = [];
  private listeners: Array<(state: AnimationState) => void> = [];

  constructor(private initialState: AnimationState = 'idle') {
    this.state = initialState;
  }

  getCurrentState(): AnimationState {
    return this.state;
  }

  getTransitionHistory(): AnimationStateTransition[] {
    return [...this.transitions];
  }

  transition(to: AnimationState, trigger?: string): void {
    const from = this.state;
    const transition: AnimationStateTransition = {
      from,
      to,
      timestamp: Date.now(),
      trigger
    };

    this.transitions.push(transition);
    this.state = to;

    // Notify listeners
    this.listeners.forEach(listener => listener(to));
  }

  onStateChange(callback: (state: AnimationState) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  reset(): void {
    this.state = this.initialState;
    this.transitions = [];
  }
}

/**
 * Mock Animation Context for testing hooks in isolation
 */
interface AnimationContextValue {
  state: MockAnimationState;
  updateState: (updates: Partial<MockAnimationState>) => void;
  triggerTransition: (to: AnimationState, trigger?: string) => void;
}

const AnimationContext = createContext<AnimationContextValue | null>(null);

export const MockAnimationContext: React.FC<{
  children: ReactNode;
  initialState?: Partial<MockAnimationState>;
}> = ({ children, initialState = {} }) => {
  const [state, setState] = React.useState<MockAnimationState>({
    currentState: 'idle',
    previousState: null,
    transitions: [],
    progress: 0,
    iterationCount: 0,
    ...initialState
  });

  const updateState = React.useCallback((updates: Partial<MockAnimationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const triggerTransition = React.useCallback((to: AnimationState, trigger?: string) => {
    setState(prev => {
      const transition: AnimationStateTransition = {
        from: prev.currentState,
        to,
        timestamp: Date.now(),
        trigger
      };

      return {
        ...prev,
        previousState: prev.currentState,
        currentState: to,
        transitions: [...prev.transitions, transition]
      };
    });
  }, []);

  const value: AnimationContextValue = {
    state,
    updateState,
    triggerTransition
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

/**
 * Hook for accessing mock animation context in tests
 */
export const useMockAnimationContext = (): AnimationContextValue => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useMockAnimationContext must be used within MockAnimationContext');
  }
  return context;
};

/**
 * State Transition Validator for verifying state change sequences
 */
export class StateTransitionValidator {
  private expectedTransitions: Array<{ from: AnimationState; to: AnimationState }> = [];

  expect(from: AnimationState, to: AnimationState): StateTransitionValidator {
    this.expectedTransitions.push({ from, to });
    return this;
  }

  validate(transitions: AnimationStateTransition[]): {
    isValid: boolean;
    errors: string[];
    actualTransitions: Array<{ from: AnimationState; to: AnimationState }>;
  } {
    const errors: string[] = [];
    const actualTransitions = transitions.map(t => ({ from: t.from, to: t.to }));

    // Check if we have the expected number of transitions
    if (actualTransitions.length !== this.expectedTransitions.length) {
      errors.push(
        `Expected ${this.expectedTransitions.length} transitions, got ${actualTransitions.length}`
      );
    }

    // Validate each transition
    for (let i = 0; i < Math.min(actualTransitions.length, this.expectedTransitions.length); i++) {
      const actual = actualTransitions[i];
      const expected = this.expectedTransitions[i];

      if (actual.from !== expected.from || actual.to !== expected.to) {
        errors.push(
          `Transition ${i}: expected ${expected.from} → ${expected.to}, got ${actual.from} → ${actual.to}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      actualTransitions
    };
  }

  reset(): void {
    this.expectedTransitions = [];
  }
}

/**
 * Utility functions for creating mock animation states
 */
export const createMockAnimationState = (overrides: Partial<MockAnimationState> = {}): MockAnimationState => {
  return {
    currentState: 'idle',
    previousState: null,
    transitions: [],
    progress: 0,
    iterationCount: 0,
    ...overrides
  };
};

/**
 * Utility for validating state transitions
 */
export const validateStateTransition = (
  from: AnimationState,
  to: AnimationState,
  transitions: AnimationStateTransition[]
): boolean => {
  return transitions.some(t => t.from === from && t.to === to);
};

/**
 * Utility for testing animation hooks with mock context
 */
export const testAnimationHook = <TProps, TResult>(
  hook: (props: TProps) => TResult,
  options: {
    initialProps?: TProps;
    initialAnimationState?: Partial<MockAnimationState>;
    wrapper?: React.ComponentType<{ children: ReactNode }>;
  } = {}
): {
  result: React.MutableRefObject<TResult>;
  rerender: (newProps?: TProps) => void;
  unmount: () => void;
  getAnimationState: () => MockAnimationState;
  triggerTransition: (to: AnimationState, trigger?: string) => void;
} => {
  let animationContextValue: AnimationContextValue | null = null;

  const TestWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
      <MockAnimationContext initialState={options.initialAnimationState}>
        <AnimationContextCapture>
          {options.wrapper ? (
            <options.wrapper>{children}</options.wrapper>
          ) : (
            children
          )}
        </AnimationContextCapture>
      </MockAnimationContext>
    );
  };

  // Component to capture animation context value
  const AnimationContextCapture: React.FC<{ children: ReactNode }> = ({ children }) => {
    animationContextValue = useMockAnimationContext();
    return <>{children}</>;
  };

  const hookResult = renderHook(hook, {
    initialProps: options.initialProps,
    wrapper: TestWrapper
  });

  return {
    result: hookResult.result,
    rerender: hookResult.rerender,
    unmount: hookResult.unmount,
    getAnimationState: () => {
      if (!animationContextValue) {
        throw new Error('Animation context not available');
      }
      return animationContextValue.state;
    },
    triggerTransition: (to: AnimationState, trigger?: string) => {
      if (!animationContextValue) {
        throw new Error('Animation context not available');
      }
      act(() => {
        animationContextValue!.triggerTransition(to, trigger);
      });
    }
  };
};

/**
 * Type guards for animation states
 */
export const isAnimationRunning = (state: AnimationState): boolean => {
  return state === 'running';
};

export const isAnimationComplete = (state: AnimationState): boolean => {
  return state === 'completed';
};

export const isAnimationActive = (state: AnimationState): boolean => {
  return state === 'running' || state === 'paused';
};

/**
 * Utility for testing state machine behavior
 */
export const createTestStateMachine = (initialState?: AnimationState): {
  machine: AnimationStateMachine;
  expectTransition: (from: AnimationState, to: AnimationState) => void;
  validateTransitions: () => void;
  reset: () => void;
} => {
  const machine = new AnimationStateMachine(initialState);
  const validator = new StateTransitionValidator();

  return {
    machine,
    expectTransition: (from: AnimationState, to: AnimationState) => {
      validator.expect(from, to);
    },
    validateTransitions: () => {
      const result = validator.validate(machine.getTransitionHistory());
      if (!result.isValid) {
        throw new Error(`State transitions validation failed:\n${result.errors.join('\n')}`);
      }
    },
    reset: () => {
      machine.reset();
      validator.reset();
    }
  };
};