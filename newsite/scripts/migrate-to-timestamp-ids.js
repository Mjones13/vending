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
  
  // Count references that will need updating
  log('\n   Reference Updates:');
  log('   - References will be scanned in Phase 2');
  log('   - Patterns to update: #N, Plan N, implementation-plan/N-');
  
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

// Export functions for testing
module.exports = {
  scanExistingPlans,
  getFileCreationTimestamp,
  generateSimplifiedTimestampId
};

// Run the script if called directly
if (require.main === module) {
  main();
}