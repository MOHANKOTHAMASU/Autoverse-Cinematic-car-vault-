import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  RotateCcw,
  Layers,
  Database,
  Radio,
  FileText,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  getSafetyDashboardMetrics,
  getAdminRecallsList,
  getSafetySources,
  getSafetySyncLogs,
  executeManualSourceSync,
} from '../../utils/safetyStore';

export const AdminSafetyPage: React.FC = () => {
  const [metrics, setMetrics] = useState(getSafetyDashboardMetrics());
  const [recalls] = useState(getAdminRecallsList());
  const [sources] = useState(getSafetySources());
  const [logs] = useState(getSafetySyncLogs());
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSyncAll = () => {
    setSyncing(true);
    setFeedback(null);
    setTimeout(() => {
      sources.forEach((s) => {
        if (s.enabled) {
          executeManualSourceSync(s.id);
        }
      });
      setMetrics(getSafetyDashboardMetrics());
      setSyncing(false);
      setFeedback('Full authoritative safety registry synchronization completed across all active providers.');
    }, 800);
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--accent-cyan)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              marginBottom: '0.4rem',
            }}
          >
            <ShieldCheck size={14} />
            <span>STAGE 17 · AUTOMOTIVE SAFETY INTELLIGENCE TERMINAL</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
            Safety & Recall Network Administration
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Monitor official regulatory recalls, source synchronization freshness, and vehicle defect mappings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={syncing}
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '0.55rem 1rem' }}
          >
            <RotateCcw size={14} className={syncing ? 'spin-animation' : ''} />
            <span>{syncing ? 'Syncing Providers...' : 'Trigger Full Sync'}</span>
          </button>
        </div>
      </div>

      {/* Subnav Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-medium)',
          paddingBottom: '0.75rem',
          marginBottom: '2rem',
        }}
      >
        <Link
          to="/admin/safety"
          className="btn"
          style={{
            fontSize: '0.8rem',
            padding: '0.45rem 0.95rem',
            backgroundColor: 'rgba(0, 240, 255, 0.15)',
            borderColor: 'var(--accent-cyan)',
            color: '#ffffff',
          }}
        >
          <Layers size={14} /> Overview
        </Link>
        <Link
          to="/admin/safety/sources"
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
        >
          <Radio size={14} /> Source Adapters ({sources.length})
        </Link>
        <Link
          to="/admin/safety/recalls"
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
        >
          <Database size={14} /> Recall Database ({recalls.length})
        </Link>
        <Link
          to="/admin/safety/sync-logs"
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
        >
          <FileText size={14} /> Synchronization Telemetry ({logs.length})
        </Link>
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

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {[
          { label: 'Active Regulatory Recalls', val: metrics.activeRecalls, sub: 'Legally mandated dealer repairs', color: '#ef4444' },
          { label: 'Critical Severity Defects', val: metrics.criticalDefects, sub: 'Immediate safety consequence', color: '#f87171' },
          { label: 'Manufacturer Campaigns', val: metrics.serviceCampaigns, sub: 'Voluntary service bulletins', color: '#f59e0b' },
          { label: 'Operational Source Adapters', val: `${metrics.operationalSources} / ${metrics.totalSources}`, sub: 'MoRTH, NHTSA, B-NCAP, E-NCAP', color: '#10b981' },
        ].map((m, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '14px',
              padding: '1.5rem',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              {m.label}
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: m.color, marginBottom: '0.2rem' }}>
              {m.val}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Recall Records Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          padding: '1.75rem',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700 }}>
              Tracked Safety Recall Records
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Official campaign identifiers and affected production ranges.
            </p>
          </div>

          <Link to="/admin/safety/recalls" className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}>
            <span>Manage All Records</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>CAMPAIGN #</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>VEHICLE & MODEL</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>DEFECT SUMMARY</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>SEVERITY</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>AUTHORITY</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>REMEDY STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recalls.slice(0, 6).map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    {r.officialCampaignNumber}
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', color: '#ffffff', fontWeight: 600 }}>
                    {r.make} {r.model}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Years: {r.modelYears.join(', ')}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                    {r.defectSummary.slice(0, 85)}...
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem' }}>
                    <span
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: r.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                        color: r.severity === 'critical' ? '#ef4444' : '#f59e0b',
                        fontWeight: 700,
                      }}
                    >
                      {r.severity}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-muted)' }}>
                    {r.sourceAuthority} ({r.market})
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', color: '#10b981', fontWeight: 600 }}>
                    {r.remedyStatus === 'available_free' ? 'Free Dealer Repair' : 'Software OTA'}
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
