import React, { useState } from 'react';
import type { OwnedVehicle, ReminderType } from '../../types/ownership';
import { addReminder } from '../../utils/ownershipStore';
import { X, Plus, AlertCircle } from 'lucide-react';

interface Props {
  userId: string;
  vehicles: OwnedVehicle[];
  defaultVehicleId?: string;
  isOpen: boolean;
  onClose: () => void;
  onReminderAdded: () => void;
}

export const AddReminderModal: React.FC<Props> = ({
  userId,
  vehicles,
  defaultVehicleId,
  isOpen,
  onClose,
  onReminderAdded,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    defaultVehicleId || vehicles[0]?.id || ''
  );

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReminderType>('maintenance');
  const [dueDate, setDueDate] = useState('');
  const [dueOdometer, setDueOdometer] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedVehicle) {
      setError('Please select an owned vehicle.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a reminder title.');
      return;
    }

    if (!dueDate) {
      setError('Please specify a reminder date.');
      return;
    }

    const odoNum = dueOdometer.trim() ? parseInt(dueOdometer) : undefined;

    addReminder({
      userId,
      ownedVehicleId: selectedVehicle.id,
      title: title.trim(),
      type,
      dueDate,
      dueOdometer: odoNum,
      description: description.trim() || undefined,
      enabled: true,
      isCompleted: false,
    });

    onReminderAdded();
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
          maxWidth: '560px',
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
              PROACTIVE ALERTS
            </span>
            <h2 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 800 }}>
              Set Vehicle Reminder
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
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              Vehicle *
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
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
                  {v.year} {v.make} {v.model}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              Reminder Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Comprehensive Insurance Renewal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                Reminder Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ReminderType)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#131923',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  color: '#ffffff',
                }}
              >
                <option value="maintenance">Maintenance Due</option>
                <option value="insurance">Insurance Renewal</option>
                <option value="registration">Vehicle Registration / Inspection</option>
                <option value="tyre_check">Tyre Pressure & Tread Check</option>
                <option value="emissions">Emissions / PUC Renewal</option>
                <option value="custom">Custom Owner Note</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Due Date *
              </label>
              <input
                type="date"
                required
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
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              Due Odometer Threshold (Optional)
            </label>
            <input
              type="number"
              placeholder={`e.g. ${(selectedVehicle?.currentOdometer || 10000) + 5000} ${selectedVehicle?.odometerUnit || 'km'}`}
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

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              Description or Policy Number (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Policy #POL-99214 with Allianz. Check renewal discount with clean driving bonus."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: '#131923',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                color: '#ffffff',
                resize: 'none',
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
              <Plus size={16} /> Save Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
