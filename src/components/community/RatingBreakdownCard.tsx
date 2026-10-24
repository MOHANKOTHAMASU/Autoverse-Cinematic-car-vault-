import React from 'react';
import { Star, ShieldCheck, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { VehicleCommunitySummary } from '../../types/community';

interface RatingBreakdownCardProps {
  summary: VehicleCommunitySummary;
  onOpenVerifiedExplainer?: () => void;
}

export const RatingBreakdownCard: React.FC<RatingBreakdownCardProps> = ({
  summary,
  onOpenVerifiedExplainer,
}) => {
  const {
    totalReviews,
    averageRating,
    ratingDistribution,
    categoryAverages,
    verifiedOwnerReviewsCount,
    isSampleSmall,
    topPros,
    topCons,
  } = summary;

  return (
    <div
      style={{
        backgroundColor: 'rgba(10, 14, 22, 0.95)',
        border: '1px solid var(--border-medium)',
        borderRadius: '16px',
        padding: '1.75rem',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* 1. Header: Big Rating & Verified Badge */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Big Number */}
          <div
            style={{
              fontSize: '3rem',
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              color: '#ffffff',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {totalReviews > 0 ? averageRating.toFixed(1) : '—'}
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 500 }}> / 5.0</span>
          </div>

          <div>
            {/* Stars */}
            <div style={{ display: 'flex', gap: '3px', marginBottom: '0.25rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  fill={star <= Math.round(averageRating) && totalReviews > 0 ? '#f59e0b' : 'transparent'}
                  color={star <= Math.round(averageRating) && totalReviews > 0 ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)'}
                />
              ))}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Based on <strong>{totalReviews}</strong> {totalReviews === 1 ? 'owner review' : 'owner reviews'}
            </div>
          </div>
        </div>

        {/* Verified Owner Count Pill */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
          <button
            onClick={onOpenVerifiedExplainer}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              padding: '0.4rem 0.85rem',
              borderRadius: '999px',
              color: '#10b981',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: onOpenVerifiedExplainer ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}
            title="Click to understand verified owner audit standards"
          >
            <ShieldCheck size={14} />
            <span>{verifiedOwnerReviewsCount} Verified {verifiedOwnerReviewsCount === 1 ? 'Owner' : 'Owners'}</span>
          </button>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Audited registration & title
          </span>
        </div>
      </div>

      {/* Small Sample Warning Notice */}
      {isSampleSmall && totalReviews > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#f59e0b',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Preliminary Community Rating:</strong> This score is calculated from fewer than 3 owner reviews and should be considered an early sample.
          </span>
        </div>
      )}

      {/* 2. Middle Row: Star Distribution Histogram & Category Averages */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Star Rating Histogram */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>
            Rating Distribution
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star as 1 | 2 | 3 | 4 | 5] || 0;
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.8rem' }}>
                  <span style={{ width: '42px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {star} <Star size={11} fill="#f59e0b" color="#f59e0b" />
                  </span>
                  {/* Progress Bar Container */}
                  <div
                    style={{
                      flex: 1,
                      height: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: '#f59e0b',
                        borderRadius: '999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                  <span style={{ width: '28px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Ratings Breakdown */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>
            Category Scores
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {[
              { label: 'Comfort & Ergonomics', score: categoryAverages.comfort },
              { label: 'Performance & Dynamics', score: categoryAverages.performance },
              { label: 'Mechanical Reliability', score: categoryAverages.reliability },
              { label: 'Daily Practicality', score: categoryAverages.practicality },
              { label: 'Technology & Infotainment', score: categoryAverages.technology },
              { label: 'Value for Investment', score: categoryAverages.valueForMoney },
            ].map((cat) => {
              const pct = cat.score > 0 ? (cat.score / 5) * 100 : 0;
              return (
                <div key={cat.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{cat.label}</span>
                    <span style={{ fontWeight: 700, color: cat.score >= 4.5 ? 'var(--accent-cyan)' : '#f8fafc' }}>
                      {cat.score > 0 ? `${cat.score.toFixed(1)} / 5.0` : '—'}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: 'var(--accent-cyan)',
                        borderRadius: '999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Community Highlights: Pros & Cons Pills */}
      {(topPros.length > 0 || topCons.length > 0) && (
        <div
          style={{
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {topPros.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginBottom: '0.65rem' }}>
                <ThumbsUp size={14} />
                <span>FREQUENTLY PRAISED BY OWNERS</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {topPros.map((p) => (
                  <span
                    key={p.text}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      color: '#d1fae5',
                    }}
                  >
                    {p.text} {p.count > 1 && `(${p.count})`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {topCons.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.65rem' }}>
                <ThumbsDown size={14} />
                <span>OBSERVED OWNER TRADE-OFFS</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {topCons.map((c) => (
                  <span
                    key={c.text}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      color: '#fef3c7',
                    }}
                  >
                    {c.text} {c.count > 1 && `(${c.count})`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
