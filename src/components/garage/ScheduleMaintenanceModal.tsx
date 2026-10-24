import React, { useState } from 'react';
import type { OwnedVehicle, CurrencyCode } from '../../types/ownership';
import { addMaintenanceTask } from '../../utils/ownershipStore';
import { X, Plus, AlertCircle } from 'lucide-react';

interface Props {
  userId: string;
  vehicles: OwnedVehicle[];
  defaultVehicleId?: string;
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
}

export const ScheduleMaintenanceModal: React.FC<Props> = ({
  userId,
  vehicles,
  defaultVehicleId,
  isOpen,
  onClose,
  onTaskAdded,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    defaultVehicleId || vehicles[0]?.id || ''
  );

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState<any>('scheduled_service');
  const [dueDate, setDueDate] = useState('');
  const [dueOdometer, setDueOdometer] = useState<string>('');
  const [estimatedCost, setEstimatedCost] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>(selectedVehicle?.currency || 'USD');
  const [provider, setProvider] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
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

    if (!taskName.trim()) {
      setError('Please provide a maintenance task name.');
      return;
    }

    if (!dueDate && !dueOdometer) {
      setError('Please specify either a next due date or a next due odometer threshold.');
      return;
    }

    const odoNum = dueOdometer.trim() ? parseInt(dueOdometer) : undefined;
    const costNum = estimatedCost.trim() ? parseFloat(estimatedCost) : undefined;

    addMaintenanceTask({
      userId,
      ownedVehicleId: selectedVehicle.id,
      taskName: taskName.trim(),
      category,
      nextDueDate: dueDate || undefined,
      nextDueOdometer: odoNum,
      estimatedCost: costNum,
      currency,
      serviceProvider: provider.trim() || undefined,
      reminderEnabled,
      isCompleted: false,
      notes: notes.trim() || undefined,
    });

    onTaskAdded();
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
              SCHEDULED CARE
            </span>
            <h2 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 800 }}>
              Schedule Maintenance Task
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
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              Vehicle *
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => {
                const vid = e.target.value;
                setSelectedVehicleId(vid);
                const veh = vehicles.find((v) => v.id === vid);
                if (veh) setCurrency(veh.currency);
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
                  {v.year} {v.make} {v.model} ({v.currentOdometer.toLocaleString()} {v.odometerUnit})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              Task Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Synthetic Oil & Filter Service, Brake Fluid Flush"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Maintenance Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#131923',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  color: '#ffffff',
                }}
              >
                <option value="scheduled_service">Scheduled Servicing</option>
                <option value="oil_change">Oil & Filter Change</option>
                <option value="brake_inspection">Brake Inspection & Pads</option>
                <option value="tyre_rotation">Tyre Check & Rotation</option>
                <option value="battery_check">12V / Battery Inspection</option>
                <option value="ev_charging_system">EV High-Voltage System Check</option>
                <option value="coolant_fluids">Coolant & Fluid Top-up</option>
                <option value="other">Custom Manufacturer Item</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Preferred Provider (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Authorized Dealership"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Next Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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
                Next Due Odometer ({selectedVehicle?.odometerUnit || 'km'})
              </label>
              <input
                type="number"
                min={0}
                placeholder={`e.g. ${(selectedVehicle?.currentOdometer || 10000) + 5000}`}
                value={dueOdometer}
                onChange={(e) => setDueOdometer(e.target.value)}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Estimated Cost (Optional)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 180"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
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

            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  style={{ accentColor: 'var(--accent-cyan)' }}
                />
                Enable In-App Reminder
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              Notes & Technical Guidelines (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Ensure low SAPS oil standard, inspect serpentine belt"
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
              <Plus size={16} /> Schedule Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
