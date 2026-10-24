// AutoVerse Stage 16: Individual Charging Station Dossier (/charging-stations/:id)
// Displays complete electrical hardware specifications, verified tariffs, payment methods, and navigation links.

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Zap,
  MapPin,
  Clock,
  Navigation,
  ChevronLeft,
  Share2,
  Check,
} from 'lucide-react';
import { getChargingStationById } from '../utils/tripPlannerStore';
import type { ChargingStation } from '../types/tripPlanner';

export const ChargingStationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [station, setStation] = useState<ChargingStation | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (id) {
      const found = getChargingStationById(id);
      if (found) {
        setStation(found);
      }
    }
  }, [id]);

  if (!station) {
    return (
      <div
        style={{
          minHeight: '70vh',
          backgroundColor: '#030508',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          padding: '2rem',
        }}
      >
        <Zap size={48} color="#f59e0b" style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Station Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          This charging station could not be resolved in the AutoVerse network.
        </p>
        <Link to="/charging-stations" className="btn btn-primary">
          Return to Charging Stations Directory
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#030508',
        color: 'var(--text-primary)',
        paddingTop: 'calc(var(--header-height) + 1.5rem)',
        paddingBottom: '5rem',
      }}
    >
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Link
            to="/charging-stations"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              textDecoration: 'none',
            }}
          >
            <ChevronLeft size={16} /> All Charging Stations
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            {station.city}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontSize: '0.82rem', color: '#ffffff' }}>{station.name}</span>
        </div>

        {/* Hero Station Banner */}
        <div
          style={{
            padding: '2rem',
            backgroundColor: '#070a0f',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            marginBottom: '2rem',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(0, 240, 255, 0.12)',
                    color: 'var(--accent-cyan)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {station.operator}
                </span>

                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Verified: {station.lastVerifiedAt}
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  fontWeight: 900,
                  color: '#ffffff',
                  marginBottom: '0.5rem',
                }}
              >
                {station.name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                <MapPin size={16} color="var(--accent-cyan)" />
                <span>{station.address}, {station.city}, {station.country}</span>
              </div>
            </div>

            {/* Navigation & Action Buttons */}
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <Link
                to={`/trip-planner?to=${encodeURIComponent(station.city)}`}
                className="btn btn-primary"
                style={{
                  padding: '0.65rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--accent-cyan)',
                  color: '#040608',
                  fontWeight: 700,
                }}
              >
                <Navigation size={16} /> Plan Trip Here
              </Link>

              <button
                onClick={handleShare}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              >
                {copySuccess ? <Check size={16} color="#10b981" /> : <Share2 size={16} />}
                <span>{copySuccess ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Specs Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {/* Connector Hardware Matrix */}
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: '#070a0f',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} color="var(--accent-cyan)" />
              Charging Connectors & Electrical Power
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {station.connectors.map((conn, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{conn.type}</span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: conn.currentType === 'DC' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          color: conn.currentType === 'DC' ? '#10b981' : 'var(--text-muted)',
                          fontWeight: 700,
                        }}
                      >
                        {conn.currentType} Fast
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Rated Output: <strong style={{ color: 'var(--accent-cyan)' }}>{conn.powerKw} kW</strong> • Total Bays: {conn.totalPlugs}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                      {conn.currency} {conn.pricePerKwh}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per kWh</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Station Operating & Access Information */}
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: '#070a0f',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--accent-cyan)" />
              Operating Hours & Driver Amenities
            </h3>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Opening Schedule</div>
              <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>{station.openingHours}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Payment Methods Accepted</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {station.paymentMethods.map((pay, pIdx) => (
                  <span
                    key={pIdx}
                    style={{
                      fontSize: '0.74rem',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    💳 {pay}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>On-Site Driver Amenities</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {station.amenities.map((amenity, aIdx) => (
                  <span
                    key={aIdx}
                    style={{
                      fontSize: '0.74rem',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0, 240, 255, 0.05)',
                      border: '1px solid rgba(0, 240, 255, 0.2)',
                      color: 'var(--accent-cyan)',
                      fontWeight: 500,
                    }}
                  >
                    ✓ {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: 'auto',
                padding: '0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '0.2rem' }}>
                Data Source Attribution
              </div>
              {station.sourceAttribution} • Audited: {station.lastVerifiedAt}. Real-time stall availability is managed by {station.operator}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
