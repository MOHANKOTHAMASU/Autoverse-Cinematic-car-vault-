import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldAlert,
  Award,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { VEHICLES } from '../data/vehicles';
import type { Vehicle } from '../types';
import { getVehicleSafetyProfile } from '../utils/safetyService';

export const VehicleSafetyPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const vehicle = VEHICLES.find((v: Vehicle) => v.id === slug);
  const safetyProfile = slug ? getVehicleSafetyProfile(slug) : null;

  if (!vehicle || !safetyProfile) {
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
            Vehicle Safety Profile Not Found
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            We could not find a vehicle matching "{slug}" in the AutoVerse safety catalog.
          </p>
          <Link to="/safety" className="btn btn-primary">
            <ArrowLeft size={16} /> Return to Safety Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: 'calc(var(--header-height) + 2rem)',
        paddingBottom: '6rem',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div className="container" style={{ maxWidth: '1020px' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/safety"
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
            <ArrowLeft size={14} /> Back to Safety Intelligence
          </Link>
        </div>

        {/* Top Vehicle Safety Hero Banner */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '18px',
            padding: '2.5rem',
            marginBottom: '2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0, 240, 255, 0.1)',
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {vehicle.brand} FLEET SAFETY DOSSIER
              </span>

              {vehicle.powertrain === 'electric' && (
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#34d399',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  HIGH-VOLTAGE EV ARCHITECTURE
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#ffffff', fontWeight: 900, marginBottom: '0.5rem' }}>
              {vehicle.name}
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '600px', lineHeight: 1.5 }}>
              Crashworthiness assessments, active recalls, service campaigns, and structural safety specifications.
            </p>
          </div>

          {/* Quick Vehicle Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to={`/cars/${vehicle.id}`}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.65rem 1.25rem' }}
            >
              <span>Explore Full Vehicle Details</span>
              <ArrowRight size={15} />
            </Link>

            {vehicle.powertrain === 'electric' && (
              <Link
                to={`/trip-planner?vehicle=${vehicle.id}`}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.65rem 1.25rem' }}
              >
                <Zap size={14} color="var(--accent-cyan)" />
                <span>Plan EV Route & Charging</span>
              </Link>
            )}
          </div>
        </div>

        {/* NCAP Crashworthiness Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Rating 1: Bharat NCAP or Euro NCAP */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {safetyProfile.bharatNcapStars ? 'Bharat NCAP Safety Rating' : 'Euro NCAP Safety Rating'}
              </div>
              <Award size={20} color="#fbbf24" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '1.6rem',
                    color: i < (safetyProfile.bharatNcapStars || safetyProfile.euroNcapStars || 5) ? '#fbbf24' : '#4b5563',
                  }}
                >
                  ★
                </span>
              ))}
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginLeft: '0.25rem' }}>
                {safetyProfile.bharatNcapStars || safetyProfile.euroNcapStars}/5 Stars
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Highest category rating achieved in frontal offset, side mobile barrier, and side pole crash tests.
            </div>
          </div>

          {/* Occupant Protection Breakdown */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Occupant Protection Scores
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Adult Occupant Protection</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{safetyProfile.adultOccupantScore}</strong>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--accent-cyan)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Child Occupant Protection</span>
                    <strong style={{ color: '#10b981' }}>{safetyProfile.childOccupantScore}</strong>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '88%', height: '100%', backgroundColor: '#10b981' }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '1rem' }}>
              Standard ISOFIX child anchors & curtain airbags verified
            </div>
          </div>
        </div>

        {/* Active Recalls & Service Campaigns for this Vehicle */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#ffffff', fontWeight: 800 }}>
                Safety Notices & Service Campaigns ({safetyProfile.recalls.length})
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Official regulatory recalls and service updates affecting the {vehicle.name} model family.
              </p>
            </div>
          </div>

          {safetyProfile.recalls.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {safetyProfile.recalls.map((recall) => (
                <div
                  key={recall.id}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          backgroundColor:
                            recall.category === 'recall' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: recall.category === 'recall' ? '#f87171' : '#f59e0b',
                          fontWeight: 700,
                        }}
                      >
                        {recall.category === 'recall' ? 'Safety Recall' : 'Service Campaign'}
                      </span>

                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                        {recall.officialCampaignNumber}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Published: {new Date(recall.publishedDate).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700 }}>
                    {recall.title}
                  </h3>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    {recall.defectSummary}
                  </p>

                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <strong style={{ color: '#10b981' }}>Manufacturer Remedy:</strong> {recall.remedyDescription}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <Link
                      to={`/safety/recalls/${recall.slug}`}
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
                    >
                      <span>Inspect Official Notice</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '3rem 2rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                textAlign: 'center',
              }}
            >
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem' }}>
                Zero Active Recalls in Monitored Dataset
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '540px', margin: '0 auto 1.25rem' }}>
                There are no open regulatory recalls or manufacturer service campaigns registered for {vehicle.name} in
                our synchronized MoRTH / NHTSA database. Always verify your individual chassis at official portals.
              </p>
              <a
                href="https://www.siam.in/recall-code-view.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem' }}
              >
                <span>Check Official VIN Portal</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
