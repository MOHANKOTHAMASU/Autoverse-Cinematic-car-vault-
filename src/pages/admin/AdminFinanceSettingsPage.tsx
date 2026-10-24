// AutoVerse Stage 22: Administrator Finance Configuration & Provider Registry
// Configure platform calculation limits, APR boundaries, fee models, and verified lender profiles.

import React, { useState } from 'react';
import {
  Landmark,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Save,
  Building2,
  Percent,
} from 'lucide-react';
import {
  getFinanceSettings,
  updateFinanceSettings,
} from '../../utils/financeStore';
import type { FinanceSystemSettings } from '../../types/offers';
import { useAuth } from '../../context/AuthContext';

export const AdminFinanceSettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<FinanceSystemSettings>(() => getFinanceSettings());
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateFinanceSettings(settings, currentUser);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div
      style={{
        padding: '2rem',
        backgroundColor: '#05070a',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        minHeight: '100vh',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Landmark size={20} style={{ color: '#60a5fa' }} />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
              Car Finance & Amortization System Settings
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            Configure reducing-balance EMI calculation limits, default fee structures, and verified financial institution registries.
          </p>
        </div>

        {saveSuccess && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '12px',
              color: '#34d399',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <CheckCircle2 size={18} />
            <span>Finance calculation parameters updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Rate & Tenure Boundaries */}
          <div
            style={{
              backgroundColor: '#0a0f1d',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Percent size={18} style={{ color: '#60a5fa' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Interest Rate & Tenure Guardrails
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Minimum Allowed APR (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={settings.minInterestRate}
                  onChange={(e) => setSettings({ ...settings, minInterestRate: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.7rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Maximum Allowed APR (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="15"
                  max="50"
                  value={settings.maxInterestRate}
                  onChange={(e) => setSettings({ ...settings, maxInterestRate: parseFloat(e.target.value) || 30 })}
                  style={{ width: '100%', padding: '0.7rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Default Benchmark APR (%)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="20"
                  value={settings.defaultInterestRate}
                  onChange={(e) => setSettings({ ...settings, defaultInterestRate: parseFloat(e.target.value) || 8.5 })}
                  style={{ width: '100%', padding: '0.7rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Default Tenure (Months)
                </label>
                <input
                  type="number"
                  min="12"
                  max="84"
                  step="12"
                  value={settings.defaultTenureMonths}
                  onChange={(e) => setSettings({ ...settings, defaultTenureMonths: parseInt(e.target.value, 10) || 60 })}
                  style={{ width: '100%', padding: '0.7rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* Fee & Feature Controls */}
          <div
            style={{
              backgroundColor: '#0a0f1d',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <SlidersHorizontal size={18} style={{ color: '#60a5fa' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Default Down Payment & Fee Assumptions
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Default Down Payment (%)
                </label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="50"
                  value={settings.defaultDownPaymentPercent}
                  onChange={(e) => setSettings({ ...settings, defaultDownPaymentPercent: parseFloat(e.target.value) || 20 })}
                  style={{ width: '100%', padding: '0.7rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Default Processing Fee Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={settings.defaultProcessingFeePercent}
                  onChange={(e) => setSettings({ ...settings, defaultProcessingFeePercent: parseFloat(e.target.value) || 1.0 })}
                  style={{ width: '100%', padding: '0.7rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="allowBalloonCheckbox"
                  checked={settings.allowBalloonPayments}
                  onChange={(e) => setSettings({ ...settings, allowBalloonPayments: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="allowBalloonCheckbox" style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}>
                  Enable Balloon Payment Architecture
                </label>
              </div>
            </div>
          </div>

          {/* Verified Finance Providers Registry */}
          <div
            style={{
              backgroundColor: '#0a0f1d',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Building2 size={18} style={{ color: '#10b981' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Verified Institutional Finance Providers
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {settings.verifiedProviders.map((prov) => (
                <div
                  key={prov.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(15,23,42,0.7)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                      {prov.name} ({prov.code})
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        backgroundColor: 'rgba(16,185,129,0.15)',
                        color: '#34d399',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                      }}
                    >
                      <ShieldCheck size={12} />
                      <span>Verified Tier</span>
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Headline APR: {prov.headlineApr}% (Range: {prov.minApr}% - {prov.maxApr}%)
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    Source: {prov.source} • Last verified {prov.lastVerified}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 2rem',
                backgroundColor: '#2563eb',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              <Save size={16} />
              <span>Save Finance Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
