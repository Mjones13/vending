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

### Documentation Workflow
This project uses a structured two-role planning approach with Planner and Executor modes:

#### Multi-Agent System Roles

**Planner Role:**
- **Responsibilities:** Perform high-level analysis, break down tasks, define success criteria, evaluate current progress
- **Actions:** Revise implementation plans in `docs/implementation-plan/{task-name}.md`, update scratchpad with insights and lessons learned
- **Discipline:** Always re-read full task breakdown and acceptance criteria before starting. Update implementation plan and scratchpad with every insight, blocker, or lesson learned. Strive for clarity, completeness, and continuous self-review
- **Focus:** Think deeply and document plans for user review before implementation permission. Break tasks into smallest possible units with clear success criteria. Prioritize simplest, most efficient approaches

**Executor Role:**
- **Responsibilities:** Execute specific tasks from implementation plans, write code, run tests, handle implementation details
- **Actions:** Report progress after milestones or blockers. Update "Current Status / Progress Tracking" and "Executor's Feedback or Assistance Requests" sections in implementation plans
- **Discipline:** For every vertical slice: run `git status` before/after commits, run test suite, update implementation plan, pause to review checklists. Never mark subtask complete until all requirements met and documented
- **Workflow:** Work in small vertical slices, commit when tests pass, push early draft PRs, adopt TDD when possible

#### Documentation Structure
- `docs/scratchpad.md` - Main reference file with links to implementation plans and lessons learned
- `docs/implementation-plan/{task-name}.md` - Detailed task breakdowns with status boards
- Branch names match task slugs from implementation plans
- Implementation plans include: Background/Motivation, Key Challenges, High-level Task Breakdown, Project Status Board, Executor Feedback sections

#### Role Transition Guidelines

**When to Use Planner Mode:**
- New feature requests or task assignments
- Need to analyze requirements and create implementation strategy
- Breaking down complex tasks into manageable subtasks
- Defining success criteria and acceptance criteria
- Updating documentation after learning from implementation challenges

**When to Use Executor Mode:**
- Implementation plans are approved and ready for execution
- Writing code, running tests, making commits
- Following specific task breakdowns from implementation plans
- Reporting progress on milestones or encountering blockers
- Updating status boards and progress tracking

**Workflow Cycle:**
1. User requests feature → **Planner** analyzes and creates implementation plan
2. Plan approved → **Executor** implements following task breakdown
3. Milestone reached or blocker encountered → **Executor** reports back
4. Issues or plan changes needed → **Planner** revises strategy
5. Continue until all acceptance criteria met

**Communication Protocol:**
- Roles communicate through implementation plan documents
- Always update relevant sections when switching roles
- Document lessons learned in scratchpad for future reference
- Ask user to clarify which mode to proceed in if not specified

## MANDATORY CODING WORKFLOW

**CRITICAL: This process MUST be followed for EVERY coding request without exception.**

### Step 1: Implementation Planning (REQUIRED)
Before writing ANY code:
1. **Create implementation plan**: Write a clear, detailed plan in `docs/implementation-plan/{task-name}.md`
2. **Include all required sections**: Background, challenges, task breakdown, acceptance criteria
3. **MANDATORY CHECKBOX FORMAT**: All tasks in "High-Level Task Breakdown" MUST use checkboxes
   - Format: `- [ ] **Task X.Y**: Description of task`
   - Example: `- [ ] **Task 1.1**: Create tiered testing strategy`
   - Example: `- [ ] **Task 2.3**: Implement CSS computed style mocking`
4. **Get user approval**: Present plan to user before proceeding to implementation

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

**Universal Commit Rule:**
After completing any task that results in changes to the project—including edits to the CLAUDE.md file itself, edits to any code files, edits to any test files, or changes to any other project files—you must make a commit once the task is complete and the code is verified to be working. The commit must include all files that were changed as part of that task. This applies to every change, including edits to project documentation, configuration files, and the CLAUDE.md file itself. There should never be changes left uncommitted after completing a task. If any part of the task requires confirmation before proceeding (e.g. if the intended behavior is unclear), pause and request confirmation before proceeding to the commit step.

**Non-Code Changes Exception:**
When making changes that do not touch any code—such as edits to the CLAUDE.md file, project documentation files (.md), directory structure files, or configuration files—you are allowed to commit those changes without running the full project test suite. The pre-commit hook is configured to automatically detect documentation/configuration-only changes and skip the test suite while still allowing the commit to proceed. This rule applies to changes that only affect:
- Documentation files (*.md)
- CLAUDE.md file
- Configuration files (non-package.json)
- Directory structure changes
- Non-code project files

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

### Step 3: Documentation (REQUIRED)
After completing work:
1. **Document errors**: Record any errors encountered in `docs/scratchpad.md`
2. **Record fixes**: Document solutions applied for future reference
3. **Capture lessons**: Add lessons learned to prevent similar issues
4. **Update timestamps**: Include dates for all documentation updates

### Mandatory Error Documentation

**CRITICAL: Document all errors and their solutions in scratchpad.md.**

**Error Documentation Requirements:**
1. **When encountering any error**: Immediately add/update entry in scratchpad.md
2. **For repeated errors**: Overwrite existing entry with newest understanding and solution
3. **Goal**: Build knowledge base to prevent future error recurrence

**Scratchpad Entry Format:**
```
## Lessons Learned
- [YYYY-MM-DD HH:MM] Error: [Brief description] - Solution: [How it was fixed]
```

**Example:**
```
- [2025-06-08 14:30] Error: Jest tests fail with "Cannot read property 'getComputedStyle'" - Solution: Add window.getComputedStyle mock in jest.setup.js and use jest-environment-jsdom
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

**Implementation Plan Requirements:**
1. **Checkbox Format**: Every task in High-Level Task Breakdown MUST use checkboxes
   - Format: `- [ ] **Task X.Y**: Description of task`
   - Uncompleted: `- [ ] **Task 1.1**: Create tiered testing strategy`
   - Completed: `- [x] **Task 1.1**: Create tiered testing strategy`

2. **Real-Time Updates**: Update implementation plan IMMEDIATELY after each task completion
   - Mark checkbox as complete [x]
   - Update status board with completion notes
   - Add any lessons learned or issues encountered
   - Update file modification lists with actual changes made

3. **Status Board Maintenance**: Keep status board current throughout execution
   - Update "Current Status / Progress Tracking" after each task
   - Mark phases as complete when all tasks in phase are done
   - Include timestamps and detailed completion notes

4. **Documentation Accuracy**: Implementation plan must reflect reality at all times
   - Never let implementation plan fall behind actual progress
   - Document what was actually built, not what was planned
   - Update file lists with actual files created/modified

**Workflow Enforcement:**
- **After each task completion**: Update implementation plan before proceeding
- **During autonomous execution**: Maintain plan updates without breaking autonomy
- **Before committing**: Verify implementation plan reflects current state
- **Violation consequences**: Failing to update implementation plan is a critical workflow error

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
- **MANDATORY**: Update implementation plan progress tracking IMMEDIATELY after completing each task
- **MANDATORY**: Mark task checkboxes as complete [ ] → [x] in implementation plan after each task
- **MANDATORY**: Update task status board with completion notes in real-time
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

**Naming Conventions for Parallel Safety:**
- Component tests: `__tests__/components/ComponentName.test.tsx` 
- Page tests: `__tests__/pages/pagename.test.tsx`
- Hook tests: `__tests__/hooks/hookName.test.tsx`
- Critical path tests: Include `critical` or `smoke` in test names
- E2E critical tests: Use `@critical` tags in test descriptions

**Test Categories:**
- **Unit Tests**: Components, hooks, utilities (always parallel)
- **Integration Tests**: Page-level component interactions (parallel by default)
- **Animation Tests**: CSS animations and transitions (parallel)
- **Critical Path Tests**: Essential functionality for fast feedback (parallel)
- **E2E Tests**: User journeys (@critical tests run in pre-push, full suite in CI)

### Testing Requirements for All Development

**Unit & Component Tests:**
- Required for all React components
- Required for all utility functions  
- Required for all custom hooks
- Tests must be written BEFORE implementation (TDD)
- Must be parallel-safe with independent setup/teardown
- Minimum 80% code coverage required

**Animation Tests:**
- Required for ALL CSS animations and transitions
- Use animation testing utilities in `test-utils/animation-testing.ts`
- Test animation states, timing, and visual effects
- Verify animations work correctly across different scenarios

**E2E Tests:**
- Required for all user-facing features and workflows
- Test cross-browser compatibility (Chromium, Firefox, Webkit)
- Test responsive design on mobile, tablet, and desktop
- Verify accessibility compliance

**Test Organization:**
```
__tests__/
├── components/       # Component tests
├── pages/           # Page integration tests
├── animations/      # Animation-specific tests
├── utils/          # Utility function tests
└── e2e/            # End-to-end tests
```

### TDD Workflow Integration

1. **Write Failing Tests**: Before implementing any feature, create failing tests that define expected behavior
2. **Use Testing Utilities**: Leverage pre-built testing utilities for common patterns:
   - `test-utils/render.tsx` for component rendering
   - `test-utils/animation-testing.ts` for animation testing
   - `test-utils/e2e-helpers.ts` for E2E workflows
3. **Verify All Tests Pass**: After implementation, ensure all tests pass before proceeding
4. **Test Coverage**: Maintain minimum 80% coverage, verify with `npm run test:coverage`

### Testing Documentation
- See `docs/testing-guide.md` for comprehensive testing patterns and examples
- Follow established testing conventions for consistency
- Add tests to appropriate test category based on functionality being tested

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