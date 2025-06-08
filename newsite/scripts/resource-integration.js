#!/usr/bin/env node
/**
 * Resource Integration
 * Integrates resource management with existing test runners and monitoring
 */

const { ResourceManager } = require('./resource-manager')
const { globalMonitor } = require('./parallel-execution-monitor')

/**
 * Enhanced Test Runner with Resource Management
 * Wraps existing test runners with comprehensive resource management
 */
class ResourceManagedTestRunner {
  constructor(baseRunner, options = {}) {
    this.baseRunner = baseRunner
    this.options = {
      enableResourceManagement: options.enableResourceManagement !== false,
      healthCheckInterval: options.healthCheckInterval || 5000,
      errorRetryAttempts: options.errorRetryAttempts || 3,
      memoryThresholdMB: options.memoryThresholdMB || 500,
      ...options
    }
    
    this.resourceManager = new ResourceManager({
      healthMonitoring: {
        memoryThresholdMB: this.options.memoryThresholdMB,
        healthCheckInterval: this.options.healthCheckInterval
      },
      errorRecovery: {
        maxRetryAttempts: this.options.errorRetryAttempts
      },
      adaptiveScaling: {
        minWorkers: 1,
        maxWorkers: require('os').cpus().length
      }
    })
    
    this.activeWorkers = new Map()
    this.setupResourceEventHandlers()
    this.setupMonitoringIntegration()
  }
  
  setupResourceEventHandlers() {
    this.resourceManager.on('workerRegistered', (info) => {
      globalMonitor.emit('resourceWorkerStarted', info)
    })
    
    this.resourceManager.on('workerUnregistered', (info) => {
      globalMonitor.emit('resourceWorkerEnded', info)
    })
    
    this.resourceManager.on('errorCategorized', (errorInfo) => {
      globalMonitor.emit('resourceError', errorInfo)
    })
    
    this.resourceManager.on('recoveryAttempt', (info) => {
      globalMonitor.emit('resourceRecoveryAttempt', info)
    })
    
    this.resourceManager.on('recoverySuccessful', (info) => {
      globalMonitor.emit('resourceRecoverySuccess', info)
    })
    
    this.resourceManager.on('recoveryFailed', (info) => {
      globalMonitor.emit('resourceRecoveryFailed', info)
    })
    
    this.resourceManager.on('scalingRecommendation', (recommendation) => {
      globalMonitor.emit('resourceScalingRecommendation', recommendation)
      this.handleScalingRecommendation(recommendation)
    })
  }
  
  setupMonitoringIntegration() {
    // Integrate with global monitor
    globalMonitor.on('sessionStarted', (session) => {
      this.handleSessionStart(session)
    })
    
    globalMonitor.on('sessionEnded', (session) => {
      this.handleSessionEnd(session)
    })
    
    globalMonitor.on('workerStarted', (worker) => {
      this.handleWorkerStart(worker)
    })
    
    globalMonitor.on('workerEnded', (worker) => {
      this.handleWorkerEnd(worker)
    })
    
    globalMonitor.on('runnerError', (errorReport) => {
      this.handleRunnerError(errorReport)
    })
  }
  
  async handleSessionStart(session) {
    console.log(`🎯 Resource management started for session: ${session.id}`)
    
    // Generate initial resource report
    const report = this.resourceManager.generateResourceReport()
    console.log(`📊 Initial system state: ${report.summary.cpuUsage.toFixed(1)}% CPU, ${report.summary.memoryUsage.toFixed(1)}% Memory`)
    
    if (report.recommendations.length > 0) {
      console.log('⚠️  Initial recommendations:')
      report.recommendations.forEach(rec => {
        console.log(`   ${rec.severity.toUpperCase()}: ${rec.message}`)
      })
    }
  }
  
  async handleSessionEnd(session) {
    console.log(`🏁 Resource management completed for session: ${session.id}`)
    
    // Generate final resource report
    const report = this.resourceManager.generateResourceReport()
    console.log(`📈 Final system state: ${report.summary.cpuUsage.toFixed(1)}% CPU, ${report.summary.memoryUsage.toFixed(1)}% Memory`)
    console.log(`🔄 Total workers managed: ${report.summary.totalWorkers}`)
    
    if (report.summary.errorRate > 0) {
      console.log(`⚠️  Error rate: ${report.summary.errorRate.toFixed(1)} errors/minute`)
    }
  }
  
  async handleWorkerStart(worker) {
    const resourceWorker = this.resourceManager.registerWorker(worker.id, {
      type: worker.type || 'unknown',
      command: worker.command,
      startTime: worker.startTime,
      sessionId: worker.sessionId
    })
    
    this.activeWorkers.set(worker.id, {
      ...worker,
      resourceManager: resourceWorker
    })
  }
  
  async handleWorkerEnd(worker) {
    const managedWorker = this.activeWorkers.get(worker.id)
    
    if (managedWorker) {
      const reason = worker.status === 'completed' ? 'completed' : 'failed'
      this.resourceManager.unregisterWorker(worker.id, reason)
      this.activeWorkers.delete(worker.id)
    }
  }
  
  async handleRunnerError(errorReport) {
    const error = new Error(errorReport.error.message)
    error.stack = errorReport.error.stack
    error.runnerId = errorReport.runnerId
    
    const recovered = await this.resourceManager.handleWorkerError(
      errorReport.runnerId,
      error,
      {
        timestamp: errorReport.timestamp,
        sessionId: errorReport.sessionId
      }
    )
    
    if (recovered) {
      console.log(`🔄 Successfully recovered from error in ${errorReport.runnerId}`)
    } else {
      console.log(`💥 Failed to recover from error in ${errorReport.runnerId}`)
    }
    
    return recovered
  }
  
  async handleScalingRecommendation(recommendation) {
    console.log(`📊 Scaling recommendation: ${recommendation.action}`)
    console.log(`   Reason: ${recommendation.reason}`)
    console.log(`   Current workers: ${recommendation.currentWorkers}`)
    console.log(`   Recommended workers: ${recommendation.recommendedWorkers}`)
    
    // In a real implementation, you would adjust the number of workers
    // based on the recommendation. For now, we just log it.
    
    if (recommendation.action === 'scale_up') {
      globalMonitor.emit('scalingUp', {
        from: recommendation.currentWorkers,
        to: recommendation.recommendedWorkers,
        reason: recommendation.reason
      })
    } else if (recommendation.action === 'scale_down') {
      globalMonitor.emit('scalingDown', {
        from: recommendation.currentWorkers,
        to: recommendation.recommendedWorkers,
        reason: recommendation.reason
      })
    }
  }
  
  async executeWithResourceManagement(testFunction, context = {}) {
    const startTime = Date.now()
    const workerId = `managed_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    
    try {
      // Register worker for resource management
      this.resourceManager.registerWorker(workerId, {
        type: 'function_execution',
        context,
        startTime
      })
      
      // Execute the test function
      const result = await testFunction()
      
      // Success - unregister worker
      this.resourceManager.unregisterWorker(workerId, 'completed')
      
      return result
      
    } catch (error) {
      // Handle error with resource management
      const recovered = await this.resourceManager.handleWorkerError(workerId, error, context)
      
      if (recovered) {
        // Retry the function
        try {
          const result = await testFunction()
          this.resourceManager.unregisterWorker(workerId, 'completed')
          return result
        } catch (retryError) {
          this.resourceManager.unregisterWorker(workerId, 'failed')
          throw retryError
        }
      } else {
        this.resourceManager.unregisterWorker(workerId, 'failed')
        throw error
      }
    }
  }
  
  getResourceHealthReport() {
    return this.resourceManager.generateResourceReport()
  }
  
  async startPeriodicHealthChecks(interval = 30000) {
    this.healthCheckInterval = setInterval(() => {
      const report = this.resourceManager.generateResourceReport()
      
      // Log significant health issues
      if (report.summary.criticalWorkers > 0) {
        console.log(`🚨 Critical: ${report.summary.criticalWorkers} workers in critical state`)
      }
      
      if (report.summary.errorRate > 10) {
        console.log(`⚠️  High error rate: ${report.summary.errorRate.toFixed(1)} errors/minute`)
      }
      
      if (report.recommendations.length > 0) {
        report.recommendations.forEach(rec => {
          if (rec.severity === 'high') {
            console.log(`🚨 ${rec.message}`)
          }
        })
      }
      
      // Report to global monitor
      globalMonitor.emit('resourceHealthCheck', report)
      
    }, interval)
  }
  
  stopPeriodicHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
  }
  
  cleanup() {
    this.stopPeriodicHealthChecks()
    this.resourceManager.cleanup()
    this.activeWorkers.clear()
  }
}

/**
 * Resource-Managed Jest Integration
 * Wraps Jest execution with comprehensive resource management
 */
class ResourceManagedJest {
  constructor(jestConfig, options = {}) {
    this.jestConfig = jestConfig
    this.resourceRunner = new ResourceManagedTestRunner(null, options)
    
    this.enhanceJestConfig()
  }
  
  enhanceJestConfig() {
    // Add custom Jest reporter for resource management
    const ResourceManagementReporter = class {
      constructor(globalConfig, options) {
        this.globalConfig = globalConfig
        this.options = options
        this.resourceRunner = options.resourceRunner
      }
      
      onRunStart(results, options) {
        console.log('🎯 Jest execution with resource management started')
        this.resourceRunner.startPeriodicHealthChecks(10000) // Check every 10 seconds
      }
      
      onTestStart(test) {
        // Register test as a managed worker
        const workerId = `jest_test_${test.path.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`
        this.resourceRunner.resourceManager.registerWorker(workerId, {
          type: 'jest_test',
          testPath: test.path,
          context: test.context.config.displayName
        })
      }
      
      onTestResult(test, testResult) {
        const workerId = `jest_test_${test.path.replace(/[^a-zA-Z0-9]/g, '_')}`
        
        if (testResult.numFailingTests > 0) {
          // Handle test failures as potential resource issues
          testResult.testResults.forEach(result => {
            if (result.status === 'failed') {
              result.failureMessages.forEach(message => {
                const error = new Error(`Test failed: ${result.fullName}`)
                error.testMessage = message
                this.resourceRunner.resourceManager.handleWorkerError(workerId, error, {
                  testPath: test.path,
                  testName: result.fullName
                })
              })
            }
          })
        }
        
        const reason = testResult.numFailingTests === 0 ? 'completed' : 'failed'
        // Note: We can't easily find the exact workerId, so we'll handle cleanup differently
      }
      
      onRunComplete(contexts, results) {
        this.resourceRunner.stopPeriodicHealthChecks()
        
        const report = this.resourceRunner.getResourceHealthReport()
        console.log('\n📈 Jest Resource Management Report:')
        console.log(`   Workers managed: ${report.summary.totalWorkers}`)
        console.log(`   Error rate: ${report.summary.errorRate.toFixed(1)} errors/minute`)
        console.log(`   Final CPU: ${report.summary.cpuUsage.toFixed(1)}%`)
        console.log(`   Final Memory: ${report.summary.memoryUsage.toFixed(1)}%`)
        
        if (report.recommendations.length > 0) {
          console.log('\\n💡 Resource recommendations:')
          report.recommendations.forEach(rec => {
            console.log(`   ${rec.severity.toUpperCase()}: ${rec.message}`)
          })
        }
      }
    }
    
    // Add the resource management reporter
    if (!this.jestConfig.reporters) {
      this.jestConfig.reporters = ['default']
    }
    
    this.jestConfig.reporters.push([
      ResourceManagementReporter, 
      { resourceRunner: this.resourceRunner }
    ])
    
    return this.jestConfig
  }
  
  getEnhancedConfig() {
    return this.jestConfig
  }
  
  cleanup() {
    this.resourceRunner.cleanup()
  }
}

/**
 * Resource Management Utilities
 * Helper functions for integrating resource management
 */
class ResourceManagementUtils {
  static wrapTestFunction(testFunction, options = {}) {
    const resourceRunner = new ResourceManagedTestRunner(null, options)
    
    return async (...args) => {
      try {
        const result = await resourceRunner.executeWithResourceManagement(
          () => testFunction(...args),
          { functionName: testFunction.name, args: args.length }
        )
        return result
      } finally {
        resourceRunner.cleanup()
      }
    }
  }
  
  static createResourceAwareTimeout(timeoutMs, options = {}) {
    const resourceManager = new ResourceManager(options)
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const report = resourceManager.generateResourceReport()
        
        const timeoutError = new Error(
          `Operation timed out after ${timeoutMs}ms. ` +
          `System state: CPU ${report.summary.cpuUsage.toFixed(1)}%, ` +
          `Memory ${report.summary.memoryUsage.toFixed(1)}%`
        )
        
        timeoutError.resourceReport = report
        reject(timeoutError)
      }, timeoutMs)
      
      resolve(() => {
        clearTimeout(timer)
        resourceManager.cleanup()
      })
    })
  }
  
  static monitorAsyncOperation(asyncOperation, options = {}) {
    const resourceRunner = new ResourceManagedTestRunner(null, options)
    const workerId = `async_op_${Date.now()}`
    
    return new Promise(async (resolve, reject) => {
      try {
        // Register the operation
        resourceRunner.resourceManager.registerWorker(workerId, {
          type: 'async_operation',
          operation: asyncOperation.name || 'anonymous'
        })
        
        // Execute with monitoring
        const result = await asyncOperation()
        
        // Success
        resourceRunner.resourceManager.unregisterWorker(workerId, 'completed')
        resolve(result)
        
      } catch (error) {
        // Handle error with resource management
        const recovered = await resourceRunner.resourceManager.handleWorkerError(
          workerId, 
          error, 
          { operation: asyncOperation.name }
        )
        
        if (recovered) {
          try {
            const retryResult = await asyncOperation()
            resourceRunner.resourceManager.unregisterWorker(workerId, 'completed')
            resolve(retryResult)
          } catch (retryError) {
            resourceRunner.resourceManager.unregisterWorker(workerId, 'failed')
            reject(retryError)
          }
        } else {
          resourceRunner.resourceManager.unregisterWorker(workerId, 'failed')
          reject(error)
        }
      } finally {
        resourceRunner.cleanup()
      }
    })
  }
}

module.exports = {
  ResourceManagedTestRunner,
  ResourceManagedJest,
  ResourceManagementUtils
}