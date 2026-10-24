// AutoVerse Stage 22: Detailed Vehicle Offer Dossier
// Comprehensive offer terms, eligibility checklist, regional restrictions, and dealer contact flow.

import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Clock,
  ArrowLeft,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
  Share2,
  ChevronRight,
  Info,
  Car,
  X,
  Send,
} from 'lucide-react';
import { getOfferBySlug, getOffersForVehicle } from '../utils/financeStore';
import { VEHICLES } from '../data/vehicles';
import { INITIAL_DEALERSHIPS } from '../data/dealers';

export const OfferDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const offer = useMemo(() => {
    return slug ? getOfferBySlug(slug) : undefined;
  }, [slug]);

  // Sourced vehicle and dealer records
  const vehicle = useMemo(() => {
    if (!offer) return undefined;
    return VEHICLES.find((v) => v.id === offer.vehicleId);
  }, [offer]);

  const dealer = useMemo(() => {
    if (!offer) return undefined;
    return INITIAL_DEALERSHIPS.find((d) => d.id === offer.dealerId);
  }, [offer]);

  // Related offers
  const relatedOffers = useMemo(() => {
    if (!offer) return [];
    return getOffersForVehicle(offer.vehicleId).filter((o) => o.id !== offer.id).slice(0, 3);
  }, [offer]);

  if (!offer) {
    return (
      <div
        style={{
          minHeight: '80vh',
          backgroundColor: '#05070a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239,68,68,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            marginBottom: '1.5rem',
          }}
        >
          <AlertTriangle size={32} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
          Vehicle Offer Not Found or Expired
        </h2>
        <p style={{ color: '#94a3b8', maxWidth: '480px', margin: '0 0 2rem', lineHeight: 1.6 }}>
          The requested incentive bulletin could not be located in our verified dealer registry or has been archived.
        </p>
        <Link
          to="/offers"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.6rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '10px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          <span>Return to All Offers</span>
        </Link>
      </div>
    );
  }

  const isVerified = offer.verificationStatus === 'verified';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: offer.title,
          text: `${offer.benefitFormatted} on ${offer.vehicleTitle} at ${offer.dealerName}`,
          url: window.location.href,
        });
      } catch {
        // User dismissed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Offer link copied to clipboard!');
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#05070a',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        paddingBottom: '6rem',
      }}
    >
      {/* Top Breadcrumb Bar */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: '#070a12',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#94a3b8' }}>
            <Link to="/offers" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              Offers
            </Link>
            <span>/</span>
            <span style={{ color: '#60a5fa' }}>{offer.vehicleTitle}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                backgroundColor: 'rgba(30,41,59,0.7)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                backgroundColor: 'rgba(30,41,59,0.7)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2.5rem' }}>
          {/* Left Column: Dossier Details */}
          <div>
            {/* Header Box */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', marginBottom: '1rem' }}>
                <span
                  style={{
                    backgroundColor: '#1d4ed8',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {offer.category.replace('_', ' ')}
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: isVerified ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                    border: `1px solid ${isVerified ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                    color: isVerified ? '#34d399' : '#fbbf24',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                  }}
                >
                  {isVerified ? <ShieldCheck size={14} /> : <Clock size={14} />}
                  <span>{isVerified ? 'Verified Dealer Bulletin' : 'Awaiting Confirmation'}</span>
                </span>

                {offer.canBeCombined ? (
                  <span
                    style={{
                      backgroundColor: 'rgba(59,130,246,0.12)',
                      border: '1px solid rgba(59,130,246,0.25)',
                      color: '#60a5fa',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                    }}
                  >
                    Combinable Offer
                  </span>
                ) : (
                  <span
                    style={{
                      backgroundColor: 'rgba(148,163,184,0.12)',
                      border: '1px solid rgba(148,163,184,0.25)',
                      color: '#cbd5e1',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                    }}
                  >
                    Standalone Exclusive
                  </span>
                )}
              </div>

              <h1
                style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                  fontWeight: 800,
                  margin: '0 0 0.8rem',
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                }}
              >
                {offer.title}
              </h1>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  color: '#94a3b8',
                  fontSize: '0.95rem',
                }}
              >
                <Building2 size={16} style={{ color: '#60a5fa' }} />
                <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{offer.dealerName}</span>
                <span>•</span>
                <span>{offer.dealerCity}</span>
                <span>•</span>
                <span>{offer.region}</span>
              </div>
            </div>

            {/* Published Benefit Banner */}
            <div
              style={{
                padding: '1.75rem 2rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(16,185,129,0.15) 100%)',
                border: '1px solid rgba(59,130,246,0.3)',
                marginBottom: '2.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1.25rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Advertised Commercial Benefit
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginTop: '0.25rem' }}>
                  {offer.benefitFormatted}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.3rem' }}>
                  {offer.tagline}
                </div>
              </div>

              <Link
                to={`/financing/${offer.vehicleId}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.6rem',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                }}
              >
                <Calculator size={18} style={{ color: '#2563eb' }} />
                <span>Calculate Financing</span>
              </Link>
            </div>

            {/* Visual Hero & Vehicle Link */}
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#0a0f1d',
                border: '1px solid rgba(255,255,255,0.08)',
                marginBottom: '2.5rem',
              }}
            >
              <div style={{ position: 'relative', height: '360px' }}>
                <img
                  src={offer.vehicleImage || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80'}
                  alt={offer.vehicleTitle}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(10,15,29,0.95) 0%, transparent 60%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1.25rem',
                    left: '1.5rem',
                    right: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 600 }}>
                      Eligible Vehicle Architecture
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                      {offer.vehicleTitle}
                    </div>
                    {offer.vehicleVariant && (
                      <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{offer.vehicleVariant}</div>
                    )}
                  </div>

                  {vehicle && (
                    <Link
                      to={`/cars/${vehicle.slug}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.6rem 1rem',
                        backgroundColor: 'rgba(15,23,42,0.85)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      <Car size={14} />
                      <span>View Vehicle Specs</span>
                      <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </div>

              {/* Offer Description */}
              <div style={{ padding: '1.75rem', lineHeight: 1.7, color: '#cbd5e1', fontSize: '0.98rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.75rem' }}>
                  Offer Overview
                </h3>
                <p style={{ margin: 0 }}>{offer.description}</p>
              </div>
            </div>

            {/* Eligibility Requirements Checklist */}
            <div
              style={{
                backgroundColor: '#0a0f1d',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '1.75rem',
                marginBottom: '2.5rem',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: '0 0 1.25rem' }}>
                Eligibility Criteria
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {offer.eligibilityCriteria.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.92rem', color: '#e2e8f0', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div
              style={{
                backgroundColor: '#0a0f1d',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '1.75rem',
                marginBottom: '2.5rem',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: '0 0 1.25rem' }}>
                Terms & Conditions
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.65 }}>
                {offer.termsAndConditions.map((tc, idx) => (
                  <li key={idx} style={{ marginBottom: '0.6rem' }}>
                    {tc}
                  </li>
                ))}
              </ul>

              {offer.exclusions.length > 0 && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '1rem 1.25rem',
                    backgroundColor: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '10px',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171', marginBottom: '0.35rem' }}>
                    Specific Exclusions:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.15rem', color: '#fca5a5', fontSize: '0.85rem' }}>
                    {offer.exclusions.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Honesty Caveat & Source Citation */}
            <div
              style={{
                backgroundColor: 'rgba(30,41,59,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <Info size={22} style={{ color: '#60a5fa', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>Verification & Source Transparency: </span>
                This offer was recorded on {offer.lastVerifiedDate} from &ldquo;{offer.source}&rdquo;. AutoVerse does not guarantee dealer approval or final transaction terms. Final pricing, trade-in valuations, and promotional eligibility remain at the sole discretion of the authorized retailer and credit underwriters.
              </div>
            </div>
          </div>

          {/* Right Column: Action Sidebar & Dealer Contact */}
          <div>
            <div
              style={{
                position: 'sticky',
                top: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.75rem',
              }}
            >
              {/* Dealer Profile Card */}
              <div
                style={{
                  backgroundColor: '#0a0f1d',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Authorized Dealership
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.5rem' }}>
                  {offer.dealerName}
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  {dealer ? dealer.address.street : offer.dealerCity}, {offer.region}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {offer.dealerContactPhone && (
                    <a
                      href={`tel:${offer.dealerContactPhone}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        fontSize: '0.88rem',
                        color: '#cbd5e1',
                        textDecoration: 'none',
                        padding: '0.6rem 0.75rem',
                        backgroundColor: 'rgba(15,23,42,0.8)',
                        borderRadius: '8px',
                      }}
                    >
                      <Phone size={15} style={{ color: '#10b981' }} />
                      <span>{offer.dealerContactPhone}</span>
                    </a>
                  )}

                  {offer.dealerContactEmail && (
                    <a
                      href={`mailto:${offer.dealerContactEmail}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        fontSize: '0.88rem',
                        color: '#cbd5e1',
                        textDecoration: 'none',
                        padding: '0.6rem 0.75rem',
                        backgroundColor: 'rgba(15,23,42,0.8)',
                        borderRadius: '8px',
                      }}
                    >
                      <Mail size={15} style={{ color: '#60a5fa' }} />
                      <span>{offer.dealerContactEmail}</span>
                    </a>
                  )}
                </div>

                <button
                  id="contact-dealer-btn"
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Send size={16} />
                  <span>Contact Dealer About Offer</span>
                </button>

                {dealer && (
                  <Link
                    to={`/dealers/${dealer.slug}`}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      marginTop: '0.9rem',
                      fontSize: '0.82rem',
                      color: '#94a3b8',
                      textDecoration: 'underline',
                    }}
                  >
                    View Complete Dealer Profile & Facility
                  </Link>
                )}
              </div>

              {/* Quick Specs / Dates Box */}
              <div
                style={{
                  backgroundColor: '#0a0f1d',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
                  Offer Validity Specifications
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Effective From:</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{offer.validFrom}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Expires On:</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{offer.validUntil}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Regional Scope:</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>
                      {offer.isNationwide ? 'Nationwide' : 'Region Restricted'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Vehicle Scope:</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>
                      {offer.vehicleCondition === 'new_car' ? 'New Cars Only' : 'Pre-Owned Inventory'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Source Status:</span>
                    <span style={{ color: isVerified ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                      {offer.verificationStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related Offers Widget */}
              {relatedOffers.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#0a0f1d',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                  }}
                >
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
                    More Offers for {offer.vehicleTitle}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {relatedOffers.map((ro) => (
                      <Link
                        key={ro.id}
                        to={`/offers/${ro.slug}`}
                        style={{
                          display: 'block',
                          padding: '0.75rem',
                          backgroundColor: 'rgba(15,23,42,0.8)',
                          borderRadius: '8px',
                          textDecoration: 'none',
                        }}
                      >
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                          {ro.benefitFormatted}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          {ro.dealerName}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Dealer Modal */}
      {contactModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
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
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setContactModalOpen(false);
                setInquirySubmitted(false);
              }}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            {inquirySubmitted ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16,185,129,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                  Inquiry Transmitted to Dealership
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                  Your interest regarding <strong style={{ color: '#f8fafc' }}>{offer.title}</strong> has been logged. An official representative from {offer.dealerName} will contact you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setContactModalOpen(false);
                    setInquirySubmitted(false);
                  }}
                  style={{
                    padding: '0.75rem 1.75rem',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
                  Contact {offer.dealerName}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
                  Inquiring about: <strong style={{ color: '#ffffff' }}>{offer.benefitFormatted}</strong>
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(15,23,42,0.9)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(15,23,42,0.9)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                      Phone / Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(15,23,42,0.9)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                      Message or Inquiry Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Please confirm availability of this offer and test drive booking options..."
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
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
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1.75rem', display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: '0.8rem',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#94a3b8',
                      borderRadius: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 2,
                      padding: '0.8rem',
                      backgroundColor: '#2563eb',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Send Offer Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
