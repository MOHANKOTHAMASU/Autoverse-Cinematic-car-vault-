import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Download,
  Eye,
  X,
  FileText,
} from 'lucide-react';
import {
  getAllOffers,
  createVehicleOffer,
  setOfferStatus,
  exportOffersCSV,
  EVENT_OFFERS_UPDATED,
} from '../../utils/financeStore';
import type {
  VehicleOffer,
  OfferCategory,
  BenefitType,
  OfferVerificationStatus,
  OfferStatus,
  VehicleConditionScope,
} from '../../types/offers';
import { VEHICLES } from '../../data/vehicles';
import { INITIAL_DEALERSHIPS } from '../../data/dealers';
import { useAuth } from '../../context/AuthContext';

export const AdminOffersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [dataVersion, setDataVersion] = useState(0);

  // Sync listener
  useEffect(() => {
    const handleUpdate = () => setDataVersion((v) => v + 1);
    window.addEventListener(EVENT_OFFERS_UPDATED, handleUpdate);
    return () => window.removeEventListener(EVENT_OFFERS_UPDATED, handleUpdate);
  }, []);

  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending_review' | 'expired' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inspectOffer, setInspectOffer] = useState<VehicleOffer | null>(null);
  const [rejectModalOffer, setRejectModalOffer] = useState<VehicleOffer | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [auditModalOffer, setAuditModalOffer] = useState<VehicleOffer | null>(null);

  // New Offer Form State
  const [formTitle, setFormTitle] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<OfferCategory>('dealer_discount');
  const [formVehicleId, setFormVehicleId] = useState<string>(VEHICLES[0]?.id || 'custom');
  const [formDealerId, setFormDealerId] = useState<string>(INITIAL_DEALERSHIPS[0]?.id || 'oem_direct');
  const [formBenefitType, setFormBenefitType] = useState<BenefitType>('cash_discount');
  const [formBenefitAmount, setFormBenefitAmount] = useState<number>(50000);
  const [formBenefitFormatted, setFormBenefitFormatted] = useState('₹50,000 Special Discount');
  const [formPromoApr, setFormPromoApr] = useState<number>(0);
  const [formCurrency, setFormCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR');
  const [formRegion, setFormRegion] = useState('Maharashtra / Mumbai');
  const [formIsNationwide, setFormIsNationwide] = useState(false);
  const [formVehicleCondition, setFormVehicleCondition] = useState<VehicleConditionScope>('new_car');
  const [formValidFrom, setFormValidFrom] = useState(new Date().toISOString().split('T')[0]);
  const [formValidUntil, setFormValidUntil] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [formVerificationStatus, setFormVerificationStatus] = useState<OfferVerificationStatus>('verified');
  const [formSource, setFormSource] = useState('Official Dealership Allocation Circular');
  const [formTermsInput, setFormTermsInput] = useState('Applicable to in-stock units only.\nRequires registration within state.');
  const [formEligibilityInput, setFormEligibilityInput] = useState('Private retail registration.\nValid ID documentation.');
  const [formExclusionsInput, setFormExclusionsInput] = useState('Excludes commercial fleets.');
  const [formCanCombine, setFormCanCombine] = useState(false);
  const [formStatus, setFormStatus] = useState<OfferStatus>('approved');

  const offers = useMemo(() => {
    return getAllOffers();
  }, [dataVersion]);

  // Telemetry counts
  const telemetry = useMemo(() => {
    return {
      total: offers.length,
      approved: offers.filter((o) => o.status === 'approved').length,
      pending: offers.filter((o) => o.status === 'pending_review').length,
      expired: offers.filter((o) => o.status === 'expired').length,
      rejected: offers.filter((o) => o.status === 'rejected').length,
    };
  }, [offers]);

  // Filtered view
  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      if (activeTab !== 'all' && o.status !== activeTab) return false;
      if (categoryFilter !== 'all' && o.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          o.title.toLowerCase().includes(q) ||
          o.vehicleTitle.toLowerCase().includes(q) ||
          o.dealerName.toLowerCase().includes(q) ||
          o.dealerCity.toLowerCase().includes(q) ||
          o.region.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [offers, activeTab, categoryFilter, searchQuery]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedVeh = VEHICLES.find((v) => v.id === formVehicleId);
    const selectedDeal = INITIAL_DEALERSHIPS.find((d) => d.id === formDealerId);

    const vehicleTitle = selectedVeh
      ? `${selectedVeh.modelYear || selectedVeh.year} ${selectedVeh.brand} ${selectedVeh.model}`
      : 'Custom Vehicle';
    const dealerName = selectedDeal ? selectedDeal.name : 'Authorized Retailer';
    const dealerCity = selectedDeal ? selectedDeal.address.city : 'Mumbai';

    const termsAndConditions = formTermsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const eligibilityCriteria = formEligibilityInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const exclusions = formExclusionsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    createVehicleOffer(
      {
        title: formTitle,
        tagline: formTagline,
        description: formDescription,
        category: formCategory,
        vehicleId: formVehicleId,
        vehicleTitle,
        vehicleVariant: selectedVeh?.model,
        vehicleImage: selectedVeh?.heroImage || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
        dealerId: formDealerId,
        dealerName,
        dealerCity,
        dealerContactPhone: selectedDeal?.phone,
        dealerContactEmail: selectedDeal?.email,
        benefitType: formBenefitType,
        benefitAmount: formBenefitAmount,
        benefitFormatted: formBenefitFormatted,
        promoApr: formCategory === 'promotional_financing' ? formPromoApr : undefined,
        currency: formCurrency,
        region: formRegion,
        isNationwide: formIsNationwide,
        vehicleCondition: formVehicleCondition,
        validFrom: formValidFrom,
        validUntil: formValidUntil,
        verificationStatus: formVerificationStatus,
        source: formSource,
        lastVerifiedDate: new Date().toISOString().split('T')[0],
        termsAndConditions,
        eligibilityCriteria,
        canBeCombined: formCanCombine,
        exclusions,
        isEstimate: false,
        status: formStatus,
        published: formStatus === 'approved',
        createdBy: (currentUser as any)?.fullName || currentUser?.email || 'admin_user',
      },
      currentUser
    );

    setCreateModalOpen(false);
  };

  const handleApprove = (offer: VehicleOffer) => {
    setOfferStatus(offer.id, 'approved', 'Approved by administrator', currentUser);
  };

  const handleConfirmReject = () => {
    if (!rejectModalOffer) return;
    if (!rejectionReasonInput.trim() || rejectionReasonInput.trim().length < 5) {
      alert('Please provide a meaningful rejection reason (min 5 chars).');
      return;
    }
    setOfferStatus(rejectModalOffer.id, 'rejected', rejectionReasonInput.trim(), currentUser);
    setRejectModalOffer(null);
    setRejectionReasonInput('');
  };

  const handleExportCSV = () => {
    const csvData = exportOffersCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `autoverse_offers_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        padding: '2rem',
        backgroundColor: '#05070a',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        minHeight: '100vh',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Tag size={20} style={{ color: '#60a5fa' }} />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Dealer Offers Moderation & Ledger</h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            Audit, verify, publish, or suspend dealer discounts, exchange schemes, and promotional APR campaigns.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1.1rem',
              backgroundColor: 'rgba(30,41,59,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#f8fafc',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            id="admin-create-offer-btn"
            type="button"
            onClick={() => setCreateModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            <span>Create New Offer</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ backgroundColor: '#0a0f1d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Sourced Offers</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>{telemetry.total}</div>
        </div>

        <div style={{ backgroundColor: '#0a0f1d', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#34d399' }}>Approved & Active</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>{telemetry.approved}</div>
        </div>

        <div style={{ backgroundColor: '#0a0f1d', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>Pending Review</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.25rem' }}>{telemetry.pending}</div>
        </div>

        <div style={{ backgroundColor: '#0a0f1d', border: '1px solid rgba(148,163,184,0.25)', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Expired Bulletins</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#94a3b8', marginTop: '0.25rem' }}>{telemetry.expired}</div>
        </div>
      </div>

      {/* Controls Bar: Tabs, Search & Filters */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          backgroundColor: '#0a0f1d',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All (${telemetry.total})` },
            { id: 'approved', label: `Approved (${telemetry.approved})` },
            { id: 'pending_review', label: `Pending (${telemetry.pending})` },
            { id: 'expired', label: `Expired (${telemetry.expired})` },
            { id: 'rejected', label: `Rejected (${telemetry.rejected})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: activeTab === tab.id ? '#2563eb' : 'transparent',
                border: 'none',
                color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search offer, vehicle, dealer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.4rem',
                backgroundColor: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.85rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              backgroundColor: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem',
            }}
          >
            <option value="all">All Categories</option>
            <option value="dealer_discount">Dealer Discounts</option>
            <option value="manufacturer_discount">OEM Discounts</option>
            <option value="exchange_bonus">Exchange Bonuses</option>
            <option value="loyalty_benefit">Loyalty Benefits</option>
            <option value="accessory_package">Accessory Packages</option>
            <option value="promotional_financing">Promotional Financing</option>
            <option value="corporate_discount">Corporate Schemes</option>
          </select>
        </div>
      </div>

      {/* Offers Table */}
      <div
        style={{
          backgroundColor: '#0a0f1d',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                <th style={{ padding: '0.9rem 1rem' }}>Offer & Title</th>
                <th style={{ padding: '0.9rem 1rem' }}>Vehicle</th>
                <th style={{ padding: '0.9rem 1rem' }}>Dealership</th>
                <th style={{ padding: '0.9rem 1rem' }}>Benefit</th>
                <th style={{ padding: '0.9rem 1rem' }}>Validity</th>
                <th style={{ padding: '0.9rem 1rem' }}>Status</th>
                <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    No offers found matching this filter tab.
                  </td>
                </tr>
              ) : (
                filteredOffers.map((o) => {
                  const isApproved = o.status === 'approved';
                  const isExpired = o.status === 'expired';
                  const isPending = o.status === 'pending_review';

                  return (
                    <tr
                      key={o.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        backgroundColor: 'rgba(15,23,42,0.3)',
                      }}
                    >
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{o.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          ID: <span style={{ fontFamily: 'monospace' }}>{o.id}</span>
                        </div>
                      </td>

                      <td style={{ padding: '0.9rem 1rem', color: '#cbd5e1' }}>
                        <div style={{ fontWeight: 600 }}>{o.vehicleTitle}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.vehicleCondition}</div>
                      </td>

                      <td style={{ padding: '0.9rem 1rem', color: '#cbd5e1' }}>
                        <div>{o.dealerName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.dealerCity} ({o.region})</div>
                      </td>

                      <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#38bdf8' }}>
                        {o.benefitFormatted}
                      </td>

                      <td style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                        <div>From: {o.validFrom}</div>
                        <div>Till: {o.validUntil}</div>
                      </td>

                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor: isApproved
                              ? 'rgba(16,185,129,0.15)'
                              : isPending
                              ? 'rgba(245,158,11,0.15)'
                              : isExpired
                              ? 'rgba(148,163,184,0.15)'
                              : 'rgba(239,68,68,0.15)',
                            color: isApproved
                              ? '#34d399'
                              : isPending
                              ? '#fbbf24'
                              : isExpired
                              ? '#cbd5e1'
                              : '#f87171',
                          }}
                        >
                          {o.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => setInspectOffer(o)}
                            style={{
                              padding: '0.4rem',
                              backgroundColor: 'rgba(30,41,59,0.7)',
                              border: 'none',
                              borderRadius: '6px',
                              color: '#94a3b8',
                              cursor: 'pointer',
                            }}
                            title="Inspect Offer"
                          >
                            <Eye size={14} />
                          </button>

                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleApprove(o)}
                              style={{
                                padding: '0.4rem',
                                backgroundColor: 'rgba(16,185,129,0.15)',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#10b981',
                                cursor: 'pointer',
                              }}
                              title="Approve Offer"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}

                          {!isExpired && (
                            <button
                              type="button"
                              onClick={() => setRejectModalOffer(o)}
                              style={{
                                padding: '0.4rem',
                                backgroundColor: 'rgba(239,68,68,0.1)',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#ef4444',
                                cursor: 'pointer',
                              }}
                              title="Reject / Suspend Offer"
                            >
                              <XCircle size={14} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setAuditModalOffer(o)}
                            style={{
                              padding: '0.4rem',
                              backgroundColor: 'rgba(30,41,59,0.7)',
                              border: 'none',
                              borderRadius: '6px',
                              color: '#60a5fa',
                              cursor: 'pointer',
                            }}
                            title="Audit Trail"
                          >
                            <FileText size={14} />
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

      {/* Create Offer Modal */}
      {createModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Create Verified Vehicle Offer</h3>
              <button type="button" onClick={() => setCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                  Offer Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BMW i4 M50 — 3.99% Promo APR Special"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Tagline / Short Summary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Subsidized dealer financing special"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Vehicle Condition Scope
                  </label>
                  <select
                    value={formVehicleCondition}
                    onChange={(e) => setFormVehicleCondition(e.target.value as any)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff' }}
                  >
                    <option value="new_car">Brand New Vehicle Only</option>
                    <option value="used_car">Certified Pre-Owned Only</option>
                    <option value="all">Applicable to Both New & CPO</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                  Full Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Detailed explanation of the promotional terms and dealer allocation."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Vehicle *
                  </label>
                  <select
                    value={formVehicleId}
                    onChange={(e) => setFormVehicleId(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff' }}
                  >
                    {VEHICLES.map((v) => (
                      <option key={v.id} value={v.id}>{v.modelYear || v.year} {v.brand} {v.model}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Dealership Provider *
                  </label>
                  <select
                    value={formDealerId}
                    onChange={(e) => setFormDealerId(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff' }}
                  >
                    {INITIAL_DEALERSHIPS.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.address.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Offer Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff' }}
                  >
                    <option value="dealer_discount">Dealer Discount</option>
                    <option value="manufacturer_discount">Manufacturer Discount</option>
                    <option value="exchange_bonus">Exchange Bonus</option>
                    <option value="loyalty_benefit">Loyalty Reward</option>
                    <option value="accessory_package">Accessory Package</option>
                    <option value="promotional_financing">Promotional Financing</option>
                    <option value="corporate_discount">Corporate Scheme</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Benefit Calculation Type
                  </label>
                  <select
                    value={formBenefitType}
                    onChange={(e) => setFormBenefitType(e.target.value as any)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff' }}
                  >
                    <option value="cash_discount">Direct Cash Discount</option>
                    <option value="fixed_price_reduction">Fixed Price Reduction</option>
                    <option value="percentage_discount">Percentage Off MSRP</option>
                    <option value="exchange_bonus">Exchange Bonus</option>
                    <option value="promotional_apr">Subsidized APR Rate</option>
                    <option value="free_accessories">Complimentary Accessories</option>
                    <option value="extended_warranty">Warranty Extension</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Numeric Amount / Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formBenefitAmount}
                    onChange={(e) => setFormBenefitAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {formCategory === 'promotional_financing' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Subsidized Promotional APR (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="30"
                    value={formPromoApr}
                    onChange={(e) => setFormPromoApr(parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Benefit Label *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹75,000 Verified Bonus"
                    value={formBenefitFormatted}
                    onChange={(e) => setFormBenefitFormatted(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Currency
                  </label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value as any)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff' }}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Region / Jurisdiction
                  </label>
                  <input
                    type="text"
                    required
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Valid From Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formValidFrom}
                    onChange={(e) => setFormValidFrom(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Valid Until Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formValidUntil}
                    onChange={(e) => setFormValidUntil(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Verification Status
                  </label>
                  <select
                    value={formVerificationStatus}
                    onChange={(e) => setFormVerificationStatus(e.target.value as any)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff' }}
                  >
                    <option value="verified">Verified Official Dealer Bulletin</option>
                    <option value="awaiting_confirmation">Awaiting Dealership Confirmation</option>
                    <option value="seller_submitted">Seller / Dealer Representative Submitted</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Initial Approval Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff' }}
                  >
                    <option value="approved">Approved & Published</option>
                    <option value="pending_review">Pending Review Queue</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                  Source Reference Bulletin *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Official Dealer Bulletin Q4 2024"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Eligibility Criteria (One per line)
                  </label>
                  <textarea
                    rows={2}
                    value={formEligibilityInput}
                    onChange={(e) => setFormEligibilityInput(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Exclusions (One per line)
                  </label>
                  <textarea
                    rows={2}
                    value={formExclusionsInput}
                    onChange={(e) => setFormExclusionsInput(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                  Terms & Conditions (One per line)
                </label>
                <textarea
                  rows={2}
                  value={formTermsInput}
                  onChange={(e) => setFormTermsInput(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formIsNationwide}
                    onChange={(e) => setFormIsNationwide(e.target.checked)}
                  />
                  <span>Nationwide Availability (No state territorial restriction)</span>
                </label>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formCanCombine}
                    onChange={(e) => setFormCanCombine(e.target.checked)}
                  />
                  <span>Can be combined with other dealer offers</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  style={{ flex: 1, padding: '0.8rem', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: '0.8rem', backgroundColor: '#2563eb', border: 'none', color: '#ffffff', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Publish Verified Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOffer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              boxSizing: 'border-box',
            }}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f87171' }}>
              Reject or Suspend Offer
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
              Rejecting <strong style={{ color: '#ffffff' }}>{rejectModalOffer.title}</strong> requires documenting an auditable reason.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Terms unverified with zonal sales manager; inconsistent benefit calculation."
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
                resize: 'none',
                marginBottom: '1.5rem',
              }}
            />

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setRejectModalOffer(null)}
                style={{ flex: 1, padding: '0.75rem', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                style={{ flex: 2, padding: '0.75rem', backgroundColor: '#ef4444', border: 'none', color: '#ffffff', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {auditModalOffer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setAuditModalOffer(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 1rem' }}>
              Audit Trail: {auditModalOffer.title}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {auditModalOffer.auditLog.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.85rem',
                    backgroundColor: 'rgba(15,23,42,0.8)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 700, color: '#60a5fa' }}>{entry.action}</span>
                    <span style={{ color: '#64748b' }}>{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    By: <strong style={{ color: '#f8fafc' }}>{entry.performedBy}</strong>
                  </div>
                  {entry.note && (
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.3rem' }}>{entry.note}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inspect Offer Modal */}
      {inspectOffer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              maxWidth: '640px',
              width: '100%',
              padding: '2rem',
              boxSizing: 'border-box',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <button
              type="button"
              onClick={() => setInspectOffer(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: inspectOffer.verificationStatus === 'verified' ? 'rgba(16,185,129,0.2)' : 'rgba(234,179,8,0.2)', color: inspectOffer.verificationStatus === 'verified' ? '#34d399' : '#facc15' }}>
                {inspectOffer.verificationStatus.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Status: <strong>{inspectOffer.status}</strong></span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{inspectOffer.title}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 1.25rem' }}>{inspectOffer.tagline || inspectOffer.description}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ backgroundColor: 'rgba(15,23,42,0.8)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Vehicle & Variant</div>
                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>{inspectOffer.vehicleTitle}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(15,23,42,0.8)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Provider / Dealer</div>
                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>{inspectOffer.dealerName} ({inspectOffer.dealerCity})</div>
              </div>
              <div style={{ backgroundColor: 'rgba(15,23,42,0.8)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Advertised Benefit</div>
                <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.95rem' }}>{inspectOffer.benefitFormatted}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(15,23,42,0.8)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Jurisdiction & Scope</div>
                <div style={{ fontWeight: 600, color: '#60a5fa', fontSize: '0.85rem' }}>{inspectOffer.region} {inspectOffer.isNationwide ? '(Nationwide)' : '(Regional Only)'}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>Validity Dates</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Valid from {inspectOffer.validFrom} to {inspectOffer.validUntil}</div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>Source Documentation</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{inspectOffer.source} (Verified: {inspectOffer.lastVerifiedDate})</div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>Terms & Conditions</div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
                {inspectOffer.termsAndConditions.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setInspectOffer(null)}
                style={{ padding: '0.6rem 1.25rem', backgroundColor: '#334155', border: 'none', color: '#ffffff', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
