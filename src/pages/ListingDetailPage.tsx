// AutoVerse Stage 21: Used-Car Listing Detail Dossier
// Comprehensive vehicle specification, condition transparency, seller profile, and enquiry submission modal.

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  User,
  MessageSquare,
  Phone,
  Mail,
  Send,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  getListingBySlug,
  recordListingView,
  isListingSaved,
  toggleSaveListing,
  createEnquiry,
  createReport,
  formatMarketplacePrice,
  getAllListings,
} from '../utils/marketplaceStore';
import { useAuth } from '../context/AuthContext';
import type { MarketplaceListing, ReportReason } from '../types/marketplace';

export const ListingDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currentUser, isAuthenticated } = useAuth();
  const userId = currentUser?.id || 'guest_user';

  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Enquiry Modal State
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [offeredPrice, setOfferedPrice] = useState<number | undefined>(undefined);
  const [contactMethod, setContactMethod] = useState<'email' | 'phone' | 'in_app'>('email');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [consentGiven, setConsentGiven] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('misleading_condition');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const found = getListingBySlug(slug);
    setListing(found);
    if (found) {
      recordListingView(found.id);
      setIsSaved(isListingSaved(userId, found.id));
      setSelectedPhotoIndex(0);
    }
  }, [slug, userId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSave = () => {
    if (!listing) return;
    const saved = toggleSaveListing(userId, listing.id);
    setIsSaved(saved);
    showToast(saved ? 'Vehicle added to Saved Listings' : 'Removed from Saved Listings');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Listing URL copied to clipboard!');
  };

  const handleSubmitEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing || !currentUser) return;

    setEnquirySubmitting(true);
    const result = createEnquiry(
      {
        listingId: listing.id,
        message: enquiryMessage,
        offeredPrice: offeredPrice && offeredPrice > 0 ? offeredPrice : undefined,
        preferredContact: contactMethod,
        contactPhone: contactPhone || undefined,
        consentGiven,
      },
      currentUser
    );

    setEnquirySubmitting(false);
    if (result.success) {
      setEnquirySuccess(true);
      showToast('Enquiry delivered to seller successfully!');
    } else {
      showToast(result.error || 'Failed to submit enquiry.');
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    setReportSubmitting(true);
    const result = createReport(
      {
        listingId: listing.id,
        reason: reportReason,
        details: reportDetails,
      },
      {
        id: currentUser?.id || 'anonymous_reporter',
        email: currentUser?.email || 'guest@autoverse.com',
      }
    );

    setReportSubmitting(false);
    if (result.success) {
      setReportSuccess(true);
      showToast('Listing reported to moderation team.');
    } else {
      showToast(result.error || 'Failed to submit report.');
    }
  };

  // Similar vehicles matching make or bodyType
  const similarListings = listing
    ? getAllListings({ includeInactive: false })
        .filter((l) => l.id !== listing.id && (l.make === listing.make || l.bodyType === listing.bodyType))
        .slice(0, 3)
    : [];

  if (!listing) {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '120px', color: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '3rem 1rem' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>Listing Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            This vehicle listing may have been sold, paused, removed, or is awaiting moderator approval.
          </p>
          <Link
            to="/used-cars"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--accent-cyan)',
              color: '#07090d',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Return to Used Cars</span>
          </Link>
        </div>
      </div>
    );
  }

  const isSoldOrInactive = listing.status !== 'active';

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px', color: '#ffffff' }}>
      {/* Toast Notification Banner */}
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

      {/* 1. BREADCRUMBS & TOP ACTIONS */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'rgba(12, 16, 23, 0.8)' }}>
        <div
          className="container"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <Link to="/used-cars" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              Used Cars
            </Link>
            <ChevronRight size={14} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-secondary)' }}>{listing.make}</span>
            <ChevronRight size={14} color="var(--text-muted)" />
            <span style={{ color: '#ffffff', fontWeight: 600 }}>{listing.model}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleToggleSave}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                backgroundColor: isSaved ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: isSaved ? '1px solid var(--accent-cyan)' : '1px solid var(--border-medium)',
                color: isSaved ? 'var(--accent-cyan)' : '#ffffff',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-medium)',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <Share2 size={15} />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowReportModal(true);
                setReportSuccess(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <AlertTriangle size={14} />
              <span>Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inactive notice if sold or paused */}
      {isSoldOrInactive && (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '0.85rem 1rem',
            textAlign: 'center',
            color: '#f59e0b',
            fontSize: '0.9rem',
            fontWeight: 700,
          }}
        >
          Notice: This vehicle listing is currently marked as {listing.status.toUpperCase()}. It is retained for reference and is not publicly discoverable.
        </div>
      )}

      {/* 2. MAIN DOSSIER LAYOUT */}
      <div className="container" style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* LEFT COLUMN: Photo Gallery & In-Depth Details */}
          <div style={{ flex: '1 1 60%' }}>
            {/* Main Stage Photo */}
            <div
              style={{
                position: 'relative',
                height: '420px',
                backgroundColor: '#05070a',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--border-medium)',
                marginBottom: '1rem',
              }}
            >
              <img
                src={listing.images[selectedPhotoIndex] || listing.featuredImage}
                alt={`${listing.year} ${listing.make} ${listing.model}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              <div
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  right: '1rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#ffffff',
                }}
              >
                {selectedPhotoIndex + 1} / {listing.images.length} Photos
              </div>
            </div>

            {/* Thumbnail Strip */}
            {listing.images.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem',
                  marginBottom: '2rem',
                }}
              >
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(idx)}
                    style={{
                      width: '84px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: selectedPhotoIndex === idx ? '2px solid var(--accent-cyan)' : '1px solid var(--border-medium)',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0,
                      opacity: selectedPhotoIndex === idx ? 1 : 0.65,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <img src={img} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Seller Description */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '14px',
                padding: '1.75rem',
                border: '1px solid var(--border-medium)',
                marginBottom: '2rem',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff' }}>
                Seller Description & Overview
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line', fontSize: '0.95rem' }}>
                {listing.description}
              </p>

              {listing.reasonForSelling && (
                <div
                  style={{
                    marginTop: '1.25rem',
                    padding: '0.85rem 1.15rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    borderLeft: '3px solid var(--accent-cyan)',
                  }}
                >
                  <strong style={{ color: '#ffffff', fontSize: '0.85rem' }}>Reason for Selling:</strong>{' '}
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{listing.reasonForSelling}</span>
                </div>
              )}
            </div>

            {/* Condition Transparency & Declared Defects */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '14px',
                padding: '1.75rem',
                border: '1px solid var(--border-medium)',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ShieldCheck size={20} color="var(--accent-cyan)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Condition Transparency & Known Defects
                </h2>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Declared Rating
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'capitalize' }}>
                    {listing.overallCondition.replace('_', ' ')}
                  </div>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Service Record Level
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981', textTransform: 'capitalize' }}>
                    {listing.serviceHistory.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Declared Defects */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  borderRadius: '10px',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.35rem' }}>
                  Seller-Declared Flaws / Imperfections:
                </div>
                <div style={{ fontSize: '0.88rem', color: '#ffffff', lineHeight: 1.5 }}>
                  {listing.declaredDefects}
                </div>
              </div>

              {listing.serviceHistoryNotes && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#ffffff' }}>Service History Notes:</strong> {listing.serviceHistoryNotes}
                </div>
              )}

              <div
                style={{
                  marginTop: '1.25rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.75rem',
                }}
              >
                ⚠️ AutoVerse Policy: Vehicle condition statements are declared by the seller. We recommend buyers arrange a professional pre-purchase inspection (PPI) before payment.
              </div>
            </div>

            {/* Installed Features */}
            {listing.features.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '14px',
                  padding: '1.75rem',
                  border: '1px solid var(--border-medium)',
                  marginBottom: '2rem',
                }}
              >
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff' }}>
                  Notable Installed Options & Packages
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {listing.features.map((feat, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                      }}
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Price, Specs Strip & Contact Action Card */}
          <div style={{ flex: '1 1 35%' }}>
            {/* Primary Action Card (Sticky) */}
            <div
              style={{
                position: 'sticky',
                top: '100px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid var(--border-medium)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
              }}
            >
              {/* Vehicle Title */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {listing.year} Model Year
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, lineHeight: 1.2, margin: '0.25rem 0 0.4rem', color: '#ffffff' }}>
                  {listing.make} {listing.model}
                </h1>
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                  {listing.variant}
                </div>
              </div>

              {/* Price Banner */}
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'rgba(0, 240, 255, 0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Asking Price (Ex-Owner)
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    letterSpacing: '0.02em',
                  }}
                >
                  {formatMarketplacePrice(listing.askingPrice, listing.currency)}
                </div>
              </div>

              {/* Specs Table */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  marginBottom: '1.75rem',
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.45rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Odometer</span>
                  <strong style={{ color: '#ffffff' }}>{listing.mileageKm.toLocaleString()} km</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.45rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fuel / Powertrain</span>
                  <strong style={{ color: '#ffffff', textTransform: 'capitalize' }}>{listing.fuelType}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.45rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Transmission</span>
                  <strong style={{ color: '#ffffff', textTransform: 'capitalize' }}>{listing.transmission}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.45rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Body Style</span>
                  <strong style={{ color: '#ffffff', textTransform: 'capitalize' }}>{listing.bodyType}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.45rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Exterior Color</span>
                  <strong style={{ color: '#ffffff' }}>{listing.color}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.45rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Previous Owners</span>
                  <strong style={{ color: '#ffffff' }}>{listing.previousOwners} Owner{listing.previousOwners > 1 ? 's' : ''}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.45rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Location</span>
                  <strong style={{ color: '#ffffff' }}>{listing.locationCity}, {listing.locationCountry}</strong>
                </div>
                {listing.registrationRegionMasked && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.45rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Registration Region</span>
                    <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {listing.registrationRegionMasked}
                    </strong>
                  </div>
                )}
              </div>

              {/* Seller Profile Summary */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: listing.sellerType === 'dealer' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 240, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {listing.sellerType === 'dealer' ? <Building2 size={18} color="#10b981" /> : <User size={18} color="var(--accent-cyan)" />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                      {listing.sellerName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {listing.sellerType === 'dealer' ? 'Certified Dealership' : 'Verified Individual Driver'}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.3 }}>
                  🔒 Direct seller phone & contact details are provided upon verified enquiry submission.
                </div>
              </div>

              {/* Primary Contact CTA Button */}
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowEnquiryModal(true);
                    setEnquirySuccess(false);
                  }}
                  disabled={isSoldOrInactive}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    backgroundColor: isSoldOrInactive ? '#64748b' : 'var(--accent-cyan)',
                    color: '#07090d',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: isSoldOrInactive ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: isSoldOrInactive ? 'none' : '0 0 25px rgba(0, 240, 255, 0.35)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <MessageSquare size={18} />
                  <span>{isSoldOrInactive ? 'Listing Unavailable' : 'Contact Seller / Make Offer'}</span>
                </button>
              ) : (
                <Link
                  to={`/login?redirect=/used-cars/${listing.slug}`}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    backgroundColor: 'var(--accent-cyan)',
                    color: '#07090d',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 0 25px rgba(0, 240, 255, 0.35)',
                  }}
                >
                  <MessageSquare size={18} />
                  <span>Sign In to Contact Seller</span>
                </Link>
              )}

              {/* Official Catalog Link if mapped */}
              {listing.vehicleSlug && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <Link
                    to={`/vehicles/${listing.vehicleSlug}`}
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--accent-cyan)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span>View Official Technical Specs in Catalog</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. SIMILAR VEHICLES ROW */}
        {similarListings.length > 0 && (
          <div style={{ marginTop: '5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '3rem' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '1.5rem', color: '#ffffff' }}>
              Similar Pre-Owned Vehicles
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {similarListings.map((sim) => (
                <Link
                  key={sim.id}
                  to={`/used-cars/${sim.slug}`}
                  style={{
                    textDecoration: 'none',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-medium)',
                  }}
                >
                  <div style={{ height: '170px', overflow: 'hidden' }}>
                    <img
                      src={sim.featuredImage}
                      alt={sim.model}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                      {sim.year} {sim.make} {sim.model}
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--accent-cyan)', margin: '0.4rem 0' }}>
                      {formatMarketplacePrice(sim.askingPrice, sim.currency)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {sim.mileageKm.toLocaleString()} km • {sim.locationCity}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. ENQUIRY / CONTACT MODAL */}
      {showEnquiryModal && (
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
          onClick={() => setShowEnquiryModal(false)}
        >
          <div
            style={{
              backgroundColor: '#0c1017',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Contact Seller
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Regarding: {listing.year} {listing.make} {listing.model}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEnquiryModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {enquirySuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={54} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                  Enquiry Dispatched!
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Your enquiry has been delivered to <strong>{listing.sellerName}</strong>. You can monitor seller replies in your
                  <strong> My Enquiries</strong> console.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <Link
                    to="/my-enquiries"
                    style={{
                      padding: '0.7rem 1.4rem',
                      backgroundColor: 'var(--accent-cyan)',
                      color: '#07090d',
                      borderRadius: '8px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                    }}
                  >
                    View My Enquiries
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowEnquiryModal(false)}
                    style={{
                      padding: '0.7rem 1.2rem',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-medium)',
                      color: '#ffffff',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnquiry}>
                {/* Offered Price (Optional) */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Offer Price (Optional, {listing.currency})
                  </label>
                  <input
                    type="number"
                    placeholder={`Asking: ${listing.askingPrice.toLocaleString()}`}
                    value={offeredPrice || ''}
                    onChange={(e) => setOfferedPrice(e.target.value ? Number(e.target.value) : undefined)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Preferred Contact Method */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Preferred Contact Channel
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {[
                      { id: 'email', label: 'Email', icon: Mail },
                      { id: 'phone', label: 'Phone / WA', icon: Phone },
                      { id: 'in_app', label: 'In-App', icon: MessageSquare },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const active = contactMethod === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setContactMethod(opt.id as any)}
                          style={{
                            padding: '0.6rem 0.5rem',
                            borderRadius: '8px',
                            backgroundColor: active ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                            border: active ? '1px solid var(--accent-cyan)' : '1px solid var(--border-medium)',
                            color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          <Icon size={14} />
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {contactMethod === 'phone' && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Your Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                {/* Message Box */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Message to Seller *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Hi, I am interested in viewing this vehicle in person. Is the service history complete and are you open to inspection?"
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Consent Checkbox */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    marginBottom: '1.5rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4,
                  }}
                >
                  <input
                    type="checkbox"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: 'var(--accent-cyan)' }}
                  />
                  <span>
                    I consent to AutoVerse securely sharing my message and chosen contact method with the seller for the sole purpose of this vehicle transaction.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={enquirySubmitting || !consentGiven || enquiryMessage.trim().length < 10}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    backgroundColor: 'var(--accent-cyan)',
                    color: '#07090d',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    opacity: !consentGiven || enquiryMessage.trim().length < 10 ? 0.6 : 1,
                  }}
                >
                  <Send size={16} />
                  <span>{enquirySubmitting ? 'Sending Enquiry...' : 'Submit Vehicle Enquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. REPORT LISTING MODAL */}
      {showReportModal && (
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
          onClick={() => setShowReportModal(false)}
        >
          <div
            style={{
              backgroundColor: '#0c1017',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} color="#ef4444" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Report Vehicle Listing
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {reportSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                  Report Submitted
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                  Thank you for keeping AutoVerse safe. Our moderation team will review this listing against our marketplace integrity rules.
                </p>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  style={{
                    padding: '0.65rem 1.5rem',
                    backgroundColor: 'var(--accent-cyan)',
                    color: '#07090d',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Reason for Report
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value as ReportReason)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="misleading_condition">Misleading Condition or Hidden Defects</option>
                    <option value="pricing_fraud">Pricing Fraud or Deposit Scam</option>
                    <option value="suspected_duplicate">Suspected Duplicate Listing</option>
                    <option value="stolen_unauthorized">Unauthorized / Unverified Ownership</option>
                    <option value="inappropriate_content">Inappropriate Text or Photos</option>
                    <option value="other">Other Violation</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Report Details & Evidence *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe specific details about why this listing violates marketplace rules (min 10 characters)..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={reportSubmitting || reportDetails.trim().length < 10}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.92rem',
                    opacity: reportDetails.trim().length < 10 ? 0.6 : 1,
                  }}
                >
                  {reportSubmitting ? 'Submitting Report...' : 'Submit Report to Moderators'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
