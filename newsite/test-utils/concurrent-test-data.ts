/**
 * Concurrent Test Data Management
 * Provides thread-safe test data management for parallel execution
 */

/**
 * Thread-safe test data factory for concurrent execution
 */
export class ConcurrentTestDataFactory<T> {
  private baseData: T
  private instanceId: string
  
  constructor(baseData: T) {
    this.baseData = Object.freeze({ ...baseData })
    this.instanceId = `factory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Create a unique instance of test data for this test
   */
  create(overrides?: Partial<T>): T {
    const uniqueId = `${this.instanceId}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      ...this.baseData,
      ...overrides,
      // Ensure every data instance has a unique identifier
      id: `${(this.baseData as any).id || 'test'}_${uniqueId}`,
      testId: uniqueId,
      createdAt: Date.now(),
    } as T
  }
  
  /**
   * Create multiple unique instances
   */
  createMany(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, (_, index) => {
      const uniqueId = `${this.instanceId}_${index}_${Math.random().toString(36).substr(2, 9)}`
      
      return {
        ...this.baseData,
        ...overrides,
        id: `${(this.baseData as any).id || 'test'}_${uniqueId}`,
        testId: uniqueId,
        index,
        createdAt: Date.now(),
      } as T
    })
  }
  
  /**
   * Create a data instance with deterministic ID for repeatability
   */
  createDeterministic(seed: string, overrides?: Partial<T>): T {
    const deterministicId = `${this.instanceId}_${seed}_${this.hashString(seed)}`
    
    return {
      ...this.baseData,
      ...overrides,
      id: `${(this.baseData as any).id || 'test'}_${deterministicId}`,
      testId: deterministicId,
      seed,
      createdAt: Date.now(),
    } as T
  }
  
  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }
}

/**
 * Test data registry for managing multiple data types
 */
export class TestDataRegistry {
  private factories = new Map<string, ConcurrentTestDataFactory<any>>()
  private instances = new Map<string, any[]>()
  private registryId: string
  
  constructor() {
    this.registryId = `registry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Register a data factory
   */
  register<T>(name: string, baseData: T): ConcurrentTestDataFactory<T> {
    const factory = new ConcurrentTestDataFactory(baseData)
    this.factories.set(name, factory)
    this.instances.set(name, [])
    return factory
  }
  
  /**
   * Create data using a registered factory
   */
  create<T>(name: string, overrides?: Partial<T>): T {
    const factory = this.factories.get(name)
    if (!factory) {
      throw new Error(`Test data factory '${name}' not registered`)
    }
    
    const instance = factory.create(overrides)
    this.instances.get(name)?.push(instance)
    return instance
  }
  
  /**
   * Create multiple instances using a registered factory
   */
  createMany<T>(name: string, count: number, overrides?: Partial<T>): T[] {
    const factory = this.factories.get(name)
    if (!factory) {
      throw new Error(`Test data factory '${name}' not registered`)
    }
    
    const instances = factory.createMany(count, overrides)
    this.instances.get(name)?.push(...instances)
    return instances
  }
  
  /**
   * Get all instances created for a data type
   */
  getInstances<T>(name: string): T[] {
    return this.instances.get(name) || []
  }
  
  /**
   * Clear all instances for a data type
   */
  clearInstances(name: string): void {
    this.instances.set(name, [])
  }
  
  /**
   * Clear all instances for all data types
   */
  clearAll(): void {
    this.instances.clear()
  }
  
  /**
   * Get unique registry ID
   */
  getRegistryId(): string {
    return this.registryId
  }
}

/**
 * Isolated test database for concurrent execution
 */
export class IsolatedTestDatabase {
  private data = new Map<string, any>()
  private databaseId: string
  
  constructor() {
    this.databaseId = `db_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Store data with automatic key generation
   */
  store<T>(collection: string, data: T): string {
    const key = `${collection}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullKey = `${this.databaseId}:${key}`
    
    this.data.set(fullKey, {
      ...data,
      _id: key,
      _collection: collection,
      _createdAt: Date.now(),
    })
    
    return key
  }
  
  /**
   * Find data by collection
   */
  find<T>(collection: string): T[] {
    const results: T[] = []
    
    for (const [key, value] of this.data.entries()) {
      if (key.startsWith(`${this.databaseId}:${collection}_`)) {
        results.push(value)
      }
    }
    
    return results
  }
  
  /**
   * Find single item by key
   */
  findByKey<T>(key: string): T | undefined {
    const fullKey = `${this.databaseId}:${key}`
    return this.data.get(fullKey)
  }
  
  /**
   * Update data by key
   */
  update<T>(key: string, updates: Partial<T>): boolean {
    const fullKey = `${this.databaseId}:${key}`
    const existing = this.data.get(fullKey)
    
    if (existing) {
      this.data.set(fullKey, { ...existing, ...updates, _updatedAt: Date.now() })
      return true
    }
    
    return false
  }
  
  /**
   * Delete data by key
   */
  delete(key: string): boolean {
    const fullKey = `${this.databaseId}:${key}`
    return this.data.delete(fullKey)
  }
  
  /**
   * Clear all data
   */
  clear(): void {
    this.data.clear()
  }
  
  /**
   * Get database stats
   */
  getStats() {
    return {
      databaseId: this.databaseId,
      totalItems: this.data.size,
      collections: this.getCollections(),
    }
  }
  
  /**
   * Get all collection names
   */
  private getCollections(): string[] {
    const collections = new Set<string>()
    
    for (const [key] of this.data.entries()) {
      const collection = key.split(':')[1]?.split('_')[0]
      if (collection) {
        collections.add(collection)
      }
    }
    
    return Array.from(collections)
  }
}

/**
 * Test environment for concurrent execution
 */
export class ConcurrentTestEnvironment {
  private dataRegistry: TestDataRegistry
  private database: IsolatedTestDatabase
  private environmentId: string
  private cleanupCallbacks: (() => void)[] = []
  
  constructor() {
    this.environmentId = `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.dataRegistry = new TestDataRegistry()
    this.database = new IsolatedTestDatabase()
  }
  
  /**
   * Get the data registry for this environment
   */
  getDataRegistry(): TestDataRegistry {
    return this.dataRegistry
  }
  
  /**
   * Get the isolated database for this environment
   */
  getDatabase(): IsolatedTestDatabase {
    return this.database
  }
  
  /**
   * Get unique environment ID
   */
  getEnvironmentId(): string {
    return this.environmentId
  }
  
  /**
   * Register a cleanup callback
   */
  onCleanup(callback: () => void): void {
    this.cleanupCallbacks.push(callback)
  }
  
  /**
   * Clean up environment
   */
  cleanup(): void {
    this.dataRegistry.clearAll()
    this.database.clear()
    
    // Run cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.warn('Cleanup callback error:', error)
      }
    })
    
    this.cleanupCallbacks = []
  }
}

/**
 * Hook for using concurrent test environment
 */
export function useConcurrentTestEnvironment() {
  let environment: ConcurrentTestEnvironment
  
  beforeEach(() => {
    environment = new ConcurrentTestEnvironment()
  })
  
  afterEach(() => {
    if (environment) {
      environment.cleanup()
    }
  })
  
  return {
    getEnvironment: () => environment,
    getDataRegistry: () => environment.getDataRegistry(),
    getDatabase: () => environment.getDatabase(),
    getEnvironmentId: () => environment.getEnvironmentId(),
  }
}

/**
 * Pre-built test data factories for common use cases
 */
export const TestDataFactories = {
  /**
   * User data factory
   */
  user: () => new ConcurrentTestDataFactory({
    id: 'user',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    active: true,
  }),
  
  /**
   * Product data factory
   */
  product: () => new ConcurrentTestDataFactory({
    id: 'product',
    name: 'Test Product',
    price: 9.99,
    category: 'test',
    inStock: true,
    description: 'A test product for automated testing',
  }),
  
  /**
   * Component props factory
   */
  componentProps: <T>(baseProps: T) => new ConcurrentTestDataFactory(baseProps),
  
  /**
   * API response factory
   */
  apiResponse: <T>(baseResponse: T) => new ConcurrentTestDataFactory({
    success: true,
    data: baseResponse,
    timestamp: Date.now(),
    requestId: 'test',
  }),
  
  /**
   * Animation state factory
   */
  animationState: () => new ConcurrentTestDataFactory({
    id: 'animation',
    isAnimating: false,
    duration: 300,
    easing: 'ease-in-out',
    progress: 0,
  }),
}