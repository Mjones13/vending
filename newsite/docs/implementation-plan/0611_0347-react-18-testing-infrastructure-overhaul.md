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
- Over-complex testing utilities with extensive polyfills
- TypeScript exclusions for test files that should be included
- Test coverage at 31% (not a focus of this plan)

## Key Challenges

1. **TypeScript Configuration**: Tests are excluded from tsconfig.json but should be included with proper typing
2. **Over-Complex Jest Setup**: 355 lines of jest.setup.js with extensive polyfills and workarounds
3. **Test Utilities Misalignment**: Current utilities don't leverage TypeScript strict mode benefits
4. **Complex M2 Optimization**: May be unnecessary complexity for current needs

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

### Phase 2: Convert and Simplify jest.setup.js to TypeScript

- [ ] **Task 2.1**: Backup existing jest.setup.js
  - **File**: `jest.setup.js`
  - **Change**: Copy to `jest.setup.js.backup`
  - **Verify**: `ls jest.setup.js.backup` exists

- [ ] **Task 2.2**: Create simplified jest.setup.ts with proper typing
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

### Phase 3: Fix React Act() Warnings with TypeScript

- [ ] **Task 3.1**: Update Layout component test with TypeScript
  - **File**: `__tests__/components/Layout.test.tsx`
  - **Change**: Add proper typing and fix async patterns:
    ```typescript
    import { render, screen, waitFor } from '@testing-library/react';
    import Layout from '@/components/Layout';
    import type { ReactNode } from 'react';
    
    interface LayoutProps {
      children: ReactNode;
    }
    
    const renderLayout = (props: Partial<LayoutProps> = {}) =>
      render(<Layout {...props}>Test Content</Layout>);
    ```
  - **Verify**: `npm test Layout.test` passes without act() warnings

- [ ] **Task 3.2**: Fix Homepage test with proper TypeScript patterns
  - **File**: `__tests__/pages/index.test.tsx`
  - **Change**: Use `waitFor` instead of timer manipulation with proper types
  - **Verify**: `npm test index.test` passes without act() warnings

### Phase 4: Simplify Package.json Test Scripts

- [ ] **Task 4.1**: Update package.json test scripts for TypeScript
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

### Phase 5: Create Hook Tests with TypeScript

- [ ] **Task 5.1**: Create comprehensive useScrollAnimation tests
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

### Phase 6: Clean Up and Remove Complexity

- [ ] **Task 6.1**: Remove complex M2 optimization scripts
  - **File**: `scripts/`
  - **Change**: Archive test-related scripts to `scripts/archived/`
  - **Verify**: Simplified scripts directory

- [ ] **Task 6.2**: Remove act() warning detection scripts
  - **File**: `scripts/detect-act-warnings.js`
  - **Change**: Delete file as warnings should be resolved
  - **Verify**: File no longer exists

- [ ] **Task 6.3**: Run full TypeScript validation on tests
  - **File**: N/A
  - **Change**: Run `npm run test:typecheck`
  - **Verify**: All tests pass TypeScript validation

### Phase 7: Documentation and TypeScript Integration

- [ ] **Task 7.1**: Create TypeScript testing guide
  - **File**: `docs/typescript-testing-guide.md`
  - **Change**: Document TypeScript testing patterns for React 18
  - **Verify**: Comprehensive guide with examples

- [ ] **Task 7.2**: Update CLAUDE.md testing section
  - **File**: `CLAUDE.md`
  - **Change**: Update testing requirements to mention TypeScript strict mode
  - **Verify**: `grep "TypeScript.*testing" CLAUDE.md` shows updated content

### Phase 8: Pre-Merge Preparation

- [ ] **Task 8.1**: Update branch with latest main changes
  - **File**: Git repository
  - **Change**: Run `git fetch --all --prune && git pull --rebase origin main`
  - **Verify**: `git log --oneline -5` shows commits on top of latest main
  - **Conflicts**: Document any conflicts resolved during rebase

- [ ] **Task 8.2**: Final comprehensive test suite validation
  - **File**: N/A
  - **Change**: Run `npm run test && npm run e2e`
  - **Verify**: All tests pass without warnings or TypeScript errors

## Implementation Strategy

1. **TypeScript Integration First**: Ensure tests are properly typed before simplification
2. **Gradual Simplification**: Remove complexity while maintaining functionality
3. **Type Safety**: Leverage TypeScript strict mode for better test reliability
4. **React 18 Patterns**: Use proper async patterns instead of complex workarounds
5. **Technical Debt Reduction**: Focus on fixing warnings and improving maintainability

## Technical Approach

- Embrace TypeScript strict mode for test files
- Use `satisfies` operator for type-safe test data
- Leverage TypeScript generics for reusable test utilities
- Remove complex polyfills in favor of simple, typed mocks
- Use proper async patterns (`waitFor`, `findBy`) instead of timer manipulation

## Acceptance Criteria

1. ✅ All tests pass TypeScript strict mode validation
2. ✅ Jest setup reduced from 355 lines to <100 lines
3. ✅ No React act() warnings in any tests
4. ✅ Test execution simplified without complex M2 optimizations
5. ✅ Clear TypeScript testing patterns documented
6. ✅ Tests properly typed and using React 18 best practices

## Project Status Board

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: TypeScript Config | ⏳ Pending | Include tests in TypeScript |
| Phase 2: Setup TypeScript | ⏳ Pending | Convert 355-line setup to TS |
| Phase 3: Fix Act Warnings | ⏳ Pending | TypeScript + proper async |
| Phase 4: Simplify Scripts | ⏳ Pending | Add TypeScript validation |
| Phase 5: Hook Coverage | ⏳ Pending | Typed hook tests |
| Phase 6: Clean Up | ⏳ Pending | Remove unnecessary complexity |
| Phase 7: Documentation | ⏳ Pending | TypeScript testing guide |
| Phase 8: Pre-Merge | ⏳ Pending | Rebase and final validation |

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