// AutoVerse Stage 24: Responsive SVG Line Trend Chart

import React, { useState } from 'react';
import type { TimeSeriesPoint } from '../../types/analytics';

interface LineChartProps {
  title: string;
  subtitle?: string;
  data: TimeSeriesPoint[];
  strokeColor?: string;
  height?: number;
}

export const AnalyticsLineChart: React.FC<LineChartProps> = ({
  title,
  subtitle,
  data,
  strokeColor = '#00f0ff',
  height = 200,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPoint | null>(null);

  if (data.length === 0) {
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
        <p>No historical time-series entries recorded for this filter window.</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const minVal = 0;
  const paddingX = 40;
  const paddingY = 30;
  const width = 600; // SVG internal coordinate space

  // Calculate points
  const points = data.map((d, idx) => {
    const x =
      data.length > 1
        ? paddingX + (idx / (data.length - 1)) * (width - 2 * paddingX)
        : width / 2;
    const y =
      height - paddingY - ((d.count - minVal) / (maxVal - minVal || 1)) * (height - 2 * paddingY);
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div
      style={{
        backgroundColor: '#0c1017',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.25rem' }}>
            {title}
          </h4>
          {subtitle && <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{subtitle}</p>}
        </div>

        {hoveredPoint && (
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '8px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              color: '#f8fafc',
            }}
          >
            <span>{hoveredPoint.label}: </span>
            <strong style={{ color: strokeColor }}>{hoveredPoint.count} entries</strong>
          </div>
        )}
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: '400px' }}
        >
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid horizontal guidelines */}
          {[0, 0.5, 1].map((pct) => {
            const y = height - paddingY - pct * (height - 2 * paddingY);
            const val = Math.round(minVal + pct * (maxVal - minVal));
            return (
              <g key={pct}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="Inter, sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Gradient Area Fill */}
          <path d={areaD} fill="url(#lineGrad)" />

          {/* Line Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p) => (
            <circle
              key={p.date}
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.date === p.date ? 6 : 4}
              fill="#05070a"
              stroke={strokeColor}
              strokeWidth="2"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'pointer', transition: 'r 0.15s' }}
            />
          ))}

          {/* X axis labels */}
          {points.map((p, idx) => {
            if (points.length > 8 && idx % 2 !== 0 && idx !== points.length - 1) return null;
            return (
              <text
                key={`label-${p.date}`}
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
                fontFamily="Inter, sans-serif"
              >
                {p.label.length > 5 ? p.label.slice(5) : p.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
