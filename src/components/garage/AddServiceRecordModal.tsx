import React, { useState } from 'react';
import type { OwnedVehicle, CurrencyCode } from '../../types/ownership';
import { addServiceRecord } from '../../utils/ownershipStore';
import { X, Plus, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  userId: string;
  vehicles: OwnedVehicle[];
  defaultVehicleId?: string;
  isOpen: boolean;
  onClose: () => void;
  onRecordAdded: () => void;
}

export const AddServiceRecordModal: React.FC<Props> = ({
  userId,
  vehicles,
  defaultVehicleId,
  isOpen,
  onClose,
  onRecordAdded,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    defaultVehicleId || vehicles[0]?.id || ''
  );

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<number>(selectedVehicle?.currentOdometer || 10000);
  const [category, setCategory] = useState<any>('routine_service');
  const [workPerformed, setWorkPerformed] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [serviceProvider, setServiceProvider] = useState('');
  const [cost, setCost] = useState<string>('150');
  const [currency, setCurrency] = useState<CurrencyCode>(selectedVehicle?.currency || 'USD');
  const [nextRec, setNextRec] = useState('');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate 10MB max
    if (file.size > 10 * 1024 * 1024) {
      setError('Receipt file size exceeds 10MB limit.');
      return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or image receipt (PNG/JPG).');
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedVehicle) {
      setError('Please select an owned vehicle.');
      return;
    }

    if (!workPerformed.trim()) {
      setError('Please describe the work performed.');
      return;
    }

    if (!serviceProvider.trim()) {
      setError('Please specify the service center or technician.');
      return;
    }

    const costNum = parseFloat(cost);
    if (isNaN(costNum) || costNum < 0) {
      setError('Please enter a valid cost.');
      return;
    }

    addServiceRecord({
      userId,
      ownedVehicleId: selectedVehicle.id,
      serviceDate,
      odometer: Number(odometer),
      odometerUnit: selectedVehicle.odometerUnit,
      category,
      workPerformed: workPerformed.trim(),
      partsReplaced: partsReplaced.trim() || undefined,
      serviceProvider: serviceProvider.trim(),
      cost: costNum,
      currency,
      nextServiceRecommendation: nextRec.trim() || undefined,
      notes: notes.trim() || undefined,
      receiptAttachmentName: fileName || undefined,
      receiptAttachmentSize: fileSize || undefined,
      isVerifiedByServiceCenter: isVerified,
    });

    onRecordAdded();
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
          maxWidth: '680px',
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
              VERIFIED SERVICE LEDGER
            </span>
            <h2 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 800 }}>
              Add Service Record
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
                if (veh) {
                  setOdometer(veh.currentOdometer);
                  setCurrency(veh.currency);
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
                  {v.year} {v.make} {v.model} ({v.powertrain})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Service Date *
              </label>
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Category *
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
                <option value="routine_service">Scheduled Routine Service</option>
                <option value="repairs">Mechanical / Electrical Repairs</option>
                <option value="tyres">Tyres & Wheel Balancing</option>
                <option value="battery">Battery / High-Voltage Care</option>
                <option value="inspections">Periodic Inspection & MOT</option>
                <option value="parts">Parts Upgrade / Replacement</option>
                <option value="other">Other Service Work</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Service Provider / Dealership *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Official Dealer, Certified Independent"
                value={serviceProvider}
                onChange={(e) => setServiceProvider(e.target.value)}
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
              Work Performed *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 20,000 km Major Service, Front Brake Pads, Brake Fluid Flush"
              value={workPerformed}
              onChange={(e) => setWorkPerformed(e.target.value)}
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
                Parts Replaced / Installed (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. OEM Carbon-Ceramic Pads, Cabin Filter"
                value={partsReplaced}
                onChange={(e) => setPartsReplaced(e.target.value)}
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
                Total Cost *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Next Service Recommendation (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Inspect brake fluid in 6 months"
                value={nextRec}
                onChange={(e) => setNextRec(e.target.value)}
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
                Technician Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Software update applied, multi-point check OK"
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
          </div>

          {/* Secure Receipt Upload */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed var(--border-medium)',
              borderRadius: '8px',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 600 }}>
                  Private Invoice / Receipt Attachment
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  Securely stored. Accessible only by vehicle owner. Max 10MB (PDF, PNG, JPG).
                </div>
              </div>
              <label
                className="btn btn-secondary"
                style={{
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.75rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Upload size={14} /> Upload File
                <input
                  type="file"
                  accept="image/png,image/jpeg,application/pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            {fileName && (
              <div
                style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.8rem',
                }}
              >
                <CheckCircle2 size={14} /> {fileName} ({(fileSize! / 1024).toFixed(0)} KB)
              </div>
            )}
          </div>

          {/* Service verification toggle */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                style={{ accentColor: 'var(--accent-cyan)' }}
              />
              Mark as authorized dealer invoice (Requires certified stamp/seal)
            </label>
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
              <Plus size={16} /> Save Service Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
