import React, { useState, useMemo } from 'react';
import { VEHICLES } from '../data/vehicles';
import type { Vehicle } from '../types';
import { VehicleCard } from './VehicleCard';
import { VehicleSpecModal } from './VehicleSpecModal';
import { Filter, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeaturedVehiclesProps {
  selectedManufacturerId?: string | null;
  onClearManufacturerFilter?: () => void;
}

export const FeaturedVehicles: React.FC<FeaturedVehiclesProps> = ({
  selectedManufacturerId,
  onClearManufacturerFilter,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [savedVehicleIds, setSavedVehicleIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Curated Models' },
    { id: 'electric', label: 'Electric Performance' },
    { id: 'hybrid', label: 'High-Performance Hybrid' },
    { id: 'petrol', label: 'Twin-Turbo / NA Petrol' },
    { id: 'track', label: 'Track-Focused' },
  ];

  const filteredVehicles = useMemo(() => {
    return VEHICLES.filter((v) => {
      // Manufacturer filter from showcase
      if (selectedManufacturerId && v.manufacturerId !== selectedManufacturerId) {
        return false;
      }
      // Category tab
      if (activeCategory !== 'all' && v.category !== activeCategory) {
        return false;
      }
      return true;
    });
  }, [activeCategory, selectedManufacturerId]);

  const handleToggleSave = (vehicle: Vehicle) => {
    setSavedVehicleIds((prev) => {
      const next = new Set(prev);
      if (next.has(vehicle.id)) {
        next.delete(vehicle.id);
        showToast(`Removed ${vehicle.name} from your Garage`);
      } else {
        next.add(vehicle.id);
        showToast(`Saved ${vehicle.name} to your Garage (Stage 3 Ready)`);
      }
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  return (
    <section id="featured" className="section" style={{ position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <div>
            <span className="section-eyebrow">The Fleet</span>
            <h2 className="section-title">Curated Performance Fleet</h2>
            <p className="section-subtitle">
              Every vehicle in this initial selection features manufacturer-verified
              telemetry, official curb weights, and certified acceleration records.
            </p>
          </div>

          {/* Active Manufacturer Filter Indicator */}
          {selectedManufacturerId && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(0, 240, 255, 0.12)',
                border: '1px solid rgba(0, 240, 255, 0.35)',
                borderRadius: '6px',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#ffffff' }}>
                Filtered by manufacturer:{' '}
                <strong style={{ color: 'var(--accent-cyan)' }}>
                  {selectedManufacturerId.toUpperCase()}
                </strong>
              </span>
              {onClearManufacturerFilter && (
                <button
                  onClick={onClearManufacturerFilter}
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  Clear Filter
                </button>
              )}
            </div>
          )}

          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              width: '100%',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '0.6rem 1.15rem',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  color: activeCategory === cat.id ? '#07090d' : 'var(--text-secondary)',
                  backgroundColor:
                    activeCategory === cat.id ? '#ffffff' : 'rgba(255, 255, 255, 0.04)',
                  border:
                    activeCategory === cat.id
                      ? '1px solid #ffffff'
                      : '1px solid var(--border-subtle)',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Cards Grid */}
        {filteredVehicles.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.75rem',
              marginBottom: '3rem',
            }}
          >
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onOpenSpecs={(v) => setSelectedVehicle(v)}
                onToggleSave={handleToggleSave}
                isSaved={savedVehicleIds.has(vehicle.id)}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '3rem',
            }}
          >
            <Filter size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              No vehicles match the selected filter criteria.
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Try clearing manufacturer filters or selecting "All Curated Models".
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                if (onClearManufacturerFilter) onClearManufacturerFilter();
              }}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Bottom Catalog Discovery Callout */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.75rem 2rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(14, 18, 26, 0.7)',
            border: '1px solid var(--border-subtle)',
            gap: '1rem',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--accent-cyan)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Stage 2 Catalog Foundation Ready
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              Looking for deeper filtering by horsepower, chassis weight, and propulsion?
            </div>
          </div>

          <Link to="/discover" className="btn btn-secondary">
            Explore Full Discovery Catalog
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Vehicle Specification Modal */}
      <VehicleSpecModal
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        onAddToGarage={handleToggleSave}
        isSaved={selectedVehicle ? savedVehicleIds.has(selectedVehicle.id) : false}
      />

      {/* Action Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 1100,
            backgroundColor: 'rgba(12, 16, 23, 0.95)',
            border: '1px solid var(--accent-cyan)',
            boxShadow: '0 10px 30px rgba(0, 240, 255, 0.25)',
            borderRadius: '6px',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: '#ffffff',
            fontSize: '0.88rem',
            fontFamily: 'var(--font-heading)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <Check size={16} color="var(--accent-cyan)" />
          {toastMessage}
        </div>
      )}
    </section>
  );
};
