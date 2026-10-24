// AutoVerse Stage 18: Market Intelligence & Price Analytics Dashboard
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Layers,
  Building2,
  Info,
  Calendar,
  SlidersHorizontal,
} from 'lucide-react';
import { getAllPriceRecords, getMarketExecutiveKpis } from '../utils/marketStore';
import { getSegmentAnalytics, getEvVsIceComparison, getLaunchVsCurrentAnalysis } from '../utils/marketService';
import { formatCurrency } from '../utils/tcoCalculator';
import type { CurrencyCode } from '../types/calculator';
import { VEHICLES } from '../data/vehicles';

export const MarketIntelligencePage: React.FC = () => {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [selectedVehicle, setSelectedVehicle] = useState('porsche-taycan-turbo-s');

  const records = getAllPriceRecords();
  const kpis = getMarketExecutiveKpis(currency);
  const segments = getSegmentAnalytics(records, currency);
  const evVsIce = getEvVsIceComparison(records, 'SUV', currency);
  const launchAnalysis = getLaunchVsCurrentAnalysis(records, selectedVehicle);
  const activeVehicleRecord = records.find(
    (r) => r.vehicleSlug === selectedVehicle && r.status === 'active'
  );

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
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Home
          </Link>
          <span style={{ color: 'var(--border-medium)' }}>/</span>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Market Intelligence</span>
        </div>

        {/* Hero Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 24, 39, 0.95) 0%, rgba(9, 13, 20, 0.98) 100%)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            borderRadius: '20px',
            padding: '2.5rem',
            marginBottom: '2.5rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 240, 255, 0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                <TrendingUp size={14} />
                <span>AutoVerse Stage 18 • Price Intelligence & Market Analytics</span>
              </div>

              {/* Currency Selector */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: currency === 'USD' ? 'var(--accent-cyan)' : 'transparent',
                    color: currency === 'USD' ? '#07090d' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('INR')}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: currency === 'INR' ? 'var(--accent-cyan)' : 'transparent',
                    color: currency === 'INR' ? '#07090d' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  INR (₹)
                </button>
              </div>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
                color: '#ffffff',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '1rem',
              }}
            >
              Automotive Market Analytics & Price Intelligence
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '780px', lineHeight: 1.6, marginBottom: '2rem' }}>
              Track genuine manufacturer-announced ex-showroom and MSRP price observations, documented price revisions,
              launch-price vs current deltas, and empirical EV-vs-ICE price premiums across global and Indian automotive sectors.
            </p>

            {/* Quick Action Navigation Buttons */}
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <Link to="/market-intelligence/prices" className="btn btn-primary" style={{ padding: '0.75rem 1.4rem' }}>
                <Search size={16} />
                <span>Search Vehicle Price Explorer</span>
              </Link>
              <Link to="/market-intelligence/segments" className="btn btn-secondary" style={{ padding: '0.75rem 1.4rem' }}>
                <Layers size={16} />
                <span>Segment Comparisons</span>
              </Link>
              <Link to="/market-intelligence/manufacturers" className="btn btn-secondary" style={{ padding: '0.75rem 1.4rem' }}>
                <Building2 size={16} />
                <span>OEM Price Spread</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '1.5rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Catalog Vehicles Monitored
              </span>
              <ShieldCheck size={18} color="var(--accent-cyan)" />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
              {kpis.totalMonitoredVehicles}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.35rem' }}>
              Verified models tracked across US & India markets
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '1.5rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Price Observations
              </span>
              <BarChart3 size={18} color="#38bdf8" />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#38bdf8' }}>
              {kpis.totalPriceObservations}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.35rem' }}>
              Dated historical launch & revision records archived
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '1.5rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Catalog Median Price ({currency})
              </span>
              <TrendingUp size={18} color="#34d399" />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#34d399' }}>
              {formatCurrency(kpis.medianCatalogPrice, currency)}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.35rem' }}>
              Midpoint benchmark price across active listings
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '1.5rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Documented Price Revisions
              </span>
              <Calendar size={18} color="#fbbf24" />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fbbf24' }}>
              {kpis.recentPriceChangesCount}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.35rem' }}>
              Verified price hikes and price cuts on record
            </p>
          </div>
        </div>

        {/* Interactive Vehicle Price & Launch Delta Spotter */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '18px',
            padding: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                Vehicle Launch Price vs Current Price Spotter
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Examine nominal price changes and elapsed timeline between original debut and current pricing.
              </p>
            </div>

            {/* Vehicle Selector */}
            <div style={{ minWidth: '260px' }}>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#0c1017',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                }}
              >
                {VEHICLES.map((v) => (
                  <option key={v.id} value={v.id} style={{ backgroundColor: '#0c1017' }}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {launchAnalysis && activeVehicleRecord ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                backgroundColor: 'rgba(9, 13, 20, 0.7)',
                borderRadius: '14px',
                padding: '1.5rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Original Debut Launch Price
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                  {formatCurrency(launchAnalysis.launchPrice, launchAnalysis.currency)}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Effective: {launchAnalysis.launchDate} • Source: {launchAnalysis.launchSource}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Current Active Listed Price
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
                  {formatCurrency(launchAnalysis.currentPrice, launchAnalysis.currency)}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Effective: {launchAnalysis.currentDate} • Source: {launchAnalysis.currentSource}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Nominal Trajectory Delta
                </span>
                <div
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color:
                      launchAnalysis.absoluteChange > 0
                        ? '#f87171'
                        : launchAnalysis.absoluteChange < 0
                        ? '#34d399'
                        : 'var(--text-secondary)',
                    marginTop: '0.25rem',
                  }}
                >
                  {launchAnalysis.absoluteChange > 0 ? '+' : ''}
                  {formatCurrency(launchAnalysis.absoluteChange, launchAnalysis.currency)}
                  <span style={{ fontSize: '1rem', marginLeft: '0.5rem', fontWeight: 600 }}>
                    ({launchAnalysis.absoluteChange > 0 ? '+' : ''}
                    {launchAnalysis.percentageChange}%)
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Timeline: {launchAnalysis.daysElapsed} days elapsed between recorded observations
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <Link
                  to={`/market-intelligence/vehicles/${selectedVehicle}`}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.65rem 1.1rem' }}
                >
                  <span>Open Full Price Dossier</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Historical launch pricing observations for this vehicle are currently being indexed.
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Info size={14} color="var(--accent-cyan)" />
            <span>
              Nominal price delta comparison. Values are not adjusted for general macroeconomic inflation.
            </span>
          </div>
        </div>

        {/* Segment Median Comparison (Visual Bar Chart) */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '18px',
            padding: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                Segment Price Benchmark Distribution ({currency})
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Median prices across vehicle body types and powertrain categories.
              </p>
            </div>

            <Link to="/market-intelligence/segments" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              <span>View In-Depth Segment Analytics</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* SVG Bar Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {segments.map((seg) => {
              const maxBenchmark = Math.max(...segments.map((s) => s.medianPrice), 1);
              const barPercent = Math.min(100, Math.max(8, (seg.medianPrice / maxBenchmark) * 100));

              return (
                <div key={seg.segment}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                        {seg.segment}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.1rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {seg.vehicleCount} models
                      </span>
                    </div>

                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(seg.medianPrice, currency)}
                    </div>
                  </div>

                  {/* Horizontal Visual Meter */}
                  <div
                    style={{
                      width: '100%',
                      height: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: `${barPercent}%`,
                        height: '100%',
                        borderRadius: '8px',
                        background:
                          seg.segment.includes('Electric')
                            ? 'linear-gradient(90deg, #0284c7 0%, #00f0ff 100%)'
                            : seg.segment.includes('Hybrid')
                            ? 'linear-gradient(90deg, #059669 0%, #34d399 100%)'
                            : 'linear-gradient(90deg, #475569 0%, #94a3b8 100%)',
                        transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Low: {formatCurrency(seg.minPrice, currency)}</span>
                    <span>High: {formatCurrency(seg.maxPrice, currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two-Column Section: Recent Price Adjustments & EV vs ICE Benchmark */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
          {/* Recent Documented Price Adjustments Feed */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '18px',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.2rem' }}>
                  Documented Price Adjustments
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Recent verified price hikes and manufacturer price cuts.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {kpis.recentPriceAdjustments.map((adj) => (
                <div
                  key={adj.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(9, 13, 20, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      {adj.vehicleName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {adj.variant} • {adj.effectiveDate}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        backgroundColor:
                          adj.direction === 'increase'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(16, 185, 129, 0.15)',
                        color: adj.direction === 'increase' ? '#f87171' : '#34d399',
                        border: `1px solid ${
                          adj.direction === 'increase' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                        }`,
                      }}
                    >
                      {adj.direction === 'increase' ? '+' : ''}
                      {adj.percentageChange}%
                    </span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {formatCurrency(adj.newPrice, adj.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EV vs ICE Purchase Price Premium Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '18px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  color: '#38bdf8',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  marginBottom: '1rem',
                }}
              >
                <Zap size={13} />
                <span>Electrification Cost Parity Benchmark</span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                Electric vs Internal Combustion SUV Delta
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Based on current verified median catalog purchase prices across {currency} SUV models.
              </p>

              {evVsIce && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Electric SUV Median Price:</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      {formatCurrency(evVsIce.evMedianPrice, currency)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Petrol/Diesel SUV Median:</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                      {formatCurrency(evVsIce.iceMedianPrice, currency)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'rgba(0, 240, 255, 0.08)', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>EV Upfront Acquisition Premium:</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8' }}>
                      +{formatCurrency(evVsIce.evPremiumAmount, currency)} (+{evVsIce.evPremiumPercentage}%)
                    </span>
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>Lifetime Context:</span> While BEVs exhibit an upfront purchase premium, lower running costs per km and reduced maintenance amortization offset this over a 5-year ownership horizon.
              </div>
            </div>

            <Link
              to="/ownership-calculator"
              className="btn btn-primary"
              style={{ justifyContent: 'center', padding: '0.75rem', fontSize: '0.85rem' }}
            >
              <SlidersHorizontal size={15} />
              <span>Simulate 5-Year Total Cost in TCO Calculator</span>
            </Link>
          </div>
        </div>

        {/* Bottom Feature Navigation Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <Link
            to="/market-intelligence/prices"
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Search size={24} color="var(--accent-cyan)" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 800, marginBottom: '0.35rem' }}>
              Current Price Explorer
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              Filter all 50 verified vehicles by manufacturer, price band, powertrain, and export sanitized CSV reports.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 700 }}>
              <span>Launch Price Explorer</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          <Link
            to="/market-intelligence/manufacturers"
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Building2 size={24} color="#34d399" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 800, marginBottom: '0.35rem' }}>
              Manufacturer Price Spreads
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              Compare brand price positioning, entry-level to flagship pricing spreads, and OEM volume distributions.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.8rem', fontWeight: 700 }}>
              <span>View OEM Rankings</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          <Link
            to="/admin/market-data"
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <ShieldCheck size={24} color="#f59e0b" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 800, marginBottom: '0.35rem' }}>
              Admin Market Data Portal
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              Administrative controls for batch CSV price ingestion, duplicate detection, and source audits.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>
              <span>Open Admin Terminal</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
