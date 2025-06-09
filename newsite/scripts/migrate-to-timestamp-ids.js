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

// Progress tracking state
const progressState = {
  currentPhase: '',
  totalSteps: 0,
  completedSteps: 0,
  startTime: null,
  phaseStartTime: null
};

// Helper functions
function log(message, level = 'info') {
  if (level === 'verbose' && !isVerbose) return;
  console.log(message);
}

// Enhanced progress reporting functions
function startProgress(phase, totalSteps) {
  progressState.currentPhase = phase;
  progressState.totalSteps = totalSteps;
  progressState.completedSteps = 0;
  progressState.phaseStartTime = Date.now();
  
  if (!progressState.startTime) {
    progressState.startTime = Date.now();
  }
  
  log(`\n📊 ${phase} (0/${totalSteps})`);
}

function updateProgress(step, message) {
  progressState.completedSteps++;
  const percentage = Math.round((progressState.completedSteps / progressState.totalSteps) * 100);
  const progressBar = createProgressBar(percentage);
  
  if (isVerbose) {
    log(`   ${progressBar} ${percentage}% - ${message}`);
  } else {
    // In non-verbose mode, show condensed progress
    if (progressState.completedSteps % 5 === 0 || progressState.completedSteps === progressState.totalSteps) {
      log(`   ${progressBar} ${percentage}% (${progressState.completedSteps}/${progressState.totalSteps})`);
    }
  }
}

function completeProgress() {
  const duration = Date.now() - progressState.phaseStartTime;
  const durationStr = formatDuration(duration);
  log(`   ✅ ${progressState.currentPhase} completed in ${durationStr}`);
}

function createProgressBar(percentage) {
  const width = 20;
  const filled = Math.round(width * (percentage / 100));
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'-'.repeat(empty)}]`;
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function logSummary() {
  if (!progressState.startTime) return;
  
  const totalDuration = Date.now() - progressState.startTime;
  log(`\n⏱️  Total execution time: ${formatDuration(totalDuration)}`);
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
  log('🚀 Starting migration...\n');
  
  // Step 1: Scan existing plans
  const plans = await scanExistingPlans();
  if (plans.length === 0) {
    log('No numbered implementation plans found to migrate.');
    return;
  }
  
  log(`Found ${plans.length} implementation plans to migrate\n`);
  
  // Step 2: Generate migration plan
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
  
  // Step 3: Create backup
  log('💾 Creating backup...');
  const { backupDir, backupInfo } = await createBackup(migrationPlan);
  log(`   ✅ Backup created at: ${path.relative(process.cwd(), backupDir)}\n`);
  
  // Step 4: Create mapping
  const mapping = await createReadableMapping(migrationPlan);
  
  // Step 5: Perform atomic migration
  try {
    const result = await performAtomicMigration(migrationPlan, mapping);
    
    log('\n✅ Migration completed successfully!');
    log(`\n📊 Summary:`);
    log(`   - ${migrationPlan.length} implementation plans migrated`);
    log(`   - ${result.updatedFiles.length} files had references updated`);
    log(`   - Mapping saved to: ${path.basename(result.mappingPath)}`);
    log(`   - Backup available at: ${path.relative(process.cwd(), backupDir)}`);
    
    log('\n📚 Next steps:');
    log('   - Use "npm run create-plan" for new timestamp-based plans');
    log('   - Reference plans using timestamp IDs (e.g., 0608_1030)');
    log('   - See .timestamp-mapping.json for ID reference');
    
  } catch (error) {
    log(`\n❌ Migration failed: ${error.message}`);
    log(`\n💾 Backup preserved at: ${path.relative(process.cwd(), backupDir)}`);
    log('   Use --rollback with this backup directory to restore files');
    throw error;
  }
}

async function performRollback() {
  log('🔄 Starting rollback process...\n');
  
  // Step 1: Find available backups
  const backups = await findAvailableBackups();
  
  if (backups.length === 0) {
    log('❌ No backups found to rollback');
    log('   Run migration with --execute to create a backup first');
    return;
  }
  
  // Step 2: Select backup (most recent by default)
  let selectedBackup;
  if (backups.length === 1) {
    selectedBackup = backups[0];
    log(`📁 Found 1 backup: ${selectedBackup.name}`);
  } else {
    log('📁 Available backups:');
    backups.forEach((backup, index) => {
      const date = new Date(backup.info.timestamp);
      log(`   ${index + 1}. ${backup.name} - ${date.toLocaleString()} (${backup.info.originalPlans} plans)`);
    });
    
    // For now, automatically select the most recent backup
    selectedBackup = backups[0];
    log(`\n   Automatically selecting most recent: ${selectedBackup.name}`);
  }
  
  // Step 3: Confirm rollback
  log(`\n⚠️  This will restore ${selectedBackup.info.originalPlans} implementation plans`);
  log('   from their timestamp-based names back to numbered names.\n');
  
  // Step 4: Execute rollback
  try {
    // Restore implementation plan files
    let restoredCount = 0;
    for (const file of selectedBackup.info.files) {
      const backupPath = file.backup;
      const originalPath = file.original;
      
      try {
        // Check if the backup file exists
        await fs.access(backupPath);
        
        // Copy backup file back to original location
        await fs.copyFile(backupPath, originalPath);
        restoredCount++;
        
        log(`   ✓ Restored ${path.basename(originalPath)}`, 'verbose');
      } catch (error) {
        log(`   ⚠️  Failed to restore ${path.basename(originalPath)}: ${error.message}`, 'error');
      }
    }
    
    log(`\n✅ Rollback completed: ${restoredCount} files restored`);
    
    // Step 5: Clean up mapping file if it exists
    try {
      await fs.unlink(MAPPING_FILE);
      log('   ✓ Removed timestamp mapping file');
    } catch (error) {
      // Mapping file might not exist, which is fine
      if (error.code !== 'ENOENT') {
        log(`   ⚠️  Could not remove mapping file: ${error.message}`, 'verbose');
      }
    }
    
    // Step 6: Optionally clean up backup
    log(`\n💾 Backup preserved at: ${path.relative(process.cwd(), selectedBackup.path)}`);
    log('   You can manually delete it when no longer needed.');
    
    log('\n📝 Next steps:');
    log('   - Review restored files to ensure correctness');
    log('   - Consider why rollback was needed before re-attempting migration');
    log('   - Use --dry-run to preview changes before next migration attempt');
    
  } catch (error) {
    log(`\n❌ Rollback failed: ${error.message}`);
    log('   Manual intervention may be required');
    throw error;
  }
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

// Function to create backup
async function createBackup(migrationPlan) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = path.join(__dirname, '..', `${BACKUP_DIR_PREFIX}${timestamp}`);
  
  // Create backup directory
  await fs.mkdir(backupDir, { recursive: true });
  
  // Create backup info file
  const backupInfo = {
    timestamp: new Date().toISOString(),
    originalPlans: migrationPlan.length,
    backupDir: backupDir,
    files: []
  };
  
  // Backup implementation plan files
  const implBackupDir = path.join(backupDir, 'docs', 'implementation-plan');
  await fs.mkdir(implBackupDir, { recursive: true });
  
  for (const plan of migrationPlan) {
    const backupPath = path.join(implBackupDir, plan.oldFileName);
    await fs.copyFile(plan.oldPath, backupPath);
    backupInfo.files.push({
      original: plan.oldPath,
      backup: backupPath
    });
  }
  
  // Save backup info
  const backupInfoPath = path.join(backupDir, 'backup-info.json');
  await fs.writeFile(backupInfoPath, JSON.stringify(backupInfo, null, 2));
  
  return { backupDir, backupInfo };
}

// Function to find available backup directories
async function findAvailableBackups() {
  const backups = [];
  
  try {
    // Get parent directory of the script
    const parentDir = path.join(__dirname, '..');
    const entries = await fs.readdir(parentDir, { withFileTypes: true });
    
    // Find directories matching backup pattern
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith(BACKUP_DIR_PREFIX)) {
        const backupPath = path.join(parentDir, entry.name);
        const backupInfoPath = path.join(backupPath, 'backup-info.json');
        
        try {
          // Read backup info
          const infoContent = await fs.readFile(backupInfoPath, 'utf8');
          const info = JSON.parse(infoContent);
          
          backups.push({
            name: entry.name,
            path: backupPath,
            info: info,
            timestamp: new Date(info.timestamp).getTime()
          });
        } catch (error) {
          log(`   ⚠️  Skipping invalid backup: ${entry.name}`, 'verbose');
        }
      }
    }
    
    // Sort by timestamp descending (most recent first)
    backups.sort((a, b) => b.timestamp - a.timestamp);
    
  } catch (error) {
    log(`Error scanning for backups: ${error.message}`, 'verbose');
  }
  
  return backups;
}

// Function to perform atomic migration with rollback capability
async function performAtomicMigration(migrationPlan, mapping) {
  const operations = [];
  const completedOperations = [];
  let updatedFiles = [];
  
  try {
    // Phase 1: Rename all implementation plan files
    startProgress('Renaming implementation plan files', migrationPlan.length);
    
    for (const plan of migrationPlan) {
      try {
        await fs.rename(plan.oldPath, plan.newPath);
        completedOperations.push({
          type: 'rename',
          oldPath: plan.oldPath,
          newPath: plan.newPath
        });
        updateProgress(plan.oldFileName, `${plan.oldFileName} → ${plan.newFileName}`);
      } catch (error) {
        throw new Error(`Failed to rename ${plan.oldFileName}: ${error.message}`);
      }
    }
    
    completeProgress();
    
    // Phase 2: Update all references
    const referencesInfo = await scanForReferences(migrationPlan);
    const totalReferenceFiles = referencesInfo.size;
    
    if (totalReferenceFiles > 0) {
      startProgress('Updating references', totalReferenceFiles);
      const updateResult = await updateAllReferences(migrationPlan, false);
      updatedFiles = updateResult.updatedFiles;
      completeProgress();
      log(`   📝 Updated ${updateResult.totalChanges} references in ${updatedFiles.length} files`);
    } else {
      log('\n📝 No references to update');
    }
    
    // Phase 3: Save mapping file
    log('\n💾 Saving mapping file...');
    const mappingPath = await saveMappingFile(mapping);
    log(`   ✅ Mapping saved to ${path.basename(mappingPath)}`);
    
    return { success: true, completedOperations, updatedFiles, mappingPath };
    
  } catch (error) {
    // Rollback on error
    log('\n❌ Error during migration, rolling back changes...', 'error');
    
    // Rollback file renames
    for (const op of completedOperations.reverse()) {
      if (op.type === 'rename') {
        try {
          await fs.rename(op.newPath, op.oldPath);
          log(`   ↩️  Rolled back: ${path.basename(op.newPath)} → ${path.basename(op.oldPath)}`, 'verbose');
        } catch (rollbackError) {
          log(`   ⚠️  Failed to rollback ${op.newPath}: ${rollbackError.message}`, 'error');
        }
      }
    }
    
    throw error;
  }
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
  saveMappingFile,
  createBackup,
  findAvailableBackups,
  performAtomicMigration
};

// Run the script if called directly
if (require.main === module) {
  main();
}