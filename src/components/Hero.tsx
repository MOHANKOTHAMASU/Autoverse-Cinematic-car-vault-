import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Film, Gauge, Zap, Shield, Sparkles } from 'lucide-react';
import { VEHICLES } from '../data/vehicles';
import { CarImage } from './CarImage';

interface HeroProps {
  onExploreClick?: () => void;
  onCinemaClick?: () => void;
  onSelectCar?: (carId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  onCinemaClick,
  onSelectCar,
}) => {
  const navigate = useNavigate();
  // Hero flagship options (Porsche, Tesla, Mercedes-AMG)
  const heroCars = [VEHICLES[0], VEHICLES[1], VEHICLES[3]];
  const [activeCarIndex, setActiveCarIndex] = useState(0);
  const currentCar = heroCars[activeCarIndex] || heroCars[0];

  const handleCarSelect = (index: number) => {
    setActiveCarIndex(index);
    if (onSelectCar) {
      onSelectCar(heroCars[index].id);
    }
  };

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        paddingTop: 'calc(var(--header-height) + 2rem)',
        paddingBottom: '3.5rem',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #07090d 0%, #0c1017 100%)',
      }}
    >
      {/* Background Cinematic Visual with Smooth Transition */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      >
        <CarImage
          key={currentCar.id}
          src={currentCar.heroImage}
          alt={`${currentCar.manufacturerName} ${currentCar.name}`}
          manufacturer={currentCar.manufacturerName}
          priority={true}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
          }}
        />

        {/* Cinematic Vignette, Gradient Overlays & Horizon Shadow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(7, 9, 13, 0.75) 0%, rgba(7, 9, 13, 0.4) 40%, rgba(7, 9, 13, 0.95) 100%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 75% 45%, rgba(0, 240, 255, 0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        {/* Ambient Grid Floor Perspective */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '240px',
            background:
              'linear-gradient(to top, rgba(7, 9, 13, 1) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Editorial Eyebrow & Badges */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <div className="badge badge-cyan">
            <Sparkles size={12} />
            STAGE 1 — PRODUCTION FOUNDATION
          </div>
          <div className="badge badge-verified">
            <Shield size={12} />
            VERIFIED AUTOMOTIVE SPECIFICATIONS
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
            }}
          >
            FLAGSHIP SHOWCASE // {currentCar.year} {currentCar.manufacturerName.toUpperCase()}
          </span>
        </div>

        {/* Hero Title & Editorial Headline */}
        <div style={{ maxWidth: '920px' }}>
          <h1
            style={{
              fontSize: 'clamp(2.75rem, 6.5vw, 5.25rem)',
              lineHeight: 1.02,
              letterSpacing: '-0.04em',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: '#ffffff',
              marginBottom: '1.5rem',
              textShadow: '0 4px 24px rgba(0, 0, 0, 0.7)',
            }}
          >
            The Future <br />
            <span
              style={{
                color: 'transparent',
                WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.85)',
              }}
            >
              Is
            </span>{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #ffffff 30%, var(--accent-cyan) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Driven.
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.8vw, 1.35rem)',
              color: '#cbd5e1',
              lineHeight: 1.6,
              maxWidth: '680px',
              marginBottom: '2.5rem',
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.8)',
            }}
          >
            Discover the machines defining modern automotive supremacy. From blistering
            sub-2-second electric powertrains to handcrafted twin-turbo icons, experience
            next-generation engineering verified to manufacturer precision.
          </p>

          {/* Action CTAs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              marginBottom: '3.5rem',
            }}
          >
            <button
              onClick={() => {
                if (onExploreClick) onExploreClick();
                else handleScrollToSection('featured');
              }}
              className="btn btn-primary"
              aria-label="Explore featured cars"
            >
              Explore Cars
              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => {
                if (onCinemaClick) onCinemaClick();
                else handleScrollToSection('cinema');
              }}
              className="btn btn-secondary"
              aria-label="Enter Road Cinema"
            >
              <Film size={17} color="var(--accent-cyan)" />
              Enter Road Cinema
            </button>

            <button
              onClick={() => navigate('/car-finder')}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                borderColor: 'rgba(6, 182, 212, 0.4)',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                color: 'var(--accent-cyan)',
              }}
              aria-label="Launch Smart Car Finder"
            >
              <Sparkles size={16} />
              Smart Car Finder
            </button>

            {/* Quick Car Switcher Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginLeft: 'auto',
                background: 'rgba(12, 16, 23, 0.85)',
                padding: '0.35rem',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  padding: '0 0.5rem',
                  letterSpacing: '0.08em',
                }}
              >
                FLAGSHIP:
              </span>
              {heroCars.map((car, idx) => (
                <button
                  key={car.id}
                  onClick={() => handleCarSelect(idx)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: activeCarIndex === idx ? '#07090d' : '#94a3b8',
                    backgroundColor:
                      activeCarIndex === idx ? 'var(--accent-cyan)' : 'transparent',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {car.manufacturerName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Telemetry HUD Strip */}
        <div
          style={{
            background: 'rgba(14, 19, 29, 0.82)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '1.25rem 1.75rem',
            backdropFilter: 'blur(16px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '0.25rem',
              }}
            >
              <Gauge size={14} />
              0–60 MPH ACCELERATION
            </div>
            <div
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                color: '#ffffff',
                lineHeight: 1,
              }}
            >
              {currentCar.specs.acceleration0to60}
              <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>
                seconds
              </span>
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '0.25rem',
              }}
            >
              <Zap size={14} />
              HORSEPOWER (PEAK)
            </div>
            <div
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                color: '#ffffff',
                lineHeight: 1,
              }}
            >
              {currentCar.specs.horsepower.toLocaleString()}
              <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>
                HP
              </span>
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '0.25rem',
              }}
            >
              <Gauge size={14} />
              TOP TRACK SPEED
            </div>
            <div
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                color: '#ffffff',
                lineHeight: 1,
              }}
            >
              {currentCar.specs.topSpeedMph}
              <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>
                MPH
              </span>
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '0.25rem',
              }}
            >
              <Shield size={14} />
              POWERTRAIN ARCHITECTURE
            </div>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.4,
              }}
              title={currentCar.specs.engineType}
            >
              {currentCar.specs.voltageArchitecture || currentCar.specs.engineType}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
