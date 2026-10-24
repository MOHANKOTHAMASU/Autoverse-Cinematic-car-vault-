import React, { useState } from 'react';
import type { OwnedVehicle, FuelVolumeUnit, CurrencyCode } from '../../types/ownership';
import { addFuelChargingLog } from '../../utils/ownershipStore';
import { X, Fuel, Zap, Plus, AlertCircle } from 'lucide-react';

interface Props {
  userId: string;
  vehicles: OwnedVehicle[];
  defaultVehicleId?: string;
  isOpen: boolean;
  onClose: () => void;
  onLogAdded: () => void;
}

export const LogFuelChargingModal: React.FC<Props> = ({
  userId,
  vehicles,
  defaultVehicleId,
  isOpen,
  onClose,
  onLogAdded,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    defaultVehicleId || vehicles[0]?.id || ''
  );

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const initialType = selectedVehicle?.powertrain === 'Electric' ? 'charge' : 'fuel';
  const [logType, setLogType] = useState<'fuel' | 'charge'>(initialType);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<number>(selectedVehicle?.currentOdometer || 10000);
  const [fuelQuantity, setFuelQuantity] = useState<string>('45');
  const [fuelUnit, setFuelUnit] = useState<FuelVolumeUnit>('liters');
  const [fullTank, setFullTank] = useState(true);

  const [energyKwh, setEnergyKwh] = useState<string>('55.0');
  const [chargingLocation, setChargingLocation] = useState<'home' | 'public' | 'workplace'>('home');
  const [chargingProvider, setChargingProvider] = useState('Home Wallbox AC');

  const [totalCost, setTotalCost] = useState<string>('65');
  const [currency, setCurrency] = useState<CurrencyCode>(selectedVehicle?.currency || 'USD');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedVehicle) {
      setError('Please select an owned vehicle.');
      return;
    }

    const costNum = parseFloat(totalCost);
    if (isNaN(costNum) || costNum < 0) {
      setError('Please enter a valid expense cost.');
      return;
    }

    if (isNaN(odometer) || odometer < 0) {
      setError('Please enter a valid odometer reading.');
      return;
    }

    if (logType === 'fuel') {
      const qtyNum = parseFloat(fuelQuantity);
      if (isNaN(qtyNum) || qtyNum <= 0) {
        setError('Please enter a valid fuel quantity.');
        return;
      }

      addFuelChargingLog({
        userId,
        ownedVehicleId: selectedVehicle.id,
        date,
        odometer: Number(odometer),
        odometerUnit: selectedVehicle.odometerUnit,
        type: 'fuel',
        fuelQuantity: qtyNum,
        fuelUnit,
        fullTank,
        totalCost: costNum,
        currency,
        notes: notes.trim() || undefined,
      });
    } else {
      const kwhNum = parseFloat(energyKwh);
      if (isNaN(kwhNum) || kwhNum <= 0) {
        setError('Please enter valid energy in kWh.');
        return;
      }

      addFuelChargingLog({
        userId,
        ownedVehicleId: selectedVehicle.id,
        date,
        odometer: Number(odometer),
        odometerUnit: selectedVehicle.odometerUnit,
        type: 'charge',
        energyAddedKwh: kwhNum,
        chargingLocation,
        chargingProvider: chargingProvider.trim() || undefined,
        totalCost: costNum,
        currency,
        notes: notes.trim() || undefined,
      });
    }

    onLogAdded();
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
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span className="badge badge-cyan" style={{ marginBottom: '0.25rem' }}>
              TELEMETRY & EFFICIENCY LOG
            </span>
            <h2 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 800 }}>
              Record Fill-up or EV Charge
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.4rem',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              margin: '1rem 1.5rem 0',
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

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem' }}>
          {/* Select Vehicle */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              Select Owned Vehicle *
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => {
                const vid = e.target.value;
                setSelectedVehicleId(vid);
                const veh = vehicles.find((v) => v.id === vid);
                if (veh) {
                  setOdometer(veh.currentOdometer);
                  setCurrency(veh.currency);
                  setLogType(veh.powertrain === 'Electric' ? 'charge' : 'fuel');
                }
              }}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: '#131923',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                color: '#ffffff',
              }}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.make} {v.model} ({v.powertrain}) — {v.currentOdometer.toLocaleString()} {v.odometerUnit}
                </option>
              ))}
            </select>
          </div>

          {/* Type Toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setLogType('fuel')}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${logType === 'fuel' ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
                backgroundColor: logType === 'fuel' ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                color: logType === 'fuel' ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 600,
              }}
            >
              <Fuel size={16} /> Fuel Fill-up (Petrol / Diesel)
            </button>

            <button
              type="button"
              onClick={() => setLogType('charge')}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${logType === 'charge' ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
                backgroundColor: logType === 'charge' ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                color: logType === 'charge' ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 600,
              }}
            >
              <Zap size={16} /> EV Charging Session
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
                Odometer Reading ({selectedVehicle?.odometerUnit || 'km'}) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={odometer}
                onChange={(e) => setOdometer(parseInt(e.target.value) || 0)}
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

          {logType === 'fuel' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  Fuel Quantity *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={fuelQuantity}
                    onChange={(e) => setFuelQuantity(e.target.value)}
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
                    value={fuelUnit}
                    onChange={(e) => setFuelUnit(e.target.value as FuelVolumeUnit)}
                    style={{
                      width: '90px',
                      padding: '0.65rem 0.5rem',
                      backgroundColor: '#131923',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  >
                    <option value="liters">Liters</option>
                    <option value="gallons">Gallons</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={fullTank}
                    onChange={(e) => setFullTank(e.target.checked)}
                    style={{ accentColor: 'var(--accent-cyan)' }}
                  />
                  Full Tank Fill-up (Accurate Economy)
                </label>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  Energy Added (kWh) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  required
                  placeholder="e.g. 52.5"
                  value={energyKwh}
                  onChange={(e) => setEnergyKwh(e.target.value)}
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
                  Charging Location
                </label>
                <select
                  value={chargingLocation}
                  onChange={(e) => setChargingLocation(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#131923',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                  }}
                >
                  <option value="home">Home (AC Wallbox)</option>
                  <option value="public">Public Fast DC Charger</option>
                  <option value="workplace">Workplace Destination</option>
                </select>
              </div>
            </div>
          )}

          {/* Cost & Currency */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Total Cost *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
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
                {logType === 'charge' ? 'Provider / Station Network' : 'Brand / Station Name'}
              </label>
              <input
                type="text"
                placeholder={logType === 'charge' ? 'e.g. Tesla Supercharger, Tata Power' : 'e.g. Shell, IndianOil, BP'}
                value={chargingProvider}
                onChange={(e) => setChargingProvider(e.target.value)}
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

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Highway road trip fill-up, smooth charging curve"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
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
              <Plus size={16} /> Save Telemetry Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
