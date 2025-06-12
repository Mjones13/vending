#!/usr/bin/env node
/**
 * Load-Balanced Test Runner
 * Intelligent workload distribution across available system resources
 */

const { spawn } = require('child_process')
const { performance } = require('perf_hooks')
const os = require('os')
const EventEmitter = require('events')
const { TestRunnerMonitorIntegration, PerformanceMonitoring } = require('./monitoring-integration')
const { ResourceManagedTestRunner } = require('./resource-integration')

class WorkerPool extends EventEmitter {
  constructor(maxWorkers, systemInfo) {
    super()
    this.maxWorkers = maxWorkers
    this.systemInfo = systemInfo
    this.activeWorkers = new Map()
    this.completedJobs = []
    this.pendingJobs = []
    this.failedJobs = []
  }

  async addJob(job) {
    return new Promise((resolve, reject) => {
      const jobWithPromise = {
        ...job,
        resolve,
        reject,
        startTime: null,
        workerId: null,
      }
      
      this.pendingJobs.push(jobWithPromise)
      this.processQueue()
    })
  }

  async processQueue() {
    while (this.pendingJobs.length > 0 && this.activeWorkers.size < this.maxWorkers) {
      const job = this.pendingJobs.shift()
      await this.executeJob(job)
    }
  }

  async executeJob(job) {
    const workerId = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    job.workerId = workerId
    job.startTime = performance.now()

    console.log(`🚀 [${workerId}] Starting: ${job.name}`)

    const child = spawn(job.command, job.args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        WORKER_ID: workerId,
        JEST_MAX_WORKERS: this.getWorkerSpecificConfig(job),
      },
    })

    const workerInfo = {
      id: workerId,
      job,
      process: child,
      startTime: job.startTime,
    }

    this.activeWorkers.set(workerId, workerInfo)

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data
    })

    child.stderr.on('data', (data) => {
      stderr += data
    })

    child.on('close', (code) => {
      const endTime = performance.now()
      const duration = endTime - job.startTime

      const result = {
        ...job,
        code,
        duration,
        stdout,
        stderr,
        workerId,
        performance: this.calculatePerformanceMetrics(job, duration),
      }

      this.activeWorkers.delete(workerId)

      if (code === 0) {
        this.completedJobs.push(result)
        console.log(`✅ [${workerId}] Completed: ${job.name} (${(duration / 1000).toFixed(2)}s)`)
        job.resolve(result)
      } else {
        this.failedJobs.push(result)
        console.log(`❌ [${workerId}] Failed: ${job.name} (${(duration / 1000).toFixed(2)}s)`)
        job.reject(new Error(`Job failed: ${job.name}`))
      }

      // Process next job in queue
      this.processQueue()
    })

    child.on('error', (error) => {
      console.error(`💥 [${workerId}] Error: ${job.name} - ${error.message}`)
      this.activeWorkers.delete(workerId)
      job.reject(error)
      this.processQueue()
    })
  }

  getWorkerSpecificConfig(job) {
    // Adjust Jest worker count based on job type and system resources
    if (job.type === 'unit') {
      return this.systemInfo.isM2 ? '50%' : '25%'
    } else if (job.type === 'integration') {
      return this.systemInfo.isM2 ? '75%' : '50%'
    } else if (job.type === 'animation') {
      return this.systemInfo.isM2 ? '60%' : '40%'
    }
    return this.systemInfo.isM2 ? '75%' : '50%'
  }

  calculatePerformanceMetrics(job, actualDuration) {
    const expectedDuration = job.expectedDuration || 10000
    const efficiency = expectedDuration / actualDuration
    const cpuIntensity = job.cpuIntensity || 1.0
    const memoryUsage = process.memoryUsage()

    return {
      efficiency,
      cpuIntensity,
      actualDuration,
      expectedDuration,
      memoryUsageMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      performanceScore: this.calculatePerformanceScore(efficiency, cpuIntensity),
    }
  }

  calculatePerformanceScore(efficiency, cpuIntensity) {
    // Higher score = better performance
    // Considers both speed and resource efficiency
    return Math.min(100, Math.max(0, (efficiency * 50) + ((2 - cpuIntensity) * 25)))
  }

  getStats() {
    return {
      completed: this.completedJobs.length,
      failed: this.failedJobs.length,
      active: this.activeWorkers.size,
      pending: this.pendingJobs.length,
      averagePerformanceScore: this.completedJobs.length > 0 
        ? this.completedJobs.reduce((sum, job) => sum + job.performance.performanceScore, 0) / this.completedJobs.length
        : 0,
    }
  }
}

class LoadBalancedTestRunner {
  constructor() {
    this.systemInfo = this.gatherSystemInfo()
    this.workerPool = new WorkerPool(this.getOptimalWorkerCount(), this.systemInfo)
    this.startTime = performance.now()
    
    // Initialize monitoring integration
    this.monitoring = new TestRunnerMonitorIntegration('load-balanced-test-runner', {
      type: 'load-balanced-runner',
      maxWorkers: this.workerPool.maxWorkers,
      systemInfo: this.systemInfo,
    })
    
    // Initialize resource management
    this.resourceManager = new ResourceManagedTestRunner(this, {
      enableResourceManagement: true,
      memoryThresholdMB: 600,
      errorRetryAttempts: 3,
    })
  }

  gatherSystemInfo() {
    const cpus = os.cpus()
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const loadAvg = os.loadavg()

    return {
      platform: os.platform(),
      arch: os.arch(),
      cpuCount: cpus.length,
      cpuModel: cpus[0]?.model || 'Unknown',
      isM2: cpus[0]?.model?.includes('Apple') && os.arch() === 'arm64',
      totalMemoryGB: (totalMemory / (1024 ** 3)).toFixed(2),
      freeMemoryGB: (freeMemory / (1024 ** 3)).toFixed(2),
      memoryUsagePercent: ((totalMemory - freeMemory) / totalMemory * 100).toFixed(1),
      loadAverage: loadAvg[0].toFixed(2),
      nodeVersion: process.version,
    }
  }

  getOptimalWorkerCount() {
    const { cpuCount, memoryUsagePercent, loadAverage, isM2 } = this.systemInfo

    // Base worker count on available resources
    let workers = Math.floor(cpuCount * 0.75)

    // Adjust based on current system load
    if (parseFloat(loadAverage) > cpuCount * 0.8) {
      workers = Math.floor(workers * 0.6) // Reduce if system is busy
    }

    // Adjust based on memory usage
    if (parseFloat(memoryUsagePercent) > 80) {
      workers = Math.floor(workers * 0.7) // Reduce if memory is constrained
    }

    // M2 MacBook can handle more parallel work efficiently
    if (isM2 && workers < cpuCount * 0.6) {
      workers = Math.floor(cpuCount * 0.6)
    }

    return Math.max(1, Math.min(workers, cpuCount))
  }

  getTestJobDefinitions() {
    return [
      {
        name: 'Linting',
        command: 'npm',
        args: ['run', 'lint'],
        type: 'static',
        priority: 1,
        expectedDuration: 3000,
        cpuIntensity: 0.3,
      },
      {
        name: 'Type Checking',
        command: 'npm',
        args: ['run', 'type-check'],
        type: 'static',
        priority: 2,
        expectedDuration: 5000,
        cpuIntensity: 0.7,
      },
      {
        name: 'Unit Tests',
        command: 'npm',
        args: ['run', 'test:unit'],
        type: 'unit',
        priority: 3,
        expectedDuration: 15000,
        cpuIntensity: 1.0,
      },
      {
        name: 'Animation Tests',
        command: 'npm',
        args: ['run', 'test:animations'],
        type: 'animation',
        priority: 4,
        expectedDuration: 20000,
        cpuIntensity: 1.2,
      },
      {
        name: 'Integration Tests',
        command: 'npm',
        args: ['run', 'test:integration'],
        type: 'integration',
        priority: 5,
        expectedDuration: 25000,
        cpuIntensity: 1.1,
      },
    ]
  }

  async run() {
    const sessionId = this.monitoring.startSession({
      type: 'load-balanced',
      maxWorkers: this.workerPool.maxWorkers,
      systemInfo: this.systemInfo,
    })
    
    console.log('🎯 Load-Balanced Test Runner')
    console.log('=' * 50)
    console.log(`🖥️  System: ${this.systemInfo.cpuModel} (${this.systemInfo.cpuCount} cores)`)
    console.log(`💾 Memory: ${this.systemInfo.freeMemoryGB}GB free / ${this.systemInfo.totalMemoryGB}GB total (${this.systemInfo.memoryUsagePercent}% used)`)
    console.log(`📊 Load Average: ${this.systemInfo.loadAverage}`)
    console.log(`⚡ Optimal Workers: ${this.workerPool.maxWorkers}`)
    
    if (this.systemInfo.isM2) {
      console.log('🍎 M2 MacBook optimizations enabled')
    }
    
    console.log('-'.repeat(50))

    const jobs = this.getTestJobDefinitions()
    
    // Report initial progress
    this.monitoring.reportProgress({
      stage: 'starting',
      totalJobs: jobs.length,
      maxWorkers: this.workerPool.maxWorkers,
    })
    
    try {
      // Execute all jobs with load balancing
      const results = await Promise.allSettled(
        jobs.map(job => this.workerPool.addJob(job))
      )

      // Generate comprehensive report
      this.generateLoadBalancedReport(results)

      const failedJobs = results.filter(r => r.status === 'rejected')
      const success = failedJobs.length === 0
      
      // End monitoring session
      this.monitoring.endSession({
        success,
        totalJobs: jobs.length,
        completedJobs: results.length - failedJobs.length,
        failedJobs: failedJobs.length,
        totalDuration: performance.now() - this.startTime,
      })
      
      if (failedJobs.length > 0) {
        console.log(`\n❌ ${failedJobs.length} jobs failed`)
        this.resourceManager.cleanup()
        process.exit(1)
      } else {
        console.log('\n✅ All tests completed successfully!')
        this.resourceManager.cleanup()
        process.exit(0)
      }

    } catch (error) {
      console.error('\n💥 Load-balanced test execution failed:', error.message)
      
      // Report error and end session
      this.monitoring.reportError(error)
      this.monitoring.endSession({
        success: false,
        error: error.message,
        totalDuration: performance.now() - this.startTime,
      })
      
      this.resourceManager.cleanup()
      process.exit(1)
    }
  }

  generateLoadBalancedReport(results) {
    const totalDuration = (performance.now() - this.startTime) / 1000
    const stats = this.workerPool.getStats()

    console.log('\n' + '='.repeat(60))
    console.log('📈 LOAD-BALANCED EXECUTION REPORT')
    console.log('='.repeat(60))

    console.log(`⏱️  Total Execution Time: ${totalDuration.toFixed(2)}s`)
    console.log(`📊 Jobs Completed: ${stats.completed}`)
    console.log(`❌ Jobs Failed: ${stats.failed}`)
    console.log(`📈 Average Performance Score: ${stats.averagePerformanceScore.toFixed(1)}/100`)

    console.log('\n📋 Job Performance Details:')
    console.log('-'.repeat(60))

    this.workerPool.completedJobs.forEach(job => {
      const perf = job.performance
      console.log(`✅ ${job.name.padEnd(20)} ${(job.duration / 1000).toFixed(2)}s (Score: ${perf.performanceScore.toFixed(1)})`)
    })

    this.workerPool.failedJobs.forEach(job => {
      console.log(`❌ ${job.name.padEnd(20)} ${(job.duration / 1000).toFixed(2)}s (FAILED)`)
    })

    // Resource utilization insights
    console.log('\n🔍 Resource Utilization Analysis:')
    console.log('-'.repeat(60))
    
    if (stats.averagePerformanceScore > 80) {
      console.log('🚀 Excellent: High performance and efficient resource utilization')
    } else if (stats.averagePerformanceScore > 60) {
      console.log('✨ Good: Balanced performance with room for optimization')
    } else {
      console.log('⚠️  Suboptimal: Consider adjusting worker count or system resources')
    }

    if (this.systemInfo.isM2) {
      const utilizationPercent = (this.workerPool.maxWorkers / this.systemInfo.cpuCount * 100).toFixed(1)
      console.log(`🍎 M2 CPU Utilization: ${utilizationPercent}% (${this.workerPool.maxWorkers}/${this.systemInfo.cpuCount} cores)`)
    }

    console.log('='.repeat(60))
  }
}

// CLI Interface
if (require.main === module) {
  const runner = new LoadBalancedTestRunner()
  runner.run().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

module.exports = LoadBalancedTestRunner