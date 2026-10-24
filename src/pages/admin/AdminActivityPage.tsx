// AutoVerse Stage 7: Tamper-Evident Administrative Audit Log
// Immutable chronological audit trail of privileged mutations and administrative actions

import React, { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { getAdminActivityLogs } from '../../utils/adminStore';
import type { AdminActivityLog } from '../../types/admin';

export const AdminActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [targetFilter, setTargetFilter] = useState('All');

  const loadData = () => {
    setLogs(getAdminActivityLogs());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('autoverse_admin_activity_updated', loadData);
    return () => window.removeEventListener('autoverse_admin_activity_updated', loadData);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAction = actionFilter === 'All' || log.action === actionFilter;
    const matchTarget = targetFilter === 'All' || log.targetType === targetFilter;
    return matchSearch && matchAction && matchTarget;
  });

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autoverse_admin_audit_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: string) => {
    let bg = 'rgba(255, 255, 255, 0.08)';
    let color = '#ffffff';
    switch (action) {
      case 'CREATE':
        bg = 'rgba(16, 185, 129, 0.15)';
        color = '#10b981';
        break;
      case 'UPDATE':
        bg = 'rgba(59, 130, 246, 0.15)';
        color = '#60a5fa';
        break;
      case 'PUBLISH':
        bg = 'rgba(6, 182, 212, 0.15)';
        color = 'var(--accent-cyan)';
        break;
      case 'UNPUBLISH':
      case 'ARCHIVE':
        bg = 'rgba(245, 158, 11, 0.15)';
        color = '#fbbf24';
        break;
      case 'DELETE':
        bg = 'rgba(239, 68, 68, 0.15)';
        color = 'var(--accent-red)';
        break;
      case 'ROLE_CHANGE':
      case 'STATUS_CHANGE':
        bg = 'rgba(168, 85, 247, 0.15)';
        color = '#c084fc';
        break;
    }
    return (
      <span
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          backgroundColor: bg,
          color,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {action}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.3rem', color: '#ffffff' }}>
            Audit Activity Trail
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Chronological audit recording of all privileged actions, data mutations, and role assignments.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="btn btn-secondary"
          style={{ fontSize: '0.85rem', padding: '0.6rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Download size={15} />
          <span>Export Audit Trail</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div
        style={{
          backgroundColor: 'rgba(15, 20, 28, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, target, or details..."
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.4rem',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.85rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.82rem',
            }}
          >
            <option value="All">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="PUBLISH">PUBLISH</option>
            <option value="UNPUBLISH">UNPUBLISH</option>
            <option value="ARCHIVE">ARCHIVE</option>
            <option value="RESTORE">RESTORE</option>
            <option value="DELETE">DELETE</option>
            <option value="ROLE_CHANGE">ROLE_CHANGE</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
          </select>

          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.82rem',
            }}
          >
            <option value="All">All Entity Targets</option>
            <option value="vehicle">Vehicles</option>
            <option value="manufacturer">Manufacturers</option>
            <option value="launch">Launches</option>
            <option value="cinema_film">Cinema Films</option>
            <option value="user">Users</option>
            <option value="settings">Settings</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: 'rgba(15, 20, 28, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Action</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Entity Type</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target Record</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Action Summary</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Actor</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>{getActionBadge(log.action)}</td>

                    <td style={{ padding: '0.85rem 1rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {log.targetType.replace('_', ' ')}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#ffffff' }}>
                      {log.targetName}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {log.details}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ color: '#ffffff' }}>{log.actor.fullName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.actor.email}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
