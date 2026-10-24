import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  ShieldCheck,
  Star,
  MessageSquare,
  PlusCircle,
  Award,
  ChevronRight,
} from 'lucide-react';
import { VEHICLES } from '../data/vehicles';
import {
  getPublicReviews,
  getDiscussions,
  getHighestRatedVehicles,
  getAllReviews,
} from '../utils/communityStore';
import type { OwnerReview, VehicleDiscussion, OwnershipDuration } from '../types/community';
import { OwnerReviewCard } from '../components/community/OwnerReviewCard';

export const CommunityPage: React.FC = () => {
  const navigate = useNavigate();

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedPowertrain, setSelectedPowertrain] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState<OwnershipDuration | 'all'>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'highest_rated' | 'most_helpful' | 'longest_ownership'>('newest');

  // Active Tab: Reviews vs Discussions
  const [activeTab, setActiveTab] = useState<'reviews' | 'discussions'>('reviews');

  // Live Data State
  const [reviews, setReviews] = useState<OwnerReview[]>([]);
  const [discussions, setDiscussions] = useState<VehicleDiscussion[]>([]);
  const [highestRated, setHighestRated] = useState<{ vehicleSlug: string; averageRating: number; reviewCount: number; verifiedCount: number }[]>([]);

  const loadData = () => {
    setReviews(
      getPublicReviews({
        searchQuery,
        brand: selectedBrand,
        powertrain: selectedPowertrain,
        ownershipDuration: selectedDuration,
        minRating,
        verifiedOnly,
        sortBy,
      })
    );
    setDiscussions(getDiscussions());
    setHighestRated(getHighestRatedVehicles(5));
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
  }, [searchQuery, selectedBrand, selectedPowertrain, selectedDuration, minRating, verifiedOnly, sortBy]);

  // Distinct brands from catalog for filter dropdown
  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(VEHICLES.map((v) => v.brand))).sort();
  }, []);

  // Stats calculation
  const totalVerifiedCount = useMemo(() => {
    return getAllReviews().filter((r) => r.verificationStatus === 'verified' && r.status === 'published').length;
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingBottom: '6rem' }}>
      {/* 1. HERO BANNER */}
      <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 1.5rem', marginBottom: '2.5rem' }}>
        <div
          className="card-glass"
          style={{
            position: 'relative',
            borderRadius: '20px',
            padding: '3rem 2.5rem',
            overflow: 'hidden',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            background: 'linear-gradient(135deg, rgba(10, 16, 26, 0.95) 0%, rgba(7, 9, 13, 0.98) 100%)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '380px',
              height: '380px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                marginBottom: '1rem',
                letterSpacing: '0.04em',
              }}
            >
              <Users size={14} />
              <span>THE AUTOVERSE OWNERS COLLECTIVE</span>
            </div>

            <h1
              style={{
                fontSize: '2.6rem',
                fontWeight: 900,
                fontFamily: 'var(--font-heading)',
                color: '#ffffff',
                lineHeight: 1.15,
                marginBottom: '1rem',
                letterSpacing: '-0.02em',
              }}
            >
              Authentic Owner Ratings, Reviews & Technical Forums
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Unfiltered ownership experiences, audited real-world running costs, and technical discussions from passionate enthusiasts and verified vehicle owners across the globe.
            </p>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {reviews.length}+
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Audited Reviews
                </div>
              </div>

              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                  {totalVerifiedCount}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Verified Owners
                </div>
              </div>

              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                  {discussions.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Active Technical Threads
                </div>
              </div>

              <div style={{ marginLeft: 'auto' }}>
                <Link
                  to="/community/write-review/porsche-taycan-turbo-s"
                  className="btn btn-primary"
                  style={{
                    padding: '0.75rem 1.4rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <PlusCircle size={16} />
                  <span>Write an Owner Review</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HIGHEST-RATED VEHICLES SHOWCASE */}
      {highestRated.length > 0 && (
        <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 1.5rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Award size={20} color="#f59e0b" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Highest-Rated Vehicles by Owners
              </h2>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Calculated dynamically from published owner reviews
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            {highestRated.map((item) => {
              const car = VEHICLES.find((v) => v.slug === item.vehicleSlug || v.id === item.vehicleSlug);
              if (!car) return null;

              return (
                <div
                  key={item.vehicleSlug}
                  className="card-glass"
                  style={{
                    borderRadius: '12px',
                    padding: '1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => navigate(`/community/vehicles/${item.vehicleSlug}`)}
                >
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {car.brand}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: '0.2rem 0 0.4rem 0' }}>
                      {car.model}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={13}
                            fill={s <= Math.round(item.averageRating) ? '#f59e0b' : 'transparent'}
                            color={s <= Math.round(item.averageRating) ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)'}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f59e0b' }}>
                        {item.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-muted)', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span>{item.reviewCount} {item.reviewCount === 1 ? 'Review' : 'Reviews'}</span>
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <ShieldCheck size={12} /> {item.verifiedCount} Verified
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. SEARCH & ADVANCED FILTERS BAR */}
      <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 1.5rem', marginBottom: '2rem' }}>
        <div
          style={{
            backgroundColor: 'rgba(10, 14, 22, 0.95)',
            border: '1px solid var(--border-medium)',
            borderRadius: '14px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Top Row: Search Input + Sort */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <Search
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews by vehicle model, pros, track experience, or keywords..."
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.6rem',
                  backgroundColor: 'rgba(7, 9, 13, 0.8)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '0.65rem 1rem',
                backgroundColor: 'rgba(7, 9, 13, 0.8)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            >
              <option value="newest">Sort: Most Recent Reviews</option>
              <option value="highest_rated">Sort: Highest Overall Rating</option>
              <option value="most_helpful">Sort: Most Helpful Votes</option>
              <option value="longest_ownership">Sort: Longest Ownership Duration</option>
            </select>
          </div>

          {/* Bottom Filter Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                backgroundColor: 'rgba(7, 9, 13, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              <option value="all">All Marques & OEMs</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Powertrain Filter */}
            <select
              value={selectedPowertrain}
              onChange={(e) => setSelectedPowertrain(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                backgroundColor: 'rgba(7, 9, 13, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              <option value="all">All Powertrains</option>
              <option value="electric">Electric (BEV)</option>
              <option value="hybrid">Hybrid</option>
              <option value="petrol">Petrol / ICE</option>
              <option value="diesel">Diesel</option>
            </select>

            {/* Ownership Duration */}
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value as any)}
              style={{
                padding: '0.45rem 0.85rem',
                backgroundColor: 'rgba(7, 9, 13, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              <option value="all">Any Ownership Duration</option>
              <option value="less_than_6_months">&lt; 6 Months</option>
              <option value="6_to_12_months">6 to 12 Months</option>
              <option value="1_to_2_years">1 to 2 Years</option>
              <option value="2_to_5_years">2 to 5 Years</option>
              <option value="5_plus_years">5+ Years</option>
            </select>

            {/* Minimum Rating */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              style={{
                padding: '0.45rem 0.85rem',
                backgroundColor: 'rgba(7, 9, 13, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              <option value={0}>Any Star Rating</option>
              <option value={4}>4.0+ Stars (Recommended)</option>
              <option value={4.5}>4.5+ Stars (Top Rated)</option>
            </select>

            {/* Verified Owner Only Toggle */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: verifiedOnly ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                backgroundColor: verifiedOnly ? 'rgba(16, 185, 129, 0.15)' : 'rgba(7, 9, 13, 0.8)',
                color: verifiedOnly ? '#10b981' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <ShieldCheck size={14} />
              <span>Verified Owners Only</span>
            </button>

            {/* Clear Filters */}
            {(selectedBrand !== 'all' || selectedDuration !== 'all' || minRating > 0 || verifiedOnly || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedBrand('all');
                  setSelectedDuration('all');
                  setMinRating(0);
                  setVerifiedOnly(false);
                  setSearchQuery('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '0.45rem',
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4. MAIN CONTENT TABS & FEED */}
      <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 1.5rem' }}>
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

        {/* Tab 1: Reviews List */}
        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {reviews.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  backgroundColor: 'rgba(10, 14, 22, 0.5)',
                  borderRadius: '12px',
                  border: '1px dashed var(--border-medium)',
                }}
              >
                <Users size={36} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                  No matching owner reviews found
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                  Try adjusting your search criteria or filter combinations to explore more community experiences.
                </p>
                <button
                  onClick={() => {
                    setSelectedBrand('all');
                    setSelectedDuration('all');
                    setMinRating(0);
                    setVerifiedOnly(false);
                    setSearchQuery('');
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              reviews.map((rev) => (
                <OwnerReviewCard key={rev.id} review={rev} />
              ))
            )}
          </div>
        )}

        {/* Tab 2: Technical Discussions List */}
        {activeTab === 'discussions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {discussions.map((disc) => (
              <div
                key={disc.id}
                className="card-glass"
                style={{
                  padding: '1.5rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
                onClick={() => navigate(`/community/vehicles/${disc.vehicleSlug}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {disc.vehicleBrand} {disc.vehicleModel}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: '0.2rem 0' }}>
                      {disc.title}
                    </h3>
                  </div>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {disc.category.replace('_', ' ')}
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {disc.content.slice(0, 180)}...
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span>By {disc.authorName}</span>
                    {disc.isVerifiedOwner && (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700, fontSize: '0.7rem' }}>
                        <ShieldCheck size={11} /> VERIFIED
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageSquare size={13} /> {disc.replyCount} {disc.replyCount === 1 ? 'Reply' : 'Replies'}
                    </span>
                    <ChevronRight size={15} color="var(--accent-cyan)" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
