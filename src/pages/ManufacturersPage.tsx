import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MANUFACTURERS } from '../data/manufacturers';
import { VEHICLES } from '../data/vehicles';
import { CarImage } from '../components/CarImage';
import { ArrowLeft, ArrowUpRight, Compass, ShieldCheck, Award } from 'lucide-react';

export const ManufacturersPage: React.FC = () => {
  const navigate = useNavigate();

  // Helper to count vehicles dynamically from dataset
  const getVehicleCount = (manufacturerId: string, name: string) => {
    return VEHICLES.filter(
      (v) =>
        v.manufacturerId === manufacturerId ||
        v.brand.toLowerCase() === name.toLowerCase() ||
        v.manufacturerName.toLowerCase() === name.toLowerCase()
    ).length;
  };

  const handleExploreManufacturer = (manufacturerId: string) => {
    navigate(`/discover?manufacturer=${manufacturerId}`);
  };

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
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <ArrowLeft size={14} /> Back to Homepage
          </Link>
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="badge badge-cyan">
              <Compass size={12} /> THE MARQUES OF AUTOVERSE
            </span>
            <span className="badge badge-verified">
              <ShieldCheck size={12} /> FACTUAL CORPORATE PROFILES
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              color: '#ffffff',
              letterSpacing: '-0.03em',
              fontWeight: 900,
              marginBottom: '0.85rem',
            }}
          >
            Manufacturer Explorer
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1.15rem',
              maxWidth: '780px',
              lineHeight: 1.65,
            }}
          >
            Explore the heritage, powertrain philosophies, and manufacturing pedigree
            of the world's most formidable automotive houses. Vehicle counts are dynamically
            derived from our verified production inventory.
          </p>
        </div>

        {/* Marques Cards Grid */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3rem',
          }}
        >
          {MANUFACTURERS.map((brand) => {
            const vehicleCount = getVehicleCount(brand.id, brand.name);
            const brandVehicles = VEHICLES.filter(
              (v) =>
                v.manufacturerId === brand.id ||
                v.brand.toLowerCase() === brand.name.toLowerCase()
            );

            return (
              <article
                key={brand.id}
                className="card-glass"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  borderColor: `rgba(${brand.accentRgb}, 0.25)`,
                }}
              >
                {/* Visual Preview */}
                <div style={{ position: 'relative', minHeight: '320px' }}>
                  <CarImage
                    src={brand.image || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80'}
                    alt={`${brand.name} Engineering`}
                    manufacturer={brand.name}
                    style={{ width: '100%', height: '100%' }}
                  />

                  {/* Gradient Shadow */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(180deg, rgba(7, 9, 13, 0.4) 0%, rgba(7, 9, 13, 0.85) 100%)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Top Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '1.25rem',
                      left: '1.25rem',
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(7, 9, 13, 0.85)',
                        border: `1px solid ${brand.brandColor}`,
                        color: brand.brandColor,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      FOUNDED {brand.founded} // {brand.country.toUpperCase()}
                    </span>
                  </div>

                  {/* Bottom Counter */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '1.25rem',
                      left: '1.25rem',
                      right: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      zIndex: 2,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.68rem',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          display: 'block',
                        }}
                      >
                        INVENTORY COUNT
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.6rem',
                          fontWeight: 800,
                          color: '#ffffff',
                        }}
                      >
                        {vehicleCount} Verified {vehicleCount === 1 ? 'Model' : 'Models'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Dossier */}
                <div
                  style={{
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: brand.brandColor,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <Award size={14} />
                    <span>PHILOSOPHY</span>
                  </div>

                  <h2
                    style={{
                      fontSize: '2.2rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      marginBottom: '0.35rem',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {brand.name}
                  </h2>

                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'var(--accent-cyan)',
                      marginBottom: '1.25rem',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    "{brand.tagline}"
                  </h3>

                  <p
                    style={{
                      color: '#cbd5e1',
                      fontSize: '1rem',
                      lineHeight: 1.7,
                      marginBottom: '1.75rem',
                    }}
                  >
                    {brand.description}
                  </p>

                  {/* Highlights / Models tags */}
                  <div style={{ marginBottom: '2rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        display: 'block',
                        marginBottom: '0.6rem',
                      }}
                    >
                      CURATED SIGNATURE MODELS IN FLEET:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {brandVehicles.map((v) => (
                        <Link
                          key={v.id}
                          to={`/cars/${v.slug || v.id}`}
                          style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-subtle)',
                            color: '#ffffff',
                            fontSize: '0.78rem',
                            fontFamily: 'var(--font-mono)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <span>{v.model} {v.variant}</span>
                          <ArrowUpRight size={11} color="var(--accent-cyan)" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '1.5rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      alignItems: 'center',
                    }}
                  >
                    <button
                      onClick={() => handleExploreManufacturer(brand.id)}
                      className="btn btn-primary"
                    >
                      <span>Explore All {brand.name} Vehicles</span>
                      <ArrowUpRight size={16} />
                    </button>

                    {brand.officialWebsite && (
                      <a
                        href={brand.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ fontSize: '0.85rem' }}
                      >
                        <span>Official Factory Portal</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};
