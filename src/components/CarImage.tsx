import React, { useState } from 'react';

interface CarImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  manufacturer?: string;
  priority?: boolean;
}

export const CarImage: React.FC<CarImageProps> = ({
  src,
  alt,
  className = '',
  style,
  manufacturer = 'AUTOVERSE',
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError) {
    return (
      <div
        className={`car-image-fallback ${className}`}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '220px',
          backgroundColor: '#0a0d14',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          ...style,
        }}
        role="img"
        aria-label={`${alt} schematic illustration`}
      >
        {/* Subtle grid backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.8,
          }}
        />

        {/* Polished SVG Sports Car Silhouette */}
        <svg
          viewBox="0 0 400 160"
          style={{
            width: '78%',
            maxWidth: '320px',
            position: 'relative',
            zIndex: 1,
            filter: 'drop-shadow(0 0 12px rgba(0, 240, 255, 0.3))',
          }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wheel outlines */}
          <circle cx="95" cy="120" r="24" stroke="#00f0ff" strokeWidth="2.5" />
          <circle cx="95" cy="120" r="14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <circle cx="305" cy="120" r="24" stroke="#00f0ff" strokeWidth="2.5" />
          <circle cx="305" cy="120" r="14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

          {/* Aerodynamic car body contour */}
          <path
            d="M 30 118 L 65 118 C 72 102 88 94 95 94 C 102 94 118 102 125 118 L 275 118 C 282 102 298 94 305 94 C 312 94 328 102 335 118 L 375 118 C 382 118 388 112 384 102 C 378 86 362 76 340 70 L 275 52 C 240 38 185 38 150 50 L 105 68 C 75 75 45 88 34 104 C 30 109 30 118 30 118 Z"
            stroke="#f8fafc"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(14, 20, 30, 0.7)"
          />

          {/* Greenhouse / Cabin contour */}
          <path
            d="M 152 52 L 200 44 C 235 44 260 52 270 56 L 298 70 L 135 70 Z"
            stroke="#00f0ff"
            strokeWidth="1.5"
            fill="rgba(0, 240, 255, 0.08)"
          />

          {/* High-speed ground reflection line */}
          <line x1="20" y1="145" x2="380" y2="145" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="6 4" />
        </svg>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '0.75rem',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--accent-cyan)',
              display: 'block',
              marginBottom: '2px',
            }}
          >
            {manufacturer}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            {alt}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#0a0d14',
        ...style,
      }}
    >
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, #0e131d 0%, #172030 50%, #0e131d 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.8s infinite',
            zIndex: 1,
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'opacity 0.5s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: isLoaded ? 1 : 0,
        }}
      />
    </div>
  );
};
