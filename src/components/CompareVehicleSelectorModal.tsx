import React, { useState, useEffect } from 'react';
import { VEHICLES } from '../data/vehicles';
import type { Vehicle } from '../types';
import { CarImage } from './CarImage';
import { X, Search, ShieldCheck, Zap, Gauge, Check, Plus } from 'lucide-react';
import { formatPrice } from '../utils/comparison';

interface CompareVehicleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  currentlySelectedIds: string[];
  replacingVehicleTitle?: string;
}

export const CompareVehicleSelectorModal: React.FC<CompareVehicleSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectVehicle,
  currentlySelectedIds,
  replacingVehicleTitle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedPowertrain, setSelectedPowertrain] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSearchQuery('');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter vehicles
  const filteredVehicles = VEHICLES.filter((v) => {
    // Brand filter
    if (selectedBrand !== 'all' && v.manufacturerId !== selectedBrand && v.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
      return false;
    }
    // Powertrain filter
    if (selectedPowertrain !== 'all') {
      if (selectedPowertrain === 'electric' && v.powertrain !== 'electric') return false;
      if (selectedPowertrain === 'hybrid' && v.powertrain !== 'hybrid' && v.powertrain !== 'plug-in hybrid') return false;
      if (selectedPowertrain === 'petrol' && v.powertrain !== 'petrol' && v.powertrain !== 'diesel') return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = v.name?.toLowerCase().includes(q);
      const matchBrand = v.brand?.toLowerCase().includes(q);
      const matchModel = v.model?.toLowerCase().includes(q);
      const matchVariant = v.variant?.toLowerCase().includes(q);
      const matchYear = String(v.modelYear || v.year).includes(q);
      return matchName || matchBrand || matchModel || matchVariant || matchYear;
    }
    return true;
  });

  const availableBrands = [
    { id: 'all', label: 'All Brands' },
    { id: 'porsche', label: 'Porsche' },
    { id: 'tesla', label: 'Tesla' },
    { id: 'audi', label: 'Audi' },
    { id: 'mercedes-benz', label: 'Mercedes-Benz' },
    { id: 'bmw', label: 'BMW' },
  ];

  const availablePowertrains = [
    { id: 'all', label: 'All Propulsion' },
    { id: 'electric', label: 'Pure Electric' },
    { id: 'hybrid', label: 'Hybrid / PHEV' },
    { id: 'petrol', label: 'Combustion (Petrol)' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(5, 7, 10, 0.92)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Select Vehicle to Compare"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '88vh',
          backgroundColor: '#0c1017',
          border: '1px solid var(--border-medium)',
          borderRadius: '14px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-cyan">
                <ShieldCheck size={12} /> STAGE 4 VEHICLE SELECTOR
              </span>
              {replacingVehicleTitle && (
                <span className="badge badge-gold">
                  REPLACING: {replacingVehicleTitle}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#ffffff', fontWeight: 800 }}>
              {replacingVehicleTitle ? 'Select Replacement Vehicle' : 'Add Vehicle to Comparison Matrix'}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            aria-label="Close vehicle selector"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter & Search Controls */}
        <div
          style={{
            padding: '1.25rem 2rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              color="var(--accent-cyan)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by manufacturer, model name, generation, or variant (e.g. Taycan, Plaid, GT3 RS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#141a24',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '0.85rem 1rem 0.85rem 2.85rem',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontFamily: 'var(--font-body)',
                outline: 'none',
              }}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            {/* Brand Filter Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {availableBrands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrand(b.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: selectedBrand === b.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    backgroundColor: selectedBrand === b.id ? 'var(--accent-cyan-dim)' : 'rgba(255, 255, 255, 0.03)',
                    color: selectedBrand === b.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

            {/* Powertrain Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {availablePowertrains.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPowertrain(p.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: selectedPowertrain === p.id ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                    backgroundColor: selectedPowertrain === p.id ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: selectedPowertrain === p.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle Selection Grid */}
        <div
          style={{
            padding: '1.5rem 2rem',
            overflowY: 'auto',
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((car) => {
              const isAlreadyIn = currentlySelectedIds.includes(car.slug || car.id);

              return (
                <div
                  key={car.id}
                  className="card-glass"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderColor: isAlreadyIn ? 'rgba(0, 240, 255, 0.4)' : undefined,
                    opacity: isAlreadyIn ? 0.75 : 1,
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'relative', height: '140px' }}>
                    <CarImage
                      src={car.thumbnail || car.heroImage}
                      alt={`${car.brand} ${car.model}`}
                      manufacturer={car.brand}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        left: '0.5rem',
                        zIndex: 2,
                      }}
                    >
                      <span className="badge">
                        {car.powertrain.toUpperCase()}
                      </span>
                    </div>

                    {isAlreadyIn && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          zIndex: 2,
                        }}
                      >
                        <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Check size={12} /> IN COMPARISON
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {car.brand} // {car.modelYear}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 700, margin: '2px 0 0.5rem' }}>
                      {car.model} <span style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>{car.variant}</span>
                    </h3>

                    {/* Quick Specs */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '6px',
                        marginBottom: '0.75rem',
                        fontSize: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1' }}>
                        <Gauge size={13} color="var(--accent-cyan)" />
                        <span>{car.accelerationSeconds}s (0-60)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1' }}>
                        <Zap size={13} color="var(--accent-cyan)" />
                        <span>{car.horsepower} HP</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                        {formatPrice(car.price, car.currency)}
                      </span>

                      <button
                        onClick={() => {
                          if (!isAlreadyIn) {
                            onSelectVehicle(car);
                            onClose();
                          }
                        }}
                        disabled={isAlreadyIn}
                        className={isAlreadyIn ? 'btn btn-secondary' : 'btn btn-primary'}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.45rem 0.85rem',
                          cursor: isAlreadyIn ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isAlreadyIn ? (
                          <>
                            <Check size={13} />
                            <span>Selected</span>
                          </>
                        ) : (
                          <>
                            <Plus size={13} />
                            <span>Add to Slot</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: '3rem 1rem',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>No machines match your criteria</h3>
              <p style={{ fontSize: '0.9rem' }}>Try adjusting your search query or selecting "All Brands" and "All Propulsion".</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 2rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>
            SHOWING {filteredVehicles.length} OF {VEHICLES.length} HOMOLOGATED VEHICLES
          </span>
          <button onClick={onClose} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
