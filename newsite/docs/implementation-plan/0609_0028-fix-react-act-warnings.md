# Implementation Plan: Fix React Act Warnings

**Branch**: `fix-react-act-warnings`  
**Created**: June 9, 2025 at 12:28 AM  
**ID**: 0609_0028

> ⚠️ **IMPORTANT**: All work for this implementation plan MUST be done on the `fix-react-act-warnings` branch.  
> Before starting any work, ensure you are on the correct branch: `git checkout fix-react-act-warnings`

## Background/Motivation

Our test suite is experiencing widespread React act() warnings affecting 90% of test files. These warnings occur when state updates happen outside of React's control flow, particularly in:
- Timer-based operations (setTimeout/setInterval)
- Animation frame callbacks (requestAnimationFrame)
- Async operations that update component state

React 18 introduced stricter enforcement of the act() boundary, requiring all state updates to be wrapped properly. This is causing test failures and making it difficult to identify real issues versus environment problems.

**Impact**: 
- 90% of test files affected with act() warnings
- False positives masking real test failures
- Developer confusion about which failures are real bugs vs test environment issues
- CI/CD pipeline instability due to warning noise

## Key Challenges

1. **Timer-based State Updates**: Components using setInterval/setTimeout for animations (especially rotating text) trigger act() warnings when state updates occur outside React's call stack
2. **Animation Frame Callbacks**: RAF-based animations that update state need proper act() wrapping, but current polyfills don't integrate with React's act() boundary
3. **Test Utility Fragmentation**: No centralized utilities for handling timer operations with act(), leading to inconsistent patterns across test files
4. **Fake vs Real Timer Conflicts**: Some tests require fake timers for control, while animation tests work better with real timers, creating complexity in test setup

## High-Level Task Breakdown

### Phase 1: Create Timer Utility Infrastructure ✅ **COMPLETE**
- [x] **Task 1.1**: Create test-utils/timer-helpers.ts with act()-wrapped timer utilities
- [x] **Task 1.2**: Write comprehensive tests for timer utilities to ensure they properly wrap operations
- [x] **Task 1.3**: Update jest.setup.js to provide global act() utilities and improved RAF polyfills with persistence through test cleanup
- [x] **Task 1.4**: Add global withAct utility to jest.setup.js for easy act() wrapping
- [x] **Task 1.5**: Configure testing library with increased asyncUtilTimeout (5000ms)
- [x] **Task 1.6**: Create documentation for timer utility usage patterns

### Phase 2: Fix High-Impact Test Files ✅ **COMPLETE**
- [x] **Task 2.1**: Fix act() warnings in rotating-text.test.tsx (use real timers to prevent infinite loops)
- [x] **Task 2.2**: Implement maxCycles pattern for rotating text tests to prevent hanging
- [x] **Task 2.3**: Fix act() warnings in HeroSection test files (multiple timer-based animations)
- [x] **Task 2.4**: Fix act() warnings in Layout.test.tsx (scroll-based state updates)
- [x] **Task 2.5**: Fix act() warnings in homepage index.test.tsx (integration of multiple components)
- [x] **Task 2.6**: Ensure all animation tests using setInterval switch to real timers or cycle limits

### Phase 3: Systematic Test Suite Updates
- [ ] **Task 3.1**: Create automated script to identify remaining files with act() warnings
- [ ] **Task 3.2**: Update remaining component tests to use new timer utilities
- [ ] **Task 3.3**: Update animation-specific tests to use appropriate timer strategies
- [ ] **Task 3.4**: Add comprehensive afterEach cleanup to prevent act() warnings from cleanup functions

### Phase 4: Verification and Documentation
- [ ] **Task 4.1**: Run full test suite to verify all act() warnings are resolved
- [ ] **Task 4.2**: Update testing guide with act() best practices and examples
- [ ] **Task 4.3**: Document the new timer utilities API and usage patterns

## Implementation Strategy

### Technical Approach:
We'll implement a two-pronged approach to eliminate act() warnings:

1. **Centralized Timer Utilities**: Create a comprehensive set of timer helpers that automatically wrap all timer operations in act(), providing a consistent API for tests
2. **Selective Timer Strategy**: Use real timers for animation tests that don't benefit from time control, and enhanced fake timers for tests requiring precise timing control

### Key Requirements:
- All timer utilities must properly wrap operations in act() to satisfy React 18 requirements
- Utilities must support both fake and real timer modes seamlessly
- RAF polyfills must integrate with React's act() boundary
- Solution must not break existing test functionality
- Performance impact must be minimal (target: <5% increase in test execution time)

### Dependencies:
- @testing-library/react (already installed) - provides act() function
- jest (already installed) - timer mocking capabilities
- No new external dependencies required - solution uses existing tools

### Implementation Details:

**Timer Utilities API**:
```typescript
// Advance timers with automatic act() wrapping
await advanceTimersByTimeAndAct(1000);

// Run all timers with act() wrapping
await runAllTimersAndAct();

// Wait for next animation frame
await waitForAnimationFrame();

// Execute callback after delay with act()
await waitForTimeout(500);

// Advance to next frame (for Jest 27+)
await advanceTimersToNextFrame();

// Global utility available in all tests
await global.withAct(async () => {
  // Any async operation that updates state
});
```

**Critical Implementation Details**:
- RAF polyfills must persist through test cleanup (use beforeEach checks)
- Animation tests with setInterval should default to real timers or use maxCycles pattern
- All async state updates must be wrapped in act(), including those in cleanup functions
- Test isolation requires comprehensive cleanup in afterEach

## Acceptance Criteria

### Functional Requirements:
- [ ] All React act() warnings eliminated from test output (0 warnings in full test run)
- [ ] Timer utilities successfully wrap all timer operations in act()
- [ ] Tests using new utilities pass consistently in both isolated and parallel execution
- [ ] Animation tests properly handle state updates without warnings
- [ ] No regression in existing test functionality

### Quality Requirements:
- [ ] Timer utilities have 100% test coverage
- [ ] Clear documentation and examples for each utility function
- [ ] Consistent API across all timer helpers
- [ ] TypeScript types properly defined for all utilities
- [ ] ESLint rule or guidance prevents future act() violations

### Performance Requirements:
- [ ] No significant test execution time regression
- [ ] No test timeouts due to improper timer handling
- [ ] Tests remain stable in parallel execution

## Project Status Board

### Current Status / Progress Tracking
**Phase**: Planning
**Last Updated**: June 9, 2025 at 12:28 AM
**Branch**: `fix-react-act-warnings`

| Task | Status | Notes |
|------|--------|-------|
| Implementation plan creation | ✅ Complete | Plan created with timestamp ID 0609_0028 |
| Requirements analysis | ⏳ Pending | [Add status updates here] |
| Phase 1 preparation | ⏳ Pending | [Add status updates here] |

### Next Steps:
1. Begin Phase 1 by creating the timer utilities infrastructure
2. Write tests for timer utilities following TDD approach
3. Update jest.setup.js with enhanced RAF polyfills and global utilities

### Executor's Feedback or Assistance Requests
This implementation plan addresses the React act() warnings affecting 90% of our test files. The approach focuses on creating reusable utilities that will make it easy to fix existing tests and prevent future issues. The phased approach allows us to tackle high-impact files first while building toward a comprehensive solution.

### Technical Notes:
- The solution avoids external dependencies by leveraging existing @testing-library/react capabilities
- Timer utilities will support both fake and real timer modes to accommodate different testing needs
- The approach is compatible with our parallel testing architecture on M2 MacBook

### Key Patterns from Reference Analysis:

1. **Persistent RAF Polyfills**: Must check and re-apply in beforeEach to survive test cleanup
2. **Real Timers for Animations**: Animation tests with setInterval should use real timers by default
3. **MaxCycles Pattern**: When using fake timers with animations, limit cycles to prevent infinite loops
4. **Global Utilities**: Provide withAct globally for easy wrapping of async operations
5. **Comprehensive Cleanup**: Clear timers, mocks, DOM, and global state in afterEach

---

**Status**: Implementation Plan Created ✅
