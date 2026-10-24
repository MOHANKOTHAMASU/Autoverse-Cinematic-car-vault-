// AutoVerse Stage 13: Admin Car Reviews Management
// Edit, create, and audit instrumented road test dossiers and 10-point scoring rubrics

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Search,
  X,
  Save,
} from 'lucide-react';
import {
  getCarReviews,
  saveCarReview,
  deleteCarReview,
  EDITORIAL_AUTHORS,
} from '../../utils/editorialStore';
import type { CarReview, ReviewCategoryScores } from '../../types/editorial';
import { VEHICLES } from '../../data/vehicles';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<CarReview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CarReview | null>(null);
  const [strengthsInput, setStrengthsInput] = useState('');
  const [weaknessesInput, setWeaknessesInput] = useState('');

  const loadData = () => {
    setReviews(getCarReviews());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('autoverse_editorial_updated', loadData);
    return () => window.removeEventListener('autoverse_editorial_updated', loadData);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Weighted score calculation
  const calculateOverallScore = (cat: ReviewCategoryScores): number => {
    const weighted =
      cat.performance * 0.25 +
      cat.technology * 0.2 +
      cat.interiorComfort * 0.15 +
      cat.safety * 0.15 +
      cat.exteriorDesign * 0.15 +
      cat.practicality * 0.1;
    return Math.round(weighted * 10) / 10;
  };

  const handleOpenAdd = () => {
    const defaultScores: ReviewCategoryScores = {
      exteriorDesign: 9.0,
      interiorComfort: 8.8,
      technology: 9.0,
      performance: 9.2,
      practicality: 8.5,
      safety: 9.2,
    };
    const newRev: CarReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      slug: 'new-road-test-review',
      title: 'New Vehicle Road Test Evaluation',
      vehicleSlug: VEHICLES[0]?.slug || 'porsche-taycan-turbo-s',
      variant: 'Standard Performance Spec',
      overallScore: calculateOverallScore(defaultScores),
      categoryScores: defaultScores,
      verdictSummary: 'Exceptional dynamic poise and engineering execution.',
      strengths: ['Predictable chassis response', 'Immediate power delivery'],
      weaknesses: ['Firm ride over broken pavement', 'Premium pricing'],
      suitableBuyerProfile: 'Enthusiasts desiring verified performance benchmark data.',
      realWorldConsiderations: 'Highway cruising efficiency is verified under standard test conditions.',
      reviewerNotes: 'Tested across mixed urban and high-speed sectors.',
      testedTrim: 'Factory Test Spec with Performance Pack',
      testConditions: 'Dry surface, 22°C ambient temperature',
      reviewDate: 'October 2024',
      author: EDITORIAL_AUTHORS[0],
      publicationStatus: 'published',
      heroImage: VEHICLES[0]?.heroImage || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
      verifiedSpecs: {
        acceleration0to60: '3.2 seconds',
        topSpeed: '160 mph',
        testedEfficiency: '32 kWh/100 miles or 12 km/l',
        weight: '4,600 lbs',
      },
    };
    setEditingReview(newRev);
    setStrengthsInput(newRev.strengths.join('\n'));
    setWeaknessesInput(newRev.weaknesses.join('\n'));
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rev: CarReview) => {
    setEditingReview({ ...rev });
    setStrengthsInput(rev.strengths.join('\n'));
    setWeaknessesInput(rev.weaknesses.join('\n'));
    setIsModalOpen(true);
  };

  const handleScoreChange = (category: keyof ReviewCategoryScores, value: number) => {
    if (!editingReview) return;
    const clamped = Math.min(10, Math.max(0, value));
    const nextCategories = { ...editingReview.categoryScores, [category]: clamped };
    const nextOverall = calculateOverallScore(nextCategories);
    setEditingReview({
      ...editingReview,
      categoryScores: nextCategories,
      overallScore: nextOverall,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview || !editingReview.title.trim()) return;

    const strengthsList = strengthsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const weaknessesList = weaknessesInput
      .split('\n')
      .map((w) => w.trim())
      .filter(Boolean);

    const saved: CarReview = {
      ...editingReview,
      strengths: strengthsList,
      weaknesses: weaknessesList,
      slug:
        editingReview.slug ||
        `${editingReview.vehicleSlug}-road-test-${Date.now().toString(36)}`,
    };

    saveCarReview(saved);
    setIsModalOpen(false);
    showToast(`Road test review for "${saved.title}" saved.`);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete review "${title}"?`)) {
      deleteCarReview(id);
      showToast('Road test review deleted.');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || r.title.toLowerCase().includes(q) || r.vehicleSlug.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '5rem',
            right: '2rem',
            zIndex: 10000,
            backgroundColor: '#090c12',
            border: '1px solid var(--accent-cyan)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
            color: '#ffffff',
            padding: '0.85rem 1.4rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <CheckCircle2 size={16} color="var(--accent-cyan)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: '0 0 0.35rem',
            }}
          >
            Car Reviews & Road Test Registry
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0 }}>
            Manage transparent 10-point instrumented evaluations, category weightings, and real-world findings.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.6rem 1.25rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <Plus size={16} /> New Car Review
        </button>
      </div>

      {/* Search Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#090c12',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
          Registered Road Tests: <strong>{reviews.length}</strong>
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50)',
              color: '#64748b',
            }}
          />
          <input
            type="text"
            placeholder="Search reviewed model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.85rem 0.45rem 2.2rem',
              backgroundColor: '#05070a',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.82rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Reviews Table */}
      <div
        style={{
          backgroundColor: '#090c12',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontWeight: 600 }}>VEHICLE & REVIEW</th>
                <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 600 }}>CATALOG SLUG</th>
                <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 600 }}>OVERALL SCORE</th>
                <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 600 }}>TEST DATE</th>
                <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    No car reviews found.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => (
                  <tr
                    key={rev.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <img
                          src={rev.heroImage}
                          alt={rev.title}
                          style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div>
                          <strong style={{ color: '#ffffff', display: 'block' }}>{rev.title}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{rev.testedTrim}</span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                      /{rev.vehicleSlug}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          color: '#ffffff',
                          fontFamily: 'var(--font-mono)',
                          padding: '0.2rem 0.5rem',
                          backgroundColor: 'rgba(6, 182, 212, 0.15)',
                          borderRadius: '4px',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                        }}
                      >
                        {rev.overallScore.toFixed(1)} / 10
                      </span>
                    </td>

                    <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.78rem' }}>
                      {rev.reviewDate}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                        }}
                      >
                        {rev.publicationStatus}
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link
                          to="/reviews"
                          target="_blank"
                          title="View on Reviews Page"
                          style={{ padding: '0.4rem', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(rev)}
                          title="Edit Review"
                          style={{ background: 'none', border: 'none', padding: '0.4rem', color: 'var(--accent-cyan)', cursor: 'pointer' }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(rev.id, rev.title)}
                          title="Delete Review"
                          style={{ background: 'none', border: 'none', padding: '0.4rem', color: '#f87171', cursor: 'pointer' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Edit Modal */}
      {isModalOpen && editingReview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#090c12',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {editingReview.title ? `Edit Road Test: ${editingReview.title}` : 'New Car Review'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Linked Vehicle & Title */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    LINKED VEHICLE CATALOG MODEL
                  </label>
                  <select
                    value={editingReview.vehicleSlug}
                    onChange={(e) => {
                      const sel = VEHICLES.find((v) => v.slug === e.target.value);
                      setEditingReview({
                        ...editingReview,
                        vehicleSlug: e.target.value,
                        heroImage: sel?.heroImage || editingReview.heroImage,
                      });
                    }}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#05070a', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff' }}
                  >
                    {VEHICLES.map((v) => (
                      <option key={v.id} value={v.slug}>
                        {v.name} ({v.brand})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    REVIEW TITLE
                  </label>
                  <input
                    type="text"
                    value={editingReview.title}
                    onChange={(e) => setEditingReview({ ...editingReview, title: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#05070a', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>

              {/* 6 Category Scores */}
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    10-POINT SCORING RUBRIC (WEIGHTED OVERALL: {editingReview.overallScore.toFixed(1)} / 10)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { key: 'performance', label: 'Dynamics (25%)' },
                    { key: 'technology', label: 'Tech & UI (20%)' },
                    { key: 'interiorComfort', label: 'Comfort (15%)' },
                    { key: 'safety', label: 'Safety (15%)' },
                    { key: 'exteriorDesign', label: 'Exterior (15%)' },
                    { key: 'practicality', label: 'Daily Use (10%)' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                        {field.label}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={editingReview.categoryScores[field.key as keyof ReviewCategoryScores]}
                        onChange={(e) => handleScoreChange(field.key as keyof ReviewCategoryScores, parseFloat(e.target.value) || 0)}
                        style={{ width: '100%', padding: '0.4rem', backgroundColor: '#05070a', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Verdict Summary */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  EDITORIAL VERDICT SUMMARY
                </label>
                <textarea
                  rows={2}
                  value={editingReview.verdictSummary}
                  onChange={(e) => setEditingReview({ ...editingReview, verdictSummary: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: '#05070a', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              {/* Strengths & Weaknesses (Multiline) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#34d399', marginBottom: '0.3rem' }}>
                    KEY STRENGTHS (ONE PER LINE)
                  </label>
                  <textarea
                    rows={4}
                    value={strengthsInput}
                    onChange={(e) => setStrengthsInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#05070a', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#f87171', marginBottom: '0.3rem' }}>
                    KEY WEAKNESSES (ONE PER LINE)
                  </label>
                  <textarea
                    rows={4}
                    value={weaknessesInput}
                    onChange={(e) => setWeaknessesInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#05070a', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Save & Cancel */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Save size={15} /> Save Road Test Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
