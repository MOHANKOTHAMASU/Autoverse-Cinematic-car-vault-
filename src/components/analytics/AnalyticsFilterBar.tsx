// AutoVerse Stage 24: Reusable Analytics Date & Dimension Filter Bar

import React from 'react';
import { Calendar, Download, RotateCcw } from 'lucide-react';
import type { AnalyticsTimeRange, DateFilterOptions } from '../../types/analytics';

interface FilterBarProps {
  filters: DateFilterOptions;
  onFilterChange: (newFilters: DateFilterOptions) => void;
  onReset: () => void;
  onExportCSV?: () => void;
  exportLoading?: boolean;
}

const RANGES: { id: AnalyticsTimeRange; label: string }[] = [
  { id: 'all_time', label: 'All Records' },
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: 'this_year', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];

export const AnalyticsFilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  onExportCSV,
  exportLoading = false,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#0c1017',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      {/* Time Range Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', marginRight: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
          <Calendar size={15} />
          <span>Window:</span>
        </div>

        {RANGES.map((r) => {
          const isActive = filters.range === r.id;
          return (
            <button
              key={r.id}
              onClick={() => onFilterChange({ ...filters, range: r.id })}
              style={{
                backgroundColor: isActive ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isActive ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                color: isActive ? '#00f0ff' : '#94a3b8',
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Pickers */}
      {filters.range === 'custom' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="date"
            value={filters.customStartDate || ''}
            onChange={(e) => onFilterChange({ ...filters, customStartDate: e.target.value })}
            style={{
              backgroundColor: '#05070a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              padding: '0.35rem 0.5rem',
              color: '#ffffff',
              fontSize: '0.78rem',
            }}
          />
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>to</span>
          <input
            type="date"
            value={filters.customEndDate || ''}
            onChange={(e) => onFilterChange({ ...filters, customEndDate: e.target.value })}
            style={{
              backgroundColor: '#05070a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              padding: '0.35rem 0.5rem',
              color: '#ffffff',
              fontSize: '0.78rem',
            }}
          />
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={onReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            borderRadius: '8px',
            padding: '0.4rem 0.75rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          title="Reset to All Time"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>

        {onExportCSV && (
          <button
            onClick={onExportCSV}
            disabled={exportLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#2563eb',
              border: 'none',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            <Download size={13} />
            <span>{exportLoading ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
