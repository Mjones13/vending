/**
 * Monitoring Integration
 * Integration utilities for connecting test runners with the parallel execution monitor
 */

const { globalMonitor } = require('./parallel-execution-monitor')

/**
 * Test Runner Monitor Integration
 * Wraps test runner operations with monitoring
 */
class TestRunnerMonitorIntegration {
  constructor(runnerId, metadata = {}) {
    this.runnerId = runnerId
    this.sessionId = null
    this.monitoringAPI = null
    this.workers = new Map()
    
    // Register with global monitor
    this.monitoringAPI = globalMonitor.registerTestRunner(runnerId, {
      ...metadata,
      startTime: Date.now(),
      type: metadata.type || 'unknown',
      version: metadata.version || '1.0.0',
    })
    
    this.startHeartbeat()
  }
  
  /**
   * Start monitoring session
   */
  startSession(config = {}) {
    this.sessionId = `${this.runnerId}_${Date.now()}`
    globalMonitor.startSession(this.sessionId, {
      runnerId: this.runnerId,
      ...config,
    })
    return this.sessionId
  }
  
  /**
   * End monitoring session
   */
  endSession(result = {}) {
    if (this.sessionId) {
      const session = globalMonitor.endSession(this.sessionId, result)
      this.sessionId = null
      return session
    }
    return null
  }
  
  /**
   * Report worker start
   */
  reportWorkerStart(workerId, metadata = {}) {
    this.monitoringAPI.reportWorkerStart(workerId, {
      ...metadata,
      sessionId: this.sessionId,
    })
    
    // Track worker locally for cleanup
    this.workers.set(workerId, {
      id: workerId,
      startTime: Date.now(),
      metadata,
    })
  }
  
  /**
   * Report worker end
   */
  reportWorkerEnd(workerId, result = {}) {
    this.monitoringAPI.reportWorkerEnd(workerId, result)
    this.workers.delete(workerId)
  }
  
  /**
   * Report progress
   */
  reportProgress(progress = {}) {
    this.monitoringAPI.reportProgress({
      ...progress,
      timestamp: Date.now(),
      activeWorkers: this.workers.size,
    })
  }
  
  /**
   * Report error
   */
  reportError(error) {
    this.monitoringAPI.reportError(error)
  }
  
  /**
   * Start heartbeat
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.monitoringAPI.heartbeat()
    }, 10000) // Every 10 seconds
  }
  
  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
  }
  
  /**
   * Cleanup
   */
  cleanup() {
    this.stopHeartbeat()
    
    // Report any remaining workers as completed
    for (const [workerId] of this.workers) {
      this.reportWorkerEnd(workerId, { success: false, reason: 'cleanup' })
    }
    
    // End session if still active
    if (this.sessionId) {
      this.endSession({ success: false, reason: 'cleanup' })
    }
  }
}

/**
 * Monitoring decorator for test execution functions
 */
function withMonitoring(runnerId, metadata = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function(...args) {
      const integration = new TestRunnerMonitorIntegration(runnerId, metadata)
      
      try {
        integration.startSession({ method: propertyKey, args: args.length })
        integration.reportProgress({ stage: 'starting', method: propertyKey })
        
        const result = await originalMethod.apply(this, args)
        
        integration.reportProgress({ stage: 'completed', method: propertyKey })
        integration.endSession({ success: true, result })
        
        return result
      } catch (error) {
        integration.reportError(error)
        integration.endSession({ success: false, error: error.message })
        throw error
      } finally {
        integration.cleanup()
      }
    }
    
    return descriptor
  }
}

/**
 * Jest monitoring integration
 */
class JestMonitoringIntegration {
  static integrate(jestConfig, runnerId = 'jest') {
    const integration = new TestRunnerMonitorIntegration(runnerId, {
      type: 'jest',
      version: require('jest/package.json').version,
      config: jestConfig,
    })
    
    // Create a custom Jest reporter
    const MonitoringReporter = class {
      constructor(globalConfig, options) {
        this.globalConfig = globalConfig
        this.options = options
        this.sessionId = integration.startSession({
          type: 'jest',
          testMatch: globalConfig.testMatch,
          maxWorkers: globalConfig.maxWorkers,
        })
      }
      
      onRunStart(results, options) {
        integration.reportProgress({
          stage: 'run_start',
          totalTests: results.numTotalTestSuites,
        })
      }
      
      onTestStart(test) {
        integration.reportWorkerStart(`test_${test.path}`, {
          testPath: test.path,
          context: test.context.config.displayName,
        })
      }
      
      onTestResult(test, testResult) {
        const success = testResult.numFailingTests === 0
        integration.reportWorkerEnd(`test_${test.path}`, {
          success,
          totalTests: testResult.numPassingTests + testResult.numFailingTests,
          passedTests: testResult.numPassingTests,
          failedTests: testResult.numFailingTests,
          duration: testResult.perfStats.end - testResult.perfStats.start,
          coverage: testResult.coverage,
        })
        
        if (!success) {
          testResult.testResults.forEach(result => {
            if (result.status === 'failed') {
              result.failureMessages.forEach(message => {
                integration.reportError(new Error(`Test failed: ${result.fullName} - ${message}`))
              })
            }
          })
        }
      }
      
      onRunComplete(contexts, results) {
        integration.reportProgress({
          stage: 'run_complete',
          totalTests: results.numTotalTests,
          passedTests: results.numPassedTests,
          failedTests: results.numFailedTests,
          duration: results.testResults.reduce((sum, r) => sum + (r.perfStats.end - r.perfStats.start), 0),
        })
        
        integration.endSession({
          success: results.success,
          totalTests: results.numTotalTests,
          passedTests: results.numPassedTests,
          failedTests: results.numFailedTests,
          testSuites: results.numTotalTestSuites,
          coverage: results.coverageMap,
        })
      }
    }
    
    // Add the reporter to Jest config
    if (!jestConfig.reporters) {
      jestConfig.reporters = ['default']
    }
    
    jestConfig.reporters.push([MonitoringReporter, {}])
    
    return jestConfig
  }
}

/**
 * Command execution monitoring wrapper
 */
class CommandMonitoringWrapper {
  constructor(runnerId, metadata = {}) {
    this.integration = new TestRunnerMonitorIntegration(runnerId, metadata)
  }
  
  async executeCommand(command, args = [], options = {}) {
    const { spawn } = require('child_process')
    const workerId = `cmd_${Date.now()}`
    
    this.integration.reportWorkerStart(workerId, {
      command,
      args,
      options,
    })
    
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options,
      })
      
      let stdout = ''
      let stderr = ''
      
      child.stdout.on('data', (data) => {
        stdout += data
      })
      
      child.stderr.on('data', (data) => {
        stderr += data
      })
      
      child.on('close', (code) => {
        const success = code === 0
        const result = {
          success,
          exitCode: code,
          stdout,
          stderr,
          command: `${command} ${args.join(' ')}`,
        }
        
        this.integration.reportWorkerEnd(workerId, result)
        
        if (success) {
          resolve(result)
        } else {
          const error = new Error(`Command failed: ${command} ${args.join(' ')} (exit code: ${code})`)
          error.result = result
          this.integration.reportError(error)
          reject(error)
        }
      })
      
      child.on('error', (error) => {
        this.integration.reportError(error)
        this.integration.reportWorkerEnd(workerId, {
          success: false,
          error: error.message,
        })
        reject(error)
      })
    })
  }
  
  cleanup() {
    this.integration.cleanup()
  }
}

/**
 * Performance monitoring utilities
 */
class PerformanceMonitoring {
  static createTimer(name) {
    const startTime = performance.now()
    
    return {
      end: () => {
        const endTime = performance.now()
        const duration = endTime - startTime
        
        return {
          name,
          startTime,
          endTime,
          duration,
          durationMs: Math.round(duration),
          durationSeconds: (duration / 1000).toFixed(2),
        }
      }
    }
  }
  
  static measureAsync(name, asyncFunction) {
    return async (...args) => {
      const timer = PerformanceMonitoring.createTimer(name)
      try {
        const result = await asyncFunction(...args)
        const timing = timer.end()
        return { result, timing }
      } catch (error) {
        const timing = timer.end()
        error.timing = timing
        throw error
      }
    }
  }
  
  static measureSync(name, syncFunction) {
    return (...args) => {
      const timer = PerformanceMonitoring.createTimer(name)
      try {
        const result = syncFunction(...args)
        const timing = timer.end()
        return { result, timing }
      } catch (error) {
        const timing = timer.end()
        error.timing = timing
        throw error
      }
    }
  }
}

/**
 * Real-time dashboard utilities
 */
class DashboardReporter {
  constructor(options = {}) {
    this.options = {
      updateInterval: options.updateInterval || 2000,
      maxLogLines: options.maxLogLines || 100,
      ...options
    }
    
    this.logs = []
    this.lastReport = null
    
    this.setupDashboard()
  }
  
  setupDashboard() {
    if (!this.options.enableDashboard) return
    
    // Subscribe to monitor events
    globalMonitor.on('sessionStarted', (session) => {
      this.log(`📊 Session started: ${session.id}`)
    })
    
    globalMonitor.on('sessionEnded', (session) => {
      const duration = (session.duration / 1000).toFixed(2)
      const status = session.status === 'completed' ? '✅' : '❌'
      this.log(`${status} Session ended: ${session.id} (${duration}s)`)
    })
    
    globalMonitor.on('workerStarted', (worker) => {
      this.log(`🚀 Worker started: ${worker.id}`)
    })
    
    globalMonitor.on('workerEnded', (worker) => {
      const duration = (worker.duration / 1000).toFixed(2)
      const status = worker.status === 'completed' ? '✅' : '❌'
      this.log(`${status} Worker ended: ${worker.id} (${duration}s)`)
    })
    
    globalMonitor.on('alert', (alert) => {
      this.log(`🚨 ALERT: ${alert.message}`)
    })
    
    // Start periodic reporting
    if (this.options.enablePeriodicReports) {
      this.startPeriodicReporting()
    }
  }
  
  startPeriodicReporting() {
    this.reportInterval = setInterval(() => {
      const report = globalMonitor.generateReport()
      this.displayReport(report)
    }, this.options.updateInterval)
  }
  
  stopPeriodicReporting() {
    if (this.reportInterval) {
      clearInterval(this.reportInterval)
    }
  }
  
  log(message) {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    
    this.logs.push(logEntry)
    
    // Trim logs to max length
    if (this.logs.length > this.options.maxLogLines) {
      this.logs = this.logs.slice(-this.options.maxLogLines)
    }
    
    if (this.options.enableConsoleOutput) {
      console.log(logEntry)
    }
  }
  
  displayReport(report) {
    if (!this.options.enableDashboard) return
    
    console.clear()
    console.log('🔍 Parallel Test Execution Monitor Dashboard')
    console.log('='.repeat(60))
    
    // System status
    console.log(`📊 Status: ${report.status.isMonitoring ? 'MONITORING' : 'STOPPED'}`)
    console.log(`⏱️  Uptime: ${(report.status.uptime / 1000).toFixed(0)}s`)
    console.log(`🏃 Active Sessions: ${report.status.activeSessions}`)
    console.log(`👥 Runners: ${report.status.runners}`)
    
    // Current metrics
    if (report.currentMetrics) {
      console.log('\n💻 System Resources:')
      console.log(`   CPU: ${report.currentMetrics.cpu.usage.toFixed(1)}%`)
      console.log(`   Memory: ${report.currentMetrics.memory.usagePercent.toFixed(1)}%`)
      console.log(`   Workers: ${report.currentMetrics.workers.active}`)
    }
    
    // Performance trend
    if (report.performanceTrend) {
      const trend = report.performanceTrend
      const icon = trend.direction === 'faster' ? '🚀' : trend.direction === 'slower' ? '🐌' : '📊'
      console.log(`\n${icon} Performance Trend: ${trend.direction} (${trend.changePercent.toFixed(1)}%)`)
    }
    
    // Recent alerts
    if (report.recentAlerts.length > 0) {
      console.log('\n🚨 Recent Alerts:')
      report.recentAlerts.slice(-5).forEach(alert => {
        console.log(`   ${alert.message}`)
      })
    }
    
    // Recent logs
    console.log('\n📝 Recent Activity:')
    this.logs.slice(-10).forEach(log => {
      console.log(`   ${log}`)
    })
    
    console.log('\n' + '='.repeat(60))
    console.log('Press Ctrl+C to stop monitoring')
  }
  
  cleanup() {
    this.stopPeriodicReporting()
  }
}

module.exports = {
  TestRunnerMonitorIntegration,
  withMonitoring,
  JestMonitoringIntegration,
  CommandMonitoringWrapper,
  PerformanceMonitoring,
  DashboardReporter,
}