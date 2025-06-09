# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

⚠️ **WARNING FOR AI AGENTS**: The commands below are for human developers. As an AI agent, skip to the "AI Agent Quick Start" section for your dedicated commands. NEVER use `npm run dev`.

The main development server runs in the `newsite/` directory:

```bash
cd newsite
npm run dev    # Start development server with Turbopack (HUMAN DEVELOPERS ONLY)
npm run build  # Build for production (HUMAN DEVELOPERS ONLY - AI use build:ai)
npm run start  # Start production server (HUMAN DEVELOPERS ONLY)
npm run lint   # Run ESLint (SAFE FOR AI AGENTS)
```

## 1. Project Overview

### What This Is
A Next.js Pages Router application for Golden Coast Amenities (formerly Smarter Vending replica).

### Architecture
- **Framework**: Next.js 15.3.2 with React 19
- **Router**: Pages Router (not App Router)
- **Styling**: Styled JSX + Global CSS
- **Testing**: Jest + Playwright with parallel execution optimized for M2 MacBook (75% CPU cores)
- **TypeScript**: Strict mode enabled

### Key Directories
```
newsite/
├── pages/              # Routes using Pages Router
├── components/         # Reusable React components (Layout.tsx is main wrapper)
├── public/images/      # Static assets organized by type
│   ├── logos/         # Including Golden Coast Amenities SVG
│   ├── hero-backgrounds/
│   └── products/
├── styles/            # Global CSS and animations
├── docs/              # Documentation and implementation plans
│   ├── scratchpad.md  # Main reference with lessons learned
│   └── implementation-plan/  # Timestamp-based plans
├── __tests__/         # Test files organized by type
└── test-utils/        # Testing utilities and helpers
```

## 2. AI Agent Quick Start

### 🤖 Your Essential Commands (USE THESE EXCLUSIVELY)

**Development & Testing:**
```bash
cd newsite
npm run dev:ai         # Your dev server on port 3001 (NOT 3000)
npm run build:ai       # Build to .next-ai directory (NOT .next)
npm run start:ai       # Start managed server on 3001 with PID tracking
npm run stop:ai        # Gracefully stop your server
npm run status:ai      # Check server status (JSON output)
npm run cleanup:ai     # Emergency cleanup of orphaned processes
```

**Testing & Validation:**
```bash
npm run test:ai:pre-push   # Fast parallel tests with --bail flag
npm run push:ai:validated  # Run tests then push if successful
npm run push:ai           # Direct push to origin main (use when tests already passed)
```

### ❌ FORBIDDEN COMMANDS FOR AI AGENTS (NEVER USE)

| Command | Why It's Forbidden | Use Instead |
|---------|-------------------|-------------|
| `npm run dev` | Uses port 3000 (developer's port) - WILL CONFLICT | `npm run dev:ai` |
| `npm start` | Developer's production server - INTERRUPTS USER | `npm run start:ai` |
| `npm run build` | Builds to shared .next directory - CAUSES CORRUPTION | `npm run build:ai` |
| `next dev` | Direct Next.js commands interfere with user's work | `npm run dev:ai` |
| Any command on port 3000 | This is the user's development port | Always use port 3001 |

**Why this matters:**
- Using `npm run dev` will conflict with the user's development server
- It interrupts the user's workflow and causes port conflicts
- Build corruption occurs when both use the same .next directory
- AI agents have dedicated commands specifically designed to avoid these conflicts

### 🔑 Build Isolation Protocol

**CRITICAL - NO EXCEPTIONS:**
- **Developer builds**: Use `.next` directory (unchanged workflow)
- **AI agent builds**: Use `.next-ai` directory (completely isolated)
- **No interference**: Both can build simultaneously without corruption
- **Zero tolerance**: AI agents must NEVER use `npm run dev` or `npm run build` directly

**Build Isolation Benefits:**
1. **No corruption**: Eliminates ENOENT errors and build conflicts
2. **Simultaneous operation**: Developer and AI can work in parallel
3. **Independent artifacts**: Separate BUILD_IDs and static assets
4. **Zero interference**: AI builds don't disrupt developer workflow

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
5. **NEVER use npm run dev**: This will interfere with the user's development server
6. **Always use port 3001**: Your dedicated port is 3001, never use 3000

## 3. Multi-Clone Repository Management

**CRITICAL: This repository may be cloned in multiple folders on the same machine. Each clone typically works on separate branches to minimize conflicts.**

### Pre-Work Synchronization Protocol (MANDATORY)
Before starting ANY task or implementation plan:
```bash
git fetch --all --prune    # Get ALL remote updates
git pull                   # Pull current branch (handle conflicts if they occur)
git status                 # MUST show clean working directory
git branch -r              # Check visibility of all remote branches
```

### New Branch Discovery Protocol
When switching clones or starting work:
1. **Always fetch first**: `git fetch --all --prune` (NEVER skip this)
2. **Check for new branches**: `git branch -r` to see all remote branches
3. **Checkout new branches**: `git checkout branch-name` (Git will auto-track remote)
4. **Verify branch setup**: `git branch -vv` to confirm upstream tracking

### Branch Creation and Upstream Protocol
When creating new branches:
```bash
git checkout -b new-branch-name     # Create AND switch (use -b flag!)
# Make initial commit (REQUIRED before pushing to make visible)
git add README.md
git commit -m "Initial commit on new branch"
git push -u origin new-branch-name  # Set upstream on FIRST push
git branch -r                       # Verify remote visibility
```

**Multi-Clone Coordination**: After creating new branch and initial commit, IMMEDIATELY run `git push -u origin branch-name` to make branch visible to other clones.

## 4. MANDATORY Development Workflow

**CRITICAL: This process MUST be followed for EVERY coding request without exception.**

### Step 1: Implementation Planning (REQUIRED)
Before writing ANY code:
1. **Fetch and sync**: `git fetch --all --prune && git checkout main && git pull`
2. **Create task branch**: `git checkout -b task-name` (ALWAYS use `-b` to CREATE new branch)
3. **Create implementation plan**: `npm run create-plan "Task Name"`
4. **Include all sections**: Background, challenges, task breakdown, acceptance criteria
5. **Get user approval**: Present plan to user before proceeding to implementation

**Important**: Never use `git checkout branch-name` without `-b` when creating new branches - this attempts to switch to existing branch and will fail.

### Step 2: Sequential Execution (REQUIRED)
During implementation:
1. **Pre-task sync**: Before EACH task: `git fetch --all --prune && git pull`
2. **Follow plan step-by-step**: Execute tasks in EXACT order specified
3. **MANDATORY FILE TRACKING**: Track ALL files created/modified for current task
4. **MANDATORY REAL-TIME UPDATES**: After completing each task, IMMEDIATELY:
   - Mark checkbox as complete: `- [ ]` → `- [x]`
   - Update status board with completion details
   - Document any files created/modified
   - Add completion timestamp and notes
5. **Test each change**: After implementing, test thoroughly
6. **COMMIT AND PUSH AFTER EACH TASK**: 
   ```bash
   git add <specific-files-only>
   git commit -m "Complete [Task X.Y]: [descriptive summary]"
   git push  # IMMEDIATELY - NO EXCEPTIONS
   ```
7. **Verify push succeeded**: Confirm before proceeding to next task
8. **Update progress**: Keep implementation plan current in real-time

### Step 3: Mandatory Error Documentation (REQUIRED)

**CRITICAL: Document ALL errors and their solutions in scratchpad.md.**

**Requirements:**
1. **When encountering ANY error**: Immediately add/update entry in scratchpad.md
2. **Format**: `- [YYYY-MM-DD HH:MM] Error: [Brief description] - Solution: [How it was fixed]`
3. **For repeated errors**: Overwrite existing entry with newest understanding and solution
4. **Goal**: Build knowledge base to prevent future error recurrence

**Workflow:**
- Update scratchpad IMMEDIATELY when error occurs and is resolved
- Replace previous entries for the same error type with better solutions
- Include specific file paths and technical details for future reference

### Step 4: Test-Driven Development (TDD) Requirements
**CRITICAL: Every implementation task MUST follow TDD workflow:**

1. **Write failing tests first**: Before implementing any feature/change
2. **Test must validate expected behavior**: Only pass when code correct
3. **Implement code changes**: After writing failing tests
4. **Verify all tests pass**: Before moving to next task:
   - Specific test for current task passes
   - All existing tests continue to pass
   - Site behaves properly as expected
5. **Handle test failures**: If any test fails:
   - Diagnose why the test failed
   - **CRITICAL AMBIGUITY RULE**: If unclear whether test or implementation is wrong, STOP and ask
   - Update either code or test as appropriate
   - Re-run tests to ensure all pass
6. **Commit test and implementation separately**:
   - First commit: "Add failing tests for [feature/task]"
   - Second commit: "Implement [feature/task] to pass tests"
   - This creates clear test-first development history

### Step 5: Implementation Plan Management (MANDATORY)

**CRITICAL: Implementation plans MUST be maintained in real-time during execution.**

**Requirements:**
1. **Checkbox Format**: `- [ ] **Task X.Y**: Description of task`
2. **Real-Time Updates**: Update IMMEDIATELY after each task completion
   - Mark checkbox as complete [x]
   - Update status board with completion notes
   - Update file modification lists with actual changes made
3. **Documentation Accuracy**: Implementation plan must reflect reality at all times

**Phase Completion Protocol:**
- **After each phase**: Pull latest main and check for conflicts
- **No conflicts**: Merge autonomously and continue
- **Conflicts exist**: STOP, notify user, document conflicts

**Merge Conflict Documentation:**
```markdown
## Merge Conflict Documentation
**Files with conflicts:**
- file1.tsx: 15 conflict lines
- file2.ts: 3 conflict lines
```

**Phase Completion Marking:**
When all tasks in a phase are complete and verified:
- Add `✅ **COMPLETE**` to the end of the phase header
- Example: `### Phase 1: Configure Jest for optimal M2 parallel execution ✅ **COMPLETE**`
- Only mark complete when all subtasks show [x] and tests pass

### Autonomous Execution Model

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
- Continue to next task immediately if current task is successful AND committed AND pushed
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

### Step 6: No Exceptions Policy
- **Zero tolerance**: This workflow applies to ALL coding requests, no matter how small
- **No shortcuts**: Even simple changes require implementation plans AND tests
- **Consistent execution**: Follow every step regardless of urgency or simplicity

## 5. Branch Management Protocol

**MANDATORY: Dedicated Branches for Non-Implementation Plan Tasks**
Any task performed outside the scope of an existing implementation plan MUST be performed on a dedicated Git branch.

### When to Create a New Branch
- **Small tasks on main**: If currently on main branch and asked to perform any task
- **Ad-hoc requests**: Any work not part of an existing implementation plan
- **Quick fixes**: Bug fixes, documentation updates, or minor changes not in a plan
- **New features**: Any feature work not covered by current implementation plan

### When NOT to Create a New Branch
- **Implementation plan work**: When working within scope of existing implementation plan
- **Existing task branch**: When already on a dedicated branch for current work
- **Continuing planned work**: When following tasks outlined in approved implementation plan

### Branch Workflow for Non-Implementation Plan Tasks
1. **Start with fresh state**: `git fetch --all --prune && git checkout main && git pull`
2. **Create task branch**: `git checkout -b descriptive-task-name`
3. **Make initial commit**: Required before setting upstream
4. **Set upstream**: `git push -u origin descriptive-task-name`
5. **Make changes**: Perform all task-related work on this branch
6. **Commit and push regularly**: Follow mandatory commit protocol with immediate push
7. **Pre-merge preparation**:
   ```bash
   git fetch --all --prune
   git checkout main && git pull
   git checkout descriptive-task-name
   git merge main  # Merge main into your branch
   # Resolve any conflicts if they exist
   # Run tests and ensure everything works
   ```
8. **Final push**: `git push` (after merge verification)
9. **Merge to main**: After verification, merge branch back to main
10. **Clean up**: Delete branch after successful merge

### Branch Deletion Safety Protocol (CRITICAL - Never lose work)

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

## 6. Git Status Monitoring (REQUIRED)

**Check git status and sync frequently during implementation:**

1. **Before starting each task**: 
   ```bash
   git fetch --all --prune && git pull && git status
   ```
   Must show clean, current working directory

2. **After completing each task**: 
   ```bash
   git status  # See what files were modified
   ```

3. **After each commit and push**: 
   ```bash
   git status  # Verify clean working directory
   ```

4. **Regular sync checks**: 
   ```bash
   git fetch --all --prune  # Stay aware of remote changes
   ```

5. **If working directory shows many uncommitted files**: STOP and commit pending work before proceeding

## 7. AI Agent Push Workflow

**CRITICAL: AI agents must use specific commands and timeouts to avoid push failures**

### Available Commands
```bash
npm run test:ai:pre-push    # Fast parallel tests with --bail (stops on first failure)
npm run push:ai:validated   # Runs tests then pushes if successful
npm run push:ai            # Direct git push to origin main (use when tests already passed)
```

### Required Timeout Configuration
AI agents MUST specify appropriate timeouts when using the Bash tool:

```xml
<!-- Running tests (3 minute timeout) -->
<invoke name="Bash">
<parameter name="command">npm run test:ai:pre-push</parameter>
<parameter name="timeout">180000</parameter>
</invoke>

<!-- Pushing changes (4 minute timeout) -->
<invoke name="Bash">
<parameter name="command">npm run push:ai</parameter>
<parameter name="timeout">240000</parameter>
</invoke>

<!-- Combined test and push (4 minute timeout) -->
<invoke name="Bash">
<parameter name="command">npm run push:ai:validated</parameter>
<parameter name="timeout">240000</parameter>
</invoke>
```

### Recommended Push Process
1. **Option A - Separate commands (more control):**
   ```bash
   npm run test:ai:pre-push  # Run tests first (3 min timeout)
   # If tests pass:
   npm run push:ai          # Push changes (4 min timeout)
   ```

2. **Option B - Combined command (simpler):**
   ```bash
   npm run push:ai:validated  # Test and push (4 min timeout)
   ```

### When to Use Each Command
- **test:ai:pre-push**: When you want to verify code before pushing
- **push:ai:validated**: When you want automatic test+push workflow
- **push:ai**: When tests have already passed and you just need to push to origin main

### Troubleshooting Push Issues

**1. Tests timing out:**
- The `--bail` flag ensures tests fail fast on first error
- If tests still timeout, investigate hanging tests
- Consider running individual test suites

**2. Push rejected (remote has new commits):**
```bash
git pull origin main       # Pull latest changes
npm run test:ai:pre-push   # Re-run tests after merge
npm run push:ai           # Push merged changes
```

**3. Pre-push hook failures:**
- AI test commands run a subset of tests for speed
- If pre-push hook still fails, fix the specific failing tests
- Never use --no-verify unless explicitly instructed

## 8. Command Reference

### AI Agent Development Commands
```bash
npm run dev:ai          # Dev server on port 3001 (foreground)
npm run start:ai        # Managed server with PID tracking (background)
npm run stop:ai         # Graceful shutdown (SIGTERM then SIGKILL)
npm run status:ai       # JSON status output with PID and port info
npm run cleanup:ai      # Emergency cleanup - kills orphaned processes
```

### AI Agent Building Commands
```bash
npm run build:ai        # Build to .next-ai directory (isolated)
npm run start:ai:prod   # Serve production build from .next-ai
npm run clean:ai        # Remove .next-ai directory only
npm run clean:all       # Remove both .next and .next-ai directories
```

### AI Agent Testing Commands
```bash
npm run test:ai                # Quick AI server validation
npm run test:ai:full          # Comprehensive testing with lint + type-check
npm run test:ai:pre-push      # Fast parallel tests with --bail flag
npm run test:ai:lifecycle     # Server lifecycle tests
npm run test:ai:cleanup       # Cleanup procedure validation
```

### Safe Shared Commands
```bash
npm run lint           # ESLint check (safe for all)
npm run type-check     # TypeScript validation (safe for all)
npm test               # Run test suite (safe for all)
```

### Enforcement Rules
- **Zero tolerance**: AI agents must NEVER use developer commands
- **Automatic isolation**: AI commands handle directory separation automatically
- **Error prevention**: Commands designed to prevent accidental conflicts
- **Cleanup integration**: Proper cleanup of isolated artifacts

## 9. Troubleshooting Guide

### Server Issues

**Port 3001 Already in Use:**
```bash
# Error: EADDRINUSE: address already in use :::3001
npm run cleanup:ai      # Automatic cleanup with multiple strategies
npm run status:ai       # Verify port is free
npm run start:ai        # Start fresh
```

**Server Won't Start:**
```bash
# Check for orphaned processes
npm run status:ai       # Check current state (JSON output)
lsof -ti :3001         # Manual port check
ps aux | grep "next.*3001" | grep -v grep  # Check processes
npm run cleanup:ai      # Force cleanup (SIGTERM then SIGKILL)
```

**Orphaned Processes After Crash:**
```bash
# The cleanup command handles multiple scenarios:
npm run cleanup:ai
# - Checks PID file and kills that process
# - Searches for processes on port 3001
# - Removes stale PID files
# - Uses SIGTERM then SIGKILL if needed

# Manual PID file handling if needed:
cat .next-ai/server.pid 2>/dev/null || echo "No PID file"
rm -f .next-ai/server.pid
```

**Multiple Start Attempts:**
- The server manager detects if healthy server already running
- Safe to call `start:ai` multiple times - won't create duplicates
- Returns success if server already running and healthy

**Server Not Responding:**
- Next.js dev servers can take 10-30 seconds to fully initialize
- Health check may pass before HTTP routes are ready
- Wait a moment after starting before making requests

### Build Issues

**ENOENT Errors (no such file or directory):**
- **Cause**: AI agent building while developer's dev server is active, corrupting shared `.next` directory
- **Solution**: Use AI-specific build commands:
  ```bash
  npm run build:ai    # Uses separate .next-ai directory
  npm run start:ai    # Serves from .next-ai on port 3001
  ```

**Build Corruption (missing chunks, manifest errors):**
```bash
# Check for mixed build artifacts:
ls -la .next*/BUILD_ID     # Should show different build IDs
cat .next/BUILD_ID         # Developer build ID
cat .next-ai/BUILD_ID      # AI build ID (should differ)

# Clean and rebuild:
npm run clean:ai           # Remove .next-ai only
npm run clean:all          # Remove both .next and .next-ai
npm run build:ai           # Rebuild AI artifacts
```

**Config File Detection Warnings:**
- Next.js detects config changes during AI builds
- Brief dev server restart is NORMAL and expected
- Builds complete successfully despite warnings

### Debug Commands
```bash
# Port checks
lsof -i :3000    # Check developer port
lsof -i :3001    # Check AI agent port

# Process checks
ps aux | grep "next.*3001" | grep -v grep

# Manual cleanup (if automated cleanup fails)
kill -TERM $(lsof -ti :3001) 2>/dev/null
kill -KILL $(lsof -ti :3001) 2>/dev/null

# Check PID file
cat .next-ai/server.pid 2>/dev/null || echo "No PID file"

# File system verification
du -sh .next .next-ai 2>/dev/null
find .next* -name "BUILD_ID" -exec echo "File: {}" \; -exec cat {} \; 2>/dev/null
```

### Server Lifecycle Logs
All server operations are logged with timestamps:
- `[AI-SERVER] [INFO]` - Normal operations
- `[AI-SERVER] [WARN]` - Warnings (process already dead, etc.)
- `[AI-SERVER] [ERROR]` - Failures (port unavailable, startup timeout)

### Emergency Cleanup Procedures

**When AI Work is Complete:**
1. **Clean AI artifacts**: `npm run clean:ai` to remove `.next-ai` directory
2. **Verify developer build**: Ensure developer's `.next` directory is intact
3. **Test developer server**: Confirm `npm run dev` works normally on port 3000

**Emergency Cleanup (Corrupted Builds):**
1. **Stop all servers**: Kill any running Next.js processes
2. **Full cleanup**: `npm run clean:all` to remove all build artifacts
3. **Rebuild developer**: `npm run build` to recreate developer's `.next`
4. **Restart development**: `npm run dev` to resume normal development

## 10. Implementation Plan Management

### Naming Convention
Format: `MMDD_HHMM-task-name.md` where:
- `MMDD_HHMM`: Timestamp (Month-Day_Hour-Minute)
- `task-name`: Descriptive name in kebab-case

**Timestamp Benefits:**
- **Conflict-free naming**: Naturally unique timestamps eliminate numbering conflicts
- **Chronological ordering**: Files automatically sort by creation time
- **Human readability**: Easy to understand "June 8th at 2:23 PM"
- **Future-proof**: No renumbering ever needed

**Enhancement for high-frequency creation:**
- Consider `MMDD_HHMMSS` format if creating multiple per minute
- Or add sequence number for programmatic creation

### Creating New Implementation Plans

**CRITICAL: Branch Management Before Creating Plans**
1. **ALWAYS switch to the appropriate branch BEFORE creating an implementation plan**
2. **The branch name should match the task-name portion of the implementation plan**
3. **All work specified in an implementation plan MUST be done on the branch specified in that plan**

Steps to create a new implementation plan:
```bash
# 1. First, create and switch to the appropriate branch
git checkout -b task-name-here

# 2. Then create the implementation plan (which will include current branch info)
npm run create-plan "Task Name Here"
# Creates: MMDD_HHMM-task-name-here.md with template and branch info

# 3. All subsequent work MUST be done on this branch
```

**Important**: The implementation plan will capture and display the current branch name. Never work on a different branch than what's specified in the implementation plan.

### Executing Implementation Plans

**MANDATORY: Work on the Correct Branch**
When executing any implementation plan:
1. **Check the branch specified in the implementation plan header**
2. **Switch to that branch before starting any work**: `git checkout branch-name`
3. **Verify you're on the correct branch**: `git branch --show-current`
4. **Never execute implementation plan tasks on a different branch**

If the implementation plan's branch doesn't exist:
- This likely means the plan was created incorrectly
- Create the branch and notify that the plan should have been created after switching branches

### Referencing Implementation Plans
- In documentation: "See implementation plan 0608_1030 for details"
- In commit messages: "Implementing plan 0608_1423"
- In branch names: Use kebab-case task name without timestamp

## 11. Testing Requirements

### Parallel Testing Architecture
- **Tiered Testing Strategy**: Fast pre-commit validation (5-15s) + comprehensive pre-push testing (60-90s)
- **Parallel Jest Execution**: Multiple workers running tests concurrently using 75% of available CPU cores
- **Test Categorization**: Unit, integration, animation, and E2E tests run in parallel when appropriate
- **Smart Resource Management**: Optimized for M2 MacBook thermal and memory constraints

### Test Design Principles
**CRITICAL: All tests must be designed for parallel execution compatibility.**

- **Independent Execution**: Each test must run independently in any order without dependencies
- **Isolated Setup/Teardown**: Fresh test data and clean state for every test
- **No Shared State**: Avoid global variables or shared mutable state between tests
- **Resource Safety**: Tests must not conflict over ports, files, or external resources
- **Predictable Naming**: Follow clear naming patterns for automatic test categorization

### Test File Organization
```
__tests__/
├── components/          # Unit tests (parallel execution)
├── pages/              # Integration tests (parallel execution)  
├── animations/         # Animation tests (parallel execution)
├── hooks/              # Hook tests (parallel execution)
├── utils/              # Utility tests (parallel execution)
└── e2e/               # End-to-end tests (selective parallel)
```

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

## 12. Final Integration and Cleanup

**After all phases complete:**

1. **Sync with remote**: `git fetch --all --prune && git checkout main && git pull`
2. **Merge branch to main**: `git checkout task-branch && git merge main`
3. **Resolve conflicts**: If conflicts exist, follow merge conflict protocol
4. **Final verification**: Ensure all tests pass and build succeeds
5. **Push final state**: `git push` to update remote branch
6. **Switch to main and merge**: `git checkout main && git merge task-branch`
7. **Push main**: `git push` to update remote main
8. **Branch Deletion**: Follow safety protocol in section 5.3

## 13. Critical Requirements Summary

### Token Usage Reporting
At the end of every response where tasks have been completed, include total token consumption:
```
Total tokens consumed: [number]
```

### Before Any Work
Always verify you're on the correct branch before starting work:
- **Check current branch**: Use `git branch` to verify current location
- **On main + new task**: Create dedicated branch before proceeding
- **In implementation plan**: Continue on existing implementation plan branch
- **Branch verification**: Ensure branch name matches the work being performed

### Multi-Clone Best Practices
- **Start of work session**: `git fetch --all --prune` in both clones
- **Before switching clones**: Ensure current clone has clean `git status`
- **After significant work**: Push changes immediately to share with other clone
- **Separate branches per clone**: Minimize overlap on same branches
- **Branch naming**: Use descriptive names to avoid confusion across clones

## 14. Quick Reference

### AI Agent Checklist
- [ ] Using port 3001? (NOT 3000)
- [ ] Using .next-ai? (NOT .next)
- [ ] Using AI-specific commands? (dev:ai, build:ai, NOT dev/build)
- [ ] Added timeouts for push operations? (3-4 minutes)
- [ ] On correct branch for implementation plan?
- [ ] Synced with remote before starting? (git fetch --all --prune)
- [ ] Pushing IMMEDIATELY after EVERY commit?
- [ ] Updating implementation plan in real-time?
- [ ] Following TDD with separate test/implementation commits?

### Emergency Commands
```bash
npm run cleanup:ai          # Kill all AI processes on port 3001
npm run clean:all          # Remove ALL build artifacts
git fetch --all --prune    # Full remote sync
git status                 # Verify clean state
lsof -ti :3001            # Check what's using AI port
```

### Forbidden Actions Reminder
- NEVER use `npm run dev` (user's port 3000)
- NEVER use `npm run build` (shared .next directory)
- NEVER skip immediate push after commits
- NEVER work on wrong branch for implementation plan
- NEVER delete branches without triple verification
- NEVER use --no-verify unless explicitly instructed

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
- HTML entities used for quotes/apostrophes to avoid ESLint errors (&apos;, &ldquo;, &rdquo;)
- Break content updates into logical page-by-page chunks

### Migration Script Best Practices

When creating scripts that modify multiple files (like migration scripts):

**Testing Requirements:**
1. **Dry-run mode**: Always implement and test dry-run functionality first
2. **Execution mode**: Test actual execution separately from dry-run
3. **Verification**: Add post-migration verification that reads files to confirm changes
4. **Error handling**: Document all errors immediately with exact messages and resolutions

**Common Pitfalls:**
- **Bug Example**: Passing `dryRun = true` during actual execution (see migrate-to-timestamp-ids.js line 842)
- **Solution**: Always verify file contents after migration, not just console output
- **Prevention**: Code review for any script that modifies multiple files

## Lessons Learned Reference
Check `docs/scratchpad.md` for project-specific lessons learned with timestamps.