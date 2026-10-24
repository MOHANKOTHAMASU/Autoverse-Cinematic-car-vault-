import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  decimals?: number;
  startOnView?: boolean;
}

export const useCountUp = ({
  end,
  duration = 1600,
  decimals = 0,
  startOnView = true,
}: UseCountUpOptions) => {
  const [value, setValue] = useState(startOnView ? 0 : end);
  const ref = useRef<HTMLDivElement | null>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    // Respect reduced motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(end);
      return;
    }

    if (!startOnView) {
      animateValue(0, end, duration, decimals, setValue);
      return;
    }

    const currentEl = ref.current;
    if (!currentEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          animateValue(0, end, duration, decimals, setValue);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(currentEl);
    return () => observer.disconnect();
  }, [end, duration, decimals, startOnView]);

  return { value, ref };
};

function animateValue(
  start: number,
  end: number,
  duration: number,
  decimals: number,
  callback: (val: number) => void
) {
  const startTime = performance.now();

  const easeOutQuad = (t: number) => t * (2 - t);

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuad(progress);

    const currentVal = start + (end - start) * easedProgress;
    const factor = Math.pow(10, decimals);
    callback(Math.round(currentVal * factor) / factor);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      callback(end);
    }
  };

  requestAnimationFrame(step);
}
