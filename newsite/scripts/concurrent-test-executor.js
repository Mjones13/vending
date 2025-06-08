#!/usr/bin/env node
/**
 * Concurrent Test Executor
 * Advanced parallel test execution with intelligent load balancing and resource management
 */

const { spawn } = require('child_process')
const { performance } = require('perf_hooks')
const { Worker } = require('worker_threads')
const os = require('os')
const path = require('path')
const { TestRunnerMonitorIntegration, PerformanceMonitoring } = require('./monitoring-integration')

class ConcurrentTestExecutor {
  constructor(options = {}) {
    this.mode = options.mode || 'full'
    this.verbose = options.verbose || process.env.VERBOSE === 'true'
    this.maxConcurrency = this.getOptimalConcurrency()
    this.activeWorkers = new Map()
    this.completedTests = []
    this.failedTests = []
    this.startTime = performance.now()
    this.systemInfo = this.gatherSystemInfo()
    
    // Initialize monitoring integration
    this.monitoring = new TestRunnerMonitorIntegration('concurrent-test-executor', {
      type: 'concurrent-executor',
      mode: this.mode,
      maxConcurrency: this.maxConcurrency,
      systemInfo: this.systemInfo,
    })
  }

  gatherSystemInfo() {
    const cpus = os.cpus()
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpuCount: cpus.length,
      cpuModel: cpus[0]?.model || 'Unknown',
      isM2: cpus[0]?.model?.includes('Apple') && os.arch() === 'arm64',
      totalMemoryGB: (totalMemory / (1024 ** 3)).toFixed(2),
      freeMemoryGB: (freeMemory / (1024 ** 3)).toFixed(2),
      nodeVersion: process.version,
    }
  }

  getOptimalConcurrency() {
    const cpuCount = os.cpus().length
    
    if (this.systemInfo.isM2) {
      // M2 MacBook optimization
      switch (this.mode) {
        case 'fast': return Math.max(2, Math.floor(cpuCount * 0.5))
        case 'full': return Math.max(3, Math.floor(cpuCount * 0.75))
        default: return Math.max(2, Math.floor(cpuCount * 0.6))
      }
    }
    
    // Conservative approach for other systems
    switch (this.mode) {
      case 'fast': return Math.max(1, Math.floor(cpuCount * 0.3))
      case 'full': return Math.max(2, Math.floor(cpuCount * 0.5))
      default: return Math.max(1, Math.floor(cpuCount * 0.4))
    }
  }

  getTestConfiguration() {
    const configs = {
      fast: {
        name: 'Fast Feedback',
        description: 'Quick validation for immediate feedback',
        maxDuration: 15000, // 15 seconds
        testSuites: [
          {
            name: 'Linting',
            command: 'npm',
            args: ['run', 'lint'],
            priority: 1,
            expectedDuration: 3000,
          },
          {
            name: 'Type Check',
            command: 'npm',
            args: ['run', 'type-check'],
            priority: 2,
            expectedDuration: 5000,
          },
          {
            name: 'Critical Tests',
            command: 'npm',
            args: ['run', 'test:critical-path'],
            priority: 3,
            expectedDuration: 7000,
          },
        ],
      },
      full: {
        name: 'Comprehensive Testing',
        description: 'Full parallel test suite execution',
        maxDuration: 90000, // 90 seconds
        testSuites: [
          {
            name: 'Unit Tests',
            command: 'npm',
            args: ['run', 'test:unit'],
            priority: 1,
            expectedDuration: 15000,
          },
          {
            name: 'Integration Tests',
            command: 'npm',
            args: ['run', 'test:integration'],
            priority: 2,
            expectedDuration: 25000,
          },
          {
            name: 'Animation Tests',
            command: 'npm',
            args: ['run', 'test:animations'],
            priority: 3,
            expectedDuration: 20000,
          },
          {
            name: 'E2E Critical',
            command: 'npm',
            args: ['run', 'test:e2e:critical'],
            priority: 4,
            expectedDuration: 30000,
          },
        ],
      },
    }

    return configs[this.mode] || configs.full
  }

  async executeTestSuite(suite) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now()
      const workerId = `suite_${suite.name}_${Date.now()}`
      
      // Report worker start to monitoring
      this.monitoring.reportWorkerStart(workerId, {
        suiteName: suite.name,
        command: suite.command,
        args: suite.args,
        priority: suite.priority,
        expectedDuration: suite.expectedDuration,
      })
      
      if (this.verbose) {
        console.log(`🚀 Starting ${suite.name}...`)
      }

      const child = spawn(suite.command, suite.args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          // Optimize Jest workers for this test suite
          JEST_MAX_WORKERS: this.systemInfo.isM2 ? '75%' : '50%',
          // Add test suite identifier for monitoring
          TEST_SUITE_NAME: suite.name,
          WORKER_ID: workerId,
        },
      })

      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (data) => {
        stdout += data
        if (this.verbose) {
          process.stdout.write(`[${suite.name}] ${data}`)
        }
      })

      child.stderr.on('data', (data) => {
        stderr += data
        if (this.verbose) {
          process.stderr.write(`[${suite.name}] ${data}`)
        }
      })

      // Timeout handling
      const timeout = setTimeout(() => {
        child.kill('SIGTERM')
        reject(new Error(`${suite.name} timed out after ${suite.expectedDuration * 2}ms`))
      }, suite.expectedDuration * 2)

      child.on('close', (code) => {
        clearTimeout(timeout)
        const duration = performance.now() - startTime
        
        const result = {
          name: suite.name,
          code,
          duration,
          stdout,
          stderr,
          priority: suite.priority,
          expectedDuration: suite.expectedDuration,
          performanceRatio: duration / suite.expectedDuration,
          success: code === 0,
        }

        // Report worker end to monitoring
        this.monitoring.reportWorkerEnd(workerId, {
          success: code === 0,
          exitCode: code,
          duration,
          performanceRatio: result.performanceRatio,
          stdout: stdout.length,
          stderr: stderr.length,
        })

        if (code === 0) {
          this.completedTests.push(result)
          if (this.verbose) {
            console.log(`✅ ${suite.name} completed in ${(duration / 1000).toFixed(2)}s`)
          }
          resolve(result)
        } else {
          this.failedTests.push(result)
          if (this.verbose) {
            console.log(`❌ ${suite.name} failed in ${(duration / 1000).toFixed(2)}s (exit code: ${code})`)
          }
          
          // Report error to monitoring
          const error = new Error(`${suite.name} failed with exit code ${code}`)
          error.suite = suite.name
          error.exitCode = code
          error.stderr = stderr
          this.monitoring.reportError(error)
          
          reject(error)
        }
      })

      child.on('error', (error) => {
        clearTimeout(timeout)
        reject(new Error(`${suite.name} execution error: ${error.message}`))
      })
    })
  }

  async executeWithLoadBalancing(testSuites) {
    const config = this.getTestConfiguration()
    
    console.log(`🎯 ${config.name}: ${config.description}`)
    console.log(`📊 System: ${this.systemInfo.cpuModel} (${this.systemInfo.cpuCount} cores)`)
    console.log(`💾 Memory: ${this.systemInfo.freeMemoryGB}GB / ${this.systemInfo.totalMemoryGB}GB available`)
    console.log(`⚡ Concurrency: ${this.maxConcurrency} parallel workers`)
    
    if (this.systemInfo.isM2) {
      console.log('🍎 M2 MacBook optimizations enabled')
    }

    // Sort test suites by priority and expected duration for optimal scheduling
    const sortedSuites = testSuites.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority
      return a.expectedDuration - b.expectedDuration
    })

    // Execute tests with controlled concurrency
    const results = []
    const activePromises = []

    for (const suite of sortedSuites) {
      // Wait if we've reached max concurrency
      if (activePromises.length >= this.maxConcurrency) {
        const completed = await Promise.race(activePromises)
        const completedIndex = activePromises.findIndex(p => p === completed)
        activePromises.splice(completedIndex, 1)
        results.push(await completed)
      }

      // Start new test suite
      const promise = this.executeTestSuite(suite)
      activePromises.push(promise)
    }

    // Wait for remaining tests to complete
    const remainingResults = await Promise.allSettled(activePromises)
    results.push(...remainingResults.map(r => r.value).filter(Boolean))

    return results
  }

  generatePerformanceReport() {
    const totalDuration = (performance.now() - this.startTime) / 1000
    const totalTests = this.completedTests.length + this.failedTests.length
    const successRate = (this.completedTests.length / totalTests) * 100

    console.log('\n' + '='.repeat(60))
    console.log('📈 CONCURRENT TEST EXECUTION REPORT')
    console.log('='.repeat(60))
    
    console.log(`🏁 Total Execution Time: ${totalDuration.toFixed(2)}s`)
    console.log(`📊 Tests Run: ${totalTests}`)
    console.log(`✅ Passed: ${this.completedTests.length}`)
    console.log(`❌ Failed: ${this.failedTests.length}`)
    console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`)

    console.log('\n📋 Test Suite Performance:')
    console.log('-'.repeat(60))
    
    const allTests = [...this.completedTests, ...this.failedTests]
    allTests.forEach(test => {
      const status = test.code === 0 ? '✅' : '❌'
      const duration = (test.duration / 1000).toFixed(2)
      const performance = test.performanceRatio?.toFixed(2) || 'N/A'
      
      console.log(`${status} ${test.name.padEnd(20)} ${duration}s (${performance}x expected)`)
    })

    // Performance insights
    console.log('\n🔍 Performance Insights:')
    console.log('-'.repeat(60))
    
    const avgPerformanceRatio = allTests.reduce((sum, test) => 
      sum + (test.performanceRatio || 1), 0) / allTests.length
    
    if (avgPerformanceRatio < 0.8) {
      console.log('🚀 Excellent: Tests running faster than expected!')
    } else if (avgPerformanceRatio > 1.5) {
      console.log('⚠️  Warning: Tests running slower than expected')
      console.log('   Consider optimizing test performance or adjusting expectations')
    } else {
      console.log('✨ Good: Test performance within expected ranges')
    }

    if (this.systemInfo.isM2) {
      console.log(`🍎 M2 Optimization: Utilized ${this.maxConcurrency}/${this.systemInfo.cpuCount} cores`)
    }

    console.log('='.repeat(60))
  }

  async run() {
    const sessionId = this.monitoring.startSession({
      mode: this.mode,
      maxConcurrency: this.maxConcurrency,
      systemInfo: this.systemInfo,
    })
    
    try {
      const config = this.getTestConfiguration()
      
      // Report initial progress
      this.monitoring.reportProgress({
        stage: 'starting',
        totalSuites: config.testSuites.length,
        mode: this.mode,
      })
      
      await this.executeWithLoadBalancing(config.testSuites)
      
      this.generatePerformanceReport()
      
      const success = this.failedTests.length === 0
      
      // End monitoring session
      this.monitoring.endSession({
        success,
        totalSuites: this.completedTests.length + this.failedTests.length,
        completedSuites: this.completedTests.length,
        failedSuites: this.failedTests.length,
        totalDuration: performance.now() - this.startTime,
      })
      
      if (this.failedTests.length > 0) {
        console.log('\n❌ Some tests failed. Check the details above.')
        process.exit(1)
      } else {
        console.log('\n✅ All tests passed successfully!')
        process.exit(0)
      }
    } catch (error) {
      console.error('\n💥 Concurrent test execution failed:', error.message)
      
      // Report error and end session
      this.monitoring.reportError(error)
      this.monitoring.endSession({
        success: false,
        error: error.message,
        totalDuration: performance.now() - this.startTime,
      })
      
      this.generatePerformanceReport()
      process.exit(1)
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2)
  const modeFlag = args.find(arg => arg.startsWith('--mode='))
  const mode = modeFlag ? modeFlag.split('=')[1] : 'full'
  const verbose = args.includes('--verbose') || process.env.VERBOSE === 'true'

  const executor = new ConcurrentTestExecutor({ mode, verbose })
  executor.run().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

module.exports = ConcurrentTestExecutor