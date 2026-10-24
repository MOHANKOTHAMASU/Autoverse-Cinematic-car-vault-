import React, { useEffect } from 'react';
import type { Vehicle } from '../types';
import { X, ShieldCheck, Zap, Gauge, BatteryCharging, Scale } from 'lucide-react';
import { CarImage } from './CarImage';

interface VehicleSpecModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onAddToGarage?: (vehicle: Vehicle) => void;
  isSaved?: boolean;
}

export const VehicleSpecModal: React.FC<VehicleSpecModalProps> = ({
  vehicle,
  onClose,
  onAddToGarage,
  isSaved = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (vehicle) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [vehicle, onClose]);

  if (!vehicle) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(5, 7, 10, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-vehicle-title"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          backgroundColor: '#0c1017',
          border: '1px solid var(--border-medium)',
          borderRadius: '12px',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: 'rgba(12, 16, 23, 0.95)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.25rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-cyan">{vehicle.year} VERIFIED</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                letterSpacing: '0.1em',
              }}
            >
              {vehicle.manufacturerName.toUpperCase()} // DOSSIER
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: '#ffffff',
            }}
            aria-label="Close vehicle specifications"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem' }}>
          {/* Hero Visual Preview */}
          <div
            style={{
              height: '320px',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              marginBottom: '1.75rem',
            }}
          >
            <CarImage
              src={vehicle.heroImage}
              alt={`${vehicle.manufacturerName} ${vehicle.name}`}
              manufacturer={vehicle.manufacturerName}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1.25rem',
                right: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                background:
                  'linear-gradient(to top, rgba(7, 9, 13, 0.95) 0%, transparent 100%)',
                paddingTop: '2rem',
              }}
            >
              <div>
                <h3
                  id="modal-vehicle-title"
                  style={{
                    fontSize: '2rem',
                    color: '#ffffff',
                    fontWeight: 800,
                  }}
                >
                  {vehicle.name}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {vehicle.tagline}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    display: 'block',
                  }}
                >
                  STARTING MSRP
                </span>
                <span
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--accent-cyan)',
                  }}
                >
                  ${vehicle.priceStartingUsd.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '0.35rem',
                }}
              >
                <Gauge size={13} /> 0–60 MPH ACCELERATION
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                {vehicle.specs.acceleration0to60}s
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '0.35rem',
                }}
              >
                <Zap size={13} /> PEAK HORSEPOWER
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                {vehicle.specs.horsepower} HP
                {vehicle.specs.powerKw && (
                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      marginLeft: '6px',
                      fontWeight: 500,
                    }}
                  >
                    ({vehicle.specs.powerKw} kW)
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '0.35rem',
                }}
              >
                <Gauge size={13} /> TOP SPEED
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                {vehicle.specs.topSpeedMph} MPH
                {vehicle.specs.topSpeedKmh && (
                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      marginLeft: '6px',
                      fontWeight: 500,
                    }}
                  >
                    ({vehicle.specs.topSpeedKmh} km/h)
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '0.35rem',
                }}
              >
                <BatteryCharging size={13} /> RANGE / ARCHITECTURE
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                {vehicle.specs.electricRangeMiles
                  ? `${vehicle.specs.electricRangeMiles} mi`
                  : vehicle.specs.voltageArchitecture || 'Gasoline V8'}
              </div>
            </div>
          </div>

          {/* Detailed Technical Specifications Table */}
          <div style={{ marginBottom: '2rem' }}>
            <h4
              style={{
                fontSize: '1.1rem',
                color: '#ffffff',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Scale size={18} color="var(--accent-cyan)" />
              Full Engineering Specifications
            </h4>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  padding: '0.85rem 1.25rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Powertrain</span>
                <span style={{ color: '#ffffff', fontSize: '0.88rem', fontWeight: 500 }}>
                  {vehicle.specs.engineType}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  padding: '0.85rem 1.25rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Drivetrain</span>
                <span style={{ color: '#ffffff', fontSize: '0.88rem', fontWeight: 500 }}>
                  {vehicle.specs.drivetrain}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  padding: '0.85rem 1.25rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Transmission</span>
                <span style={{ color: '#ffffff', fontSize: '0.88rem', fontWeight: 500 }}>
                  {vehicle.specs.transmission}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  padding: '0.85rem 1.25rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Curb Weight</span>
                <span style={{ color: '#ffffff', fontSize: '0.88rem', fontWeight: 500 }}>
                  {vehicle.specs.curbWeightLbs.toLocaleString()} lbs ({(vehicle.specs.curbWeightLbs * 0.453592).toFixed(0)} kg)
                </span>
              </div>

              {vehicle.specs.batteryCapacityKwh && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr',
                    padding: '0.85rem 1.25rem',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Battery Capacity</span>
                  <span style={{ color: '#ffffff', fontSize: '0.88rem', fontWeight: 500 }}>
                    {vehicle.specs.batteryCapacityKwh} kWh High-Voltage Pack
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Verification Source Box */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <ShieldCheck size={22} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#34d399',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.05em',
                  marginBottom: '0.25rem',
                }}
              >
                VERIFIED SPECIFICATION SOURCE
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {vehicle.specs.verifiedSource} // Recorded {vehicle.specs.verifiedDate}. All
                metrics reflect official manufacturer certified benchmarks.
              </p>
            </div>
          </div>

          {/* Modal Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            {onAddToGarage && (
              <button
                onClick={() => onAddToGarage(vehicle)}
                className={`btn ${isSaved ? 'btn-secondary' : 'btn-cyan'}`}
              >
                {isSaved ? 'In Your Garage ✓' : 'Save to Garage (Stage 3)'}
              </button>
            )}
            <button onClick={onClose} className="btn btn-secondary">
              Close Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
