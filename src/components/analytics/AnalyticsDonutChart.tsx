// AutoVerse Stage 24: Responsive SVG Donut Distribution Chart

import React, { useState } from 'react';
import type { DistributionDataPoint } from '../../types/analytics';

interface DonutChartProps {
  title: string;
  subtitle?: string;
  data: DistributionDataPoint[];
}

const DEFAULT_COLORS = ['#00f0ff', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#64748b'];

export const AnalyticsDonutChart: React.FC<DonutChartProps> = ({ title, subtitle, data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, d) => acc + d.count, 0);

  if (total === 0 || data.length === 0) {
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
        <p>No distribution records available for this segment.</p>
      </div>
    );
  }

  // Calculate SVG stroke-dasharray arcs
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const arcs = data.map((item, idx) => {
    const fraction = item.count / total;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += fraction;

    return {
      ...item,
      color: item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div
      style={{
        backgroundColor: '#0c1017',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.25rem' }}>
          {title}
        </h4>
        {subtitle && <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        {/* SVG Donut Visual */}
        <div style={{ position: 'relative', width: '160px', height: '160px', flexShrink: 0 }}>
          <svg viewBox="0 0 160 160" width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="20"
            />
            {arcs.map((arc, idx) => (
              <circle
                key={arc.label}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={arc.color}
                strokeWidth={hoveredIdx === idx ? 24 : 20}
                strokeDasharray={arc.strokeDasharray}
                strokeDashoffset={arc.strokeDashoffset}
                strokeLinecap="round"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  transition: 'stroke-width 0.2s, opacity 0.2s',
                  cursor: 'pointer',
                  opacity: hoveredIdx !== null && hoveredIdx !== idx ? 0.5 : 1,
                }}
              />
            ))}
          </svg>

          {/* Center Callout */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
              {hoveredIdx !== null ? arcs[hoveredIdx].count : total}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {hoveredIdx !== null ? `${arcs[hoveredIdx].percentage}%` : 'Total Units'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '160px', flex: 1 }}>
          {arcs.map((arc, idx) => (
            <div
              key={arc.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.35rem 0.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: hoveredIdx === idx ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                transition: 'background-color 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: arc.color }} />
                <span style={{ fontSize: '0.8rem', color: hoveredIdx === idx ? '#ffffff' : '#cbd5e1' }}>
                  {arc.label}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
                {arc.count} <span style={{ fontSize: '0.72rem', color: '#64748b' }}>({arc.percentage}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
