// AutoVerse Stage 16: Charging Station Discovery Directory
// Features interactive map & list views, multi-connector filtering, and verified network station dossiers.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  MapPin,
  Search,
  Navigation,
  ChevronRight,
} from 'lucide-react';
import { CHARGING_STATIONS } from '../data/chargingStations';
import { searchChargingStations } from '../utils/tripPlannerStore';
import type { ChargingPlugType } from '../types/tripPlanner';

export const ChargingStationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedConnector, setSelectedConnector] = useState<ChargingPlugType | ''>('');
  const [minPowerKw, setMinPowerKw] = useState<number>(0);
  const [isDcOnly, setIsDcOnly] = useState<boolean>(true);
  const [selectedOperator] = useState('');

  const filteredStations = searchChargingStations({
    query: searchQuery || undefined,
    city: selectedCity || undefined,
    connectorType: (selectedConnector as ChargingPlugType) || undefined,
    minPowerKw: minPowerKw || undefined,
    isDcOnly: isDcOnly || undefined,
    operator: selectedOperator || undefined,
  });

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
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.45rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                backgroundColor: 'rgba(0, 240, 255, 0.08)',
                padding: '0.2rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              <Zap size={14} />
              Verified EV Station Directory
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {CHARGING_STATIONS.length} Audited Fast Hubs
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: '0.65rem',
            }}
          >
            High-Power EV Charging Hubs
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              maxWidth: '820px',
              lineHeight: 1.55,
            }}
          >
            Discover verified DC ultra-fast chargers and destination charging lounges across major national highways.
            Review genuine connector types, rated power, published tariffs, and audited amenities.
          </p>
        </div>

        {/* Filter Toolbar Card */}
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: '#070a0f',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            marginBottom: '2rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Top Search Input */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search
              size={18}
              color="var(--accent-cyan)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, station name, highway (e.g. NH 65, Suryapet, Gachibowli, Ulm)..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Filter Pills Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem',
              alignItems: 'center',
            }}
          >
            {/* City Filter */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                City / Region
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              >
                <option value="" style={{ backgroundColor: '#090d14' }}>All Cities</option>
                <option value="Vijayawada" style={{ backgroundColor: '#090d14' }}>Vijayawada</option>
                <option value="Suryapet" style={{ backgroundColor: '#090d14' }}>Suryapet (NH 65)</option>
                <option value="Hyderabad" style={{ backgroundColor: '#090d14' }}>Hyderabad</option>
                <option value="Mumbai" style={{ backgroundColor: '#090d14' }}>Mumbai</option>
                <option value="Pune" style={{ backgroundColor: '#090d14' }}>Pune</option>
                <option value="Krishnagiri" style={{ backgroundColor: '#090d14' }}>Krishnagiri (NH 44)</option>
                <option value="Neemrana" style={{ backgroundColor: '#090d14' }}>Neemrana (NH 48)</option>
                <option value="Ulm" style={{ backgroundColor: '#090d14' }}>Ulm (Autobahn A8)</option>
                <option value="Stuttgart" style={{ backgroundColor: '#090d14' }}>Stuttgart</option>
                <option value="Kettleman City" style={{ backgroundColor: '#090d14' }}>Kettleman City (I-5)</option>
              </select>
            </div>

            {/* Connector Filter */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                Plug Type
              </label>
              <select
                value={selectedConnector}
                onChange={(e) => setSelectedConnector(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              >
                <option value="" style={{ backgroundColor: '#090d14' }}>All Connectors</option>
                <option value="CCS2" style={{ backgroundColor: '#090d14' }}>CCS2 (Universal Fast DC)</option>
                <option value="Type 2" style={{ backgroundColor: '#090d14' }}>Type 2 (AC Destination)</option>
                <option value="NACS" style={{ backgroundColor: '#090d14' }}>NACS (Tesla Supercharger)</option>
                <option value="CCS1" style={{ backgroundColor: '#090d14' }}>CCS1 (North America)</option>
                <option value="CHAdeMO" style={{ backgroundColor: '#090d14' }}>CHAdeMO</option>
              </select>
            </div>

            {/* Minimum Power Filter */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                Minimum Power
              </label>
              <select
                value={minPowerKw}
                onChange={(e) => setMinPowerKw(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              >
                <option value="0" style={{ backgroundColor: '#090d14' }}>Any Power</option>
                <option value="60" style={{ backgroundColor: '#090d14' }}>60+ kW Fast DC</option>
                <option value="120" style={{ backgroundColor: '#090d14' }}>120+ kW High Power</option>
                <option value="200" style={{ backgroundColor: '#090d14' }}>200+ kW Ultra-Fast (800V)</option>
                <option value="300" style={{ backgroundColor: '#090d14' }}>300+ kW Hypercharger</option>
              </select>
            </div>

            {/* DC Only Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <input
                type="checkbox"
                id="dcOnly"
                checked={isDcOnly}
                onChange={(e) => setIsDcOnly(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-cyan)' }}
              />
              <label htmlFor="dcOnly" style={{ fontSize: '0.82rem', color: '#ffffff', cursor: 'pointer', fontWeight: 600 }}>
                DC Fast Chargers Only
              </label>
            </div>
          </div>
        </div>

        {/* Results Header Count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing <strong style={{ color: '#ffffff' }}>{filteredStations.length}</strong> verified stations
          </div>
          <Link to="/trip-planner" className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}>
            Plan EV Trip with these Stations ➔
          </Link>
        </div>

        {/* Stations Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredStations.map((station) => (
            <div
              key={station.id}
              style={{
                borderRadius: '12px',
                backgroundColor: '#070a0f',
                border: '1px solid var(--border-subtle)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                {/* Station Top Badge & Operator */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0, 240, 255, 0.1)',
                      color: 'var(--accent-cyan)',
                      border: '1px solid rgba(0, 240, 255, 0.25)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {station.operator}
                  </span>

                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#f59e0b' }}>
                    {station.maxPowerKw} kW Peak
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                  {station.name}
                </h3>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={13} color="var(--accent-cyan)" />
                  <span>{station.address}</span>
                </div>

                {/* Connectors Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                  {station.connectors.map((conn, cIdx) => (
                    <span
                      key={cIdx}
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: conn.currentType === 'DC' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                        color: conn.currentType === 'DC' ? '#10b981' : 'var(--text-secondary)',
                        border: `1px solid ${conn.currentType === 'DC' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                        fontWeight: 600,
                      }}
                    >
                      {conn.type} • {conn.powerKw} kW ({conn.currency} {conn.pricePerKwh}/kWh)
                    </span>
                  ))}
                </div>

                {/* Amenities Badges */}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <strong>Amenities:</strong> {station.amenities.join(' • ')}
                </div>
              </div>

              {/* Bottom Actions */}
              <div
                style={{
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Link
                  to={`/charging-stations/${station.id}`}
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--accent-cyan)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  Station Dossier <ChevronRight size={14} />
                </Link>

                <Link
                  to={`/trip-planner?to=${encodeURIComponent(station.city)}`}
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <Navigation size={13} /> Route Here
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
