import React, { useState } from 'react';
import { CarImage } from './CarImage';
import { Armchair, Cpu, Sparkles, Volume2 } from 'lucide-react';

export const InteriorSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const cabinFeatures = [
    {
      id: 'cockpit',
      title: 'Digital Curved Cockpit',
      subtitle: 'OLED Ergonomics & Holographic HUD',
      icon: Cpu,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80',
      description:
        'A driver-centric curved instrument display with anti-reflective glass and zero-layer UI logic. High-definition telemetry is projected into the driver’s direct line of sight via augmented head-up display optics.',
      specs: [
        { label: 'Display Resolution', value: '4K Ultra-Curved' },
        { label: 'Optics Technology', value: 'Polarized Anti-Glare' },
        { label: 'Response Latency', value: '< 8 milliseconds' },
      ],
    },
    {
      id: 'seating',
      title: '18-Way Adaptive Seating',
      subtitle: 'Motorsport Carbon Shell & Climate Active',
      icon: Armchair,
      image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80',
      description:
        'Sculpted carbon-fiber reinforced polymer seat frames clad in ventilated semi-aniline Nappa leather. Pneumatic side bolsters automatically inflate during cornering to counteract lateral G-forces.',
      specs: [
        { label: 'Adjustment Points', value: '18-Way Electric Memory' },
        { label: 'Lateral G Support', value: 'Active Pneumatic Inflation' },
        { label: 'Thermal Logic', value: 'Rapid Heating & Multi-Zone Airflow' },
      ],
    },
    {
      id: 'materials',
      title: 'Bespoke Craftsmanship',
      subtitle: 'Matte Carbon, Alcantara & Cold-Touch Titanium',
      icon: Sparkles,
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1400&q=80',
      description:
        'Each cabin surfaces undergoes rigorous tactile validation. Knurled solid-aluminum rotary dials, exposed structural carbon weave, and hand-stitched steering wheels create an uncompromising tactile connection.',
      specs: [
        { label: 'Inlay Materials', value: 'Open-Pore Carbon & Brushed Silver' },
        { label: 'Upholstery Standard', value: 'Grade-A Sustainable Leather' },
        { label: 'Assembly Verification', value: 'Hand-Inspected Tolerance' },
      ],
    },
    {
      id: 'acoustic',
      title: 'Acoustic Architecture',
      subtitle: '3D Studio Sound & Double-Glazed Isolation',
      icon: Volume2,
      image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1400&q=80',
      description:
        'Acoustically insulated acoustic glass with specialized acoustic films reduces wind and road frequency resonance to whisper levels, providing an acoustically pure stage for high-end multi-speaker sound engines.',
      specs: [
        { label: 'Glass Technology', value: 'Multi-Layer Thermally Insulated' },
        { label: 'Speaker Array', value: '21 High-End Neodymium Transducers' },
        { label: 'Acoustic Processing', value: 'Active Road Noise Cancellation' },
      ],
    },
  ];

  const current = cabinFeatures[activeTab];

  return (
    <section
      id="interior"
      className="section"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-eyebrow">Cockpit & Sanctuaries</span>
          <h2 className="section-title">Interior & Comfort Architecture</h2>
          <p className="section-subtitle">
            Beyond raw horsepower lies tactile serenity. Experience cabins engineered
            where digital ergonomics converge with motorsport ergonomics and bespoke craftsmanship.
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {cabinFeatures.map((feat, index) => {
            const isActive = activeTab === index;
            const Icon = feat.icon;
            return (
              <button
                key={feat.id}
                onClick={() => setActiveTab(index)}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '8px',
                  backgroundColor: isActive
                    ? 'rgba(22, 28, 40, 0.95)'
                    : 'rgba(14, 18, 26, 0.5)',
                  border: isActive
                    ? '1px solid var(--accent-cyan)'
                    : '1px solid var(--border-subtle)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? '0 8px 24px rgba(0, 240, 255, 0.15)' : 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <Icon size={18} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    }}
                  >
                    {feat.title}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    display: 'block',
                  }}
                >
                  {feat.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Feature Showcase Stage */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            backgroundColor: '#07090d',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* High-Resolution Cabin Image */}
          <div style={{ position: 'relative', minHeight: '380px' }}>
            <CarImage
              key={current.id}
              src={current.image}
              alt={current.title}
              manufacturer="CABIN ARCHITECTURE"
              style={{ width: '100%', height: '100%', minHeight: '380px' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, transparent 60%, rgba(7, 9, 13, 0.85) 100%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Feature Deep Dive Info */}
          <div
            style={{
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div className="badge badge-cyan" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>
              CABIN DETAIL INSPECTION
            </div>

            <h3
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '0.5rem',
              }}
            >
              {current.title}
            </h3>

            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--accent-cyan)',
                display: 'block',
                marginBottom: '1.25rem',
              }}
            >
              {current.subtitle}
            </span>

            <p
              style={{
                color: '#cbd5e1',
                fontSize: '1rem',
                lineHeight: 1.7,
                marginBottom: '2rem',
              }}
            >
              {current.description}
            </p>

            {/* Feature Spec Highlights */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                padding: '1.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {current.specs.map((item, i) => (
                <div key={i}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
