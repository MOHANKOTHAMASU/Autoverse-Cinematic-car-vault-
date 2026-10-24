import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Edit2,
  Trash2,
  PlusCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getReviewsByAuthor, deleteOwnerReview } from '../utils/communityStore';
import type { OwnerReview } from '../types/community';
import { VerifiedOwnerBadgeModal } from '../components/community/VerifiedOwnerBadgeModal';

export const MyReviewsPage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<OwnerReview[]>([]);
  const [selectedReviewForModal, setSelectedReviewForModal] = useState<OwnerReview | null>(null);

  const loadUserReviews = () => {
    if (currentUser) {
      setReviews(getReviewsByAuthor(currentUser.id));
    }
  };

  useEffect(() => {
    loadUserReviews();
    const handleUpdate = () => loadUserReviews();
    window.addEventListener('autoverse_reviews_updated', handleUpdate);
    return () => window.removeEventListener('autoverse_reviews_updated', handleUpdate);
  }, [currentUser]);

  const handleDelete = (reviewId: string) => {
    if (!currentUser) return;
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      const res = deleteOwnerReview(reviewId, currentUser);
      if (res.success) {
        loadUserReviews();
      } else {
        alert(res.error || 'Failed to delete review.');
      }
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <div style={{ paddingTop: 'calc(var(--header-height) + 4rem)', minHeight: '80vh', textAlign: 'center', color: '#ffffff' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', padding: '2.5rem', backgroundColor: 'rgba(10, 14, 22, 0.95)', border: '1px solid var(--border-medium)', borderRadius: '16px' }}>
          <ShieldCheck size={36} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Sign In to View Your Reviews</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Access and manage your submitted vehicle ownership ratings and audit requests.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              DRIVER MANAGEMENT
            </span>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0', fontFamily: 'var(--font-heading)' }}>
              My Owner Reviews
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
              Manage your published vehicle reviews, track verification status, and update ownership observations.
            </p>
          </div>

          <Link
            to="/community/write-review/porsche-taycan-turbo-s"
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <PlusCircle size={15} />
            <span>Write New Review</span>
          </Link>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'rgba(10, 14, 22, 0.6)',
              borderRadius: '16px',
              border: '1px dashed var(--border-medium)',
            }}
          >
            <Star size={36} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              No Reviews Published Yet
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.75rem auto' }}>
              Share your daily impressions, maintenance costs, and quirks to help other automotive enthusiasts find their ideal machine.
            </p>
            <Link
              to="/discover"
              className="btn btn-primary"
              style={{ fontSize: '0.88rem' }}
            >
              Explore Vehicles to Review
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="card-glass"
                style={{
                  borderRadius: '14px',
                  padding: '1.5rem',
                  backgroundColor: 'rgba(10, 14, 22, 0.95)',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {/* Top Row: Vehicle Title, Rating, Verification Status */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {rev.vehicleBrand}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '0.15rem 0' }}>
                      {rev.vehicleModel} — <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>{rev.vehicleVariant}</span>
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Verification Status Badge */}
                    {rev.verificationStatus === 'verified' && (
                      <button
                        onClick={() => setSelectedReviewForModal(rev)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '999px',
                          color: '#10b981',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <ShieldCheck size={13} />
                        <span>VERIFIED OWNER</span>
                      </button>
                    )}

                    {rev.verificationStatus === 'pending' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: 'rgba(245, 158, 11, 0.15)',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '999px',
                          color: '#f59e0b',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        <Clock size={13} />
                        <span>AUDIT PENDING</span>
                      </span>
                    )}

                    {rev.verificationStatus === 'rejected' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '999px',
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        <AlertCircle size={13} />
                        <span>VERIFICATION REJECTED</span>
                      </span>
                    )}

                    {/* Star Rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b' }}>
                        {rev.overallRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Headline & Snippet */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                    {rev.title}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {rev.writtenExperience.slice(0, 220)}...
                  </p>
                </div>

                {/* Action Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Published on {new Date(rev.createdAt).toLocaleDateString()} • {rev.helpfulCount} helpful votes
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link
                      to={`/community/reviews/${rev.id}`}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    >
                      View Review
                    </Link>

                    <button
                      onClick={() => navigate(`/community/write-review/${rev.vehicleSlug}?edit=${rev.id}`)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(rev.id)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Explainer Modal */}
      {selectedReviewForModal && (
        <VerifiedOwnerBadgeModal
          isOpen={Boolean(selectedReviewForModal)}
          onClose={() => setSelectedReviewForModal(null)}
          vinMasked={selectedReviewForModal.verificationDetails?.vinMasked}
          documentType={selectedReviewForModal.verificationDetails?.documentType}
          reviewedBy={selectedReviewForModal.verificationDetails?.reviewedBy}
          reviewedAt={selectedReviewForModal.verificationDetails?.reviewedAt}
        />
      )}
    </div>
  );
};
