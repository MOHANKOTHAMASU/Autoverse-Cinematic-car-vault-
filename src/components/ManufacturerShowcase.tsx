import React, { useState } from 'react';
import { MANUFACTURERS } from '../data/manufacturers';
import type { Manufacturer } from '../types';
import { ArrowUpRight, Award, Compass, Zap, CheckCircle2 } from 'lucide-react';

import { Link } from 'react-router-dom';

interface ManufacturerShowcaseProps {
  onSelectManufacturer?: (manufacturerId: string | null) => void;
  selectedManufacturerId?: string | null;
}

export const ManufacturerShowcase: React.FC<ManufacturerShowcaseProps> = ({
  onSelectManufacturer,
  selectedManufacturerId,
}) => {
  const [activeBrand, setActiveBrand] = useState<Manufacturer>(
    MANUFACTURERS.find((m) => m.id === selectedManufacturerId) || MANUFACTURERS[0]
  );

  const handleBrandClick = (brand: Manufacturer) => {
    setActiveBrand(brand);
    if (onSelectManufacturer) {
      if (selectedManufacturerId === brand.id) {
        onSelectManufacturer(null); // toggle off
      } else {
        onSelectManufacturer(brand.id);
      }
    }
  };

  return (
    <section
      id="manufacturers"
      className="section"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
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
            <span className="section-eyebrow">The Marques</span>
            <h2 className="section-title">Manufacturer Engineering Showcase</h2>
            <p className="section-subtitle">
              Explore the heritage, powertrain philosophies, and manufacturing pedigree
              of the world's most formidable automotive houses.
            </p>
          </div>

          <Link to="/manufacturers" className="btn btn-secondary">
            <span>Explore All Marques Dossiers</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* 5-Brand Interactive Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          {MANUFACTURERS.map((brand) => {
            const isSelected = activeBrand.id === brand.id;
            const isFiltered = selectedManufacturerId === brand.id;

            return (
              <div
                key={brand.id}
                onClick={() => handleBrandClick(brand)}
                style={{
                  padding: '1.75rem 1.5rem',
                  borderRadius: '8px',
                  backgroundColor: isSelected
                    ? 'rgba(20, 26, 38, 0.95)'
                    : 'rgba(14, 18, 26, 0.6)',
                  border: isSelected
                    ? `1px solid ${brand.brandColor}`
                    : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.3s var(--ease-cinematic)',
                  boxShadow: isSelected
                    ? `0 12px 30px rgba(${brand.accentRgb}, 0.25)`
                    : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBrandClick(brand);
                  }
                }}
                aria-label={`Select ${brand.name} specifications`}
              >
                {/* Brand Color Top Indicator Accent */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    backgroundColor: brand.brandColor,
                    opacity: isSelected ? 1 : 0.4,
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      letterSpacing: '0.15em',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    EST. {brand.founded}
                  </span>

                  {isFiltered && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent-cyan)',
                      }}
                    >
                      <CheckCircle2 size={12} />
                      FILTERED
                    </span>
                  )}
                </div>

                {/* Styled Brand Editorial Wordmark */}
                <h3
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#ffffff',
                    marginBottom: '0.4rem',
                  }}
                >
                  {brand.name}
                </h3>

                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: '1.25rem',
                  }}
                >
                  {brand.country} // {brand.headquarters.split(',')[0]}
                </p>

                <div
                  style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: isSelected ? brand.brandColor : 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {isSelected ? 'Viewing Dossier' : 'Inspect Marque'}
                  </span>
                  <ArrowUpRight
                    size={16}
                    color={isSelected ? brand.brandColor : 'var(--text-muted)'}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Brand Engineering Dossier Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 22, 33, 0.95) 0%, rgba(10, 14, 22, 0.95) 100%)',
            border: `1px solid rgba(${activeBrand.accentRgb}, 0.35)`,
            borderRadius: '10px',
            padding: '2.25rem 2.5rem',
            boxShadow: `0 20px 45px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.15em',
                color: activeBrand.brandColor,
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              <Award size={14} />
              ENGINEERING PHILOSOPHY
            </div>

            <h4
              style={{
                fontSize: '1.85rem',
                color: '#ffffff',
                fontWeight: 800,
                marginBottom: '0.75rem',
              }}
            >
              "{activeBrand.tagline}"
            </h4>

            <p
              style={{
                color: '#cbd5e1',
                fontSize: '1rem',
                lineHeight: 1.7,
                marginBottom: '1.5rem',
              }}
            >
              {activeBrand.description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div className="badge badge-cyan">
                <Zap size={12} />
                {activeBrand.flagshipFocus}
              </div>
              <div className="badge">
                <Compass size={12} />
                Global HQ: {activeBrand.headquarters}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '1.5rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(7, 9, 13, 0.7)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.15em',
                display: 'block',
                marginBottom: '0.85rem',
                textTransform: 'uppercase',
              }}
            >
              Catalog Action
            </span>

            <p
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.25rem',
              }}
            >
              Show all curated {activeBrand.name} performance vehicles in the discovery
              catalog below.
            </p>

            <button
              onClick={() => {
                if (onSelectManufacturer) {
                  onSelectManufacturer(
                    selectedManufacturerId === activeBrand.id ? null : activeBrand.id
                  );
                }
                const featuredEl = document.getElementById('featured');
                if (featuredEl) featuredEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn btn-secondary"
              style={{
                width: '100%',
                justifyContent: 'center',
                borderColor: `rgba(${activeBrand.accentRgb}, 0.5)`,
              }}
            >
              {selectedManufacturerId === activeBrand.id
                ? 'Clear Brand Filter'
                : `Filter Vehicles by ${activeBrand.name}`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
