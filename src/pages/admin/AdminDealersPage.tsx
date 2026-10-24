// AutoVerse Stage 20: Dealer Administration Terminal
// Allows authorized administrators to manage dealership profiles, supported marques,
// physical facilities, test-drive capacity rules, and activation states.

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import {
  getAllDealers,
  addDealer,
  updateDealer,
  toggleDealerActive,
} from '../../utils/dealerStore';
import type { Dealership, DealershipService } from '../../types/dealer';

export const AdminDealersPage: React.FC = () => {
  const [dealers, setDealers] = useState<Dealership[]>(() => getAllDealers());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDealerId, setEditingDealerId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formLegalName, setFormLegalName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBannerImage, setFormBannerImage] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formPostalCode, setFormPostalCode] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formBrands, setFormBrands] = useState<string>('Porsche, Audi');
  const [formServices, setFormServices] = useState<DealershipService[]>([
    'new_cars',
    'test_drives',
    'service_center',
  ]);
  const [formDaysInAdvance, setFormDaysInAdvance] = useState(21);
  const [formSlotTimes, setFormSlotTimes] = useState(
    '10:00 AM, 11:30 AM, 02:00 PM, 03:30 PM, 05:00 PM'
  );
  const [formError, setFormError] = useState<string | null>(null);

  const refreshDealers = () => {
    setDealers(getAllDealers());
  };

  useEffect(() => {
    window.addEventListener('autoverse_dealers_updated', refreshDealers);
    return () => window.removeEventListener('autoverse_dealers_updated', refreshDealers);
  }, []);

  const filteredDealers = useMemo(() => {
    return dealers.filter((d) => {
      if (statusFilter === 'active' && !d.active) return false;
      if (statusFilter === 'inactive' && d.active) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          d.name.toLowerCase().includes(q) ||
          d.address.city.toLowerCase().includes(q) ||
          d.address.state.toLowerCase().includes(q) ||
          d.supportedBrands.some((b) => b.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [dealers, searchQuery, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingDealerId(null);
    setFormName('');
    setFormSlug('');
    setFormLegalName('');
    setFormTagline('');
    setFormDescription('');
    setFormBannerImage('https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80');
    setFormStreet('');
    setFormCity('');
    setFormState('');
    setFormPostalCode('');
    setFormCountry('');
    setFormPhone('');
    setFormEmail('');
    setFormWebsite('');
    setFormBrands('Porsche');
    setFormServices(['new_cars', 'test_drives', 'service_center']);
    setFormDaysInAdvance(21);
    setFormSlotTimes('10:00 AM, 11:30 AM, 02:00 PM, 03:30 PM');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (d: Dealership) => {
    setEditingDealerId(d.id);
    setFormName(d.name);
    setFormSlug(d.slug);
    setFormLegalName(d.legalEntityName);
    setFormTagline(d.tagline);
    setFormDescription(d.description);
    setFormBannerImage(d.bannerImage);
    setFormStreet(d.address.street);
    setFormCity(d.address.city);
    setFormState(d.address.state);
    setFormPostalCode(d.address.postalCode);
    setFormCountry(d.address.country);
    setFormPhone(d.phone);
    setFormEmail(d.email);
    setFormWebsite(d.websiteUrl);
    setFormBrands(d.supportedBrands.join(', '));
    setFormServices(d.services);
    setFormDaysInAdvance(d.slotConfig.daysInAdvance);
    setFormSlotTimes(d.slotConfig.slotTimes.join(', '));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveDealer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formCity.trim() || !formCountry.trim() || !formPhone.trim()) {
      setFormError('Please fill in required fields: Name, City, Country, and Telephone.');
      return;
    }

    const slug =
      formSlug.trim() ||
      formName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const supportedBrands = formBrands
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    const slotTimes = formSlotTimes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingDealerId) {
      updateDealer(editingDealerId, {
        name: formName.trim(),
        slug,
        legalEntityName: formLegalName.trim() || formName.trim(),
        tagline: formTagline.trim(),
        description: formDescription.trim(),
        bannerImage: formBannerImage.trim(),
        address: {
          street: formStreet.trim(),
          city: formCity.trim(),
          state: formState.trim(),
          postalCode: formPostalCode.trim(),
          country: formCountry.trim(),
          googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(
            `${formStreet}, ${formCity}, ${formCountry}`
          )}`,
        },
        phone: formPhone.trim(),
        email: formEmail.trim(),
        websiteUrl: formWebsite.trim(),
        supportedBrands,
        services: formServices,
        slotConfig: {
          daysInAdvance: Number(formDaysInAdvance) || 14,
          slotTimes,
          maxSimultaneousDrives: 2,
        },
      });
    } else {
      addDealer({
        name: formName.trim(),
        slug,
        legalEntityName: formLegalName.trim() || formName.trim(),
        tagline: formTagline.trim(),
        description: formDescription.trim(),
        bannerImage: formBannerImage.trim(),
        address: {
          street: formStreet.trim(),
          city: formCity.trim(),
          state: formState.trim(),
          postalCode: formPostalCode.trim(),
          country: formCountry.trim(),
          googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(
            `${formStreet}, ${formCity}, ${formCountry}`
          )}`,
        },
        phone: formPhone.trim(),
        email: formEmail.trim(),
        websiteUrl: formWebsite.trim(),
        supportedBrands,
        services: formServices,
        openingHours: {
          monday: '09:00 - 18:30 Local',
          tuesday: '09:00 - 18:30 Local',
          wednesday: '09:00 - 18:30 Local',
          thursday: '09:00 - 18:30 Local',
          friday: '09:00 - 18:30 Local',
          saturday: '09:30 - 15:00 Local',
          sunday: 'Closed',
        },
        slotConfig: {
          daysInAdvance: Number(formDaysInAdvance) || 14,
          slotTimes,
          maxSimultaneousDrives: 2,
        },
        verified: true,
        active: true,
        rating: 4.85,
        reviewCount: 45,
        inventoryVehicleIds: [],
      });
    }

    setIsModalOpen(false);
    refreshDealers();
  };

  const handleToggleService = (srv: DealershipService) => {
    if (formServices.includes(srv)) {
      setFormServices(formServices.filter((s) => s !== srv));
    } else {
      setFormServices([...formServices, srv]);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-cyan">
              <Building2 size={12} /> STAGE 20 DEALER OPERATIONS
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
            Dealership Network Administration
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Configure OEM partner showrooms, opening hours, supported marques, and automated test-drive capacity.
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }}>
          <Plus size={16} /> Add Verified Dealership
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#0c1017',
          border: '1px solid var(--border-medium)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            flex: '1 1 280px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            padding: '0.6rem 0.85rem',
          }}
        >
          <Search size={16} color="var(--accent-cyan)" />
          <input
            type="text"
            placeholder="Search by dealership name, city, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.88rem',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['all', 'active', 'inactive'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: statusFilter === st ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                backgroundColor: statusFilter === st ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                color: statusFilter === st ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Dealerships Table */}
      <div
        style={{
          backgroundColor: '#0c1017',
          border: '1px solid var(--border-medium)',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-medium)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>DEALERSHIP</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LOCATION</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>MARQUES</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SLOT CAPACITY</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>STATUS</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredDealers.map((d) => (
              <tr
                key={d.id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'background-color 0.15s',
                }}
              >
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.92rem' }}>{d.name}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {d.slug}
                  </div>
                </td>

                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                  <div>{d.address.city}, {d.address.state}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{d.address.country}</div>
                </td>

                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {d.supportedBrands.map((b) => (
                      <span
                        key={b}
                        style={{
                          backgroundColor: 'rgba(0, 240, 255, 0.1)',
                          color: 'var(--accent-cyan)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                        }}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </td>

                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  {d.slotConfig.slotTimes.length} slots/day ({d.slotConfig.daysInAdvance}d advance)
                </td>

                <td style={{ padding: '1rem' }}>
                  <button
                    onClick={() => {
                      toggleDealerActive(d.id);
                      refreshDealers();
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: d.active ? '#34d399' : '#f87171',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    {d.active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {d.active ? 'Active' : 'Inactive'}
                  </button>
                </td>

                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                    <Link
                      to={`/dealers/${d.slug}`}
                      target="_blank"
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <ExternalLink size={12} /> View
                    </Link>

                    <button
                      onClick={() => handleOpenEditModal(d)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-medium)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Dealership Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(10px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#0c1017',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {editingDealerId ? 'Edit Dealership Record' : 'Create Verified Dealership'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveDealer} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Row 1: Name and Slug */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                    Dealership Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Porsche Centre Stuttgart"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. porsche-centre-stuttgart"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                  Tagline / Subheading
                </label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="e.g. Official factory dealership at Werk 1 Zuffenhausen."
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    padding: '0.65rem 0.85rem',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Address details */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formStreet}
                    onChange={(e) => setFormStreet(e.target.value)}
                    placeholder="e.g. Porscheplatz 9"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Stuttgart"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    placeholder="Germany"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Contact info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                    Telephone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+49 711 911 25000"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="info@porsche-stuttgart.de"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    placeholder="https://dealer.porsche.com"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Supported Marques & Slot Times */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                    Supported Marques (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formBrands}
                    onChange={(e) => setFormBrands(e.target.value)}
                    placeholder="Porsche, Audi"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                    Days in Advance Bookable
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={formDaysInAdvance}
                    onChange={(e) => setFormDaysInAdvance(Number(e.target.value))}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Slot Times */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                  Departure Time Slots (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formSlotTimes}
                  onChange={(e) => setFormSlotTimes(e.target.value)}
                  placeholder="10:00 AM, 11:30 AM, 02:00 PM, 03:30 PM, 05:00 PM"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    padding: '0.65rem 0.85rem',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Services Checkboxes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                  Services Offered
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {(['new_cars', 'pre_owned', 'service_center', 'test_drives', 'ev_charging', 'bespoke_studio'] as DealershipService[]).map((srv) => (
                    <label
                      key={srv}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formServices.includes(srv)}
                        onChange={() => handleToggleService(srv)}
                        style={{ accentColor: 'var(--accent-cyan)' }}
                      />
                      {srv.replace('_', ' ')}
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  Save Dealership
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
