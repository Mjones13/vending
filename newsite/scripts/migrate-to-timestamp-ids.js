#!/usr/bin/env node

/**
 * Migration script to convert numbered implementation plans to timestamp-based IDs
 * Format: MMDD_HHMM-task-name.md
 * 
 * Usage:
 *   npm run migrate-plans --dry-run    # Preview changes
 *   npm run migrate-plans --execute    # Execute migration
 *   npm run migrate-plans --rollback   # Rollback migration
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const { promisify } = require('util');
const glob = promisify(require('glob'));

// Configuration
const IMPLEMENTATION_PLAN_DIR = path.join(__dirname, '..', 'docs', 'implementation-plan');
const BACKUP_DIR_PREFIX = '.migration-backup-';
const MAPPING_FILE = path.join(IMPLEMENTATION_PLAN_DIR, '.timestamp-mapping.json');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isExecute = args.includes('--execute');
const isRollback = args.includes('--rollback');
const isVerbose = args.includes('--verbose');

// Validation
if (!isDryRun && !isExecute && !isRollback) {
  console.error('❌ Error: You must specify one of --dry-run, --execute, or --rollback');
  process.exit(1);
}

// Helper functions
function log(message, level = 'info') {
  if (level === 'verbose' && !isVerbose) return;
  console.log(message);
}

function execGitCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    log(`Git command failed: ${command}`, 'verbose');
    return null;
  }
}

// Main migration functions will be implemented in subsequent tasks
async function main() {
  try {
    log('🔍 Scanning implementation plans for migration...');
    
    if (isDryRun) {
      log('\n📋 DRY RUN MODE - No changes will be made\n');
      await performDryRun();
    } else if (isExecute) {
      await performMigration();
    } else if (isRollback) {
      await performRollback();
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (isVerbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

async function performDryRun() {
  const plans = await scanExistingPlans();
  log(`   Found ${plans.length} implementation plans to migrate\n`);
  
  if (plans.length === 0) {
    log('No numbered implementation plans found to migrate.');
    return;
  }
  
  // Generate migration plan
  const migrationPlan = [];
  
  for (const plan of plans) {
    const timestamp = await getFileCreationTimestamp(plan.filePath);
    const newId = generateSimplifiedTimestampId(timestamp);
    const newFileName = `${newId}-${plan.taskName}.md`;
    const newPath = path.join(IMPLEMENTATION_PLAN_DIR, newFileName);
    
    migrationPlan.push({
      oldPath: plan.filePath,
      oldFileName: plan.fileName,
      newPath: newPath,
      newFileName: newFileName,
      oldNumber: plan.number,
      newId: newId,
      taskName: plan.taskName,
      creationTime: timestamp
    });
  }
  
  // Sort by creation time
  migrationPlan.sort((a, b) => a.creationTime - b.creationTime);
  
  // Display migration preview
  log('📋 Migration Preview:\n');
  log('   File Renames:');
  
  for (const item of migrationPlan) {
    const maxOldLength = Math.max(...migrationPlan.map(p => p.oldFileName.length));
    const padding = ' '.repeat(maxOldLength - item.oldFileName.length);
    log(`   ${item.oldFileName}${padding} → ${item.newFileName}`);
  }
  
  // Scan for references
  log('\n🔍 Scanning for references to update...');
  const references = await scanForReferences(migrationPlan);
  
  // Count total references
  let totalReferences = 0;
  const referenceSummary = new Map();
  
  for (const [file, refs] of references) {
    for (const ref of refs) {
      totalReferences += ref.count;
      const key = `${ref.type}:${ref.pattern}`;
      referenceSummary.set(key, (referenceSummary.get(key) || 0) + ref.count);
    }
  }
  
  log('\n   Reference Updates:');
  if (references.size > 0) {
    // Group by file for summary
    const fileGroups = {
      'CLAUDE.md': 0,
      'docs/scratchpad.md': 0,
      'implementation plans': 0,
      'test files': 0,
      'source files': 0,
      'other': 0
    };
    
    for (const [file, refs] of references) {
      const refCount = refs.reduce((sum, ref) => sum + ref.count, 0);
      
      if (file === 'CLAUDE.md') {
        fileGroups['CLAUDE.md'] += refCount;
      } else if (file === 'docs/scratchpad.md') {
        fileGroups['docs/scratchpad.md'] += refCount;
      } else if (file.includes('implementation-plan')) {
        fileGroups['implementation plans'] += refCount;
      } else if (file.includes('__tests__') || file.includes('test-utils')) {
        fileGroups['test files'] += refCount;
      } else if (file.includes('pages/') || file.includes('components/')) {
        fileGroups['source files'] += refCount;
      } else {
        fileGroups['other'] += refCount;
      }
    }
    
    // Display summary
    for (const [group, count] of Object.entries(fileGroups)) {
      if (count > 0) {
        log(`   - ${count} references in ${group}`);
      }
    }
    
    log(`\n   Total: ${totalReferences} references across ${references.size} files`);
  } else {
    log('   - No references found to update');
  }
  
  log('\n💾 Backup will be created before migration');
  log('\n✅ Ready for migration. Use --execute to proceed.');
}

async function performMigration() {
  // Will be implemented after dry run is complete
  log('Migration functionality will be implemented after dry run');
}

async function performRollback() {
  // Will be implemented as part of backup mechanism
  log('Rollback functionality will be implemented with backup mechanism');
}

// Utility function to scan for existing plans
async function scanExistingPlans() {
  try {
    const files = await fs.readdir(IMPLEMENTATION_PLAN_DIR);
    const plans = [];
    
    for (const file of files) {
      // Match numbered implementation plan files
      const match = file.match(/^(\d+)-(.+)\.md$/);
      if (match) {
        plans.push({
          fileName: file,
          number: parseInt(match[1]),
          taskName: match[2],
          filePath: path.join(IMPLEMENTATION_PLAN_DIR, file)
        });
      }
    }
    
    return plans.sort((a, b) => a.number - b.number);
  } catch (error) {
    throw new Error(`Failed to scan implementation plans: ${error.message}`);
  }
}

// Function to get file creation timestamp from Git history
async function getFileCreationTimestamp(filePath) {
  try {
    // Get the first commit that added this file
    const relativePath = path.relative(process.cwd(), filePath);
    const gitCommand = `git log --reverse --pretty=format:"%ct" -- "${relativePath}"`;
    const result = execGitCommand(gitCommand);
    
    if (result) {
      const timestamps = result.split('\n').filter(t => t.trim());
      if (timestamps.length > 0) {
        const timestamp = parseInt(timestamps[0]);
        if (!isNaN(timestamp)) {
          log(`Git timestamp for ${path.basename(filePath)}: ${new Date(timestamp * 1000).toISOString()}`, 'verbose');
          return timestamp;
        }
      }
    }
    
    // Fallback to file modification time if Git history not available
    log(`No Git history for ${path.basename(filePath)}, using file modification time`, 'verbose');
    const stats = await fs.stat(filePath);
    return Math.floor(stats.mtime.getTime() / 1000);
  } catch (error) {
    log(`Error getting timestamp for ${filePath}: ${error.message}`, 'verbose');
    // Last resort fallback
    const stats = await fs.stat(filePath);
    return Math.floor(stats.mtime.getTime() / 1000);
  }
}

// Function to generate timestamp ID in MMDD_HHMM format
function generateSimplifiedTimestampId(timestamp) {
  const date = new Date(timestamp * 1000);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  
  return `${month}${day}_${hour}${minute}`;
}

// Function to scan for references in documentation files
async function scanForReferences(migrationPlan) {
  const referencePatterns = [
    'CLAUDE.md',
    'docs/scratchpad.md',
    'docs/**/*.md',
    'README.md',
    '__tests__/**/*.{ts,tsx}',
    'test-utils/**/*.{ts,tsx}',
    'pages/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}'
  ];
  
  const references = new Map(); // Map of file -> array of references found
  
  for (const pattern of referencePatterns) {
    try {
      const files = await glob(pattern, { 
        cwd: path.join(__dirname, '..'),
        ignore: ['node_modules/**', '.next/**', '.next-ai/**', 'coverage/**']
      });
      
      for (const file of files) {
        const filePath = path.join(__dirname, '..', file);
        const content = await fs.readFile(filePath, 'utf8');
        const fileReferences = [];
        
        // Check for references to each plan number
        for (const plan of migrationPlan) {
          // Pattern 1: implementation-plan/N-
          const implPlanPattern = new RegExp(`implementation-plan/${plan.oldNumber}-`, 'g');
          const implPlanMatches = content.match(implPlanPattern);
          if (implPlanMatches) {
            fileReferences.push({
              type: 'implementation-plan-path',
              oldNumber: plan.oldNumber,
              count: implPlanMatches.length,
              pattern: `implementation-plan/${plan.oldNumber}-`
            });
          }
          
          // Pattern 2: plan #N (with word boundary)
          const planHashPattern = new RegExp(`plan #${plan.oldNumber}(?!\\d)`, 'gi');
          const planHashMatches = content.match(planHashPattern);
          if (planHashMatches) {
            fileReferences.push({
              type: 'plan-hash',
              oldNumber: plan.oldNumber,
              count: planHashMatches.length,
              pattern: `plan #${plan.oldNumber}`
            });
          }
          
          // Pattern 3: Plan N (capitalized)
          const planCapPattern = new RegExp(`Plan ${plan.oldNumber}(?!\\d)`, 'g');
          const planCapMatches = content.match(planCapPattern);
          if (planCapMatches) {
            fileReferences.push({
              type: 'plan-capitalized',
              oldNumber: plan.oldNumber,
              count: planCapMatches.length,
              pattern: `Plan ${plan.oldNumber}`
            });
          }
          
          // Pattern 4: implementation plan N
          const implPlanTextPattern = new RegExp(`implementation plan ${plan.oldNumber}(?!\\d)`, 'gi');
          const implPlanTextMatches = content.match(implPlanTextPattern);
          if (implPlanTextMatches) {
            fileReferences.push({
              type: 'implementation-plan-text',
              oldNumber: plan.oldNumber,
              count: implPlanTextMatches.length,
              pattern: `implementation plan ${plan.oldNumber}`
            });
          }
          
          // Pattern 5: Direct file reference (e.g., "8-layout-navigation-menu-test-fixes.md")
          const fileNamePattern = new RegExp(`\\b${plan.oldFileName}\\b`, 'g');
          const fileNameMatches = content.match(fileNamePattern);
          if (fileNameMatches) {
            fileReferences.push({
              type: 'filename',
              oldNumber: plan.oldNumber,
              count: fileNameMatches.length,
              pattern: plan.oldFileName
            });
          }
        }
        
        if (fileReferences.length > 0) {
          references.set(file, fileReferences);
        }
      }
    } catch (error) {
      log(`Error scanning pattern ${pattern}: ${error.message}`, 'verbose');
    }
  }
  
  return references;
}

// Function to update references in a file
async function updateReferencesInFile(filePath, migrationPlan) {
  let content = await fs.readFile(filePath, 'utf8');
  let modified = false;
  let changeCount = 0;
  
  // Create a map for quick lookup
  const planMap = new Map();
  for (const plan of migrationPlan) {
    planMap.set(plan.oldNumber, plan);
  }
  
  // Sort plans by number descending to avoid replacing "1" in "10"
  const sortedPlans = [...migrationPlan].sort((a, b) => b.oldNumber - a.oldNumber);
  
  for (const plan of sortedPlans) {
    // Pattern 1: implementation-plan/N-
    const implPlanPattern = new RegExp(`implementation-plan/${plan.oldNumber}-`, 'g');
    const implPlanReplacement = `implementation-plan/${plan.newId}-`;
    if (implPlanPattern.test(content)) {
      content = content.replace(implPlanPattern, implPlanReplacement);
      modified = true;
      changeCount++;
    }
    
    // Pattern 2: plan #N (with word boundary)
    const planHashPattern = new RegExp(`plan #${plan.oldNumber}(?!\\d)`, 'gi');
    const planHashReplacement = `plan #${plan.newId}`;
    if (planHashPattern.test(content)) {
      content = content.replace(planHashPattern, (match) => {
        // Preserve original case
        return match.startsWith('Plan') ? `Plan #${plan.newId}` : `plan #${plan.newId}`;
      });
      modified = true;
      changeCount++;
    }
    
    // Pattern 3: Plan N (capitalized)
    const planCapPattern = new RegExp(`Plan ${plan.oldNumber}(?!\\d)`, 'g');
    const planCapReplacement = `Plan ${plan.newId}`;
    if (planCapPattern.test(content)) {
      content = content.replace(planCapPattern, planCapReplacement);
      modified = true;
      changeCount++;
    }
    
    // Pattern 4: implementation plan N
    const implPlanTextPattern = new RegExp(`implementation plan ${plan.oldNumber}(?!\\d)`, 'gi');
    if (implPlanTextPattern.test(content)) {
      content = content.replace(implPlanTextPattern, (match) => {
        // Preserve original case
        const prefix = match.startsWith('Implementation') ? 'Implementation' : 'implementation';
        return `${prefix} plan ${plan.newId}`;
      });
      modified = true;
      changeCount++;
    }
    
    // Pattern 5: Direct file reference
    const fileNamePattern = new RegExp(`\\b${plan.oldFileName}\\b`, 'g');
    if (fileNamePattern.test(content)) {
      content = content.replace(fileNamePattern, plan.newFileName);
      modified = true;
      changeCount++;
    }
  }
  
  return { content, modified, changeCount };
}

// Function to update all references
async function updateAllReferences(migrationPlan, dryRun = false) {
  const referencePatterns = [
    'CLAUDE.md',
    'docs/scratchpad.md',
    'docs/**/*.md',
    'README.md',
    '__tests__/**/*.{ts,tsx}',
    'test-utils/**/*.{ts,tsx}',
    'pages/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}'
  ];
  
  const updatedFiles = [];
  let totalChanges = 0;
  
  for (const pattern of referencePatterns) {
    try {
      const files = await glob(pattern, { 
        cwd: path.join(__dirname, '..'),
        ignore: ['node_modules/**', '.next/**', '.next-ai/**', 'coverage/**']
      });
      
      for (const file of files) {
        const filePath = path.join(__dirname, '..', file);
        const result = await updateReferencesInFile(filePath, migrationPlan);
        
        if (result.modified) {
          if (!dryRun) {
            await fs.writeFile(filePath, result.content);
            log(`   Updated references in ${file}`, 'verbose');
          }
          updatedFiles.push({ file, changeCount: result.changeCount });
          totalChanges += result.changeCount;
        }
      }
    } catch (error) {
      log(`Error updating references in pattern ${pattern}: ${error.message}`, 'verbose');
    }
  }
  
  return { updatedFiles, totalChanges };
}

// Function to create human-readable mapping
async function createReadableMapping(migrationPlan) {
  // Sort by timestamp to get natural ordering
  const sortedPlans = [...migrationPlan].sort((a, b) => a.creationTime - b.creationTime);
  
  const mapping = {
    version: "1.0.0",
    format: "simplified-timestamp",
    migrationDate: new Date().toISOString(),
    description: "Mapping of old numbered implementation plans to new timestamp-based IDs",
    plans: {},
    quickReference: []
  };
  
  sortedPlans.forEach((plan, index) => {
    const readableNumber = index + 1;
    const createdDate = new Date(plan.creationTime * 1000);
    
    mapping.plans[readableNumber] = {
      oldNumber: plan.oldNumber,
      oldFileName: plan.oldFileName,
      newId: plan.newId,
      newFileName: plan.newFileName,
      title: plan.taskName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      created: createdDate.toISOString(),
      readableDate: createdDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    
    // Add to quick reference
    mapping.quickReference.push({
      old: `#${plan.oldNumber}`,
      new: plan.newId,
      title: mapping.plans[readableNumber].title
    });
  });
  
  return mapping;
}

// Function to save mapping file
async function saveMappingFile(mapping) {
  const mappingPath = path.join(IMPLEMENTATION_PLAN_DIR, '.timestamp-mapping.json');
  await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2));
  return mappingPath;
}

// Export functions for testing
module.exports = {
  scanExistingPlans,
  getFileCreationTimestamp,
  generateSimplifiedTimestampId,
  scanForReferences,
  updateReferencesInFile,
  updateAllReferences,
  createReadableMapping,
  saveMappingFile
};

// Run the script if called directly
if (require.main === module) {
  main();
}