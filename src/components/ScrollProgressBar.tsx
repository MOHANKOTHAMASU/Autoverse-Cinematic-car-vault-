import React, { useState, useEffect } from 'react';

export const ScrollProgressBar: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        zIndex: 9999,
        pointerEvents: 'none',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: `${scrollProgress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--accent-cyan) 0%, #38bdf8 80%, #ffffff 100%)',
          boxShadow: '0 0 10px rgba(0, 240, 255, 0.7), 0 0 20px rgba(0, 240, 255, 0.4)',
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  );
};
