import React from 'react';
import { LAUNCHES } from '../data/launches';
import { CarImage } from './CarImage';
import { ExternalLink, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LaunchesPreview: React.FC = () => {
  return (
    <section id="launches" className="section" style={{ position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <div>
            <span className="section-eyebrow">Official Dispatches</span>
            <h2 className="section-title">Latest Automotive Launches</h2>
            <p className="section-subtitle">
              Sourced directly from manufacturer global press bureaus. Verified dates,
              certified homologation milestones, and official delivery windows.
            </p>
          </div>

          <Link to="/launches" className="btn btn-secondary">
            View All Launches Timeline
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Launches Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {LAUNCHES.map((launch) => (
            <article
              key={launch.id}
              className="card-glass"
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: '210px',
                  overflow: 'hidden',
                  backgroundColor: '#0a0d14',
                }}
              >
                <CarImage
                  src={launch.image}
                  alt={launch.vehicleName}
                  manufacturer={launch.manufacturer}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '0.85rem',
                    left: '0.85rem',
                    right: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 2,
                  }}
                >
                  <span className="badge badge-cyan">{launch.status}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      color: 'var(--text-secondary)',
                      backgroundColor: 'rgba(7, 9, 13, 0.75)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                    }}
                  >
                    {launch.manufacturer.toUpperCase()}
                  </span>
                </div>
              </div>

              <div
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--accent-cyan)',
                    marginBottom: '0.5rem',
                  }}
                >
                  <Calendar size={13} />
                  <span>PREMIERE: {launch.announcementDate}</span>
                </div>

                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    marginBottom: '0.75rem',
                    lineHeight: 1.3,
                  }}
                >
                  {launch.vehicleName}
                </h3>

                <p
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem',
                  }}
                >
                  {launch.summary}
                </p>

                {/* Sourcing Attribution Box */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={13} color="#34d399" />
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {launch.sourceName}
                    </span>
                  </div>

                  <a
                    href={launch.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 600,
                      color: 'var(--accent-cyan)',
                    }}
                    aria-label={`Official press source for ${launch.vehicleName}`}
                  >
                    <span>Press Room</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
