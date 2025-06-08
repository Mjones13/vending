/**
 * Rotation Testing Utilities
 * Utilities for testing word rotation timing and cycling behavior
 */

/**
 * Word sequence observer for tracking rotation cycles
 */
export class WordSequenceObserver {
  private observations: Array<{
    word: string;
    timestamp: number;
    animationState?: string;
  }> = [];
  
  private element: HTMLElement;
  private observer: MutationObserver | null = null;
  private isObserving = false;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  start() {
    if (this.isObserving) return;
    
    this.isObserving = true;
    this.observations = [];
    
    // Record initial state
    this.recordObservation();
    
    // Set up mutation observer for text changes
    this.observer = new MutationObserver(() => {
      this.recordObservation();
    });
    
    this.observer.observe(this.element, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Also check periodically in case mutations are missed
    this.periodicCheck();
  }
  
  stop() {
    this.isObserving = false;
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  private recordObservation() {
    const word = this.element.textContent || '';
    const className = this.element.className || '';
    const animationState = this.extractAnimationState(className);
    
    // Only record if word actually changed or if this is the first observation
    const lastObservation = this.observations[this.observations.length - 1];
    if (!lastObservation || lastObservation.word !== word || lastObservation.animationState !== animationState) {
      this.observations.push({
        word,
        timestamp: performance.now(),
        animationState
      });
    }
  }
  
  private extractAnimationState(className: string): string {
    if (className.includes('rotating-text-visible')) return 'visible';
    if (className.includes('rotating-text-exiting')) return 'exiting';
    if (className.includes('rotating-text-entering')) return 'entering';
    return 'unknown';
  }
  
  private periodicCheck() {
    if (!this.isObserving) return;
    
    this.recordObservation();
    setTimeout(() => this.periodicCheck(), 100);
  }
  
  getObservations() {
    return [...this.observations];
  }
  
  getWordSequence(): string[] {
    return this.observations.map(obs => obs.word).filter(word => word.trim() !== '');
  }
  
  getTimingIntervals(): number[] {
    const intervals: number[] = [];
    for (let i = 1; i < this.observations.length; i++) {
      intervals.push(this.observations[i].timestamp - this.observations[i - 1].timestamp);
    }
    return intervals;
  }
  
  validateExpectedSequence(expectedWords: string[], cycles = 1): {
    valid: boolean;
    issues: string[];
    actualSequence: string[];
    expectedSequence: string[];
  } {
    const actualSequence = this.getWordSequence();
    const expectedSequence = [];
    
    // Build expected sequence for multiple cycles
    for (let cycle = 0; cycle < cycles; cycle++) {
      expectedSequence.push(...expectedWords);
    }
    
    const issues: string[] = [];
    
    // Check minimum length
    if (actualSequence.length < expectedSequence.length) {
      issues.push(`Sequence too short: expected ${expectedSequence.length}, got ${actualSequence.length}`);
    }
    
    // Check sequence correctness
    for (let i = 0; i < Math.min(actualSequence.length, expectedSequence.length); i++) {
      if (actualSequence[i] !== expectedSequence[i]) {
        issues.push(`Sequence mismatch at position ${i}: expected "${expectedSequence[i]}", got "${actualSequence[i]}"`);
      }
    }
    
    // Check for empty words
    const emptyWords = actualSequence.filter(word => word.trim() === '').length;
    if (emptyWords > 0) {
      issues.push(`Found ${emptyWords} empty words in sequence`);
    }
    
    return {
      valid: issues.length === 0,
      issues,
      actualSequence,
      expectedSequence
    };
  }
  
  validateCycling(expectedWords: string[]): {
    cyclingCorrect: boolean;
    issues: string[];
    cycleTransitions: Array<{ from: string; to: string; timestamp: number }>;
  } {
    const sequence = this.getWordSequence();
    const issues: string[] = [];
    const cycleTransitions: Array<{ from: string; to: string; timestamp: number }> = [];
    
    if (sequence.length < expectedWords.length + 1) {
      issues.push('Sequence too short to validate cycling');
      return { cyclingCorrect: false, issues, cycleTransitions };
    }
    
    // Find cycle transitions (last word back to first word)
    for (let i = 1; i < sequence.length; i++) {
      const prevWord = sequence[i - 1];
      const currentWord = sequence[i];
      const observation = this.observations.find(obs => obs.word === currentWord);
      
      if (prevWord === expectedWords[expectedWords.length - 1] && currentWord === expectedWords[0]) {
        cycleTransitions.push({
          from: prevWord,
          to: currentWord,
          timestamp: observation?.timestamp || 0
        });
      }
    }
    
    // Validate that cycling occurs
    if (cycleTransitions.length === 0 && sequence.length > expectedWords.length) {
      issues.push('No cycle transitions detected - rotation may not be looping correctly');
    }
    
    // Validate cycle transitions are correct
    cycleTransitions.forEach((transition, index) => {
      if (transition.from !== expectedWords[expectedWords.length - 1]) {
        issues.push(`Cycle transition ${index} starts from wrong word: expected "${expectedWords[expectedWords.length - 1]}", got "${transition.from}"`);
      }
      if (transition.to !== expectedWords[0]) {
        issues.push(`Cycle transition ${index} goes to wrong word: expected "${expectedWords[0]}", got "${transition.to}"`);
      }
    });
    
    return {
      cyclingCorrect: issues.length === 0,
      issues,
      cycleTransitions
    };
  }
  
  validateTiming(expectedInterval: number, tolerance = 200): {
    timingCorrect: boolean;
    issues: string[];
    intervals: number[];
    averageInterval: number;
  } {
    const intervals = this.getTimingIntervals();
    const issues: string[] = [];
    
    if (intervals.length === 0) {
      issues.push('No timing intervals recorded');
      return { timingCorrect: false, issues, intervals, averageInterval: 0 };
    }
    
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    // Check average timing
    if (Math.abs(averageInterval - expectedInterval) > tolerance) {
      issues.push(`Average interval ${averageInterval.toFixed(0)}ms differs from expected ${expectedInterval}ms by more than ${tolerance}ms`);
    }
    
    // Check individual intervals for consistency
    const outliers = intervals.filter(interval => Math.abs(interval - expectedInterval) > tolerance * 2);
    if (outliers.length > intervals.length * 0.1) { // More than 10% outliers
      issues.push(`Too many timing outliers: ${outliers.length}/${intervals.length} intervals deviate significantly`);
    }
    
    return {
      timingCorrect: issues.length === 0,
      issues,
      intervals,
      averageInterval
    };
  }
}

/**
 * Wait for specific word to appear in rotation
 */
export const waitForWord = async (
  element: HTMLElement, 
  targetWord: string, 
  timeout = 15000
): Promise<boolean> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (element.textContent?.trim() === targetWord) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return false;
};

/**
 * Wait for complete rotation cycle
 */
export const waitForCompleteCycle = async (
  element: HTMLElement,
  expectedWords: string[],
  timeout = 20000
): Promise<{
  success: boolean;
  observedWords: string[];
  duration: number;
}> => {
  const observer = new WordSequenceObserver(element);
  const startTime = performance.now();
  
  observer.start();
  
  try {
    // Wait for all expected words to appear at least once
    const observedWords = new Set<string>();
    
    while (Date.now() - startTime < timeout) {
      const currentWord = element.textContent?.trim() || '';
      if (currentWord && expectedWords.includes(currentWord)) {
        observedWords.add(currentWord);
      }
      
      // Check if we've seen all words
      if (observedWords.size === expectedWords.length) {
        const duration = performance.now() - startTime;
        return {
          success: true,
          observedWords: Array.from(observedWords),
          duration
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const duration = performance.now() - startTime;
    return {
      success: false,
      observedWords: Array.from(observedWords),
      duration
    };
  } finally {
    observer.stop();
  }
};

/**
 * Test animation state transitions
 */
export const validateAnimationStates = async (
  element: HTMLElement,
  timeout = 5000
): Promise<{
  valid: boolean;
  issues: string[];
  stateTransitions: Array<{ state: string; timestamp: number }>;
}> => {
  const observer = new WordSequenceObserver(element);
  const startTime = performance.now();
  const issues: string[] = [];
  
  observer.start();
  
  try {
    // Wait for state transitions
    await new Promise(resolve => setTimeout(resolve, timeout));
    
    const observations = observer.getObservations();
    const stateTransitions = observations
      .filter(obs => obs.animationState)
      .map(obs => ({ state: obs.animationState!, timestamp: obs.timestamp }));
    
    // Validate state sequence
    const expectedStateFlow = ['visible', 'exiting', 'entering', 'visible'];
    let lastValidStateIndex = -1;
    
    stateTransitions.forEach((transition, index) => {
      const expectedStateIndex = expectedStateFlow.indexOf(transition.state);
      if (expectedStateIndex === -1) {
        issues.push(`Invalid animation state: ${transition.state} at ${transition.timestamp}`);
      } else if (expectedStateIndex <= lastValidStateIndex && transition.state !== 'visible') {
        // Allow returning to visible, but other backwards transitions are invalid
        issues.push(`Invalid state transition: ${transition.state} after reaching a later state`);
      } else {
        lastValidStateIndex = expectedStateIndex;
      }
    });
    
    // Check for stuck states
    const stateGrouped = stateTransitions.reduce((acc, transition) => {
      if (!acc[transition.state]) acc[transition.state] = [];
      acc[transition.state].push(transition.timestamp);
      return acc;
    }, {} as Record<string, number[]>);
    
    Object.entries(stateGrouped).forEach(([state, timestamps]) => {
      const maxDuration = Math.max(...timestamps) - Math.min(...timestamps);
      if (maxDuration > 2000 && state !== 'visible') { // Non-visible states shouldn't last > 2s
        issues.push(`State ${state} appears to be stuck (duration: ${maxDuration}ms)`);
      }
    });
    
    return {
      valid: issues.length === 0,
      issues,
      stateTransitions
    };
  } finally {
    observer.stop();
  }
};

/**
 * Performance monitoring for rotation animations
 */
export const monitorRotationPerformance = async (
  element: HTMLElement,
  duration = 10000
): Promise<{
  averageFPS: number;
  frameDrops: number;
  performanceIssues: string[];
}> => {
  const performanceIssues: string[] = [];
  const frameTimes: number[] = [];
  let frameDrops = 0;
  let animationId: number;
  let lastFrameTime = performance.now();
  
  const measureFrame = (currentTime: number) => {
    const frameTime = currentTime - lastFrameTime;
    frameTimes.push(frameTime);
    
    // Detect frame drops (>20ms between frames = <50fps)
    if (frameTime > 20) {
      frameDrops++;
    }
    
    lastFrameTime = currentTime;
    
    if (currentTime - (performance.now() - duration) < duration) {
      animationId = requestAnimationFrame(measureFrame);
    }
  };
  
  animationId = requestAnimationFrame(measureFrame);
  
  // Wait for monitoring duration
  await new Promise(resolve => setTimeout(resolve, duration));
  
  cancelAnimationFrame(animationId);
  
  // Calculate metrics
  const averageFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
  const averageFPS = 1000 / averageFrameTime;
  
  // Performance analysis
  if (averageFPS < 50) {
    performanceIssues.push(`Low average FPS: ${averageFPS.toFixed(1)} (target: 60)`);
  }
  
  if (frameDrops > frameTimes.length * 0.05) { // More than 5% frame drops
    performanceIssues.push(`High frame drop rate: ${frameDrops}/${frameTimes.length} frames`);
  }
  
  return {
    averageFPS,
    frameDrops,
    performanceIssues
  };
};