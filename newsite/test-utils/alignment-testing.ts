/**
 * Alignment Testing Utilities
 * Utilities for testing text baseline alignment and visual positioning
 */

/**
 * Measures text baseline position using Canvas API for precise font metrics
 */
export const measureTextBaseline = async (element: HTMLElement): Promise<{
  baseline: number;
  height: number;
  width: number;
  fontSize: number;
  lineHeight: number;
}> => {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  
  // Extract font properties
  const fontSize = parseFloat(style.fontSize);
  const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.2;
  const fontFamily = style.fontFamily;
  const fontWeight = style.fontWeight || 'normal';
  const textContent = element.textContent || 'Modern';
  
  // Create canvas to measure precise text metrics
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  
  // Measure text metrics
  const metrics = context.measureText(textContent);
  
  // Calculate baseline position relative to element top
  const baselineOffset = metrics.actualBoundingBoxAscent || fontSize * 0.8;
  const baseline = rect.top + baselineOffset;
  
  return {
    baseline,
    height: rect.height,
    width: rect.width,
    fontSize,
    lineHeight
  };
};

/**
 * Verifies baseline alignment between two text elements
 */
export const verifyBaselineAlignment = async (
  staticElement: HTMLElement,
  rotatingElement: HTMLElement,
  tolerance = 1
): Promise<{
  aligned: boolean;
  difference: number;
  staticBaseline: number;
  rotatingBaseline: number;
  staticMetrics: any;
  rotatingMetrics: any;
}> => {
  const staticMetrics = await measureTextBaseline(staticElement);
  const rotatingMetrics = await measureTextBaseline(rotatingElement);
  
  const difference = Math.abs(staticMetrics.baseline - rotatingMetrics.baseline);
  
  return {
    aligned: difference <= tolerance,
    difference,
    staticBaseline: staticMetrics.baseline,
    rotatingBaseline: rotatingMetrics.baseline,
    staticMetrics,
    rotatingMetrics
  };
};

/**
 * Waits for element to be visible and measurable
 */
export const waitForElementReady = async (element: HTMLElement, timeout = 3000): Promise<void> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const rect = element.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    const hasContent = element.textContent && element.textContent.trim().length > 0;
    
    if (isVisible && hasContent) {
      // Additional wait for font loading
      await new Promise(resolve => setTimeout(resolve, 100));
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  throw new Error('Element not ready within timeout');
};

/**
 * Gets computed style properties relevant to text alignment
 */
export const getTextAlignmentStyles = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  
  return {
    position: style.position,
    top: style.top,
    left: style.left,
    transform: style.transform,
    verticalAlign: style.verticalAlign,
    lineHeight: style.lineHeight,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    display: style.display,
    textRendering: style.textRendering,
  };
};

/**
 * Validates that two elements have consistent text styling
 */
export const validateTextStyling = (staticElement: HTMLElement, rotatingElement: HTMLElement) => {
  const staticStyles = getTextAlignmentStyles(staticElement);
  const rotatingStyles = getTextAlignmentStyles(rotatingElement);
  
  const differences: string[] = [];
  
  // Check critical properties that affect baseline alignment
  const criticalProps = ['fontSize', 'fontFamily', 'fontWeight', 'lineHeight'];
  
  criticalProps.forEach(prop => {
    if (staticStyles[prop as keyof typeof staticStyles] !== rotatingStyles[prop as keyof typeof rotatingStyles]) {
      differences.push(`${prop}: static(${staticStyles[prop as keyof typeof staticStyles]}) vs rotating(${rotatingStyles[prop as keyof typeof rotatingStyles]})`);
    }
  });
  
  return {
    consistent: differences.length === 0,
    differences,
    staticStyles,
    rotatingStyles
  };
};

/**
 * Measures visual alignment across multiple viewport sizes
 */
export const testAlignmentAcrossViewports = async (
  staticElement: HTMLElement,
  rotatingElement: HTMLElement,
  viewports: { width: number; height: number }[] = [
    { width: 320, height: 568 },   // Mobile
    { width: 768, height: 1024 },  // Tablet
    { width: 1024, height: 768 },  // Tablet landscape
    { width: 1920, height: 1080 }, // Desktop
  ]
) => {
  const results = [];
  
  for (const viewport of viewports) {
    // Set viewport size
    Object.assign(document.documentElement.style, {
      width: `${viewport.width}px`,
      height: `${viewport.height}px`
    });
    
    // Wait for layout recalculation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Measure alignment
    await waitForElementReady(staticElement);
    await waitForElementReady(rotatingElement);
    
    const alignment = await verifyBaselineAlignment(staticElement, rotatingElement);
    
    results.push({
      viewport,
      ...alignment
    });
  }
  
  // Reset viewport
  Object.assign(document.documentElement.style, {
    width: '',
    height: ''
  });
  
  return results;
};

/**
 * Visual debugging helper - adds overlay to show baseline positions
 */
export const addBaselineOverlay = async (
  staticElement: HTMLElement,
  rotatingElement: HTMLElement
) => {
  const staticMetrics = await measureTextBaseline(staticElement);
  const rotatingMetrics = await measureTextBaseline(rotatingElement);
  
  // Create overlay div
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    background: rgba(0,0,0,0.05);
  `;
  
  // Add baseline indicators
  const staticLine = document.createElement('div');
  staticLine.style.cssText = `
    position: absolute;
    top: ${staticMetrics.baseline}px;
    left: 0;
    width: 100%;
    height: 1px;
    background: red;
    opacity: 0.7;
  `;
  
  const rotatingLine = document.createElement('div');
  rotatingLine.style.cssText = `
    position: absolute;
    top: ${rotatingMetrics.baseline}px;
    left: 0;
    width: 100%;
    height: 1px;
    background: blue;
    opacity: 0.7;
  `;
  
  // Add labels
  const label = document.createElement('div');
  label.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: white;
    padding: 10px;
    border: 1px solid #ccc;
    font-family: monospace;
    font-size: 12px;
  `;
  label.innerHTML = `
    Static baseline: ${staticMetrics.baseline.toFixed(1)}px (red)<br>
    Rotating baseline: ${rotatingMetrics.baseline.toFixed(1)}px (blue)<br>
    Difference: ${Math.abs(staticMetrics.baseline - rotatingMetrics.baseline).toFixed(1)}px
  `;
  
  overlay.appendChild(staticLine);
  overlay.appendChild(rotatingLine);
  overlay.appendChild(label);
  document.body.appendChild(overlay);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }, 5000);
  
  return overlay;
};