// AutoVerse Stage 18: Admin Price Observations Repository Manager
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  PlusCircle,
  ExternalLink,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import {
  getAllPriceRecords,
  addPriceRecord,
  updatePriceRecord,
  deletePriceRecord,
} from '../../utils/marketStore';
import { formatCurrency } from '../../utils/tcoCalculator';
import type { VehiclePriceRecord, PriceStatus, PriceType } from '../../types/market';
import type { CurrencyCode } from '../../types/calculator';
import { VEHICLES } from '../../data/vehicles';

export const AdminMarketPricesPage: React.FC = () => {
  const [records, setRecords] = useState<VehiclePriceRecord[]>(getAllPriceRecords());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCurrency, setFilterCurrency] = useState<string>('all');

  // Modal State for Edit / Add
  const [editingRecord, setEditingRecord] = useState<VehiclePriceRecord | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New Record Form State
  const [newVehicleSlug, setNewVehicleSlug] = useState('porsche-taycan-turbo-s');
  const [newAmount, setNewAmount] = useState<number>(209000);
  const [newCurrency, setNewCurrency] = useState<CurrencyCode>('USD');
  const [newPriceType, setNewPriceType] = useState<PriceType>('ex_showroom');
  const [newEffectiveDate, setNewEffectiveDate] = useState('2024-10-01');
  const [newSourceName, setNewSourceName] = useState('Manufacturer Official Release');
  const [newSourceUrl, setNewSourceUrl] = useState('https://newsroom.porsche.com');

  const filtered = records.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        r.vehicleName.toLowerCase().includes(q) ||
        r.brand.toLowerCase().includes(q) ||
        r.variant.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterCurrency !== 'all' && r.currency !== filterCurrency) return false;
    return true;
  });

  const handleSaveEdit = () => {
    if (!editingRecord) return;
    updatePriceRecord(editingRecord.id, editingRecord);
    setRecords(getAllPriceRecords());
    setEditingRecord(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this price observation?')) {
      deletePriceRecord(id);
      setRecords(getAllPriceRecords());
    }
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = VEHICLES.find((v) => v.id === newVehicleSlug);

    const record: VehiclePriceRecord = {
      id: `pr_man_${Date.now()}`,
      vehicleId: newVehicleSlug,
      vehicleSlug: newVehicleSlug,
      vehicleName: vehicle?.name || newVehicleSlug,
      brand: vehicle?.brand || 'AutoVerse Verified',
      model: vehicle?.model || newVehicleSlug,
      variant: vehicle?.variant || 'Standard',
      powertrain: vehicle?.powertrain || 'electric',
      bodyType: vehicle?.bodyType || 'sedan',
      market: newCurrency === 'INR' ? 'India' : 'United States',
      country: newCurrency === 'INR' ? 'India' : 'United States',
      currency: newCurrency,
      priceType: newPriceType,
      amount: Number(newAmount),
      effectiveDate: newEffectiveDate,
      sourceName: newSourceName,
      sourceUrl: newSourceUrl,
      verificationDate: new Date().toISOString().split('T')[0],
      collectionTimestamp: new Date().toISOString(),
      taxBasis: newCurrency === 'INR' ? 'ex_showroom' : 'msrp',
      status: 'active',
      provenance: 'Administrative Manual Observation Filing',
    };

    addPriceRecord(record);
    setRecords(getAllPriceRecords());
    setIsAddingNew(false);
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <Link
            to="/admin/market-data"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              textDecoration: 'none',
              marginBottom: '0.5rem',
            }}
          >
            <ArrowLeft size={14} /> Back to Terminal Overview
          </Link>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff' }}>
            Price Observations Repository
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Audit, edit, supersede, or create verified automotive price records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingNew(true)}
          className="btn btn-primary"
          style={{ fontSize: '0.85rem' }}
        >
          <PlusCircle size={15} />
          <span>Add New Price Observation</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: '14px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="var(--accent-cyan)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by vehicle or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.4rem',
              backgroundColor: '#0c1017',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem',
            }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '0.55rem 0.75rem',
            backgroundColor: '#0c1017',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '0.82rem',
          }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="superseded">Superseded</option>
          <option value="corrected">Corrected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>

        <select
          value={filterCurrency}
          onChange={(e) => setFilterCurrency(e.target.value)}
          style={{
            padding: '0.55rem 0.75rem',
            backgroundColor: '#0c1017',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '0.82rem',
          }}
        >
          <option value="all">All Currencies</option>
          <option value="USD">USD ($)</option>
          <option value="INR">INR (₹)</option>
        </select>
      </div>

      {/* Observations Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Vehicle & Variant</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Market</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Price Type</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Effective</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Source</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.75rem 1rem', color: '#ffffff', fontWeight: 700 }}>
                  <div>{r.vehicleName}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{r.variant}</div>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                  {r.market}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                  {r.priceType}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(r.amount, r.currency)}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {r.effectiveDate}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span
                    style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      backgroundColor:
                        r.status === 'active'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : r.status === 'superseded'
                          ? 'rgba(148, 163, 184, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                      color:
                        r.status === 'active'
                          ? '#34d399'
                          : r.status === 'superseded'
                          ? '#94a3b8'
                          : '#f87171',
                    }}
                  >
                    {r.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <a
                    href={r.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}
                  >
                    <span>{r.sourceName.slice(0, 18)}...</span>
                    <ExternalLink size={11} />
                  </a>
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setEditingRecord(r)}
                      title="Edit Record"
                      style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      title="Delete Record"
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '2rem',
              width: '100%',
              maxWidth: '520px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                Edit Price Observation
              </h3>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Vehicle: {editingRecord.vehicleName} ({editingRecord.variant})
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Price Amount ({editingRecord.currency})
                </label>
                <input
                  type="number"
                  value={editingRecord.amount}
                  onChange={(e) => setEditingRecord({ ...editingRecord, amount: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Status
                </label>
                <select
                  value={editingRecord.status}
                  onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value as PriceStatus })}
                  style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff' }}
                >
                  <option value="active">Active</option>
                  <option value="superseded">Superseded</option>
                  <option value="corrected">Corrected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Effective Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={editingRecord.effectiveDate}
                  onChange={(e) => setEditingRecord({ ...editingRecord, effectiveDate: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Correction or Provenance Note
                </label>
                <input
                  type="text"
                  value={editingRecord.provenance || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, provenance: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditingRecord(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveEdit} className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Observation Modal */}
      {isAddingNew && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <form
            onSubmit={handleCreateNew}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '2rem',
              width: '100%',
              maxWidth: '540px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                Create New Price Observation
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Select Vehicle Model
                </label>
                <select
                  value={newVehicleSlug}
                  onChange={(e) => setNewVehicleSlug(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff' }}
                >
                  {VEHICLES.map((v) => (
                    <option key={v.id} value={v.id} style={{ backgroundColor: '#0c1017' }}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Currency
                  </label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value as any)}
                    style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff' }}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Price Amount
                  </label>
                  <input
                    type="number"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Price Type
                  </label>
                  <select
                    value={newPriceType}
                    onChange={(e) => setNewPriceType(e.target.value as any)}
                    style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff' }}
                  >
                    <option value="ex_showroom">Ex-Showroom</option>
                    <option value="launch_price">Verified Launch Price</option>
                    <option value="dealer_listed">Dealer Listed</option>
                    <option value="estimated_on_road">Estimated On-Road</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Effective Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newEffectiveDate}
                    onChange={(e) => setNewEffectiveDate(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Source Name
                </label>
                <input
                  type="text"
                  required
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Source URL
                </label>
                <input
                  type="url"
                  required
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsAddingNew(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Observation
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
