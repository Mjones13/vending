#!/usr/bin/env node

/**
 * Create new implementation plan with timestamp-based ID
 * Format: MMDD_HHMM-task-name.md
 * 
 * IMPORTANT: You must be on the correct git branch before creating the plan!
 * The plan will capture the current branch and all work must be done on that branch.
 * 
 * Usage:
 *   npm run create-plan "Task Name Here"
 *   npm run create-plan "Fix Homepage Layout Issues"
 *   node scripts/create-plan.js "Database Migration Script"
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const IMPLEMENTATION_PLAN_DIR = path.join(__dirname, '..', 'docs', 'implementation-plan');

// Get current git branch
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error('❌ Error: Unable to get current git branch');
    console.error('Make sure you are in a git repository');
    process.exit(1);
  }
}

// Get task name from command line arguments
const args = process.argv.slice(2);
const taskName = args.join(' ');

if (!taskName || taskName.trim().length === 0) {
  console.error('❌ Error: Please provide a task name');
  console.log('Usage: npm run create-plan "Task Name Here"');
  console.log('Example: npm run create-plan "Fix Homepage Layout Issues"');
  process.exit(1);
}

// Generate timestamp ID in MMDD_HHMM format
function generateTimestampId() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  
  return `${month}${day}_${hour}${minute}`;
}

// Convert task name to kebab-case
function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
}

// Generate implementation plan template
function generatePlanTemplate(taskName, timestampId, branchName) {
  const readableDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `# Implementation Plan: ${taskName}

**Branch**: \`${branchName}\`  
**Created**: ${readableDate}  
**ID**: ${timestampId}

> ⚠️ **IMPORTANT**: All work for this implementation plan MUST be done on the \`${branchName}\` branch.  
> Before starting any work, ensure you are on the correct branch: \`git checkout ${branchName}\`

## Background/Motivation

[Describe the specific problem this plan addresses. Include file references where applicable:]
- [Which files are affected and why]
- [Current behavior vs desired behavior]
- [Root cause analysis with specific evidence]

## Key Challenges

1. **Technical Challenge**: [Specific implementation difficulty with affected files/functions]
2. **Testing Challenge**: [Specific testing/verification obstacles] 
3. **Integration Challenge**: [Dependencies or compatibility issues]

## Atomic Task Breakdown

### Phase 1: [Specific Phase Name - e.g., "Fix RAF Polyfills in jest.setup.js"]
- [ ] **Task 1.1**: [ATOMIC action on SPECIFIC file/line]
  - **File**: \`path/to/specific/file.ext\`
  - **Change**: [Exact modification - be specific about what to add/remove/replace]
  - **Verify**: [Specific command: \`npm test __tests__/file.test.js\`, \`grep -n "text" file.js\`, etc.]
  
- [ ] **Task 1.2**: [Next atomic action with specific file reference]  
  - **File**: \`path/to/file.ext\`
  - **Change**: [Precise modification with line numbers if editing existing code]
  - **Verify**: [Specific test or command that confirms this change works]
  
- [ ] **Task 1.3**: [Third atomic action - e.g., testing/verification focused]
  - **File**: \`path/to/test/file.test.tsx\` (or verification command)
  - **Change**: [Create test case or run verification command]
  - **Verify**: [Expected test output or verification result]

### Phase 2: [Next Specific Phase Name - e.g., "Update Test Files to Use New Polyfills"]
- [ ] **Task 2.1**: [File-specific atomic action]
  - **File**: \`path/to/file.ext\`
  - **Change**: [Exact modification with context]
  - **Verify**: [How to confirm this specific change worked]

- [ ] **Task 2.2**: [Another atomic action]
  - **File**: \`path/to/another/file.ext\`
  - **Change**: [Specific code/text to modify]
  - **Verify**: [Verification method]

### Phase 3: [Implementation Phase Name]
- [ ] **Task 3.1**: [Implementation task]
  - **File**: \`path/to/file.ext\`
  - **Change**: [Specific modification]
  - **Verify**: [Verification method]

### Phase [FINAL]: **MANDATORY COMPREHENSIVE VERIFICATION** 🔍
> **CRITICAL**: This phase validates ALL previous work against original objectives.

- [ ] **Task [FINAL].1**: Verify Phase 1 Objectives Met
  - **Objective**: [Restate Phase 1 main goal]
  - **Verification**: 
    - [ ] Confirm Task 1.1 objective achieved: [Original Task 1.1 goal]
    - [ ] Confirm Task 1.2 objective achieved: [Original Task 1.2 goal]
    - [ ] Run comprehensive test: \`[command to verify Phase 1 goals]\`
  - **Expected Result**: [Specific outcome that proves Phase 1 success]

- [ ] **Task [FINAL].2**: Verify Phase 2 Objectives Met  
  - **Objective**: [Restate Phase 2 main goal]
  - **Verification**:
    - [ ] Confirm Task 2.1 objective achieved: [Original Task 2.1 goal]
    - [ ] Run verification: \`[command to verify Phase 2 goals]\`
  - **Expected Result**: [Specific outcome that proves Phase 2 success]

- [ ] **Task [FINAL].3**: Verify Phase 3 Objectives Met
  - **Objective**: [Restate Phase 3 main goal]  
  - **Verification**:
    - [ ] Confirm Task 3.1 objective achieved: [Original Task 3.1 goal]
    - [ ] Run verification: \`[command to verify Phase 3 goals]\`
  - **Expected Result**: [Specific outcome that proves Phase 3 success]

- [ ] **Task [FINAL].4**: Validate Original Problem Resolution
  - **Original Problem**: [Restate the problem from Background/Motivation]
  - **Verification**: 
    - [ ] Run original failing scenario: \`[command that was failing before]\`
    - [ ] Confirm problem symptoms are gone: [List specific symptoms to check]
    - [ ] Test edge cases: [Any edge cases mentioned in Key Challenges]
  - **Expected Result**: [Original problem should be completely resolved]

- [ ] **Task [FINAL].5**: Integration Testing
  - **Integration Points**: [List systems/components that interact with changes]
  - **Verification**:
    - [ ] Full test suite passes: \`npm test\`
    - [ ] Build succeeds: \`npm run build\`
    - [ ] Linting passes: \`npm run lint\`
    - [ ] [Any additional integration commands]
  - **Expected Result**: All systems work together without issues

- [ ] **Task [FINAL].6**: Document Implementation Results
  - **File**: \`docs/scratchpad.md\`
  - **Change**: Add comprehensive entry documenting:
    - [ ] Original problem and root cause
    - [ ] Solution implemented (with file references)
    - [ ] Verification results (all commands that now pass)
    - [ ] Any deviations from original plan
    - [ ] Lessons learned for future similar issues
  - **Verify**: Entry exists with timestamp and complete information

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
[Describe the specific methodology:]
- [How files will be modified in sequence]
- [Testing approach for each change]
- [Rollback plan if issues arise]

### Atomic Task Guidelines:
- **One File Rule**: Each task modifies exactly ONE file (or creates ONE new file)
- **Line Specificity**: Include line numbers when modifying existing code
- **Exact Changes**: Specify exact text/code to add, remove, or replace
- **Clear Verification**: Each task has unambiguous completion criteria
- **Sequential Order**: Tasks must be completed in the specified order
- **Final Verification Required**: EVERY plan ends with comprehensive verification phase

### File Organization:
- [List all files that will be created/modified]
- [Specify the order of file modifications]
- [Note any file dependencies or prerequisites]

### Dependencies:
- [Specific external dependencies with version numbers]
- [Internal file dependencies (Task X.Y must complete before Task Z.A)]
- [Tool requirements: Node version, package versions, etc.]

## Acceptance Criteria

### Functional Requirements:
- [ ] [Specific functionality working - include test command to verify]
  - **Verify with**: \`npm test specific-test-name\`
- [ ] [Specific behavior achieved - include verification steps]
  - **Verify with**: [Exact command or manual check]
- [ ] [Integration requirement met]
  - **Verify with**: [Specific verification method]

### Quality Requirements:  
- [ ] [Code quality standard - linting, formatting]
  - **Verify with**: \`npm run lint\` passes without errors
- [ ] [Test coverage requirement]
  - **Verify with**: \`npm run test:coverage\` shows expected coverage
- [ ] [Build requirement]
  - **Verify with**: \`npm run build\` succeeds without warnings

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
**Last Updated**: ${readableDate}
**Branch**: \`${branchName}\`

| Task | Status | Notes |
|------|--------|-------|
| Implementation plan creation | ✅ Complete | Plan created with timestamp ID ${timestampId} |
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
`;
}

async function createImplementationPlan() {
  try {
    // Get current branch FIRST
    const currentBranch = getCurrentBranch();
    
    // Warn if on main branch
    if (currentBranch === 'main' || currentBranch === 'master') {
      console.warn('⚠️  WARNING: You are on the main branch!');
      console.warn('⚠️  You should create a dedicated branch for this implementation plan.');
      console.warn('⚠️  Example: git checkout -b fix-rotating-text-animation');
      console.warn('');
      console.warn('Do you want to continue anyway? The plan will specify work must be done on main.');
      console.warn('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
      
      // Give user time to cancel
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Ensure the implementation plan directory exists
    await fs.mkdir(IMPLEMENTATION_PLAN_DIR, { recursive: true });

    // Generate timestamp ID and filename
    const timestampId = generateTimestampId();
    const kebabCaseTaskName = toKebabCase(taskName);
    const filename = `${timestampId}-${kebabCaseTaskName}.md`;
    const filePath = path.join(IMPLEMENTATION_PLAN_DIR, filename);

    // Check if file already exists (very unlikely with timestamp)
    try {
      await fs.access(filePath);
      console.error(`❌ Error: File ${filename} already exists`);
      console.log('This is extremely unlikely. Please try again in a minute.');
      process.exit(1);
    } catch {
      // File doesn't exist, which is what we want
    }

    // Generate the plan content
    const planContent = generatePlanTemplate(taskName, timestampId, currentBranch);

    // Write the file
    await fs.writeFile(filePath, planContent, 'utf8');

    // Success message
    console.log('✅ Implementation plan created successfully!');
    console.log('');
    console.log(`📄 File: ${filename}`);
    console.log(`📁 Path: ${filePath}`);
    console.log(`🕐 ID: ${timestampId}`);
    console.log(`📝 Title: ${taskName}`);
    console.log(`🌿 Branch: ${currentBranch}`);
    console.log('');
    
    if (currentBranch === 'main' || currentBranch === 'master') {
      console.log('⚠️  IMPORTANT: You created this plan on the main branch!');
      console.log('⚠️  It is STRONGLY recommended to create a dedicated branch:');
      console.log(`⚠️  git checkout -b ${kebabCaseTaskName}`);
      console.log('');
    } else if (currentBranch !== kebabCaseTaskName) {
      console.log('📌 Branch Note: The current branch name doesn\'t match the task name.');
      console.log(`   Current branch: ${currentBranch}`);
      console.log(`   Expected branch: ${kebabCaseTaskName}`);
      console.log('   This is OK, but make sure to work on the correct branch.');
      console.log('');
    }
    
    console.log('🚀 Next steps:');
    console.log('   1. Open the file and fill in the plan details');
    console.log(`   2. Ensure you are on branch: ${currentBranch}`);
    console.log('   3. Start implementing following the CLAUDE.md workflow');
    console.log('   4. All work MUST be done on the branch specified in the plan');
    console.log('');
    console.log('💡 Tips:');
    console.log('   - Reference this plan using ID:', timestampId);
    console.log('   - Update the status board as you progress');
    console.log('   - Follow the mandatory commit protocol for each task');
    console.log(`   - Never switch branches while implementing this plan`);

  } catch (error) {
    console.error('❌ Error creating implementation plan:', error.message);
    process.exit(1);
  }
}

// Main execution
createImplementationPlan().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});