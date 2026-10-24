// AutoVerse Stage 7: Platform Settings & Telemetry Preferences

import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  Gauge,
  Shield,
} from 'lucide-react';
import { getSystemSettings, saveSystemSettings } from '../../utils/adminStore';
import type { SystemSettings } from '../../types/admin';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSettings(getSystemSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    saveSystemSettings(settings);
    setToastMessage('Platform operational settings saved successfully.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!settings) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '5rem',
            right: '2rem',
            zIndex: 10000,
            backgroundColor: '#090c12',
            border: '1px solid var(--accent-cyan)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
            color: '#ffffff',
            padding: '0.85rem 1.4rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <CheckCircle2 size={16} color="var(--accent-cyan)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.3rem', color: '#ffffff' }}>
          Platform Settings & Operational Preferences
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
          Manage global telemetry display units, security policies, and Road Cinema playback defaults.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        style={{
          backgroundColor: 'rgba(15, 20, 28, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}
      >
        {/* Section 1: Telemetry & Editorial Units */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Gauge size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Telemetry & Measurement Units
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Primary Speed & Distance Unit
              </label>
              <select
                value={settings.telemetryUnit}
                onChange={(e) =>
                  setSettings({ ...settings, telemetryUnit: e.target.value as 'imperial' | 'metric' })
                }
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                }}
              >
                <option value="imperial">Imperial (MPH, Miles, lbs)</option>
                <option value="metric">Metric (KM/H, Kilometers, kg)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Default Currency Format
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) =>
                  setSettings({ ...settings, defaultCurrency: e.target.value as 'USD' | 'EUR' | 'GBP' })
                }
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                }}
              >
                <option value="USD">USD ($ United States Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
                <option value="GBP">GBP (£ British Pound)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Security & Access Control */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Shield size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Security & Registration Controls
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.allowPublicRegistrations}
                onChange={(e) => setSettings({ ...settings, allowPublicRegistrations: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
              />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                  Allow Public Driver Registration
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  When enabled, visitors can create new driver accounts and build custom garages.
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.enableRoadCinemaAutoPlay}
                onChange={(e) => setSettings({ ...settings, enableRoadCinemaAutoPlay: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
              />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                  Road Cinema Auto-Play Muted Loop
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Hero video on Road Cinema page automatically streams in muted mode.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Last updated: {new Date(settings.lastUpdated).toLocaleString()} by {settings.lastUpdatedBy}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Save size={15} />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
