// AutoVerse Stage 21: Seller Dashboard — My Vehicle Listings
// Manage active, pending, paused, rejected, and sold listings, with inline enquiry reviews and status controls.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  PlusCircle,
  Eye,
  MessageSquare,
  Pause,
  Play,
  CheckCircle2,
  Trash2,
  Send,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getSellerListings,
  setListingStatus,
  getSellerEnquiries,
  replyToEnquiry,
  formatMarketplacePrice,
} from '../utils/marketplaceStore';
import type { MarketplaceListing, MarketplaceEnquiry, ListingStatus } from '../types/marketplace';

export const MyListingsPage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [enquiries, setEnquiries] = useState<MarketplaceEnquiry[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending_review' | 'paused' | 'rejected' | 'sold'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Enquiry Drawer Modal State
  const [selectedListingForEnquiries, setSelectedListingForEnquiries] = useState<MarketplaceListing | null>(null);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [replySubmittingId, setReplySubmittingId] = useState<string | null>(null);

  const loadData = () => {
    if (!currentUser) return;
    const userListings = getSellerListings(currentUser.id);
    const userEnquiries = getSellerEnquiries(currentUser.id);
    setListings(userListings);
    setEnquiries(userEnquiries);
  };

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    window.addEventListener('autoverse_marketplace_updated', handleSync);
    window.addEventListener('autoverse_marketplace_enquiries_updated', handleSync);

    return () => {
      window.removeEventListener('autoverse_marketplace_updated', handleSync);
      window.removeEventListener('autoverse_marketplace_enquiries_updated', handleSync);
    };
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStatusChange = (listingId: string, newStatus: ListingStatus) => {
    if (!currentUser) return;
    const res = setListingStatus(listingId, newStatus, {
      id: currentUser.id,
      name: currentUser.fullName,
      role: currentUser.role === 'admin' ? 'admin' : 'seller',
    });

    if (res.success) {
      showToast(`Listing updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      loadData();
    } else {
      showToast(res.error || 'Failed to update status.');
    }
  };

  const handleSendReply = (enquiryId: string) => {
    if (!currentUser) return;
    const replyText = replyTextMap[enquiryId];
    if (!replyText || replyText.trim().length < 5) {
      showToast('Reply must be at least 5 characters long.');
      return;
    }

    setReplySubmittingId(enquiryId);
    const res = replyToEnquiry(enquiryId, replyText, currentUser.id);
    setReplySubmittingId(null);

    if (res.success) {
      showToast('Reply delivered to buyer!');
      setReplyTextMap((prev) => ({ ...prev, [enquiryId]: '' }));
      loadData();
    } else {
      showToast(res.error || 'Failed to send reply.');
    }
  };

  const filteredListings = listings.filter((l) => {
    if (activeTab === 'all') return true;
    return l.status === activeTab;
  });

  const getStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case 'active':
        return { label: 'Active & Live', bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', color: '#10b981' };
      case 'pending_review':
        return { label: 'Pending Review', bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', color: '#f59e0b' };
      case 'paused':
        return { label: 'Paused by Seller', bg: 'rgba(148, 163, 184, 0.15)', border: '#94a3b8', color: '#94a3b8' };
      case 'rejected':
        return { label: 'Rejected by Moderator', bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', color: '#ef4444' };
      case 'sold':
        return { label: 'Marked as Sold', bg: 'rgba(0, 240, 255, 0.15)', border: 'var(--accent-cyan)', color: 'var(--accent-cyan)' };
      default:
        return { label: status, bg: 'rgba(255, 255, 255, 0.05)', border: 'var(--border-medium)', color: '#ffffff' };
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '120px', color: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem 1rem' }}>
          <Car size={54} color="var(--accent-cyan)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>
            Seller Account Required
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Please log in with your AutoVerse account to view and manage your vehicle listings.
          </p>
          <Link
            to="/login?redirect=/my-listings"
            style={{
              padding: '0.8rem 1.8rem',
              backgroundColor: 'var(--accent-cyan)',
              color: '#07090d',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Sign In to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px', color: '#ffffff' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '90px',
            right: '20px',
            backgroundColor: 'rgba(9, 13, 20, 0.95)',
            border: '1px solid var(--accent-cyan)',
            borderRadius: '8px',
            padding: '0.75rem 1.25rem',
            color: 'var(--accent-cyan)',
            fontWeight: 700,
            fontSize: '0.88rem',
            zIndex: 9999,
            boxShadow: '0 10px 30px rgba(0, 240, 255, 0.25)',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Top Banner */}
      <section
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(12, 16, 23, 0.8)',
          padding: '2.5rem 1rem',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Seller Workspace
              </div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0.25rem 0 0.5rem', color: '#ffffff' }}>
                My Vehicle Listings
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                Manage your pre-owned inventory, monitor buyer views, respond to enquiries, and track listing lifecycle.
              </p>
            </div>

            <Link
              to="/sell-car"
              className="btn-glow"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--accent-cyan)',
                color: '#07090d',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.92rem',
                textDecoration: 'none',
              }}
            >
              <PlusCircle size={18} />
              <span>Create New Listing</span>
            </Link>
          </div>

          {/* Quick Metrics Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginTop: '2rem',
            }}
          >
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-medium)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Listings</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff' }}>{listings.length}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-medium)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Live</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>
                {listings.filter((l) => l.status === 'active').length}
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-medium)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Moderation</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b' }}>
                {listings.filter((l) => l.status === 'pending_review').length}
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-medium)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Enquiries</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>{enquiries.length}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section style={{ padding: '2.5rem 1rem 5rem' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Tabs Navigation */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.75rem',
              marginBottom: '2rem',
              overflowX: 'auto',
            }}
          >
            {[
              { id: 'all', label: 'All Listings' },
              { id: 'active', label: 'Active Live' },
              { id: 'pending_review', label: 'Pending Review' },
              { id: 'paused', label: 'Paused' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'sold', label: 'Sold' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: activeTab === tab.id ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                  border: activeTab === tab.id ? '1px solid var(--accent-cyan)' : 'none',
                  color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Listings List */}
          {filteredListings.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '16px',
                border: '1px solid var(--border-medium)',
              }}
            >
              <Car size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                No listings in this tab
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                You currently have no vehicle records under this category.
              </p>
              <Link
                to="/sell-car"
                style={{
                  padding: '0.7rem 1.4rem',
                  backgroundColor: 'var(--accent-cyan)',
                  color: '#07090d',
                  borderRadius: '8px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <PlusCircle size={16} />
                <span>Create Vehicle Listing</span>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredListings.map((l) => {
                const badge = getStatusBadge(l.status);
                const listingEnquiries = enquiries.filter((e) => e.listingId === l.id);

                return (
                  <div
                    key={l.id}
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '14px',
                      border: '1px solid var(--border-medium)',
                      padding: '1.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1.5rem',
                      alignItems: 'center',
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: '160px',
                        height: '110px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        backgroundColor: '#05070a',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={l.featuredImage || l.images[0]}
                        alt={l.model}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Listing Info */}
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px',
                            backgroundColor: badge.bg,
                            border: `1px solid ${badge.border}`,
                            color: badge.color,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          {badge.label}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          ID: {l.id}
                        </span>
                      </div>

                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                        {l.year} {l.make} {l.model} <span style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>{l.variant}</span>
                      </div>

                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0' }}>
                        {formatMarketplacePrice(l.askingPrice, l.currency)}
                      </div>

                      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span><strong>Mileage:</strong> {l.mileageKm.toLocaleString()} km</span>
                        <span><strong>City:</strong> {l.locationCity}</span>
                        <span><strong>Views:</strong> {l.viewsCount}</span>
                        <span><strong>Enquiries:</strong> {l.enquiriesCount}</span>
                      </div>

                      {/* Rejection Note Alert if rejected */}
                      {l.status === 'rejected' && l.rejectionReason && (
                        <div
                          style={{
                            marginTop: '0.75rem',
                            padding: '0.65rem 0.85rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            color: '#ef4444',
                          }}
                        >
                          <strong>Moderation Rejection Reason:</strong> {l.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px' }}>
                      <Link
                        to={`/used-cars/${l.slug}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          padding: '0.55rem 1rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-medium)',
                          color: '#ffffff',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        <Eye size={14} />
                        <span>Preview Listing</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSelectedListingForEnquiries(l)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          padding: '0.55rem 1rem',
                          backgroundColor: 'rgba(0, 240, 255, 0.1)',
                          border: '1px solid var(--accent-cyan)',
                          color: 'var(--accent-cyan)',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <MessageSquare size={14} />
                        <span>Enquiries ({listingEnquiries.length})</span>
                      </button>

                      {/* Pause / Resume Controls */}
                      {l.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(l.id, 'paused')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            padding: '0.55rem 1rem',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--border-medium)',
                            color: '#94a3b8',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Pause size={14} />
                          <span>Pause Listing</span>
                        </button>
                      )}

                      {l.status === 'paused' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(l.id, 'active')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            padding: '0.55rem 1rem',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid #10b981',
                            color: '#10b981',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <Play size={14} />
                          <span>Resume Listing</span>
                        </button>
                      )}

                      {/* Mark as Sold */}
                      {(l.status === 'active' || l.status === 'paused') && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(l.id, 'sold')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            padding: '0.55rem 1rem',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--border-medium)',
                            color: 'var(--accent-cyan)',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Mark as Sold</span>
                        </button>
                      )}

                      {/* Remove Listing */}
                      {l.status !== 'removed' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to remove this vehicle listing?')) {
                              handleStatusChange(l.id, 'removed');
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            padding: '0.4rem 1rem',
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ENQUIRIES DRAWER MODAL */}
      {selectedListingForEnquiries && (
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
          onClick={() => setSelectedListingForEnquiries(null)}
        >
          <div
            style={{
              backgroundColor: '#0c1017',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Buyer Enquiries
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {selectedListingForEnquiries.year} {selectedListingForEnquiries.make} {selectedListingForEnquiries.model}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedListingForEnquiries(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {enquiries.filter((e) => e.listingId === selectedListingForEnquiries.id).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <MessageSquare size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <p>No enquiries received for this listing yet.</p>
                </div>
              ) : (
                enquiries
                  .filter((e) => e.listingId === selectedListingForEnquiries.id)
                  .map((enq) => (
                    <div
                      key={enq.id}
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-medium)',
                        padding: '1.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                            {enq.buyerName}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                            <span>Email: {enq.buyerEmail}</span>
                            {enq.buyerPhone && <span>Phone: {enq.buyerPhone}</span>}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(enq.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {enq.offeredPrice && (
                        <div
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(0, 240, 255, 0.1)',
                            color: 'var(--accent-cyan)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                          }}
                        >
                          Offer: {selectedListingForEnquiries.currency} {enq.offeredPrice.toLocaleString()}
                        </div>
                      )}

                      <div
                        style={{
                          padding: '0.85rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.25)',
                          borderRadius: '8px',
                          fontSize: '0.88rem',
                          color: '#ffffff',
                          lineHeight: 1.5,
                          marginBottom: '0.75rem',
                        }}
                      >
                        "{enq.message}"
                      </div>

                      {/* Existing Seller Reply */}
                      {enq.sellerReply && (
                        <div
                          style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                            borderLeft: '3px solid #10b981',
                            borderRadius: '6px',
                            marginBottom: '0.75rem',
                          }}
                        >
                          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, marginBottom: '0.2rem' }}>
                            Your Reply ({new Date(enq.sellerRepliedAt || '').toLocaleDateString()}):
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#ffffff' }}>{enq.sellerReply}</div>
                        </div>
                      )}

                      {/* Reply Input Box */}
                      {!enq.sellerReply && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="Type reply to buyer..."
                            value={replyTextMap[enq.id] || ''}
                            onChange={(e) => setReplyTextMap({ ...replyTextMap, [enq.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSendReply(enq.id);
                            }}
                            style={{
                              flex: 1,
                              padding: '0.65rem 0.85rem',
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              border: '1px solid var(--border-medium)',
                              borderRadius: '8px',
                              color: '#ffffff',
                              fontSize: '0.85rem',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSendReply(enq.id)}
                            disabled={replySubmittingId === enq.id}
                            style={{
                              padding: '0.65rem 1rem',
                              backgroundColor: 'var(--accent-cyan)',
                              color: '#07090d',
                              borderRadius: '8px',
                              border: 'none',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                          >
                            <Send size={14} />
                            <span>Reply</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
