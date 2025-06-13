import * as React from 'react';

export const useScrollAnimation = (threshold = 0.1, rootMargin = '0px') => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          // Once animated, stop observing to prevent re-triggering
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin]);

  return [ref, isVisible] as const;
};

export const useParallax = () => {
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return offset;
};

export const useStaggeredAnimation = (count: number, delay = 100) => {
  const [animatedItems, setAnimatedItems] = React.useState<boolean[]>(
    new Array(count).fill(false)
  );

  const triggerAnimation = () => {
    const timeouts: NodeJS.Timeout[] = [];
    
    for (let i = 0; i < count; i++) {
      const timeout = setTimeout(() => {
        setAnimatedItems(prev => {
          const newState = [...prev];
          if (i < newState.length) {
            newState[i] = true;
          }
          return newState;
        });
      }, i * delay);
      
      timeouts.push(timeout);
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  };

  return [animatedItems, triggerAnimation] as const;
}; 