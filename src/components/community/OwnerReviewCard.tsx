import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  AlertTriangle,
  Clock,
  Navigation,
  Gauge,
  Edit2,
  Trash2,
  Share2,
} from 'lucide-react';
import type { OwnerReview } from '../../types/community';
import { useAuth } from '../../context/AuthContext';
import {
  toggleHelpfulVote,
  getUserVote,
  toggleSaveCommunityItem,
  isItemSaved,
} from '../../utils/communityStore';
import { VerifiedOwnerBadgeModal } from './VerifiedOwnerBadgeModal';
import { ReportContentModal } from './ReportContentModal';

interface OwnerReviewCardProps {
  review: OwnerReview;
  onEdit?: (review: OwnerReview) => void;
  onDelete?: (reviewId: string) => void;
  showVehicleLink?: boolean;
}

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

export const OwnerReviewCard: React.FC<OwnerReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  showVehicleLink = true,
}) => {
  const { currentUser, isAuthenticated } = useAuth();

  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [notHelpfulCount, setNotHelpfulCount] = useState(review.notHelpfulCount || 0);
  const [userVote, setUserVote] = useState<'helpful' | 'not_helpful' | null>(
    currentUser ? getUserVote('review', review.id, currentUser.id) : null
  );
  const [saved, setSaved] = useState(
    currentUser ? isItemSaved('review', review.id, currentUser.id) : false
  );
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const isAuthor = currentUser && currentUser.id === review.authorId;
  const isAdmin = currentUser && currentUser.role === 'admin';

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
      setSaved(res.isSaved);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/community/reviews/${review.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    });
  };

  return (
    <article
      className="card-glass"
      style={{
        backgroundColor: 'rgba(10, 14, 22, 0.95)',
        border: '1px solid var(--border-medium)',
        borderRadius: '14px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
        position: 'relative',
      }}
    >
      {/* 1. Top Bar: Author, Verified Badge, Vehicle Title, Rating */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        {/* Author & Vehicle Meta */}
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
          {/* Avatar or Monogram */}
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              overflow: 'hidden',
              flexShrink: 0,
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
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                {review.authorName}
              </span>

              {/* Verified Owner Badge */}
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
                    transition: 'all 0.15s ease',
                  }}
                  title="Verified Owner audited by AutoVerse Concierge. Click for details."
                >
                  <ShieldCheck size={12} />
                  <span>VERIFIED OWNER</span>
                </button>
              )}
            </div>

            {/* Vehicle Model & Variant */}
            {showVehicleLink ? (
              <Link
                to={`/community/vehicles/${review.vehicleSlug}`}
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--accent-cyan)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'inline-block',
                  marginTop: '2px',
                }}
                className="hover-cyan"
              >
                {review.vehicleBrand} {review.vehicleModel} • {review.vehicleVariant}
              </Link>
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {review.vehicleVariant}
              </span>
            )}
          </div>
        </div>

        {/* Rating Score & Date */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={15}
                  fill={star <= Math.round(review.overallRating) ? '#f59e0b' : 'transparent'}
                  color={star <= Math.round(review.overallRating) ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)'}
                />
              ))}
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b' }}>
              {review.overallRating.toFixed(1)}
            </span>
          </div>

          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* 2. Ownership Metadata Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '0.74rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Clock size={12} color="var(--accent-cyan)" />
          {DURATION_LABELS[review.ownershipDuration] || review.ownershipDuration}
        </span>

        <span
          style={{
            fontSize: '0.74rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Navigation size={12} color="var(--accent-cyan)" />
          {DRIVING_LABELS[review.drivingConditions] || review.drivingConditions}
        </span>

        {review.approximateMileage && (
          <span
            style={{
              fontSize: '0.74rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Gauge size={12} color="var(--accent-cyan)" />
            {review.approximateMileage}
          </span>
        )}
      </div>

      {/* 3. Review Headline & Narrative */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.65rem 0', lineHeight: 1.4 }}>
          {review.title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-line' }}>
          {review.writtenExperience}
        </p>
      </div>

      {/* 4. Pros & Cons Blocks */}
      {(review.pros.length > 0 || review.cons.length > 0) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'rgba(7, 9, 13, 0.6)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {review.pros.length > 0 && (
            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                PROS / HIGHLIGHTS
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                {review.pros.map((p, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem' }}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {review.cons.length > 0 && (
            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                CONS / DRAWBACKS
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                {review.cons.map((c, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem' }}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 5. Ownership Cost Observations (Optional) */}
      {review.ownershipCostObservations && Object.values(review.ownershipCostObservations).some(Boolean) && (
        <div
          style={{
            fontSize: '0.8rem',
            padding: '0.85rem 1rem',
            backgroundColor: 'rgba(0, 240, 255, 0.04)',
            border: '1px dashed rgba(0, 240, 255, 0.25)',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Real-World Running Cost Notes
          </div>
          {review.ownershipCostObservations.fuelEconomyObserved && (
            <div><strong>Observed Efficiency:</strong> {review.ownershipCostObservations.fuelEconomyObserved}</div>
          )}
          {review.ownershipCostObservations.annualMaintenanceCost && (
            <div><strong>Annual Service Cost:</strong> {review.ownershipCostObservations.annualMaintenanceCost}</div>
          )}
          {review.ownershipCostObservations.unexpectedRepairs && (
            <div><strong>Repairs / Warranty:</strong> {review.ownershipCostObservations.unexpectedRepairs}</div>
          )}
        </div>
      )}

      {/* 6. Footer: Helpful voting, Save, Share, Report, Edit/Delete */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Left: Helpful Voting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Was this review helpful?</span>

          <button
            onClick={() => handleVote('helpful')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              border: userVote === 'helpful' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: userVote === 'helpful' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: userVote === 'helpful' ? '#10b981' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            title="Mark as helpful"
          >
            <ThumbsUp size={13} />
            <span>{helpfulCount}</span>
          </button>

          <button
            onClick={() => handleVote('not_helpful')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              border: userVote === 'not_helpful' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: userVote === 'not_helpful' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: userVote === 'not_helpful' ? '#ef4444' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            title="Mark as not helpful"
          >
            <ThumbsDown size={13} />
            <span>{notHelpfulCount}</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Save / Bookmark Button */}
          <button
            onClick={handleToggleSave}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              border: saved ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: saved ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
              color: saved ? 'var(--accent-cyan)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            title={saved ? 'Remove from Saved Reviews' : 'Save Review'}
          >
            <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: 'transparent',
              color: copiedShare ? '#10b981' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}
            title="Copy review link"
          >
            <Share2 size={13} />
            <span>{copiedShare ? 'Copied!' : 'Share'}</span>
          </button>

          {/* Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.78rem',
            }}
            title="Report this review for moderation"
          >
            <AlertTriangle size={13} />
            <span>Report</span>
          </button>

          {/* Author / Admin Edit & Delete Actions */}
          {(isAuthor || isAdmin) && (
            <>
              {onEdit && (
                <button
                  onClick={() => onEdit(review)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    backgroundColor: 'rgba(0, 240, 255, 0.08)',
                    color: 'var(--accent-cyan)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                  title="Edit Review"
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this review?')) {
                      onDelete(review.id);
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                  title="Delete Review"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              )}
            </>
          )}
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

      {/* Content Report Modal */}
      <ReportContentModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="review"
        targetId={review.id}
        targetTitle={review.title}
      />
    </article>
  );
};
