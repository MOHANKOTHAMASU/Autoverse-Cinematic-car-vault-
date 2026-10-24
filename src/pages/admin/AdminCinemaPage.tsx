// AutoVerse Stage 7: Road Cinema Content Management
// Manage 4K driving reels, video CDN sources, anamorphic ratios, and telemetry highlights

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Play,
  CheckCircle2,
  Save,
  X,
} from 'lucide-react';
import {
  getAdminCinemaFilms,
  saveAdminCinemaFilm,
  deleteAdminCinemaFilm,
  getAdminVehicles,
} from '../../utils/adminStore';
import type { CinemaFilm } from '../../data/cinemaVideos';
import { CinemaPlayerModal } from '../../components/CinemaPlayerModal';

export const AdminCinemaPage: React.FC = () => {
  const [films, setFilms] = useState<CinemaFilm[]>([]);
  const [vehicles, setVehicles] = useState<{ slug: string; name: string }[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFilm, setEditingFilm] = useState<CinemaFilm | null>(null);

  // Preview Player Modal
  const [previewFilm, setPreviewFilm] = useState<CinemaFilm | null>(null);

  const loadData = () => {
    setFilms(getAdminCinemaFilms());
    const vs = getAdminVehicles();
    setVehicles(vs.map((v) => ({ slug: v.slug, name: `${v.brand} ${v.model} ${v.variant}` })));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('autoverse_cinema_updated', loadData);
    return () => window.removeEventListener('autoverse_cinema_updated', loadData);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingFilm({
      id: `film_${Date.now()}`,
      title: '',
      subtitle: '',
      category: 'Electric Performance',
      vehicle: 'Taycan Turbo S',
      vehicleSlug: 'porsche-taycan-turbo-s',
      manufacturer: 'Porsche',
      modelYear: 2025,
      duration: '03:30',
      durationSeconds: 210,
      location: 'Stelvio Pass, Italian Alps',
      description: 'Dynamic alpine switchback ascent capturing high-voltage torque and acoustic chassis transients.',
      directorNote: 'Filmed in 2.39:1 anamorphic ratio with high-speed gyroscopic chase rig.',
      aspectRatio: '21:9',
      poster: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1920&q=85',
      videoUrl: '/videos/cinema-reel.mp4',
      fallbackVideoUrl: '/videos/cinema-reel.mp4',
      highlightStats: [
        { label: '0–60 MPH', value: '2.3', unit: 'sec' },
        { label: 'System Output', value: '938', unit: 'HP' },
        { label: 'Voltage', value: '800V', unit: 'DC' },
      ],
      publicationStatus: 'published',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: CinemaFilm) => {
    setEditingFilm({ ...f });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFilm || !editingFilm.title.trim()) return;

    saveAdminCinemaFilm(editingFilm);
    setIsModalOpen(false);
    showToast(`Road Cinema reel "${editingFilm.title}" saved.`);
  };

  const handleDelete = (id: string) => {
    deleteAdminCinemaFilm(id);
    showToast('Cinema film removed.');
  };

  const handleTogglePublish = (film: CinemaFilm) => {
    const current = film.publicationStatus || 'published';
    const next = current === 'published' ? 'draft' : 'published';
    saveAdminCinemaFilm({ ...film, publicationStatus: next });
    showToast(`Reel status changed to ${next.toUpperCase()}`);
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
            Road Cinema Content Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Curate anamorphic automotive films, video CDN endpoints, locations, and telemetry HUD overlays.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} />
          <span>New Cinema Reel</span>
        </button>
      </div>

      {/* Cinema Films Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {films.map((f) => {
          const status = f.publicationStatus || 'published';
          return (
            <div
              key={f.id}
              style={{
                backgroundColor: 'rgba(15, 20, 28, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Poster & Play Trigger */}
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '21 / 9',
                  backgroundColor: '#000000',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={f.poster}
                  alt={f.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.7)',
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.75rem',
                    display: 'flex',
                    gap: '0.4rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: '#ffffff',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {f.duration} · {f.aspectRatio}
                  </span>

                  <button
                    onClick={() => handleTogglePublish(f)}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      backgroundColor:
                        status === 'published' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: status === 'published' ? '#10b981' : '#fbbf24',
                      border: `1px solid ${status === 'published' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {status}
                  </button>
                </div>

                {/* Direct Preview Play Button */}
                <button
                  onClick={() => setPreviewFilm(f)}
                  title="Preview Film Player"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(6, 182, 212, 0.85)',
                    border: 'none',
                    color: '#07090d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
                  }}
                >
                  <Play size={18} fill="#07090d" style={{ marginLeft: '2px' }} />
                </button>
              </div>

              {/* Reel Info */}
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.2rem' }}>
                    {f.title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    {f.vehicle} · {f.location}
                  </div>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {f.description}
                </p>

                {/* Footer Controls */}
                <div
                  style={{
                    marginTop: 'auto',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingTop: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Src: <code style={{ color: '#fff' }}>{f.videoUrl.slice(0, 24)}...</code>
                  </span>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => handleOpenEdit(f)}
                      title="Edit Film Reel"
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
                      onClick={() => handleDelete(f.id)}
                      title="Delete Reel"
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
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Edit / Add Film Reel */}
      {isModalOpen && editingFilm && (
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
              maxWidth: '680px',
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
                {films.some((f) => f.id === editingFilm.id) ? 'Edit Cinema Film' : 'Add New Cinema Reel'}
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
                    Film Title *
                  </label>
                  <input
                    type="text"
                    value={editingFilm.title}
                    onChange={(e) => setEditingFilm({ ...editingFilm, title: e.target.value })}
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
                    Linked Catalog Vehicle
                  </label>
                  <select
                    value={editingFilm.vehicleSlug}
                    onChange={(e) => {
                      const sel = vehicles.find((v) => v.slug === e.target.value);
                      setEditingFilm({
                        ...editingFilm,
                        vehicleSlug: e.target.value,
                        vehicle: sel?.name || editingFilm.vehicle,
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  >
                    {vehicles.map((v) => (
                      <option key={v.slug} value={v.slug}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingFilm.location}
                    onChange={(e) => setEditingFilm({ ...editingFilm, location: e.target.value })}
                    placeholder="e.g. Austrian Alps"
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
                    Video URL / Local Reel *
                  </label>
                  <input
                    type="text"
                    value={editingFilm.videoUrl}
                    onChange={(e) => setEditingFilm({ ...editingFilm, videoUrl: e.target.value })}
                    required
                    placeholder="/videos/cinema-reel.mp4"
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
                    Aspect Ratio
                  </label>
                  <select
                    value={editingFilm.aspectRatio}
                    onChange={(e) => setEditingFilm({ ...editingFilm, aspectRatio: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  >
                    <option value="21:9">21:9 Anamorphic Widescreen</option>
                    <option value="16:9">16:9 HD Broadcast</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Poster Image URL
                  </label>
                  <input
                    type="url"
                    value={editingFilm.poster}
                    onChange={(e) => setEditingFilm({ ...editingFilm, poster: e.target.value })}
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
                    Film Description & Soundstage Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editingFilm.description}
                    onChange={(e) => setEditingFilm({ ...editingFilm, description: e.target.value })}
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
                  <span>Save Reel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Working Cinema Player Preview Modal */}
      {previewFilm && (
        <CinemaPlayerModal film={previewFilm} onClose={() => setPreviewFilm(null)} />
      )}
    </div>
  );
};
