# Implementation Plan: Missing Browser API Polyfills

**Branch**: `missing-browser-api-polyfills`  
**Created**: June 9, 2025 at 12:23 AM  
**ID**: 0609_0023

> ⚠️ **IMPORTANT**: All work for this implementation plan MUST be done on the `missing-browser-api-polyfills` branch.  
> Before starting any work, ensure you are on the correct branch: `git checkout missing-browser-api-polyfills`

## Background/Motivation

Our test suite is experiencing a 45% failure rate due to issues with browser API polyfills in the Jest/JSDOM environment. The most critical issue is that `cancelAnimationFrame` is not properly defined, which causes immediate failure of all 22 homepage tests.

**Current State**: The jest.setup.js file already includes RAF/cAF polyfills (lines 186-191), but they are:
1. Using `setTimeout(cb, 0)` instead of proper 16ms timing for 60fps
2. Wrapped in `jest.fn()` which may interfere with their functionality
3. Only set up once in beforeEach, not re-applied after cleanup

This implementation fixes the existing polyfills to work correctly and persist through test cleanup cycles.

## Key Challenges

1. **Incorrect Implementation**: Current polyfills use 0ms timeout instead of 16ms for proper frame timing
2. **Jest Mock Wrapper**: The `jest.fn()` wrapper may be interfering with proper execution
3. **Persistence in beforeEach**: Need to ensure polyfills are reapplied in beforeEach to handle cleanup

## High-Level Task Breakdown

### Phase 1: Fix Existing Polyfills
- [ ] **Task 1.1**: Write a test that demonstrates the current polyfill failure
- [ ] **Task 1.2**: Fix the RAF/cAF polyfills in jest.setup.js (remove jest.fn wrapper, use 16ms timing)
- [ ] **Task 1.3**: Add polyfill reapplication in beforeEach hook
- [ ] **Task 1.4**: Verify homepage tests no longer fail due to missing APIs

### Phase 2: Verify and Document
- [ ] **Task 2.1**: Run the full test suite to measure improvement
- [ ] **Task 2.2**: Document the polyfill fix in code comments
- [ ] **Task 2.3**: Update scratchpad.md with the solution
- [ ] **Task 2.4**: Check for any new issues introduced by the fix

## Implementation Strategy

### Technical Approach:
1. Remove `jest.fn()` wrapper from RAF/cAF polyfills - use direct function assignment
2. Change timing from 0ms to 16ms for proper 60fps frame timing
3. Move polyfill setup to both global scope AND beforeEach for persistence
4. Follow TDD approach - write failing test first, then fix

### Key Requirements:
- Polyfills must work with both real and fake timers
- Must not interfere with existing test isolation
- Should fix the 22 failing homepage tests
- Must be compatible with parallel test execution

### Dependencies:
- Jest setup file (jest.setup.js) - lines 186-191 need modification
- No new npm packages needed for basic fix

## Acceptance Criteria

### Functional Requirements:
- [ ] Homepage tests no longer fail with "cancelAnimationFrame is not defined" error
- [ ] RAF/cAF polyfills work correctly with both fake and real timers
- [ ] Polyfills persist through test cleanup cycles

### Quality Requirements:
- [ ] No new test failures introduced by the fix
- [ ] Code changes are minimal and focused (only jest.setup.js)
- [ ] Clear comments explain the polyfill implementation

### Performance Requirements:
- [ ] No noticeable impact on test execution time
- [ ] 16ms timing provides realistic frame simulation without slowing tests

## Project Status Board

### Current Status / Progress Tracking
**Phase**: Planning
**Last Updated**: June 9, 2025 at 12:23 AM
**Branch**: `missing-browser-api-polyfills`

| Task | Status | Notes |
|------|--------|-------|
| Implementation plan creation | ✅ Complete | Plan created with timestamp ID 0609_0023 |
| Requirements analysis | ⏳ Pending | [Add status updates here] |
| Phase 1 preparation | ⏳ Pending | [Add status updates here] |

### Next Steps:
1. Write a test to verify the current polyfill issue
2. Update jest.setup.js lines 186-191 with the fixed implementation
3. Add beforeEach hook to reapply polyfills after cleanup
4. Run homepage tests to verify the fix works

### Executor's Feedback or Assistance Requests
This is a focused fix for an existing implementation issue. The polyfills already exist but need correction. The implementation should be straightforward and low-risk.

---

**Status**: Implementation Plan Created ✅
