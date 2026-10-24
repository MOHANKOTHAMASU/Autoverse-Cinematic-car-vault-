import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ShieldAlert,
  RotateCcw,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { searchRecalls, type RecallSearchFilters } from '../utils/safetyService';
import type { GeographicMarket, SafetyCategory, SafetySeverity } from '../types/safety';

export const RecallSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [manufacturer, setManufacturer] = useState('all');
  const [market, setMarket] = useState<GeographicMarket | 'all'>('all');
  const [category, setCategory] = useState<SafetyCategory | 'all'>('all');
  const [severity, setSeverity] = useState<SafetySeverity | 'all'>('all');
  const [modelYear, setModelYear] = useState<string>('all');

  const filters: RecallSearchFilters = useMemo(
    () => ({
      query,
      manufacturer: manufacturer !== 'all' ? manufacturer : undefined,
      market,
      category,
      severity,
      modelYear: modelYear !== 'all' ? Number(modelYear) : undefined,
    }),
    [query, manufacturer, market, category, severity, modelYear]
  );

  const results = useMemo(() => searchRecalls(filters), [filters]);

  const handleReset = () => {
    setQuery('');
    setManufacturer('all');
    setMarket('all');
    setCategory('all');
    setSeverity('all');
    setModelYear('all');
  };

  const hasActiveFilters =
    query.trim() !== '' ||
    manufacturer !== 'all' ||
    market !== 'all' ||
    category !== 'all' ||
    severity !== 'all' ||
    modelYear !== 'all';

  return (
    <div
      style={{
        paddingTop: 'calc(var(--header-height) + 2rem)',
        paddingBottom: '6rem',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div className="container">
        {/* Header */}
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
            <ShieldAlert size={15} />
            <span>AUTHORITATIVE SAFETY DATABASE</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#ffffff', fontWeight: 900, marginBottom: '0.75rem' }}>
            Official Automotive Recall & Defect Registry
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '720px', lineHeight: 1.6 }}>
            Query authoritative regulatory recalls, free manufacturer dealer remedies, and technical service
            campaigns published by MoRTH (India) and NHTSA (United States).
          </p>
        </div>

        {/* Filter Controls Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            padding: '1.75rem',
            marginBottom: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Search Input Bar */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              color="var(--accent-cyan)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by defect keyword, model name, or official campaign ID (e.g., 24V-473, brake, ICCU)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.85rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-medium)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '0.95rem',
              }}
            />
          </div>

          {/* Filter Dropdowns Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* Manufacturer */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Manufacturer
              </label>
              <select
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: '#0c1017',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">All Manufacturers</option>
                <option value="Porsche">Porsche</option>
                <option value="Tata Motors">Tata Motors</option>
                <option value="Hyundai">Hyundai</option>
                <option value="Tesla">Tesla</option>
                <option value="Mahindra">Mahindra</option>
                <option value="Maruti Suzuki">Maruti Suzuki</option>
                <option value="BMW">BMW</option>
                <option value="Toyota">Toyota</option>
                <option value="Mercedes-Benz">Mercedes-Benz</option>
              </select>
            </div>

            {/* Geographic Market */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Market / Jurisdiction
              </label>
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: '#0c1017',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">All Markets</option>
                <option value="India">India (MoRTH / SIAM)</option>
                <option value="USA">USA (NHTSA)</option>
                <option value="Global">Global / Worldwide</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Notice Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: '#0c1017',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">All Categories</option>
                <option value="recall">Official Safety Recall</option>
                <option value="service_campaign">Service Campaign</option>
                <option value="safety_advisory">Safety Advisory</option>
              </select>
            </div>

            {/* Hazard Severity */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: '#0c1017',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical (Immediate Stop)</option>
                <option value="high">High Risk</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low (Precautionary)</option>
              </select>
            </div>

            {/* Model Year */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Affected Model Year
              </label>
              <select
                value={modelYear}
                onChange={(e) => setModelYear(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: '#0c1017',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">All Model Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>
          </div>

          {/* Reset Filters Bar */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                <RotateCcw size={12} />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Results Metadata */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{results.length}</strong> matching official recall record(s)
          </div>
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Data refreshed continuously · Free legal dealer remedies
          </div>
        </div>

        {/* Results Stream */}
        {results.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {results.map((recall) => (
              <div
                key={recall.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'border-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        backgroundColor:
                          recall.severity === 'critical'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : recall.severity === 'high'
                            ? 'rgba(239, 68, 68, 0.12)'
                            : 'rgba(245, 158, 11, 0.12)',
                        color: recall.severity === 'critical' ? '#ef4444' : recall.severity === 'high' ? '#f87171' : '#f59e0b',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {recall.severity} SEVERITY
                    </span>

                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(0, 240, 255, 0.08)',
                        color: 'var(--accent-cyan)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                      }}
                    >
                      {recall.sourceAuthority} · {recall.market}
                    </span>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Campaign: <strong>{recall.officialCampaignNumber}</strong>
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Published: {new Date(recall.publishedDate).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h2 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.4rem' }}>
                    {recall.title}
                  </h2>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    <strong>Affected Models:</strong> {recall.make} {recall.model} ({recall.modelYears.join(', ')})
                    {recall.affectedVariants && recall.affectedVariants.length > 0 && (
                      <span> · Variants: {recall.affectedVariants.join(', ')}</span>
                    )}
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {recall.defectSummary}
                  </p>
                </div>

                {/* Consequence & Remedy Box */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '1rem',
                    fontSize: '0.82rem',
                  }}
                >
                  <div>
                    <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '0.25rem' }}>
                      Potential Safety Consequence:
                    </div>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {recall.safetyRiskConsequence}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '0.25rem' }}>
                      Documented Remedy:
                    </div>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {recall.remedyDescription}
                    </div>
                  </div>
                </div>

                {/* Action Links */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {recall.isFreeDealerRepair && (
                      <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Free authorized dealer repair legally mandated</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <a
                      href={recall.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      <span>Official Notice</span>
                      <ExternalLink size={13} />
                    </a>

                    <Link
                      to={`/safety/recalls/${recall.slug}`}
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                    >
                      <span>Inspect Dossier</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
            }}
          >
            <ShieldAlert size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem' }}>
              No Recalls Match the Current Filter Criteria
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
              Try broadening your keyword search or resetting manufacturer and year constraints.
              Remember that absence of a result in this dataset does not guarantee a vehicle is recall-free.
            </p>
            <button type="button" onClick={handleReset} className="btn btn-secondary">
              <RotateCcw size={14} />
              <span>Clear Filter Constraints</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
