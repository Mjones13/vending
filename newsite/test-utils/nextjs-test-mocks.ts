/**
 * Next.js Test Mocks
 * Optimized mocks for Next.js features in parallel test environments
 */

import { NextRouter } from 'next/router'

/**
 * Mock Next.js Router for parallel test environments
 */
export class MockNextRouter {
  private instanceId: string
  private history: string[] = []
  private currentRoute: string = '/'
  private queries: Record<string, string | string[]> = {}
  private eventListeners: Record<string, Array<(...args: any[]) => void>> = {}
  
  constructor(initialRoute: string = '/') {
    this.instanceId = `router_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.currentRoute = initialRoute
    this.history = [initialRoute]
  }
  
  get route(): string {
    return this.currentRoute
  }
  
  get pathname(): string {
    return this.currentRoute.split('?')[0]
  }
  
  get query(): Record<string, string | string[]> {
    return { ...this.queries }
  }
  
  get asPath(): string {
    return this.currentRoute
  }
  
  get isReady(): boolean {
    return true
  }
  
  get isFallback(): boolean {
    return false
  }
  
  /**
   * Mock push navigation
   */
  async push(url: string, as?: string, options?: any): Promise<boolean> {
    const targetUrl = as || url
    this.currentRoute = targetUrl
    this.history.push(targetUrl)
    this.parseQuery(targetUrl)
    
    this.emit('routeChangeStart', targetUrl)
    // Simulate async navigation
    await new Promise(resolve => setTimeout(resolve, 1))
    this.emit('routeChangeComplete', targetUrl)
    
    return true
  }
  
  /**
   * Mock replace navigation
   */
  async replace(url: string, as?: string, options?: any): Promise<boolean> {
    const targetUrl = as || url
    this.currentRoute = targetUrl
    this.history[this.history.length - 1] = targetUrl
    this.parseQuery(targetUrl)
    
    this.emit('routeChangeStart', targetUrl)
    await new Promise(resolve => setTimeout(resolve, 1))
    this.emit('routeChangeComplete', targetUrl)
    
    return true
  }
  
  /**
   * Mock back navigation
   */
  async back(): Promise<void> {
    if (this.history.length > 1) {
      this.history.pop()
      const previousRoute = this.history[this.history.length - 1]
      this.currentRoute = previousRoute
      this.parseQuery(previousRoute)
      
      this.emit('routeChangeStart', previousRoute)
      await new Promise(resolve => setTimeout(resolve, 1))
      this.emit('routeChangeComplete', previousRoute)
    }
  }
  
  /**
   * Mock reload
   */
  async reload(): Promise<void> {
    this.emit('beforeHistoryChange', this.currentRoute)
    await new Promise(resolve => setTimeout(resolve, 1))
    this.emit('routeChangeComplete', this.currentRoute)
  }
  
  /**
   * Mock prefetch
   */
  async prefetch(url: string, asPath?: string, options?: any): Promise<void> {
    // Mock prefetching - just return resolved promise
    return Promise.resolve()
  }
  
  /**
   * Mock beforePopState
   */
  beforePopState(cb: (state: any) => boolean): void {
    // Mock implementation
  }
  
  /**
   * Event system
   */
  on(event: string, handler: (...args: any[]) => void): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(handler)
  }
  
  off(event: string, handler: (...args: any[]) => void): void {
    if (this.eventListeners[event]) {
      const index = this.eventListeners[event].indexOf(handler)
      if (index > -1) {
        this.eventListeners[event].splice(index, 1)
      }
    }
  }
  
  emit(event: string, ...args: any[]): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(handler => handler(...args))
    }
  }
  
  /**
   * Parse query parameters from URL
   */
  private parseQuery(url: string): void {
    const queryString = url.split('?')[1]
    this.queries = {}
    
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=')
        if (key) {
          this.queries[decodeURIComponent(key)] = value ? decodeURIComponent(value) : ''
        }
      })
    }
  }
  
  /**
   * Get router history
   */
  getHistory(): string[] {
    return [...this.history]
  }
  
  /**
   * Get instance ID for debugging
   */
  getInstanceId(): string {
    return this.instanceId
  }
  
  /**
   * Reset router to initial state
   */
  reset(initialRoute: string = '/'): void {
    this.currentRoute = initialRoute
    this.history = [initialRoute]
    this.queries = {}
    this.eventListeners = {}
  }
}

/**
 * Mock Next.js Image component for test environments
 */
export class MockNextImage {
  static create(props: any) {
    // Remove Next.js specific props that cause warnings in tests
    const { priority, fill, sizes, loader, placeholder, blurDataURL, ...imageProps } = props
    
    // Create a standard img element for testing
    return {
      ...imageProps,
      // Add data attributes to help with testing
      'data-testid': props['data-testid'] || 'next-image',
      'data-src': props.src,
      'data-alt': props.alt,
    }
  }
}

/**
 * Mock Next.js Link component for test environments
 */
export class MockNextLink {
  static create(props: any, children: any) {
    const { href, as, replace, scroll, shallow, passHref, prefetch, locale, ...linkProps } = props
    
    return {
      ...linkProps,
      href: as || href,
      'data-testid': props['data-testid'] || 'next-link',
      'data-href': href,
      'data-as': as,
      children,
    }
  }
}

/**
 * Mock Next.js Head component for test environments
 */
export class MockNextHead {
  private static headElements: Array<{ type: string; props: any }> = []
  
  static add(type: string, props: any): void {
    this.headElements.push({ type, props })
  }
  
  static clear(): void {
    this.headElements = []
  }
  
  static getElements(): Array<{ type: string; props: any }> {
    return [...this.headElements]
  }
  
  static findByTag(tag: string): Array<{ type: string; props: any }> {
    return this.headElements.filter(el => el.type === tag)
  }
}

/**
 * Mock Next.js API routes for test environments
 */
export class MockNextAPI {
  private routes: Map<string, (req: any, res: any) => any> = new Map()
  private instanceId: string
  
  constructor() {
    this.instanceId = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Register API route handler
   */
  mock(path: string, handler: (req: any, res: any) => any): void {
    this.routes.set(path, handler)
  }
  
  /**
   * Mock API request
   */
  async request(path: string, options: {
    method?: string
    body?: any
    headers?: Record<string, string>
  } = {}): Promise<any> {
    const handler = this.routes.get(path)
    if (!handler) {
      throw new Error(`No handler registered for ${path}`)
    }
    
    const req = {
      method: options.method || 'GET',
      body: options.body,
      headers: options.headers || {},
      query: {},
      url: path,
    }
    
    const res = {
      status: (code: number) => res,
      json: (data: any) => data,
      send: (data: any) => data,
      end: () => {},
      setHeader: (name: string, value: string) => res,
    }
    
    return handler(req, res)
  }
  
  /**
   * Clear all routes
   */
  clear(): void {
    this.routes.clear()
  }
  
  /**
   * Get instance ID
   */
  getInstanceId(): string {
    return this.instanceId
  }
}

/**
 * Complete Next.js test environment setup
 */
export class NextJSTestEnvironment {
  private router: MockNextRouter
  private api: MockNextAPI
  private instanceId: string
  
  constructor(initialRoute: string = '/') {
    this.instanceId = `nextjs_env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.router = new MockNextRouter(initialRoute)
    this.api = new MockNextAPI()
    
    this.setupMocks()
  }
  
  private setupMocks(): void {
    // Mock next/router
    jest.doMock('next/router', () => ({
      useRouter: () => this.router,
      withRouter: (Component: any) => Component,
    }))
    
    // Mock next/image
    jest.doMock('next/image', () => ({
      __esModule: true,
      default: (props: any) => MockNextImage.create(props),
    }))
    
    // Mock next/link
    jest.doMock('next/link', () => ({
      __esModule: true,
      default: ({ children, ...props }: any) => MockNextLink.create(props, children),
    }))
    
    // Mock next/head
    jest.doMock('next/head', () => ({
      __esModule: true,
      default: ({ children }: any) => {
        if (Array.isArray(children)) {
          children.forEach((child: any) => {
            if (child && child.type) {
              MockNextHead.add(child.type, child.props)
            }
          })
        } else if (children && children.type) {
          MockNextHead.add(children.type, children.props)
        }
        return null
      },
    }))
  }
  
  /**
   * Get router instance
   */
  getRouter(): MockNextRouter {
    return this.router
  }
  
  /**
   * Get API instance
   */
  getAPI(): MockNextAPI {
    return this.api
  }
  
  /**
   * Navigate to route
   */
  async navigateTo(route: string): Promise<void> {
    await this.router.push(route)
  }
  
  /**
   * Cleanup environment
   */
  cleanup(): void {
    this.router.reset()
    this.api.clear()
    MockNextHead.clear()
    jest.clearAllMocks()
  }
  
  /**
   * Get environment stats
   */
  getStats() {
    return {
      instanceId: this.instanceId,
      currentRoute: this.router.route,
      routerHistory: this.router.getHistory(),
      apiRoutes: this.api['routes'].size,
      headElements: MockNextHead.getElements().length,
    }
  }
}

/**
 * Hook for using Next.js test environment
 */
export function useNextJSTestEnvironment(initialRoute: string = '/') {
  let environment: NextJSTestEnvironment
  
  beforeEach(() => {
    environment = new NextJSTestEnvironment(initialRoute)
  })
  
  afterEach(() => {
    if (environment) {
      environment.cleanup()
    }
  })
  
  return {
    getEnvironment: () => environment,
    getRouter: () => environment.getRouter(),
    getAPI: () => environment.getAPI(),
    navigateTo: (route: string) => environment.navigateTo(route),
  }
}