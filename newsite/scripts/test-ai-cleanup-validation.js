#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const execAsync = promisify(exec);

/**
 * AI Server Cleanup Validation Tests
 * 
 * Tests various cleanup scenarios to ensure reliability
 */
class AICleanupValidationTests {
  constructor() {
    this.results = [];
    this.AI_PORT = 3001;
    this.PID_FILE = path.join(__dirname, '..', '.next-ai', 'server.pid');
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} [CLEANUP-TEST] [${level}] ${message}`);
  }

  async runCommand(command) {
    try {
      const { stdout, stderr } = await execAsync(command, { 
        cwd: process.cwd(),
        timeout: 15000
      });
      return { success: true, stdout, stderr };
    } catch (error) {
      return { success: false, error: error.message, stdout: error.stdout, stderr: error.stderr };
    }
  }

  async test(name, testFn) {
    this.log(`Running test: ${name}`);
    
    try {
      await testFn();
      this.results.push({ name, status: 'PASS' });
      this.log(`✅ ${name} - PASSED`);
      return true;
    } catch (error) {
      this.results.push({ name, status: 'FAIL', error: error.message });
      this.log(`❌ ${name} - FAILED: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fileExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async getProcessOnPort(port) {
    const result = await this.runCommand(`lsof -ti :${port}`);
    if (result.success && result.stdout.trim()) {
      return parseInt(result.stdout.trim());
    }
    return null;
  }

  async runTests() {
    this.log('Starting AI Server Cleanup Validation Tests...');

    // Ensure clean start
    await this.runCommand('npm run cleanup:ai');

    // Test 1: Cleanup with no server running
    await this.test('Cleanup with no server running', async () => {
      const result = await this.runCommand('npm run cleanup:ai');
      if (!result.success) throw new Error('Cleanup failed when no server running');
      
      // Should complete successfully even with nothing to clean
      if (!result.stdout.includes('Cleanup successful')) {
        throw new Error('Cleanup did not report success');
      }
    });

    // Test 2: Cleanup orphaned process (no PID file)
    await this.test('Cleanup orphaned process without PID file', async () => {
      // Start a rogue Next.js process directly
      const rogue = spawn('npx', ['next', 'dev', '--port', this.AI_PORT], {
        cwd: process.cwd(),
        detached: true,
        stdio: 'ignore'
      });
      rogue.unref();
      
      await this.sleep(5000); // Wait for server to start
      
      // Verify process is running
      const pid = await this.getProcessOnPort(this.AI_PORT);
      if (!pid) throw new Error('Failed to start orphaned process');
      
      // Run cleanup
      const cleanup = await this.runCommand('npm run cleanup:ai');
      if (!cleanup.success) throw new Error('Cleanup command failed');
      
      // Verify process was killed
      await this.sleep(1000);
      const pidAfter = await this.getProcessOnPort(this.AI_PORT);
      if (pidAfter) throw new Error('Orphaned process still running after cleanup');
    });

    // Test 3: Cleanup with corrupted PID file
    await this.test('Cleanup with corrupted PID file', async () => {
      // Start server normally
      await this.runCommand('npm run start:ai');
      await this.sleep(3000);
      
      // Corrupt the PID file
      const pidDir = path.dirname(this.PID_FILE);
      await fs.mkdir(pidDir, { recursive: true });
      await fs.writeFile(this.PID_FILE, 'not-a-number');
      
      // Run cleanup
      const cleanup = await this.runCommand('npm run cleanup:ai');
      if (!cleanup.success) throw new Error('Cleanup failed with corrupted PID file');
      
      // Verify port is free
      const pid = await this.getProcessOnPort(this.AI_PORT);
      if (pid) throw new Error('Process still running after cleanup');
    });

    // Test 4: Cleanup with wrong PID in file
    await this.test('Cleanup with incorrect PID file', async () => {
      // Start server
      await this.runCommand('npm run start:ai');
      await this.sleep(3000);
      
      // Write wrong PID to file
      const pidDir = path.dirname(this.PID_FILE);
      await fs.mkdir(pidDir, { recursive: true });
      await fs.writeFile(this.PID_FILE, '99999'); // Non-existent PID
      
      // Run cleanup - should still find process by port
      const cleanup = await this.runCommand('npm run cleanup:ai');
      if (!cleanup.success) throw new Error('Cleanup failed with wrong PID');
      
      // Verify cleaned up
      const pid = await this.getProcessOnPort(this.AI_PORT);
      if (pid) throw new Error('Process still running after cleanup');
    });

    // Test 5: Multiple cleanup calls
    await this.test('Multiple consecutive cleanup calls', async () => {
      // Start server
      await this.runCommand('npm run start:ai');
      await this.sleep(3000);
      
      // Run cleanup multiple times
      for (let i = 0; i < 3; i++) {
        const cleanup = await this.runCommand('npm run cleanup:ai');
        if (!cleanup.success) throw new Error(`Cleanup ${i + 1} failed`);
      }
      
      // All should succeed without errors
      const pid = await this.getProcessOnPort(this.AI_PORT);
      if (pid) throw new Error('Process still running after multiple cleanups');
    });

    // Test 6: Cleanup during server startup
    await this.test('Cleanup during server startup', async () => {
      // Start server but don't wait
      const startPromise = this.runCommand('npm run start:ai');
      
      // Immediately try to cleanup
      await this.sleep(500); // Small delay to let spawn happen
      const cleanup = await this.runCommand('npm run cleanup:ai');
      
      // Wait for start to complete/fail
      await startPromise.catch(() => {}); // Ignore error
      
      // Verify cleaned up
      await this.sleep(1000);
      const pid = await this.getProcessOnPort(this.AI_PORT);
      if (pid) throw new Error('Process still running after cleanup during startup');
    });

    // Test 7: Stress test - rapid cleanup cycles
    await this.test('Stress test - rapid cleanup cycles', async () => {
      const cycles = 5;
      
      for (let i = 0; i < cycles; i++) {
        // Start server
        await this.runCommand('npm run start:ai');
        await this.sleep(1000);
        
        // Immediate cleanup
        const cleanup = await this.runCommand('npm run cleanup:ai');
        if (!cleanup.success) throw new Error(`Cleanup failed on cycle ${i + 1}`);
      }
      
      // Final verification
      const pid = await this.getProcessOnPort(this.AI_PORT);
      if (pid) throw new Error('Process still running after stress test');
      
      const pidFileExists = await this.fileExists(this.PID_FILE);
      if (pidFileExists) throw new Error('PID file still exists after stress test');
    });

    // Print results
    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('AI Server Cleanup Validation Results');
    console.log('='.repeat(60));
    
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    const passCount = this.results.filter(r => r.status === 'PASS').length;
    const totalCount = this.results.length;
    
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalCount}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${totalCount - passCount}`);
    console.log(`Success Rate: ${((passCount / totalCount) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));
    
    // Exit with appropriate code
    process.exit(passCount === totalCount ? 0 : 1);
  }
}

// Run tests
if (require.main === module) {
  const tester = new AICleanupValidationTests();
  tester.runTests().catch(error => {
    console.error('Fatal test error:', error);
    process.exit(1);
  });
}