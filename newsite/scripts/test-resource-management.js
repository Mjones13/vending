#!/usr/bin/env node
/**
 * Resource Management Test
 * Tests and demonstrates the resource management system
 */

const { ResourceManager, WorkerHealthMonitor, ErrorRecoveryManager } = require('./resource-manager')
const { ResourceManagedTestRunner, ResourceManagementUtils } = require('./resource-integration')

/**
 * Test suite for resource management functionality
 */
class ResourceManagementTestSuite {
  constructor() {
    this.testResults = []
    this.passedTests = 0
    this.failedTests = 0
  }
  
  async runTest(testName, testFunction) {
    console.log(`\n🧪 Testing: ${testName}`)
    const startTime = Date.now()
    
    try {
      await testFunction()
      const duration = Date.now() - startTime
      console.log(`✅ PASSED: ${testName} (${duration}ms)`)
      this.testResults.push({ name: testName, status: 'passed', duration })
      this.passedTests++
    } catch (error) {
      const duration = Date.now() - startTime
      console.log(`❌ FAILED: ${testName} (${duration}ms)`)
      console.log(`   Error: ${error.message}`)
      this.testResults.push({ name: testName, status: 'failed', duration, error: error.message })
      this.failedTests++
    }
  }
  
  async testWorkerHealthMonitoring() {
    const monitor = new WorkerHealthMonitor('test-worker', {
      memoryThresholdMB: 100,
      healthCheckInterval: 1000
    })
    
    // Simulate some health checks
    for (let i = 0; i < 3; i++) {
      monitor.performHealthCheck()
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    const report = monitor.getHealthReport()
    
    if (!report.workerId || report.workerId !== 'test-worker') {
      throw new Error('Worker ID not set correctly')
    }
    
    if (!report.healthStatus) {
      throw new Error('Health status not reported')
    }
    
    if (typeof report.uptime !== 'number') {
      throw new Error('Uptime not tracked')
    }
    
    monitor.cleanup()
  }
  
  async testErrorCategorization() {
    const errorManager = new ErrorRecoveryManager({
      maxRetryAttempts: 2
    })
    
    // Test different error types
    const timeoutError = new Error('Operation timed out after 30000ms')
    const memoryError = new Error('JavaScript heap out of memory')
    const networkError = new Error('ECONNREFUSED connection refused')
    
    const timeoutInfo = errorManager.categorizeError(timeoutError)
    const memoryInfo = errorManager.categorizeError(memoryError)
    const networkInfo = errorManager.categorizeError(networkError)
    
    if (timeoutInfo.category !== 'timeout') {
      throw new Error(`Expected timeout category, got ${timeoutInfo.category}`)
    }
    
    if (memoryInfo.category !== 'memory') {
      throw new Error(`Expected memory category, got ${memoryInfo.category}`)
    }
    
    if (networkInfo.category !== 'network') {
      throw new Error(`Expected network category, got ${networkInfo.category}`)
    }
    
    if (memoryInfo.severity !== 'critical') {
      throw new Error(`Expected critical severity for memory error, got ${memoryInfo.severity}`)
    }
    
    if (!networkInfo.recoverable) {
      throw new Error('Network errors should be recoverable')
    }
    
    if (memoryInfo.recoverable) {
      throw new Error('Memory errors should not be recoverable')
    }
    
    errorManager.cleanup()
  }
  
  async testErrorRecovery() {
    const errorManager = new ErrorRecoveryManager({
      maxRetryAttempts: 2,
      retryDelayMs: 100
    })
    
    let attemptCount = 0
    const recoveryFunction = async () => {
      attemptCount++
      if (attemptCount < 2) {
        throw new Error('Simulated failure')
      }
      return 'success'
    }
    
    // Use a network error which should be recoverable
    const error = new Error('ECONNREFUSED connection refused')
    const errorInfo = errorManager.categorizeError(error)
    
    // Verify it's marked as recoverable
    if (!errorInfo.recoverable) {
      throw new Error('Network error should be recoverable')
    }
    
    const recovered = await errorManager.attemptRecovery(
      errorInfo,
      recoveryFunction,
      { workerId: 'test-worker' }
    )
    
    if (!recovered) {
      throw new Error('Recovery should have succeeded after retry')
    }
    
    if (attemptCount !== 2) {
      throw new Error(`Expected 2 attempts, got ${attemptCount}`)
    }
    
    errorManager.cleanup()
  }
  
  async testResourceManager() {
    const resourceManager = new ResourceManager({
      enableHealthMonitoring: true,
      enableErrorRecovery: true,
      enableAdaptiveScaling: false // Disable for testing
    })
    
    // Test worker registration
    const worker1 = resourceManager.registerWorker('test-worker-1', {
      type: 'test',
      command: 'echo test'
    })
    
    if (!worker1) {
      throw new Error('Worker registration failed')
    }
    
    const worker2 = resourceManager.registerWorker('test-worker-2', {
      type: 'test',
      command: 'echo test'
    })
    
    // Test health reporting
    const health = resourceManager.getSystemHealth()
    
    if (health.totalWorkers !== 2) {
      throw new Error(`Expected 2 workers, got ${health.totalWorkers}`)
    }
    
    if (health.workerHealth.length !== 2) {
      throw new Error(`Expected 2 health reports, got ${health.workerHealth.length}`)
    }
    
    // Test error handling
    const testError = new Error('Test error for recovery')
    const recovered = await resourceManager.handleWorkerError('test-worker-1', testError)
    
    // The recovery might not succeed, but it should handle the error
    if (typeof recovered !== 'boolean') {
      throw new Error('Error handling should return boolean')
    }
    
    // Test worker unregistration
    resourceManager.unregisterWorker('test-worker-1', 'completed')
    resourceManager.unregisterWorker('test-worker-2', 'completed')
    
    const finalHealth = resourceManager.getSystemHealth()
    if (finalHealth.totalWorkers !== 0) {
      throw new Error(`Expected 0 workers after cleanup, got ${finalHealth.totalWorkers}`)
    }
    
    resourceManager.cleanup()
  }
  
  async testResourceManagedTestRunner() {
    const runner = new ResourceManagedTestRunner(null, {
      enableResourceManagement: true,
      memoryThresholdMB: 200
    })
    
    // Test function execution with resource management
    const testFunction = async () => {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100))
      return 'test-result'
    }
    
    const result = await runner.executeWithResourceManagement(testFunction, {
      test: 'resource-managed-execution'
    })
    
    if (result !== 'test-result') {
      throw new Error(`Expected 'test-result', got ${result}`)
    }
    
    // Test error handling in managed execution
    const errorFunction = async () => {
      throw new Error('Simulated test error')
    }
    
    try {
      await runner.executeWithResourceManagement(errorFunction)
      throw new Error('Error function should have thrown')
    } catch (error) {
      if (error.message !== 'Simulated test error') {
        throw new Error(`Unexpected error: ${error.message}`)
      }
    }
    
    // Generate report
    const report = runner.getResourceHealthReport()
    if (!report || !report.summary) {
      throw new Error('Resource health report should be generated')
    }
    
    runner.cleanup()
  }
  
  async testResourceManagementUtils() {
    // Test wrapped function
    const originalFunction = async (value) => {
      await new Promise(resolve => setTimeout(resolve, 50))
      return value * 2
    }
    
    const wrappedFunction = ResourceManagementUtils.wrapTestFunction(originalFunction)
    const result = await wrappedFunction(5)
    
    if (result !== 10) {
      throw new Error(`Expected 10, got ${result}`)
    }
    
    // Test monitored async operation
    const asyncOperation = async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
      return 'async-result'
    }
    
    const monitoredResult = await ResourceManagementUtils.monitorAsyncOperation(asyncOperation)
    
    if (monitoredResult !== 'async-result') {
      throw new Error(`Expected 'async-result', got ${monitoredResult}`)
    }
  }
  
  async runAllTests() {
    console.log('🚀 Starting Resource Management Test Suite')
    console.log('='.repeat(60))
    
    await this.runTest('Worker Health Monitoring', () => this.testWorkerHealthMonitoring())
    await this.runTest('Error Categorization', () => this.testErrorCategorization())
    await this.runTest('Error Recovery', () => this.testErrorRecovery())
    await this.runTest('Resource Manager', () => this.testResourceManager())
    await this.runTest('Resource Managed Test Runner', () => this.testResourceManagedTestRunner())
    await this.runTest('Resource Management Utils', () => this.testResourceManagementUtils())
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST SUITE RESULTS')
    console.log('='.repeat(60))
    console.log(`✅ Passed: ${this.passedTests}`)
    console.log(`❌ Failed: ${this.failedTests}`)
    console.log(`📈 Success Rate: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`)
    
    if (this.failedTests > 0) {
      console.log('\n❌ Failed Tests:')
      this.testResults.filter(r => r.status === 'failed').forEach(test => {
        console.log(`   ${test.name}: ${test.error}`)
      })
    }
    
    console.log('\n⏱️  Test Performance:')
    this.testResults.forEach(test => {
      const status = test.status === 'passed' ? '✅' : '❌'
      console.log(`   ${status} ${test.name}: ${test.duration}ms`)
    })
    
    console.log('='.repeat(60))
    
    if (this.failedTests > 0) {
      console.log('\n💥 Some tests failed. Resource management may have issues.')
      process.exit(1)
    } else {
      console.log('\n🎉 All tests passed! Resource management is working correctly.')
      process.exit(0)
    }
  }
}

// Demo function to show resource management in action
async function demonstrateResourceManagement() {
  console.log('🎯 Demonstrating Resource Management System')
  console.log('='.repeat(60))
  
  const resourceManager = new ResourceManager({
    enableHealthMonitoring: true,
    enableErrorRecovery: true,
    enableAdaptiveScaling: true
  })
  
  // Register some demo workers
  console.log('👥 Registering demo workers...')
  for (let i = 1; i <= 3; i++) {
    resourceManager.registerWorker(`demo-worker-${i}`, {
      type: 'demo',
      command: `echo "Demo worker ${i}"`
    })
  }
  
  // Wait for health monitoring
  console.log('⏱️  Waiting for health checks...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Generate report
  const report = resourceManager.generateResourceReport()
  console.log('\n📈 Resource Management Report:')
  console.log(JSON.stringify(report.summary, null, 2))
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:')
    report.recommendations.forEach(rec => {
      console.log(`   ${rec.severity.toUpperCase()}: ${rec.message}`)
    })
  }
  
  // Simulate an error
  console.log('\n🚨 Simulating error recovery...')
  const testError = new Error('Demo error for testing recovery')
  await resourceManager.handleWorkerError('demo-worker-1', testError)
  
  // Cleanup
  console.log('\n🧹 Cleaning up demo workers...')
  resourceManager.cleanup()
  
  console.log('✅ Resource management demonstration complete!')
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--demo')) {
    demonstrateResourceManagement().catch(error => {
      console.error('Demo failed:', error)
      process.exit(1)
    })
  } else {
    const testSuite = new ResourceManagementTestSuite()
    testSuite.runAllTests().catch(error => {
      console.error('Test suite failed:', error)
      process.exit(1)
    })
  }
}

module.exports = ResourceManagementTestSuite