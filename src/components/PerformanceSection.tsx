import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VEHICLES } from '../data/vehicles';
import { Gauge, Zap, Wind, BatteryCharging, ArrowLeftRight, CheckCircle2, ArrowRight } from 'lucide-react';

export const PerformanceSection: React.FC = () => {
  // Benchmark comparison selector
  const [carAId, setCarAId] = useState<string>(VEHICLES[0].id); // Porsche Taycan Turbo S
  const [carBId, setCarBId] = useState<string>(VEHICLES[1].id); // Tesla Model S Plaid

  const carA = VEHICLES.find((v) => v.id === carAId) || VEHICLES[0];
  const carB = VEHICLES.find((v) => v.id === carBId) || VEHICLES[1];

  // Helper percentages for benchmark bars
  const maxHp = 1100;
  const maxSpeed = 220;
  const minAccel = 1.8; // best
  const maxAccel = 4.5;

  const getAccelPercent = (val: number) => {
    // Inverted: lower seconds = higher bar
    return Math.max(10, Math.min(100, ((maxAccel - val) / (maxAccel - minAccel)) * 100));
  };

  const getHpPercent = (val: number) => {
    return Math.max(15, Math.min(100, (val / maxHp) * 100));
  };

  const getSpeedPercent = (val: number) => {
    return Math.max(20, Math.min(100, (val / maxSpeed) * 100));
  };

  return (
    <section
      id="performance"
      className="section"
      style={{
        backgroundColor: '#0a0d14',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-eyebrow">Physics & Engineering</span>
          <h2 className="section-title">The Performance Spectrum</h2>
          <p className="section-subtitle">
            Every metric benchmarked across AutoVerse is certified against official
            manufacturer homologation data. No marketing estimates. Verified units only.
          </p>
        </div>

        {/* 4 Pillars of Engineering Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            marginBottom: '4rem',
          }}
        >
          {/* Pillar 1: Acceleration */}
          <div
            className="card-glass"
            style={{
              padding: '2rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Gauge size={22} color="var(--accent-cyan)" />
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--accent-cyan)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
              }}
            >
              METRIC: SECONDS [s]
            </div>

            <h3 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '0.65rem' }}>
              Sub-3.0s Acceleration
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Instant torque deployment achieved via pulse inverters with silicon carbide
              semiconductors, dual-clutch launch programming, and torque vectoring all-wheel
              traction.
            </p>

            <div
              style={{
                marginTop: 'auto',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>BENCHMARK BEST</span>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>1.99s (Model S Plaid)</span>
            </div>
          </div>

          {/* Pillar 2: Power */}
          <div
            className="card-glass"
            style={{
              padding: '2rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Zap size={22} color="var(--accent-gold)" />
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--accent-gold)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
              }}
            >
              METRIC: HORSEPOWER [HP] / [kW]
            </div>

            <h3 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '0.65rem' }}>
              System Horsepower & kW
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              From bespoke 9,000 RPM naturally aspirated flat-six screamers to tri-motor
              carbon-sleeved electric architectures generating up to 1,020 peak brake horsepower.
            </p>

            <div
              style={{
                marginTop: 'auto',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>FLEET PEAK</span>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>1,020 HP (760 kW)</span>
            </div>
          </div>

          {/* Pillar 3: Top Speed */}
          <div
            className="card-glass"
            style={{
              padding: '2rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Wind size={22} color="var(--accent-red)" />
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--accent-red)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
              }}
            >
              METRIC: VELOCITY [MPH] / [km/h]
            </div>

            <h3 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '0.65rem' }}>
              Aerodynamic Top Speed
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Calculated balancing drag coefficients (Cd as low as 0.208) with high-downforce
              active rear wings, front air curtains, and underbody venturi aerodynamic tunnels.
            </p>

            <div
              style={{
                marginTop: 'auto',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>VERIFIED MAX</span>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>200 MPH (322 km/h)</span>
            </div>
          </div>

          {/* Pillar 4: Range & Architecture */}
          <div
            className="card-glass"
            style={{
              padding: '2rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <BatteryCharging size={22} color="#34d399" />
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: '#34d399',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
              }}
            >
              METRIC: RANGE [mi] / CHARGE [800V]
            </div>

            <h3 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '0.65rem' }}>
              800V Thermal Efficiency
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              High-voltage battery architecture delivering sustained charging rates up to
              320 kW. 10% to 80% replenishment in under 18 minutes under certified WLTP tests.
            </p>

            <div
              style={{
                marginTop: 'auto',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>MAX WLTP RANGE</span>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>367 mi (590 km)</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Benchmark Simulator Tool */}
        <div
          style={{
            backgroundColor: 'rgba(12, 16, 23, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '2.5rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1.5rem',
            }}
          >
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>
                <ArrowLeftRight size={12} />
                INTERACTIVE BENCHMARK SIMULATOR
              </span>
              <h3 style={{ fontSize: '1.75rem', color: '#ffffff', fontWeight: 800 }}>
                Direct Telemetry Head-to-Head
              </h3>
            </div>

            {/* Car Selectors */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: 'var(--accent-cyan)',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  Vehicle A:
                </label>
                <select
                  value={carAId}
                  onChange={(e) => setCarAId(e.target.value)}
                  style={{
                    backgroundColor: '#161c28',
                    color: '#ffffff',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    padding: '0.6rem 1rem',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                  aria-label="Select first vehicle for benchmark comparison"
                >
                  {VEHICLES.map((v) => (
                    <option key={`a-${v.id}`} value={v.id}>
                      {v.manufacturerName} {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginTop: '1.25rem',
                }}
              >
                VS
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: 'var(--accent-gold)',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  Vehicle B:
                </label>
                <select
                  value={carBId}
                  onChange={(e) => setCarBId(e.target.value)}
                  style={{
                    backgroundColor: '#161c28',
                    color: '#ffffff',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    padding: '0.6rem 1rem',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                  aria-label="Select second vehicle for benchmark comparison"
                >
                  {VEHICLES.map((v) => (
                    <option key={`b-${v.id}`} value={v.id}>
                      {v.manufacturerName} {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Benchmark Comparative Visual Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Metric 1: 0-60 MPH */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '0.6rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: '#cbd5e1',
                    fontWeight: 600,
                  }}
                >
                  0–60 MPH ACCELERATION (Lower is faster)
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    {carA.specs.acceleration0to60}s
                  </span>
                  <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>vs</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                    {carB.specs.acceleration0to60}s
                  </span>
                </div>
              </div>

              {/* Bar Car A */}
              <div
                style={{
                  height: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '6px',
                }}
              >
                <div
                  style={{
                    width: `${getAccelPercent(carA.specs.acceleration0to60)}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent-cyan)',
                    borderRadius: '3px',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>

              {/* Bar Car B */}
              <div
                style={{
                  height: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${getAccelPercent(carB.specs.acceleration0to60)}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent-gold)',
                    borderRadius: '3px',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
            </div>

            {/* Metric 2: Peak Horsepower */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '0.6rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: '#cbd5e1',
                    fontWeight: 600,
                  }}
                >
                  PEAK OUTPUT (Horsepower)
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    {carA.specs.horsepower} HP
                  </span>
                  <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>vs</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                    {carB.specs.horsepower} HP
                  </span>
                </div>
              </div>

              {/* Bar Car A */}
              <div
                style={{
                  height: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '6px',
                }}
              >
                <div
                  style={{
                    width: `${getHpPercent(carA.specs.horsepower)}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent-cyan)',
                    borderRadius: '3px',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>

              {/* Bar Car B */}
              <div
                style={{
                  height: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${getHpPercent(carB.specs.horsepower)}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent-gold)',
                    borderRadius: '3px',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
            </div>

            {/* Metric 3: Top Speed */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '0.6rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: '#cbd5e1',
                    fontWeight: 600,
                  }}
                >
                  TOP TRACK VELOCITY (Miles Per Hour)
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    {carA.specs.topSpeedMph} MPH
                  </span>
                  <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>vs</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                    {carB.specs.topSpeedMph} MPH
                  </span>
                </div>
              </div>

              {/* Bar Car A */}
              <div
                style={{
                  height: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '6px',
                }}
              >
                <div
                  style={{
                    width: `${getSpeedPercent(carA.specs.topSpeedMph)}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent-cyan)',
                    borderRadius: '3px',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>

              {/* Bar Car B */}
              <div
                style={{
                  height: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${getSpeedPercent(carB.specs.topSpeedMph)}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent-gold)',
                    borderRadius: '3px',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <CheckCircle2 size={15} color="#34d399" />
              <span>
                All benchmarks verified via manufacturer technical books. Units: Acceleration in seconds (s),
                Output in Horsepower (HP) & Kilowatts (kW), Top Speed in Miles Per Hour (MPH).
              </span>
            </div>

            <Link
              to={`/compare?cars=${carA.slug || carA.id},${carB.slug || carB.id}`}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.55rem 1rem' }}
            >
              <span>Open Full Side-by-Side Matrix</span>
              <ArrowRight size={14} color="var(--accent-cyan)" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
