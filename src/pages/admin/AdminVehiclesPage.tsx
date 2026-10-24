// AutoVerse Stage 7: Vehicle Management Interface
// Complete searchable, sortable, filterable table with Add/Edit modals, validation, and content lifecycle

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
} from 'lucide-react';
import {
  getAdminVehicles,
  saveAdminVehicle,
  toggleVehiclePublication,
  archiveVehicle,
  restoreVehicle,
  deleteVehicle,
} from '../../utils/adminStore';
import type { Vehicle, PowertrainType, BodyType } from '../../types';
import type { ContentStatus } from '../../types/admin';

export const AdminVehiclesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [powertrainFilter, setPowertrainFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ContentStatus>('All');
  const [sortField, setSortField] = useState<'brand' | 'modelYear' | 'horsepower' | 'price'>('brand');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDeleteVehicle, setConfirmDeleteVehicle] = useState<Vehicle | null>(null);

  const loadData = () => {
    setVehicles(getAdminVehicles());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('autoverse_vehicles_updated', loadData);
    return () => window.removeEventListener('autoverse_vehicles_updated', loadData);
  }, []);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingVehicle({
      id: `veh_${Date.now()}`,
      slug: '',
      brand: 'Porsche',
      model: '',
      variant: '',
      modelYear: 2025,
      bodyType: 'sports_car',
      powertrain: 'electric',
      market: 'Global Market',
      announcementDate: '2025',
      marketLaunchDate: '2025',
      availabilityStatus: 'available',
      price: 150000,
      currency: 'USD',
      horsepower: 600,
      torqueNm: 800,
      accelerationSeconds: 3.2,
      topSpeedMph: 165,
      electricRangeMiles: 300,
      imageGallery: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80'],
      thumbnail: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
      officialUrl: 'https://www.autoverse.com',
      specificationSource: 'Manufacturer Press Release',
      lastVerifiedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      publicationStatus: 'published',
      name: '',
      manufacturerId: 'porsche',
      manufacturerName: 'Porsche',
      year: 2025,
      tagline: 'Precision Engineering Redefined',
      category: 'electric',
      priceStartingUsd: 150000,
      specs: {
        acceleration0to60: 3.2,
        horsepower: 600,
        topSpeedMph: 165,
        engineType: 'Dual Permanent-Magnet Motors',
        drivetrain: 'All-Wheel Drive (AWD)',
        transmission: 'Single-Speed Direct',
        curbWeightLbs: 4500,
        verifiedSource: 'Official Datasheet',
        verifiedDate: '2025',
      },
      heroImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1920&q=80',
      interiorImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      accentColor: '#06b6d4',
      description: 'Engineered for exceptional performance and sustained aerodynamic composure.',
      featured: false,
      highlightSpecs: [
        { label: '0–60 MPH', value: '3.2', unit: 'sec' },
        { label: 'Power', value: '600', unit: 'HP' },
        { label: 'Top Speed', value: '165', unit: 'MPH' },
      ],
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle ?action=add query param
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenAddModal();
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Distinct Brands & Powertrains
  const allBrands = Array.from(new Set(vehicles.map((v) => v.brand))).sort();
  const allPowertrains = Array.from(new Set(vehicles.map((v) => v.powertrain))).sort();

  // Filter & Sort
  const filteredVehicles = vehicles
    .filter((v) => {
      const matchSearch =
        v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.variant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBrand = brandFilter === 'All' || v.brand === brandFilter;
      const matchPowertrain = powertrainFilter === 'All' || v.powertrain === powertrainFilter;
      const currentStatus = v.publicationStatus || 'published';
      const matchStatus = statusFilter === 'All' || currentStatus === statusFilter;
      return matchSearch && matchBrand && matchPowertrain && matchStatus;
    })
    .sort((a, b) => {
      let valA: string | number = a[sortField] || 0;
      let valB: string | number = b[sortField] || 0;
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleToggleStatus = (idOrSlug: string) => {
    try {
      const res = toggleVehiclePublication(idOrSlug);
      showToast(`Vehicle status changed to ${res.newStatus.toUpperCase()}`);
    } catch {
      showToast('Failed to change vehicle status');
    }
  };

  const handleArchive = (idOrSlug: string) => {
    archiveVehicle(idOrSlug);
    showToast('Vehicle archived');
  };

  const handleRestore = (idOrSlug: string) => {
    restoreVehicle(idOrSlug);
    showToast('Vehicle restored to published catalog');
  };

  const handleDelete = (idOrSlug: string) => {
    const res = deleteVehicle(idOrSlug);
    if (res.success) {
      showToast('Vehicle permanently deleted');
      setConfirmDeleteVehicle(null);
    }
  };



  const handleOpenEditModal = (v: Vehicle) => {
    setEditingVehicle({ ...v });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    const errors: Record<string, string> = {};
    if (!editingVehicle.brand.trim()) errors.brand = 'Brand is required';
    if (!editingVehicle.model.trim()) errors.model = 'Model is required';
    if (!editingVehicle.variant.trim()) errors.variant = 'Variant is required';
    if (!editingVehicle.modelYear || editingVehicle.modelYear < 1990 || editingVehicle.modelYear > 2030) {
      errors.modelYear = 'Model year must be between 1990 and 2030';
    }
    if (editingVehicle.horsepower <= 0) errors.horsepower = 'Horsepower must be greater than 0';
    if (editingVehicle.accelerationSeconds <= 0) errors.accelerationSeconds = 'Acceleration must be greater than 0';

    // Auto-generate or sanitize slug
    let generatedSlug = editingVehicle.slug.trim();
    if (!generatedSlug) {
      generatedSlug = `${editingVehicle.brand}-${editingVehicle.model}-${editingVehicle.variant}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Check duplicate slug among other vehicles
    const duplicate = vehicles.find((v) => v.slug === generatedSlug && v.id !== editingVehicle.id);
    if (duplicate) {
      errors.slug = 'This URL slug is already used by another vehicle. Please customize it.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload: Vehicle = {
      ...editingVehicle,
      slug: generatedSlug,
      name: `${editingVehicle.brand} ${editingVehicle.model} ${editingVehicle.variant}`,
      manufacturerId: editingVehicle.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      manufacturerName: editingVehicle.brand,
      year: editingVehicle.modelYear,
      priceStartingUsd: editingVehicle.price || 100000,
      specs: {
        ...(editingVehicle.specs || {
          engineType: 'High-Performance Powertrain',
          drivetrain: 'All-Wheel Drive (AWD)',
          transmission: 'Automatic Transmission',
          curbWeightLbs: 4500,
          verifiedSource: 'Datasheet',
          verifiedDate: '2025',
        }),
        horsepower: editingVehicle.horsepower,
        acceleration0to60: editingVehicle.accelerationSeconds,
        topSpeedMph: editingVehicle.topSpeedMph,
      },
    };

    saveAdminVehicle(payload);
    setIsModalOpen(false);
    showToast('Vehicle saved successfully.');
  };

  const getStatusBadge = (status: ContentStatus = 'published') => {
    switch (status) {
      case 'published':
        return (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textTransform: 'uppercase',
            }}
          >
            Published
          </span>
        );
      case 'draft':
        return (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              textTransform: 'uppercase',
            }}
          >
            Draft
          </span>
        );
      case 'archived':
        return (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(148, 163, 184, 0.15)',
              color: '#94a3b8',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              textTransform: 'uppercase',
            }}
          >
            Archived
          </span>
        );
      default:
        return null;
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

      {/* Header & Controls */}
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
            Vehicle Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Manage technical specifications, images, publication states, and verified datasheets.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary"
          style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          backgroundColor: 'rgba(15, 20, 28, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by brand, model, variant, or slug..."
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.4rem',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.85rem',
            }}
          />
        </div>

        {/* Filter Selectors */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.82rem',
            }}
          >
            <option value="All">All Marques</option>
            {allBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={powertrainFilter}
            onChange={(e) => setPowertrainFilter(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.82rem',
            }}
          >
            <option value="All">All Powertrains</option>
            {allPowertrains.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{
              padding: '0.55rem 0.85rem',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.82rem',
            }}
          >
            <option value="All">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
            <option value="archived">Archived Only</option>
          </select>

          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [f, d] = e.target.value.split('-');
              setSortField(f as any);
              setSortDirection(d as any);
            }}
            style={{
              padding: '0.55rem 0.85rem',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.82rem',
            }}
          >
            <option value="brand-asc">Sort: Marque (A–Z)</option>
            <option value="brand-desc">Sort: Marque (Z–A)</option>
            <option value="modelYear-desc">Sort: Year (Newest)</option>
            <option value="modelYear-asc">Sort: Year (Oldest)</option>
            <option value="horsepower-desc">Sort: Power (Highest)</option>
            <option value="price-desc">Sort: Price (Highest)</option>
            <option value="price-asc">Sort: Price (Lowest)</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
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
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Vehicle</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Year & Body</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Powertrain</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Specs</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>MSRP</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No vehicles match your current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => {
                  const status = (v.publicationStatus || 'published') as ContentStatus;
                  return (
                    <tr
                      key={v.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Vehicle Thumbnail & Title */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={v.thumbnail || v.heroImage}
                            alt={v.model}
                            style={{
                              width: '46px',
                              height: '32px',
                              borderRadius: '4px',
                              objectFit: 'cover',
                              backgroundColor: '#000',
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#ffffff' }}>
                              {v.brand} {v.model}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.variant}</div>
                          </div>
                        </div>
                      </td>

                      {/* Year & Body */}
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        <div>{v.modelYear}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {v.bodyType.replace('_', ' ')}
                        </div>
                      </td>

                      {/* Powertrain */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor:
                              v.powertrain === 'electric'
                                ? 'rgba(6, 182, 212, 0.15)'
                                : 'rgba(245, 158, 11, 0.15)',
                            color: v.powertrain === 'electric' ? 'var(--accent-cyan)' : '#fbbf24',
                            textTransform: 'capitalize',
                          }}
                        >
                          {v.powertrain}
                        </span>
                      </td>

                      {/* Specs */}
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        <div>
                          <strong style={{ color: '#fff' }}>{v.horsepower}</strong> HP ·{' '}
                          <strong style={{ color: '#fff' }}>{v.accelerationSeconds}s</strong> 0-60
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                          Top: {v.topSpeedMph} MPH {v.electricRangeMiles ? `· ${v.electricRangeMiles} mi` : ''}
                        </div>
                      </td>

                      {/* MSRP */}
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#ffffff' }}>
                        ${v.price ? v.price.toLocaleString() : 'N/A'}
                      </td>

                      {/* Publication Status & Fast Toggle */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <button
                          onClick={() => handleToggleStatus(v.id)}
                          title={`Click to ${status === 'published' ? 'unpublish (set to draft)' : 'publish'}`}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          {getStatusBadge(status)}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {/* View public page */}
                          <Link
                            to={`/vehicle/${v.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open public detail page"
                            style={{
                              color: 'var(--text-muted)',
                              padding: '0.35rem',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Eye size={15} />
                          </Link>

                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEditModal(v)}
                            title="Edit Vehicle"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#60a5fa',
                              cursor: 'pointer',
                              padding: '0.35rem',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Archive / Restore */}
                          {status === 'archived' ? (
                            <button
                              onClick={() => handleRestore(v.id)}
                              title="Restore to Active Catalog"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#10b981',
                                cursor: 'pointer',
                                padding: '0.35rem',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <RotateCcw size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleArchive(v.id)}
                              title="Archive Vehicle"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#f59e0b',
                                cursor: 'pointer',
                                padding: '0.35rem',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <Archive size={15} />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => setConfirmDeleteVehicle(v)}
                            title="Delete Vehicle"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--accent-red)',
                              cursor: 'pointer',
                              padding: '0.35rem',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT VEHICLE */}
      {isModalOpen && editingVehicle && (
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
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                  {vehicles.some((v) => v.id === editingVehicle.id) ? 'Edit Vehicle' : 'Add New Vehicle to Catalog'}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Specifications will synchronize directly with the public discovery catalog and detail pages.
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Scrollable Form */}
            <form onSubmit={handleSaveForm} style={{ flex: 1, overflowY: 'auto', padding: '1.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                {/* Brand */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Brand / Marque *
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.brand}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, brand: e.target.value })}
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
                  {formErrors.brand && <div style={{ color: 'var(--accent-red)', fontSize: '0.72rem' }}>{formErrors.brand}</div>}
                </div>

                {/* Model */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Model *
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.model}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                    required
                    placeholder="e.g. Taycan, 911, Model S"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  />
                  {formErrors.model && <div style={{ color: 'var(--accent-red)', fontSize: '0.72rem' }}>{formErrors.model}</div>}
                </div>

                {/* Variant */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Variant *
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.variant}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, variant: e.target.value })}
                    required
                    placeholder="e.g. Turbo S, GT3 RS, Plaid"
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

                {/* Model Year */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Model Year *
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.modelYear}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, modelYear: parseInt(e.target.value) || 2025 })}
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

                {/* Powertrain */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Powertrain
                  </label>
                  <select
                    value={editingVehicle.powertrain}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, powertrain: e.target.value as PowertrainType })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  >
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="plug-in hybrid">Plug-in Hybrid</option>
                    <option value="petrol">Petrol (ICE)</option>
                  </select>
                </div>

                {/* Body Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Body Style
                  </label>
                  <select
                    value={editingVehicle.bodyType}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, bodyType: e.target.value as BodyType })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  >
                    <option value="sports_car">Sports Car</option>
                    <option value="coupe">Coupe</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="estate">Estate / Wagon</option>
                  </select>
                </div>

                {/* Horsepower */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    System Power (HP) *
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.horsepower}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, horsepower: parseInt(e.target.value) || 0 })}
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

                {/* 0-60 MPH */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    0–60 MPH (Seconds) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingVehicle.accelerationSeconds}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, accelerationSeconds: parseFloat(e.target.value) || 0 })}
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

                {/* Top Speed MPH */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Top Speed (MPH)
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.topSpeedMph}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, topSpeedMph: parseInt(e.target.value) || 0 })}
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

                {/* Starting Price */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Starting Price ($ USD)
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.price || 0}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, price: parseInt(e.target.value) || 0 })}
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

                {/* Publication Status */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Publication Lifecycle Status
                  </label>
                  <select
                    value={editingVehicle.publicationStatus || 'published'}
                    onChange={(e) =>
                      setEditingVehicle({ ...editingVehicle, publicationStatus: e.target.value as ContentStatus })
                    }
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  >
                    <option value="published">Published (Visible Publicly)</option>
                    <option value="draft">Draft (Hidden from Public)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* URL Slug */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    URL Slug (e.g. porsche-911-gt3-rs)
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.slug}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, slug: e.target.value })}
                    placeholder="Leave blank to auto-generate from brand & model"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  />
                  {formErrors.slug && <div style={{ color: 'var(--accent-red)', fontSize: '0.72rem' }}>{formErrors.slug}</div>}
                </div>
              </div>

              {/* Image URL & Description */}
              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Hero Image URL
                  </label>
                  <input
                    type="url"
                    value={editingVehicle.heroImage || editingVehicle.thumbnail}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        heroImage: e.target.value,
                        thumbnail: e.target.value,
                        imageGallery: [e.target.value],
                      })
                    }
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
                    Automotive Editorial Summary
                  </label>
                  <textarea
                    rows={3}
                    value={editingVehicle.description}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, description: e.target.value })}
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

              {/* Modal Footer Controls */}
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
                  <span>Save Vehicle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {confirmDeleteVehicle && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10001,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#0c1017',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '460px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <AlertCircle size={40} color="var(--accent-red)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Permanently Delete Vehicle?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to delete{' '}
              <strong style={{ color: '#fff' }}>
                {confirmDeleteVehicle.brand} {confirmDeleteVehicle.model} {confirmDeleteVehicle.variant}
              </strong>
              ? This action will remove the record from public and admin registries.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setConfirmDeleteVehicle(null)}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteVehicle.id)}
                style={{
                  backgroundColor: 'var(--accent-red)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
