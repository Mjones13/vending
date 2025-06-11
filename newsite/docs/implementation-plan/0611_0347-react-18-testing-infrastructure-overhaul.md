# Implementation Plan: React 18 Testing Infrastructure Overhaul

**Branch**: `react-18-testing-overhaul`  
**Created**: June 11, 2025 at 03:47  
**Updated**: June 11, 2025 at 03:47  
**ID**: 0611_0347

> ⚠️ **IMPORTANT**: All work for this implementation plan MUST be done on the `react-18-testing-overhaul` branch.  
> Before starting any work, ensure you are on the correct branch: `git checkout react-18-testing-overhaul`

## Background

The codebase has already been migrated to React 18.3.1 and TypeScript strict mode has been enabled. However, the testing infrastructure still has:
- Complex Jest configuration with M2 optimization that may be over-engineered
- React act() warnings due to complex timer management
- Test coverage at 31% (target: 80%)
- Over-complex testing utilities with extensive polyfills
- TypeScript exclusions for test files that should be included

## Key Challenges

1. **TypeScript Configuration**: Tests are excluded from tsconfig.json but should be included with proper typing
2. **Over-Complex Jest Setup**: 355 lines of jest.setup.js with extensive polyfills and workarounds
3. **Test Utilities Misalignment**: Current utilities don't leverage TypeScript strict mode benefits
4. **Coverage Gaps**: Pages (24%) and hooks (40%) below 80% target
5. **Complex M2 Optimization**: May be unnecessary complexity for current needs

## High-Level Task Breakdown

### Phase 1: Fix TypeScript Configuration for Tests

- [ ] **Task 1.1**: Update tsconfig.json to include test files
  - **File**: `tsconfig.json`
  - **Change**: Remove `"**/__tests__/**", "**/test-utils/**", "**/*.test.*", "**/*.spec.*"` from exclude array
  - **Verify**: `npx tsc --noEmit` runs without errors including test files

- [ ] **Task 1.2**: Create tsconfig.test.json for test-specific configuration
  - **File**: `tsconfig.test.json`
  - **Change**: Create file with:
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
  - **Verify**: File exists and TypeScript recognizes test types

- [ ] **Task 1.3**: Add missing TypeScript testing dependencies
  - **File**: `package.json`
  - **Change**: Add `"@types/jest": "^29.5.0"` to devDependencies
  - **Verify**: `npm list @types/jest` shows correct version

### Phase 2: Simplify Jest Configuration

- [ ] **Task 2.1**: Backup existing jest.config.js
  - **File**: `jest.config.js`
  - **Change**: Copy to `jest.config.js.backup`
  - **Verify**: `ls jest.config.js.backup` exists

- [ ] **Task 2.2**: Create simplified jest.config.js with TypeScript support
  - **File**: `jest.config.js`
  - **Change**: Replace with simplified configuration:
    ```javascript
    const nextJest = require('next/jest');
    
    const createJestConfig = nextJest({
      dir: './',
    });
    
    /** @type {import('jest').Config} */
    const config = {
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      testEnvironment: 'jsdom',
      
      // TypeScript support
      preset: 'ts-jest/presets/default-esm',
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      globals: {
        'ts-jest': {
          useESM: true,
          tsconfig: 'tsconfig.test.json'
        }
      },
      
      // Test matching
      testMatch: [
        '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
        '**/*.(test|spec).(ts|tsx|js)'
      ],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
        '/.next-ai/',
        '/coverage/',
        '/__tests__/e2e/'
      ],
      
      // Coverage
      collectCoverageFrom: [
        'components/**/*.{ts,tsx}',
        'pages/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'utils/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!pages/_app.tsx',
        '!pages/_document.tsx',
        '!pages/api/**/*'
      ],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      
      // Simplified performance
      maxWorkers: '50%',
      testTimeout: 10000
    };
    
    module.exports = createJestConfig(config);
    ```
  - **Verify**: `npm test -- --listTests` runs without errors

### Phase 3: Convert and Simplify jest.setup.js to TypeScript

- [ ] **Task 3.1**: Backup existing jest.setup.js
  - **File**: `jest.setup.js`
  - **Change**: Copy to `jest.setup.js.backup`
  - **Verify**: `ls jest.setup.js.backup` exists

- [ ] **Task 3.2**: Create simplified jest.setup.ts with proper typing
  - **File**: `jest.setup.ts`
  - **Change**: Replace 355-line file with TypeScript version:
    ```typescript
    import '@testing-library/jest-dom';
    import { cleanup } from '@testing-library/react';
    import type { NextRouter } from 'next/router';
    
    // Cleanup after each test
    afterEach(() => {
      cleanup();
    });
    
    // Mock Next.js router with proper typing
    const mockRouter: Partial<NextRouter> = {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
    
    jest.mock('next/router', () => ({
      useRouter: () => mockRouter,
    }));
    
    // Mock Next.js Image component
    jest.mock('next/image', () => ({
      __esModule: true,
      default: (props: any) => {
        const { priority, fill, sizes, ...imageProps } = props;
        // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
        return <img {...imageProps} />;
      },
    }));
    
    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      disconnect() {}
      observe() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
    };
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    ```
  - **Verify**: `npm test -- --testPathPattern="simple"` runs without setup errors

### Phase 4: Create TypeScript-First Test Utilities

- [ ] **Task 4.1**: Archive existing test-utils directory
  - **File**: `test-utils/`
  - **Change**: Move entire directory to `test-utils-archived/`
  - **Verify**: `ls test-utils-archived/` shows archived files

- [ ] **Task 4.2**: Create typed test-utils/index.ts
  - **File**: `test-utils/index.ts`
  - **Change**: Create new file with TypeScript exports:
    ```typescript
    export * from './render';
    export * from './test-data';
    export type * from './types';
    ```
  - **Verify**: File exists with proper TypeScript exports

- [ ] **Task 4.3**: Create typed render utility
  - **File**: `test-utils/render.tsx`
  - **Change**: Create with TypeScript generics:
    ```typescript
    import React, { ReactElement } from 'react';
    import { render as rtlRender, RenderOptions, RenderResult } from '@testing-library/react';
    
    interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
      // Add any custom wrapper props here if needed
    }
    
    function render<T extends ReactElement>(
      ui: T,
      options?: CustomRenderOptions
    ): RenderResult {
      return rtlRender(ui, {
        ...options,
      });
    }
    
    // Re-export everything from RTL
    export * from '@testing-library/react';
    export { render };
    ```
  - **Verify**: TypeScript recognizes proper types

- [ ] **Task 4.4**: Create typed test data utilities
  - **File**: `test-utils/test-data.ts`
  - **Change**: Create with TypeScript interfaces:
    ```typescript
    import type { NextRouter } from 'next/router';
    
    export interface MockRouterProps extends Partial<NextRouter> {
      pathname?: string;
      query?: Record<string, string | string[]>;
    }
    
    export const createMockRouter = (overrides: MockRouterProps = {}): NextRouter => ({
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      ...overrides,
    } satisfies NextRouter);
    
    export const mockImageProps = {
      src: '/test-image.jpg',
      alt: 'Test image',
      width: 100,
      height: 100,
    } as const;
    ```
  - **Verify**: TypeScript validates mock data types

- [ ] **Task 4.5**: Create test types file
  - **File**: `test-utils/types.ts`
  - **Change**: Create common test types:
    ```typescript
    import type { ReactElement } from 'react';
    import type { RenderResult } from '@testing-library/react';
    
    export interface TestComponentProps {
      children?: React.ReactNode;
      className?: string;
    }
    
    export interface RenderWithPropsOptions<T = Record<string, unknown>> {
      props?: T;
      renderOptions?: Parameters<typeof render>[1];
    }
    
    export type TestRenderFunction<T = Record<string, unknown>> = (
      props?: T
    ) => RenderResult;
    ```
  - **Verify**: Types are properly exported and usable

### Phase 5: Fix React Act() Warnings with TypeScript

- [ ] **Task 5.1**: Update Layout component test with TypeScript
  - **File**: `__tests__/components/Layout.test.tsx`
  - **Change**: Add proper typing and fix async patterns:
    ```typescript
    import { render, screen, waitFor } from '@/test-utils';
    import Layout from '@/components/Layout';
    import type { ReactNode } from 'react';
    
    interface LayoutProps {
      children: ReactNode;
    }
    
    const renderLayout = (props: Partial<LayoutProps> = {}) =>
      render(<Layout {...props}>Test Content</Layout>);
    ```
  - **Verify**: `npm test Layout.test` passes without act() warnings

- [ ] **Task 5.2**: Fix Homepage test with proper TypeScript patterns
  - **File**: `__tests__/pages/index.test.tsx`
  - **Change**: Use `waitFor` instead of timer manipulation with proper types
  - **Verify**: `npm test index.test` passes without act() warnings

### Phase 6: Simplify Package.json Test Scripts

- [ ] **Task 6.1**: Update package.json test scripts for TypeScript
  - **File**: `package.json`
  - **Change**: Replace complex test scripts with:
    ```json
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:typecheck": "tsc --noEmit -p tsconfig.test.json",
    "test:unit": "jest --testPathPattern='__tests__/(components|hooks|utils)'",
    "test:integration": "jest --testPathPattern='__tests__/pages'",
    "test:ci": "npm run test:typecheck && jest --ci --coverage --maxWorkers=2",
    "e2e": "playwright test",
    "e2e:headed": "playwright test --headed"
    ```
  - **Verify**: All scripts execute successfully

### Phase 7: Increase Test Coverage with TypeScript - Components

- [ ] **Task 7.1**: Create comprehensive HeroSection tests with TypeScript
  - **File**: `__tests__/components/HeroSection.test.tsx`
  - **Change**: Create typed test suite:
    ```typescript
    import { render, screen } from '@/test-utils';
    import HeroSection from '@/components/HeroSection';
    import type { ComponentProps } from 'react';
    
    type HeroSectionProps = ComponentProps<typeof HeroSection>;
    
    const defaultProps = {
      // Define typed props
    } satisfies Partial<HeroSectionProps>;
    
    const renderHeroSection = (props: Partial<HeroSectionProps> = {}) =>
      render(<HeroSection {...defaultProps} {...props} />);
    ```
  - **Verify**: Coverage >80% with TypeScript validation

### Phase 8: Increase Test Coverage with TypeScript - Pages

- [ ] **Task 8.1**: Create typed tests for about page
  - **File**: `__tests__/pages/about.test.tsx`
  - **Change**: Add comprehensive tests with TypeScript
  - **Verify**: `npm test about.test` passes with coverage

- [ ] **Task 8.2**: Create typed tests for contact page
  - **File**: `__tests__/pages/contact.test.tsx`
  - **Change**: Test form validation with proper TypeScript types
  - **Verify**: Form interactions tested with type safety

### Phase 9: Create Hook Tests with TypeScript

- [ ] **Task 9.1**: Create comprehensive useScrollAnimation tests
  - **File**: `__tests__/hooks/useScrollAnimation.test.tsx`
  - **Change**: Use `@testing-library/react-hooks` with TypeScript:
    ```typescript
    import { renderHook, act } from '@testing-library/react';
    import { useScrollAnimation } from '@/hooks/useScrollAnimation';
    import type { ScrollAnimationOptions } from '@/hooks/useScrollAnimation';
    
    const defaultOptions = {
      // Typed options
    } satisfies ScrollAnimationOptions;
    ```
  - **Verify**: Hook tests achieve >80% coverage with TypeScript

### Phase 10: Clean Up and Remove Complexity

- [ ] **Task 10.1**: Remove complex M2 optimization scripts
  - **File**: `scripts/`
  - **Change**: Archive test-related scripts to `scripts/archived/`
  - **Verify**: Simplified scripts directory

- [ ] **Task 10.2**: Remove act() warning detection scripts
  - **File**: `scripts/detect-act-warnings.js`
  - **Change**: Delete file as warnings should be resolved
  - **Verify**: File no longer exists

- [ ] **Task 10.3**: Run full TypeScript validation on tests
  - **File**: N/A
  - **Change**: Run `npm run test:typecheck && npm run test:coverage`
  - **Verify**: All tests pass TypeScript validation and coverage >80%

### Phase 11: Documentation and TypeScript Integration

- [ ] **Task 11.1**: Create TypeScript testing guide
  - **File**: `docs/typescript-testing-guide.md`
  - **Change**: Document TypeScript testing patterns for React 18
  - **Verify**: Comprehensive guide with examples

- [ ] **Task 11.2**: Update CLAUDE.md testing section
  - **File**: `CLAUDE.md`
  - **Change**: Update testing requirements to mention TypeScript strict mode
  - **Verify**: `grep "TypeScript.*testing" CLAUDE.md` shows updated content

### Phase 12: Pre-Merge Preparation

- [ ] **Task 12.1**: Update branch with latest main changes
  - **File**: Git repository
  - **Change**: Run `git fetch --all --prune && git pull --rebase origin main`
  - **Verify**: `git log --oneline -5` shows commits on top of latest main
  - **Conflicts**: Document any conflicts resolved during rebase

- [ ] **Task 12.2**: Final comprehensive test suite validation
  - **File**: N/A
  - **Change**: Run `npm run test:ci && npm run e2e`
  - **Verify**: All tests pass without warnings or TypeScript errors

## Implementation Strategy

1. **TypeScript Integration First**: Ensure tests are properly typed before simplification
2. **Gradual Simplification**: Remove complexity while maintaining functionality
3. **Type Safety**: Leverage TypeScript strict mode for better test reliability
4. **React 18 Patterns**: Use proper async patterns instead of complex workarounds
5. **Coverage Goals**: Focus on achieving 80% coverage with maintainable tests

## Technical Approach

- Embrace TypeScript strict mode for test files
- Use `satisfies` operator for type-safe test data
- Leverage TypeScript generics for reusable test utilities
- Remove complex polyfills in favor of simple, typed mocks
- Use proper async patterns (`waitFor`, `findBy`) instead of timer manipulation

## Acceptance Criteria

1. ✅ All tests pass TypeScript strict mode validation
2. ✅ Test coverage exceeds 80% globally and per category  
3. ✅ Jest setup reduced from 355 lines to <100 lines
4. ✅ All test utilities are properly typed
5. ✅ No React act() warnings in any tests
6. ✅ Test execution simplified without complex M2 optimizations
7. ✅ Clear TypeScript testing patterns documented

## Project Status Board

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: TypeScript Config | ⏳ Pending | Include tests in TypeScript |
| Phase 2: Simplify Jest | ⏳ Pending | TypeScript-aware configuration |
| Phase 3: Setup TypeScript | ⏳ Pending | Convert 355-line setup to TS |
| Phase 4: Typed Utilities | ⏳ Pending | Create TypeScript-first utilities |
| Phase 5: Fix Act Warnings | ⏳ Pending | TypeScript + proper async |
| Phase 6: Simplify Scripts | ⏳ Pending | Add TypeScript validation |
| Phase 7: Component Coverage | ⏳ Pending | Typed component tests |
| Phase 8: Page Coverage | ⏳ Pending | Typed page tests |
| Phase 9: Hook Coverage | ⏳ Pending | Typed hook tests |
| Phase 10: Clean Up | ⏳ Pending | Remove unnecessary complexity |
| Phase 11: Documentation | ⏳ Pending | TypeScript testing guide |
| Phase 12: Pre-Merge | ⏳ Pending | Rebase and final validation |

## Lessons Learned

**[To be updated during implementation]**

- **Date**: [YYYY-MM-DD HH:MM] 
- **Issue**: [Brief description of problem encountered]
- **Solution**: [How it was resolved]
- **Prevention**: [How to avoid in future]

## File Modification Log

**[To be updated during implementation]**

### Phase X Modifications:
- **File**: `path/to/file`
- **Type**: [Created/Modified/Deleted]
- **Purpose**: [Brief description]
- **Lines Changed**: [+X/-Y]