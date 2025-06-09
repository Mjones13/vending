# Implementation Plan: Fix KeyframeAnimationTester Stack Overflow

**Branch**: `main`  
**Created**: June 9, 2025 at 05:10 AM  
**ID**: 0609_0510

> ⚠️ **IMPORTANT**: All work for this implementation plan MUST be done on the `main` branch.  
> Before starting any work, ensure you are on the correct branch: `git checkout main`

## Background/Motivation

**Critical Issue**: The `rotating-text-timing.test.tsx` test suite crashes with a stack overflow error, causing the entire test suite to hang and preventing proper testing.

**Affected Files**:
- `test-utils/keyframe-testing.ts` - Contains the circular reference causing infinite recursion
- `__tests__/animations/rotating-text-timing.test.tsx` - Test file that crashes when run
- Any test that uses `simulateKeyframePhases` or `KeyframeAnimationTester.destroy()`

**Current Behavior**: 
- Test suite hangs/crashes with "Maximum call stack size exceeded" 
- Stack trace shows infinite loop: `destroy() → cancel() → notifyPhaseChange() → listener calls destroy() → repeat`

**Root Cause Analysis**:
- **Lines 262-264**: `destroy()` method calls `this.cancel()` 
- **Lines 152-158**: `cancel()` method calls `this.notifyPhaseChange('cancelled')`
- **Lines 209-213**: `notifyPhaseChange()` calls all listeners with `this.getCurrentStep()`
- **Lines 411-417**: In `simulateKeyframePhases()`, a listener is registered that calls `tester.destroy()` on 'cancelled' phase
- **Result**: `destroy() → cancel() → notifyPhaseChange() → listener calls destroy()` = infinite recursion

## Key Challenges

1. **Technical Challenge**: Breaking the circular dependency without changing the public API
   - Must prevent `destroy()` from triggering listeners that call `destroy()` again
   - Need to maintain the cleanup behavior while avoiding infinite recursion
   - Preserve existing test functionality that depends on phase notifications

2. **Testing Challenge**: Verifying the fix works across all usage patterns
   - Multiple tests use `KeyframeAnimationTester` in different ways
   - Must ensure fix doesn't break existing working tests
   - Need to verify stack overflow is completely eliminated

3. **Integration Challenge**: Ensuring no regressions in animation testing utilities
   - Other test files depend on `simulateKeyframePhases` working correctly
   - Must maintain backward compatibility with existing test patterns
   - Verify all animation testing utilities still function as expected

## Atomic Task Breakdown

### Phase 1: Add Destruction Guard to Prevent Infinite Recursion
- [ ] **Task 1.1**: Add destruction guard flag to KeyframeAnimationTester class
  - **File**: `test-utils/keyframe-testing.ts`
  - **Change**: Add private property `private isDestroying: boolean = false;` after line 51 (after phaseListeners property)
  - **Verify**: `grep -n "isDestroying" test-utils/keyframe-testing.ts` shows new property
  
- [ ] **Task 1.2**: Modify destroy() method to use destruction guard
  - **File**: `test-utils/keyframe-testing.ts`
  - **Change**: Replace lines 261-264 destroy() method with guarded version:
    ```typescript
    destroy(): void {
      if (this.isDestroying) {
        return; // Prevent recursive calls
      }
      this.isDestroying = true;
      this.cancel();
      this.phaseListeners = [];
      this.isDestroying = false;
    }
    ```
  - **Verify**: `grep -A 10 "destroy():" test-utils/keyframe-testing.ts` shows guarded implementation
  
- [ ] **Task 1.3**: Verify basic KeyframeAnimationTester functionality still works
  - **File**: Create simple test verification
  - **Change**: Run test command to verify no immediate breaks
  - **Verify**: `npm test -- --testNamePattern="KeyframeAnimationTester" --verbose` runs without stack overflow

### Phase 2: Test the Fix Against Known Failure Cases
- [ ] **Task 2.1**: Test rotating-text-timing.test.tsx specifically
  - **File**: `__tests__/animations/rotating-text-timing.test.tsx`
  - **Change**: No code changes - just test the file
  - **Verify**: `npm test -- __tests__/animations/rotating-text-timing.test.tsx --timeout=10000` completes without hanging

- [ ] **Task 2.2**: Test simulateKeyframePhases utility function
  - **File**: Direct test of utility function
  - **Change**: Create minimal test to verify simulateKeyframePhases works
  - **Verify**: Function returns Promise that resolves without infinite loop

### Phase 3: Verify All Animation Testing Utilities Work
- [ ] **Task 3.1**: Test all files that import from keyframe-testing.ts
  - **File**: Multiple test files that use KeyframeAnimationTester
  - **Change**: No code changes - run tests to verify compatibility
  - **Verify**: `npm test -- --testPathPattern="animations" --verbose` shows all animation tests can run without hanging

### Phase [FINAL]: **MANDATORY COMPREHENSIVE VERIFICATION** 🔍
> **CRITICAL**: This phase validates ALL previous work against original objectives.

- [ ] **Task [FINAL].1**: Verify Phase 1 Objectives Met
  - **Objective**: Add destruction guard to prevent infinite recursion
  - **Verification**: 
    - [ ] Confirm Task 1.1 objective achieved: isDestroying property added to class
    - [ ] Confirm Task 1.2 objective achieved: destroy() method uses guard pattern
    - [ ] Run comprehensive test: `npm test -- --testNamePattern="KeyframeAnimationTester" --verbose`
  - **Expected Result**: KeyframeAnimationTester tests run without stack overflow

- [ ] **Task [FINAL].2**: Verify Phase 2 Objectives Met  
  - **Objective**: Test fix against known failure cases
  - **Verification**:
    - [ ] Confirm Task 2.1 objective achieved: rotating-text-timing.test.tsx runs without hanging
    - [ ] Confirm Task 2.2 objective achieved: simulateKeyframePhases utility works
    - [ ] Run verification: `npm test -- __tests__/animations/rotating-text-timing.test.tsx --timeout=15000`
  - **Expected Result**: Previously hanging test file now completes successfully

- [ ] **Task [FINAL].3**: Verify Phase 3 Objectives Met
  - **Objective**: Verify all animation testing utilities work without regressions  
  - **Verification**:
    - [ ] Confirm Task 3.1 objective achieved: All animation tests can run without hanging
    - [ ] Run verification: `npm test -- --testPathPattern="animations" --verbose`
  - **Expected Result**: All animation tests complete without infinite loops

- [ ] **Task [FINAL].4**: Validate Original Problem Resolution
  - **Original Problem**: Stack overflow causing test suite to hang/crash
  - **Verification**: 
    - [ ] Run original failing scenario: `npm test -- __tests__/animations/rotating-text-timing.test.tsx`
    - [ ] Confirm problem symptoms are gone: No "Maximum call stack size exceeded" errors
    - [ ] Test edge cases: Multiple simultaneous destroy() calls, destroy during phase callbacks
  - **Expected Result**: No stack overflow errors, tests complete normally

- [ ] **Task [FINAL].5**: Integration Testing
  - **Integration Points**: Animation testing utilities, test suite execution, CI pipeline
  - **Verification**:
    - [ ] Full test suite runs without hanging: `npm test` (may have other failures but no infinite loops)
    - [ ] Build succeeds: `npm run build`
    - [ ] Linting passes: `npm run lint`
    - [ ] All animation test files can be run individually without hanging
  - **Expected Result**: Test suite execution is stable, no hanging processes

- [ ] **Task [FINAL].6**: Document Implementation Results
  - **File**: `docs/scratchpad.md`
  - **Change**: Add comprehensive entry documenting:
    - [ ] Original problem: Stack overflow in KeyframeAnimationTester.destroy()
    - [ ] Solution implemented: Added isDestroying guard flag to prevent recursive destruction
    - [ ] Verification results: rotating-text-timing.test.tsx now runs without hanging
    - [ ] Root cause: Circular reference between destroy() → cancel() → notifyPhaseChange() → listener → destroy()
    - [ ] Fix mechanism: Guard flag prevents re-entry into destroy() method during cleanup
  - **Verify**: Entry exists with timestamp and complete technical details

### Verification Failure Protocol:
If any verification step fails:
1. **Analyze the failure** - Determine root cause of verification failure
2. **Document the issue** - Note what failed and why in implementation plan
3. **Choose response**:
   - **Simple fix**: Create additional task to address the issue
   - **Complex issue**: STOP and notify user with:
     - Specific failure details
     - What was attempted
     - Potential solutions identified
     - Request for guidance on how to proceed
4. **Do NOT mark plan complete** until all verifications pass

## Implementation Strategy

### Technical Approach:
**Methodology**: Add a destruction guard flag to prevent recursive calls
- **File modification**: Single file change to `test-utils/keyframe-testing.ts`
- **Testing approach**: Incremental testing after each change, specific test for stack overflow scenario
- **Rollback plan**: Simple - revert the guard flag and destroy() method changes

### Atomic Task Guidelines:
- **One File Rule**: Each task modifies exactly ONE file (or creates ONE new file)
- **Line Specificity**: Include line numbers when modifying existing code
- **Exact Changes**: Specify exact text/code to add, remove, or replace
- **Clear Verification**: Each task has unambiguous completion criteria
- **Sequential Order**: Tasks must be completed in the specified order
- **Final Verification Required**: EVERY plan ends with comprehensive verification phase

### File Organization:
- **Modified files**: `test-utils/keyframe-testing.ts` only
- **Order of modifications**: Add property first, then modify method
- **Dependencies**: No other files depend on the internal implementation details being changed

### Dependencies:
- **External dependencies**: None - this is an internal implementation fix
- **Internal dependencies**: Task 1.1 must complete before Task 1.2 (property before method)
- **Tool requirements**: Standard Jest testing environment already present

## Acceptance Criteria

### Functional Requirements:
- [ ] KeyframeAnimationTester.destroy() method works without infinite recursion
  - **Verify with**: `npm test -- __tests__/animations/rotating-text-timing.test.tsx --timeout=10000`
- [ ] simulateKeyframePhases utility function completes successfully
  - **Verify with**: No hanging when promise resolves in tests using this function
- [ ] All existing animation testing functionality preserved
  - **Verify with**: `npm test -- --testPathPattern="animations" --verbose`

### Quality Requirements:  
- [ ] Code follows existing TypeScript patterns and style
  - **Verify with**: `npm run lint` passes without errors
- [ ] No reduction in test coverage from changes
  - **Verify with**: Changes are internal implementation only
- [ ] Build continues to work
  - **Verify with**: `npm run build` succeeds without warnings

### Final Verification Requirements:
- [ ] **ALL original objectives achieved** (verified in Final Phase)
- [ ] **Original problem completely resolved** (tested and confirmed)  
- [ ] **No regressions introduced** (full integration testing passed)
- [ ] **Implementation documented** (scratchpad.md updated with complete solution)

## Success Metrics

### Immediate Verification:
- [ ] All tasks marked complete with checkboxes
- [ ] All verification commands pass
- [ ] All acceptance criteria met

### Final Verification Success:
- [ ] **MANDATORY**: Final verification phase completed successfully
- [ ] **MANDATORY**: Original problem no longer reproducible
- [ ] **MANDATORY**: All integration points tested and working
- [ ] **MANDATORY**: Solution documented for future reference

## Risk Mitigation

### Potential Issues:
1. **[Specific Risk]**: [Mitigation strategy]
2. **[Another Risk]**: [How to handle if it occurs]

### Rollback Plan:
- [Step-by-step rollback instructions if changes need to be reverted]
- [Commands to restore previous state]

## Notes

### Implementation Notes:
- [Any important considerations during implementation]
- [Debugging tips for common issues]
- [Performance considerations]

### Follow-up Items:
- [Any future improvements or optimizations to consider]
- [Related issues that could be addressed in future plans]

## Project Status Board

### Current Status / Progress Tracking
**Phase**: Planning
**Last Updated**: June 9, 2025 at 05:10 AM
**Branch**: `main`

| Task | Status | Notes |
|------|--------|-------|
| Implementation plan creation | ✅ Complete | Plan created with timestamp ID 0609_0510 |
| Requirements analysis | ⏳ Pending | [Add status updates here] |
| Phase 1 preparation | ⏳ Pending | [Add status updates here] |

### Next Steps:
1. [Next step 1]
2. [Next step 2]
3. [Next step 3]

### Executor's Feedback or Assistance Requests
[Use this section to communicate with the user about progress, blockers, or questions]

---

**Status**: Implementation Plan Created ✅
