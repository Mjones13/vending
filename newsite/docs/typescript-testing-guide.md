# TypeScript Testing Guide

This guide documents TypeScript best practices and patterns for testing in our React 18 + Next.js application with strict mode enabled.

## Table of Contents

1. [TypeScript Configuration](#typescript-configuration)
2. [Common Type Safety Patterns](#common-type-safety-patterns)
3. [Animation Testing Types](#animation-testing-types)
4. [Mock and Test Utility Types](#mock-and-test-utility-types)
5. [Error Patterns and Solutions](#error-patterns-and-solutions)
6. [Styled-JSX Type Handling](#styled-jsx-type-handling)
7. [Best Practices](#best-practices)

## TypeScript Configuration

### Test-Specific Configuration

Our `tsconfig.test.json` extends the main TypeScript configuration with test-specific settings:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "types": ["jest", "@testing-library/jest-dom", "node"]
  },
  "include": [
    "**/__tests__/**/*",
    "**/test-utils/**/*",
    "**/*.test.*",
    "**/*.spec.*"
  ]
}
```

### Strict Mode Compliance

We use TypeScript strict mode with `exactOptionalPropertyTypes: true`, which requires careful handling of optional properties.

## Common Type Safety Patterns

### Array Access Safety

**Problem**: Array access can return `undefined` in strict mode.

```typescript
// ❌ Error-prone
const item = array[0].property;

// ✅ Safe patterns
const item = array[0]?.property;

// Or with explicit checks
const firstItem = array[0];
if (firstItem) {
  const property = firstItem.property;
}

// Or with non-null assertion when you're certain
expect(phases[0]!.startTime).toBe(0);
```

### Optional Property Handling

**Problem**: `exactOptionalPropertyTypes: true` requires careful handling of optional properties.

```typescript
// ❌ Error with exactOptionalPropertyTypes
const transition: AnimationStateTransition = {
  from,
  to,
  timestamp: Date.now(),
  trigger // Could be undefined
};

// ✅ Correct patterns
const transition: AnimationStateTransition = {
  from,
  to,
  timestamp: Date.now(),
  ...(trigger !== undefined && { trigger })
};

// Or conditionally include the entire object
const props = {
  required: value,
  ...(optionalValue !== undefined && { optional: optionalValue })
};
```

### String | undefined in Testing

**Problem**: Mock data arrays can contain undefined values.

```typescript
// ❌ Error-prone
expect(screen.getByText(mockWords[0])).toBeInTheDocument();

// ✅ Safe patterns
const firstWord = mockWords[0];
if (!firstWord) throw new Error('First word is required for test');
expect(screen.getByText(firstWord)).toBeInTheDocument();

// Or with fallback
expect(rotatingText).toHaveTextContent(mockWords[0] || '');
```

## Animation Testing Types

### Animation State Types

```typescript
export type AnimationState = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled';

export interface AnimationStateTransition {
  from: AnimationState;
  to: AnimationState;
  timestamp: number;
  trigger?: string; // Optional property
}

export interface MockAnimationState {
  currentState: AnimationState;
  previousState: AnimationState | null;
  transitions: AnimationStateTransition[];
  duration?: number;
  progress: number; // 0-1
  iterationCount: number;
}
```

### Animation Phase Types

```typescript
export type AnimationPhase = 'before-start' | 'animating' | 'paused' | 'completed' | 'cancelled';

export interface KeyframeStep {
  percentage: number; // 0-100
  phase: AnimationPhase;
  timestamp: number;
  properties?: Record<string, string>;
}
```

### CSS Animation Mock Types

```typescript
export interface MockAnimationProperties {
  animationName: string;
  animationDuration: string;
  animationDelay: string;
  animationIterationCount: string;
  animationDirection: string;
  animationFillMode: string;
  animationPlayState: string;
  animationTimingFunction: string;
  // Optional transition properties
  transitionProperty?: string;
  transitionDuration?: string;
  transitionDelay?: string;
  transitionTimingFunction?: string;
  // Optional layout properties
  display?: string;
  position?: string;
  visibility?: string;
  opacity?: string;
  transform?: string;
}
```

## Mock and Test Utility Types

### React Router Mocking

```typescript
import { useRouter } from 'next/router';

// Complete NextRouter mock with all required properties
const mockRouter = {
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  basePath: '',
  locale: undefined,
  locales: undefined,
  defaultLocale: undefined,
  isReady: true,
  isPreview: false,
  isLocaleDomain: false,
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  ...router, // Override with custom values
};
```

### Jest Timer Types

```typescript
// Correct Jest fake timers setup
export function setupFakeTimers(
  options: Parameters<typeof jest.useFakeTimers>[0] = {}
): void {
  jest.useFakeTimers(options);
}
```

### Generic Test Hook Types

```typescript
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
  // Implementation with proper type handling
  const hookResult = renderHook(hook, {
    ...(options.initialProps !== undefined && { initialProps: options.initialProps }),
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
```

## Error Patterns and Solutions

### 1. Array Access Safety Errors

**Error**: `Object is possibly 'undefined'`

**Solution**: Always check array bounds or use optional chaining:

```typescript
// ✅ Safe array access patterns
for (let i = 1; i < transitions.length; i++) {
  const current = transitions[i];
  const previous = transitions[i - 1];
  if (!current || !previous) continue;
  // Safe to use current and previous
}
```

### 2. exactOptionalPropertyTypes Errors

**Error**: `Consider adding 'undefined' to the types of the target's properties`

**Solution**: Only include optional properties when they have defined values:

```typescript
// ✅ Conditional property inclusion
const config = {
  required: value,
  ...(optional !== undefined && { optional })
};

// ✅ Component props with optional properties
<MockComponent 
  {...(initialState && { initialState })}
/>
```

### 3. Mock Function Type Mismatches

**Error**: Jest mock types not matching expected function signatures

**Solution**: Use proper Jest mock types:

```typescript
// ✅ Correct Jest mock setup
const mockFunction = jest.fn().mockResolvedValue(undefined) as jest.MockedFunction<typeof originalFunction>;

// ✅ For void functions
const mockCallback = jest.fn() as jest.MockedFunction<(value: string) => void>;
```

### 4. DOM Element Null Safety

**Error**: Element possibly null from DOM queries

**Solution**: Check for null or use non-null assertions when certain:

```typescript
// ✅ Safe DOM access
const element = container.querySelector('.dropdown');
if (element) {
  expect(element).toHaveClass('visible');
}

// ✅ When certain element exists (after getBy* query)
const container = screen.getByTestId('container').parentElement!;
```

## Styled-JSX Type Handling

For styled-jsx compatibility in TypeScript strict mode:

```typescript
// ✅ Type-safe styled-jsx usage
<style jsx={true as any}>{`
  .component {
    color: blue;
  }
`}</style>
```

## Best Practices

### 1. Type Guards and Assertions

Use type guards for complex type checking:

```typescript
function isAnimationRunning(state: AnimationState): boolean {
  return state === 'running';
}

function isValidTransition(transition: unknown): transition is AnimationStateTransition {
  return (
    typeof transition === 'object' &&
    transition !== null &&
    'from' in transition &&
    'to' in transition &&
    'timestamp' in transition
  );
}
```

### 2. Generic Test Utilities

Create reusable generic test utilities:

```typescript
export function createTestWrapper<T extends Record<string, unknown>>(
  defaultProps: T
) {
  return function TestWrapper(overrideProps: Partial<T>) {
    const props = { ...defaultProps, ...overrideProps };
    return <Component {...props} />;
  };
}
```

### 3. Strict Interface Definitions

Define interfaces with all required properties:

```typescript
// ✅ Complete interface definition
interface TestComponentProps {
  title: string;
  items: ReadonlyArray<string>;
  onSelect?: (item: string) => void;
  className?: string;
}

// ✅ Use readonly for arrays that shouldn't be mutated
interface ReadonlyConfig {
  readonly words: ReadonlyArray<string>;
  readonly timing: Readonly<{
    duration: number;
    delay: number;
  }>;
}
```

### 4. Error Handling in Tests

Provide clear error messages for test failures:

```typescript
// ✅ Descriptive error messages
const firstWord = mockWords[0];
if (!firstWord) {
  throw new Error('First word is required for test - check mockWords array');
}

// ✅ Assertion helpers with context
function expectElementWithTimeout(
  element: HTMLElement | null,
  className: string,
  timeout: number = 1000
) {
  if (!element) {
    throw new Error(`Element not found for class "${className}"`);
  }
  
  return waitFor(() => {
    expect(element).toHaveClass(className);
  }, { timeout });
}
```

### 5. Import Organization

Organize imports with clear type-only imports:

```typescript
import React, { type ReactNode, type ComponentType } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { NextRouter } from 'next/router';

// Type-only imports for better clarity
import type { 
  AnimationState, 
  AnimationStateTransition,
  MockAnimationProperties 
} from '../types/animation';
```

## Validation Commands

### Type Checking

```bash
# Run TypeScript validation on tests
npm run test:typecheck

# Run full TypeScript check
npx tsc --noEmit

# Run tests with type checking
npm run test:ai:full
```

### Pre-Commit Validation

```bash
# Fast validation before commits
npm run test:ai:pre-push

# Full validation before merging
npm run push:ai:validated
```

---

This guide serves as a reference for maintaining TypeScript strict mode compliance in our testing infrastructure. Follow these patterns to ensure type safety and prevent common TypeScript errors in test files.