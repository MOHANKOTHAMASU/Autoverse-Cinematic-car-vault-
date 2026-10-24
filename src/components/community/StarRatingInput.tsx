import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  label?: string;
  maxStars?: number;
  size?: number;
  readOnly?: boolean;
  required?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: '1.0 — Poor / Unsatisfactory',
  2: '2.0 — Fair / Mediocre',
  3: '3.0 — Good / Solid',
  4: '4.0 — Very Good / Recommended',
  5: '5.0 — Exceptional / Best-in-Class',
};

export const StarRatingInput: React.FC<StarRatingInputProps> = ({
  value,
  onChange,
  label,
  maxStars = 5,
  size = 24,
  readOnly = false,
  required = false,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const activeValue = hoverValue !== null ? hoverValue : value;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {label && (
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div
          role="radiogroup"
          aria-label={label || 'Star rating selection'}
          style={{ display: 'flex', gap: '0.25rem' }}
          onMouseLeave={() => !readOnly && setHoverValue(null)}
        >
          {Array.from({ length: maxStars }, (_, i) => {
            const starNumber = i + 1;
            const isFilled = activeValue >= starNumber;

            return (
              <button
                key={starNumber}
                type="button"
                role="radio"
                aria-checked={value === starNumber}
                aria-label={`${starNumber} star${starNumber > 1 ? 's' : ''}`}
                disabled={readOnly}
                onClick={() => !readOnly && onChange(starNumber)}
                onMouseEnter={() => !readOnly && setHoverValue(starNumber)}
                onKeyDown={(e) => {
                  if (readOnly) return;
                  if (e.key === 'ArrowRight' && value < maxStars) {
                    onChange(value + 1);
                  } else if (e.key === 'ArrowLeft' && value > 1) {
                    onChange(value - 1);
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '2px',
                  cursor: readOnly ? 'default' : 'pointer',
                  outline: 'none',
                  transition: 'transform 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onFocus={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                onBlur={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Star
                  size={size}
                  fill={isFilled ? '#f59e0b' : 'transparent'}
                  color={isFilled ? '#f59e0b' : 'rgba(255, 255, 255, 0.25)'}
                  style={{
                    filter: isFilled ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.5))' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                />
              </button>
            );
          })}
        </div>

        {activeValue > 0 && (
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#f59e0b',
              letterSpacing: '0.02em',
            }}
          >
            {RATING_LABELS[Math.round(activeValue)] || `${activeValue.toFixed(1)} / 5.0`}
          </span>
        )}
      </div>
    </div>
  );
};
