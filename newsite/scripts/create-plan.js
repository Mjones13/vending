#!/usr/bin/env node

/**
 * Create new implementation plan with timestamp-based ID
 * Format: MMDD_HHMM-task-name.md
 * 
 * Usage:
 *   npm run create-plan "Task Name Here"
 *   npm run create-plan "Fix Homepage Layout Issues"
 *   node scripts/create-plan.js "Database Migration Script"
 */

const fs = require('fs').promises;
const path = require('path');

// Configuration
const IMPLEMENTATION_PLAN_DIR = path.join(__dirname, '..', 'docs', 'implementation-plan');

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
function generatePlanTemplate(taskName, timestampId) {
  const readableDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `# Implementation Plan: ${taskName}

## Background/Motivation

[Describe the problem or requirement that this implementation plan addresses]

## Key Challenges

1. **Challenge 1**: [Describe the first major challenge]
2. **Challenge 2**: [Describe the second major challenge]
3. **Challenge 3**: [Describe the third major challenge]

## High-Level Task Breakdown

### Phase 1: [Phase Name]
- [ ] **Task 1.1**: [Task description]
- [ ] **Task 1.2**: [Task description]
- [ ] **Task 1.3**: [Task description]

### Phase 2: [Phase Name]
- [ ] **Task 2.1**: [Task description]
- [ ] **Task 2.2**: [Task description]
- [ ] **Task 2.3**: [Task description]

### Phase 3: [Phase Name]
- [ ] **Task 3.1**: [Task description]
- [ ] **Task 3.2**: [Task description]
- [ ] **Task 3.3**: [Task description]

## Implementation Strategy

### Technical Approach:
[Describe the overall technical approach and methodology]

### Key Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

### Dependencies:
- [Dependency 1]
- [Dependency 2]
- [Dependency 3]

## Acceptance Criteria

### Functional Requirements:
- [ ] [Functional requirement 1]
- [ ] [Functional requirement 2]
- [ ] [Functional requirement 3]

### Quality Requirements:
- [ ] [Quality requirement 1]
- [ ] [Quality requirement 2]
- [ ] [Quality requirement 3]

### Performance Requirements:
- [ ] [Performance requirement 1]
- [ ] [Performance requirement 2]
- [ ] [Performance requirement 3]

## Project Status Board

### Current Status / Progress Tracking
**Phase**: Planning
**Last Updated**: ${readableDate}
**Branch**: [branch-name]

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
    const planContent = generatePlanTemplate(taskName, timestampId);

    // Write the file
    await fs.writeFile(filePath, planContent, 'utf8');

    // Success message
    console.log('✅ Implementation plan created successfully!');
    console.log('');
    console.log(`📄 File: ${filename}`);
    console.log(`📁 Path: ${filePath}`);
    console.log(`🕐 ID: ${timestampId}`);
    console.log(`📝 Title: ${taskName}`);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Open the file and fill in the plan details');
    console.log('   2. Create a Git branch for this implementation');
    console.log(`   3. git checkout -b ${kebabCaseTaskName}`);
    console.log('   4. Start implementing following the CLAUDE.md workflow');
    console.log('');
    console.log('💡 Tips:');
    console.log('   - Reference this plan using ID:', timestampId);
    console.log('   - Update the status board as you progress');
    console.log('   - Follow the mandatory commit protocol for each task');

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