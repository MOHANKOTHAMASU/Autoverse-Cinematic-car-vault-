import React from 'react';
import type { Vehicle } from '../../types';
import type { CurrencyCode, PriceBasis } from '../../types/calculator';
import { REGIONAL_PROFILES } from '../../utils/tcoCalculator';
import { Car } from 'lucide-react';

interface VehicleRegionSelectorProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle;
  onSelectVehicle: (vehicle: Vehicle) => void;
  selectedRegionKey: string;
  onSelectRegionKey: (regionKey: string) => void;
  currency: CurrencyCode;
  onSelectCurrency: (currency: CurrencyCode) => void;
  customPrice: number;
  onChangeCustomPrice: (price: number) => void;
  isCustomPriceActive: boolean;
  onToggleCustomPrice: (active: boolean) => void;
  priceBasis: PriceBasis;
}

export const VehicleRegionSelector: React.FC<VehicleRegionSelectorProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  selectedRegionKey,
  onSelectRegionKey,
  currency,
  onSelectCurrency,
  customPrice,
  onChangeCustomPrice,
  isCustomPriceActive,
  onToggleCustomPrice,
  priceBasis,
}) => {
  const currentProfile = REGIONAL_PROFILES[selectedRegionKey] || REGIONAL_PROFILES.delhi;

  const handleVehicleChange = (slug: string) => {
    const found = vehicles.find((v) => v.slug === slug);
    if (found) {
      onSelectVehicle(found);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(12, 16, 24, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
            }}
          >
            <Car size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              1. Vehicle & Regional Market Selection
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, marginTop: '2px' }}>
              Select vehicle variant and regulatory state for accurate tax, tariff, and fuel pricing.
            </p>
          </div>
        </div>

        {/* Currency Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
            Currency:
          </span>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {(['INR', 'USD', 'EUR', 'GBP'] as CurrencyCode[]).map((cur) => (
              <button
                key={cur}
                type="button"
                onClick={() => onSelectCurrency(cur)}
                style={{
                  background: currency === cur ? 'var(--accent-cyan)' : 'transparent',
                  color: currency === cur ? '#000000' : '#cbd5e1',
                  fontWeight: currency === cur ? 700 : 500,
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Vehicle Dropdown */}
        <div>
          <label
            htmlFor="vehicle-select"
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#94a3b8',
              marginBottom: '0.4rem',
            }}
          >
            Vehicle Model
          </label>
          <select
            id="vehicle-select"
            value={selectedVehicle.slug}
            onChange={(e) => handleVehicleChange(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '0.65rem 0.75rem',
              color: '#f8fafc',
              fontSize: '0.875rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {vehicles.map((v) => (
              <option key={v.slug} value={v.slug}>
                {v.brand} {v.model} — {v.variant} ({v.powertrain.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Region Dropdown */}
        <div>
          <label
            htmlFor="region-select"
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#94a3b8',
              marginBottom: '0.4rem',
            }}
          >
            Region / State Profile
          </label>
          <div style={{ position: 'relative' }}>
            <select
              id="region-select"
              value={selectedRegionKey}
              onChange={(e) => onSelectRegionKey(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0.65rem 0.75rem',
                color: '#f8fafc',
                fontSize: '0.875rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <optgroup label="India (State RTO & Tariffs)">
                <option value="delhi">Delhi NCR (0% EV Tax, Petrol ₹94.72)</option>
                <option value="maharashtra">Maharashtra / Mumbai (12% ICE, Petrol ₹103.44)</option>
                <option value="karnataka">Karnataka / Bengaluru (15% ICE, Petrol ₹102.86)</option>
                <option value="tamil_nadu">Tamil Nadu / Chennai (11% ICE, Petrol ₹100.75)</option>
                <option value="telangana">Telangana / Hyderabad (13% ICE, Petrol ₹107.41)</option>
                <option value="gujarat">Gujarat / Ahmedabad (6% ICE, Petrol ₹94.42)</option>
              </optgroup>
              <optgroup label="International Markets">
                <option value="us_general">United States (National Avg, $0.95/L Gas)</option>
                <option value="uk_general">United Kingdom (National Avg, £1.42/L)</option>
                <option value="eu_germany">Germany / EU (€1.75/L Petrol)</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Price Basis & Override */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.4rem',
            }}
          >
            <label
              htmlFor="custom-price-input"
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#94a3b8',
              }}
            >
              Base Ex-Showroom Price
            </label>
            <button
              type="button"
              onClick={() => onToggleCustomPrice(!isCustomPriceActive)}
              style={{
                background: 'none',
                border: 'none',
                color: isCustomPriceActive ? 'var(--accent-cyan)' : '#64748b',
                fontSize: '0.7rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isCustomPriceActive ? 'Reset to Catalog' : 'Custom Estimate'}
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              id="custom-price-input"
              type="number"
              min="0"
              step="1000"
              value={customPrice}
              disabled={!isCustomPriceActive}
              onChange={(e) => onChangeCustomPrice(parseFloat(e.target.value) || 0)}
              style={{
                width: '100%',
                backgroundColor: isCustomPriceActive
                  ? 'rgba(6, 182, 212, 0.08)'
                  : 'rgba(15, 23, 42, 0.5)',
                border: isCustomPriceActive
                  ? '1px solid var(--accent-cyan)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.65rem 0.75rem',
                color: '#f8fafc',
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      {/* Verification & Price Basis Banner */}
      <div
        style={{
          marginTop: '1.25rem',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              backgroundColor: isCustomPriceActive
                ? 'rgba(234, 179, 8, 0.15)'
                : 'rgba(16, 185, 129, 0.15)',
              color: isCustomPriceActive ? '#facc15' : '#10b981',
              border: isCustomPriceActive
                ? '1px solid rgba(234, 179, 8, 0.3)'
                : '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            {isCustomPriceActive ? 'User-Entered Estimate' : `Catalog Ex-Showroom (${priceBasis.replace('_', ' ')})`}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {isCustomPriceActive
              ? 'User-specified price baseline applied across calculations'
              : `Official Verified Spec Sheet (${selectedVehicle.specificationSource || 'Datasheet'})`}
          </span>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Region Source: <span style={{ color: '#94a3b8' }}>{currentProfile.source}</span> (Verified{' '}
          {currentProfile.lastVerifiedDate})
        </div>
      </div>
    </div>
  );
};
