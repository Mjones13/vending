/**
 * Parallel Test Sequencer
 * Optimizes test distribution for parallel execution on M2 MacBook
 */

const Sequencer = require('@jest/test-sequencer').default
const path = require('path')
const fs = require('fs')

class ParallelTestSequencer extends Sequencer {
  /**
   * Sort tests for optimal parallel execution
   * Strategy: 
   * 1. Fast tests first for quick feedback
   * 2. Heavy tests distributed across workers
   * 3. Animation tests grouped together (they use similar resources)
   */
  sort(tests) {
    const testsByCategory = this.categorizeTests(tests)
    const testsByDuration = this.estimateTestDurations(tests)
    
    // Sort strategy for parallel execution:
    // 1. Unit tests (fast) - distributed evenly
    // 2. Component tests (medium) - distributed evenly  
    // 3. Animation tests (medium, resource-heavy) - grouped
    // 4. Integration tests (slow) - distributed carefully
    // 5. Page tests (slowest) - run last
    
    const sortedTests = [
      ...this.distributeEvenly(testsByCategory.unit, testsByDuration),
      ...this.distributeEvenly(testsByCategory.component, testsByDuration),
      ...this.groupAnimationTests(testsByCategory.animation, testsByDuration),
      ...this.distributeHeavyTests(testsByCategory.integration, testsByDuration),
      ...this.distributeHeavyTests(testsByCategory.page, testsByDuration),
    ]
    
    if (process.env.JEST_VERBOSE === 'true') {
      console.log('🎯 Parallel Test Distribution:')
      console.log(`   Unit tests: ${testsByCategory.unit.length}`)
      console.log(`   Component tests: ${testsByCategory.component.length}`)
      console.log(`   Animation tests: ${testsByCategory.animation.length}`)
      console.log(`   Integration tests: ${testsByCategory.integration.length}`)
      console.log(`   Page tests: ${testsByCategory.page.length}`)
      console.log(`   Total: ${sortedTests.length} tests`)
    }
    
    return sortedTests
  }
  
  /**
   * Categorize tests by type for optimal distribution
   */
  categorizeTests(tests) {
    const categories = {
      unit: [],
      component: [],
      animation: [],
      integration: [],
      page: [],
    }
    
    tests.forEach(test => {
      const testPath = test.path
      
      if (testPath.includes('__tests__/utils/') || testPath.includes('__tests__/hooks/')) {
        categories.unit.push(test)
      } else if (testPath.includes('__tests__/components/')) {
        categories.component.push(test)
      } else if (testPath.includes('__tests__/animations/')) {
        categories.animation.push(test)
      } else if (testPath.includes('__tests__/pages/')) {
        categories.page.push(test)
      } else {
        categories.integration.push(test)
      }
    })
    
    return categories
  }
  
  /**
   * Estimate test durations based on file size and complexity
   */
  estimateTestDurations(tests) {
    const durations = new Map()
    
    tests.forEach(test => {
      try {
        const stats = fs.statSync(test.path)
        const fileSize = stats.size
        
        // Estimate duration based on file size and test type
        let estimatedDuration = Math.max(100, fileSize / 100) // Base: 100ms per 10KB
        
        // Adjust based on test type
        if (test.path.includes('animations/')) {
          estimatedDuration *= 2 // Animation tests are typically slower
        } else if (test.path.includes('pages/')) {
          estimatedDuration *= 3 // Page tests are slowest
        } else if (test.path.includes('components/')) {
          estimatedDuration *= 1.5 // Component tests are medium
        }
        
        durations.set(test.path, estimatedDuration)
      } catch (error) {
        // Fallback duration if file can't be read
        durations.set(test.path, 1000)
      }
    })
    
    return durations
  }
  
  /**
   * Distribute tests evenly across workers for optimal parallel execution
   */
  distributeEvenly(tests, durations) {
    // Sort by estimated duration (longest first for better load balancing)
    return tests.sort((a, b) => {
      const durationA = durations.get(a.path) || 0
      const durationB = durations.get(b.path) || 0
      return durationB - durationA
    })
  }
  
  /**
   * Group animation tests together since they use similar resources
   */
  groupAnimationTests(tests, durations) {
    // Group by animation type for better resource utilization
    const animationGroups = {
      hover: [],
      stagger: [],
      rotating: [],
      other: [],
    }
    
    tests.forEach(test => {
      if (test.path.includes('hover')) {
        animationGroups.hover.push(test)
      } else if (test.path.includes('stagger')) {
        animationGroups.stagger.push(test)
      } else if (test.path.includes('rotating')) {
        animationGroups.rotating.push(test)
      } else {
        animationGroups.other.push(test)
      }
    })
    
    // Return grouped tests for sequential execution within groups
    return [
      ...this.distributeEvenly(animationGroups.hover, durations),
      ...this.distributeEvenly(animationGroups.stagger, durations),
      ...this.distributeEvenly(animationGroups.rotating, durations),
      ...this.distributeEvenly(animationGroups.other, durations),
    ]
  }
  
  /**
   * Distribute heavy tests carefully to avoid worker overload
   */
  distributeHeavyTests(tests, durations) {
    // For heavy tests, alternate between workers more carefully
    const sorted = this.distributeEvenly(tests, durations)
    
    // Add delay markers for heavy tests to prevent worker thrashing
    return sorted.map(test => {
      test._isHeavy = true
      return test
    })
  }
}

module.exports = ParallelTestSequencer