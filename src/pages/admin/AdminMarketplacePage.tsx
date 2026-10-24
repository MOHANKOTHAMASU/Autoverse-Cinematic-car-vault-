// AutoVerse Stage 21: Admin Used-Car Marketplace Moderation Terminal
// Moderation queue, listing review modal, report resolution, audit trail inspector, and sanitized CSV export.

import React, { useState, useEffect } from 'react';
import {
  Car,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Pause,
  Download,
  AlertTriangle,
  Clock,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getAllListings,
  setListingStatus,
  getAllReports,
  resolveReport,
  exportMarketplaceListingsCSV,
  formatMarketplacePrice,
} from '../../utils/marketplaceStore';
import type {
  MarketplaceListing,
  MarketplaceReport,
  ListingStatus,
} from '../../types/marketplace';

export const AdminMarketplacePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [reports, setReports] = useState<MarketplaceReport[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'reports'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Review Modal State
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Report Resolution Modal State
  const [selectedReport, setSelectedReport] = useState<MarketplaceReport | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const loadData = () => {
    setListings(getAllListings({ includeInactive: true }));
    setReports(getAllReports());
  };

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    window.addEventListener('autoverse_marketplace_updated', handleSync);
    window.addEventListener('autoverse_marketplace_reports_updated', handleSync);

    return () => {
      window.removeEventListener('autoverse_marketplace_updated', handleSync);
      window.removeEventListener('autoverse_marketplace_reports_updated', handleSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Moderation actions
  const handleApprove = (listing: MarketplaceListing) => {
    if (!currentUser) return;
    const res = setListingStatus(
      listing.id,
      'active',
      { id: currentUser.id, name: currentUser.fullName, role: 'admin' },
      'Administrator approved vehicle specifications & photography for marketplace publication.'
    );
    if (res.success) {
      showToast(`Listing ${listing.id} approved and published live!`);
      setSelectedListing(null);
      loadData();
    } else {
      showToast(res.error || 'Failed to approve listing.');
    }
  };

  const handleReject = (listing: MarketplaceListing) => {
    if (!currentUser) return;
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      showToast('Please specify a rejection reason for the seller (min 5 chars).');
      return;
    }

    const res = setListingStatus(
      listing.id,
      'rejected',
      { id: currentUser.id, name: currentUser.fullName, role: 'admin' },
      rejectionReason.trim()
    );
    if (res.success) {
      showToast(`Listing ${listing.id} rejected.`);
      setSelectedListing(null);
      setShowRejectInput(false);
      setRejectionReason('');
      loadData();
    } else {
      showToast(res.error || 'Failed to reject listing.');
    }
  };

  const handleStatusToggle = (listingId: string, targetStatus: ListingStatus, note: string) => {
    if (!currentUser) return;
    const res = setListingStatus(
      listingId,
      targetStatus,
      { id: currentUser.id, name: currentUser.fullName, role: 'admin' },
      note
    );
    if (res.success) {
      showToast(`Listing status updated to ${targetStatus}`);
      setSelectedListing(null);
      loadData();
    } else {
      showToast(res.error || 'Failed to update status.');
    }
  };

  const handleResolveReport = (action: 'dismiss' | 'pause_listing' | 'remove_listing') => {
    if (!selectedReport || !currentUser) return;
    const res = resolveReport(
      selectedReport.id,
      {
        action,
        notes: resolutionNotes || `Report resolved with action: ${action}`,
      },
      currentUser
    );

    if (res.success) {
      showToast(`Report #${selectedReport.id} resolved (${action})`);
      setSelectedReport(null);
      setResolutionNotes('');
      loadData();
    } else {
      showToast(res.error || 'Failed to resolve report.');
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportMarketplaceListingsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `autoverse_marketplace_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Marketplace listings CSV exported successfully!');
  };

  // Filter listings
  const filteredListings = listings.filter((l) => {
    if (activeTab === 'pending' && l.status !== 'pending_review') return false;
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      return (
        l.id.toLowerCase().includes(q) ||
        l.make.toLowerCase().includes(q) ||
        l.model.toLowerCase().includes(q) ||
        l.sellerName.toLowerCase().includes(q) ||
        l.locationCity.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = listings.filter((l) => l.status === 'pending_review').length;
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div style={{ padding: '2rem', color: '#ffffff' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: 'rgba(9, 13, 20, 0.95)',
            border: '1px solid var(--accent-cyan)',
            borderRadius: '8px',
            padding: '0.75rem 1.25rem',
            color: 'var(--accent-cyan)',
            fontWeight: 700,
            fontSize: '0.88rem',
            zIndex: 9999,
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Administrative Terminal
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0.2rem 0 0.4rem', color: '#ffffff' }}>
            Used-Car Marketplace Moderation
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
            Inspect seller submissions, verify condition statements, review reports, and enforce marketplace standards.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.7rem 1.25rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-medium)',
            color: '#ffffff',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer',
          }}
        >
          <Download size={15} />
          <span>Export Sanitized CSV</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Review</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b' }}>{pendingCount}</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Live Public Listings</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>
            {listings.filter((l) => l.status === 'active').length}
          </div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unresolved Reports</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ef4444' }}>{pendingReportsCount}</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Repository Records</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>{listings.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            backgroundColor: activeTab === 'pending' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            border: activeTab === 'pending' ? '1px solid #f59e0b' : 'none',
            color: activeTab === 'pending' ? '#f59e0b' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Clock size={15} />
          <span>Pending Queue ({pendingCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            backgroundColor: activeTab === 'all' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
            border: activeTab === 'all' ? '1px solid var(--accent-cyan)' : 'none',
            color: activeTab === 'all' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Car size={15} />
          <span>All Listings ({listings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            backgroundColor: activeTab === 'reports' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
            border: activeTab === 'reports' ? '1px solid #ef4444' : 'none',
            color: activeTab === 'reports' ? '#ef4444' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <ShieldAlert size={15} />
          <span>Reported Items ({pendingReportsCount})</span>
        </button>
      </div>

      {/* Search & Filter Strip (for Listings) */}
      {activeTab !== 'reports' && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by ID, vehicle, seller name, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.88rem',
              }}
            />
          </div>

          {activeTab === 'all' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.7rem 1rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.88rem',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending_review">Pending Review</option>
              <option value="paused">Paused</option>
              <option value="rejected">Rejected</option>
              <option value="sold">Sold</option>
              <option value="removed">Removed</option>
            </select>
          )}
        </div>
      )}

      {/* 1. LISTINGS TABLE (PENDING & ALL) */}
      {activeTab !== 'reports' && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-medium)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', backgroundColor: 'rgba(0, 0, 0, 0.25)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Vehicle</th>
                <th style={{ padding: '0.85rem 1rem' }}>Asking Price</th>
                <th style={{ padding: '0.85rem 1rem' }}>Mileage</th>
                <th style={{ padding: '0.85rem 1rem' }}>Seller</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Created</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No vehicle records found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredListings.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={l.featuredImage || l.images[0]}
                          alt={l.model}
                          style={{ width: '50px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#ffffff' }}>
                            {l.year} {l.make} {l.model}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {l.variant} • {l.locationCity}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      {formatMarketplacePrice(l.askingPrice, l.currency)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {l.mileageKm.toLocaleString()} km
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ color: '#ffffff', fontWeight: 600 }}>{l.sellerName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.sellerType.toUpperCase()}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          backgroundColor:
                            l.status === 'active'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : l.status === 'pending_review'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : l.status === 'rejected'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(255, 255, 255, 0.05)',
                          color:
                            l.status === 'active'
                              ? '#10b981'
                              : l.status === 'pending_review'
                              ? '#f59e0b'
                              : l.status === 'rejected'
                              ? '#ef4444'
                              : '#94a3b8',
                        }}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedListing(l);
                          setShowRejectInput(false);
                          setRejectionReason('');
                        }}
                        style={{
                          padding: '0.4rem 0.85rem',
                          backgroundColor: 'rgba(0, 240, 255, 0.1)',
                          border: '1px solid var(--accent-cyan)',
                          color: 'var(--accent-cyan)',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. REPORTED LISTINGS QUEUE */}
      {activeTab === 'reports' && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-medium)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', backgroundColor: 'rgba(0, 0, 0, 0.25)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Report ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Reported Vehicle</th>
                <th style={{ padding: '0.85rem 1rem' }}>Violation Reason</th>
                <th style={{ padding: '0.85rem 1rem' }}>Reporter</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No reported vehicle items logged.
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr key={rep.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                      {rep.id}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#ffffff' }}>
                      {rep.listingTitle}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#ef4444', textTransform: 'capitalize' }}>
                      {rep.reason.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      {rep.reporterEmail}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: rep.status === 'pending' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: rep.status === 'pending' ? '#ef4444' : '#10b981',
                        }}
                      >
                        {rep.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedReport(rep)}
                        style={{
                          padding: '0.4rem 0.85rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid #ef4444',
                          color: '#ef4444',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Review Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. LISTING INSPECTION & MODERATION MODAL */}
      {selectedListing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem',
          }}
          onClick={() => setSelectedListing(null)}
        >
          <div
            style={{
              backgroundColor: '#0c1017',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Moderation Review Dossier • ID: {selectedListing.id}
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: '0.2rem 0' }}>
                  {selectedListing.year} {selectedListing.make} {selectedListing.model} ({selectedListing.variant})
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Seller: <strong>{selectedListing.sellerName}</strong> ({selectedListing.sellerEmail})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Photos Preview */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
              {selectedListing.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="Review view"
                  style={{ width: '130px', height: '90px', borderRadius: '6px', objectFit: 'cover' }}
                />
              ))}
            </div>

            {/* Core Spec Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginBottom: '1.25rem',
              }}
            >
              <div><strong>Price:</strong> {formatMarketplacePrice(selectedListing.askingPrice, selectedListing.currency)}</div>
              <div><strong>Odometer:</strong> {selectedListing.mileageKm.toLocaleString()} km</div>
              <div><strong>Condition:</strong> {selectedListing.overallCondition}</div>
              <div><strong>Service:</strong> {selectedListing.serviceHistory}</div>
              <div><strong>Location:</strong> {selectedListing.locationCity}</div>
              <div><strong>Status:</strong> {selectedListing.status}</div>
            </div>

            {/* Seller Stated Flaws & Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.25rem' }}>
                Seller Declared Flaws:
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.08)', borderRadius: '6px', fontSize: '0.85rem' }}>
                {selectedListing.declaredDefects}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                Full Description:
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {selectedListing.description}
              </div>
            </div>

            {/* Audit History Timeline */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Audit History ({selectedListing.auditHistory.length} events):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '120px', overflowY: 'auto' }}>
                {selectedListing.auditHistory.map((a, idx) => (
                  <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    • {new Date(a.timestamp).toLocaleString()} [{a.actorRole.toUpperCase()}]: {a.action}
                  </div>
                ))}
              </div>
            </div>

            {/* Rejection input area */}
            {showRejectInput && (
              <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', display: 'block', marginBottom: '0.4rem' }}>
                  Documented Rejection Reason for Seller *
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Inadequate resolution of damage photos, unrealistic pricing, or unmasked confidential VIN sequence..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    marginBottom: '0.75rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleReject(selectedListing)}
                  style={{
                    padding: '0.55rem 1.2rem',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  Confirm Rejection & Send Notice
                </button>
              </div>
            )}

            {/* Moderation Actions Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {selectedListing.status !== 'active' && (
                <button
                  type="button"
                  onClick={() => handleApprove(selectedListing)}
                  style={{
                    padding: '0.7rem 1.4rem',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Approve & Publish Live</span>
                </button>
              )}

              {selectedListing.status === 'pending_review' && !showRejectInput && (
                <button
                  type="button"
                  onClick={() => setShowRejectInput(true)}
                  style={{
                    padding: '0.7rem 1.4rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <XCircle size={16} />
                  <span>Reject Listing</span>
                </button>
              )}

              {selectedListing.status === 'active' && (
                <button
                  type="button"
                  onClick={() => handleStatusToggle(selectedListing.id, 'paused', 'Administrator paused listing due to moderation review')}
                  style={{
                    padding: '0.7rem 1.4rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-medium)',
                    color: '#94a3b8',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <Pause size={15} />
                  <span>Administrative Pause</span>
                </button>
              )}

              {selectedListing.status !== 'removed' && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to administratively remove this listing?')) {
                      handleStatusToggle(selectedListing.id, 'removed', 'Administrator removed listing for marketplace terms violation');
                    }
                  }}
                  style={{
                    padding: '0.7rem 1.2rem',
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  Remove Record
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. REPORT RESOLUTION MODAL */}
      {selectedReport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem',
          }}
          onClick={() => setSelectedReport(null)}
        >
          <div
            style={{
              backgroundColor: '#0c1017',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} color="#ef4444" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Resolve Violation Report
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', fontSize: '0.88rem' }}>
              <div><strong>Listing:</strong> {selectedReport.listingTitle} (ID: {selectedReport.listingId})</div>
              <div><strong>Reported By:</strong> {selectedReport.reporterEmail}</div>
              <div><strong>Reason:</strong> <span style={{ color: '#ef4444' }}>{selectedReport.reason}</span></div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', fontSize: '0.88rem', color: '#ffffff', marginBottom: '1.5rem' }}>
              "{selectedReport.details}"
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Moderation Resolution Notes
              </label>
              <textarea
                rows={2}
                placeholder="Enter internal moderation notes..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleResolveReport('dismiss')}
                style={{
                  padding: '0.65rem 1.2rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-secondary)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Dismiss (No Violation)
              </button>
              <button
                type="button"
                onClick={() => handleResolveReport('pause_listing')}
                style={{
                  padding: '0.65rem 1.2rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid #f59e0b',
                  color: '#f59e0b',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Pause Listing
              </button>
              <button
                type="button"
                onClick={() => handleResolveReport('remove_listing')}
                style={{
                  padding: '0.65rem 1.2rem',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Enforce Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
