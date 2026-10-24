import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Star,
  MessageSquare,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getUserSavedReviews,
  getUserSavedDiscussions,
  toggleSaveCommunityItem,
} from '../utils/communityStore';
import type { OwnerReview, VehicleDiscussion } from '../types/community';
import { OwnerReviewCard } from '../components/community/OwnerReviewCard';

export const SavedCommunityPage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'reviews' | 'discussions'>('reviews');
  const [savedReviews, setSavedReviews] = useState<OwnerReview[]>([]);
  const [savedDiscussions, setSavedDiscussions] = useState<VehicleDiscussion[]>([]);

  const loadSaved = () => {
    if (currentUser) {
      setSavedReviews(getUserSavedReviews(currentUser.id));
      setSavedDiscussions(getUserSavedDiscussions(currentUser.id));
    }
  };

  useEffect(() => {
    loadSaved();
    const handleUpdate = () => loadSaved();
    window.addEventListener('autoverse_community_saved_updated', handleUpdate);
    return () => window.removeEventListener('autoverse_community_saved_updated', handleUpdate);
  }, [currentUser]);

  const handleRemoveDiscussion = (e: React.MouseEvent, discId: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    toggleSaveCommunityItem('discussion', discId, currentUser);
    loadSaved();
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <div style={{ paddingTop: 'calc(var(--header-height) + 4rem)', minHeight: '80vh', textAlign: 'center', color: '#ffffff' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', padding: '2.5rem', backgroundColor: 'rgba(10, 14, 22, 0.95)', border: '1px solid var(--border-medium)', borderRadius: '16px' }}>
          <Bookmark size={36} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Saved Community Content</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Sign in to access your saved vehicle reviews and technical forum threads.
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
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            PERSONAL DRIVER DOSSIER
          </span>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0', fontFamily: 'var(--font-heading)' }}>
            Saved Reviews & Discussions
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Your private repository of bookmarked owner feedback, reliability logs, and community forum threads.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.75rem' }}>
          <button
            onClick={() => setActiveTab('reviews')}
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
            <span>Saved Reviews ({savedReviews.length})</span>
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
            <span>Saved Discussions ({savedDiscussions.length})</span>
          </button>
        </div>

        {/* Tab 1: Saved Reviews */}
        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {savedReviews.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  backgroundColor: 'rgba(10, 14, 22, 0.6)',
                  borderRadius: '16px',
                  border: '1px dashed var(--border-medium)',
                }}
              >
                <Bookmark size={36} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                  No Saved Reviews Yet
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                  Click the "Save" icon on any owner review to bookmark it for future comparison and purchase research.
                </p>
                <Link to="/community" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  Explore Community Reviews
                </Link>
              </div>
            ) : (
              savedReviews.map((rev) => (
                <OwnerReviewCard key={rev.id} review={rev} />
              ))
            )}
          </div>
        )}

        {/* Tab 2: Saved Discussions */}
        {activeTab === 'discussions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {savedDiscussions.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  backgroundColor: 'rgba(10, 14, 22, 0.6)',
                  borderRadius: '16px',
                  border: '1px dashed var(--border-medium)',
                }}
              >
                <MessageSquare size={36} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                  No Saved Discussions
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                  Bookmark technical questions, setup tips, or buying advice threads to track updates.
                </p>
                <Link to="/community" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  Browse Technical Forums
                </Link>
              </div>
            ) : (
              savedDiscussions.map((disc) => (
                <div
                  key={disc.id}
                  className="card-glass"
                  style={{
                    borderRadius: '12px',
                    padding: '1.35rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => navigate(`/community/vehicles/${disc.vehicleSlug}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {disc.vehicleBrand} {disc.vehicleModel}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: '0.2rem 0' }}>
                        {disc.title}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => handleRemoveDiscussion(e, disc.id)}
                      title="Remove from saved"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                    {disc.content.slice(0, 160)}...
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span>By {disc.authorName}</span>
                    <span style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Open Thread <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
