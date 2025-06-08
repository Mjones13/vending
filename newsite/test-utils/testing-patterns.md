# Component Testing Patterns

This document outlines the testing patterns and conventions used in this project.

## File Naming Conventions

- Component tests: `ComponentName.test.tsx`
- Page tests: `page-name.test.tsx`
- Utility tests: `utility-name.test.ts`
- E2E tests: `feature-name.spec.ts`

## Test Structure

### Basic Component Test Template

```tsx
import { render, screen } from '../test-utils'
import ComponentName from '../components/ComponentName'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const { mockRouter } = render(<ComponentName />)
    
    await userEvent.click(screen.getByRole('button', { name: 'Click Me' }))
    
    expect(mockRouter.push).toHaveBeenCalledWith('/expected-route')
  })
})
```

### Animation Testing Pattern

```tsx
import { render, screen, waitForAnimationComplete } from '../test-utils'

describe('Animated Component', () => {
  it('should complete animation cycle', async () => {
    render(<AnimatedComponent />)
    
    const element = screen.getByTestId('animated-element')
    
    await waitForAnimationComplete(
      element,
      'animating-class',
      'final-class'
    )
    
    expect(element).toHaveClass('final-class')
  })
})
```

### Responsive Testing Pattern

```tsx
import { render, screen, simulateScreenSize, SCREEN_SIZES } from '../test-utils'

describe('Responsive Component', () => {
  it('should display mobile layout on small screens', () => {
    simulateScreenSize(SCREEN_SIZES.mobile.width, SCREEN_SIZES.mobile.height)
    
    render(<ResponsiveComponent />)
    
    expect(screen.getByTestId('mobile-menu')).toBeVisible()
    expect(screen.queryByTestId('desktop-menu')).not.toBeInTheDocument()
  })
})
```

### Router Testing Pattern

```tsx
import { render, screen, expectNavigation } from '../test-utils'

describe('Navigation Component', () => {
  it('should navigate to correct page', async () => {
    const { mockRouter } = render(<NavigationComponent />)
    
    await userEvent.click(screen.getByRole('link', { name: 'About' }))
    
    expectNavigation(mockRouter, '/about')
  })
})
```

## Test Categories

### 1. Rendering Tests
- Component renders without crashing
- Required elements are present
- Conditional rendering works correctly

### 2. Interaction Tests
- Button clicks work correctly
- Form submissions behave properly
- Hover effects trigger correctly

### 3. Animation Tests
- CSS animations start and complete
- Animation states change correctly
- Timing is appropriate

### 4. Responsive Tests
- Components adapt to different screen sizes
- Mobile-specific features work
- Touch interactions function properly

### 5. Accessibility Tests
- ARIA labels are present
- Keyboard navigation works
- Screen reader compatibility

## Common Patterns

### Testing Hooks
```tsx
import { renderHook, act } from '@testing-library/react'
import useCustomHook from '../hooks/useCustomHook'

describe('useCustomHook', () => {
  it('should return expected value', () => {
    const { result } = renderHook(() => useCustomHook())
    
    expect(result.current.value).toBe('expected')
  })
})
```

### Testing with Props
```tsx
describe('Component with Props', () => {
  const defaultProps = {
    title: 'Test Title',
    onClick: jest.fn(),
  }

  it('should render with props', () => {
    render(<Component {...defaultProps} />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })
})
```

### Testing Error States
```tsx
describe('Error Handling', () => {
  it('should display error message', () => {
    render(<Component hasError={true} />)
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the user sees and does
   - Avoid testing internal state directly

2. **Use Descriptive Test Names**
   - Start with "should"
   - Describe the expected behavior clearly

3. **Keep Tests Independent**
   - Each test should work in isolation
   - Use beforeEach/afterEach for setup/cleanup

4. **Mock External Dependencies**
   - Mock API calls, routers, external libraries
   - Use consistent mocking patterns

5. **Test Edge Cases**
   - Empty states, loading states, error states
   - Boundary conditions and unusual inputs