// AutoVerse Stage 7: Manufacturer & OEM Marque Management
// Manage brand profiles, flagships, vehicle associations, with referential integrity protection

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Car,
  Save,
  X,
} from 'lucide-react';
import {
  getAdminManufacturers,
  saveAdminManufacturer,
  deleteManufacturer,
  getAdminVehicles,
} from '../../utils/adminStore';
import type { Manufacturer } from '../../types';

export const AdminManufacturersPage: React.FC = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [vehicleCounts, setVehicleCounts] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMarque, setEditingMarque] = useState<Manufacturer | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadData = () => {
    const list = getAdminManufacturers();
    setManufacturers(list);

    const vehicles = getAdminVehicles();
    const counts: Record<string, number> = {};
    vehicles.forEach((v) => {
      const key = v.brand.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    setVehicleCounts(counts);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('autoverse_manufacturers_updated', loadData);
    window.addEventListener('autoverse_vehicles_updated', loadData);
    return () => {
      window.removeEventListener('autoverse_manufacturers_updated', loadData);
      window.removeEventListener('autoverse_vehicles_updated', loadData);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingMarque({
      id: `marque_${Date.now()}`,
      name: '',
      country: 'Germany',
      founded: 1950,
      headquarters: '',
      tagline: '',
      description: '',
      flagshipFocus: '',
      brandColor: '#06b6d4',
      accentRgb: '6, 182, 212',
      verifiedModelsCount: 0,
      officialWebsite: 'https://',
    });
    setDeleteError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Manufacturer) => {
    setEditingMarque({ ...m });
    setDeleteError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMarque || !editingMarque.name.trim()) return;

    const payload: Manufacturer = {
      ...editingMarque,
      id: editingMarque.id.startsWith('marque_')
        ? editingMarque.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : editingMarque.id,
    };

    saveAdminManufacturer(payload);
    setIsModalOpen(false);
    showToast(`Marque "${payload.name}" saved successfully.`);
  };

  const handleDelete = (id: string) => {
    setDeleteError(null);
    const res = deleteManufacturer(id);
    if (!res.success) {
      setDeleteError(res.message);
    } else {
      showToast('Manufacturer deleted successfully.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '5rem',
            right: '2rem',
            zIndex: 10000,
            backgroundColor: '#090c12',
            border: '1px solid var(--accent-cyan)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
            color: '#ffffff',
            padding: '0.85rem 1.4rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <CheckCircle2 size={16} color="var(--accent-cyan)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Integrity Error Banner */}
      {deleteError && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            color: '#f8fafc',
          }}
        >
          <ShieldAlert size={20} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--accent-red)' }}>Referential Integrity Error: </strong>
            {deleteError}
          </div>
          <button
            onClick={() => setDeleteError(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.3rem', color: '#ffffff' }}>
            Marques & OEM Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Configure automotive manufacturer heritage, engineering focus, and official links.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} />
          <span>Add Marque</span>
        </button>
      </div>

      {/* Marque Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {manufacturers.map((m) => {
          const linkedCount = vehicleCounts[m.name.toLowerCase()] || 0;
          return (
            <div
              key={m.id}
              style={{
                backgroundColor: 'rgba(15, 20, 28, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
              }}
            >
              {/* Brand Color Indicator */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '1.5rem',
                  right: '1.5rem',
                  height: '2px',
                  backgroundColor: m.brandColor || 'var(--accent-cyan)',
                  borderRadius: '2px',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.2rem' }}>
                    {m.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {m.headquarters || m.country} · Founded {m.founded}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleOpenEdit(m)}
                    title="Edit Marque"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#60a5fa',
                      cursor: 'pointer',
                      padding: '0.35rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(m.id)}
                    title="Delete Marque"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-red)',
                      cursor: 'pointer',
                      padding: '0.35rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Tagline & Focus */}
              <div>
                <div style={{ fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  "{m.tagline}"
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {m.flagshipFocus}
                </div>
              </div>

              {/* Stats Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '0.75rem',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)' }}>
                  <Car size={15} />
                  <span>
                    <strong>{linkedCount}</strong> Linked Vehicles
                  </span>
                </div>

                {m.officialWebsite && (
                  <a
                    href={m.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span>Website</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Edit / Add Marque */}
      {isModalOpen && editingMarque && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(3, 5, 8, 0.85)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#0c1017',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                {manufacturers.some((m) => m.id === editingMarque.id) ? 'Edit Marque' : 'Add New Marque'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ flex: 1, overflowY: 'auto', padding: '1.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Manufacturer Name *
                  </label>
                  <input
                    type="text"
                    value={editingMarque.name}
                    onChange={(e) => setEditingMarque({ ...editingMarque, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={editingMarque.country}
                    onChange={(e) => setEditingMarque({ ...editingMarque, country: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Year Founded
                  </label>
                  <input
                    type="number"
                    value={editingMarque.founded}
                    onChange={(e) => setEditingMarque({ ...editingMarque, founded: parseInt(e.target.value) || 1900 })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Brand Accent Hex Color
                  </label>
                  <input
                    type="text"
                    value={editingMarque.brandColor}
                    onChange={(e) => setEditingMarque({ ...editingMarque, brandColor: e.target.value })}
                    placeholder="#d97706"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Official Tagline
                  </label>
                  <input
                    type="text"
                    value={editingMarque.tagline}
                    onChange={(e) => setEditingMarque({ ...editingMarque, tagline: e.target.value })}
                    placeholder="e.g. There Is No Substitute."
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Flagship Engineering Focus
                  </label>
                  <input
                    type="text"
                    value={editingMarque.flagshipFocus}
                    onChange={(e) => setEditingMarque({ ...editingMarque, flagshipFocus: e.target.value })}
                    placeholder="e.g. Pure Sports Dynamics & 800V E-Performance"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Official Corporate Website URL
                  </label>
                  <input
                    type="url"
                    value={editingMarque.officialWebsite}
                    onChange={(e) => setEditingMarque({ ...editingMarque, officialWebsite: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: '1.75rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '1.25rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Save size={15} />
                  <span>Save Marque</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
