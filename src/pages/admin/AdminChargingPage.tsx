// AutoVerse Stage 16: Admin Charging Network & Routing Terminal (/admin/charging)
// Provides fleet station management, operator network audits, and routing provider diagnostics.

import React, { useState } from 'react';
import {
  Zap,
  Search,
} from 'lucide-react';
import { CHARGING_STATIONS } from '../../data/chargingStations';
import type { ChargingStation } from '../../types/tripPlanner';

export const AdminChargingPage: React.FC = () => {
  const [stations] = useState<ChargingStation[]>(CHARGING_STATIONS);
  const [search, setSearch] = useState('');

  const filtered = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.operator.toLowerCase().includes(search.toLowerCase())
  );

  const totalPlugs = stations.reduce(
    (sum, s) => sum + s.connectors.reduce((pSum, c) => pSum + c.totalPlugs, 0),
    0
  );

  const averagePowerKw = Math.round(
    stations.reduce((sum, s) => sum + s.maxPowerKw, 0) / Math.max(1, stations.length)
  );

  return (
    <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Zap size={20} color="var(--accent-cyan)" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            EV Charging Network & Highway Corridors
          </h1>
          <span
            style={{
              fontSize: '0.68rem',
              backgroundColor: 'rgba(0, 240, 255, 0.12)',
              color: 'var(--accent-cyan)',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              fontWeight: 700,
            }}
          >
            Stage 16
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Monitor verified fast-charging infrastructure, manage connector ratings, and inspect GIS routing engine health.
        </p>
      </div>

      {/* Network Health Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            padding: '1.1rem',
            backgroundColor: '#0a0e17',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verified Stations</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '0.2rem 0' }}>
            {stations.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981' }}>100% Highway Surveyed</div>
        </div>

        <div
          style={{
            padding: '1.1rem',
            backgroundColor: '#0a0e17',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Charging Plugs</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent-cyan)', margin: '0.2rem 0' }}>
            {totalPlugs}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CCS2, Type 2, NACS</div>
        </div>

        <div
          style={{
            padding: '1.1rem',
            backgroundColor: '#0a0e17',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fleet Average Peak Power</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f59e0b', margin: '0.2rem 0' }}>
            {averagePowerKw} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>kW</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Max: 350 kW (800V)</div>
        </div>

        <div
          style={{
            padding: '1.1rem',
            backgroundColor: '#0a0e17',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Routing Provider</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0.4rem 0' }}>
            OSRM / Nominatim
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981' }}>Verified Survey Fallback Active</div>
        </div>
      </div>

      {/* Stations Table */}
      <div
        style={{
          backgroundColor: '#0a0e17',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ position: 'relative', width: '320px' }}>
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter stations..."
              style={{
                width: '100%',
                padding: '0.45rem 0.65rem 0.45rem 2.2rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>

          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {stations.length} hubs
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Station & Operator</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>City / Corridor</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Max Power</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Connectors</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{s.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.operator}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                    {s.city}, {s.country}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>{s.maxPowerKw} kW</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                    {s.connectors.map((c) => `${c.powerKw}kW ${c.type}`).join(', ')}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        fontWeight: 600,
                      }}
                    >
                      Verified Operational
                    </span>
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
