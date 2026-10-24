import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { getSafetySyncLogs } from '../../utils/safetyStore';
import type { SafetySyncLog } from '../../types/safety';

export const AdminSafetySyncLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<SafetySyncLog[]>(getSafetySyncLogs());

  const handleRefresh = () => {
    setLogs(getSafetySyncLogs());
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
              Synchronization Telemetry & Audit Logs
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Traceable execution telemetry for regulatory safety datasets (MoRTH & NHTSA).
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            <RotateCcw size={13} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>TIMESTAMP</th>
                <th style={{ padding: '0.85rem 1rem' }}>SOURCE PROVIDER</th>
                <th style={{ padding: '0.85rem 1rem' }}>INGESTED</th>
                <th style={{ padding: '0.85rem 1rem' }}>DURATION</th>
                <th style={{ padding: '0.85rem 1rem' }}>STATUS</th>
                <th style={{ padding: '0.85rem 1rem' }}>AUDIT NOTES</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', color: '#ffffff', fontWeight: 600 }}>
                    {log.sourceName}
                  </td>
                  <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {log.recordsIngested} records
                  </td>
                  <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {log.durationMs}ms
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: log.status === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: log.status === 'success' ? '#10b981' : '#f87171',
                        fontWeight: 700,
                      }}
                    >
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', maxWidth: '340px' }}>
                    {log.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
