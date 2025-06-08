#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * Comprehensive AI Server Lifecycle Tests
 * 
 * Tests various scenarios to ensure robust server management
 */
class AIServerLifecycleTests {
  constructor() {
    this.results = [];
    this.testCount = 0;
    this.passCount = 0;
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} [TEST] [${level}] ${message}`);
  }

  async runCommand(command) {
    try {
      const { stdout, stderr } = await execAsync(command, { 
        cwd: process.cwd(),
        timeout: 30000 // 30 second timeout
      });
      return { success: true, stdout, stderr };
    } catch (error) {
      return { success: false, error: error.message, stdout: error.stdout, stderr: error.stderr };
    }
  }

  async test(name, testFn) {
    this.testCount++;
    this.log(`Running test: ${name}`);
    
    try {
      await testFn();
      this.passCount++;
      this.results.push({ name, status: 'PASS' });
      this.log(`✅ ${name} - PASSED`);
    } catch (error) {
      this.results.push({ name, status: 'FAIL', error: error.message });
      this.log(`❌ ${name} - FAILED: ${error.message}`, 'ERROR');
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getServerStatus() {
    const result = await this.runCommand('node scripts/ai-server-manager.js status');
    if (result.success) {
      try {
        return JSON.parse(result.stdout);
      } catch (e) {
        throw new Error('Failed to parse status output: ' + result.stdout);
      }
    }
    throw new Error('Failed to get server status');
  }

  async runTests() {
    this.log('Starting AI Server Lifecycle Tests...');

    // Ensure clean start
    await this.runCommand('npm run cleanup:ai');

    // Test 1: Basic lifecycle test
    await this.test('Basic server lifecycle', async () => {
      // Start server
      const start = await this.runCommand('npm run start:ai');
      if (!start.success) throw new Error('Failed to start server');
      
      await this.sleep(2000);
      
      // Check status
      const status = await this.getServerStatus();
      if (!status.running) throw new Error('Server not running after start');
      if (!status.pid) throw new Error('No PID recorded');
      
      // Stop server
      const stop = await this.runCommand('npm run stop:ai');
      if (!stop.success) throw new Error('Failed to stop server');
      
      // Verify stopped
      const finalStatus = await this.getServerStatus();
      if (finalStatus.running) throw new Error('Server still running after stop');
    });

    // Test 2: Multiple start attempts
    await this.test('Multiple start attempts handling', async () => {
      // Start server
      const start1 = await this.runCommand('npm run start:ai');
      if (!start1.success) throw new Error('First start failed');
      
      await this.sleep(2000);
      
      // Try to start again - should detect already running
      const start2 = await this.runCommand('npm run start:ai');
      if (!start2.success) throw new Error('Second start failed');
      
      // Should still have only one server
      const status = await this.getServerStatus();
      if (!status.running) throw new Error('Server not running');
      
      // Cleanup
      await this.runCommand('npm run stop:ai');
    });

    // Test 3: Cleanup of orphaned processes
    await this.test('Orphaned process cleanup', async () => {
      // Start server
      await this.runCommand('npm run start:ai');
      await this.sleep(2000);
      
      // Get PID before simulating crash
      const statusBefore = await this.getServerStatus();
      const pid = statusBefore.pid;
      
      // Remove PID file to simulate crash/orphan
      await this.runCommand(`rm -f .next-ai/server.pid`);
      
      // Cleanup should still find and kill process
      const cleanup = await this.runCommand('npm run cleanup:ai');
      if (!cleanup.success) throw new Error('Cleanup failed');
      
      // Verify cleaned up
      const statusAfter = await this.getServerStatus();
      if (statusAfter.running) throw new Error('Server still running after cleanup');
      if (!statusAfter.portAvailable) throw new Error('Port still in use after cleanup');
    });

    // Test 4: Rapid start/stop cycles
    await this.test('Rapid start/stop cycles', async () => {
      for (let i = 0; i < 3; i++) {
        const start = await this.runCommand('npm run start:ai');
        if (!start.success) throw new Error(`Start failed on cycle ${i + 1}`);
        
        await this.sleep(1000);
        
        const stop = await this.runCommand('npm run stop:ai');
        if (!stop.success) throw new Error(`Stop failed on cycle ${i + 1}`);
        
        await this.sleep(500);
      }
      
      // Verify no lingering processes
      const finalStatus = await this.getServerStatus();
      if (finalStatus.running) throw new Error('Server still running after cycles');
      if (!finalStatus.portAvailable) throw new Error('Port still in use after cycles');
    });

    // Test 5: Concurrent command handling
    await this.test('Concurrent command handling', async () => {
      // Start server
      await this.runCommand('npm run start:ai');
      await this.sleep(2000);
      
      // Run multiple status checks concurrently
      const statusPromises = [];
      for (let i = 0; i < 5; i++) {
        statusPromises.push(this.getServerStatus());
      }
      
      const statuses = await Promise.all(statusPromises);
      
      // All should report the same state
      const firstPid = statuses[0].pid;
      for (const status of statuses) {
        if (status.pid !== firstPid) throw new Error('Inconsistent PID reported');
        if (!status.running) throw new Error('Inconsistent running state');
      }
      
      // Cleanup
      await this.runCommand('npm run stop:ai');
    });

    // Test 6: Test command reliability
    await this.test('Test command reliability', async () => {
      // Run test command multiple times
      for (let i = 0; i < 3; i++) {
        this.log(`Running test command iteration ${i + 1}/3`);
        const test = await this.runCommand('npm run test:ai');
        if (!test.success) throw new Error(`Test command failed on iteration ${i + 1}`);
        
        // Verify clean state after test
        const status = await this.getServerStatus();
        if (status.running) throw new Error('Server still running after test command');
        
        await this.sleep(1000);
      }
    });

    // Test 7: Developer + AI concurrent servers
    await this.test('Concurrent developer + AI servers', async () => {
      this.log('Starting developer server on port 3000...');
      // Start developer server in background
      const devServer = exec('npm run dev', { cwd: process.cwd() });
      
      await this.sleep(5000); // Wait for dev server to start
      
      // Start AI server
      const aiStart = await this.runCommand('npm run start:ai');
      if (!aiStart.success) throw new Error('AI server failed to start');
      
      await this.sleep(2000);
      
      // Check both ports
      const port3000 = await this.runCommand('lsof -ti :3000');
      const port3001 = await this.runCommand('lsof -ti :3001');
      
      if (!port3000.success || !port3000.stdout.trim()) {
        throw new Error('Developer server not running on port 3000');
      }
      if (!port3001.success || !port3001.stdout.trim()) {
        throw new Error('AI server not running on port 3001');
      }
      
      // Stop AI server
      await this.runCommand('npm run stop:ai');
      
      // Kill dev server
      devServer.kill('SIGTERM');
      await this.sleep(2000);
      devServer.kill('SIGKILL');
    });

    // Print results
    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('AI Server Lifecycle Test Results');
    console.log('='.repeat(60));
    
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.testCount}`);
    console.log(`Passed: ${this.passCount}`);
    console.log(`Failed: ${this.testCount - this.passCount}`);
    console.log(`Success Rate: ${((this.passCount / this.testCount) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));
    
    // Exit with appropriate code
    process.exit(this.passCount === this.testCount ? 0 : 1);
  }
}

// Run tests
if (require.main === module) {
  const tester = new AIServerLifecycleTests();
  tester.runTests().catch(error => {
    console.error('Fatal test error:', error);
    process.exit(1);
  });
}