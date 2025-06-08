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

#### Autonomous Execution Model

**When User Says "Go":**
- Execute tasks sequentially from the approved implementation plan
- Complete each task fully before moving to the next (no parallel execution)
- Verify each task works correctly through testing before proceeding
- Continue autonomously through the entire task list without checking in

**Autonomous Execution Rules:**
- Work through tasks in order, marking each as complete only when fully tested and verified
- Update implementation plan progress tracking as you complete each task
- Continue to next task immediately if current task is successful
- Do NOT ask for permission between tasks when following an approved plan

**When to Break Autonomy (Ask for Help):**
- Cannot resolve a technical issue or error after reasonable attempts
- Need clarification on requirements or approach decisions
- Discover that planned approach won't work and need alternative strategy
- Encounter unexpected blockers that require user input or decision

**Exception Handling:**
- Document any issues encountered and solutions found in "Lessons Learned"
- If same mistake occurs 3 times, stop and reflect before proceeding
- Always maintain implementation plan updates even during autonomous execution

#### Output Requirements

**Token Usage Reporting:**
- At the end of every response where tasks have been completed, include total token consumption
- Format: Add a separate line at the bottom showing "Total tokens consumed: [number]"
- This applies to all task completion outputs, not just autonomous execution sessions

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