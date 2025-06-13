/**
 * @jest-environment jsdom
 * 
 * Rotating Text Alignment Tests
 * Three-Tier Testing Strategy Implementation:
 * - Tier 2: Component Behavior (DOM structure, baseline alignment, font rendering)
 * Note: This is primarily Tier 2 testing as it focuses on layout behavior and DOM structure
 */

import React, { ReactNode } from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../pages/index';
import { 
  measureTextBaseline, 
  verifyBaselineAlignment, 
  waitForElementReady,
  validateTextStyling,
  testAlignmentAcrossViewports
} from '../../test-utils/alignment-testing';
import {
  mockAnimationProperties,
  clearAnimationMocks
} from '../../test-utils/css-animation-mocking';

// Mock Next.js hooks and components
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

jest.mock('next/head', () => {
  return function Head({ children }: { children: ReactNode }) {
    return <>{children}</>;
  };
});

jest.mock('next/image', () => {
  return function Image({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock the scroll animation hook
jest.mock('../../hooks/useScrollAnimation', () => ({
  useStaggeredAnimation: () => [[], jest.fn()],
}));

// Mock Layout component
jest.mock('../../components/Layout', () => {
  return function Layout({ children }: { children: ReactNode }) {
    return <div data-testid="layout">{children}</div>;
  };
});

describe('Homepage Rotating Text Alignment', () => {
  beforeEach(() => {
    // Reset any timers and DOM
    jest.clearAllTimers();
    document.body.innerHTML = '';
    
    // Mock CSS properties for alignment testing
    mockAnimationProperties('.rotating-text-container', {
      display: 'inline-block',
      position: 'relative',
      verticalAlign: 'baseline'
    });
    
    mockAnimationProperties('.rotating-text', {
      position: 'absolute',
      lineHeight: '1.2'
    });
    
    // Mock fonts loaded (only if not already defined)
    if (!document.fonts) {
      Object.defineProperty(document, 'fonts', {
        value: {
          ready: Promise.resolve(),
          load: jest.fn().mockResolvedValue([]),
        },
        writable: true,
        configurable: true
      });
    }
  });

  afterEach(() => {
    clearAnimationMocks();
    jest.restoreAllMocks();
  });

  describe('Baseline Alignment', () => {
    it('should align rotating text baseline with static text baseline', async () => {
      const { getByTestId } = render(<Home />);
      
      const staticText = getByTestId('static-text');
      const rotatingText = getByTestId('rotating-text');
      
      // Wait for elements to be ready
      await waitForElementReady(staticText);
      await waitForElementReady(rotatingText);
      
      // Allow fonts to load
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const alignment = await verifyBaselineAlignment(staticText, rotatingText, 1);
      
      expect(alignment.aligned).toBe(true);
      expect(alignment.difference).toBeLessThanOrEqual(1);
      
      // Log details for debugging
      if (!alignment.aligned) {
        console.log('Alignment test failed:', {
          staticBaseline: alignment.staticBaseline,
          rotatingBaseline: alignment.rotatingBaseline,
          difference: alignment.difference,
          staticMetrics: alignment.staticMetrics,
          rotatingMetrics: alignment.rotatingMetrics
        });
      }
    });

    it('should maintain consistent font styling between static and rotating text', async () => {
      const { getByTestId } = render(<Home />);
      
      const staticText = getByTestId('static-text');
      const rotatingText = getByTestId('rotating-text');
      
      await waitForElementReady(staticText);
      await waitForElementReady(rotatingText);
      
      const styling = validateTextStyling(staticText, rotatingText);
      
      expect(styling.consistent).toBe(true);
      
      if (!styling.consistent) {
        console.log('Font styling inconsistencies:', styling.differences);
      }
      
      // Verify critical properties match
      expect(styling.staticStyles.fontSize).toBe(styling.rotatingStyles.fontSize);
      expect(styling.staticStyles.fontFamily).toBe(styling.rotatingStyles.fontFamily);
      expect(styling.staticStyles.fontWeight).toBe(styling.rotatingStyles.fontWeight);
    });

    it('should maintain alignment across all rotating words', async () => {
      const { getByTestId } = render(<Home />);
      
      const staticText = getByTestId('static-text');
      const rotatingText = getByTestId('rotating-text');
      const expectedWords = ['Workplaces', 'Apartments', 'Gyms', 'Businesses'];
      
      await waitForElementReady(staticText);
      
      // Test alignment for each word
      for (const word of expectedWords) {
        // Wait for the specific word to appear
        await waitFor(() => {
          expect(rotatingText.textContent).toBe(word);
        }, { timeout: 15000 });
        
        await waitForElementReady(rotatingText);
        
        const alignment = await verifyBaselineAlignment(staticText, rotatingText, 1);
        
        expect(alignment.aligned).toBe(true);
        
        if (!alignment.aligned) {
          console.log(`Alignment failed for word "${word}":`, {
            difference: alignment.difference,
            staticBaseline: alignment.staticBaseline,
            rotatingBaseline: alignment.rotatingBaseline
          });
        }
      }
    });

    it('should preserve alignment during animation transitions', async () => {
      const { getByTestId } = render(<Home />);
      
      const staticText = getByTestId('static-text');
      const rotatingText = getByTestId('rotating-text');
      
      await waitForElementReady(staticText);
      await waitForElementReady(rotatingText);
      
      // Monitor alignment during multiple transitions
      const alignmentChecks: any[] = [];
      
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const alignment = await verifyBaselineAlignment(staticText, rotatingText, 2);
          alignmentChecks.push({
            timestamp: Date.now(),
            word: rotatingText.textContent,
            aligned: alignment.aligned,
            difference: alignment.difference
          });
        } catch (error) {
          // Element might be transitioning, skip this check
          console.log('Skipping alignment check during transition:', error);
        }
      }
      
      // At least 80% of checks should pass
      const passedChecks = alignmentChecks.filter(check => check.aligned).length;
      const successRate = passedChecks / alignmentChecks.length;
      
      expect(successRate).toBeGreaterThanOrEqual(0.8);
      
      if (successRate < 0.8) {
        console.log('Alignment checks during transitions:', alignmentChecks);
      }
    });
  });

  describe('Responsive Alignment', () => {
    it('should maintain alignment across different viewport sizes', async () => {
      const { getByTestId } = render(<Home />);
      
      const staticText = getByTestId('static-text');
      const rotatingText = getByTestId('rotating-text');
      
      await waitForElementReady(staticText);
      await waitForElementReady(rotatingText);
      
      const viewportResults = await testAlignmentAcrossViewports(staticText, rotatingText);
      
      // All viewports should maintain alignment
      viewportResults.forEach(result => {
        expect(result.aligned).toBe(true);
        
        if (!result.aligned) {
          console.log(`Alignment failed at viewport ${result.viewport.width}x${result.viewport.height}:`, {
            difference: result.difference,
            staticBaseline: result.staticBaseline,
            rotatingBaseline: result.rotatingBaseline
          });
        }
      });
    });
  });

  describe('DOM Structure and Behavior Analysis', () => {
    it('should have proper DOM structure for baseline alignment', async () => {
      const { getByTestId } = render(<Home />);
      
      const container = getByTestId('rotating-text-container');
      const rotatingText = getByTestId('rotating-text');
      
      await waitForElementReady(rotatingText);
      
      // Verify DOM structure exists and is properly nested
      expect(container).toBeInTheDocument();
      expect(rotatingText).toBeInTheDocument();
      expect(container).toContainElement(rotatingText);
      
      // Verify elements have expected CSS classes (which contain the positioning styles)
      expect(container).toHaveClass('rotating-text-container');
      expect(rotatingText).toHaveClass('rotating-text');
      
      // Check that container has proper dimensions (functional behavior test)
      const containerRect = container.getBoundingClientRect();
      expect(containerRect.width).toBeGreaterThan(0);
      expect(containerRect.height).toBeGreaterThan(0);
      
      // Verify rotatingText is positioned within container bounds
      const rotatingRect = rotatingText.getBoundingClientRect();
      expect(rotatingRect.left).toBeGreaterThanOrEqual(containerRect.left);
      expect(rotatingRect.top).toBeGreaterThanOrEqual(containerRect.top);
    });
  });

  describe('Font Loading and Rendering', () => {
    it('should handle font loading gracefully without affecting alignment', async () => {
      // Mock font loading delay
      let fontLoadResolve: () => void;
      const fontLoadPromise = new Promise<void>(resolve => {
        fontLoadResolve = resolve;
      });
      
      Object.defineProperty(document, 'fonts', {
        value: {
          ready: fontLoadPromise,
          load: jest.fn().mockResolvedValue([]),
        },
      });
      
      const { getByTestId } = render(<Home />);
      
      const staticText = getByTestId('static-text');
      const rotatingText = getByTestId('rotating-text');
      
      // Check alignment before fonts load
      await waitForElementReady(staticText);
      await waitForElementReady(rotatingText);
      
      const alignmentBefore = await verifyBaselineAlignment(staticText, rotatingText, 3);
      
      // Simulate font loading completion
      fontLoadResolve!();
      await fontLoadPromise;
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check alignment after fonts load
      const alignmentAfter = await verifyBaselineAlignment(staticText, rotatingText, 1);
      
      expect(alignmentAfter.aligned).toBe(true);
      
      // Alignment should improve or stay the same after font loading
      expect(alignmentAfter.difference).toBeLessThanOrEqual(alignmentBefore.difference + 1);
    });
  });
});