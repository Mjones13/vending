/**
 * Test Environment Optimizer
 * Optimizes test environments for parallel execution with in-memory services and mocked dependencies
 */

import { performance } from 'perf_hooks'

/**
 * In-memory database for test isolation
 */
export class InMemoryTestDatabase {
  private data: Map<string, Map<string, any>> = new Map()
  private schemas: Map<string, any> = new Map()
  private instanceId: string
  
  constructor() {
    this.instanceId = `db_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Create a collection (table)
   */
  createCollection(name: string, schema?: any): void {
    this.data.set(name, new Map())
    if (schema) {
      this.schemas.set(name, schema)
    }
  }
  
  /**
   * Insert data into collection
   */
  insert<T>(collection: string, data: T): string {
    if (!this.data.has(collection)) {
      this.createCollection(collection)
    }
    
    const id = `${collection}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const record = {
      id,
      ...data,
      _createdAt: new Date().toISOString(),
      _instanceId: this.instanceId,
    }
    
    this.data.get(collection)!.set(id, record)
    return id
  }
  
  /**
   * Find records in collection
   */
  find<T>(collection: string, query?: Partial<T>): T[] {
    const collectionData = this.data.get(collection)
    if (!collectionData) return []
    
    const records = Array.from(collectionData.values())
    
    if (!query) return records
    
    return records.filter(record => {
      return Object.entries(query).every(([key, value]) => record[key] === value)
    })
  }
  
  /**
   * Find single record by ID
   */
  findById<T>(collection: string, id: string): T | null {
    const collectionData = this.data.get(collection)
    return collectionData?.get(id) || null
  }
  
  /**
   * Update record
   */
  update<T>(collection: string, id: string, updates: Partial<T>): boolean {
    const collectionData = this.data.get(collection)
    if (!collectionData || !collectionData.has(id)) return false
    
    const existing = collectionData.get(id)
    const updated = {
      ...existing,
      ...updates,
      _updatedAt: new Date().toISOString(),
    }
    
    collectionData.set(id, updated)
    return true
  }
  
  /**
   * Delete record
   */
  delete(collection: string, id: string): boolean {
    const collectionData = this.data.get(collection)
    return collectionData?.delete(id) || false
  }
  
  /**
   * Clear collection
   */
  clearCollection(collection: string): void {
    this.data.set(collection, new Map())
  }
  
  /**
   * Clear all data
   */
  clearAll(): void {
    this.data.clear()
    this.schemas.clear()
  }
  
  /**
   * Get database statistics
   */
  getStats() {
    const stats: Record<string, number> = {}
    for (const [collection, data] of this.data.entries()) {
      stats[collection] = data.size
    }
    
    return {
      instanceId: this.instanceId,
      collections: Array.from(this.data.keys()),
      recordCounts: stats,
      totalRecords: Object.values(stats).reduce((sum, count) => sum + count, 0),
    }
  }
}

/**
 * Mock API service for test environments
 */
export class MockAPIService {
  private endpoints: Map<string, any> = new Map()
  private requestLog: Array<{ method: string; url: string; timestamp: number }> = []
  private latency: number = 0
  private instanceId: string
  
  constructor(options: { latency?: number } = {}) {
    this.latency = options.latency || 0
    this.instanceId = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Register mock endpoint
   */
  mock(method: string, url: string, response: any): void {
    const key = `${method.toUpperCase()} ${url}`
    this.endpoints.set(key, response)
  }
  
  /**
   * Mock fetch implementation
   */
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const method = options.method || 'GET'
    const key = `${method.toUpperCase()} ${url}`
    
    // Log request
    this.requestLog.push({
      method: method.toUpperCase(),
      url,
      timestamp: performance.now(),
    })
    
    // Simulate network latency
    if (this.latency > 0) {
      await new Promise(resolve => setTimeout(resolve, this.latency))
    }
    
    // Find matching endpoint
    const response = this.endpoints.get(key)
    
    if (!response) {
      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Handle different response types
    if (typeof response === 'function') {
      const result = await response(url, options)
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  /**
   * Get request history
   */
  getRequestLog(): Array<{ method: string; url: string; timestamp: number }> {
    return [...this.requestLog]
  }
  
  /**
   * Clear request log
   */
  clearLog(): void {
    this.requestLog = []
  }
  
  /**
   * Reset all mocks
   */
  reset(): void {
    this.endpoints.clear()
    this.requestLog = []
  }
  
  /**
   * Get service statistics
   */
  getStats() {
    return {
      instanceId: this.instanceId,
      endpointCount: this.endpoints.size,
      requestCount: this.requestLog.length,
      latency: this.latency,
    }
  }
}

/**
 * In-memory cache service for test environments
 */
export class InMemoryCache {
  private cache: Map<string, { value: any; expires?: number }> = new Map()
  private instanceId: string
  
  constructor() {
    this.instanceId = `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Set cache value
   */
  set(key: string, value: any, ttlMs?: number): void {
    const expires = ttlMs ? Date.now() + ttlMs : undefined
    this.cache.set(key, { 
      value, 
      ...(expires !== undefined && { expires }) 
    })
  }
  
  /**
   * Get cache value
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    // Check expiration
    if (entry.expires && Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }
    
    return entry.value
  }
  
  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    let expiredCount = 0
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires && now > entry.expires) {
        expiredCount++
      }
    }
    
    return {
      instanceId: this.instanceId,
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      activeEntries: this.cache.size - expiredCount,
    }
  }
  
  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now()
    let cleanedCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires && now > entry.expires) {
        this.cache.delete(key)
        cleanedCount++
      }
    }
    
    return cleanedCount
  }
}

/**
 * Optimized test environment for parallel execution
 */
export class OptimizedTestEnvironment {
  private database: InMemoryTestDatabase
  private apiService: MockAPIService
  private cache: InMemoryCache
  private instanceId: string
  private cleanupTasks: Array<() => void | Promise<void>> = []
  
  constructor(options: {
    apiLatency?: number
    cacheEnabled?: boolean
  } = {}) {
    this.instanceId = `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.database = new InMemoryTestDatabase()
    this.apiService = new MockAPIService({
      ...(options.apiLatency !== undefined && { latency: options.apiLatency })
    })
    this.cache = new InMemoryCache()
    
    this.setupGlobalMocks()
  }
  
  /**
   * Setup global mocks for the test environment
   */
  private setupGlobalMocks(): void {
    // Mock fetch if not already mocked
    if (!global.fetch) {
      global.fetch = this.apiService.fetch.bind(this.apiService)
    }
    
    // Mock localStorage
    const localStorageMock = {
      store: new Map<string, string>(),
      getItem: function(key: string) { return this.store.get(key) || null },
      setItem: function(key: string, value: string) { this.store.set(key, value) },
      removeItem: function(key: string) { this.store.delete(key) },
      clear: function() { this.store.clear() },
      get length() { return this.store.size },
      key: function(index: number) { return Array.from(this.store.keys())[index] || null },
    }
    
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
    
    // Mock sessionStorage
    Object.defineProperty(global, 'sessionStorage', {
      value: { ...localStorageMock, store: new Map<string, string>() },
      writable: true,
    })
  }
  
  /**
   * Get database instance
   */
  getDatabase(): InMemoryTestDatabase {
    return this.database
  }
  
  /**
   * Get API service instance
   */
  getAPIService(): MockAPIService {
    return this.apiService
  }
  
  /**
   * Get cache instance
   */
  getCache(): InMemoryCache {
    return this.cache
  }
  
  /**
   * Add cleanup task
   */
  onCleanup(task: () => void | Promise<void>): void {
    this.cleanupTasks.push(task)
  }
  
  /**
   * Pre-populate environment with test data
   */
  seed(data: {
    collections?: Record<string, any[]>
    cache?: Record<string, any>
    apiEndpoints?: Record<string, any>
  }): void {
    // Seed database collections
    if (data.collections) {
      for (const [collection, records] of Object.entries(data.collections)) {
        this.database.createCollection(collection)
        records.forEach(record => this.database.insert(collection, record))
      }
    }
    
    // Seed cache
    if (data.cache) {
      for (const [key, value] of Object.entries(data.cache)) {
        this.cache.set(key, value)
      }
    }
    
    // Seed API endpoints
    if (data.apiEndpoints) {
      for (const [endpoint, response] of Object.entries(data.apiEndpoints)) {
        const [method, url] = endpoint.split(' ')
        this.apiService.mock(method, url, response)
      }
    }
  }
  
  /**
   * Get environment statistics
   */
  getStats() {
    return {
      instanceId: this.instanceId,
      database: this.database.getStats(),
      api: this.apiService.getStats(),
      cache: this.cache.getStats(),
    }
  }
  
  /**
   * Clean up environment
   */
  async cleanup(): Promise<void> {
    // Run custom cleanup tasks
    for (const task of this.cleanupTasks) {
      try {
        await task()
      } catch (error) {
        console.warn('Cleanup task failed:', error)
      }
    }
    
    // Clear all services
    this.database.clearAll()
    this.apiService.reset()
    this.cache.clear()
    
    // Clear cleanup tasks
    this.cleanupTasks = []
  }
}

/**
 * Hook for using optimized test environment
 */
export function useOptimizedTestEnvironment(options?: {
  apiLatency?: number
  cacheEnabled?: boolean
}) {
  let environment: OptimizedTestEnvironment
  
  beforeEach(() => {
    environment = new OptimizedTestEnvironment(options)
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
  }
}

/**
 * Pre-configured test environments for common scenarios
 */
export const TestEnvironments = {
  /**
   * Minimal environment for unit tests
   */
  unit: () => new OptimizedTestEnvironment({ apiLatency: 0 }),
  
  /**
   * Integration test environment with realistic delays
   */
  integration: () => new OptimizedTestEnvironment({ apiLatency: 50 }),
  
  /**
   * E2E test environment with full services
   */
  e2e: () => new OptimizedTestEnvironment({ apiLatency: 100 }),
  
  /**
   * Performance test environment with no delays
   */
  performance: () => new OptimizedTestEnvironment({ apiLatency: 0 }),
}