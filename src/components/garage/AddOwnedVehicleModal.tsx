import React, { useState } from 'react';
import { VEHICLES } from '../../data/vehicles';
import type { Vehicle } from '../../types';
import { addOwnedVehicle } from '../../utils/ownershipStore';
import type { PowertrainType, OdometerUnit, CurrencyCode } from '../../types/ownership';
import { X, Search, Check, Car, Sparkles, Plus, AlertCircle } from 'lucide-react';

interface Props {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onVehicleAdded: () => void;
}

export const AddOwnedVehicleModal: React.FC<Props> = ({
  userId,
  isOpen,
  onClose,
  onVehicleAdded,
}) => {
  const [method, setMethod] = useState<'catalog' | 'custom'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatalogCar, setSelectedCatalogCar] = useState<Vehicle | null>(null);

  // Form Fields
  const [customMake, setCustomMake] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [customVariant, setCustomVariant] = useState('');
  const [customYear, setCustomYear] = useState<number>(new Date().getFullYear());
  const [powertrain, setPowertrain] = useState<PowertrainType>('Petrol');
  const [nickname, setNickname] = useState('');
  const [odometer, setOdometer] = useState<number>(10000);
  const [odometerUnit, setOdometerUnit] = useState<OdometerUnit>('km');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredCatalogCars = VEHICLES.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      v.model.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.powertrain.toLowerCase().includes(q)
    );
  }).slice(0, 12);

  const handleSelectCatalog = (v: Vehicle) => {
    setSelectedCatalogCar(v);
    setCustomMake(v.brand);
    setCustomModel(v.model);
    setCustomYear(v.modelYear);
    // map powertrain
    const p = v.powertrain.toLowerCase();
    if (p.includes('electric')) setPowertrain('Electric');
    else if (p.includes('plug-in')) setPowertrain('Plug-in Hybrid');
    else if (p.includes('hybrid')) setPowertrain('Hybrid');
    else if (p.includes('diesel')) setPowertrain('Diesel');
    else setPowertrain('Petrol');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (method === 'catalog' && !selectedCatalogCar) {
      setError('Please select a vehicle from the AutoVerse catalog.');
      return;
    }

    const make = method === 'catalog' ? selectedCatalogCar!.brand : customMake.trim();
    const model = method === 'catalog' ? selectedCatalogCar!.model : customModel.trim();

    if (!make || !model) {
      setError('Vehicle manufacturer and model are required.');
      return;
    }

    if (isNaN(odometer) || odometer < 0) {
      setError('Please enter a valid current odometer reading.');
      return;
    }

    const priceNum = purchasePrice.trim() ? parseFloat(purchasePrice) : undefined;

    const photo =
      method === 'catalog'
        ? selectedCatalogCar!.thumbnail
        : customPhotoUrl.trim() ||
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80';

    addOwnedVehicle({
      userId,
      vehicleSlug: method === 'catalog' ? selectedCatalogCar!.slug : undefined,
      isCustom: method === 'custom',
      make,
      model,
      variant:
        method === 'catalog'
          ? selectedCatalogCar!.variant || undefined
          : customVariant.trim() || undefined,
      year: customYear || 2024,
      powertrain,
      nickname: nickname.trim() || undefined,
      currentOdometer: Number(odometer),
      odometerUnit,
      odometerLastUpdated: new Date().toISOString(),
      purchaseDate: purchaseDate || undefined,
      purchasePrice: priceNum,
      currency,
      photoUrl: photo,
      licensePlate: licensePlate.trim() || undefined,
    });

    onVehicleAdded();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#0c1017',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 1.75rem',
            borderBottom: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-cyan">STAGE 11 OWNERSHIP</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                VERIFIED REGISTRATION
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#ffffff', fontWeight: 800 }}>
              Add Vehicle to My Garage
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Method Switcher */}
        <div
          style={{
            padding: '1.25rem 1.75rem 0.5rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
          }}
        >
          <button
            type="button"
            onClick={() => setMethod('catalog')}
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border: `2px solid ${method === 'catalog' ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
              backgroundColor: method === 'catalog' ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <Sparkles size={20} color={method === 'catalog' ? 'var(--accent-cyan)' : 'var(--text-secondary)'} />
            <div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
                Method A: Select from AutoVerse
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                Pick from 50 verified vehicles (Tata, Mahindra, Porsche, Tesla, BMW, etc.)
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMethod('custom')}
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border: `2px solid ${method === 'custom' ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
              backgroundColor: method === 'custom' ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <Car size={20} color={method === 'custom' ? 'var(--accent-cyan)' : 'var(--text-secondary)'} />
            <div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
                Method B: Add Custom Vehicle
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                Record any personal vehicle not in public catalog
              </div>
            </div>
          </button>
        </div>

        {error && (
          <div
            style={{
              margin: '1rem 1.75rem 0',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              borderRadius: '8px',
              color: '#f43f5e',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.75rem 1.75rem' }}>
          {method === 'catalog' ? (
            <div>
              {/* Search catalog */}
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search catalog (e.g. Tata Curvv, Safari, Mahindra Thar, Porsche, Tesla)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              {/* Grid of catalog cars */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.75rem',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  marginBottom: '1.5rem',
                  padding: '0.25rem',
                }}
              >
                {filteredCatalogCars.map((v) => {
                  const isSelected = selectedCatalogCar?.id === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => handleSelectCatalog(v)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-light)'}`,
                        backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ height: '70px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                        <img
                          src={v.thumbnail}
                          alt={v.model}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                        {v.brand.toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>{v.model}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {v.modelYear} • {v.powertrain}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedCatalogCar && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(0, 240, 255, 0.08)',
                    border: '1px solid var(--accent-cyan)',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="var(--accent-cyan)" />
                    <div>
                      <span style={{ color: '#ffffff', fontWeight: 700 }}>
                        {selectedCatalogCar.modelYear} {selectedCatalogCar.brand} {selectedCatalogCar.model}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                        ({selectedCatalogCar.powertrain})
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-cyan">{selectedCatalogCar.bodyType.toUpperCase()}</span>
                </div>
              )}
            </div>
          ) : (
            /* Custom Form Fields */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  Manufacturer / Make *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata, Mahindra, Ford"
                  value={customMake}
                  onChange={(e) => setCustomMake(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  Model *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Harrier, Scorpio, Mustang"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  Trim / Variant (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fearless Plus Dark Edition"
                  value={customVariant}
                  onChange={(e) => setCustomVariant(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  Model Year *
                </label>
                <input
                  type="number"
                  min={1960}
                  max={2030}
                  value={customYear}
                  onChange={(e) => setCustomYear(parseInt(e.target.value) || 2024)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  Powertrain Type *
                </label>
                <select
                  value={powertrain}
                  onChange={(e) => setPowertrain(e.target.value as PowertrainType)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                >
                  <option value="Electric">Electric (BEV)</option>
                  <option value="Petrol">Petrol / Gasoline (ICE)</option>
                  <option value="Diesel">Diesel (Turbo)</option>
                  <option value="Hybrid">Strong Hybrid (HEV)</option>
                  <option value="Plug-in Hybrid">Plug-in Hybrid (PHEV)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  Custom Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={customPhotoUrl}
                  onChange={(e) => setCustomPhotoUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                />
              </div>
            </div>
          )}

          {/* Ownership Details (Common to both Methods) */}
          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-light)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Current Odometer *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  min={0}
                  required
                  value={odometer}
                  onChange={(e) => setOdometer(parseInt(e.target.value) || 0)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                />
                <select
                  value={odometerUnit}
                  onChange={(e) => setOdometerUnit(e.target.value as OdometerUnit)}
                  style={{
                    width: '80px',
                    padding: '0.65rem 0.5rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                >
                  <option value="km">km</option>
                  <option value="mi">mi</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Vehicle Nickname (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Daily Cruiser, Beast"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#131923',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  color: '#ffffff',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Purchase Date (Optional)
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#131923',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  color: '#ffffff',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Purchase Price (Optional)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 45000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  style={{
                    width: '90px',
                    padding: '0.65rem 0.5rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                License Plate / Private Reg (Optional)
              </label>
              <input
                type="text"
                placeholder="Private — Never shared publicly"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#131923',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  color: '#ffffff',
                }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.65rem 1.25rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Plus size={16} /> Save Vehicle to Garage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
