/**
 * Examples of using concurrent test data management
 * These patterns demonstrate how to write parallel-safe tests
 */

import { 
  ConcurrentTestDataFactory, 
  TestDataRegistry, 
  IsolatedTestDatabase,
  useConcurrentTestEnvironment,
  TestDataFactories
} from './concurrent-test-data'
import { createIsolatedComponentTest } from './parallel-test-patterns'

/**
 * Example 1: Basic concurrent test data factory usage
 */
export function exampleBasicDataFactory() {
  describe('User Component with Concurrent Data', () => {
    let userFactory: ConcurrentTestDataFactory<any>
    
    beforeEach(() => {
      // Each test gets its own isolated data factory
      userFactory = TestDataFactories.user()
    })
    
    it('should render user name', () => {
      // Each test gets unique data - no conflicts with parallel tests
      const userData = userFactory.create({ name: 'John Doe' })
      
      // userData will have unique ID like: user_factory_12345_67890_abcdef
      expect(userData.id).toMatch(/^user_factory_\d+_[a-z0-9]+$/)
      expect(userData.name).toBe('John Doe')
    })
    
    it('should handle multiple users', () => {
      const users = userFactory.createMany(3, { role: 'admin' })
      
      // Each user has unique ID, no conflicts between parallel tests
      users.forEach((user, index) => {
        expect(user.id).toMatch(/^user_factory_\d+_\d+_[a-z0-9]+$/)
        expect(user.role).toBe('admin')
        expect(user.index).toBe(index)
      })
    })
    
    it('should create deterministic data for repeatability', () => {
      const user1 = userFactory.createDeterministic('test-seed')
      const user2 = userFactory.createDeterministic('test-seed')
      
      // Same seed produces deterministic but unique IDs
      expect(user1.seed).toBe('test-seed')
      expect(user2.seed).toBe('test-seed')
      expect(user1.id).toBe(user2.id) // Deterministic
    })
  })
}

/**
 * Example 2: Test data registry for multiple data types
 */
export function exampleTestDataRegistry() {
  describe('E-commerce Component with Multiple Data Types', () => {
    let registry: TestDataRegistry
    
    beforeEach(() => {
      registry = new TestDataRegistry()
      
      // Register different data types
      registry.register('user', {
        id: 'user',
        name: 'Test User',
        email: 'test@example.com',
      })
      
      registry.register('product', {
        id: 'product',
        name: 'Test Product',
        price: 9.99,
        inStock: true,
      })
      
      registry.register('order', {
        id: 'order',
        userId: '',
        products: [],
        total: 0,
      })
    })
    
    it('should create related data for checkout flow', () => {
      // Create user
      const user = registry.create('user', { name: 'Jane Doe' })
      
      // Create products
      const products = registry.createMany('product', 2, { 
        price: 19.99 
      })
      
      // Create order linking user and products
      const order = registry.create('order', {
        userId: user.id,
        products: products.map(p => p.id),
        total: products.length * 19.99,
      })
      
      // All data is isolated and unique for this test
      expect(user.name).toBe('Jane Doe')
      expect(products).toHaveLength(2)
      expect(order.userId).toBe(user.id)
      expect(order.total).toBe(39.98)
    })
    
    it('should track all created instances', () => {
      registry.create('user', { name: 'User 1' })
      registry.create('user', { name: 'User 2' })
      registry.createMany('product', 3)
      
      const users = registry.getInstances('user')
      const products = registry.getInstances('product')
      
      expect(users).toHaveLength(2)
      expect(products).toHaveLength(3)
    })
  })
}

/**
 * Example 3: Isolated test database for concurrent execution
 */
export function exampleIsolatedTestDatabase() {
  describe('Database Operations with Isolation', () => {
    let database: IsolatedTestDatabase
    
    beforeEach(() => {
      database = new IsolatedTestDatabase()
    })
    
    it('should store and retrieve data independently', () => {
      // Store test data
      const userId = database.store('users', { name: 'John', email: 'john@test.com' })
      const productId = database.store('products', { name: 'Widget', price: 10.99 })
      
      // Retrieve data
      const user = database.findByKey(userId)
      const product = database.findByKey(productId)
      
      expect(user?.name).toBe('John')
      expect(product?.name).toBe('Widget')
      
      // Keys are unique to this test instance
      expect(userId).toMatch(/^users_\d+_[a-z0-9]+$/)
      expect(productId).toMatch(/^products_\d+_[a-z0-9]+$/)
    })
    
    it('should handle collections independently', () => {
      // Store multiple items in collections
      database.store('users', { name: 'User 1' })
      database.store('users', { name: 'User 2' })
      database.store('products', { name: 'Product 1' })
      
      const users = database.find('users')
      const products = database.find('products')
      
      expect(users).toHaveLength(2)
      expect(products).toHaveLength(1)
      
      // Database stats
      const stats = database.getStats()
      expect(stats.totalItems).toBe(3)
      expect(stats.collections).toEqual(['users', 'products'])
    })
  })
}

/**
 * Example 4: Complete concurrent test environment
 */
export function exampleConcurrentTestEnvironment() {
  describe('Complete Test Environment', () => {
    const { getEnvironment, getDataRegistry, getDatabase } = useConcurrentTestEnvironment()
    
    it('should provide isolated environment for complex scenarios', () => {
      const environment = getEnvironment()
      const registry = getDataRegistry()
      const database = getDatabase()
      
      // Register data types
      registry.register('user', { name: 'Test User', email: 'test@example.com' })
      
      // Create test data
      const user = registry.create('user', { name: 'Alice' })
      
      // Store in database
      const storedUserId = database.store('users', user)
      
      // Verify isolation
      const retrievedUser = database.findByKey(storedUserId)
      
      expect(retrievedUser?.name).toBe('Alice')
      expect(environment.getEnvironmentId()).toMatch(/^env_\d+_[a-z0-9]+$/)
    })
    
    it('should handle cleanup automatically', () => {
      const environment = getEnvironment()
      let cleanupCalled = false
      
      // Register cleanup callback
      environment.onCleanup(() => {
        cleanupCalled = true
      })
      
      // Note: cleanup happens automatically in afterEach
      // This test just demonstrates the API
      expect(environment.getEnvironmentId()).toBeDefined()
    })
  })
}

/**
 * Example 5: Component testing with concurrent data
 */
export function exampleComponentTestingWithConcurrentData() {
  interface UserCardProps {
    user: {
      id: string
      name: string
      email: string
      role: string
    }
    onEdit?: (id: string) => void
  }
  
  // Mock component for demonstration
  const UserCard = ({ user, onEdit }: UserCardProps) => (
    <div data-testid={`user-card-${user.id}`}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <span>{user.role}</span>
      {onEdit && (
        <button onClick={() => onEdit(user.id)}>Edit</button>
      )}
    </div>
  )
  
  const userCardTest = createIsolatedComponentTest(
    'UserCard',
    UserCard,
    {
      user: {
        id: 'default',
        name: 'Default User',
        email: 'default@test.com',
        role: 'user',
      },
    }
  )
  
  userCardTest.describe('rendering with concurrent data', ({ renderComponent, createMockProps, getTestId }) => {
    it('should render user information with unique test data', () => {
      const userFactory = TestDataFactories.user()
      const testUser = userFactory.create({
        name: 'Test User',
        email: 'test@concurrent.com',
        role: 'admin',
      })
      
      const props = createMockProps({ user: testUser })
      const { getByTestId } = renderComponent(props)
      
      // Each test gets unique user ID, preventing conflicts
      const userCard = getByTestId(`user-card-${testUser.id}`)
      expect(userCard).toBeInTheDocument()
      expect(userCard).toHaveTextContent('Test User')
      expect(userCard).toHaveTextContent('admin')
    })
    
    it('should handle edit callback with isolated mock', () => {
      const userFactory = TestDataFactories.user()
      const testUser = userFactory.create({ name: 'Editable User' })
      
      const mockOnEdit = jest.fn()
      const props = createMockProps({ 
        user: testUser,
        onEdit: mockOnEdit,
      })
      
      const { getByRole } = renderComponent(props)
      
      const editButton = getByRole('button', { name: 'Edit' })
      editButton.click()
      
      expect(mockOnEdit).toHaveBeenCalledWith(testUser.id)
    })
  })
}

/**
 * Example 6: API testing with concurrent mock factories
 */
export function exampleAPITestingWithConcurrentMocks() {
  describe('API Service with Concurrent Mocks', () => {
    const { getEnvironment } = useConcurrentTestEnvironment()
    
    it('should handle API responses with isolated data', async () => {
      const environment = getEnvironment()
      const apiFactory = TestDataFactories.apiResponse({
        users: [],
        total: 0,
        page: 1,
      })
      
      // Create mock API response with unique data
      const mockResponse = apiFactory.create({
        users: [
          { id: 'user1', name: 'User One' },
          { id: 'user2', name: 'User Two' },
        ],
        total: 2,
      })
      
      // Mock fetch with isolated response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })
      
      // Test API call
      const response = await fetch('/api/users')
      const data = await response.json()
      
      expect(data.success).toBe(true)
      expect(data.data.total).toBe(2)
      expect(data.requestId).toMatch(/^test_\d+_[a-z0-9]+$/)
    })
  })
}