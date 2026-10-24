import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Bell,
  Car,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserSafetyAlerts, toggleUserAlertReviewed } from '../utils/safetyService';
import type { UserSafetyAlert } from '../types/safety';

export const MySafetyAlertsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState<UserSafetyAlert[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'unreviewed' | 'reviewed'>('all');

  const loadAlerts = () => {
    if (currentUser) {
      const list = getUserSafetyAlerts(currentUser.id);
      setAlerts(list);
    }
  };

  useEffect(() => {
    loadAlerts();

    const handleAlertsChanged = () => {
      loadAlerts();
    };

    window.addEventListener('autoverse_safety_alerts_changed', handleAlertsChanged);
    window.addEventListener('autoverse_garage_updated', handleAlertsChanged);

    return () => {
      window.removeEventListener('autoverse_safety_alerts_changed', handleAlertsChanged);
      window.removeEventListener('autoverse_garage_updated', handleAlertsChanged);
    };
  }, [currentUser]);

  const handleToggleReviewed = (alertId: string) => {
    if (!currentUser) return;
    toggleUserAlertReviewed(currentUser.id, alertId);
    loadAlerts();
  };

  const filtered = alerts.filter((a) => {
    if (filterMode === 'unreviewed') return !a.isReviewed;
    if (filterMode === 'reviewed') return a.isReviewed;
    return true;
  });

  const unreviewedCount = alerts.filter((a) => !a.isReviewed).length;

  return (
    <div
      style={{
        paddingTop: 'calc(var(--header-height) + 2rem)',
        paddingBottom: '6rem',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Top Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--accent-cyan)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              marginBottom: '0.5rem',
            }}
          >
            <Bell size={15} />
            <span>PERSONALIZED DRIVER TELEMETRY</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#ffffff', fontWeight: 900, marginBottom: '0.5rem' }}>
            My Garage Safety Alerts
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '680px' }}>
            Automated safety intelligence matched directly against your saved garage vehicles.
            Mark notices as reviewed as you inspect or repair your vehicles.
          </p>
        </div>

        {/* Filter bar & Metrics */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-medium)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { key: 'all', label: `All Alerts (${alerts.length})` },
              { key: 'unreviewed', label: `Requires Review (${unreviewedCount})` },
              { key: 'reviewed', label: `Reviewed (${alerts.length - unreviewedCount})` },
            ].map((btn) => (
              <button
                key={btn.key}
                type="button"
                onClick={() => setFilterMode(btn.key as any)}
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: filterMode === btn.key ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.04)',
                  color: filterMode === btn.key ? '#07090d' : 'var(--text-secondary)',
                  fontWeight: filterMode === btn.key ? 700 : 500,
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            User Account: <strong style={{ color: '#ffffff' }}>{currentUser?.fullName}</strong>
          </div>
        </div>

        {/* Alerts Feed */}
        {filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filtered.map((alert) => (
              <div
                key={alert.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: `1px solid ${alert.isReviewed ? 'var(--border-subtle)' : 'rgba(239, 68, 68, 0.4)'}`,
                  borderRadius: '16px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  opacity: alert.isReviewed ? 0.75 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        backgroundColor: alert.isReviewed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: alert.isReviewed ? '#10b981' : '#f87171',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {alert.isReviewed ? 'REVIEWED & ACKNOWLEDGED' : `${alert.severity.toUpperCase()} SEVERITY NOTICE`}
                    </span>

                    <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      Vehicle: {alert.vehicleName}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Published: {new Date(alert.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.4rem' }}>
                    {alert.recallTitle}
                  </h2>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    {alert.matchReason}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleReviewed(alert.id)}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.45rem 0.85rem',
                      color: alert.isReviewed ? 'var(--text-muted)' : '#10b981',
                      borderColor: alert.isReviewed ? 'var(--border-subtle)' : '#10b981',
                    }}
                  >
                    <Check size={14} />
                    <span>{alert.isReviewed ? 'Mark as Unreviewed' : 'Mark as Reviewed & Action Taken'}</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <a
                      href={alert.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                    >
                      <span>Official Source Record</span>
                      <ExternalLink size={13} />
                    </a>

                    <Link
                      to={`/safety/vehicle/${alert.vehicleSlug}`}
                      className="btn btn-primary"
                      style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                    >
                      <span>Vehicle Safety Hub</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '4rem 2rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              textAlign: 'center',
            }}
          >
            <CheckCircle2 size={42} color="#10b981" style={{ margin: '0 auto 1.25rem' }} />
            <h2 style={{ fontSize: '1.35rem', color: '#ffffff', fontWeight: 800, marginBottom: '0.5rem' }}>
              No Safety Alerts Requiring Attention
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.75rem' }}>
              Your saved garage vehicles currently have zero unreviewed safety recalls or service campaigns in the active dataset.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <Link to="/garage" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                <Car size={15} />
                <span>Manage My Garage</span>
              </Link>
              <Link to="/safety/recalls" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                <ShieldAlert size={15} />
                <span>Browse Recall Database</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
