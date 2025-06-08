/**
 * Test Environment Configurator
 * Configures optimized test environments for different types of parallel testing
 */

import { OptimizedTestEnvironment, TestEnvironments } from './test-environment-optimizer'
import { NextJSTestEnvironment } from './nextjs-test-mocks'
import { performance } from 'perf_hooks'

export interface TestEnvironmentConfig {
  type: 'unit' | 'integration' | 'animation' | 'e2e' | 'performance'
  nextjs: boolean
  database: boolean
  cache: boolean
  api: boolean
  initialRoute?: string
  apiLatency?: number
  seed?: {
    collections?: Record<string, any[]>
    cache?: Record<string, any>
    apiEndpoints?: Record<string, any>
  }
}

/**
 * Comprehensive test environment that combines all optimizations
 */
export class ComprehensiveTestEnvironment {
  private optimizedEnv?: OptimizedTestEnvironment
  private nextjsEnv?: NextJSTestEnvironment
  private config: TestEnvironmentConfig
  private instanceId: string
  private setupStartTime: number
  
  constructor(config: TestEnvironmentConfig) {
    this.config = config
    this.instanceId = `comprehensive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.setupStartTime = performance.now()
    
    this.initializeEnvironment()
  }
  
  private initializeEnvironment(): void {
    // Initialize base optimized environment
    if (this.config.database || this.config.cache || this.config.api) {
      this.optimizedEnv = this.createOptimizedEnvironment()
    }
    
    // Initialize Next.js environment
    if (this.config.nextjs) {
      this.nextjsEnv = new NextJSTestEnvironment(this.config.initialRoute)
    }
    
    // Seed environment with test data
    if (this.config.seed && this.optimizedEnv) {
      this.optimizedEnv.seed(this.config.seed)
    }
  }
  
  private createOptimizedEnvironment(): OptimizedTestEnvironment {
    const options = {
      apiLatency: this.config.apiLatency || this.getDefaultLatency(),
      cacheEnabled: this.config.cache,
    }
    
    switch (this.config.type) {
      case 'unit':
        return TestEnvironments.unit()
      case 'integration':
        return TestEnvironments.integration()
      case 'e2e':
        return TestEnvironments.e2e()
      case 'performance':
        return TestEnvironments.performance()
      default:
        return new OptimizedTestEnvironment(options)
    }
  }
  
  private getDefaultLatency(): number {
    switch (this.config.type) {
      case 'unit': return 0
      case 'integration': return 10
      case 'animation': return 5
      case 'e2e': return 50
      case 'performance': return 0
      default: return 10
    }
  }
  
  /**
   * Get database instance
   */
  getDatabase() {
    if (!this.config.database || !this.optimizedEnv) {
      throw new Error('Database not enabled in this test environment')
    }
    return this.optimizedEnv.getDatabase()
  }
  
  /**
   * Get API service instance
   */
  getAPIService() {
    if (!this.config.api || !this.optimizedEnv) {
      throw new Error('API service not enabled in this test environment')
    }
    return this.optimizedEnv.getAPIService()
  }
  
  /**
   * Get cache instance
   */
  getCache() {
    if (!this.config.cache || !this.optimizedEnv) {
      throw new Error('Cache not enabled in this test environment')
    }
    return this.optimizedEnv.getCache()
  }
  
  /**
   * Get Next.js router
   */
  getRouter() {
    if (!this.config.nextjs || !this.nextjsEnv) {
      throw new Error('Next.js environment not enabled')
    }
    return this.nextjsEnv.getRouter()
  }
  
  /**
   * Get Next.js API handler
   */
  getNextAPI() {
    if (!this.config.nextjs || !this.nextjsEnv) {
      throw new Error('Next.js environment not enabled')
    }
    return this.nextjsEnv.getAPI()
  }
  
  /**
   * Navigate to route (Next.js only)
   */
  async navigateTo(route: string): Promise<void> {
    if (!this.config.nextjs || !this.nextjsEnv) {
      throw new Error('Next.js environment not enabled')
    }
    await this.nextjsEnv.navigateTo(route)
  }
  
  /**
   * Get comprehensive environment statistics
   */
  getStats() {
    const setupTime = performance.now() - this.setupStartTime
    
    const stats: any = {
      instanceId: this.instanceId,
      type: this.config.type,
      setupTimeMs: setupTime,
      config: this.config,
    }
    
    if (this.optimizedEnv) {
      stats.optimizedEnv = this.optimizedEnv.getStats()
    }
    
    if (this.nextjsEnv) {
      stats.nextjsEnv = this.nextjsEnv.getStats()
    }
    
    return stats
  }
  
  /**
   * Cleanup all environments
   */
  async cleanup(): Promise<void> {
    const cleanupPromises: Promise<void>[] = []
    
    if (this.optimizedEnv) {
      cleanupPromises.push(this.optimizedEnv.cleanup())
    }
    
    if (this.nextjsEnv) {
      this.nextjsEnv.cleanup()
    }
    
    await Promise.all(cleanupPromises)
  }
}

/**
 * Pre-configured test environment setups
 */
export const TestEnvironmentConfigurations = {
  /**
   * Unit test environment - minimal, fast
   */
  unit: (options: Partial<TestEnvironmentConfig> = {}): TestEnvironmentConfig => ({
    type: 'unit',
    nextjs: false,
    database: false,
    cache: false,
    api: false,
    apiLatency: 0,
    ...options,
  }),
  
  /**
   * Component test environment with Next.js
   */
  component: (options: Partial<TestEnvironmentConfig> = {}): TestEnvironmentConfig => ({
    type: 'unit',
    nextjs: true,
    database: false,
    cache: false,
    api: false,
    initialRoute: '/',
    apiLatency: 0,
    ...options,
  }),
  
  /**
   * Animation test environment with minimal services
   */
  animation: (options: Partial<TestEnvironmentConfig> = {}): TestEnvironmentConfig => ({
    type: 'animation',
    nextjs: true,
    database: false,
    cache: true,
    api: false,
    initialRoute: '/',
    apiLatency: 0,
    ...options,
  }),
  
  /**
   * Integration test environment with full services
   */
  integration: (options: Partial<TestEnvironmentConfig> = {}): TestEnvironmentConfig => ({
    type: 'integration',
    nextjs: true,
    database: true,
    cache: true,
    api: true,
    initialRoute: '/',
    apiLatency: 10,
    ...options,
  }),
  
  /**
   * E2E test environment with realistic latency
   */
  e2e: (options: Partial<TestEnvironmentConfig> = {}): TestEnvironmentConfig => ({
    type: 'e2e',
    nextjs: true,
    database: true,
    cache: true,
    api: true,
    initialRoute: '/',
    apiLatency: 50,
    ...options,
  }),
  
  /**
   * Performance test environment - optimized for speed
   */
  performance: (options: Partial<TestEnvironmentConfig> = {}): TestEnvironmentConfig => ({
    type: 'performance',
    nextjs: true,
    database: true,
    cache: true,
    api: true,
    initialRoute: '/',
    apiLatency: 0,
    ...options,
  }),
}

/**
 * Hook for using comprehensive test environment
 */
export function useTestEnvironment(
  configOrType: TestEnvironmentConfig | keyof typeof TestEnvironmentConfigurations,
  options: Partial<TestEnvironmentConfig> = {}
) {
  let environment: ComprehensiveTestEnvironment
  
  beforeEach(() => {
    const config = typeof configOrType === 'string' 
      ? TestEnvironmentConfigurations[configOrType](options)
      : configOrType
      
    environment = new ComprehensiveTestEnvironment(config)
  })
  
  afterEach(async () => {
    if (environment) {
      await environment.cleanup()
    }
  })
  
  return {
    getEnvironment: () => environment,
    getDatabase: () => environment.getDatabase(),
    getAPIService: () => environment.getAPIService(),
    getCache: () => environment.getCache(),
    getRouter: () => environment.getRouter(),
    getNextAPI: () => environment.getNextAPI(),
    navigateTo: (route: string) => environment.navigateTo(route),
    getStats: () => environment.getStats(),
  }
}

/**
 * Environment factory for quick setup
 */
export class TestEnvironmentFactory {
  /**
   * Create environment for unit tests
   */
  static unit(options?: Partial<TestEnvironmentConfig>): ComprehensiveTestEnvironment {
    return new ComprehensiveTestEnvironment(TestEnvironmentConfigurations.unit(options))
  }
  
  /**
   * Create environment for component tests
   */
  static component(options?: Partial<TestEnvironmentConfig>): ComprehensiveTestEnvironment {
    return new ComprehensiveTestEnvironment(TestEnvironmentConfigurations.component(options))
  }
  
  /**
   * Create environment for animation tests
   */
  static animation(options?: Partial<TestEnvironmentConfig>): ComprehensiveTestEnvironment {
    return new ComprehensiveTestEnvironment(TestEnvironmentConfigurations.animation(options))
  }
  
  /**
   * Create environment for integration tests
   */
  static integration(options?: Partial<TestEnvironmentConfig>): ComprehensiveTestEnvironment {
    return new ComprehensiveTestEnvironment(TestEnvironmentConfigurations.integration(options))
  }
  
  /**
   * Create environment for E2E tests
   */
  static e2e(options?: Partial<TestEnvironmentConfig>): ComprehensiveTestEnvironment {
    return new ComprehensiveTestEnvironment(TestEnvironmentConfigurations.e2e(options))
  }
  
  /**
   * Create environment for performance tests
   */
  static performance(options?: Partial<TestEnvironmentConfig>): ComprehensiveTestEnvironment {
    return new ComprehensiveTestEnvironment(TestEnvironmentConfigurations.performance(options))
  }
}