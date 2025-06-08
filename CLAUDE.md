# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

The main development server runs in the `newsite/` directory:

```bash
cd newsite
npm run dev    # Start development server with Turbopack
npm run build  # Build for production
npm run start  # Start production server  
npm run lint   # Run ESLint
```

Always run these commands from the `newsite/` directory, not the root.

## Architecture Overview

This is a Next.js Pages Router application for Golden Coast Amenities (formerly Smarter Vending replica). Key architectural patterns:

### Project Structure
- `pages/` - All routes using Pages Router
- `components/` - Reusable React components (Layout.tsx is the main wrapper)
- `public/images/` - Static assets organized by type (logos, hero-backgrounds, products)
- `styles/` - Global CSS and animations
- `docs/` - Documentation and implementation planning

### Layout System
- `components/Layout.tsx` serves as the main wrapper with header/footer
- Golden Coast Amenities SVG logo in header (`/images/logos/Golden Coast Amenities (3).svg`)
- Responsive navigation with dropdown menus
- Fixed header with scroll effects and backdrop blur

### Styling
- Styled JSX components for scoped styling in Layout.tsx
- Global CSS in `styles/globals.css` and `styles/animations.css`
- Responsive design with mobile hamburger menu
- CSS animations for smooth interactions

### Documentation Structure
- `docs/scratchpad.md` - Main reference file with links to implementation plans and lessons learned
- `docs/implementation-plan/{task-name}.md` - Detailed task breakdowns with status boards
- Branch names match task slugs from implementation plans

## Branch Management Protocol

**Before Any Implementation Work:**
Always verify you're on the correct branch before starting work:
- **New session**: Check current branch matches the task you're working on
- **Existing implementation plan**: Verify branch name matches implementation plan filename
- **Branch verification**: Use `git branch` to check current branch
- **Missing branch**: Ask user before creating new branch if one doesn't exist

## MANDATORY CODING WORKFLOW

**CRITICAL: This process MUST be followed for EVERY coding request without exception.**

### Step 1: Implementation Planning (REQUIRED)
Before writing ANY code:
1. **Pull latest main**: `git checkout main && git pull`
2. **Create task branch**: `git checkout -b task-name` (where task-name matches implementation plan)
3. **Create implementation plan**: Write a clear, detailed plan in `docs/implementation-plan/{task-name}.md`
4. **Include all required sections**: Background, challenges, task breakdown, acceptance criteria
5. **Get user approval**: Present plan to user before proceeding to implementation

### Step 2: Sequential Execution (REQUIRED)
During implementation:
1. **Follow plan step-by-step**: Execute tasks in exact order specified in implementation plan
2. **MANDATORY FILE TRACKING**: As you work, track which files you create or modify for the current task
3. **MANDATORY REAL-TIME UPDATES**: After completing each task, IMMEDIATELY update implementation plan:
   - Mark checkbox as complete: `- [ ]` → `- [x]`
   - Update status board with completion details
   - Document any files created/modified
   - Add completion timestamp and notes
4. **Test each change**: After implementing each task, test the change thoroughly
5. **COMMIT AFTER EACH TASK**: After completing and testing each task:
   - Stage ONLY files created/modified for the current task
   - Make descriptive commit with format: "Complete [Task X.Y]: [brief description]"
   - Push commit to remote branch
6. **Verify before proceeding**: Only move to next task after confirming current task works correctly AND is committed AND implementation plan is updated
7. **Update progress**: Keep implementation plan progress tracking current in real-time

### Step 2.5: Mandatory Commit Protocol (CRITICAL)
**EVERY task completion MUST include a git commit. NO EXCEPTIONS.**

**Non-Code Changes Exception:**
Documentation-only changes (*.md files, CLAUDE.md, configuration files) can bypass test suite via `--no-verify` flag.

**Commit Requirements:**
1. **After each completed task**: Immediately stage and commit ONLY files created/modified for that task
2. **Task-specific staging**: Use `git add <filename>` for each file related to the current task
3. **Commit message format**: "Complete [Phase X Task Y]: [descriptive summary]"
4. **Verify staged changes**: Use `git status` and `git diff --staged` to confirm only task-related files are staged
5. **Push regularly**: Push commits to remote at least after every major task or phase

**Example commit workflow:**
```bash
# After completing Task 3.1 which created animation test utilities
git status  # Check what files exist

# Stage ONLY files created/modified for this specific task
git add test-utils/animation-testing.ts
git add __tests__/animations/logo-stagger.test.tsx

# Verify staged changes match the task
git diff --staged  # Review changes being committed

git commit -m "Complete Phase 3 Task 1: Create animation testing utilities for CSS keyframes"
git push
```

**Commit Failures:**
- If you complete multiple tasks without committing, STOP immediately
- Make individual commits for each completed task with appropriate messages
- Update implementation plan to reflect which tasks have been committed
- If untracked files remain after commit, you FAILED to properly track new files - fix immediately

### Step 3: Mandatory Error Documentation (REQUIRED)

**CRITICAL: Document all errors and their solutions in scratchpad.md.**

**Requirements:**
1. **When encountering any error**: Immediately add/update entry in scratchpad.md
2. **For repeated errors**: Overwrite existing entry with newest understanding and solution
3. **Goal**: Build knowledge base to prevent future error recurrence

**Format:**
```
- [YYYY-MM-DD HH:MM] Error: [Brief description] - Solution: [How it was fixed]
```

**Workflow:**
- Update scratchpad IMMEDIATELY when error occurs and is resolved
- Replace previous entries for the same error type with better solutions
- Include specific file paths and technical details for future reference

### Step 4: Test-Driven Development (TDD) Requirements
**CRITICAL: Every implementation task MUST follow TDD workflow:**

1. **Write failing tests first**: Before implementing any feature/change, write automated test(s) that currently fail
2. **Test must validate expected behavior**: Tests should only pass when code behaves correctly according to task requirements
3. **Implement code changes**: After writing failing tests, proceed with implementation
4. **Verify all tests pass**: Before moving to next task, ensure:
   - The specific test written for current task passes
   - All existing tests for the site continue to pass
   - Site behaves properly as expected for the task

5. **Handle test failures**: If any test fails:
   - Diagnose why the test failed
   - Determine correct expected behavior
   - **CRITICAL AMBIGUITY RULE**: If you are trying to fix a failing test and it is unclear whether the test is incorrect or the web UI behavior is incorrect—meaning it is not obvious what the intended or correct behavior should be—you must STOP and ask for confirmation on whether to fix the test or to fix the code itself. Do not proceed with modifying the test or the code in such cases until the intended behavior is clarified.
   - Update either code or test as appropriate to reflect proper behavior
   - Re-run tests to ensure all pass before proceeding

6. **Commit test and implementation separately**:
   - First commit: "Add failing tests for [feature/task]" 
   - Second commit: "Implement [feature/task] to pass tests"
   - This creates clear test-first development history

### Step 5: Implementation Plan Management (MANDATORY)

**CRITICAL: Implementation plans MUST be maintained in real-time during execution.**

**Requirements:**
1. **Checkbox Format**: `- [ ] **Task X.Y**: Description of task`
2. **Real-Time Updates**: Update implementation plan IMMEDIATELY after each task completion
   - Mark checkbox as complete [x]
   - Update status board with completion notes
   - Update file modification lists with actual changes made
3. **Documentation Accuracy**: Implementation plan must reflect reality at all times

**Phase Completion Protocol:**
- **After each phase**: Pull latest main and check for conflicts
- **No conflicts**: Merge autonomously and continue
- **Conflicts exist**: STOP, notify user, document conflicts

**Merge Conflict Documentation:**
Add section to implementation plan when conflicts occur:
```markdown
## Merge Conflict Documentation
**Files with conflicts:**
- file1.tsx: 15 conflict lines
- file2.ts: 3 conflict lines
```

**Enforcement:**
- Update implementation plan before proceeding to next task
- Verify implementation plan reflects current state before committing

### Phase Completion Marking

When all tasks in a phase are complete and verified:
- Add `✅ **COMPLETE**` to the end of the phase header
- Example: `### Phase 1: Configure Jest for optimal M2 parallel execution ✅ **COMPLETE**`
- Only mark complete when all subtasks show [x] and tests pass

### Step 6: No Exceptions Policy
- **Zero tolerance**: This workflow applies to ALL coding requests, no matter how small
- **No shortcuts**: Even simple changes require implementation plans AND tests
- **Consistent execution**: Follow every step regardless of urgency or simplicity

#### Autonomous Execution Model

**When User Says "Go":**
- Execute tasks sequentially from the approved implementation plan
- Complete each task fully before moving to the next (no parallel execution)
- Verify each task works correctly through testing before proceeding
- Continue autonomously through the entire task list without checking in

**Autonomous Execution Rules:**
- Work through tasks in order, marking each as complete only when fully tested, verified, AND committed
- COMMIT after each task completion before proceeding to next task
- Update implementation plan progress tracking IMMEDIATELY after completing each task
- **Pull main after each phase completion** and handle merge conflicts per protocol
- Continue to next task immediately if current task is successful AND committed
- Do NOT ask for permission between tasks when following an approved plan
- EXCEPTION: If you realize you've completed multiple tasks without committing, STOP and ask for guidance

**When to Break Autonomy (Ask for Help):**
- Cannot resolve a technical issue or error after reasonable attempts
- Need clarification on requirements or approach decisions
- Discover that planned approach won't work and need alternative strategy
- Encounter unexpected blockers that require user input or decision

**Exception Handling:**
- Document any issues encountered and solutions found in "Lessons Learned"
- If same mistake occurs 3 times, stop and reflect before proceeding
- Always maintain implementation plan updates even during autonomous execution
- **CRITICAL**: Never complete multiple tasks without updating the implementation plan - this is a mandatory workflow violation

### Git Status Monitoring (REQUIRED)
**Check git status frequently during implementation:**
1. **Before starting each task**: Run `git status` to ensure clean working directory
2. **After completing each task**: Run `git status` to see what files were modified
3. **After each commit**: Run `git status` to verify clean working directory
4. **If working directory shows many uncommitted files**: STOP and commit pending work before proceeding

### Final Integration and Cleanup
**After all phases complete:**
1. **Pull latest main**: `git checkout main && git pull && git checkout task-branch && git merge main`
2. **Resolve conflicts**: If conflicts exist, follow merge conflict protocol
3. **Final verification**: Ensure all tests pass and build succeeds
4. **Push branch**: `git push origin task-branch`
5. **Cleanup**: After branch approval/merge, delete local and remote branches:
   - `git branch -d task-branch`
   - `git push origin --delete task-branch`

#### Output Requirements

**Token Usage Reporting:**
- At the end of every response where tasks have been completed, include total token consumption
- Format: Add a separate line at the bottom showing "Total tokens consumed: [number]"
- This applies to all task completion outputs, not just autonomous execution sessions

## Parallel Testing Architecture

This project uses a sophisticated parallel testing architecture optimized for M2 MacBook performance while maintaining comprehensive code coverage.

### Architecture Overview
- **Tiered Testing Strategy**: Fast pre-commit validation (5-15s) + comprehensive pre-push testing (60-90s)
- **Parallel Jest Execution**: Multiple workers running tests concurrently using 75% of available CPU cores
- **Test Categorization**: Unit, integration, animation, and E2E tests run in parallel when appropriate
- **Smart Resource Management**: Optimized for M2 MacBook thermal and memory constraints

### Testing Commands
```bash
cd newsite
# Fast parallel validation (pre-commit)
npm run test:pre-commit    # Parallel: linting + type-check + critical tests (5-15s)

# Comprehensive parallel testing (pre-push)  
npm run test:pre-push      # Sequential: parallel tests + critical E2E + build (60-90s)

# Individual test categories (run in parallel)
npm run test:unit          # Component and utility tests
npm run test:integration   # Page integration tests  
npm run test:animations    # CSS animation and interaction tests
npm run test:parallel      # All above categories in parallel

# E2E testing
npm run test:e2e:critical  # Essential user journey tests only
npm run test:e2e          # Full end-to-end test suite
npm run test:e2e:ui       # E2E tests with Playwright UI

# Development and debugging
npm run test:watch        # Jest watch mode for development
npm run test:coverage     # Generate coverage reports
npm run test:benchmark    # Performance monitoring with verbose output
npm run test:all          # Complete sequential test suite

# Direct parallel runner access
npm run test:parallel-runner [pre-commit|pre-push]  # Custom parallel test runner
```

### Parallel Testing Structure Requirements

**CRITICAL: All tests must be designed for parallel execution compatibility.**

**Test Design Principles:**
- **Independent Execution**: Each test must run independently in any order without dependencies
- **Isolated Setup/Teardown**: Fresh test data and clean state for every test
- **No Shared State**: Avoid global variables or shared mutable state between tests
- **Resource Safety**: Tests must not conflict over ports, files, or external resources
- **Predictable Naming**: Follow clear naming patterns for automatic test categorization

**Test File Organization:**
```
__tests__/
├── components/          # Unit tests (parallel execution)
├── pages/              # Integration tests (parallel execution)  
├── animations/         # Animation tests (parallel execution)
├── hooks/              # Hook tests (parallel execution)
├── utils/              # Utility tests (parallel execution)
└── e2e/               # End-to-end tests (selective parallel)
```

**Test Categories:**
- **Unit Tests**: Components, hooks, utilities (always parallel)
- **Integration Tests**: Page-level component interactions (parallel by default)
- **Animation Tests**: CSS animations and transitions (parallel)
- **Critical Path Tests**: Essential functionality for fast feedback (parallel)
- **E2E Tests**: User journeys (@critical tests run in pre-push, full suite in CI)

### Testing Requirements for All Development

**Unit & Component Tests:**
- Required for all React components, utility functions, and custom hooks
- Tests must be written BEFORE implementation (TDD)
- Must be parallel-safe with independent setup/teardown
- Minimum 80% code coverage required

**Animation Tests:**
- Required for ALL CSS animations and transitions
- Use animation testing utilities in `test-utils/animation-testing.ts`

**E2E Tests:**
- Required for all user-facing features and workflows
- Test cross-browser compatibility (Chromium, Firefox, Webkit)
- Test responsive design on mobile, tablet, and desktop

### TDD Workflow Integration

1. **Write Failing Tests**: Before implementing any feature, create failing tests that define expected behavior
2. **Use Testing Utilities**: Leverage pre-built testing utilities in `test-utils/`
3. **Verify All Tests Pass**: After implementation, ensure all tests pass before proceeding
4. **Test Coverage**: Maintain minimum 80% coverage, verify with `npm run test:coverage`

## Important Notes

### Logo Implementation
Logo is implemented as Next.js Image component with specific dimensions:
- Desktop: 60x20px with max-height 17px
- Mobile: maintains aspect ratio with max-height 13px
- File: `/images/logos/Golden Coast Amenities (3).svg`

### Build Requirements
- React 19 and Next.js 15.3.2
- TypeScript 5 with strict mode enabled
- Always run lint before commits
- Test builds after content updates to catch ESLint errors

### Content Management
- Exact content sourced from reference sites
- HTML entities used for quotes/apostrophes to avoid ESLint errors
- Break content updates into logical page-by-page chunks

## Lessons Learned Reference
Check `docs/scratchpad.md` for project-specific lessons learned with timestamps.