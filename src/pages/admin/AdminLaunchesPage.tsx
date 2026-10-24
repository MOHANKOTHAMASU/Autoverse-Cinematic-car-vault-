// AutoVerse Stage 7: Latest Launch Calendar Management
// Add, edit, verify, and publish automotive premieres and delivery schedules

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Save,
  X,
} from 'lucide-react';
import {
  getAdminLaunches,
  saveAdminLaunch,
  deleteAdminLaunch,
} from '../../utils/adminStore';
import type { LaunchItem } from '../../types';

export const AdminLaunchesPage: React.FC = () => {
  const [launches, setLaunches] = useState<LaunchItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLaunch, setEditingLaunch] = useState<LaunchItem | null>(null);

  const loadData = () => {
    setLaunches(getAdminLaunches());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('autoverse_launches_updated', loadData);
    return () => window.removeEventListener('autoverse_launches_updated', loadData);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingLaunch({
      id: `launch_${Date.now()}`,
      vehicleName: '',
      manufacturer: 'Porsche',
      model: '',
      variant: '',
      modelYear: 2026,
      announcementDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      marketLaunchDate: 'Autumn 2025',
      expectedDelivery: 'Q4 2025',
      market: 'Global Market',
      status: 'upcoming',
      startingPrice: 180000,
      currency: 'USD',
      headline: 'Next-Generation Ultra-Performance Architecture',
      summary: 'Verified manufacturer technical briefing and aerodynamic presentation.',
      sourceUrl: 'https://newsroom.porsche.com',
      sourceName: 'Manufacturer Press Wire',
      image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
      lastVerifiedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (l: LaunchItem) => {
    setEditingLaunch({ ...l });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLaunch || !editingLaunch.vehicleName.trim()) return;

    saveAdminLaunch(editingLaunch);
    setIsModalOpen(false);
    showToast(`Launch entry for "${editingLaunch.vehicleName}" saved.`);
  };

  const handleDelete = (id: string) => {
    deleteAdminLaunch(id);
    showToast('Launch calendar entry deleted.');
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
            Latest Launch Calendar Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Curate world premieres, prototype showcases, and delivery timelines displayed on the public site.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} />
          <span>Post Launch</span>
        </button>
      </div>

      {/* Launches Table / List */}
      <div
        style={{
          backgroundColor: 'rgba(15, 20, 28, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Vehicle Premiere</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Manufacturer</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Announcement Date</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Expected Delivery</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>MSRP</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {launches.map((l) => (
                <tr
                  key={l.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={l.image}
                        alt={l.vehicleName}
                        style={{
                          width: '46px',
                          height: '32px',
                          borderRadius: '4px',
                          objectFit: 'cover',
                          backgroundColor: '#000',
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{l.vehicleName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.headline}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: '#ffffff', fontWeight: 600 }}>
                    {l.manufacturer}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {l.announcementDate}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    {l.expectedDelivery}
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(6, 182, 212, 0.15)',
                        color: 'var(--accent-cyan)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {l.status}
                    </span>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: '#ffffff', fontWeight: 600 }}>
                    {l.startingPrice ? `$${l.startingPrice.toLocaleString()}` : 'TBA'}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleOpenEdit(l)}
                        title="Edit Launch"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#60a5fa',
                          cursor: 'pointer',
                          padding: '0.35rem',
                        }}
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(l.id)}
                        title="Delete Launch"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-red)',
                          cursor: 'pointer',
                          padding: '0.35rem',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add / Edit Launch */}
      {isModalOpen && editingLaunch && (
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
              maxWidth: '650px',
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
                {launches.some((l) => l.id === editingLaunch.id) ? 'Edit Launch' : 'Post New Vehicle Premiere'}
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
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Vehicle Full Name *
                  </label>
                  <input
                    type="text"
                    value={editingLaunch.vehicleName}
                    onChange={(e) => setEditingLaunch({ ...editingLaunch, vehicleName: e.target.value })}
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
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    value={editingLaunch.manufacturer}
                    onChange={(e) => setEditingLaunch({ ...editingLaunch, manufacturer: e.target.value })}
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
                    Model Year
                  </label>
                  <input
                    type="number"
                    value={editingLaunch.modelYear}
                    onChange={(e) => setEditingLaunch({ ...editingLaunch, modelYear: parseInt(e.target.value) || 2026 })}
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
                    Announcement Date
                  </label>
                  <input
                    type="text"
                    value={editingLaunch.announcementDate}
                    onChange={(e) => setEditingLaunch({ ...editingLaunch, announcementDate: e.target.value })}
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
                    Expected Delivery Window
                  </label>
                  <input
                    type="text"
                    value={editingLaunch.expectedDelivery}
                    onChange={(e) => setEditingLaunch({ ...editingLaunch, expectedDelivery: e.target.value })}
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
                    Featured Headline
                  </label>
                  <input
                    type="text"
                    value={editingLaunch.headline}
                    onChange={(e) => setEditingLaunch({ ...editingLaunch, headline: e.target.value })}
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
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={editingLaunch.image}
                    onChange={(e) => setEditingLaunch({ ...editingLaunch, image: e.target.value })}
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
                    Summary / Datasheet Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editingLaunch.summary}
                    onChange={(e) => setEditingLaunch({ ...editingLaunch, summary: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontFamily: 'inherit',
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
                  <span>Save Launch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
