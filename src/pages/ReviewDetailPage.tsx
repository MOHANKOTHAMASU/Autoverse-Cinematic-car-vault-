import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  AlertTriangle,
  Clock,
  Navigation,
  Gauge,
} from 'lucide-react';
import { VEHICLES } from '../data/vehicles';
import {
  getReviewById,
  toggleHelpfulVote,
  getUserVote,
  toggleSaveCommunityItem,
  isItemSaved,
} from '../utils/communityStore';
import type { OwnerReview } from '../types/community';
import { useAuth } from '../context/AuthContext';
import { VerifiedOwnerBadgeModal } from '../components/community/VerifiedOwnerBadgeModal';
import { ReportContentModal } from '../components/community/ReportContentModal';

const DURATION_LABELS: Record<string, string> = {
  less_than_6_months: '< 6 Months Owned',
  '6_to_12_months': '6–12 Months Owned',
  '1_to_2_years': '1–2 Years Owned',
  '2_to_5_years': '2–5 Years Owned',
  '5_plus_years': '5+ Years Veteran Owner',
};

const DRIVING_LABELS: Record<string, string> = {
  city_commuter: 'Daily Urban Commuter',
  highway_cruiser: 'Long-Distance Highway',
  mixed_daily: 'Mixed Daily Use',
  spirited_track: 'Track & Spirited Drives',
  rural_offroad: 'Rural & Off-Road Terrain',
};

export const ReviewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, isAuthenticated } = useAuth();

  const [review, setReview] = useState<OwnerReview | null>(null);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [notHelpfulCount, setNotHelpfulCount] = useState(0);
  const [userVote, setUserVote] = useState<'helpful' | 'not_helpful' | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = getReviewById(id);
    if (found) {
      setReview(found);
      setHelpfulCount(found.helpfulCount || 0);
      setNotHelpfulCount(found.notHelpfulCount || 0);
      if (currentUser) {
        setUserVote(getUserVote('review', found.id, currentUser.id));
        setIsSaved(isItemSaved('review', found.id, currentUser.id));
      }
    }
  }, [id, currentUser]);

  if (!review) {
    return (
      <div style={{ paddingTop: 'calc(var(--header-height) + 4rem)', minHeight: '80vh', textAlign: 'center', color: '#ffffff' }}>
        <h2>Review Not Found</h2>
        <p style={{ color: 'var(--text-muted)' }}>This owner review does not exist or may have been removed.</p>
        <Link to="/community" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Community Hub
        </Link>
      </div>
    );
  }

  const catalogVehicle = VEHICLES.find((v) => v.slug === review.vehicleSlug || v.id === review.vehicleSlug);

  const handleVote = (voteType: 'helpful' | 'not_helpful') => {
    if (!isAuthenticated || !currentUser) {
      alert('Please sign in to vote on owner reviews.');
      return;
    }
    const res = toggleHelpfulVote('review', review.id, voteType, currentUser);
    if (res.success) {
      setHelpfulCount(res.helpfulCount);
      setNotHelpfulCount(res.notHelpfulCount);
      setUserVote(res.userVote);
    }
  };

  const handleToggleSave = () => {
    if (!isAuthenticated || !currentUser) {
      alert('Please sign in to save reviews to your personal collection.');
      return;
    }
    const res = toggleSaveCommunityItem('review', review.id, currentUser);
    if (res.success) {
      setIsSaved(res.isSaved);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    });
  };

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <Link to="/community" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="hover-cyan">
            Community
          </Link>
          <span>/</span>
          <Link to={`/community/vehicles/${review.vehicleSlug}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }} className="hover-cyan">
            {review.vehicleBrand} {review.vehicleModel}
          </Link>
          <span>/</span>
          <span style={{ color: '#ffffff' }}>Review by {review.authorName}</span>
        </div>

        {/* 1. REVIEW MASTER HEADER */}
        <div
          className="card-glass"
          style={{
            borderRadius: '16px',
            padding: '2.25rem',
            marginBottom: '2rem',
            backgroundColor: 'rgba(10, 14, 22, 0.95)',
            border: '1px solid var(--border-medium)',
          }}
        >
          {/* Author Meta Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 240, 255, 0.15)',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  overflow: 'hidden',
                }}
              >
                {review.authorAvatar ? (
                  <img src={review.authorAvatar} alt={review.authorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  review.authorName.slice(0, 2).toUpperCase()
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                    {review.authorName}
                  </span>
                  {review.verificationStatus === 'verified' && (
                    <button
                      onClick={() => setShowVerifiedModal(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '999px',
                        color: '#10b981',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title="Audited verified owner. Click for details."
                    >
                      <ShieldCheck size={12} />
                      <span>VERIFIED OWNER</span>
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Verified review published on {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Overall Score Emblem */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'rgba(7, 9, 13, 0.8)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                padding: '0.65rem 1.15rem',
                borderRadius: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={18}
                    fill={s <= Math.round(review.overallRating) ? '#f59e0b' : 'transparent'}
                    color={s <= Math.round(review.overallRating) ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)'}
                  />
                ))}
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b' }}>
                {review.overallRating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Vehicle Anchor Card */}
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                VEHICLE UNDER REVIEW
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                {review.vehicleBrand} {review.vehicleModel} — <span style={{ color: 'var(--text-secondary)' }}>{review.vehicleVariant}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link
                to={`/community/vehicles/${review.vehicleSlug}`}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
              >
                All {review.vehicleModel} Reviews
              </Link>
              {catalogVehicle && (
                <Link
                  to={`/cars/${catalogVehicle.slug || catalogVehicle.id}`}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
                >
                  Factory Specs
                </Link>
              )}
            </div>
          </div>

          {/* Metadata Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center', marginBottom: '1.75rem' }}>
            <span
              style={{
                fontSize: '0.78rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <Clock size={13} color="var(--accent-cyan)" />
              {DURATION_LABELS[review.ownershipDuration] || review.ownershipDuration}
            </span>

            <span
              style={{
                fontSize: '0.78rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <Navigation size={13} color="var(--accent-cyan)" />
              {DRIVING_LABELS[review.drivingConditions] || review.drivingConditions}
            </span>

            {review.approximateMileage && (
              <span
                style={{
                  fontSize: '0.78rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <Gauge size={13} color="var(--accent-cyan)" />
                {review.approximateMileage} logged
              </span>
            )}
          </div>

          {/* Headline & Narrative */}
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.35, marginBottom: '1.25rem' }}>
            {review.title}
          </h1>

          <div style={{ fontSize: '1rem', color: '#e2e8f0', lineHeight: 1.8, marginBottom: '2rem', whiteSpace: 'pre-line' }}>
            {review.writtenExperience}
          </div>

          {/* Pros & Cons Section */}
          {(review.pros.length > 0 || review.cons.length > 0) && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                padding: '1.5rem',
                backgroundColor: 'rgba(7, 9, 13, 0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '2rem',
              }}
            >
              {review.pros.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    What The Owner Loves
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#f1f5f9', lineHeight: 1.6 }}>
                    {review.pros.map((p, i) => (
                      <li key={i} style={{ marginBottom: '0.4rem' }}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {review.cons.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Observed Weaknesses & Quirks
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#f1f5f9', lineHeight: 1.6 }}>
                    {review.cons.map((c, i) => (
                      <li key={i} style={{ marginBottom: '0.4rem' }}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Category Scores Grid */}
          {review.categoryRatings && Object.keys(review.categoryRatings).length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                Detailed Category Evaluation
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '1rem',
                }}
              >
                {[
                  { key: 'comfort', label: 'Comfort & Ergonomics', val: review.categoryRatings.comfort },
                  { key: 'performance', label: 'Performance & Throttle', val: review.categoryRatings.performance },
                  { key: 'reliability', label: 'Mechanical Reliability', val: review.categoryRatings.reliability },
                  { key: 'practicality', label: 'Daily Practicality', val: review.categoryRatings.practicality },
                  { key: 'technology', label: 'Infotainment & ADAS', val: review.categoryRatings.technology },
                  { key: 'valueForMoney', label: 'Value for Money', val: review.categoryRatings.valueForMoney },
                ].map((item) => {
                  if (!item.val) return null;
                  return (
                    <div
                      key={item.key}
                      style={{
                        padding: '0.85rem 1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        {item.label}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                          {item.val.toFixed(1)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 5.0</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Running Cost Observations */}
          {review.ownershipCostObservations && Object.values(review.ownershipCostObservations).some(Boolean) && (
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'rgba(0, 240, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                borderRadius: '10px',
                marginBottom: '2rem',
              }}
            >
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
                Real-World Financial & Maintenance Audit
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                {review.ownershipCostObservations.fuelEconomyObserved && (
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Observed Energy / Fuel Economy</div>
                    <div style={{ fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>{review.ownershipCostObservations.fuelEconomyObserved}</div>
                  </div>
                )}
                {review.ownershipCostObservations.annualMaintenanceCost && (
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Annual Maintenance Spend</div>
                    <div style={{ fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>{review.ownershipCostObservations.annualMaintenanceCost}</div>
                  </div>
                )}
                {review.ownershipCostObservations.insuranceExperience && (
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Annual Insurance Premium</div>
                    <div style={{ fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>{review.ownershipCostObservations.insuranceExperience}</div>
                  </div>
                )}
                {review.ownershipCostObservations.unexpectedRepairs && (
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Repairs & Warranty Record</div>
                    <div style={{ fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>{review.ownershipCostObservations.unexpectedRepairs}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Feedback Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Helpful Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Helpful review?</span>

              <button
                onClick={() => handleVote('helpful')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: userVote === 'helpful' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: userVote === 'helpful' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: userVote === 'helpful' ? '#10b981' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                <ThumbsUp size={14} />
                <span>Yes ({helpfulCount})</span>
              </button>

              <button
                onClick={() => handleVote('not_helpful')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: userVote === 'not_helpful' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: userVote === 'not_helpful' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: userVote === 'not_helpful' ? '#ef4444' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                <ThumbsDown size={14} />
                <span>No ({notHelpfulCount})</span>
              </button>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                onClick={handleToggleSave}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: isSaved ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: isSaved ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                  color: isSaved ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
                <span>{isSaved ? 'Saved to Profile' : 'Save Review'}</span>
              </button>

              <button
                onClick={handleShare}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'transparent',
                  color: shareCopied ? '#10b981' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                <Share2 size={14} />
                <span>{shareCopied ? 'Link Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                <AlertTriangle size={14} />
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Explainer Modal */}
      <VerifiedOwnerBadgeModal
        isOpen={showVerifiedModal}
        onClose={() => setShowVerifiedModal(false)}
        vinMasked={review.verificationDetails?.vinMasked}
        documentType={review.verificationDetails?.documentType}
        reviewedBy={review.verificationDetails?.reviewedBy}
        reviewedAt={review.verificationDetails?.reviewedAt}
      />

      {/* Report Modal */}
      <ReportContentModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="review"
        targetId={review.id}
        targetTitle={review.title}
      />
    </div>
  );
};
