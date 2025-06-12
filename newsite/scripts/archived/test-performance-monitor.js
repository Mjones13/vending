#!/usr/bin/env node
/**
 * Test Performance Monitor
 * Tracks and analyzes test execution performance over time
 */

const { spawn } = require('child_process')
const { performance } = require('perf_hooks')
const os = require('os')
const fs = require('fs')
const path = require('path')

class TestPerformanceMonitor {
  constructor() {
    this.systemInfo = this.gatherSystemInfo()
    this.metrics = []
    this.baselineMetrics = this.loadBaseline()
    this.startTime = performance.now()
    this.monitoringInterval = null
  }

  gatherSystemInfo() {
    const cpus = os.cpus()
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpuCount: cpus.length,
      cpuModel: cpus[0]?.model || 'Unknown',
      isM2: cpus[0]?.model?.includes('Apple') && os.arch() === 'arm64',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    }
  }

  loadBaseline() {
    const baselinePath = path.join(__dirname, '../.test-performance-baseline.json')
    try {
      if (fs.existsSync(baselinePath)) {
        return JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
      }
    } catch (error) {
      console.warn('⚠️  Could not load performance baseline:', error.message)
    }
    return null
  }

  saveBaseline(metrics) {
    const baselinePath = path.join(__dirname, '../.test-performance-baseline.json')
    try {
      fs.writeFileSync(baselinePath, JSON.stringify(metrics, null, 2))
      console.log('💾 Performance baseline saved')
    } catch (error) {
      console.warn('⚠️  Could not save performance baseline:', error.message)
    }
  }

  startSystemMonitoring() {
    const samples = []
    
    this.monitoringInterval = setInterval(() => {
      const sample = {
        timestamp: Date.now(),
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
        loadAverage: os.loadavg()[0],
        freeMemory: os.freemem(),
      }
      samples.push(sample)
    }, 1000) // Sample every second

    return () => {
      clearInterval(this.monitoringInterval)
      return samples
    }
  }

  async monitorTestExecution(testCommand, args = []) {
    const stopMonitoring = this.startSystemMonitoring()
    const startTime = performance.now()
    
    console.log(`🔍 Monitoring test execution: ${testCommand} ${args.join(' ')}`)
    
    return new Promise((resolve, reject) => {
      const child = spawn(testCommand, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PERFORMANCE_MONITORING: 'true',
        },
      })

      let stdout = ''
      let stderr = ''
      let testResults = {
        passed: 0,
        failed: 0,
        total: 0,
        duration: 0,
      }

      child.stdout.on('data', (data) => {
        stdout += data
        process.stdout.write(data) // Show real-time output
        
        // Parse Jest output for test counts
        const testMatch = data.toString().match(/Tests:\s*(\d+)\s*failed,\s*(\d+)\s*passed,\s*(\d+)\s*total/)
        if (testMatch) {
          testResults.failed = parseInt(testMatch[1])
          testResults.passed = parseInt(testMatch[2])
          testResults.total = parseInt(testMatch[3])
        }
      })

      child.stderr.on('data', (data) => {
        stderr += data
        process.stderr.write(data)
      })

      child.on('close', (code) => {
        const endTime = performance.now()
        const duration = endTime - startTime
        const systemSamples = stopMonitoring()

        const metrics = {
          command: `${testCommand} ${args.join(' ')}`,
          exitCode: code,
          duration,
          testResults: {
            ...testResults,
            duration: duration / 1000,
          },
          systemMetrics: this.analyzeSystemSamples(systemSamples),
          systemInfo: this.systemInfo,
          timestamp: new Date().toISOString(),
        }

        this.metrics.push(metrics)

        if (code === 0) {
          resolve(metrics)
        } else {
          reject(new Error(`Test execution failed with exit code ${code}`))
        }
      })

      child.on('error', (error) => {
        stopMonitoring()
        reject(error)
      })
    })
  }

  analyzeSystemSamples(samples) {
    if (samples.length === 0) return null

    const cpuTimes = samples.map(s => s.cpuUsage.user + s.cpuUsage.system)
    const memoryUsages = samples.map(s => s.memoryUsage.heapUsed)
    const loadAverages = samples.map(s => s.loadAverage)

    return {
      duration: samples.length,
      cpu: {
        average: this.average(cpuTimes),
        peak: Math.max(...cpuTimes),
        min: Math.min(...cpuTimes),
      },
      memory: {
        averageMB: this.average(memoryUsages) / (1024 * 1024),
        peakMB: Math.max(...memoryUsages) / (1024 * 1024),
        minMB: Math.min(...memoryUsages) / (1024 * 1024),
      },
      loadAverage: {
        average: this.average(loadAverages),
        peak: Math.max(...loadAverages),
        min: Math.min(...loadAverages),
      },
    }
  }

  average(numbers) {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  }

  compareWithBaseline(currentMetrics) {
    if (!this.baselineMetrics) {
      console.log('📊 No baseline found - current run will be used as baseline')
      return null
    }

    const comparison = {
      durationChange: (currentMetrics.duration - this.baselineMetrics.duration) / this.baselineMetrics.duration * 100,
      testCountChange: (currentMetrics.testResults.total - this.baselineMetrics.testResults.total),
      memoryChange: currentMetrics.systemMetrics ? 
        (currentMetrics.systemMetrics.memory.averageMB - (this.baselineMetrics.systemMetrics?.memory?.averageMB || 0)) : 0,
    }

    return comparison
  }

  generatePerformanceReport() {
    console.log('\n' + '='.repeat(70))
    console.log('📈 TEST PERFORMANCE MONITORING REPORT')
    console.log('='.repeat(70))

    if (this.metrics.length === 0) {
      console.log('No metrics collected')
      return
    }

    const latestMetrics = this.metrics[this.metrics.length - 1]
    
    console.log(`🖥️  System: ${this.systemInfo.cpuModel} (${this.systemInfo.cpuCount} cores)`)
    if (this.systemInfo.isM2) {
      console.log('🍎 M2 MacBook detected')
    }
    console.log(`📅 Run Time: ${new Date().toLocaleString()}`)

    console.log('\n📊 Test Execution Metrics:')
    console.log('-'.repeat(50))
    console.log(`⏱️  Duration: ${(latestMetrics.duration / 1000).toFixed(2)}s`)
    console.log(`✅ Tests Passed: ${latestMetrics.testResults.passed}`)
    console.log(`❌ Tests Failed: ${latestMetrics.testResults.failed}`)
    console.log(`📈 Total Tests: ${latestMetrics.testResults.total}`)
    console.log(`📊 Success Rate: ${((latestMetrics.testResults.passed / latestMetrics.testResults.total) * 100).toFixed(1)}%`)

    if (latestMetrics.systemMetrics) {
      console.log('\n💾 Resource Usage:')
      console.log('-'.repeat(50))
      console.log(`🧠 Average Memory: ${latestMetrics.systemMetrics.memory.averageMB.toFixed(1)}MB`)
      console.log(`📈 Peak Memory: ${latestMetrics.systemMetrics.memory.peakMB.toFixed(1)}MB`)
      console.log(`⚡ Average Load: ${latestMetrics.systemMetrics.loadAverage.average.toFixed(2)}`)
      console.log(`🔥 Peak Load: ${latestMetrics.systemMetrics.loadAverage.peak.toFixed(2)}`)
    }

    // Baseline comparison
    const comparison = this.compareWithBaseline(latestMetrics)
    if (comparison) {
      console.log('\n📊 Baseline Comparison:')
      console.log('-'.repeat(50))
      
      const durationIcon = comparison.durationChange < 0 ? '🚀' : comparison.durationChange > 10 ? '⚠️' : '✨'
      console.log(`${durationIcon} Duration: ${comparison.durationChange > 0 ? '+' : ''}${comparison.durationChange.toFixed(1)}%`)
      
      if (comparison.testCountChange !== 0) {
        const testIcon = comparison.testCountChange > 0 ? '📈' : '📉'
        console.log(`${testIcon} Test Count: ${comparison.testCountChange > 0 ? '+' : ''}${comparison.testCountChange}`)
      }
      
      if (comparison.memoryChange !== 0) {
        const memoryIcon = comparison.memoryChange > 0 ? '📈' : '📉'
        console.log(`${memoryIcon} Memory Usage: ${comparison.memoryChange > 0 ? '+' : ''}${comparison.memoryChange.toFixed(1)}MB`)
      }
    }

    // Performance insights
    console.log('\n🔍 Performance Insights:')
    console.log('-'.repeat(50))
    
    const testThroughput = latestMetrics.testResults.total / (latestMetrics.duration / 1000)
    console.log(`⚡ Test Throughput: ${testThroughput.toFixed(2)} tests/second`)
    
    if (latestMetrics.systemMetrics) {
      const memoryEfficiency = latestMetrics.testResults.total / latestMetrics.systemMetrics.memory.averageMB
      console.log(`💾 Memory Efficiency: ${memoryEfficiency.toFixed(2)} tests/MB`)
    }

    if (comparison && comparison.durationChange > 20) {
      console.log('⚠️  Warning: Test execution significantly slower than baseline')
      console.log('   Consider investigating performance regression')
    } else if (comparison && comparison.durationChange < -10) {
      console.log('🚀 Excellent: Test execution faster than baseline!')
    }

    console.log('='.repeat(70))

    // Save as new baseline if this is a successful run
    if (latestMetrics.exitCode === 0 && !this.baselineMetrics) {
      this.saveBaseline(latestMetrics)
    }
  }

  async runPerformanceTest() {
    try {
      console.log('🎯 Starting Test Performance Monitoring')
      console.log('=' .repeat(50))

      // Monitor different test types
      const testCommands = [
        { name: 'Unit Tests', command: 'npm', args: ['run', 'test:unit'] },
        { name: 'Animation Tests', command: 'npm', args: ['run', 'test:animations'] },
        { name: 'Integration Tests', command: 'npm', args: ['run', 'test:integration'] },
      ]

      for (const testCmd of testCommands) {
        console.log(`\n🔍 Monitoring: ${testCmd.name}`)
        try {
          await this.monitorTestExecution(testCmd.command, testCmd.args)
          console.log(`✅ ${testCmd.name} monitoring completed`)
        } catch (error) {
          console.log(`❌ ${testCmd.name} failed: ${error.message}`)
        }
      }

      this.generatePerformanceReport()

    } catch (error) {
      console.error('💥 Performance monitoring failed:', error.message)
      process.exit(1)
    }
  }
}

// CLI Interface
if (require.main === module) {
  const monitor = new TestPerformanceMonitor()
  monitor.runPerformanceTest().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

module.exports = TestPerformanceMonitor