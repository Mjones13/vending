#!/usr/bin/env node
/**
 * Parallel Execution Monitor
 * Unified monitoring and reporting system for all parallel test execution
 */

const { EventEmitter } = require('events')
const { performance } = require('perf_hooks')
const os = require('os')
const fs = require('fs')
const path = require('path')

/**
 * Central monitoring service for parallel test execution
 */
class ParallelExecutionMonitor extends EventEmitter {
  constructor(options = {}) {
    super()
    this.instanceId = `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.startTime = performance.now()
    this.options = {
      logLevel: options.logLevel || 'info',
      enableDashboard: options.enableDashboard !== false,
      historicalDataRetention: options.historicalDataRetention || 7, // days
      alertThresholds: {
        cpuUsage: options.cpuThreshold || 85,
        memoryUsage: options.memoryThreshold || 80,
        workerFailureRate: options.failureThreshold || 20,
        executionTimeIncrease: options.timeThreshold || 50, // percent
        ...options.alertThresholds
      },
      ...options
    }
    
    // Monitoring data
    this.workerRegistry = new Map()
    this.executionSessions = new Map()
    this.systemMetrics = []
    this.alerts = []
    this.historicalData = this.loadHistoricalData()
    
    // Real-time monitoring
    this.monitoringInterval = null
    this.isMonitoring = false
    
    this.initializeMonitoring()
  }
  
  initializeMonitoring() {
    // Set up system monitoring
    this.setupSystemMonitoring()
    
    // Initialize data persistence
    this.setupDataPersistence()
    
    // Start dashboard if enabled
    if (this.options.enableDashboard) {
      this.initializeDashboard()
    }
    
    this.log('info', `Parallel Execution Monitor initialized [${this.instanceId}]`)
  }
  
  /**
   * Register a test runner with the monitor
   */
  registerTestRunner(runnerId, metadata = {}) {
    const runner = {
      id: runnerId,
      registeredAt: Date.now(),
      metadata,
      workers: new Map(),
      sessions: [],
      status: 'registered',
      lastHeartbeat: Date.now(),
    }
    
    this.workerRegistry.set(runnerId, runner)
    this.log('info', `Test runner registered: ${runnerId}`)
    this.emit('runnerRegistered', runner)
    
    return {
      reportWorkerStart: (workerId, workerMetadata) => this.reportWorkerStart(runnerId, workerId, workerMetadata),
      reportWorkerEnd: (workerId, result) => this.reportWorkerEnd(runnerId, workerId, result),
      reportProgress: (progress) => this.reportProgress(runnerId, progress),
      reportError: (error) => this.reportError(runnerId, error),
      heartbeat: () => this.heartbeat(runnerId),
    }
  }
  
  /**
   * Start monitoring session
   */
  startSession(sessionId, config = {}) {
    const session = {
      id: sessionId,
      startTime: performance.now(),
      startTimestamp: Date.now(),
      config,
      runners: [],
      workers: new Map(),
      metrics: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        executionTime: 0,
        workerCount: 0,
        resourceUsage: {
          peakCpu: 0,
          peakMemory: 0,
          averageCpu: 0,
          averageMemory: 0,
        }
      },
      status: 'running',
    }
    
    this.executionSessions.set(sessionId, session)
    this.log('info', `Monitoring session started: ${sessionId}`)
    this.emit('sessionStarted', session)
    
    return session
  }
  
  /**
   * End monitoring session
   */
  endSession(sessionId, result = {}) {
    const session = this.executionSessions.get(sessionId)
    if (!session) {
      this.log('warn', `Session not found: ${sessionId}`)
      return null
    }
    
    session.endTime = performance.now()
    session.endTimestamp = Date.now()
    session.duration = session.endTime - session.startTime
    session.result = result
    session.status = result.success ? 'completed' : 'failed'
    
    // Calculate final metrics
    this.calculateSessionMetrics(session)
    
    // Check for alerts
    this.checkSessionAlerts(session)
    
    // Store historical data
    this.storeHistoricalData(session)
    
    this.log('info', `Monitoring session ended: ${sessionId} (${(session.duration / 1000).toFixed(2)}s)`)
    this.emit('sessionEnded', session)
    
    return session
  }
  
  /**
   * Report worker start
   */
  reportWorkerStart(runnerId, workerId, metadata = {}) {
    const runner = this.workerRegistry.get(runnerId)
    if (!runner) {
      this.log('warn', `Runner not found: ${runnerId}`)
      return
    }
    
    const worker = {
      id: workerId,
      runnerId,
      startTime: performance.now(),
      startTimestamp: Date.now(),
      metadata,
      status: 'running',
      progress: {
        testsCompleted: 0,
        totalTests: metadata.totalTests || 0,
        currentTest: null,
      },
      resourceUsage: {
        cpu: 0,
        memory: 0,
        pid: metadata.pid,
      }
    }
    
    runner.workers.set(workerId, worker)
    this.log('debug', `Worker started: ${workerId} (runner: ${runnerId})`)
    this.emit('workerStarted', worker)
  }
  
  /**
   * Report worker end
   */
  reportWorkerEnd(runnerId, workerId, result = {}) {
    const runner = this.workerRegistry.get(runnerId)
    const worker = runner?.workers.get(workerId)
    
    if (!worker) {
      this.log('warn', `Worker not found: ${workerId}`)
      return
    }
    
    worker.endTime = performance.now()
    worker.endTimestamp = Date.now()
    worker.duration = worker.endTime - worker.startTime
    worker.result = result
    worker.status = result.success ? 'completed' : 'failed'
    
    this.log('debug', `Worker ended: ${workerId} (${(worker.duration / 1000).toFixed(2)}s)`)
    this.emit('workerEnded', worker)
  }
  
  /**
   * Report progress from runner
   */
  reportProgress(runnerId, progress) {
    const runner = this.workerRegistry.get(runnerId)
    if (!runner) return
    
    runner.lastHeartbeat = Date.now()
    runner.progress = progress
    
    this.emit('progressUpdate', { runnerId, progress })
  }
  
  /**
   * Report error from runner
   */
  reportError(runnerId, error) {
    const runner = this.workerRegistry.get(runnerId)
    if (!runner) return
    
    const errorReport = {
      runnerId,
      timestamp: Date.now(),
      error: {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name,
      },
      context: runner.metadata,
    }
    
    this.log('error', `Runner error: ${runnerId} - ${error.message}`)
    this.emit('runnerError', errorReport)
    
    // Check if this triggers an alert
    this.checkErrorAlerts(errorReport)
  }
  
  /**
   * Heartbeat from runner
   */
  heartbeat(runnerId) {
    const runner = this.workerRegistry.get(runnerId)
    if (runner) {
      runner.lastHeartbeat = Date.now()
      runner.status = 'active'
    }
  }
  
  /**
   * Setup system monitoring
   */
  setupSystemMonitoring() {
    this.monitoringInterval = setInterval(() => {
      if (!this.isMonitoring) return
      
      const metrics = this.collectSystemMetrics()
      this.systemMetrics.push(metrics)
      
      // Keep only recent metrics (last hour)
      const oneHourAgo = Date.now() - (60 * 60 * 1000)
      this.systemMetrics = this.systemMetrics.filter(m => m.timestamp > oneHourAgo)
      
      // Check system alerts
      this.checkSystemAlerts(metrics)
      
      this.emit('systemMetrics', metrics)
    }, 5000) // Every 5 seconds
  }
  
  /**
   * Collect system metrics
   */
  collectSystemMetrics() {
    const cpus = os.cpus()
    const loadAvg = os.loadavg()
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    
    return {
      timestamp: Date.now(),
      cpu: {
        count: cpus.length,
        loadAverage: {
          '1m': loadAvg[0],
          '5m': loadAvg[1],
          '15m': loadAvg[2],
        },
        usage: (loadAvg[0] / cpus.length) * 100,
      },
      memory: {
        total: totalMemory,
        free: freeMemory,
        used: usedMemory,
        usagePercent: (usedMemory / totalMemory) * 100,
      },
      workers: {
        active: Array.from(this.workerRegistry.values())
          .reduce((total, runner) => total + runner.workers.size, 0),
        total: this.workerRegistry.size,
      },
      sessions: {
        active: Array.from(this.executionSessions.values())
          .filter(s => s.status === 'running').length,
        total: this.executionSessions.size,
      }
    }
  }
  
  /**
   * Check system alerts
   */
  checkSystemAlerts(metrics) {
    const alerts = []
    
    // CPU usage alert
    if (metrics.cpu.usage > this.options.alertThresholds.cpuUsage) {
      alerts.push({
        type: 'cpu_high',
        severity: 'warning',
        message: `High CPU usage: ${metrics.cpu.usage.toFixed(1)}%`,
        threshold: this.options.alertThresholds.cpuUsage,
        current: metrics.cpu.usage,
        timestamp: Date.now(),
      })
    }
    
    // Memory usage alert
    if (metrics.memory.usagePercent > this.options.alertThresholds.memoryUsage) {
      alerts.push({
        type: 'memory_high',
        severity: 'warning',
        message: `High memory usage: ${metrics.memory.usagePercent.toFixed(1)}%`,
        threshold: this.options.alertThresholds.memoryUsage,
        current: metrics.memory.usagePercent,
        timestamp: Date.now(),
      })
    }
    
    // Process alerts
    alerts.forEach(alert => {
      this.alerts.push(alert)
      this.log('warn', `ALERT: ${alert.message}`)
      this.emit('alert', alert)
    })
  }
  
  /**
   * Check session alerts
   */
  checkSessionAlerts(session) {
    const alerts = []
    
    // Check against historical baselines
    if (this.historicalData.length > 0) {
      const baseline = this.calculateBaseline()
      
      if (session.duration > baseline.averageDuration * (1 + this.options.alertThresholds.executionTimeIncrease / 100)) {
        alerts.push({
          type: 'execution_slow',
          severity: 'warning',
          message: `Session execution slower than baseline: ${(session.duration / 1000).toFixed(2)}s vs ${(baseline.averageDuration / 1000).toFixed(2)}s`,
          session: session.id,
          timestamp: Date.now(),
        })
      }
      
      const failureRate = (session.metrics.failedTests / session.metrics.totalTests) * 100
      if (failureRate > this.options.alertThresholds.workerFailureRate) {
        alerts.push({
          type: 'high_failure_rate',
          severity: 'error',
          message: `High failure rate in session: ${failureRate.toFixed(1)}%`,
          session: session.id,
          timestamp: Date.now(),
        })
      }
    }
    
    alerts.forEach(alert => {
      this.alerts.push(alert)
      this.log('warn', `SESSION ALERT: ${alert.message}`)
      this.emit('sessionAlert', alert)
    })
  }
  
  /**
   * Check error alerts
   */
  checkErrorAlerts(errorReport) {
    // Look for error patterns
    const recentErrors = this.alerts
      .filter(a => a.type === 'runner_error' && a.timestamp > Date.now() - 300000) // Last 5 minutes
      .filter(a => a.runnerId === errorReport.runnerId)
    
    if (recentErrors.length >= 3) {
      const alert = {
        type: 'repeated_errors',
        severity: 'error',
        message: `Repeated errors from runner: ${errorReport.runnerId}`,
        runnerId: errorReport.runnerId,
        errorCount: recentErrors.length + 1,
        timestamp: Date.now(),
      }
      
      this.alerts.push(alert)
      this.log('error', `ERROR PATTERN ALERT: ${alert.message}`)
      this.emit('errorPattern', alert)
    }
  }
  
  /**
   * Calculate session metrics
   */
  calculateSessionMetrics(session) {
    let totalTests = 0
    let passedTests = 0
    let failedTests = 0
    let workerCount = 0
    
    for (const runner of this.workerRegistry.values()) {
      for (const worker of runner.workers.values()) {
        if (worker.result) {
          totalTests += worker.result.totalTests || 0
          passedTests += worker.result.passedTests || 0
          failedTests += worker.result.failedTests || 0
          workerCount++
        }
      }
    }
    
    session.metrics = {
      totalTests,
      passedTests,
      failedTests,
      executionTime: session.duration,
      workerCount,
      resourceUsage: this.calculateResourceUsage(session),
    }
  }
  
  /**
   * Calculate resource usage for session
   */
  calculateResourceUsage(session) {
    const sessionMetrics = this.systemMetrics.filter(m => 
      m.timestamp >= session.startTimestamp && m.timestamp <= session.endTimestamp
    )
    
    if (sessionMetrics.length === 0) {
      return { peakCpu: 0, peakMemory: 0, averageCpu: 0, averageMemory: 0 }
    }
    
    const cpuUsages = sessionMetrics.map(m => m.cpu.usage)
    const memoryUsages = sessionMetrics.map(m => m.memory.usagePercent)
    
    return {
      peakCpu: Math.max(...cpuUsages),
      peakMemory: Math.max(...memoryUsages),
      averageCpu: cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length,
      averageMemory: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
    }
  }
  
  /**
   * Load historical data
   */
  loadHistoricalData() {
    const dataPath = path.join(__dirname, '../.parallel-monitoring-history.json')
    try {
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
        // Filter out old data
        const cutoff = Date.now() - (this.options.historicalDataRetention * 24 * 60 * 60 * 1000)
        return data.filter(session => session.endTimestamp > cutoff)
      }
    } catch (error) {
      this.log('warn', 'Could not load historical data:', error.message)
    }
    return []
  }
  
  /**
   * Store historical data
   */
  storeHistoricalData(session) {
    this.historicalData.push({
      id: session.id,
      startTimestamp: session.startTimestamp,
      endTimestamp: session.endTimestamp,
      duration: session.duration,
      metrics: session.metrics,
      result: session.result,
    })
    
    // Persist to disk
    const dataPath = path.join(__dirname, '../.parallel-monitoring-history.json')
    try {
      fs.writeFileSync(dataPath, JSON.stringify(this.historicalData, null, 2))
    } catch (error) {
      this.log('warn', 'Could not save historical data:', error.message)
    }
  }
  
  /**
   * Calculate baseline from historical data
   */
  calculateBaseline() {
    if (this.historicalData.length === 0) return null
    
    const recentData = this.historicalData.slice(-10) // Last 10 sessions
    const durations = recentData.map(d => d.duration)
    const totalTests = recentData.map(d => d.metrics.totalTests)
    
    return {
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      averageTests: totalTests.reduce((a, b) => a + b, 0) / totalTests.length,
      sessionCount: recentData.length,
    }
  }
  
  /**
   * Setup data persistence
   */
  setupDataPersistence() {
    // Periodic cleanup of old data
    setInterval(() => {
      const cutoff = Date.now() - (this.options.historicalDataRetention * 24 * 60 * 60 * 1000)
      this.historicalData = this.historicalData.filter(session => session.endTimestamp > cutoff)
      this.alerts = this.alerts.filter(alert => alert.timestamp > Date.now() - (24 * 60 * 60 * 1000)) // Keep alerts for 24 hours
    }, 60 * 60 * 1000) // Every hour
  }
  
  /**
   * Initialize dashboard
   */
  initializeDashboard() {
    // This would integrate with a web dashboard or terminal interface
    this.log('info', 'Dashboard monitoring enabled')
  }
  
  /**
   * Start monitoring
   */
  start() {
    this.isMonitoring = true
    this.log('info', 'Parallel execution monitoring started')
    this.emit('monitoringStarted')
  }
  
  /**
   * Stop monitoring
   */
  stop() {
    this.isMonitoring = false
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }
    this.log('info', 'Parallel execution monitoring stopped')
    this.emit('monitoringStopped')
  }
  
  /**
   * Get current status
   */
  getStatus() {
    return {
      instanceId: this.instanceId,
      uptime: performance.now() - this.startTime,
      isMonitoring: this.isMonitoring,
      runners: this.workerRegistry.size,
      activeSessions: Array.from(this.executionSessions.values()).filter(s => s.status === 'running').length,
      totalSessions: this.executionSessions.size,
      alerts: this.alerts.length,
      historicalSessions: this.historicalData.length,
    }
  }
  
  /**
   * Generate monitoring report
   */
  generateReport() {
    const status = this.getStatus()
    const latestMetrics = this.systemMetrics[this.systemMetrics.length - 1]
    const baseline = this.calculateBaseline()
    
    return {
      timestamp: Date.now(),
      status,
      currentMetrics: latestMetrics,
      baseline,
      recentAlerts: this.alerts.slice(-10),
      activeSessions: Array.from(this.executionSessions.values()).filter(s => s.status === 'running'),
      performanceTrend: this.calculatePerformanceTrend(),
    }
  }
  
  /**
   * Calculate performance trend
   */
  calculatePerformanceTrend() {
    if (this.historicalData.length < 2) return null
    
    const recent = this.historicalData.slice(-5)
    const older = this.historicalData.slice(-10, -5)
    
    if (older.length === 0) return null
    
    const recentAvg = recent.reduce((sum, d) => sum + d.duration, 0) / recent.length
    const olderAvg = older.reduce((sum, d) => sum + d.duration, 0) / older.length
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100
    
    return {
      direction: change > 5 ? 'slower' : change < -5 ? 'faster' : 'stable',
      changePercent: Math.abs(change),
      recentAverage: recentAvg,
      olderAverage: olderAvg,
    }
  }
  
  /**
   * Logging utility
   */
  log(level, ...args) {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 }
    const currentLevel = levels[this.options.logLevel] || 2
    
    if (levels[level] <= currentLevel) {
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] [${level.toUpperCase()}] [Monitor]`, ...args)
    }
  }
}

// Export the monitor class and create a singleton instance
const globalMonitor = new ParallelExecutionMonitor()

module.exports = {
  ParallelExecutionMonitor,
  globalMonitor,
  
  // Convenience functions for integration
  registerRunner: (id, metadata) => globalMonitor.registerTestRunner(id, metadata),
  startSession: (id, config) => globalMonitor.startSession(id, config),
  endSession: (id, result) => globalMonitor.endSession(id, result),
  start: () => globalMonitor.start(),
  stop: () => globalMonitor.stop(),
  getStatus: () => globalMonitor.getStatus(),
  generateReport: () => globalMonitor.generateReport(),
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2] || 'start'
  
  switch (command) {
    case 'start':
      globalMonitor.start()
      console.log('Parallel execution monitor started. Press Ctrl+C to stop.')
      break
      
    case 'status':
      console.log(JSON.stringify(globalMonitor.getStatus(), null, 2))
      break
      
    case 'report':
      console.log(JSON.stringify(globalMonitor.generateReport(), null, 2))
      break
      
    default:
      console.log('Usage: node parallel-execution-monitor.js [start|status|report]')
      process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down monitor...')
  globalMonitor.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  globalMonitor.stop()
  process.exit(0)
})