// AutoVerse Stage 18: Manufacturer Price Comparisons & Brand Spread
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { getAllPriceRecords } from '../utils/marketStore';
import { getManufacturerAnalytics } from '../utils/marketService';
import { formatCurrency } from '../utils/tcoCalculator';
import type { CurrencyCode } from '../types/calculator';

export const ManufacturerAnalyticsPage: React.FC = () => {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const allRecords = getAllPriceRecords();
  const manufacturers = getManufacturerAnalytics(allRecords, currency);

  return (
    <div
      style={{
        paddingTop: 'calc(var(--header-height) + 2rem)',
        paddingBottom: '6rem',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Home
          </Link>
          <span style={{ color: 'var(--border-medium)' }}>/</span>
          <Link to="/market-intelligence" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Market Intelligence
          </Link>
          <span style={{ color: 'var(--border-medium)' }}>/</span>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Manufacturer Spreads</span>
        </div>

        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--accent-cyan)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: '0.4rem',
              }}
            >
              <Building2 size={14} />
              <span>OEM Market Positioning</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: '#ffffff', fontWeight: 900 }}>
              Manufacturer Price Spreads & Dispersion
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Comparative price architecture, entry-level to flagship pricing spread, and volume powertrain focus.
            </p>
          </div>

          {/* Currency Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              padding: '0.25rem',
              borderRadius: '10px',
              border: '1px solid var(--border-medium)',
              gap: '0.25rem',
            }}
          >
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: currency === 'USD' ? 'var(--accent-cyan)' : 'transparent',
                color: currency === 'USD' ? '#07090d' : 'var(--text-secondary)',
              }}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('INR')}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: currency === 'INR' ? 'var(--accent-cyan)' : 'transparent',
                color: currency === 'INR' ? '#07090d' : 'var(--text-secondary)',
              }}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* OEM Table */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            overflowX: 'auto',
            marginBottom: '2rem',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                <th style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontWeight: 700 }}>Rank & Brand</th>
                <th style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontWeight: 700 }}>Country</th>
                <th style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontWeight: 700 }}>Catalog Models</th>
                <th style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontWeight: 700 }}>Primary Tech</th>
                <th style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Entry Level</th>
                <th style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Flagship Tier</th>
                <th style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Median Price</th>
                <th style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Spread Ratio</th>
                <th style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Explore</th>
              </tr>
            </thead>
            <tbody>
              {manufacturers.map((m, idx) => (
                <tr key={m.brand} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: '#ffffff' }}>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginRight: '0.6rem' }}>
                      #{idx + 1}
                    </span>
                    {m.brand}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                    {m.headquarters}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {m.modelCount} models
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: m.dominantPowertrain === 'electric' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                        color: m.dominantPowertrain === 'electric' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {m.dominantPowertrain}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(m.minPrice, currency)}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#ffffff', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(m.maxPrice, currency)}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: 'var(--accent-cyan)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(m.medianPrice, currency)}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#38bdf8', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {m.priceSpreadRatio}x
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <Link
                      to={`/market-intelligence/prices?brand=${encodeURIComponent(m.brand)}`}
                      style={{
                        color: 'var(--accent-cyan)',
                        textDecoration: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <span>Listings</span>
                      <ArrowRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Heritage Link banner */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Compass size={24} color="var(--accent-cyan)" />
            <div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
                Explore Automotive Heritage & OEM Profiles
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Discover founding histories, iconic lineage, and technical engineering milestones.
              </div>
            </div>
          </div>

          <Link to="/manufacturers" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <span>Marques & Heritage Gallery</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
