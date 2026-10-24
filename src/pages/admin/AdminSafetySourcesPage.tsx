import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import {
  getSafetySources,
  executeManualSourceSync,
  toggleSafetySourceEnabled,
} from '../../utils/safetyStore';
import type { SafetySourceConfig } from '../../types/safety';

export const AdminSafetySourcesPage: React.FC = () => {
  const [sources, setSources] = useState<SafetySourceConfig[]>(getSafetySources());
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSyncSource = (sourceId: string) => {
    setSyncingId(sourceId);
    setFeedback(null);
    setTimeout(() => {
      try {
        const res = executeManualSourceSync(sourceId);
        setSources(getSafetySources());
        setFeedback(res.message);
      } catch (err: any) {
        setFeedback(`Sync failed: ${err.message}`);
      } finally {
        setSyncingId(null);
      }
    }, 600);
  };

  const handleToggleEnabled = (sourceId: string) => {
    toggleSafetySourceEnabled(sourceId);
    setSources(getSafetySources());
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link
            to="/admin/safety"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--accent-cyan)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} /> Back to Safety Administration
          </Link>
        </div>

        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
          Authoritative Safety Source Adapters
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Manage external regulatory API connections, sync intervals, and protocol health telemetry.
        </p>
      </div>

      {feedback && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '8px',
            color: '#34d399',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Sources Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {sources.map((src) => (
          <div
            key={src.id}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.25rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0, 240, 255, 0.1)',
                    color: 'var(--accent-cyan)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {src.authority} · {src.market}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: src.enabled ? '#10b981' : '#6b7280',
                      boxShadow: src.enabled ? '0 0 8px #10b981' : 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: src.enabled ? '#10b981' : 'var(--text-muted)' }}>
                    {src.enabled ? 'ONLINE' : 'PAUSED'}
                  </span>
                </div>
              </div>

              <h2 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem' }}>
                {src.name}
              </h2>

              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '1rem',
                }}
              >
                Endpoint: {src.endpoint}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div>
                  <strong>Sync Cadence:</strong> Every {src.syncIntervalHours}h
                </div>
                <div>
                  <strong>Active Records:</strong> {src.recordsCount}
                </div>
              </div>
            </div>

            <div
              style={{
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Synced: {new Date(src.lastSyncTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleToggleEnabled(src.id)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  {src.enabled ? 'Disable' : 'Enable'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSyncSource(src.id)}
                  disabled={syncingId === src.id || !src.enabled}
                  className="btn btn-primary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                >
                  <RotateCcw size={12} className={syncingId === src.id ? 'spin-animation' : ''} />
                  <span>{syncingId === src.id ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
