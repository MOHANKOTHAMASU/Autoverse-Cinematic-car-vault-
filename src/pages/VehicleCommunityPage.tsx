import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  MessageSquare,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Send,
  X,
} from 'lucide-react';
import { VEHICLES } from '../data/vehicles';
import {
  getReviewsByVehicle,
  getVehicleCommunitySummary,
  getDiscussions,
  createDiscussion,
  getDiscussionReplies,
  addDiscussionReply,
} from '../utils/communityStore';
import type { OwnerReview, VehicleDiscussion, DiscussionCategory } from '../types/community';
import { RatingBreakdownCard } from '../components/community/RatingBreakdownCard';
import { OwnerReviewCard } from '../components/community/OwnerReviewCard';
import { VerifiedOwnerBadgeModal } from '../components/community/VerifiedOwnerBadgeModal';
import { useAuth } from '../context/AuthContext';

export const VehicleCommunityPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currentUser, isAuthenticated } = useAuth();

  const vehicle = VEHICLES.find((v) => v.slug === slug || v.id === slug);

  const [reviews, setReviews] = useState<OwnerReview[]>([]);
  const [discussions, setDiscussions] = useState<VehicleDiscussion[]>([]);
  const [activeTab, setActiveTab] = useState<'reviews' | 'discussions'>('reviews');
  const [showVerifiedExplainer, setShowVerifiedExplainer] = useState(false);

  // Discussion Modal
  const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false);
  const [newDiscTitle, setNewDiscTitle] = useState('');
  const [newDiscContent, setNewDiscContent] = useState('');
  const [newDiscCategory, setNewDiscCategory] = useState<DiscussionCategory>('general');
  const [newDiscTags, setNewDiscTags] = useState('');
  const [discError, setDiscError] = useState<string | null>(null);

  // Selected Discussion for Thread View
  const [selectedDiscussion, setSelectedDiscussion] = useState<VehicleDiscussion | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);

  // Review Filters
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterMinRating, setFilterMinRating] = useState(0);

  const loadData = () => {
    if (!slug) return;
    setReviews(getReviewsByVehicle(slug));
    setDiscussions(getDiscussions(slug));
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('autoverse_reviews_updated', handleUpdate);
    window.addEventListener('autoverse_discussions_updated', handleUpdate);
    return () => {
      window.removeEventListener('autoverse_reviews_updated', handleUpdate);
      window.removeEventListener('autoverse_discussions_updated', handleUpdate);
    };
  }, [slug]);

  if (!vehicle) {
    return (
      <div style={{ paddingTop: 'calc(var(--header-height) + 4rem)', minHeight: '80vh', textAlign: 'center', color: '#ffffff' }}>
        <h2>Vehicle Not Found</h2>
        <p style={{ color: 'var(--text-muted)' }}>The vehicle requested does not exist in our catalog.</p>
        <Link to="/community" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Community Hub
        </Link>
      </div>
    );
  }

  const summary = getVehicleCommunitySummary(slug || vehicle.slug);

  const filteredReviews = reviews.filter((r) => {
    if (filterVerifiedOnly && r.verificationStatus !== 'verified') return false;
    if (filterMinRating > 0 && r.overallRating < filterMinRating) return false;
    return true;
  });

  const handleCreateDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !currentUser) {
      setDiscError('Please sign in to start a community discussion.');
      return;
    }

    const tagsArray = newDiscTags.split(',').map((t) => t.trim()).filter(Boolean);
    const res = createDiscussion(
      {
        vehicleSlug: vehicle.slug || vehicle.id,
        title: newDiscTitle,
        content: newDiscContent,
        category: newDiscCategory,
        tags: tagsArray,
      },
      currentUser
    );

    if (res.success) {
      setIsDiscussionModalOpen(false);
      setNewDiscTitle('');
      setNewDiscContent('');
      setNewDiscTags('');
      setDiscError(null);
      loadData();
    } else {
      setDiscError(res.error || 'Failed to post discussion.');
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !currentUser) {
      setReplyError('Please sign in to reply to this thread.');
      return;
    }
    if (!selectedDiscussion) return;

    const res = addDiscussionReply(selectedDiscussion.id, replyContent, currentUser);
    if (res.success) {
      setReplyContent('');
      setReplyError(null);
      loadData();
    } else {
      setReplyError(res.error || 'Failed to submit reply.');
    }
  };

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Back Link */}
        <Link
          to="/community"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
          }}
          className="hover-cyan"
        >
          <ArrowLeft size={16} />
          <span>Back to All Community Reviews</span>
        </Link>

        {/* 1. VEHICLE HEADER CARD */}
        <div
          className="card-glass"
          style={{
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
            border: '1px solid rgba(0, 240, 255, 0.25)',
          }}
        >
          {/* Left: Thumbnail & Model Information */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <img
              src={vehicle.thumbnail || vehicle.heroImage}
              alt={`${vehicle.brand} ${vehicle.model}`}
              style={{
                width: '160px',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            />

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {vehicle.brand}
              </span>
              <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#ffffff', margin: '0.2rem 0 0.4rem 0', fontFamily: 'var(--font-heading)' }}>
                {vehicle.model}
              </h1>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {vehicle.variant} • {vehicle.modelYear || vehicle.year} • {vehicle.powertrain.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <Link
              to={`/cars/${vehicle.slug || vehicle.id}`}
              className="btn btn-secondary"
              style={{ padding: '0.65rem 1.15rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <ExternalLink size={14} />
              <span>Technical Specs</span>
            </Link>

            <Link
              to={`/community/write-review/${vehicle.slug || vehicle.id}`}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <PlusCircle size={15} />
              <span>Write Owner Review</span>
            </Link>
          </div>
        </div>

        {/* 2. RATING SUMMARY BREAKDOWN */}
        <section style={{ marginBottom: '2.5rem' }}>
          <RatingBreakdownCard
            summary={summary}
            onOpenVerifiedExplainer={() => setShowVerifiedExplainer(true)}
          />
        </section>

        {/* 3. TABS: REVIEWS VS DISCUSSIONS */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  setActiveTab('reviews');
                  setSelectedDiscussion(null);
                }}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'reviews' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                  color: activeTab === 'reviews' ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Star size={16} color={activeTab === 'reviews' ? 'var(--accent-cyan)' : 'currentColor'} />
                <span>Owner Reviews ({reviews.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('discussions')}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'discussions' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                  color: activeTab === 'discussions' ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <MessageSquare size={16} color={activeTab === 'discussions' ? 'var(--accent-cyan)' : 'currentColor'} />
                <span>Technical Discussions ({discussions.length})</span>
              </button>
            </div>

            {activeTab === 'discussions' && !selectedDiscussion && (
              <button
                onClick={() => setIsDiscussionModalOpen(true)}
                className="btn btn-secondary"
                style={{
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  borderColor: 'rgba(0, 240, 255, 0.35)',
                  color: 'var(--accent-cyan)',
                }}
              >
                <PlusCircle size={14} />
                <span>Ask a Question</span>
              </button>
            )}
          </div>

          {/* TAB 1: REVIEWS CONTENT */}
          {activeTab === 'reviews' && (
            <div>
              {/* Quick Filters for Reviews */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                <button
                  onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: filterVerifiedOnly ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundColor: filterVerifiedOnly ? 'rgba(16, 185, 129, 0.15)' : 'rgba(10, 14, 22, 0.8)',
                    color: filterVerifiedOnly ? '#10b981' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <ShieldCheck size={13} />
                  <span>Verified Owners Only ({summary.verifiedOwnerReviewsCount})</span>
                </button>

                <select
                  value={filterMinRating}
                  onChange={(e) => setFilterMinRating(Number(e.target.value))}
                  style={{
                    padding: '0.35rem 0.75rem',
                    backgroundColor: 'rgba(10, 14, 22, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    outline: 'none',
                  }}
                >
                  <option value={0}>All Ratings (1–5 Stars)</option>
                  <option value={4}>4.0 Stars & Above</option>
                  <option value={4.5}>4.5 Stars & Above</option>
                </select>

                {(filterVerifiedOnly || filterMinRating > 0) && (
                  <button
                    onClick={() => {
                      setFilterVerifiedOnly(false);
                      setFilterMinRating(0);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {filteredReviews.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem 2rem',
                    backgroundColor: 'rgba(10, 14, 22, 0.5)',
                    borderRadius: '12px',
                    border: '1px dashed var(--border-medium)',
                  }}
                >
                  <Star size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                    No reviews match the current criteria
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Be the first driver to contribute an official ownership review for the {vehicle.model}!
                  </p>
                  <Link
                    to={`/community/write-review/${vehicle.slug || vehicle.id}`}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Write an Owner Review
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {filteredReviews.map((rev) => (
                    <OwnerReviewCard key={rev.id} review={rev} showVehicleLink={false} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TECHNICAL DISCUSSIONS */}
          {activeTab === 'discussions' && (
            <div>
              {/* Selected Discussion Thread View */}
              {selectedDiscussion ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <button
                    onClick={() => setSelectedDiscussion(null)}
                    style={{
                      alignSelf: 'flex-start',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Discussions List</span>
                  </button>

                  {/* Original Thread Post */}
                  <div
                    className="card-glass"
                    style={{
                      borderRadius: '14px',
                      padding: '1.75rem',
                      backgroundColor: 'rgba(10, 14, 22, 0.95)',
                      border: '1px solid var(--border-medium)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        {selectedDiscussion.title}
                      </h2>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(0, 240, 255, 0.1)',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          color: 'var(--accent-cyan)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {selectedDiscussion.category.replace('_', ' ')}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                      {selectedDiscussion.content}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: '#ffffff' }}>{selectedDiscussion.authorName}</span>
                        {selectedDiscussion.isVerifiedOwner && (
                          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                            <ShieldCheck size={12} /> VERIFIED OWNER
                          </span>
                        )}
                        <span>•</span>
                        <span>{new Date(selectedDiscussion.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Replies List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1.5rem', borderLeft: '2px solid rgba(0, 240, 255, 0.2)' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                      Community Replies ({getDiscussionReplies(selectedDiscussion.id).length})
                    </h3>

                    {getDiscussionReplies(selectedDiscussion.id).map((rep) => (
                      <div
                        key={rep.id}
                        style={{
                          backgroundColor: 'rgba(10, 14, 22, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '10px',
                          padding: '1.25rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <strong style={{ color: '#ffffff' }}>{rep.authorName}</strong>
                            {rep.isVerifiedOwner && (
                              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700, fontSize: '0.68rem' }}>
                                <ShieldCheck size={11} /> VERIFIED OWNER
                              </span>
                            )}
                          </div>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {new Date(rep.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                          {rep.content}
                        </p>
                      </div>
                    ))}

                    {/* Reply Input Form */}
                    <form onSubmit={handleSendReply} style={{ marginTop: '0.5rem' }}>
                      {replyError && (
                        <div style={{ fontSize: '0.8rem', color: '#ef4444', marginBottom: '0.5rem' }}>
                          {replyError}
                        </div>
                      )}
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Contribute your technical insights or response to this thread..."
                        rows={3}
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(7, 9, 13, 0.8)',
                          border: '1px solid var(--border-medium)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                          outline: 'none',
                          resize: 'none',
                          marginBottom: '0.65rem',
                        }}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                      >
                        <Send size={13} />
                        <span>Post Reply</span>
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* Discussions List */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {discussions.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '3rem 2rem',
                        backgroundColor: 'rgba(10, 14, 22, 0.5)',
                        borderRadius: '12px',
                        border: '1px dashed var(--border-medium)',
                      }}
                    >
                      <MessageSquare size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                        No technical discussions started yet
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        Have a question about winter range, tire setups, or firmware updates?
                      </p>
                      <button
                        onClick={() => setIsDiscussionModalOpen(true)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.85rem' }}
                      >
                        Start the First Discussion
                      </button>
                    </div>
                  ) : (
                    discussions.map((disc) => (
                      <div
                        key={disc.id}
                        className="card-glass"
                        style={{
                          borderRadius: '12px',
                          padding: '1.35rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.65rem',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => setSelectedDiscussion(disc)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                            {disc.title}
                          </h3>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: 'var(--text-secondary)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {disc.category.replace('_', ' ')}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                          {disc.content.slice(0, 160)}...
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-muted)', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span>By {disc.authorName}</span>
                            {disc.isVerifiedOwner && (
                              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700, fontSize: '0.68rem' }}>
                                <ShieldCheck size={11} /> VERIFIED
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MessageSquare size={12} /> {disc.replyCount} {disc.replyCount === 1 ? 'Reply' : 'Replies'}
                            </span>
                            <ChevronRight size={14} color="var(--accent-cyan)" />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Start Discussion Modal */}
      {isDiscussionModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setIsDiscussionModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: '#0a0d14',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '2rem',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsDiscussionModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
              Start Discussion: {vehicle.brand} {vehicle.model}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Ask questions or share technical setup tips with other verified owners and enthusiasts.
            </p>

            {discError && (
              <div style={{ padding: '0.65rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem' }}>
                {discError}
              </div>
            )}

            <form onSubmit={handleCreateDiscussion} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Discussion Title *
                </label>
                <input
                  type="text"
                  value={newDiscTitle}
                  onChange={(e) => setNewDiscTitle(e.target.value)}
                  placeholder="e.g. Winter highway consumption telemetry on 20-inch wheels..."
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Category
                </label>
                <select
                  value={newDiscCategory}
                  onChange={(e) => setNewDiscCategory(e.target.value as DiscussionCategory)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="general">General Vehicle Questions</option>
                  <option value="troubleshooting">Troubleshooting & Error Codes</option>
                  <option value="modifications">Modifications & Aftermarket</option>
                  <option value="buying_advice">Buying Advice & Trim Comparisons</option>
                  <option value="range_efficiency">Range & Real-World Efficiency</option>
                  <option value="maintenance">Maintenance & Service Schedules</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Discussion Content * (min 20 characters)
                </label>
                <textarea
                  value={newDiscContent}
                  onChange={(e) => setNewDiscContent(e.target.value)}
                  placeholder="Provide complete details, testing circumstances, or questions..."
                  rows={4}
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff', fontSize: '0.85rem', outline: 'none', resize: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Tags (Optional, comma-separated)
                </label>
                <input
                  type="text"
                  value={newDiscTags}
                  onChange={(e) => setNewDiscTags(e.target.value)}
                  placeholder="e.g. fast-charging, tires, firmware"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsDiscussionModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.35rem', fontSize: '0.85rem' }}
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verified Owner Badge Explainer Modal */}
      <VerifiedOwnerBadgeModal
        isOpen={showVerifiedExplainer}
        onClose={() => setShowVerifiedExplainer(false)}
      />
    </div>
  );
};
