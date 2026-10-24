// AutoVerse Stage 18: Admin Market Sources Management
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { getMarketSources, toggleMarketSourceStatus } from '../../utils/marketStore';
import type { MarketDataSourceConfig } from '../../types/market';

export const AdminMarketSourcesPage: React.FC = () => {
  const [sources, setSources] = useState<MarketDataSourceConfig[]>(getMarketSources());

  const handleToggle = (id: string) => {
    toggleMarketSourceStatus(id);
    setSources(getMarketSources());
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/admin/market-data"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
            textDecoration: 'none',
            marginBottom: '0.5rem',
          }}
        >
          <ArrowLeft size={14} /> Back to Terminal Overview
        </Link>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff' }}>
          Market Pricing Data Source Adapters
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Inspect official OEM press rooms, statutory automotive registers, update frequencies, and coverage domains.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {sources.map((s) => (
          <div
            key={s.id}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0, 240, 255, 0.1)',
                    color: 'var(--accent-cyan)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {s.sourceType.replace('_', ' ')}
                </span>

                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    backgroundColor: s.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: s.status === 'active' ? '#34d399' : '#fbbf24',
                    border: `1px solid ${s.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  }}
                >
                  {s.status.toUpperCase()}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                {s.name}
              </h3>

              <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                Region: {s.region}
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                {s.notes}
              </p>

              <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.78rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Coverage: <span style={{ color: '#ffffff' }}>{s.coverage}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Cadence: <span style={{ color: '#ffffff' }}>{s.updateFrequency}</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  Last Verified: <span style={{ color: 'var(--accent-cyan)' }}>{s.lastChecked}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  textDecoration: 'none',
                }}
              >
                <span>Registry Portal</span>
                <ExternalLink size={12} />
              </a>

              <button
                type="button"
                onClick={() => handleToggle(s.id)}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
              >
                <span>Toggle Status</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
