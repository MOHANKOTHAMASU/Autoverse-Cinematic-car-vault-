import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldAlert,
  ExternalLink,
  Phone,
  AlertTriangle,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { OFFICIAL_RECALLS_DATABASE } from '../data/officialRecalls';
import { VEHICLES } from '../data/vehicles';
import type { Vehicle } from '../types';

export const RecallDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const recall = OFFICIAL_RECALLS_DATABASE.find((r) => r.slug === slug || r.id === slug);

  const [testYear, setTestYear] = useState<number>(2023);

  if (!recall) {
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
        <div className="container">
          <ShieldAlert size={48} color="#f87171" style={{ margin: '0 auto 1.5rem' }} />
          <h1 style={{ fontSize: '2rem', color: '#ffffff', fontWeight: 800, marginBottom: '1rem' }}>
            Official Recall Dossier Not Found
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            The requested recall identifier or URL slug "{slug}" was not located in the active safety dataset.
          </p>
          <Link to="/safety/recalls" className="btn btn-primary">
            <ArrowLeft size={16} /> Return to Recall Database
          </Link>
        </div>
      </div>
    );
  }

  const primaryVehicleSlug = recall.affectedVehicleSlugs[0];
  const primaryVehicle = VEHICLES.find((v: Vehicle) => v.id === primaryVehicleSlug);

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
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/safety/recalls"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} /> Back to Safety Database
          </Link>
        </div>

        {/* Top Campaign Banner */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '18px',
            padding: '2.5rem',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Severity bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor:
                recall.severity === 'critical' ? '#ef4444' : recall.severity === 'high' ? '#f87171' : '#f59e0b',
            }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor:
                    recall.category === 'recall' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: recall.category === 'recall' ? '#f87171' : '#f59e0b',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {recall.category === 'recall' ? 'Official Regulatory Recall' : 'Manufacturer Service Campaign'}
              </span>

              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0, 240, 255, 0.1)',
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {recall.sourceAuthority} · {recall.market}
              </span>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Campaign ID: <strong style={{ color: '#ffffff' }}>{recall.officialCampaignNumber}</strong>
            </div>
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: '#ffffff', fontWeight: 900, lineHeight: 1.2, marginBottom: '1rem' }}>
            {recall.title}
          </h1>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1.25rem',
            }}
          >
            <div>
              <strong>Manufacturer:</strong> {recall.manufacturer}
            </div>
            <div>
              <strong>Affected Models:</strong> {recall.make} {recall.model} ({recall.modelYears.join(', ')})
            </div>
            <div>
              <strong>Estimated Units:</strong> {recall.estimatedUnitsAffected.toLocaleString()}
            </div>
            <div>
              <strong>Official Published:</strong> {new Date(recall.publishedDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* 2-Column Details: Technical Dossier + Owner Action Plan */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}
        >
          {/* Technical Defect & Hazard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Defect Description */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <ShieldAlert size={18} color="#f87171" />
                <h2 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700 }}>
                  Reported Defect or Safety Issue
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                {recall.defectSummary}
              </p>
            </div>

            {/* Potential Hazard Consequence */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <AlertTriangle size={18} color="#f59e0b" />
                <h2 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700 }}>
                  Safety Risk & Potential Consequences
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                {recall.safetyRiskConsequence}
              </p>
            </div>

            {/* Documented Remedy */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Wrench size={18} color="#10b981" />
                <h2 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700 }}>
                  Authorized Manufacturer Remedy
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                {recall.remedyDescription}
              </p>

              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontSize: '0.82rem',
                  color: '#34d399',
                }}
              >
                <CheckCircle2 size={16} />
                <span>
                  <strong>Free of charge:</strong> Under regulatory laws, all recall repairs and inspections are
                  mandated to be completed by authorized dealerships at zero cost to the owner.
                </span>
              </div>
            </div>
          </div>

          {/* Action Center & Hotline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Direct Manufacturer Contacts & External Portal */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700, marginBottom: '1rem' }}>
                Official Communications & Links
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recall.manufacturerHotline && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <Phone size={18} color="var(--accent-cyan)" />
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        MANUFACTURER CUSTOMER HOTLINE
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 600 }}>
                        {recall.manufacturerHotline}
                      </div>
                    </div>
                  </div>
                )}

                <a
                  href={recall.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ justifyContent: 'center', fontSize: '0.85rem' }}
                >
                  <span>Open Official {recall.sourceAuthority} Record</span>
                  <ExternalLink size={15} />
                </a>

                {recall.officialCheckUrl && (
                  <a
                    href={recall.officialCheckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ justifyContent: 'center', fontSize: '0.85rem' }}
                  >
                    <span>Check VIN on {recall.make} Portal</span>
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </div>

            {/* Interactive Model Year Compatibility Test */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.4rem' }}>
                Is Your Vehicle Affected?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                Verify if your vehicle manufacturing year overlaps with this recall campaign.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                    Vehicle Model Year
                  </label>
                  <select
                    value={testYear}
                    onChange={(e) => setTestYear(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#0c1017',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                    }}
                  >
                    {[2024, 2023, 2022, 2021, 2020, 2019].map((y) => (
                      <option key={y} value={y} style={{ backgroundColor: '#0c1017' }}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Compatibility Outcome */}
                {recall.modelYears.includes(testYear) ? (
                  <div
                    style={{
                      padding: '0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#f87171',
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>⚠ Model Year {testYear} is included in this notice.</strong>
                    <div style={{ marginTop: '0.35rem', color: 'var(--text-secondary)' }}>
                      Contact your dealership with your 17-digit VIN to schedule your free service update.
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#34d399',
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>✓ Model Year {testYear} is outside this recall's scope.</strong>
                    <div style={{ marginTop: '0.35rem', color: 'var(--text-secondary)' }}>
                      Published years: {recall.modelYears.join(', ')}.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Associated Catalog Vehicle Shortcut */}
            {primaryVehicle && (
              <div
                style={{
                  backgroundColor: 'rgba(0, 240, 255, 0.04)',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                    AutoVerse Fleet Model
                  </div>
                  <div style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 700 }}>
                    {primaryVehicle.name}
                  </div>
                </div>

                <Link
                  to={`/safety/vehicle/${primaryVehicle.id}`}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                >
                  <span>Safety Profile</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
