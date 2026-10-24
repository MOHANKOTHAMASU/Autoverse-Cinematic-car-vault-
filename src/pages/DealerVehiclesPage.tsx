// AutoVerse Stage 20: Dealer Vehicle Inventory Showcase
// Displays complete vehicle inventory for an authorized dealership with powertrain & body type filtering.

import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  Car,
  Clock,
  ArrowLeft,
  Search,
  RotateCcw,
} from 'lucide-react';
import { getDealerBySlug } from '../utils/dealerStore';
import { VEHICLES } from '../data/vehicles';

export const DealerVehiclesPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const dealer = useMemo(() => {
    if (!slug) return undefined;
    return getDealerBySlug(slug);
  }, [slug]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('all');
  const [selectedPowertrain, setSelectedPowertrain] = useState<string>('all');

  // Filter vehicles linked to this dealer
  const dealerVehicles = useMemo(() => {
    if (!dealer) return [];
    return VEHICLES.filter((v) => {
      const inInventory = dealer.inventoryVehicleIds.includes(v.slug) || dealer.inventoryVehicleIds.includes(v.id);
      const brandSupported = dealer.supportedBrands.some((b) => b.toLowerCase() === v.brand.toLowerCase());
      return inInventory || brandSupported;
    });
  }, [dealer]);

  const filteredVehicles = useMemo(() => {
    return dealerVehicles.filter((v) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          v.model.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.variant.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (selectedBodyType !== 'all' && v.bodyType !== selectedBodyType) {
        return false;
      }

      if (selectedPowertrain !== 'all' && v.powertrain !== selectedPowertrain) {
        return false;
      }

      return true;
    });
  }, [dealerVehicles, searchQuery, selectedBodyType, selectedPowertrain]);

  if (!dealer) {
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
        <div className="container" style={{ maxWidth: '600px' }}>
          <Building2 size={54} color="var(--text-muted)" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.75rem' }}>
            Dealership Not Found
          </h1>
          <Link to="/dealers" className="btn btn-primary">
            <ArrowLeft size={16} /> Return to Dealer Directory
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
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to={`/dealers/${dealer.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <ArrowLeft size={14} /> Back to {dealer.name}
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-cyan">
              <Car size={12} /> SHOWROOM INVENTORY
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {dealer.name.toUpperCase()}
            </span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
            Available Vehicles & Allocations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '700px' }}>
            Browse and schedule verified test drives for available models at {dealer.name} ({dealer.address.city}).
          </p>
        </div>

        {/* Filter Controls */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '14px',
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <div
            style={{
              flex: '1 1 260px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              padding: '0.6rem 0.85rem',
            }}
          >
            <Search size={16} color="var(--accent-cyan)" />
            <input
              type="text"
              placeholder="Search model or trim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          {/* Body Type */}
          <select
            value={selectedBodyType}
            onChange={(e) => setSelectedBodyType(e.target.value)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              padding: '0.65rem 1rem',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none',
              minWidth: '150px',
            }}
          >
            <option value="all" style={{ background: '#0a0d14' }}>
              All Body Styles
            </option>
            <option value="sedan" style={{ background: '#0a0d14' }}>
              Sedan
            </option>
            <option value="suv" style={{ background: '#0a0d14' }}>
              SUV
            </option>
            <option value="coupe" style={{ background: '#0a0d14' }}>
              Coupe
            </option>
            <option value="hypercar" style={{ background: '#0a0d14' }}>
              Hypercar / Sport
            </option>
          </select>

          {/* Powertrain */}
          <select
            value={selectedPowertrain}
            onChange={(e) => setSelectedPowertrain(e.target.value)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              padding: '0.65rem 1rem',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none',
              minWidth: '150px',
            }}
          >
            <option value="all" style={{ background: '#0a0d14' }}>
              All Powertrains
            </option>
            <option value="electric" style={{ background: '#0a0d14' }}>
              Electric (EV)
            </option>
            <option value="hybrid" style={{ background: '#0a0d14' }}>
              Hybrid / PHEV
            </option>
            <option value="ice" style={{ background: '#0a0d14' }}>
              Internal Combustion (ICE)
            </option>
          </select>

          {(searchQuery || selectedBodyType !== 'all' || selectedPowertrain !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBodyType('all');
                setSelectedPowertrain('all');
              }}
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '0.6rem 0.85rem' }}
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>

        {/* Inventory Cards */}
        {filteredVehicles.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div style={{ position: 'relative', height: '190px' }}>
                  <img
                    src={vehicle.thumbnail || vehicle.heroImage || vehicle.imageGallery[0]}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      left: '0.75rem',
                      backgroundColor: 'rgba(7, 9, 13, 0.85)',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      borderRadius: '4px',
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {vehicle.powertrain}
                  </div>
                </div>

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {vehicle.brand.toUpperCase()}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    {vehicle.variant} ({vehicle.modelYear})
                  </div>

                  {/* Specs Matrix */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                      padding: '0.85rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      marginBottom: '1.5rem',
                      textAlign: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        POWER
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                        {vehicle.horsepower} HP
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        0-60
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {vehicle.accelerationSeconds}s
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        PRICE
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                        {vehicle.price ? `$${vehicle.price.toLocaleString()}` : 'Contact Showroom'}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                    <Link
                      to={`/vehicles/${vehicle.slug}`}
                      className="btn btn-outline"
                      style={{ flex: 1, fontSize: '0.8rem', padding: '0.6rem', justifyContent: 'center' }}
                    >
                      Specifications
                    </Link>

                    <Link
                      to={`/test-drive?dealer=${dealer.slug}&vehicle=${vehicle.slug}`}
                      className="btn btn-primary"
                      style={{ flex: 1.5, fontSize: '0.8rem', padding: '0.6rem', justifyContent: 'center' }}
                    >
                      <Clock size={14} /> Request Test Drive
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '14px',
              border: '1px dashed var(--border-medium)',
            }}
          >
            <p style={{ color: 'var(--text-secondary)' }}>No vehicles in this dealer inventory match the filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
