// AutoVerse Stage 24: Reusable Analytics Metric Telemetry Card

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { HelpCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconColor?: string;
  tooltip?: string;
}

export const AnalyticsMetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor = '#00f0ff',
  tooltip,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#0c1017',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'transform 0.2s, border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '-0.01em' }}>
            {title}
          </span>
          {tooltip && (
            <span title={tooltip} style={{ cursor: 'help', display: 'flex', color: '#64748b' }}>
              <HelpCircle size={13} />
            </span>
          )}
        </div>

        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
          }}
        >
          <Icon size={18} />
        </div>
      </div>

      <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
        {value}
      </div>

      {subtext && (
        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.5rem' }}>
          {subtext}
        </div>
      )}
    </div>
  );
};
