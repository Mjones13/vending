#!/usr/bin/env node
/**
 * Monitoring Dashboard
 * Real-time dashboard for parallel test execution monitoring
 */

const { globalMonitor } = require('./parallel-execution-monitor')
const { DashboardReporter } = require('./monitoring-integration')

/**
 * Interactive monitoring dashboard
 */
class InteractiveMonitoringDashboard {
  constructor(options = {}) {
    this.options = {
      refreshInterval: options.refreshInterval || 2000,
      maxLogLines: options.maxLogLines || 20,
      enableSound: options.enableSound || false,
      theme: options.theme || 'default',
      ...options
    }
    
    this.isRunning = false
    this.refreshTimer = null
    this.lastUpdate = null
    this.eventLog = []
    this.stats = {
      totalSessions: 0,
      successfulSessions: 0,
      failedSessions: 0,
      totalWorkers: 0,
      averageSessionDuration: 0,
    }
    
    this.setupEventHandlers()
    this.setupKeyboardHandlers()
  }
  
  setupEventHandlers() {
    // Subscribe to monitoring events
    globalMonitor.on('sessionStarted', (session) => {
      this.addLogEntry(`📊 Session started: ${session.id}`, 'info')
      this.stats.totalSessions++
    })
    
    globalMonitor.on('sessionEnded', (session) => {
      const duration = (session.duration / 1000).toFixed(2)
      const status = session.status === 'completed' ? '✅' : '❌'
      const icon = session.status === 'completed' ? '🎉' : '💥'
      
      this.addLogEntry(`${status} Session ended: ${session.id} (${duration}s)`, 
        session.status === 'completed' ? 'success' : 'error')
      
      if (session.status === 'completed') {
        this.stats.successfulSessions++
      } else {
        this.stats.failedSessions++
      }
      
      this.updateAverageSessionDuration(session.duration)
      
      if (this.options.enableSound && session.status === 'completed') {
        this.playNotificationSound('success')
      } else if (this.options.enableSound) {
        this.playNotificationSound('error')
      }
    })
    
    globalMonitor.on('workerStarted', (worker) => {
      this.addLogEntry(`🚀 Worker started: ${worker.id}`, 'info')
      this.stats.totalWorkers++
    })
    
    globalMonitor.on('workerEnded', (worker) => {
      const duration = (worker.duration / 1000).toFixed(2)
      const status = worker.status === 'completed' ? '✅' : '❌'
      this.addLogEntry(`${status} Worker ended: ${worker.id} (${duration}s)`, 
        worker.status === 'completed' ? 'success' : 'warning')
    })
    
    globalMonitor.on('alert', (alert) => {
      this.addLogEntry(`🚨 ALERT: ${alert.message}`, 'alert')
      
      if (this.options.enableSound) {
        this.playNotificationSound('alert')
      }
    })
    
    globalMonitor.on('runnerError', (errorReport) => {
      this.addLogEntry(`💥 Runner error: ${errorReport.runnerId} - ${errorReport.error.message}`, 'error')
    })
    
    globalMonitor.on('progressUpdate', ({ runnerId, progress }) => {
      this.addLogEntry(`📈 Progress: ${runnerId} - ${JSON.stringify(progress)}`, 'debug')
    })
  }
  
  setupKeyboardHandlers() {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true)
      process.stdin.resume()
      process.stdin.setEncoding('utf8')
      
      process.stdin.on('data', (key) => {
        this.handleKeyPress(key)
      })
    }
  }
  
  handleKeyPress(key) {
    switch (key) {
      case 'q':
      case '\u0003': // Ctrl+C
        this.stop()
        process.exit(0)
        break
        
      case 'r':
        this.refreshDashboard()
        break
        
      case 'c':
        this.clearLogs()
        break
        
      case 's':
        this.showStats()
        break
        
      case 'h':
        this.showHelp()
        break
        
      case 'f':
        this.toggleFilter()
        break
        
      case 'm':
        this.showMonitoringStatus()
        break
        
      case 'd':
        this.downloadReport()
        break
    }
  }
  
  start() {
    this.isRunning = true
    
    // Start global monitor if not already running
    if (!globalMonitor.isMonitoring) {
      globalMonitor.start()
    }
    
    console.clear()
    this.showWelcome()
    
    // Start refresh timer
    this.refreshTimer = setInterval(() => {
      this.refreshDashboard()
    }, this.options.refreshInterval)
    
    // Initial refresh
    this.refreshDashboard()
  }
  
  stop() {
    this.isRunning = false
    
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
    
    console.clear()
    console.log('👋 Monitoring dashboard stopped. Thank you!')
  }
  
  showWelcome() {
    const welcome = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚀 Parallel Test Execution Monitor                        ║
║                              Interactive Dashboard                           ║
╚══════════════════════════════════════════════════════════════════════════════╝

📋 Keyboard shortcuts:
   [r] Refresh now    [c] Clear logs    [s] Show stats    [h] Help
   [f] Toggle filter  [m] Monitor status [d] Download report [q] Quit

Press any key to start monitoring...
`
    console.log(welcome)
  }
  
  refreshDashboard() {
    if (!this.isRunning) return
    
    const report = globalMonitor.generateReport()
    this.lastUpdate = Date.now()
    
    console.clear()
    this.renderDashboard(report)
  }
  
  renderDashboard(report) {
    const timestamp = new Date().toLocaleTimeString()
    
    // Header
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗')
    console.log('║                    🔍 Parallel Test Execution Dashboard                      ║')
    console.log(`║                          Last updated: ${timestamp}                        ║`)
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝')
    
    // Status overview
    this.renderStatusSection(report)
    
    // System metrics
    this.renderSystemMetrics(report)
    
    // Performance trends
    this.renderPerformanceTrends(report)
    
    // Active sessions
    this.renderActiveSessions(report)
    
    // Recent alerts
    this.renderRecentAlerts(report)
    
    // Event log
    this.renderEventLog()
    
    // Footer with shortcuts
    this.renderFooter()
  }
  
  renderStatusSection(report) {
    const status = report.status
    const statusIcon = status.isMonitoring ? '🟢' : '🔴'
    const uptime = (status.uptime / 1000).toFixed(0)
    
    console.log('\n📊 MONITOR STATUS')
    console.log('─'.repeat(80))
    console.log(`${statusIcon} Status: ${status.isMonitoring ? 'ACTIVE' : 'INACTIVE'}`)
    console.log(`⏱️  Uptime: ${uptime}s`)
    console.log(`🏃 Active Sessions: ${status.activeSessions}`)
    console.log(`📈 Total Sessions: ${status.totalSessions}`)
    console.log(`👥 Registered Runners: ${status.runners}`)
    console.log(`🚨 Active Alerts: ${status.alerts}`)
  }
  
  renderSystemMetrics(report) {
    if (!report.currentMetrics) return
    
    const metrics = report.currentMetrics
    const cpuBar = this.createProgressBar(metrics.cpu.usage, 100, 20)
    const memoryBar = this.createProgressBar(metrics.memory.usagePercent, 100, 20)
    
    console.log('\n💻 SYSTEM RESOURCES')
    console.log('─'.repeat(80))
    console.log(`🧠 CPU Usage:    ${cpuBar} ${metrics.cpu.usage.toFixed(1)}%`)
    console.log(`💾 Memory Usage: ${memoryBar} ${metrics.memory.usagePercent.toFixed(1)}%`)
    console.log(`📊 Load Average: ${metrics.cpu.loadAverage['1m'].toFixed(2)}`)
    console.log(`👷 Active Workers: ${metrics.workers.active}`)
  }
  
  renderPerformanceTrends(report) {
    if (!report.performanceTrend) return
    
    const trend = report.performanceTrend
    const trendIcon = trend.direction === 'faster' ? '🚀' : trend.direction === 'slower' ? '🐌' : '📊'
    
    console.log('\n📈 PERFORMANCE TRENDS')
    console.log('─'.repeat(80))
    console.log(`${trendIcon} Trend: ${trend.direction} (${trend.changePercent.toFixed(1)}% change)`)
    console.log(`⚡ Recent Average: ${(trend.recentAverage / 1000).toFixed(2)}s`)
    console.log(`📊 Historical Average: ${(trend.olderAverage / 1000).toFixed(2)}s`)
  }
  
  renderActiveSessions(report) {
    const activeSessions = report.activeSessions || []
    
    console.log('\n🏃 ACTIVE SESSIONS')
    console.log('─'.repeat(80))
    
    if (activeSessions.length === 0) {
      console.log('   No active sessions')
    } else {
      activeSessions.forEach(session => {
        const duration = ((Date.now() - session.startTimestamp) / 1000).toFixed(0)
        console.log(`   📋 ${session.id} (${duration}s running)`)
      })
    }
  }
  
  renderRecentAlerts(report) {
    const alerts = report.recentAlerts || []
    
    console.log('\n🚨 RECENT ALERTS')
    console.log('─'.repeat(80))
    
    if (alerts.length === 0) {
      console.log('   No recent alerts')
    } else {
      alerts.slice(-5).forEach(alert => {
        const time = new Date(alert.timestamp).toLocaleTimeString()
        console.log(`   🚨 [${time}] ${alert.message}`)
      })
    }
  }
  
  renderEventLog() {
    console.log('\n📝 RECENT EVENTS')
    console.log('─'.repeat(80))
    
    const recentEvents = this.eventLog.slice(-this.options.maxLogLines)
    
    if (recentEvents.length === 0) {
      console.log('   No recent events')
    } else {
      recentEvents.forEach(event => {
        const icon = this.getEventIcon(event.level)
        console.log(`   ${icon} [${event.timestamp}] ${event.message}`)
      })
    }
  }
  
  renderFooter() {
    console.log('\n' + '═'.repeat(80))
    console.log('📋 [r]efresh [c]lear [s]tats [h]elp [f]ilter [m]onitor [d]ownload [q]uit')
  }
  
  createProgressBar(value, max, width) {
    const percentage = Math.min(value / max, 1)
    const filled = Math.round(percentage * width)
    const empty = width - filled
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty)
    return `[${bar}]`
  }
  
  getEventIcon(level) {
    switch (level) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'alert': return '🚨'
      case 'info': return 'ℹ️'
      case 'debug': return '🔍'
      default: return '📝'
    }
  }
  
  addLogEntry(message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString()
    
    this.eventLog.push({
      timestamp,
      message,
      level,
      fullTimestamp: Date.now(),
    })
    
    // Trim log to max size
    if (this.eventLog.length > 1000) {
      this.eventLog = this.eventLog.slice(-1000)
    }
  }
  
  updateAverageSessionDuration(duration) {
    const totalSessions = this.stats.successfulSessions + this.stats.failedSessions
    this.stats.averageSessionDuration = (
      (this.stats.averageSessionDuration * (totalSessions - 1) + duration) / totalSessions
    )
  }
  
  clearLogs() {
    this.eventLog = []
    this.addLogEntry('Event log cleared', 'info')
    this.refreshDashboard()
  }
  
  showStats() {
    console.clear()
    
    console.log('📊 DETAILED STATISTICS')
    console.log('═'.repeat(80))
    console.log(`Total Sessions: ${this.stats.totalSessions}`)
    console.log(`Successful Sessions: ${this.stats.successfulSessions}`)
    console.log(`Failed Sessions: ${this.stats.failedSessions}`)
    console.log(`Success Rate: ${((this.stats.successfulSessions / this.stats.totalSessions) * 100 || 0).toFixed(1)}%`)
    console.log(`Total Workers: ${this.stats.totalWorkers}`)
    console.log(`Average Session Duration: ${(this.stats.averageSessionDuration / 1000).toFixed(2)}s`)
    
    const report = globalMonitor.generateReport()
    if (report.baseline) {
      console.log(`\nBaseline Average Duration: ${(report.baseline.averageDuration / 1000).toFixed(2)}s`)
      console.log(`Baseline Average Tests: ${report.baseline.averageTests}`)
      console.log(`Baseline Session Count: ${report.baseline.sessionCount}`)
    }
    
    console.log('\nPress any key to return to dashboard...')
    
    process.stdin.once('data', () => {
      this.refreshDashboard()
    })
  }
  
  showHelp() {
    console.clear()
    
    console.log('❓ HELP & SHORTCUTS')
    console.log('═'.repeat(80))
    console.log('r - Refresh dashboard immediately')
    console.log('c - Clear event log')
    console.log('s - Show detailed statistics')
    console.log('h - Show this help screen')
    console.log('f - Toggle event filter (not implemented)')
    console.log('m - Show monitoring system status')
    console.log('d - Download monitoring report as JSON')
    console.log('q - Quit dashboard')
    console.log('')
    console.log('The dashboard auto-refreshes every 2 seconds by default.')
    console.log('All events are logged in real-time from the monitoring system.')
    
    console.log('\nPress any key to return to dashboard...')
    
    process.stdin.once('data', () => {
      this.refreshDashboard()
    })
  }
  
  showMonitoringStatus() {
    console.clear()
    
    const status = globalMonitor.getStatus()
    
    console.log('🔍 MONITORING SYSTEM STATUS')
    console.log('═'.repeat(80))
    console.log(`Instance ID: ${status.instanceId}`)
    console.log(`Is Monitoring: ${status.isMonitoring}`)
    console.log(`Uptime: ${(status.uptime / 1000).toFixed(2)}s`)
    console.log(`Registered Runners: ${status.runners}`)
    console.log(`Active Sessions: ${status.activeSessions}`)
    console.log(`Total Sessions: ${status.totalSessions}`)
    console.log(`Total Alerts: ${status.alerts}`)
    console.log(`Historical Sessions: ${status.historicalSessions}`)
    
    console.log('\nPress any key to return to dashboard...')
    
    process.stdin.once('data', () => {
      this.refreshDashboard()
    })
  }
  
  downloadReport() {
    const fs = require('fs')
    const path = require('path')
    
    const report = globalMonitor.generateReport()
    const filename = `monitoring-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    const filepath = path.join(__dirname, '..', filename)
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(report, null, 2))
      this.addLogEntry(`Report downloaded: ${filename}`, 'success')
    } catch (error) {
      this.addLogEntry(`Failed to download report: ${error.message}`, 'error')
    }
  }
  
  toggleFilter() {
    // Placeholder for event filtering functionality
    this.addLogEntry('Event filtering not yet implemented', 'info')
  }
  
  playNotificationSound(type) {
    // Placeholder for sound notifications
    // Could be implemented with system bell or audio libraries
    process.stdout.write('\u0007') // System bell
  }
}

// CLI interface
if (require.main === module) {
  const dashboard = new InteractiveMonitoringDashboard({
    refreshInterval: parseInt(process.argv[2]) || 2000,
    enableSound: process.argv.includes('--sound'),
    theme: process.argv.includes('--dark') ? 'dark' : 'default',
  })
  
  console.log('🚀 Starting Parallel Test Execution Dashboard...')
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    dashboard.stop()
    process.exit(0)
  })
  
  process.on('SIGTERM', () => {
    dashboard.stop()
    process.exit(0)
  })
  
  dashboard.start()
}

module.exports = InteractiveMonitoringDashboard