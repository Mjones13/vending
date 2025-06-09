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

### AI Agent Commands (Port 3001 + Build Isolation)
**CRITICAL: AI agents (Claude, Claude Code, Kirshir) MUST use these commands to avoid conflicts:**

```bash
cd newsite
npm run dev:ai      # AI development server on port 3001
npm run build:ai    # AI build using separate .next-ai directory
npm run start:ai    # AI production server on port 3001 from .next-ai
npm run test:ai     # AI testing with dev server (fast)
npm run test:ai:full # AI comprehensive testing
npm run clean:ai    # Clean AI build artifacts (.next-ai)
npm run clean:all   # Clean both .next and .next-ai directories
```

**Build Isolation Protocol:**
- **Developer builds**: Use `.next` directory (unchanged workflow)
- **AI agent builds**: Use `.next-ai` directory (completely isolated)
- **No interference**: Both can build simultaneously without corruption
- **NO EXCEPTIONS**: AI agents must NEVER use `npm run dev` or `npm run build` directly

Always run these commands from the `newsite/` directory, not the root.

## AI Agent Development Commands

**CRITICAL: AI agents must use dedicated commands to prevent server conflicts and orphaned processes.**

### Robust Server Management
The project includes a comprehensive AI server management system that ensures reliable server lifecycle control, prevents orphaned processes, and enables concurrent development.

### AI Server Commands

```bash
cd newsite
npm run dev:ai          # Direct Next.js dev server on port 3001 (foreground)
npm run start:ai        # Managed AI server with PID tracking (background)
npm run stop:ai         # Gracefully stop AI server with cleanup
npm run status:ai       # Check AI server status (JSON output)
npm run test:ai         # Run complete server lifecycle test
npm run cleanup:ai      # Emergency cleanup of orphaned processes
```

### Testing Commands
```bash
npm run test:ai:lifecycle  # Comprehensive server lifecycle tests
npm run test:ai:cleanup    # Cleanup procedure validation tests
```

### Server Management Features
- **PID File Tracking**: Server process IDs stored in `.next-ai/server.pid`
- **Port Management**: AI server runs on port 3001, developer uses port 3000
- **Graceful Shutdown**: SIGTERM with fallback to SIGKILL after timeout
- **Health Checking**: Automatic HTTP health checks for server status
- **Orphan Cleanup**: Multiple strategies to find and kill stuck processes

### Best Practices
1. **Always use managed commands**: Prefer `start:ai` over `dev:ai` for background operation
2. **Check status before starting**: Run `status:ai` to verify clean state
3. **Clean shutdown**: Use `stop:ai` rather than killing processes manually
4. **Emergency cleanup**: Use `cleanup:ai` if processes become orphaned

## AI Server Troubleshooting Guide

### Common Issues and Solutions

**1. Port 3001 Already in Use**
```bash
# Error: EADDRINUSE: address already in use :::3001
npm run cleanup:ai      # Automatic cleanup
npm run status:ai       # Verify port is free
npm run start:ai        # Start fresh
```

**2. Server Won't Start**
```bash
# Check for orphaned processes
npm run status:ai       # Check current state
lsof -ti :3001         # Manual port check
npm run cleanup:ai      # Force cleanup
```

**3. Server Not Responding**
- Next.js dev servers can take 10-30 seconds to fully initialize
- The health check may pass before HTTP routes are ready
- Wait a moment after starting before making requests

**4. Orphaned Processes After Crash**
```bash
# The cleanup command handles multiple scenarios:
npm run cleanup:ai
# - Checks PID file and kills that process
# - Searches for processes on port 3001
# - Removes stale PID files
# - Uses SIGTERM then SIGKILL if needed
```

**5. Multiple Start Attempts**
- The server manager detects if a healthy server is already running
- Safe to call `start:ai` multiple times - it won't create duplicates
- Returns success if server is already running and healthy

**6. PID File Issues**
```bash
# Location: .next-ai/server.pid
# If corrupted or wrong PID:
rm -f .next-ai/server.pid
npm run cleanup:ai
npm run start:ai
```

**7. Concurrent Development**
- Developer server: Port 3000 (use standard `npm run dev`)
- AI server: Port 3001 (use `npm run start:ai`)
- Both can run simultaneously without conflicts

### Debug Commands
```bash
# Check what's on AI port
lsof -ti :3001

# Check server process
ps aux | grep "next.*3001" | grep -v grep

# Manual cleanup (if automated cleanup fails)
kill -TERM $(lsof -ti :3001) 2>/dev/null
kill -KILL $(lsof -ti :3001) 2>/dev/null

# Check PID file
cat .next-ai/server.pid 2>/dev/null || echo "No PID file"
```

### Server Lifecycle Logs
All server operations are logged with timestamps:
- `[AI-SERVER] [INFO]` - Normal operations
- `[AI-SERVER] [WARN]` - Warnings (process already dead, etc.)
- `[AI-SERVER] [ERROR]` - Failures (port unavailable, startup timeout)

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
- `docs/implementation-plan/{timestamp-id}-{task-name}.md` - Detailed task breakdowns with status boards
- Branch names match task slugs from implementation plans

### Implementation Plan Naming Convention
Each Implementation Plan must use a timestamp-based ID in the filename, formatted as:

`{timestamp-id}-{task-name}.md`

Where:
- `{timestamp-id}` is in format MMDD_HHMM (Month-Day_Hour-Minute)
- `{task-name}` is the descriptive name of the implementation plan in kebab-case

The Timestamp ID provides:
- **Conflict-free naming**: Naturally unique timestamps eliminate numbering conflicts
- **Chronological ordering**: Files automatically sort by creation time
- **Human readability**: Easy to understand "June 8th at 2:23 PM"
- **Future-proof**: No renumbering ever needed

Examples:
- `0608_1030-layout-navigation-menu-test-fixes.md` (June 8th at 10:30 AM)
- `0608_1423-homepage-rotating-text-fixes.md` (June 8th at 2:23 PM)
- `0609_0915-database-migration-script.md` (June 9th at 9:15 AM)

### Creating New Implementation Plans
Use the automated script to ensure proper formatting:

```bash
npm run create-plan "Task Name Here"
# Creates: MMDD_HHMM-task-name-here.md with template
```

### Referencing Implementation Plans
Reference plans using their timestamp ID:
- In documentation: "See implementation plan 0608_1030 for details"
- In commit messages: "Implementing plan 0608_1423"
- In branch names: Use kebab-case task name without timestamp

## Branch Management Protocol

**CRITICAL SAFETY RULE: Never Delete Branches With Unmerged Changes**
- Before deleting any branch, ALWAYS verify all changes are merged to main
- Use `git log origin/main..branch-name` - must show NO commits
- Use `git diff origin/main..branch-name` - must show NO differences
- If any unique changes exist:
  - STOP immediately and preserve the branch
  - Notify the user: "Branch contains unmerged changes"
  - Show the specific differences:
    - List unmerged commits: `git log --oneline origin/main..branch-name`
    - Show file differences: `git diff --name-status origin/main..branch-name`
    - Explain what changes would be lost if deleted
  - Ask user for explicit confirmation on how to proceed
- Data loss from premature branch deletion is unacceptable

**MANDATORY: Dedicated Branches for Non-Implementation Plan Tasks**
Any task performed outside the scope of an existing implementation plan MUST be performed on a dedicated Git branch:

**When to Create a New Branch:**
- **Small tasks on main**: If currently on main branch and asked to perform any task
- **Ad-hoc requests**: Any work not part of an existing implementation plan
- **Quick fixes**: Bug fixes, documentation updates, or minor changes not in a plan
- **New features**: Any feature work not covered by current implementation plan

**When NOT to Create a New Branch:**
- **Implementation plan work**: When working within the scope of an existing implementation plan
- **Existing task branch**: When already on a dedicated branch for the current work
- **Continuing planned work**: When following tasks outlined in an approved implementation plan

**Branch Workflow for Non-Implementation Plan Tasks:**
1. **Start with fresh state**: `git fetch --all --prune && git checkout main && git pull`
2. **Create task branch**: `git checkout -b descriptive-task-name`
3. **Make initial commit**: Required before setting upstream
4. **Set upstream**: `git push -u origin descriptive-task-name`
5. **Make changes**: Perform all task-related work on this branch
6. **Commit and push regularly**: Follow mandatory commit protocol with immediate push
7. **Pre-merge preparation**:
   - Fetch latest: `git fetch --all --prune`
   - Switch to main: `git checkout main && git pull`
   - Switch back to branch: `git checkout descriptive-task-name`
   - Merge main into branch: `git merge main`
   - Resolve any conflicts if they exist
   - Verify stability: Run tests and ensure everything works
8. **Final push**: `git push` (after merge verification)
9. **Merge to main**: After verification, merge branch back to main
10. **Clean up**: Delete branch after successful merge

**Before Any Work:**
Always verify you're on the correct branch before starting work:
- **Check current branch**: Use `git branch` to verify current location
- **On main + new task**: Create dedicated branch before proceeding
- **In implementation plan**: Continue on existing implementation plan branch
- **Branch verification**: Ensure branch name matches the work being performed

**Benefits of Task-Specific Branch Usage:**
- Prevents direct changes to main branch
- Complete isolation of ad-hoc changes
- Full traceability for all modifications
- Ability to safely experiment and rollback
- Maintains clean main branch history

## Multi-Clone Repository Management

**Environment Awareness**: This repository may be cloned in multiple folders on the same machine. Each clone typically works on separate branches to minimize conflicts.

### Pre-Work Synchronization Protocol (MANDATORY)
Before starting ANY task or implementation plan:
1. **Fetch all remote updates**: `git fetch --all --prune`
2. **Pull current branch**: `git pull` (handle conflicts if they occur)
3. **Verify clean state**: `git status` must show clean working directory
4. **Check branch visibility**: Use `git branch -r` to see all remote branches

### New Branch Discovery Protocol
When switching clones or starting work:
1. **Always fetch first**: `git fetch --all --prune` 
2. **Check for new branches**: `git branch -r` to see remote branches
3. **Checkout new branches**: `git checkout branch-name` (Git will auto-track remote)
4. **Verify branch setup**: `git branch -vv` to confirm upstream tracking

### Branch Creation and Upstream Protocol
When creating new branches:
1. **Create and switch**: `git checkout -b new-branch-name`
2. **Make initial commit**: Required before pushing new branch
3. **Set upstream on first push**: `git push -u origin new-branch-name`
4. **Verify remote visibility**: Check that branch appears in `git branch -r`

## MANDATORY CODING WORKFLOW

**CRITICAL: This process MUST be followed for EVERY coding request without exception.**

### Step 1: Implementation Planning (REQUIRED)
Before writing ANY code:
1. **Fetch and pull latest**: `git fetch --all --prune && git checkout main && git pull`
2. **Create task branch**: `git checkout -b task-name` (where task-name matches implementation plan)
3. **Create implementation plan**: Write a clear, detailed plan in `docs/implementation-plan/{task-name}.md`
4. **Include all required sections**: Background, challenges, task breakdown, acceptance criteria
5. **Get user approval**: Present plan to user before proceeding to implementation

**Important: When creating a new branch for an implementation plan, ALWAYS use `git checkout -b branch-name` to create AND switch to the new branch, not just `git checkout branch-name` which would attempt to switch to an existing branch.**

**Multi-Clone Coordination**: After creating new branch and making first commit, immediately run `git push -u origin branch-name` to make branch visible to other clones.

### Step 2: Sequential Execution (REQUIRED)
During implementation:
1. **Pre-task sync**: Before each task, run `git fetch --all --prune && git pull`
2. **Follow plan step-by-step**: Execute tasks in exact order specified in implementation plan
3. **MANDATORY FILE TRACKING**: As you work, track which files you create or modify for the current task
4. **MANDATORY REAL-TIME UPDATES**: After completing each task, IMMEDIATELY update implementation plan:
   - Mark checkbox as complete: `- [ ]` → `- [x]`
   - Update status board with completion details
   - Document any files created/modified
   - Add completion timestamp and notes
5. **Test each change**: After implementing each task, test the change thoroughly
6. **COMMIT AND PUSH AFTER EACH TASK**: After completing and testing each task:
   - Stage ONLY files created/modified for the current task
   - Make descriptive commit with format: "Complete [Task X.Y]: [brief description]"
   - IMMEDIATELY push commit to remote branch with `git push`
   - Verify push succeeded before proceeding to next task
7. **Verify before proceeding**: Only move to next task after confirming current task works correctly AND is committed AND pushed AND implementation plan is updated
8. **Update progress**: Keep implementation plan progress tracking current in real-time

### Step 2.5: Mandatory Commit Protocol (CRITICAL)
**EVERY task completion MUST include a git commit. NO EXCEPTIONS.**

**Non-Code Changes Exception:**
Documentation-only changes (*.md files, CLAUDE.md, configuration files) can bypass test suite via `--no-verify` flag.

**Commit Requirements:**
1. **After each completed task**: Immediately stage and commit ONLY files created/modified for that task
2. **Task-specific staging**: Use `git add <filename>` for each file related to the current task
3. **Commit message format**: "Complete [Phase X Task Y]: [descriptive summary]"
4. **Verify staged changes**: Use `git status` and `git diff --staged` to confirm only task-related files are staged
5. **MANDATORY PUSH**: IMMEDIATELY push every commit to remote with `git push` - no exceptions
6. **Verify push success**: Confirm push succeeded before proceeding to next task

**Example commit workflow:**
```bash
# Before starting any task - sync with remote
git fetch --all --prune
git pull

# After completing Task 3.1 which created animation test utilities
git status  # Check what files exist

# Stage ONLY files created/modified for this specific task
git add test-utils/animation-testing.ts
git add __tests__/animations/logo-stagger.test.tsx

# Verify staged changes match the task
git diff --staged  # Review changes being committed

git commit -m "Complete Phase 3 Task 1: Create animation testing utilities for CSS keyframes"
git push  # Immediate push to remote

# Verify push succeeded
git log --oneline -1  # Confirm commit is in history
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
- Work through tasks in order, marking each as complete only when fully tested, verified, committed, AND pushed
- COMMIT AND PUSH after each task completion before proceeding to next task
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
**Check git status and sync frequently during implementation:**
1. **Before starting each task**: Run `git fetch --all --prune && git pull && git status` to ensure clean, current working directory
2. **After completing each task**: Run `git status` to see what files were modified
3. **After each commit and push**: Run `git status` to verify clean working directory
4. **Regular sync checks**: Run `git fetch --all --prune` periodically to stay aware of remote changes
5. **If working directory shows many uncommitted files**: STOP and commit pending work before proceeding

### Final Integration and Cleanup
**After all phases complete:**
1. **Sync with remote**: `git fetch --all --prune && git checkout main && git pull`
2. **Merge branch to main**: `git checkout task-branch && git merge main`
3. **Resolve conflicts**: If conflicts exist, follow merge conflict protocol
4. **Final verification**: Ensure all tests pass and build succeeds
5. **Push final state**: `git push` to update remote branch
6. **Switch to main and merge**: `git checkout main && git merge task-branch`
7. **Push main**: `git push` to update remote main
8. **Branch Deletion Safety Protocol** (CRITICAL - Never lose work):
   
   **MANDATORY: Before deleting ANY branch, verify no unmerged changes:**
   ```bash
   # Check for unmerged commits
   git log origin/main..branch-name
   # Check for uncommitted changes  
   git status
   # Check for any differences
   git diff origin/main..branch-name
   ```
   
   **Only proceed with deletion if ALL three commands show NO output**
   
   **If any differences found:**
   - STOP and notify user immediately
   - Show unmerged commits: `git log --oneline origin/main..branch-name`
   - Show changed files: `git diff --name-status origin/main..branch-name`
   - Explain: "This branch contains X commits and Y file changes not in main"
   - Wait for explicit user decision
   
   **Safe deletion process (only if no differences):**
   - If all checks pass: `git branch -d branch-name` (safe delete)
   - Then: `git push origin --delete branch-name`
   - NEVER use force delete (`-D`) without explicit user permission
   - If ANY doubt exists, STOP and ask user for confirmation

#### Output Requirements

**Token Usage Reporting:**
- At the end of every response where tasks have been completed, include total token consumption
- Format: Add a separate line at the bottom showing "Total tokens consumed: [number]"
- This applies to all task completion outputs, not just autonomous execution sessions

## Multi-Clone Best Practices

### Daily Workflow
- **Start of work session**: `git fetch --all --prune` in both clones
- **Before switching clones**: Ensure current clone has clean `git status`
- **After significant work**: Push changes immediately to share with other clone

### Branch Coordination
- **Separate branches per clone**: Minimize overlap on same branches
- **Main branch coordination**: Extra caution when both clones use main
- **Branch naming**: Use descriptive names to avoid confusion across clones

### Troubleshooting
- **Missing branches**: Run `git fetch --all --prune` to refresh remote branch list
- **Outdated state**: Use `git pull` to get latest changes on current branch
- **Uncertain state**: Run `git status` and `git log --oneline -5` to verify current position

## AI Agent Command Requirements

**MANDATORY: All AI agents must use dedicated commands with build isolation to prevent conflicts.**

### Build Isolation System
**CRITICAL**: This project uses separate build directories to prevent corruption between developer and AI workflows.

**Build Directory Assignment:**
- **Developer workflow**: `.next/` directory (unchanged)
- **AI agent workflow**: `.next-ai/` directory (completely isolated)
- **Result**: Zero build conflicts, no corruption, simultaneous operation

### Port and Build Separation Protocol
**For Development Servers:**
- ✅ **Developer**: `npm run dev` (port 3000, uses `.next/`)
- ✅ **AI Agent**: `npm run dev:ai` (port 3001, isolated)
- ❌ **FORBIDDEN**: AI agents using `npm run dev` (causes port conflicts)

**For Production Builds:**
- ✅ **Developer**: `npm run build` (creates `.next/` artifacts)
- ✅ **AI Agent**: `npm run build:ai` (creates `.next-ai/` artifacts)
- ❌ **FORBIDDEN**: AI agents using `npm run build` (causes build corruption)

**For Production Servers:**
- ✅ **Developer**: `npm run start` (port 3000, serves from `.next/`)
- ✅ **AI Agent**: `npm run start:ai` (port 3001, serves from `.next-ai/`)

### Required AI Agent Commands
**Testing and Validation:**
- `npm run test:ai` - Quick AI server validation
- `npm run test:ai:full` - Comprehensive testing with lint + type-check

**Build Management:**
- `npm run clean:ai` - Clean only AI build artifacts
- `npm run clean:all` - Clean both developer and AI artifacts

### Build Isolation Benefits
1. **No corruption**: Eliminates ENOENT errors and build conflicts
2. **Simultaneous operation**: Developer and AI can work in parallel
3. **Independent artifacts**: Separate BUILD_IDs and static assets
4. **Zero interference**: AI builds don't disrupt developer workflow

### Enforcement Rules
- **Zero tolerance**: AI agents must NEVER use developer commands
- **Automatic isolation**: AI commands handle directory separation automatically
- **Error prevention**: Commands designed to prevent accidental conflicts
- **Cleanup integration**: Proper cleanup of isolated artifacts

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

## AI Agent Troubleshooting Guide

### Build Issues

**Common Build Errors and Solutions:**

1. **ENOENT Build Corruption**
   - **Error**: `ENOENT: no such file or directory` during builds
   - **Cause**: AI agent building while developer's dev server is active, corrupting shared `.next` directory
   - **Solution**: Use AI-specific build commands:
     ```bash
     npm run build:ai    # Uses separate .next-ai directory
     npm run start:ai    # Serves from .next-ai on port 3001
     ```

2. **Port Conflicts**
   - **Error**: `EADDRINUSE: address already in use :::3000`
   - **Cause**: AI agent trying to use same port as developer
   - **Solution**: Use AI-specific dev command:
     ```bash
     npm run dev:ai      # Runs on port 3001 instead of 3000
     ```

3. **Config File Detection Warnings**
   - **Warning**: Next.js detects config changes during build
   - **Cause**: AI build script temporarily swaps configuration files
   - **Impact**: Brief dev server restart (normal behavior)
   - **Solution**: This is expected - builds complete successfully

4. **Corrupted Build Directories**
   - **Symptoms**: Missing chunks, build manifest errors, dev server crashes
   - **Diagnosis**: Check for mixed build artifacts:
     ```bash
     ls -la .next*/BUILD_ID     # Should show different build IDs
     cat .next/BUILD_ID         # Developer build ID
     cat .next-ai/BUILD_ID      # AI build ID (if exists)
     ```
   - **Solution**: Clean and rebuild:
     ```bash
     npm run clean:ai           # Remove .next-ai only
     npm run clean:all          # Remove both .next and .next-ai
     npm run build:ai           # Rebuild AI artifacts
     ```

### Port Management

**Verify Port Usage:**
```bash
lsof -i :3000    # Check developer port
lsof -i :3001    # Check AI agent port
```

**Test AI Server Isolation:**
```bash
npm run test:ai  # Automated test for AI server on port 3001
```

### Build Isolation Verification

**Check Build Separation:**
```bash
# Verify separate build directories exist
ls -la .next*
# .next/     <- Developer builds
# .next-ai/  <- AI agent builds

# Compare build IDs (should be different)
diff .next/BUILD_ID .next-ai/BUILD_ID
```

**Cleanup Commands:**
```bash
npm run clean:ai     # Remove AI build artifacts only
npm run clean:all    # Remove all build artifacts
```

### Cleanup Procedures

**When AI Work is Complete:**
1. **Clean AI artifacts**: `npm run clean:ai` to remove `.next-ai` directory
2. **Verify developer build**: Ensure developer's `.next` directory is intact
3. **Test developer server**: Confirm `npm run dev` works normally on port 3000

**Emergency Cleanup (Corrupted Builds):**
1. **Stop all servers**: Kill any running Next.js processes
2. **Full cleanup**: `npm run clean:all` to remove all build artifacts
3. **Rebuild developer**: `npm run build` to recreate developer's `.next`
4. **Restart development**: `npm run dev` to resume normal development

**File System Verification:**
```bash
# Check build directory sizes (AI builds should be ~equal to developer builds)
du -sh .next .next-ai 2>/dev/null || echo "One or both build directories missing"

# Verify no mixed artifacts
find .next* -name "BUILD_ID" -exec echo "File: {}" \; -exec cat {} \; 2>/dev/null
```

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