#!/usr/bin/env node
/**
 * Resource Manager
 * Centralized resource lifecycle management for parallel test execution
 */

const os = require('os')
const { EventEmitter } = require('events')
const { performance } = require('perf_hooks')

/**
 * Worker Health Monitor
 * Tracks individual worker process health and performance
 */
class WorkerHealthMonitor {
  constructor(workerId, options = {}) {
    this.workerId = workerId
    this.options = {
      memoryThresholdMB: options.memoryThresholdMB || 500,
      cpuThresholdPercent: options.cpuThresholdPercent || 80,
      healthCheckInterval: options.healthCheckInterval || 5000,
      maxMemoryLeakChecks: options.maxMemoryLeakChecks || 10,
      ...options
    }
    
    this.startTime = Date.now()
    this.lastMemoryCheck = null
    this.memoryHistory = []
    this.cpuHistory = []
    this.healthStatus = 'healthy'
    this.alerts = []
    
    this.startHealthChecks()
  }
  
  startHealthChecks() {
    this.healthInterval = setInterval(() => {
      this.performHealthCheck()
    }, this.options.healthCheckInterval)
  }
  
  stopHealthChecks() {
    if (this.healthInterval) {
      clearInterval(this.healthInterval)
    }
  }
  
  performHealthCheck() {
    const memoryUsage = process.memoryUsage()
    const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
    
    // Track memory usage history
    this.memoryHistory.push({
      timestamp: Date.now(),
      heapUsed: memoryMB,
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    })
    
    // Trim history to prevent memory bloat
    if (this.memoryHistory.length > this.options.maxMemoryLeakChecks) {
      this.memoryHistory = this.memoryHistory.slice(-this.options.maxMemoryLeakChecks)
    }
    
    // Check for memory threshold breach
    if (memoryMB > this.options.memoryThresholdMB) {
      this.addAlert('memory_threshold', `Memory usage (${memoryMB}MB) exceeds threshold (${this.options.memoryThresholdMB}MB)`)
      this.healthStatus = 'warning'
    }
    
    // Check for memory leaks
    if (this.detectMemoryLeak()) {
      this.addAlert('memory_leak', 'Potential memory leak detected - consistent memory growth')
      this.healthStatus = 'critical'
    }
    
    return {
      workerId: this.workerId,
      memoryMB,
      healthStatus: this.healthStatus,
      uptime: Date.now() - this.startTime,
      alertCount: this.alerts.length
    }
  }
  
  detectMemoryLeak() {
    if (this.memoryHistory.length < 5) return false
    
    // Check if memory usage is consistently growing
    const recentMemory = this.memoryHistory.slice(-5)
    let increasingCount = 0
    
    for (let i = 1; i < recentMemory.length; i++) {
      if (recentMemory[i].heapUsed > recentMemory[i - 1].heapUsed) {
        increasingCount++
      }
    }
    
    // If memory increased in 4 out of 5 checks, potential leak
    return increasingCount >= 4
  }
  
  addAlert(type, message) {
    const alert = {
      type,
      message,
      timestamp: Date.now(),
      workerId: this.workerId
    }
    
    this.alerts.push(alert)
    
    // Trim alerts to prevent memory bloat
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50)
    }
    
    return alert
  }
  
  getHealthReport() {
    const currentMemory = this.memoryHistory[this.memoryHistory.length - 1]
    
    return {
      workerId: this.workerId,
      healthStatus: this.healthStatus,
      uptime: Date.now() - this.startTime,
      currentMemoryMB: currentMemory?.heapUsed || 0,
      memoryTrend: this.calculateMemoryTrend(),
      alertCount: this.alerts.length,
      recentAlerts: this.alerts.slice(-5),
      thresholds: {
        memory: this.options.memoryThresholdMB,
        cpu: this.options.cpuThresholdPercent
      }
    }
  }
  
  calculateMemoryTrend() {
    if (this.memoryHistory.length < 3) return 'stable'
    
    const recent = this.memoryHistory.slice(-3)
    const first = recent[0].heapUsed
    const last = recent[recent.length - 1].heapUsed
    const change = ((last - first) / first) * 100
    
    if (change > 10) return 'increasing'
    if (change < -10) return 'decreasing'
    return 'stable'
  }
  
  cleanup() {
    this.stopHealthChecks()
    this.memoryHistory = []
    this.cpuHistory = []
    this.alerts = []
  }
}

/**
 * Error Recovery Manager
 * Handles error categorization and recovery strategies
 */
class ErrorRecoveryManager extends EventEmitter {
  constructor(options = {}) {
    super()
    this.options = {
      maxRetryAttempts: options.maxRetryAttempts || 3,
      retryDelayMs: options.retryDelayMs || 1000,
      retryBackoffMultiplier: options.retryBackoffMultiplier || 2,
      ...options
    }
    
    this.errorHistory = []
    this.recoveryAttempts = new Map()
  }
  
  categorizeError(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      timestamp: Date.now(),
      context,
      category: this.determineErrorCategory(error),
      severity: this.determineErrorSeverity(error),
      recoverable: this.isRecoverable(error)
    }
    
    this.errorHistory.push(errorInfo)
    
    // Trim error history
    if (this.errorHistory.length > 1000) {
      this.errorHistory = this.errorHistory.slice(-1000)
    }
    
    this.emit('errorCategorized', errorInfo)
    
    return errorInfo
  }
  
  determineErrorCategory(error) {
    const message = error.message.toLowerCase()
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'timeout'
    }
    if (message.includes('memory') || message.includes('heap')) {
      return 'memory'
    }
    if (message.includes('enoent') || message.includes('file not found')) {
      return 'filesystem'
    }
    if (message.includes('econnrefused') || message.includes('network')) {
      return 'network'
    }
    if (message.includes('spawn') || message.includes('child process')) {
      return 'process'
    }
    if (message.includes('jest') || message.includes('test')) {
      return 'test_framework'
    }
    
    return 'unknown'
  }
  
  determineErrorSeverity(error) {
    const category = this.determineErrorCategory(error)
    
    if (category === 'memory' || error.message.includes('SIGKILL')) {
      return 'critical'
    }
    if (category === 'timeout' || category === 'network') {
      return 'high'
    }
    if (category === 'filesystem' || category === 'test_framework') {
      return 'medium'
    }
    
    return 'low'
  }
  
  isRecoverable(error) {
    const category = this.determineErrorCategory(error)
    const nonRecoverableCategories = ['memory', 'filesystem']
    
    if (nonRecoverableCategories.includes(category)) {
      return false
    }
    
    // SIGKILL and similar fatal signals are not recoverable
    if (error.signal === 'SIGKILL' || error.signal === 'SIGTERM') {
      return false
    }
    
    return true
  }
  
  async attemptRecovery(errorInfo, recoveryFunction, context = {}) {
    const key = `${context.workerId || 'unknown'}_${errorInfo.category}`
    const attempts = this.recoveryAttempts.get(key) || 0
    
    if (attempts >= this.options.maxRetryAttempts) {
      this.emit('recoveryFailed', {
        ...errorInfo,
        context,
        reason: 'max_attempts_exceeded'
      })
      return false
    }
    
    // Calculate retry delay with exponential backoff
    const delay = this.options.retryDelayMs * Math.pow(this.options.retryBackoffMultiplier, attempts)
    
    this.emit('recoveryAttempt', {
      ...errorInfo,
      context,
      attempt: attempts + 1,
      maxAttempts: this.options.maxRetryAttempts,
      delay
    })
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, delay))
    
    try {
      this.recoveryAttempts.set(key, attempts + 1)
      const result = await recoveryFunction()
      
      // Recovery successful - reset attempt counter
      this.recoveryAttempts.delete(key)
      
      this.emit('recoverySuccessful', {
        ...errorInfo,
        context,
        attempt: attempts + 1,
        result
      })
      
      return true
    } catch (recoveryError) {
      const newErrorInfo = this.categorizeError(recoveryError, {
        ...context,
        recoveryAttempt: attempts + 1,
        originalError: errorInfo
      })
      
      this.emit('recoveryError', {
        originalError: errorInfo,
        recoveryError: newErrorInfo,
        context,
        attempt: attempts + 1
      })
      
      return false
    }
  }
  
  getErrorStatistics() {
    const recentErrors = this.errorHistory.filter(
      error => Date.now() - error.timestamp < 300000 // Last 5 minutes
    )
    
    const categoryStats = {}
    const severityStats = {}
    
    recentErrors.forEach(error => {
      categoryStats[error.category] = (categoryStats[error.category] || 0) + 1
      severityStats[error.severity] = (severityStats[error.severity] || 0) + 1
    })
    
    return {
      totalErrors: this.errorHistory.length,
      recentErrors: recentErrors.length,
      categoryBreakdown: categoryStats,
      severityBreakdown: severityStats,
      activeRecoveryAttempts: this.recoveryAttempts.size,
      errorRate: recentErrors.length / 5 // Errors per minute
    }
  }
  
  cleanup() {
    this.errorHistory = []
    this.recoveryAttempts.clear()
    this.removeAllListeners()
  }
}

/**
 * Adaptive Scaling Manager
 * Manages resource usage-based scaling decisions
 */
class AdaptiveScalingManager extends EventEmitter {
  constructor(options = {}) {
    super()
    this.options = {
      cpuThreshold: options.cpuThreshold || 75,
      memoryThreshold: options.memoryThreshold || 80,
      scalingInterval: options.scalingInterval || 10000,
      minWorkers: options.minWorkers || 1,
      maxWorkers: options.maxWorkers || os.cpus().length,
      scaleUpCooldown: options.scaleUpCooldown || 30000,
      scaleDownCooldown: options.scaleDownCooldown || 60000,
      ...options
    }
    
    this.currentWorkerCount = 0
    this.lastScaleUp = 0
    this.lastScaleDown = 0
    this.resourceHistory = []
    
    this.startResourceMonitoring()
  }
  
  startResourceMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.checkResourceUsage()
    }, this.options.scalingInterval)
  }
  
  stopResourceMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }
  }
  
  checkResourceUsage() {
    const usage = this.getCurrentResourceUsage()
    
    this.resourceHistory.push({
      ...usage,
      timestamp: Date.now()
    })
    
    // Trim history
    if (this.resourceHistory.length > 60) { // Keep last 10 minutes
      this.resourceHistory = this.resourceHistory.slice(-60)
    }
    
    const recommendation = this.generateScalingRecommendation(usage)
    
    if (recommendation.action !== 'maintain') {
      this.emit('scalingRecommendation', recommendation)
    }
    
    return recommendation
  }
  
  getCurrentResourceUsage() {
    const cpuUsage = this.getCPUUsage()
    const memoryUsage = this.getMemoryUsage()
    const loadAverage = os.loadavg()[0] / os.cpus().length * 100
    
    return {
      cpu: cpuUsage,
      memory: memoryUsage,
      loadAverage,
      workers: this.currentWorkerCount,
      totalCores: os.cpus().length,
      totalMemoryGB: (os.totalmem() / (1024 ** 3)).toFixed(2),
      freeMemoryGB: (os.freemem() / (1024 ** 3)).toFixed(2)
    }
  }
  
  getCPUUsage() {
    // Simplified CPU usage calculation
    // In a real implementation, you'd want more accurate CPU monitoring
    const loadAvg = os.loadavg()[0]
    const cpuCount = os.cpus().length
    return Math.min(100, (loadAvg / cpuCount) * 100)
  }
  
  getMemoryUsage() {
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    return ((totalMemory - freeMemory) / totalMemory) * 100
  }
  
  generateScalingRecommendation(currentUsage) {
    const now = Date.now()
    const { cpu, memory, loadAverage } = currentUsage
    
    // Check if we should scale up
    if (
      (cpu > this.options.cpuThreshold || memory > this.options.memoryThreshold) &&
      this.currentWorkerCount < this.options.maxWorkers &&
      (now - this.lastScaleUp) > this.options.scaleUpCooldown
    ) {
      return {
        action: 'scale_up',
        reason: `High resource usage: CPU ${cpu.toFixed(1)}%, Memory ${memory.toFixed(1)}%`,
        currentWorkers: this.currentWorkerCount,
        recommendedWorkers: Math.min(this.currentWorkerCount + 1, this.options.maxWorkers),
        resourceUsage: currentUsage
      }
    }
    
    // Check if we should scale down
    if (
      cpu < this.options.cpuThreshold * 0.5 &&
      memory < this.options.memoryThreshold * 0.5 &&
      this.currentWorkerCount > this.options.minWorkers &&
      (now - this.lastScaleDown) > this.options.scaleDownCooldown
    ) {
      return {
        action: 'scale_down',
        reason: `Low resource usage: CPU ${cpu.toFixed(1)}%, Memory ${memory.toFixed(1)}%`,
        currentWorkers: this.currentWorkerCount,
        recommendedWorkers: Math.max(this.currentWorkerCount - 1, this.options.minWorkers),
        resourceUsage: currentUsage
      }
    }
    
    return {
      action: 'maintain',
      reason: 'Resource usage within optimal range',
      currentWorkers: this.currentWorkerCount,
      recommendedWorkers: this.currentWorkerCount,
      resourceUsage: currentUsage
    }
  }
  
  updateWorkerCount(newCount) {
    const oldCount = this.currentWorkerCount
    this.currentWorkerCount = newCount
    
    if (newCount > oldCount) {
      this.lastScaleUp = Date.now()
    } else if (newCount < oldCount) {
      this.lastScaleDown = Date.now()
    }
    
    this.emit('workerCountUpdated', {
      oldCount,
      newCount,
      timestamp: Date.now()
    })
  }
  
  getScalingHistory() {
    return {
      resourceHistory: this.resourceHistory.slice(-20), // Last 20 checks
      currentWorkers: this.currentWorkerCount,
      lastScaleUp: this.lastScaleUp,
      lastScaleDown: this.lastScaleDown,
      thresholds: {
        cpu: this.options.cpuThreshold,
        memory: this.options.memoryThreshold
      }
    }
  }
  
  cleanup() {
    this.stopResourceMonitoring()
    this.resourceHistory = []
    this.removeAllListeners()
  }
}

/**
 * Centralized Resource Manager
 * Orchestrates all resource management components
 */
class ResourceManager extends EventEmitter {
  constructor(options = {}) {
    super()
    this.options = {
      enableHealthMonitoring: options.enableHealthMonitoring !== false,
      enableErrorRecovery: options.enableErrorRecovery !== false,
      enableAdaptiveScaling: options.enableAdaptiveScaling !== false,
      ...options
    }
    
    this.workers = new Map()
    this.errorRecovery = new ErrorRecoveryManager(options.errorRecovery)
    this.adaptiveScaling = new AdaptiveScalingManager(options.adaptiveScaling)
    
    this.setupEventHandlers()
  }
  
  setupEventHandlers() {
    // Error recovery events
    this.errorRecovery.on('errorCategorized', (errorInfo) => {
      this.emit('errorCategorized', errorInfo)
    })
    
    this.errorRecovery.on('recoveryAttempt', (info) => {
      this.emit('recoveryAttempt', info)
    })
    
    this.errorRecovery.on('recoverySuccessful', (info) => {
      this.emit('recoverySuccessful', info)
    })
    
    this.errorRecovery.on('recoveryFailed', (info) => {
      this.emit('recoveryFailed', info)
    })
    
    // Adaptive scaling events
    this.adaptiveScaling.on('scalingRecommendation', (recommendation) => {
      this.emit('scalingRecommendation', recommendation)
    })
    
    this.adaptiveScaling.on('workerCountUpdated', (info) => {
      this.emit('workerCountUpdated', info)
    })
  }
  
  registerWorker(workerId, metadata = {}) {
    if (this.options.enableHealthMonitoring) {
      const healthMonitor = new WorkerHealthMonitor(workerId, {
        ...this.options.healthMonitoring,
        ...metadata.healthOptions
      })
      
      this.workers.set(workerId, {
        id: workerId,
        metadata,
        healthMonitor,
        startTime: Date.now(),
        status: 'active'
      })
      
      this.adaptiveScaling.updateWorkerCount(this.workers.size)
      
      this.emit('workerRegistered', {
        workerId,
        metadata,
        totalWorkers: this.workers.size
      })
    }
    
    return this.workers.get(workerId)
  }
  
  unregisterWorker(workerId, reason = 'completed') {
    const worker = this.workers.get(workerId)
    
    if (worker) {
      if (worker.healthMonitor) {
        worker.healthMonitor.cleanup()
      }
      
      this.workers.delete(workerId)
      this.adaptiveScaling.updateWorkerCount(this.workers.size)
      
      this.emit('workerUnregistered', {
        workerId,
        reason,
        totalWorkers: this.workers.size,
        lifetime: Date.now() - worker.startTime
      })
    }
  }
  
  async handleWorkerError(workerId, error, context = {}) {
    const errorInfo = this.errorRecovery.categorizeError(error, {
      workerId,
      ...context
    })
    
    if (errorInfo.recoverable && this.options.enableErrorRecovery) {
      const recoveryFunction = this.createRecoveryFunction(workerId, errorInfo, context)
      const recovered = await this.errorRecovery.attemptRecovery(
        errorInfo,
        recoveryFunction,
        { workerId, ...context }
      )
      
      if (!recovered) {
        // Mark worker as failed and unregister
        this.unregisterWorker(workerId, 'error_recovery_failed')
      }
      
      return recovered
    } else {
      // Unregister non-recoverable worker
      this.unregisterWorker(workerId, 'unrecoverable_error')
      return false
    }
  }
  
  createRecoveryFunction(workerId, errorInfo, context) {
    return async () => {
      // Recovery strategy based on error category
      switch (errorInfo.category) {
        case 'timeout':
          // Restart worker with increased timeout
          return this.restartWorkerWithOptions(workerId, {
            timeout: (context.timeout || 30000) * 1.5
          })
          
        case 'network':
          // Wait and retry network operation
          await new Promise(resolve => setTimeout(resolve, 2000))
          return true
          
        case 'process':
          // Restart worker process
          return this.restartWorkerProcess(workerId)
          
        case 'test_framework':
          // Clear test cache and restart
          return this.restartWorkerWithClearCache(workerId)
          
        default:
          // Generic restart
          return this.restartWorkerProcess(workerId)
      }
    }
  }
  
  async restartWorkerWithOptions(workerId, options) {
    // Placeholder for worker restart logic
    // In a real implementation, this would restart the actual worker process
    console.log(`Restarting worker ${workerId} with options:`, options)
    return true
  }
  
  async restartWorkerProcess(workerId) {
    // Placeholder for process restart logic
    console.log(`Restarting worker process ${workerId}`)
    return true
  }
  
  async restartWorkerWithClearCache(workerId) {
    // Placeholder for cache clearing and restart
    console.log(`Clearing cache and restarting worker ${workerId}`)
    return true
  }
  
  getSystemHealth() {
    const workerHealthReports = []
    
    for (const [workerId, worker] of this.workers) {
      if (worker.healthMonitor) {
        workerHealthReports.push(worker.healthMonitor.getHealthReport())
      }
    }
    
    return {
      totalWorkers: this.workers.size,
      workerHealth: workerHealthReports,
      errorStatistics: this.errorRecovery.getErrorStatistics(),
      scalingHistory: this.adaptiveScaling.getScalingHistory(),
      systemResources: this.adaptiveScaling.getCurrentResourceUsage(),
      timestamp: Date.now()
    }
  }
  
  generateResourceReport() {
    const health = this.getSystemHealth()
    
    return {
      summary: {
        totalWorkers: health.totalWorkers,
        healthyWorkers: health.workerHealth.filter(w => w.healthStatus === 'healthy').length,
        warningWorkers: health.workerHealth.filter(w => w.healthStatus === 'warning').length,
        criticalWorkers: health.workerHealth.filter(w => w.healthStatus === 'critical').length,
        errorRate: health.errorStatistics.errorRate,
        cpuUsage: health.systemResources.cpu,
        memoryUsage: health.systemResources.memory
      },
      details: health,
      recommendations: this.generateRecommendations(health)
    }
  }
  
  generateRecommendations(health) {
    const recommendations = []
    
    // Check for memory issues
    const memoryLeakWorkers = health.workerHealth.filter(
      w => w.memoryTrend === 'increasing' && w.currentMemoryMB > 300
    )
    
    if (memoryLeakWorkers.length > 0) {
      recommendations.push({
        type: 'memory_warning',
        severity: 'high',
        message: `${memoryLeakWorkers.length} workers showing potential memory leaks`,
        action: 'Consider restarting affected workers',
        workers: memoryLeakWorkers.map(w => w.workerId)
      })
    }
    
    // Check error rate
    if (health.errorStatistics.errorRate > 5) {
      recommendations.push({
        type: 'error_rate_warning',
        severity: 'medium',
        message: `High error rate: ${health.errorStatistics.errorRate.toFixed(1)} errors/minute`,
        action: 'Review recent errors and consider reducing parallel workers'
      })
    }
    
    // Check system resources
    if (health.systemResources.cpu > 90) {
      recommendations.push({
        type: 'cpu_warning',
        severity: 'high',
        message: `CPU usage very high: ${health.systemResources.cpu.toFixed(1)}%`,
        action: 'Consider reducing parallel workers to prevent system overload'
      })
    }
    
    return recommendations
  }
  
  cleanup() {
    // Clean up all workers
    for (const [workerId, worker] of this.workers) {
      if (worker.healthMonitor) {
        worker.healthMonitor.cleanup()
      }
    }
    
    this.workers.clear()
    this.errorRecovery.cleanup()
    this.adaptiveScaling.cleanup()
    this.removeAllListeners()
  }
}

// CLI interface
if (require.main === module) {
  const resourceManager = new ResourceManager({
    enableHealthMonitoring: true,
    enableErrorRecovery: true,
    enableAdaptiveScaling: true
  })
  
  // Setup event logging
  resourceManager.on('workerRegistered', (info) => {
    console.log(`✅ Worker registered: ${info.workerId} (Total: ${info.totalWorkers})`)
  })
  
  resourceManager.on('workerUnregistered', (info) => {
    console.log(`❌ Worker unregistered: ${info.workerId} (Reason: ${info.reason})`)
  })
  
  resourceManager.on('errorCategorized', (errorInfo) => {
    console.log(`🚨 Error categorized: ${errorInfo.category} (${errorInfo.severity})`)
  })
  
  resourceManager.on('scalingRecommendation', (recommendation) => {
    console.log(`📊 Scaling recommendation: ${recommendation.action} (${recommendation.reason})`)
  })
  
  // Demo: Register some test workers
  for (let i = 1; i <= 3; i++) {
    resourceManager.registerWorker(`test-worker-${i}`, {
      type: 'test',
      command: 'npm test'
    })
  }
  
  // Generate initial report
  setTimeout(() => {
    const report = resourceManager.generateResourceReport()
    console.log('\n📈 Resource Management Report:')
    console.log(JSON.stringify(report.summary, null, 2))
  }, 2000)
  
  // Cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n🧹 Cleaning up resource manager...')
    resourceManager.cleanup()
    process.exit(0)
  })
}

module.exports = {
  ResourceManager,
  WorkerHealthMonitor,
  ErrorRecoveryManager,
  AdaptiveScalingManager
}