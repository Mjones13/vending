#!/usr/bin/env node

/**
 * Rollback implementation plan migration from timestamp-based IDs back to numbered format
 * 
 * Usage:
 *   npm run rollback-migration --dry-run    # Preview rollback changes
 *   npm run rollback-migration --execute    # Execute rollback
 *   node scripts/rollback-migration.js --execute
 */

const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));

// Configuration
const IMPLEMENTATION_PLAN_DIR = path.join(__dirname, '..', 'docs', 'implementation-plan');
const MAPPING_FILE = path.join(IMPLEMENTATION_PLAN_DIR, '.timestamp-mapping.json');
const BACKUP_DIR_PREFIX = '.rollback-backup-';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isExecute = args.includes('--execute');
const isVerbose = args.includes('--verbose');

// Validation
if (!isDryRun && !isExecute) {
  console.error('❌ Error: You must specify either --dry-run or --execute');
  console.log('Usage examples:');
  console.log('  npm run rollback-migration --dry-run');
  console.log('  npm run rollback-migration --execute');
  process.exit(1);
}

// Helper functions
function log(message, level = 'info') {
  if (level === 'verbose' && !isVerbose) return;
  console.log(message);
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

// Create backup directory
async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = path.join(process.cwd(), `${BACKUP_DIR_PREFIX}${timestamp}`);
  
  await fs.mkdir(backupDir, { recursive: true });
  
  // Copy implementation plan directory
  const planBackupDir = path.join(backupDir, 'implementation-plan');
  await fs.mkdir(planBackupDir, { recursive: true });
  
  const planFiles = await glob('*.md', { cwd: IMPLEMENTATION_PLAN_DIR });
  for (const file of planFiles) {
    const srcPath = path.join(IMPLEMENTATION_PLAN_DIR, file);
    const destPath = path.join(planBackupDir, file);
    await fs.copyFile(srcPath, destPath);
  }
  
  // Copy mapping file if it exists
  try {
    const mappingDestPath = path.join(planBackupDir, '.timestamp-mapping.json');
    await fs.copyFile(MAPPING_FILE, mappingDestPath);
  } catch {
    // Mapping file doesn't exist, which is fine
  }
  
  log(`💾 Backup created at: ${backupDir}`);
  return backupDir;
}

// Load timestamp mapping
async function loadTimestampMapping() {
  try {
    const mappingContent = await fs.readFile(MAPPING_FILE, 'utf8');
    const mapping = JSON.parse(mappingContent);
    return mapping;
  } catch (error) {
    console.error('❌ Error: Cannot find timestamp mapping file');
    console.log('This suggests the migration was never executed, or the mapping file was deleted.');
    console.log(`Expected location: ${MAPPING_FILE}`);
    process.exit(1);
  }
}

// Generate rollback plan
async function generateRollbackPlan() {
  const mapping = await loadTimestampMapping();
  const rollbackPlan = [];
  
  // Get current timestamp-based files
  const currentFiles = await glob('????_????-*.md', { cwd: IMPLEMENTATION_PLAN_DIR });
  
  for (const currentFile of currentFiles) {
    const currentPath = path.join(IMPLEMENTATION_PLAN_DIR, currentFile);
    
    // Extract timestamp ID from filename
    const timestampMatch = currentFile.match(/^(\d{4}_\d{4})-(.+)\.md$/);
    if (!timestampMatch) {
      log(`⚠️  Warning: Skipping ${currentFile} - doesn't match timestamp format`, 'verbose');
      continue;
    }
    
    const [, timestampId, taskName] = timestampMatch;
    
    // Find the original number from mapping
    let originalNumber = null;
    for (const [planNumber, planData] of Object.entries(mapping.plans)) {
      if (planData.id === timestampId) {
        originalNumber = planNumber;
        break;
      }
    }
    
    if (!originalNumber) {
      log(`⚠️  Warning: Cannot find original number for ${timestampId} in mapping`, 'verbose');
      continue;
    }
    
    const originalFileName = `${originalNumber}-${taskName}.md`;
    const originalPath = path.join(IMPLEMENTATION_PLAN_DIR, originalFileName);
    
    rollbackPlan.push({
      currentPath,
      originalPath,
      currentFileName: currentFile,
      originalFileName,
      timestampId,
      originalNumber
    });
  }
  
  // Sort by original number for predictable output
  rollbackPlan.sort((a, b) => parseInt(a.originalNumber) - parseInt(b.originalNumber));
  
  return rollbackPlan;
}

// Scan for references that need to be rolled back
async function scanForReferencesToRollback(rollbackPlan) {
  const referenceFiles = [
    '../CLAUDE.md',
    'docs/scratchpad.md',
    'docs/**/*.md',
    'README.md'
  ];
  
  const foundReferences = new Map();
  
  for (const pattern of referenceFiles) {
    try {
      const files = await glob(pattern, { cwd: process.cwd() });
      
      for (const file of files) {
        // Skip implementation plan files themselves
        if (file.includes('implementation-plan/') && file.endsWith('.md')) {
          continue;
        }
        
        const content = await fs.readFile(file, 'utf8');
        let hasReferences = false;
        
        // Check for timestamp ID references
        for (const item of rollbackPlan) {
          const timestampPattern = new RegExp(`\\b${item.timestampId}\\b`, 'g');
          if (timestampPattern.test(content)) {
            hasReferences = true;
            break;
          }
        }
        
        if (hasReferences) {
          foundReferences.set(file, content);
        }
      }
    } catch (error) {
      // Skip files that can't be accessed
      log(`⚠️  Warning: Cannot access ${pattern}`, 'verbose');
    }
  }
  
  return foundReferences;
}

// Update references back to numbered format
async function updateReferencesToNumbered(rollbackPlan, referenceFiles) {
  let totalChanges = 0;
  const updatedFiles = [];
  
  for (const [filePath, originalContent] of referenceFiles) {
    let content = originalContent;
    let fileModified = false;
    
    for (const item of rollbackPlan) {
      // Replace timestamp ID references with original numbers
      const patterns = [
        // Direct timestamp ID references
        new RegExp(`\\b${item.timestampId}\\b`, 'g'),
        // Implementation plan path references
        new RegExp(`implementation-plan/${item.timestampId}-`, 'g'),
        // Plan references
        new RegExp(`plan ${item.timestampId}(?!\\d)`, 'gi'),
        new RegExp(`plan #${item.timestampId}(?!\\d)`, 'gi')
      ];
      
      const replacements = [
        item.originalNumber,
        `implementation-plan/${item.originalNumber}-`,
        `plan ${item.originalNumber}`,
        `plan #${item.originalNumber}`
      ];
      
      for (let i = 0; i < patterns.length; i++) {
        const newContent = content.replace(patterns[i], replacements[i]);
        if (newContent !== content) {
          content = newContent;
          fileModified = true;
          totalChanges++;
        }
      }
    }
    
    if (fileModified) {
      await fs.writeFile(filePath, content);
      updatedFiles.push(filePath);
      log(`   Updated references in ${filePath}`, 'verbose');
    }
  }
  
  return { updatedFiles, totalChanges };
}

// Main rollback execution
async function performRollback() {
  const startTime = Date.now();
  
  try {
    log('🔄 Starting implementation plan rollback...');
    
    // Generate rollback plan
    const rollbackPlan = await generateRollbackPlan();
    
    if (rollbackPlan.length === 0) {
      console.log('ℹ️  No timestamp-based implementation plans found to rollback');
      console.log('   Repository appears to already be using numbered format');
      return;
    }
    
    log(`\n📋 Rollback Preview:`);
    log(`   Converting ${rollbackPlan.length} implementation plans back to numbered format\n`);
    
    // Show preview of changes
    for (const item of rollbackPlan.slice(0, 10)) {
      log(`   ${item.currentFileName}`);
      log(`   → ${item.originalFileName}\n`);
    }
    if (rollbackPlan.length > 10) {
      log(`   ... and ${rollbackPlan.length - 10} more files\n`);
    }
    
    // Scan for references
    const referencesToUpdate = await scanForReferencesToRollback(rollbackPlan);
    log(`🔍 Reference Updates:`);
    log(`   - ${referencesToUpdate.size} files with timestamp references to update\n`);
    
    if (isDryRun) {
      log('📋 DRY RUN MODE - No changes will be made');
      log('✅ Ready for rollback. Use --execute to proceed.');
      return;
    }
    
    // Create backup before rollback
    const backupDir = await createBackup();
    
    // Execute file renames
    log('\n📁 Renaming implementation plan files...');
    for (const item of rollbackPlan) {
      await fs.rename(item.currentPath, item.originalPath);
      log(`   ✓ ${item.currentFileName} → ${item.originalFileName}`, 'verbose');
    }
    log(`   ✅ Renamed ${rollbackPlan.length} files`);
    
    // Update references
    if (referencesToUpdate.size > 0) {
      log('\n📝 Updating references...');
      const { updatedFiles, totalChanges } = await updateReferencesToNumbered(rollbackPlan, referencesToUpdate);
      log(`   ✅ Updated ${totalChanges} references in ${updatedFiles.length} files`);
    }
    
    // Remove timestamp mapping file
    try {
      await fs.unlink(MAPPING_FILE);
      log('   ✅ Removed timestamp mapping file');
    } catch {
      // File doesn't exist, which is fine
    }
    
    const duration = Date.now() - startTime;
    log(`\n✅ Rollback complete in ${formatDuration(duration)}!`);
    log(`   - ${rollbackPlan.length} files renamed back to numbered format`);
    if (referencesToUpdate.size > 0) {
      log(`   - References updated in ${referencesToUpdate.size} files`);
    }
    log(`   - Backup created at: ${backupDir}`);
    log('\n📚 Next steps:');
    log('   - Repository is back to numbered implementation plan format');
    log('   - Use sequential numbers for new implementation plans');
    log('   - Remove backup directory when satisfied with rollback');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    log('\nℹ️  If partial rollback occurred, check backup directory for original files');
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  performRollback().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = {
  generateRollbackPlan,
  scanForReferencesToRollback,
  updateReferencesToNumbered,
  performRollback
};