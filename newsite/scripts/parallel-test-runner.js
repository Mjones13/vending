#!/usr/bin/env node
/**
 * Parallel Test Runner
 * Manages concurrent test execution with performance monitoring
 */

const { spawn } = require('child_process');
const { performance } = require('perf_hooks');
const os = require('os');

class ParallelTestRunner {
  constructor() {
    this.startTime = performance.now();
    this.processes = [];
    this.results = {};
    this.isM2 = this.detectM2MacBook();
  }

  detectM2MacBook() {
    try {
      const cpus = os.cpus();
      const platform = os.platform();
      const arch = os.arch();
      
      // Enhanced M2 detection
      const isAppleSilicon = arch === 'arm64' && platform === 'darwin';
      const hasAppleCPU = cpus[0]?.model?.includes('Apple');
      const hasEnoughCores = cpus.length >= 8;
      
      return isAppleSilicon && hasAppleCPU && hasEnoughCores;
    } catch {
      return false;
    }
  }
  
  getOptimalWorkerCount() {
    const cpus = os.cpus().length;
    
    if (this.isM2) {
      // M2 optimization: use 75% of cores for optimal performance
      return Math.max(1, Math.floor(cpus * 0.75));
    }
    
    // Conservative approach for other systems
    return Math.max(1, Math.floor(cpus * 0.5));
  }
  
  checkSystemResources() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = (totalMemory - freeMemory) / totalMemory;
    const loadAvg = os.loadavg()[0];
    
    return {
      memoryUsage: memoryUsage * 100,
      cpuLoad: loadAvg,
      availableMemoryGB: freeMemory / (1024 * 1024 * 1024),
      canRunParallel: memoryUsage < 0.8 && loadAvg < os.cpus().length * 0.8
    };
  }

  async runCommand(name, command, args = []) {
    return new Promise((resolve, reject) => {
      console.log(`🚀 Starting ${name}...`);
      const startTime = performance.now();
      
      const child = spawn(command, args, {
        stdio: 'pipe',
        shell: true,
        env: { 
          ...process.env,
          // Optimize Jest for M2 if detected
          ...(this.isM2 && { JEST_MAX_WORKERS: '75%' })
        }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data;
        // Show real-time output for better UX
        if (process.env.VERBOSE) {
          process.stdout.write(`[${name}] ${data}`);
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data;
        if (process.env.VERBOSE) {
          process.stderr.write(`[${name}] ${data}`);
        }
      });

      child.on('close', (code) => {
        const duration = ((performance.now() - startTime) / 1000).toFixed(2);
        
        this.results[name] = {
          code,
          duration: parseFloat(duration),
          stdout,
          stderr
        };

        if (code === 0) {
          console.log(`✅ ${name} completed in ${duration}s`);
          resolve(this.results[name]);
        } else {
          console.log(`❌ ${name} failed in ${duration}s (exit code: ${code})`);
          reject(new Error(`${name} failed with exit code ${code}\n${stderr}`));
        }
      });

      this.processes.push(child);
    });
  }

  async runParallel(commands) {
    const resources = this.checkSystemResources();
    const optimalWorkers = this.getOptimalWorkerCount();
    
    console.log(`🔥 Running ${commands.length} test suites in parallel...`);
    
    if (this.isM2) {
      console.log('🍎 M2 MacBook detected - optimizing for performance');
      console.log(`   Optimal workers: ${optimalWorkers}`);
    }
    
    console.log(`📊 System Resources:`);
    console.log(`   Memory usage: ${resources.memoryUsage.toFixed(1)}%`);
    console.log(`   CPU load: ${resources.cpuLoad.toFixed(2)}`);
    console.log(`   Available memory: ${resources.availableMemoryGB.toFixed(1)}GB`);
    
    if (!resources.canRunParallel) {
      console.log('⚠️  High system load detected - running sequentially for stability');
      return this.runSequential(commands);
    }

    try {
      const promises = commands.map(({ name, command, args }) => 
        this.runCommand(name, command, args)
      );

      await Promise.all(promises);
      this.showSummary();
      return true;
    } catch (error) {
      this.showSummary();
      throw error;
    }
  }

  async runSequential(commands) {
    console.log(`⚡ Running ${commands.length} commands sequentially...`);

    for (const { name, command, args } of commands) {
      await this.runCommand(name, command, args);
    }

    this.showSummary();
  }

  showSummary() {
    const totalDuration = ((performance.now() - this.startTime) / 1000).toFixed(2);
    
    console.log('\n📊 Test Execution Summary:');
    console.log('=' * 50);
    
    Object.entries(this.results).forEach(([name, result]) => {
      const status = result.code === 0 ? '✅' : '❌';
      console.log(`${status} ${name}: ${result.duration}s`);
    });
    
    console.log(`\n⏱️  Total execution time: ${totalDuration}s`);
    
    if (this.isM2) {
      const cpuUsage = os.loadavg()[0];
      console.log(`🔥 CPU load average: ${cpuUsage.toFixed(2)}`);
      console.log(`💾 Memory usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  killAll() {
    this.processes.forEach(proc => {
      try {
        proc.kill('SIGTERM');
      } catch (e) {
        // Process might already be dead
      }
    });
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Interrupted - cleaning up...');
  if (global.testRunner) {
    global.testRunner.killAll();
  }
  process.exit(1);
});

module.exports = ParallelTestRunner;

// CLI usage
if (require.main === module) {
  const runner = new ParallelTestRunner();
  global.testRunner = runner;

  const mode = process.argv[2] || 'pre-commit';

  if (mode === 'pre-commit') {
    // Fast pre-commit validation
    runner.runParallel([
      { name: 'Linting', command: 'npm', args: ['run', 'lint'] },
      { name: 'Type Check', command: 'npm', args: ['run', 'type-check'] },
      { name: 'Critical Tests', command: 'npm', args: ['run', 'test:critical-path'] }
    ]).catch(() => process.exit(1));
  } else if (mode === 'pre-push') {
    // Comprehensive pre-push validation
    runner.runSequential([
      { name: 'Parallel Tests', command: 'npm', args: ['run', 'test:parallel'] },
      { name: 'Critical E2E', command: 'npm', args: ['run', 'test:e2e:critical'] },
      { name: 'Build', command: 'npm', args: ['run', 'build'] }
    ]).catch(() => process.exit(1));
  } else {
    console.error('Usage: node scripts/parallel-test-runner.js [pre-commit|pre-push]');
    process.exit(1);
  }
}