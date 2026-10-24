// AutoVerse Stage 18: Vehicle Price History & Intelligence Dossier
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  Info,
  Calculator,
  Car,
} from 'lucide-react';
import { getAllPriceRecords } from '../utils/marketStore';
import { getVehiclePriceHistory, getLaunchVsCurrentAnalysis } from '../utils/marketService';
import { formatCurrency } from '../utils/tcoCalculator';
import { VEHICLES } from '../data/vehicles';

export const VehiclePriceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const allRecords = getAllPriceRecords();

  const vehicleCatalog = VEHICLES.find((v) => v.id === slug || v.slug === slug);
  const { records: historyRecords, changeEvents } = getVehiclePriceHistory(allRecords, slug || '');
  const launchAnalysis = slug ? getLaunchVsCurrentAnalysis(allRecords, slug) : null;

  const [activeTooltip, setActiveTooltip] = useState<{
    x: number;
    y: number;
    amount: number;
    date: string;
    type: string;
    source: string;
  } | null>(null);

  if (!vehicleCatalog && historyRecords.length === 0) {
    return (
      <div
        style={{
          paddingTop: 'calc(var(--header-height) + 4rem)',
          paddingBottom: '6rem',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '0 1.5rem' }}>
          <TrendingUp size={48} color="#f87171" style={{ margin: '0 auto 1.5rem' }} />
          <h1 style={{ fontSize: '2rem', color: '#ffffff', fontWeight: 800, marginBottom: '1rem' }}>
            Vehicle Price Record Not Found
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            The requested vehicle identifier "{slug}" was not located in the active market intelligence repository.
          </p>
          <Link to="/market-intelligence/prices" className="btn btn-primary">
            <ArrowLeft size={16} /> Return to Price Explorer
          </Link>
        </div>
      </div>
    );
  }

  const primaryRecord = historyRecords.find((r) => r.status === 'active') || historyRecords[historyRecords.length - 1];
  const vehicleName = vehicleCatalog?.name || primaryRecord?.vehicleName || slug || '';
  const brand = vehicleCatalog?.brand || primaryRecord?.brand || '';
  const currency = primaryRecord?.currency || 'USD';
  const thumbnail = vehicleCatalog?.thumbnail || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80';

  // SVG Chart Geometry
  const chartWidth = 720;
  const chartHeight = 260;
  const padding = { top: 30, right: 30, bottom: 40, left: 70 };

  const minPrice = Math.min(...historyRecords.map((r) => r.amount));
  const maxPrice = Math.max(...historyRecords.map((r) => r.amount));
  const priceRange = maxPrice === minPrice ? 1 : maxPrice - minPrice;

  const points = historyRecords.map((r, idx) => {
    const x =
      historyRecords.length === 1
        ? chartWidth / 2
        : padding.left +
          (idx / (historyRecords.length - 1)) * (chartWidth - padding.left - padding.right);
    const y =
      maxPrice === minPrice
        ? chartHeight / 2
        : padding.top +
          (1 - (r.amount - minPrice) / priceRange) * (chartHeight - padding.top - padding.bottom);
    return { ...r, x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

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
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Home
          </Link>
          <span style={{ color: 'var(--border-medium)' }}>/</span>
          <Link to="/market-intelligence" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Market Intelligence
          </Link>
          <span style={{ color: 'var(--border-medium)' }}>/</span>
          <Link to="/market-intelligence/prices" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Price Explorer
          </Link>
          <span style={{ color: 'var(--border-medium)' }}>/</span>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{vehicleName}</span>
        </div>

        {/* Hero Header Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-cyan)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {brand} MARKET INTELLIGENCE DOSSIER
              </span>

              {vehicleCatalog?.powertrain === 'electric' && (
                <span
                  style={{
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0, 240, 255, 0.15)',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}
                >
                  HIGH VOLTAGE BEV
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.7rem)', color: '#ffffff', fontWeight: 900, marginBottom: '0.5rem' }}>
              {vehicleName}
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Comprehensive price trajectory, documented manufacturer revisions, debut launch comparisons, and empirical market positioning.
            </p>

            {/* Price Badge */}
            <div
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                padding: '0.85rem 1.25rem',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                CURRENT ACTIVE LISTED PRICE ({primaryRecord.taxBasis.toUpperCase()})
              </span>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                {formatCurrency(primaryRecord.amount, currency)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Effective Date: {primaryRecord.effectiveDate} • Verified via {primaryRecord.sourceName}
              </span>
            </div>

            {/* Quick Cross-Links */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to={`/cars/${slug}`} className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '0.6rem 1rem' }}>
                <Car size={14} />
                <span>Vehicle Specs</span>
              </Link>

              <Link to={`/ownership-calculator`} className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '0.6rem 1rem' }}>
                <Calculator size={14} color="var(--accent-cyan)" />
                <span>5-Year TCO Math</span>
              </Link>

              <Link to={`/safety/vehicle/${slug}`} className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '0.6rem 1rem' }}>
                <ShieldCheck size={14} color="#34d399" />
                <span>Safety & Recalls</span>
              </Link>
            </div>
          </div>

          {/* Vehicle Visual */}
          <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-subtle)', height: '240px' }}>
            <img
              src={thumbnail}
              alt={vehicleName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Launch vs Current Analysis Card */}
        {launchAnalysis && (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '18px',
              padding: '1.75rem',
              marginBottom: '2rem',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
              Launch Price vs Current Price Trajectory
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Nominal comparison of original announced pricing at vehicle introduction compared with the latest active market listing.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Original Launch Price
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                  {formatCurrency(launchAnalysis.launchPrice, launchAnalysis.currency)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Recorded: {launchAnalysis.launchDate}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Current Listed Price
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                  {formatCurrency(launchAnalysis.currentPrice, launchAnalysis.currency)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Recorded: {launchAnalysis.currentDate}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Nominal Trajectory Delta
                </span>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color:
                      launchAnalysis.absoluteChange > 0
                        ? '#f87171'
                        : launchAnalysis.absoluteChange < 0
                        ? '#34d399'
                        : 'var(--text-secondary)',
                    marginTop: '0.2rem',
                  }}
                >
                  {launchAnalysis.absoluteChange > 0 ? '+' : ''}
                  {formatCurrency(launchAnalysis.absoluteChange, launchAnalysis.currency)}
                  <span style={{ fontSize: '0.9rem', marginLeft: '0.4rem', fontWeight: 700 }}>
                    ({launchAnalysis.absoluteChange > 0 ? '+' : ''}
                    {launchAnalysis.percentageChange}%)
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Span: {launchAnalysis.daysElapsed} days elapsed
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Info size={13} color="var(--accent-cyan)" />
              <span>
                Note: This is a nominal price comparison. It does not account for macroeconomic inflation or currency purchasing-power parity adjustments.
              </span>
            </div>
          </div>
        )}

        {/* Interactive SVG Price History Timeline */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '18px',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                Documented Price Observation Timeline
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Chronological price points plotted from official manufacturer announcements and verified registrations.
              </p>
            </div>

            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                color: 'var(--accent-cyan)',
              }}
            >
              {historyRecords.length} Documented Observation{historyRecords.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* SVG Chart */}
          <div style={{ position: 'relative', width: '100%', overflowX: 'auto', backgroundColor: '#090d14', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '1rem 0' }}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              style={{ width: '100%', height: 'auto', display: 'block', minWidth: '550px' }}
            >
              {/* Grid Lines */}
              <line x1={padding.left} y1={padding.top} x2={chartWidth - padding.right} y2={padding.top} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1={padding.left} y1={chartHeight / 2} x2={chartWidth - padding.right} y2={chartHeight / 2} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1={padding.left} y1={chartHeight - padding.bottom} x2={chartWidth - padding.right} y2={chartHeight - padding.bottom} stroke="rgba(255,255,255,0.15)" />

              {/* Y-Axis Labels */}
              <text x={padding.left - 10} y={padding.top + 5} fill="var(--text-muted)" fontSize="11" textAnchor="end" fontFamily="var(--font-mono)">
                {formatCurrency(maxPrice, currency)}
              </text>
              <text x={padding.left - 10} y={chartHeight - padding.bottom + 4} fill="var(--text-muted)" fontSize="11" textAnchor="end" fontFamily="var(--font-mono)">
                {formatCurrency(minPrice, currency)}
              </text>

              {/* Connecting Polyline */}
              {points.length > 1 && (
                <polyline
                  fill="none"
                  stroke="var(--accent-cyan)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylinePoints}
                />
              )}

              {/* Plot Points */}
              {points.map((pt) => (
                <g key={pt.id}>
                  {/* Subtle vertical indicator */}
                  <line x1={pt.x} y1={pt.y} x2={pt.x} y2={chartHeight - padding.bottom} stroke="rgba(0, 240, 255, 0.2)" strokeDasharray="2 2" />

                  {/* Outer circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={7}
                    fill="#07090d"
                    stroke={pt.priceType === 'launch_price' ? '#fbbf24' : 'var(--accent-cyan)'}
                    strokeWidth="3"
                    style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
                    onMouseEnter={() =>
                      setActiveTooltip({
                        x: pt.x,
                        y: pt.y,
                        amount: pt.amount,
                        date: pt.effectiveDate,
                        type: pt.priceType,
                        source: pt.sourceName,
                      })
                    }
                    onMouseLeave={() => setActiveTooltip(null)}
                  />

                  {/* Date label at bottom */}
                  <text
                    x={pt.x}
                    y={chartHeight - padding.bottom + 20}
                    fill="var(--text-muted)"
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                  >
                    {pt.effectiveDate.slice(0, 7)}
                  </text>
                </g>
              ))}
            </svg>

            {/* Floating Tooltip */}
            {activeTooltip && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(activeTooltip.x / chartWidth) * 100}%`,
                  top: `${Math.max(10, activeTooltip.y - 75)}px`,
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(12, 16, 24, 0.95)',
                  border: '1px solid var(--accent-cyan)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.78rem',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.8)',
                  zIndex: 10,
                }}
              >
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '0.9rem' }}>
                  {formatCurrency(activeTooltip.amount, currency)}
                </div>
                <div style={{ color: '#ffffff', fontSize: '0.72rem' }}>
                  {activeTooltip.type.replace('_', ' ').toUpperCase()} • {activeTooltip.date}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginTop: '0.15rem' }}>
                  Source: {activeTooltip.source}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Documented Price Revisions Table */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '18px',
            padding: '1.75rem',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
            Verified Price Adjustments & Events
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Audit trail of recorded price revisions, adjustments, and effective announcement dates.
          </p>

          {changeEvents.length === 0 ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '12px',
                color: 'var(--text-muted)',
                fontSize: '0.88rem',
              }}
            >
              Initial baseline price archived. No subsequent manufacturer revisions have been registered to date.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Effective Date</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Prior Price</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Revised Price</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Absolute Delta</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Percentage</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Documentation / Source</th>
                  </tr>
                </thead>
                <tbody>
                  {changeEvents.map((evt) => (
                    <tr key={evt.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                        {evt.effectiveDate}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                        {formatCurrency(evt.previousPrice, evt.currency)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#ffffff', fontWeight: 700 }}>
                        {formatCurrency(evt.newPrice, evt.currency)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: evt.direction === 'increase' ? '#f87171' : '#34d399' }}>
                        {evt.direction === 'increase' ? '+' : ''}
                        {formatCurrency(evt.absoluteChange, evt.currency)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: evt.direction === 'increase' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: evt.direction === 'increase' ? '#f87171' : '#34d399',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                          }}
                        >
                          {evt.direction === 'increase' ? '+' : ''}
                          {evt.percentageChange}%
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <a
                          href={evt.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: 'var(--accent-cyan)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.78rem',
                          }}
                        >
                          <span>{evt.sourceName}</span>
                          <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
