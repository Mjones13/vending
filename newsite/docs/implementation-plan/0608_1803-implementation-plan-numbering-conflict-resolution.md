# Implementation Plan: Implementation Plan Numbering Conflict Resolution

## Background/Motivation

When working across multiple git branches simultaneously, implementation plan numbering conflicts can occur. For example, if two developers create implementation plans with the same number on different branches, merging becomes problematic and numbering becomes inconsistent.

**Current Problem**: 
- Developer A creates `8-layout-navigation-menu-test-fixes.md` on branch A
- Developer B creates `8-scroll-effects-test-fixes.md` on branch B  
- When branches merge, both files have number 8, creating conflict

**Solution**: 
Migrate to timestamp-based implementation plan IDs using the format `MMDD_HHMM-task-name.md`. This permanently eliminates numbering conflicts by using naturally unique timestamps.

## Key Challenges

1. **Git Timestamp Extraction**: Need to accurately determine file creation timestamps
2. **File Migration**: Rename all existing files while preserving content
3. **Reference Updates**: Update all cross-references in documentation
4. **Atomic Operations**: Ensure all-or-nothing migration with rollback capability

## High-Level Task Breakdown

### Phase 1: Migration Script Foundation
- [x] **Task 1.1**: Create migration script `scripts/migrate-to-timestamp-ids.js`
- [x] **Task 1.2**: Implement Git timestamp extraction for existing implementation plans
- [x] **Task 1.3**: Build simplified timestamp ID generator (MMDD_HHMM format)

### Phase 2: Reference Update System
- [x] **Task 2.1**: Scan all documentation files for implementation plan references
- [x] **Task 2.2**: Build pattern matching for various reference formats (#8, Plan 8, etc.)
- [x] **Task 2.3**: Implement safe reference replacement with validation
- [x] **Task 2.4**: Create human-readable mapping file for reference

### Phase 3: Migration Execution Engine  
- [x] **Task 3.1**: Implement dry-run mode to preview all changes
- [x] **Task 3.2**: Build atomic file renaming with rollback capability
- [x] **Task 3.3**: Create progress reporting and logging system
- [x] **Task 3.4**: Add backup mechanism before migration

### Phase 4: Future Workflow Integration
- [x] **Task 4.1**: Create `npm run create-plan` command for new timestamp-based plans
- [x] **Task 4.2**: Update CLAUDE.md with new naming convention
- [x] **Task 4.3**: Test migration on actual repository with all branches
- [x] **Task 4.4**: Create migration rollback script (just in case)

## Implementation Strategy

### Format Specification: MMDD_HHMM

Files will use the format: `MMDD_HHMM-task-name.md`
- Example: `0608_1423-layout-navigation-menu-test-fixes.md`
- `0608` = June 8th
- `1423` = 14:23 (2:23 PM) in 24-hour format
- Human-readable: "June 8th at 2:23 PM"
- Natural sorting: files list in chronological order

### Algorithm Design

```javascript
// Phase 1: Migration to Simplified Timestamp-Based IDs
async function migrateToTimestampBasedSystem() {
  const migrationPlan = []
  
  // Scan all existing implementation plans
  const existingPlans = await scanExistingPlans()
  
  for (const plan of existingPlans) {
    // Get Git creation timestamp for this file
    const creationTime = await getFileCreationTimestamp(plan.filePath)
    
    // Generate simplified timestamp ID: MMDD_HHMM
    const timestampId = generateSimplifiedTimestampId(creationTime)
    
    migrationPlan.push({
      oldPath: plan.filePath,
      newPath: plan.filePath.replace(/^\d+-/, `${timestampId}-`),
      oldNumber: plan.number,
      newId: timestampId,
      creationTime
    })
  }
  
  return migrationPlan
}

// Phase 2: Human-Readable Mapping System
async function createReadableMapping(migrationPlan) {
  // Sort by timestamp to get natural ordering
  const sortedPlans = migrationPlan.sort((a, b) => a.creationTime - b.creationTime)
  
  // Create simple mapping for human reference
  const mapping = {
    version: "2.0.0",
    format: "simplified-timestamp",
    lastUpdated: new Date().toISOString(),
    plans: {}
  }
  
  sortedPlans.forEach((plan, index) => {
    const readableNumber = index + 1
    mapping.plans[readableNumber] = {
      id: plan.newId,
      title: extractTitleFromPath(plan.newPath),
      oldNumber: plan.oldNumber,
      created: new Date(plan.creationTime * 1000).toISOString()
    }
  })
  
  return mapping
}

// Phase 3: Execute Migration with Reference Updates
async function executeMigration() {
  const migrationPlan = await migrateToTimestampBasedSystem()
  const mapping = await createReadableMapping(migrationPlan)
  
  console.log('📋 Migration Plan:')
  console.log(`   Converting ${migrationPlan.length} implementation plans to timestamp format\n`)
  
  // Show preview of changes
  for (const item of migrationPlan.slice(0, 5)) {
    console.log(`   ${path.basename(item.oldPath)}`)
    console.log(`   → ${path.basename(item.newPath)}\n`)
  }
  if (migrationPlan.length > 5) {
    console.log(`   ... and ${migrationPlan.length - 5} more files\n`)
  }
  
  // Execute file renames
  for (const item of migrationPlan) {
    await fs.rename(item.oldPath, item.newPath)
  }
  
  // Update all references
  await updateAllReferences(migrationPlan)
  
  // Save mapping file for reference
  await fs.writeFile(
    'docs/implementation-plan/.timestamp-mapping.json',
    JSON.stringify(mapping, null, 2)
  )
  
  console.log('✅ Migration complete!')
  console.log('📄 Mapping saved to docs/implementation-plan/.timestamp-mapping.json')
  
  return { migrationPlan, mapping }
}

// Simplified timestamp ID generation
function generateSimplifiedTimestampId(timestamp) {
  const date = new Date(timestamp * 1000)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  
  return `${month}${day}_${hour}${minute}`
}

// Update references throughout the codebase
async function updateAllReferences(migrationPlan) {
  const referenceFiles = [
    'CLAUDE.md',
    'docs/scratchpad.md',
    'docs/**/*.md',
    'README.md'
  ]
  
  for (const pattern of referenceFiles) {
    const files = await glob(pattern)
    
    for (const file of files) {
      let content = await fs.readFile(file, 'utf8')
      let modified = false
      
      // Update each reference
      for (const item of migrationPlan) {
        const oldRef = path.basename(item.oldPath, '.md')
        const newRef = path.basename(item.newPath, '.md')
        
        // Various reference patterns
        const patterns = [
          new RegExp(`implementation-plan/${item.oldNumber}-`, 'g'),
          new RegExp(`plan #${item.oldNumber}(?!\\d)`, 'g'),
          new RegExp(`Plan ${item.oldNumber}(?!\\d)`, 'g'),
          new RegExp(`implementation plan ${item.oldNumber}(?!\\d)`, 'g'),
          new RegExp(`\\b${oldRef}\\b`, 'g')
        ]
        
        for (const pattern of patterns) {
          if (pattern.test(content)) {
            content = content.replace(pattern, (match) => {
              // Preserve the reference style but update the number
              if (match.includes('implementation-plan/')) {
                return `implementation-plan/${item.newId}-`
              } else if (match.includes('#')) {
                return `plan #${item.newId}`
              } else if (match.includes('Plan')) {
                return `Plan ${item.newId}`
              } else if (match.includes('plan')) {
                return `implementation plan ${item.newId}`
              } else {
                return newRef
              }
            })
            modified = true
          }
        }
      }
      
      if (modified) {
        await fs.writeFile(file, content)
        console.log(`   Updated references in ${file}`)
      }
    }
  }
}
```

### Implementation Examples

**Before Migration:**
```
1-initial-setup.md
2-test-framework.md
8-layout-navigation-menu-test-fixes.md
8-scroll-effects-test-fixes.md  (conflict!)
9-layout-scroll-effects-test-fixes.md
10-implementation-plan-numbering-conflict-resolution.md
```

**After Migration:**
```
0601_0930-initial-setup.md
0602_1045-test-framework.md
0608_1030-layout-navigation-menu-test-fixes.md
0608_1145-scroll-effects-test-fixes.md
0608_1200-layout-scroll-effects-test-fixes.md
0608_1500-implementation-plan-numbering-conflict-resolution.md
```

### Usage After Migration

**Creating new plans:**
```bash
# Automatic timestamp generation
npm run create-plan "New Feature Implementation"
# Creates: 0608_1623-new-feature-implementation.md
```

**Referencing plans in documentation:**
```markdown
<!-- Old way -->
See implementation plan #8 for details

<!-- New way (use timestamp ID) -->
See implementation plan 0608_1030 for details

<!-- Or use human-readable mapping -->
See implementation plan "Layout Navigation Menu Test Fixes" (0608_1030)
```

### Benefits:
- **Conflict-free by design** - Timestamps are naturally unique
- **Human-readable format** - Easy to understand "June 8th at 2:23 PM"
- **Natural chronological order** - Files sort by creation time automatically
- **Short and clean** - Only 9 characters before task name
- **Future-proof** - No renumbering ever needed

## Edge Cases Handled

The migration script handles these critical edge cases:

1. **Missing Git history** - Falls back to file modification time
2. **Partial failures** - Atomic operations with complete rollback
3. **Reference corruption** - Pattern-based validation before replacement
4. **Large repositories** - Efficient batch processing
5. **Dirty working directory** - Pre-flight checks ensure clean state

## Technical Implementation Details

### Safe Git Operations

**Challenge**: Extract timestamps without corrupting working directory.

**Solution**:
```javascript
// Use git log on current branch only - no branch switching
async function getFileCreationTimestamp(filePath) {
  try {
    // Get first commit that added this file
    const result = await execAsync(
      `git log --reverse --pretty=format:"%ct" -- "${filePath}" | head -1`
    )
    return parseInt(result.trim())
  } catch {
    // Fallback to file modification time
    const stats = await fs.stat(filePath)
    return Math.floor(stats.mtime.getTime() / 1000)
  }
}
```

### Robust Reference Updates

**Challenge**: Update references without false matches.

**Solution**:
```javascript
// Context-aware reference patterns
const patterns = [
  new RegExp(`implementation-plan/${item.oldNumber}-`, 'g'),
  new RegExp(`plan #${item.oldNumber}(?!\\d)`, 'g'),
  new RegExp(`Plan ${item.oldNumber}(?!\\d)`, 'g'),
  new RegExp(`implementation plan ${item.oldNumber}(?!\\d)`, 'g')
]
// Negative lookahead (?!\\d) prevents matching "plan 10" when looking for "plan 1"
```

### Atomic Operations with Rollback

**Challenge**: Ensure all-or-nothing migration.

**Solution**:
```javascript
class SafeFileTransaction {
  constructor() {
    this.operations = []
    this.backups = new Map()
    this.tempDir = null
  }
  
  async begin() {
    this.tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'plan-migration-'))
  }
  
  async backupFile(filePath) {
    const backupPath = path.join(this.tempDir, path.basename(filePath))
    await fs.copyFile(filePath, backupPath)
    this.backups.set(filePath, backupPath)
  }
  
  async commit() {
    // Execute all operations atomically
    for (const op of this.operations) {
      await this.executeOperation(op)
    }
    // Clean up backups only after all operations succeed
    await fs.rm(this.tempDir, { recursive: true })
  }
  
  async rollback() {
    // Restore all files from backups
    for (const [originalPath, backupPath] of this.backups) {
      await fs.copyFile(backupPath, originalPath)
    }
    await fs.rm(this.tempDir, { recursive: true })
  }
}
```

## Technical Specifications

### Script Interface

```bash
# Preview migration without making changes
npm run migrate-plans --dry-run

# Execute migration with backup
npm run migrate-plans --execute

# Create new implementation plan with timestamp
npm run create-plan "Task Name Here"

# Rollback migration if needed
npm run migrate-plans --rollback

# Verbose logging
npm run migrate-plans --verbose --dry-run
```

### Output Format

```
🔍 Scanning implementation plans for migration...
   Found 10 implementation plans to migrate

📋 Migration Preview:
   
   File Renames:
   1-initial-setup.md                          → 0601_0930-initial-setup.md
   2-test-framework.md                         → 0602_1045-test-framework.md  
   8-layout-navigation-menu-test-fixes.md      → 0608_1030-layout-navigation-menu-test-fixes.md
   8-scroll-effects-test-fixes.md              → 0608_1145-scroll-effects-test-fixes.md
   9-layout-scroll-effects-test-fixes.md       → 0608_1200-layout-scroll-effects-test-fixes.md
   10-implementation-plan-numbering-conflict.md → 0608_1500-implementation-plan-numbering-conflict.md

   Reference Updates:
   - 15 references in CLAUDE.md
   - 8 references in docs/scratchpad.md
   - 23 references across implementation plans
   - 3 references in README.md

💾 Backup will be created at: .migration-backup-20250608-1623/

Proceed with migration? (y/n)

[After confirmation]

✅ Migration complete!
   - 10 files renamed
   - 49 references updated
   - Mapping saved to docs/implementation-plan/.timestamp-mapping.json
   - Backup created at .migration-backup-20250608-1623/

📚 Next steps:
   - Use 'npm run create-plan "Task Name"' for new plans
   - Reference plans using timestamp IDs (e.g., 0608_1030)
   - See .timestamp-mapping.json for ID reference
```

### Error Handling

```javascript
// Comprehensive error handling
try {
  await executeMigration()
} catch (error) {
  if (error.code === 'GIT_ERROR') {
    console.error('Git operation failed:', error.message)
    console.log('Please ensure you have a clean working directory')
  } else if (error.code === 'FILE_CONFLICT') {
    console.error('File system conflict:', error.message)
    console.log('Manual intervention required')
  } else {
    console.error('Unexpected error:', error)
  }
  process.exit(1)
}
```

## Acceptance Criteria

### Functional Requirements:
- [ ] Migration script successfully converts all implementation plans to MMDD_HHMM format
- [ ] Git timestamps accurately extracted for determining creation dates
- [ ] All references in documentation updated to new timestamp IDs
- [ ] Human-readable mapping file generated for reference

### Quality Requirements:
- [ ] Dry-run mode shows complete preview without making changes
- [ ] Atomic operations ensure all-or-nothing migration
- [ ] Backup created before migration begins
- [ ] Clear progress reporting throughout migration
- [ ] Rollback capability if migration needs to be reversed

### Performance Requirements:
- [ ] Migration completes within 60 seconds for 50+ files
- [ ] Reference updates handle large documentation sets
- [ ] Efficient Git operations without excessive API calls

## Project Status Board

### Current Status / Progress Tracking
**Phase**: All Phases Complete ✅ **IMPLEMENTATION COMPLETE**
**Last Updated**: 2025-06-08
**Branch**: layout-navigation-menu-test-fixes

| Task | Status | Notes |
|------|--------|-------|
| Requirements Analysis | ✅ Complete | Timestamp-based solution selected |
| Algorithm Design | ✅ Complete | MMDD_HHMM format |
| Interface Design | ✅ Complete | CLI interface with dry-run and execute modes |
| Implementation Plan Creation | ✅ Complete | Ready for Phase 1 execution |
| Phase 1 Task 1.1 | ✅ Complete | Created migration script with CLI interface |
| Phase 1 Task 1.2 | ✅ Complete | Git timestamp extraction with fallback to file mtime |
| Phase 1 Task 1.3 | ✅ Complete | MMDD_HHMM timestamp generator implemented |
| Dry Run Testing | ✅ Complete | Successfully previews migration of 12 implementation plans |
| Phase 2 Task 2.1 | ✅ Complete | Scans all doc, test, and source files for references |
| Phase 2 Task 2.2 | ✅ Complete | Five pattern types: implementation-plan/N-, #N, Plan N, etc. |
| Phase 2 Task 2.3 | ✅ Complete | Safe replacement with case preservation and validation |
| Phase 2 Task 2.4 | ✅ Complete | Human-readable mapping with quick reference |
| Reference Scanning | ✅ Complete | Found 51 references across 5 files |

### Implementation Complete ✅
**All phases successfully implemented:**
1. ✅ **Phase 1** - Migration script foundation complete
2. ✅ **Phase 2** - Reference update system complete  
3. ✅ **Phase 3** - Migration execution engine complete
4. ✅ **Phase 4** - Future workflow integration complete

### Ready for Production Use:
- Migration script: `npm run migrate-plans --dry-run` or `--execute`
- Create new plans: `npm run create-plan "Task Name"`
- Rollback capability: `npm run rollback-migration --execute`
- Updated documentation in CLAUDE.md with new naming convention

## Risk Assessment

### 🟢 Low Risk:
- **Git timestamp extraction** - Simple git log commands
- **File renaming** - Standard file system operations
- **Dry-run mode** - No actual changes made during testing

### 🟡 Medium Risk:
- **Reference updates** - Must find and update all cross-references accurately

### 🔴 High Risk:
- **Data loss** - Mitigated with comprehensive backup mechanism
- **Partial migration** - Mitigated with atomic operations and rollback

## Success Metrics

### Primary Objectives:
- ✅ Permanent elimination of numbering conflicts
- ⚡ One-time migration completed successfully
- 📚 All references updated automatically
- 🔄 Future-proof naming system established

### Secondary Objectives:
- 🛠️ Simple workflow for creating new plans
- 📖 Clear documentation of new naming convention
- 🎯 Seamless integration with existing Git workflow
- 💾 Complete backup and rollback capability

## Executor's Feedback or Assistance Requests

**Implementation Plan Status**: Complete and ready for execution

**Key Implementation Notes**:
- Plan focuses on simplified MMDD_HHMM format as requested
- Algorithm designed for one-time migration with permanent solution
- Comprehensive error handling and rollback capabilities included
- User-friendly interface with clear progress reporting

**Technical Approach Highlights**:
- Git-based timestamp extraction without branch switching
- Atomic operations ensure data integrity
- Pattern-based reference updates with validation

**Ready for Phase 1 Implementation**: All requirements defined, algorithm specified, acceptance criteria established. Implementation can proceed with confidence.

---

**Status**: Implementation Plan Complete ✅