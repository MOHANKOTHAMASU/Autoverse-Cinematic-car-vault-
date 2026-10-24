// AutoVerse Stage 13: Car Reviews, Benchmarking & Road Test Hub
// Transparent 10-point scoring rubric, strengths/weaknesses, test conditions, and direct links to vehicle pages, compare, configurator & TCO calculator

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Gauge,
  SlidersHorizontal,
  Calculator,
  Car,
  ShieldCheck,
  Check,
  X,
  Info,
  Sparkles,
  Search,
} from 'lucide-react';
import { getPublicReviews } from '../utils/editorialStore';
import type { CarReview } from '../types/editorial';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<CarReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<CarReview | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [showRubricExplainer, setShowRubricExplainer] = useState(false);

  useEffect(() => {
    const list = getPublicReviews();
    setReviews(list);
    if (list.length > 0 && !selectedReview) {
      setSelectedReview(list[0]);
    }
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.variant.toLowerCase().includes(q) ||
        r.vehicleSlug.toLowerCase().includes(q) ||
        r.author.name.toLowerCase().includes(q);
      const matchesRating = r.overallScore >= minRatingFilter;
      return matchesSearch && matchesRating;
    });
  }, [reviews, searchQuery, minRatingFilter]);

  const activeReview = selectedReview || filteredReviews[0] || null;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#040608',
        color: '#f8fafc',
        paddingTop: 'calc(var(--header-height) + 2rem)',
        paddingBottom: '6rem',
      }}
    >
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-cyan)',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                padding: '0.25rem 0.65rem',
                borderRadius: '4px',
              }}
            >
              <Gauge size={13} /> AutoVerse Road Test Protocol
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Independent Instrumented Benchmarks
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '1.5rem',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                  lineHeight: 1.1,
                  marginBottom: '0.6rem',
                }}
              >
                Comprehensive Car Reviews & Road Tests
              </h1>
              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-secondary)',
                  maxWidth: '760px',
                  lineHeight: 1.6,
                }}
              >
                Instrumented acceleration, thermal repeatability, real-world highway consumption,
                and ergonomic analysis. All evaluations are governed by AutoVerse’s transparent 10-point scoring rubric.
              </p>
            </div>

            <button
              onClick={() => setShowRubricExplainer(!showRubricExplainer)}
              className="btn btn-secondary"
              style={{
                fontSize: '0.85rem',
                padding: '0.6rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '6px',
              }}
            >
              <Info size={16} color="var(--accent-cyan)" />
              <span>{showRubricExplainer ? 'Hide Scoring Rubric' : 'How We Score (Rubric)'}</span>
            </button>
          </div>
        </div>

        {/* 1. TRANSPARENT SCORING RUBRIC EXPLAINER MODAL / BANNER */}
        {showRubricExplainer && (
          <div
            style={{
              marginBottom: '2.5rem',
              padding: '1.75rem',
              backgroundColor: 'rgba(11, 15, 25, 0.95)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(6, 182, 212, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sparkles size={16} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                The AutoVerse Vehicle Index (AVI) Scoring System
              </h3>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Every car tested by AutoVerse is evaluated across six rigorous engineering disciplines on a
              standardized 0 to 10 scale. The overall rating is an objective, weighted composite calculated as follows:
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              {[
                { label: 'Powertrain & Dynamics', weight: '25%', desc: 'Thermal repeatability, steering feedback, chassis balance, braking fade' },
                { label: 'Engineering & Tech', weight: '20%', desc: 'Inverter/powertrain efficiency, infotainment responsiveness, UI hierarchy' },
                { label: 'Interior & Ergonomics', weight: '15%', desc: 'Driving position, seat support, material integrity, NVH cabin isolation' },
                { label: 'Safety & ADAS', weight: '15%', desc: 'Official crash test rating, ADAS sensor calibration, active avoidance systems' },
                { label: 'Exterior & Aero', weight: '15%', desc: 'Aerodynamic drag coefficient (Cd), panel gap tolerances, cooling ducting' },
                { label: 'Daily Usability', weight: '10%', desc: 'Real-world charging/fueling speed, boot volume, visibility, turning circle' },
              ].map((cat, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{cat.label}</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      {cat.weight}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4, display: 'block' }}>
                    {cat.desc}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Note: AutoVerse does not accept paid editorial scores. Demo vehicles are logged with VIN and verified tire compound.
            </div>
          </div>
        )}

        {/* Toolbar: Search and Score Filter */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              MINIMUM SCORE:
            </span>
            {[0, 8.5, 9.0].map((score) => (
              <button
                key={score}
                onClick={() => setMinRatingFilter(score)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: minRatingFilter === score ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.06)',
                  backgroundColor: minRatingFilter === score ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: minRatingFilter === score ? '#ffffff' : 'var(--text-secondary)',
                }}
              >
                {score === 0 ? 'All Ratings' : `${score}+ / 10`}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search reviewed models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.85rem 0.45rem 2.2rem',
                backgroundColor: 'rgba(5, 7, 10, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* 2. REVIEWS MAIN WORKSPACE: Selector list + In-Depth Review Dossier */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Reviewed Vehicles Quick Select Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Reviewed Vehicles ({filteredReviews.length})
            </div>

            {filteredReviews.map((rev) => {
              const isSelected = activeReview?.id === rev.id;
              return (
                <div
                  key={rev.id}
                  onClick={() => setSelectedReview(rev)}
                  className="card-glass"
                  style={{
                    padding: '1.25rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'rgba(11, 15, 25, 0.6)',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <img
                    src={rev.heroImage}
                    alt={rev.title}
                    style={{
                      width: '90px',
                      height: '65px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4
                        style={{
                          fontSize: '0.98rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          margin: '0 0 0.2rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {rev.title}
                      </h4>
                      <span
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          color: 'var(--accent-cyan)',
                          fontFamily: 'var(--font-mono)',
                          paddingLeft: '0.5rem',
                        }}
                      >
                        {rev.overallScore.toFixed(1)}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                      {rev.variant}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                      <span>{rev.reviewDate}</span>
                      <span>•</span>
                      <span>By {rev.author.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Complete Instrumented Review Dossier */}
          {activeReview && (
            <div
              className="card-glass"
              style={{
                borderRadius: '14px',
                padding: 'clamp(1.5rem, 3vw, 2.5rem)',
                backgroundColor: 'rgba(11, 15, 25, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              {/* Review Header Banner */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  paddingBottom: '1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span className="badge badge-verified">
                      <ShieldCheck size={12} /> VERIFIED INSTRUMENTED ROAD TEST
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {activeReview.reviewDate}
                    </span>
                  </div>

                  <h2
                    style={{
                      fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                      fontWeight: 800,
                      color: '#ffffff',
                      letterSpacing: '-0.02em',
                      marginBottom: '0.3rem',
                    }}
                  >
                    {activeReview.title}
                  </h2>

                  <div style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    Trim: {activeReview.testedTrim}
                  </div>
                </div>

                {/* Score Badge */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid var(--accent-cyan)',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '10px',
                  }}
                >
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    AutoVerse Score
                  </span>
                  <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                    {activeReview.overallScore.toFixed(1)}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    OUT OF 10.0
                  </span>
                </div>
              </div>

              {/* Verdict Summary Quote */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderLeft: '4px solid var(--accent-cyan)',
                  borderRadius: '0 8px 8px 0',
                  marginBottom: '2rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '0.35rem' }}>
                  The AutoVerse Verdict
                </div>
                <p style={{ fontSize: '1.05rem', color: '#f1f5f9', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                  "{activeReview.verdictSummary}"
                </p>
              </div>

              {/* 6 Category Breakdown Grid */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
                  Instrumented Category Scores
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {[
                    { label: 'Exterior Design & Aero', score: activeReview.categoryScores.exteriorDesign },
                    { label: 'Interior Comfort & NVH', score: activeReview.categoryScores.interiorComfort },
                    { label: 'Infotainment & UI Tech', score: activeReview.categoryScores.technology },
                    { label: 'Powertrain & Track Dynamics', score: activeReview.categoryScores.performance },
                    { label: 'Daily Practicality & Range', score: activeReview.categoryScores.practicality },
                    { label: 'Safety & ADAS Calibration', score: activeReview.categoryScores.safety },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.85rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{item.label}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {item.score.toFixed(1)}
                        </span>
                      </div>
                      <div
                        style={{
                          height: '5px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${(item.score / 10) * 100}%`,
                            backgroundColor: 'var(--accent-cyan)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses (Pros / Cons) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem',
                }}
              >
                {/* Strengths */}
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.85rem' }}>
                    <Check size={16} /> Key Strengths
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.7 }}>
                    {activeReview.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.85rem' }}>
                    <X size={16} /> Room for Improvement
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.7 }}>
                    {activeReview.weaknesses.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Verified Instrumented Specs & Test Conditions */}
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  marginBottom: '2rem',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                  Instrumented Telemetry & Benchmarks
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>0-60 MPH (GPS)</span>
                    <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>{activeReview.verifiedSpecs.acceleration0to60}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>TOP SPEED TESTED</span>
                    <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>{activeReview.verifiedSpecs.topSpeed}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>TESTED EFFICIENCY</span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--accent-cyan)' }}>{activeReview.verifiedSpecs.testedEfficiency}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>CURB WEIGHT (SCALE)</span>
                    <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>{activeReview.verifiedSpecs.weight}</strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <strong>Test Conditions:</strong> {activeReview.testConditions}
                </div>
              </div>

              {/* Buyer Profile & Real-World Ownership Analysis */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                  Ideal Buyer Profile
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {activeReview.suitableBuyerProfile}
                </p>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                  Real-World Ownership Considerations
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                  {activeReview.realWorldConsiderations}
                </p>
              </div>

              {/* Integration with AutoVerse Features: Car Detail, Compare, Configurator, TCO Calculator */}
              <div
                style={{
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <Link
                  to={`/cars/${activeReview.vehicleSlug}`}
                  className="btn btn-primary"
                  style={{
                    fontSize: '0.82rem',
                    padding: '0.55rem 1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    borderRadius: '6px',
                  }}
                >
                  <Car size={14} /> Full Vehicle Dossier
                </Link>

                <Link
                  to={`/compare?car1=${activeReview.vehicleSlug}`}
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.82rem',
                    padding: '0.55rem 1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    borderRadius: '6px',
                  }}
                >
                  <SlidersHorizontal size={14} /> Compare Against Rivals
                </Link>

                <Link
                  to={`/configurator/${activeReview.vehicleSlug}`}
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.82rem',
                    padding: '0.55rem 1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    borderRadius: '6px',
                  }}
                >
                  <Sparkles size={14} /> Interactive Configurator
                </Link>

                <Link
                  to={`/ownership-calculator?car=${activeReview.vehicleSlug}`}
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.82rem',
                    padding: '0.55rem 1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    borderRadius: '6px',
                  }}
                >
                  <Calculator size={14} /> Calculate TCO & Financing
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
