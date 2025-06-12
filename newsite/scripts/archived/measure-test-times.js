#!/usr/bin/env node
/**
 * Simple script to measure test execution times
 */

const { spawn } = require('child_process');
const { performance } = require('perf_hooks');

async function measureCommand(name, command, args = []) {
  console.log(`\n📊 Measuring: ${name}`);
  console.log(`Command: ${command} ${args.join(' ')}`);
  
  const startTime = performance.now();
  
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      const status = code === 0 ? '✅' : '❌';
      
      console.log(`${status} ${name}: ${duration}s (exit code: ${code})`);
      
      resolve({
        name,
        duration: parseFloat(duration),
        exitCode: code,
        success: code === 0
      });
    });

    child.on('error', (error) => {
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      console.log(`❌ ${name}: ${duration}s (error: ${error.message})`);
      
      resolve({
        name,
        duration: parseFloat(duration),
        exitCode: -1,
        success: false,
        error: error.message
      });
    });
  });
}

async function main() {
  console.log('🎯 Test Execution Time Measurement');
  console.log('='.repeat(50));
  
  const results = [];
  
  // Pre-commit tests (fast)
  console.log('\n🚀 Pre-commit Tests (Fast Feedback)');
  console.log('-'.repeat(50));
  
  const preCommitTests = [
    { name: 'Linting', command: 'npm', args: ['run', 'lint'] },
    { name: 'Type Check', command: 'npm', args: ['run', 'type-check'] },
    { name: 'Critical Tests', command: 'npm', args: ['run', 'test:critical-path'] }
  ];
  
  for (const test of preCommitTests) {
    const result = await measureCommand(test.name, test.command, test.args);
    results.push({ ...result, phase: 'pre-commit' });
  }
  
  // Pre-push tests (comprehensive)
  console.log('\n🔥 Pre-push Tests (Comprehensive)');
  console.log('-'.repeat(50));
  
  const prePushTests = [
    { name: 'Unit Tests', command: 'npm', args: ['run', 'test:unit'] },
    { name: 'Integration Tests', command: 'npm', args: ['run', 'test:integration'] },
    { name: 'Animation Tests', command: 'npm', args: ['run', 'test:animations'] },
    { name: 'Critical E2E', command: 'npm', args: ['run', 'test:e2e:critical'] },
    { name: 'Build', command: 'npm', args: ['run', 'build'] }
  ];
  
  for (const test of prePushTests) {
    const result = await measureCommand(test.name, test.command, test.args);
    results.push({ ...result, phase: 'pre-push' });
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📈 EXECUTION TIME SUMMARY');
  console.log('='.repeat(50));
  
  // Pre-commit summary
  const preCommitResults = results.filter(r => r.phase === 'pre-commit');
  const preCommitTotal = preCommitResults.reduce((sum, r) => sum + r.duration, 0);
  const preCommitSuccess = preCommitResults.every(r => r.success);
  
  console.log('\n🚀 Pre-commit Phase:');
  preCommitResults.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`  ${status} ${r.name}: ${r.duration}s`);
  });
  console.log(`  Total: ${preCommitTotal.toFixed(2)}s`);
  console.log(`  Status: ${preCommitSuccess ? '✅ All passed' : '❌ Some failed'}`);
  
  // Pre-push summary
  const prePushResults = results.filter(r => r.phase === 'pre-push');
  const prePushTotal = prePushResults.reduce((sum, r) => sum + r.duration, 0);
  const prePushSuccess = prePushResults.every(r => r.success);
  
  console.log('\n🔥 Pre-push Phase:');
  prePushResults.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`  ${status} ${r.name}: ${r.duration}s`);
  });
  console.log(`  Total: ${prePushTotal.toFixed(2)}s`);
  console.log(`  Status: ${prePushSuccess ? '✅ All passed' : '❌ Some failed'}`);
  
  // Overall summary
  console.log('\n📊 Overall Statistics:');
  console.log(`  Total execution time: ${(preCommitTotal + prePushTotal).toFixed(2)}s`);
  console.log(`  Average test duration: ${(results.reduce((sum, r) => sum + r.duration, 0) / results.length).toFixed(2)}s`);
  console.log(`  Longest test: ${results.reduce((max, r) => r.duration > max.duration ? r : max).name} (${results.reduce((max, r) => r.duration > max.duration ? r : max).duration}s)`);
  
  // Save results to file
  const fs = require('fs');
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    systemInfo: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      cpus: require('os').cpus().length
    },
    results,
    summary: {
      preCommit: {
        total: preCommitTotal,
        success: preCommitSuccess,
        tests: preCommitResults.length
      },
      prePush: {
        total: prePushTotal,
        success: prePushSuccess,
        tests: prePushResults.length
      }
    }
  };
  
  fs.writeFileSync('test-timing-report.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Report saved to test-timing-report.json');
  
  console.log('='.repeat(50));
}

// Run the measurement
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});