// AutoVerse Stage 18: Market Segment Comparisons & Analytics
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Zap,
  SlidersHorizontal,
  Info,
  ArrowRight,
} from 'lucide-react';
import { getAllPriceRecords } from '../utils/marketStore';
import { getSegmentAnalytics, getEvVsIceComparison } from '../utils/marketService';
import { formatCurrency } from '../utils/tcoCalculator';
import type { CurrencyCode } from '../types/calculator';

export const SegmentAnalyticsPage: React.FC = () => {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const allRecords = getAllPriceRecords();

  const segments = getSegmentAnalytics(allRecords, currency);
  const evVsIceSuv = getEvVsIceComparison(allRecords, 'SUV', currency);
  const evVsIceSedan = getEvVsIceComparison(allRecords, 'Sedan', currency);

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
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Segment Comparisons</span>
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
              <Layers size={14} />
              <span>Cross-Segment Pricing Telemetry</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: '#ffffff', fontWeight: 900 }}>
              Market Segment Comparisons
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Empirical price distributions, median acquisition costs, and powertrain tiering across segments.
            </p>
          </div>

          {/* Currency Toggle */}
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

        {/* EV vs ICE Cost Benchmark Spotlight */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 24, 39, 0.95) 0%, rgba(9, 13, 20, 0.98) 100%)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Zap size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
              Electrification Cost Parity Benchmark
            </span>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Electric vs Conventional ICE Purchase Premium
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '750px', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Comparing median active acquisition prices between pure battery electric vehicles and equivalent internal combustion models.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* SUV Benchmark */}
            {evVsIceSuv && (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
                  SUV Category ({currency})
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span>Electric SUV Median:</span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{formatCurrency(evVsIceSuv.evMedianPrice, currency)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span>ICE (Petrol/Diesel) Median:</span>
                  <strong style={{ color: '#ffffff' }}>{formatCurrency(evVsIceSuv.iceMedianPrice, currency)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>Upfront EV Premium:</span>
                  <strong style={{ color: '#38bdf8' }}>
                    +{formatCurrency(evVsIceSuv.evPremiumAmount, currency)} (+{evVsIceSuv.evPremiumPercentage}%)
                  </strong>
                </div>
              </div>
            )}

            {/* Sedan Benchmark */}
            {evVsIceSedan && (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
                  Sedan Category ({currency})
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span>Electric Sedan Median:</span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{formatCurrency(evVsIceSedan.evMedianPrice, currency)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span>ICE (Petrol/Diesel) Median:</span>
                  <strong style={{ color: '#ffffff' }}>{formatCurrency(evVsIceSedan.iceMedianPrice, currency)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>Upfront EV Premium:</span>
                  <strong style={{ color: '#38bdf8' }}>
                    +{formatCurrency(evVsIceSedan.evPremiumAmount, currency)} (+{evVsIceSedan.evPremiumPercentage}%)
                  </strong>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Info size={14} color="var(--accent-cyan)" />
              <span>Purchase price only. To model lifecycle fuel/charging and maintenance savings, run the TCO Calculator.</span>
            </div>

            <Link to="/ownership-calculator" className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
              <SlidersHorizontal size={14} />
              <span>Open TCO Calculator</span>
            </Link>
          </div>
        </div>

        {/* All Segment Cards */}
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>
          Segment Detailed Metrics ({currency})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {segments.map((seg) => (
            <div
              key={seg.segment}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                    {seg.segment}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {seg.vehicleCount} Models
                  </span>
                </div>

                {/* Metrics Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '1rem',
                    borderRadius: '10px',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                      Median Price
                    </span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-cyan)', marginTop: '0.15rem' }}>
                      {formatCurrency(seg.medianPrice, currency)}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                      Average (Mean)
                    </span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginTop: '0.15rem' }}>
                      {formatCurrency(seg.meanPrice, currency)}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                      Low Range
                    </span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {formatCurrency(seg.minPrice, currency)}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                      High Range
                    </span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {formatCurrency(seg.maxPrice, currency)}
                    </div>
                  </div>
                </div>

                {/* Price Band Distribution */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                    Price Band Distribution
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {seg.priceBands.map((band) => (
                      <div key={band.rangeLabel} style={{ fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem', color: 'var(--text-secondary)' }}>
                          <span>{band.rangeLabel}</span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>
                            {band.count} models ({band.percentage}%)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${band.percentage}%`,
                              height: '100%',
                              backgroundColor: 'var(--accent-cyan)',
                              borderRadius: '4px',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                to={`/market-intelligence/prices?bodyType=${seg.segment.toLowerCase()}`}
                className="btn btn-secondary"
                style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem', marginTop: '1rem' }}
              >
                <span>Browse {seg.segment} Models</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
