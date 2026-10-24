// AutoVerse Stage 7: Admin Overview Dashboard
// Real metrics from persistent database, recent activity audit feed, and quick actions

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Building2,
  Calendar,
  Film,
  Users,
  Activity,
  PlusCircle,
  Clock,
  ArrowUpRight,
  Database,
  Lock,
} from 'lucide-react';
import { getDashboardMetrics, getAdminActivityLogs } from '../../utils/adminStore';
import type { AdminDashboardMetrics, AdminActivityLog } from '../../types/admin';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [recentLogs, setRecentLogs] = useState<AdminActivityLog[]>([]);

  const loadData = () => {
    setMetrics(getDashboardMetrics());
    setRecentLogs(getAdminActivityLogs().slice(0, 8));
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('autoverse_vehicles_updated', handleUpdate);
    window.addEventListener('autoverse_admin_activity_updated', handleUpdate);
    return () => {
      window.removeEventListener('autoverse_vehicles_updated', handleUpdate);
      window.removeEventListener('autoverse_admin_activity_updated', handleUpdate);
    };
  }, []);

  if (!metrics) return null;

  const statCards = [
    {
      title: 'Total Vehicles',
      value: metrics.totalVehicles,
      sub: `${metrics.publishedVehicles} Published · ${metrics.draftVehicles} Drafts`,
      icon: Car,
      link: '/admin/vehicles',
      color: 'var(--accent-cyan)',
    },
    {
      title: 'Active Marques & OEMs',
      value: metrics.totalManufacturers,
      sub: 'Porsche, Audi, Mercedes, BMW, Tesla',
      icon: Building2,
      link: '/admin/manufacturers',
      color: '#3b82f6',
    },
    {
      title: 'Road Cinema Reels',
      value: metrics.totalFilms,
      sub: '4K Anamorphic Automotive Films',
      icon: Film,
      link: '/admin/cinema',
      color: '#a855f7',
    },
    {
      title: 'Upcoming Launches',
      value: metrics.totalLaunches,
      sub: 'Verified 2025/2026 Premieres',
      icon: Calendar,
      link: '/admin/launches',
      color: '#f59e0b',
    },
    {
      title: 'Registered Users',
      value: metrics.totalUsers,
      sub: `${metrics.activeUsers} Active Drivers · ${metrics.adminUsersCount} Admins`,
      icon: Users,
      link: '/admin/users',
      color: '#10b981',
    },
  ];

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString();
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'rgba(16, 185, 129, 0.15)';
      case 'UPDATE':
        return 'rgba(59, 130, 246, 0.15)';
      case 'PUBLISH':
        return 'rgba(6, 182, 212, 0.15)';
      case 'UNPUBLISH':
      case 'ARCHIVE':
        return 'rgba(245, 158, 11, 0.15)';
      case 'DELETE':
        return 'rgba(239, 68, 68, 0.15)';
      default:
        return 'rgba(255, 255, 255, 0.08)';
    }
  };

  const getActionTextColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return '#10b981';
      case 'UPDATE':
        return '#60a5fa';
      case 'PUBLISH':
        return 'var(--accent-cyan)';
      case 'UNPUBLISH':
      case 'ARCHIVE':
        return '#fbbf24';
      case 'DELETE':
        return 'var(--accent-red)';
      default:
        return '#e2e8f0';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Page Title & Quick Actions */}
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
          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '0.4rem',
              color: '#ffffff',
            }}
          >
            Administration Overview
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Real-time telemetry, vehicle catalog control, and automotive media publishing engine.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to="/admin/vehicles?action=add"
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.6rem 1.1rem' }}
          >
            <PlusCircle size={16} />
            <span>Add Vehicle</span>
          </Link>

          <Link
            to="/admin/cinema"
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.6rem 1.1rem' }}
          >
            <Film size={16} />
            <span>Manage Films</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              style={{
                textDecoration: 'none',
                backgroundColor: 'rgba(15, 20, 28, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    backgroundColor: `${card.color}15`,
                    border: `1px solid ${card.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.color,
                  }}
                >
                  <Icon size={20} />
                </div>
                <ArrowUpRight size={16} color="var(--text-muted)" />
              </div>

              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {card.sub}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. System Architecture & Integrity Status */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(15, 20, 28, 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Database & Storage Integrity
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            High-definition vehicle specifications, verified chassis engineering datasheets, and media streams are securely indexed and cached.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Catalog Publication Engine:</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Active (Direct Feed)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Media Assets & Local MP4 Reel:</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Synced (23MB High-Def)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Audit Logging:</span>
              <span style={{ color: '#60a5fa', fontWeight: 600 }}>Immutable Sequence</span>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(15, 20, 28, 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Lock size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Security & Authorization Guards
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Role verification enforced at model mutation boundaries. Client-supplied flags are strictly rejected.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Password Security:</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Salted SHA-256 WebCrypto</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Brute-Force Rate Limiting:</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>5 Attempts / 300s Lock</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Last Admin Protection:</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Enforced</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Administrative Activity Feed */}
      <div
        style={{
          backgroundColor: 'rgba(15, 20, 28, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Activity size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Audit Activity Log
            </h3>
          </div>

          <Link
            to="/admin/activity"
            style={{
              fontSize: '0.82rem',
              color: 'var(--accent-cyan)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            View Full Audit Trail &rarr;
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <p style={{ margin: 0 }}>No administrative actions recorded in current session yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Action</th>
                  <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target</th>
                  <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Details</th>
                  <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Administrator</th>
                  <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr
                    key={log.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: getActionBadgeColor(log.action),
                          color: getActionTextColor(log.action),
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: '#ffffff' }}>
                      {log.targetName}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)' }}>
                      {log.details}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {log.actor.fullName}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {formatTimestamp(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
