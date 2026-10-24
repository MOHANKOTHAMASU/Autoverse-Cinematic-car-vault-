// AutoVerse Stage 24: Responsive SVG Bar Chart Component

import React, { useState } from 'react';
import type { DistributionDataPoint } from '../../types/analytics';

interface BarChartProps {
  title: string;
  subtitle?: string;
  data: DistributionDataPoint[];
  maxBars?: number;
  barColor?: string;
}

export const AnalyticsBarChart: React.FC<BarChartProps> = ({
  title,
  subtitle,
  data,
  maxBars = 10,
  barColor = '#3b82f6',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const displayData = data.slice(0, maxBars);
  const maxCount = Math.max(...displayData.map((d) => d.count), 1);

  if (displayData.length === 0) {
    return (
      <div
        style={{
          backgroundColor: '#0c1017',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.85rem',
        }}
      >
        <h4 style={{ color: '#f8fafc', margin: '0 0 0.5rem', fontSize: '1rem' }}>{title}</h4>
        <p>No distribution records match the active criteria.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#0c1017',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
      }}
    >
      <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.25rem' }}>
          {title}
        </h4>
        {subtitle && <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {displayData.map((item, idx) => {
          const widthPct = Math.max(4, Math.round((item.count / maxCount) * 100));
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: 600, color: isHovered ? '#00f0ff' : '#cbd5e1' }}>
                  {item.label}
                </span>
                <span style={{ color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                  <strong style={{ color: '#f8fafc' }}>{item.count}</strong> ({item.percentage}%)
                </span>
              </div>

              <div
                style={{
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${widthPct}%`,
                    backgroundColor: item.color || barColor,
                    borderRadius: '9999px',
                    transition: 'width 0.4s ease-out',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
