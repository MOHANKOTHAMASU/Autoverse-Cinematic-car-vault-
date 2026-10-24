// AutoVerse Stage 13: Structured Article Editor & Markdown Bureau
// Authoring terminal with live preview, fact-checking citation management, and publication workflow

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Edit3,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  getArticleById,
  saveEditorialArticle,
  EDITORIAL_AUTHORS,
} from '../../utils/editorialStore';
import type {
  Article,
  ArticleCategory,
  ArticleType,
  PublicationStatus,
  SourceReference,
} from '../../types/editorial';

export const AdminArticleEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Article>({
    id: `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    slug: '',
    title: '',
    subtitle: '',
    content: '## Overview\nEnter technical overview and context here.\n\n## Engineering Analysis\nDetail powertrain, aerodynamics, and chassis metrics.',
    excerpt: '',
    category: 'performance',
    tags: ['Porsche', 'Performance', 'Engineering'],
    author: EDITORIAL_AUTHORS[0],
    heroImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Vehicle undergoing high-speed aerodynamic validation.',
    imageCredit: 'AutoVerse Technical Photography Archive',
    publicationStatus: 'published',
    publishedAt: new Date().toISOString(),
    readingTimeMinutes: 5,
    isFeatured: false,
    isTrending: false,
    relatedVehicleSlugs: [],
    sourceReferences: [
      {
        title: 'Official Manufacturer Technical Bulletin',
        publisher: 'Factory Engineering Bureau',
        url: 'https://newsroom.porsche.com',
        checkedDate: 'October 2024',
        isOfficialBureau: true,
      },
    ],
    articleType: 'news',
  });

  const [tagsInput, setTagsInput] = useState('Porsche, Performance, Engineering');

  useEffect(() => {
    if (id) {
      const existing = getArticleById(id);
      if (existing) {
        setFormData(existing);
        setTagsInput(existing.tags.join(', '));
      }
    }
  }, [id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTitleChange = (newTitle: string) => {
    setFormData((prev) => {
      const updated = { ...prev, title: newTitle };
      if (!isEditing || !prev.slug) {
        updated.slug = newTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }
      return updated;
    });
  };

  const handleAddCitation = () => {
    const newRef: SourceReference = {
      title: 'New Technical Source',
      publisher: 'Official Bureau',
      url: 'https://',
      checkedDate: 'October 2024',
      isOfficialBureau: true,
    };
    setFormData((prev) => ({
      ...prev,
      sourceReferences: [...prev.sourceReferences, newRef],
    }));
  };

  const handleCitationChange = (index: number, field: keyof SourceReference, value: string | boolean) => {
    setFormData((prev) => {
      const nextCitations = [...prev.sourceReferences];
      nextCitations[index] = { ...nextCitations[index], [field]: value };
      return { ...prev, sourceReferences: nextCitations };
    });
  };

  const handleRemoveCitation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sourceReferences: prev.sourceReferences.filter((_, i) => i !== index),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please provide an article headline.');
      return;
    }

    const processedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const articleToSave: Article = {
      ...formData,
      tags: processedTags,
      slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      readingTimeMinutes: Math.max(2, Math.round(formData.content.split(/\s+/).length / 200)),
    };

    saveEditorialArticle(articleToSave);
    showToast(`Article "${articleToSave.title}" saved successfully!`);
    setTimeout(() => {
      navigate('/admin/articles');
    }, 800);
  };

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

      {/* Top Bar with Back and Save */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/admin/articles"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#94a3b8',
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Back to Articles
          </Link>

          <span style={{ color: 'var(--text-muted)' }}>|</span>

          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            {isEditing ? 'Edit Editorial Article' : 'Compose New Technical Dispatch'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Tab Switcher */}
          <div style={{ display: 'flex', backgroundColor: '#05070a', borderRadius: '6px', padding: '0.2rem', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'edit' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                color: activeTab === 'edit' ? 'var(--accent-cyan)' : '#94a3b8',
              }}
            >
              <Edit3 size={13} /> Edit Mode
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'preview' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                color: activeTab === 'preview' ? 'var(--accent-cyan)' : '#94a3b8',
              }}
            >
              <Eye size={13} /> Live Preview
            </button>
          </div>

          <button
            onClick={handleSave}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <Save size={15} /> Save & Publish
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === 'edit' ? (
        <form
          onSubmit={handleSave}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem',
            alignItems: 'start',
          }}
        >
          {/* Main Prose Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Headline */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                ARTICLE HEADLINE *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Porsche Taycan Turbo GT Sets Nürburgring Record"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#090c12',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              />
            </div>

            {/* Subtitle */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                SUBTITLE / DECK
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. Technical analysis of 1,092 HP Attack Mode and silicon carbide inverters"
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  backgroundColor: '#090c12',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                }}
              />
            </div>

            {/* Excerpt */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                EXCERPT (BRIEF SUMMARY FOR CARDS & SEO)
              </label>
              <textarea
                rows={3}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief 2-3 sentence overview of this technical dispatch."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#090c12',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                }}
              />
            </div>

            {/* Markdown Content Editor */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1' }}>
                  STRUCTURED CONTENT (MARKDOWN HEADINGS '## ' GENERATE TABLE OF CONTENTS)
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Word count: ~{formData.content.split(/\s+/).length} words
                </span>
              </div>
              <textarea
                rows={16}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: '#05070a',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1.7,
                }}
              />
            </div>

            {/* Verified Sources & Citations Manager */}
            <div
              style={{
                backgroundColor: '#090c12',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontSize: '0.82rem', fontWeight: 700 }}>
                  <ShieldCheck size={16} /> Verified Technical Sources & References
                </div>
                <button
                  type="button"
                  onClick={handleAddCitation}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Plus size={13} /> Add Source
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {formData.sourceReferences.map((ref, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.5fr 2fr 1fr auto',
                      gap: '0.6rem',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '6px',
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Source Title"
                      value={ref.title}
                      onChange={(e) => handleCitationChange(idx, 'title', e.target.value)}
                      style={{ padding: '0.35rem 0.5rem', backgroundColor: '#05070a', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.78rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Publisher / OEM"
                      value={ref.publisher}
                      onChange={(e) => handleCitationChange(idx, 'publisher', e.target.value)}
                      style={{ padding: '0.35rem 0.5rem', backgroundColor: '#05070a', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.78rem' }}
                    />
                    <input
                      type="url"
                      placeholder="URL"
                      value={ref.url}
                      onChange={(e) => handleCitationChange(idx, 'url', e.target.value)}
                      style={{ padding: '0.35rem 0.5rem', backgroundColor: '#05070a', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.78rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Checked Date"
                      value={ref.checkedDate}
                      onChange={(e) => handleCitationChange(idx, 'checkedDate', e.target.value)}
                      style={{ padding: '0.35rem 0.5rem', backgroundColor: '#05070a', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.78rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCitation(idx)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.3rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Metadata Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Publication Settings Card */}
            <div
              style={{
                backgroundColor: '#090c12',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
                Publication Lifecycle
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Status */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    CONTENT STATUS
                  </label>
                  <select
                    value={formData.publicationStatus}
                    onChange={(e) => setFormData({ ...formData, publicationStatus: e.target.value as PublicationStatus })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#05070a',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="in_review">In Review</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    CATEGORY
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ArticleCategory })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#05070a',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                    }}
                  >
                    <option value="performance">Performance & Track</option>
                    <option value="indian_auto">Indian Automotive</option>
                    <option value="ev">Pure Electric</option>
                    <option value="hybrid">High-Performance Hybrid</option>
                    <option value="luxury">Supercars & Luxury</option>
                    <option value="technology">Tech & ADAS</option>
                    <option value="motorsport">Motorsport & WEC</option>
                  </select>
                </div>

                {/* Article Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    ARTICLE TYPE
                  </label>
                  <select
                    value={formData.articleType}
                    onChange={(e) => setFormData({ ...formData, articleType: e.target.value as ArticleType })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#05070a',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                    }}
                  >
                    <option value="news">News / Technical Wire</option>
                    <option value="analysis">Engineering Dossier</option>
                    <option value="review">Road Test Review</option>
                    <option value="launch">Vehicle Launch Premiere</option>
                    <option value="opinion">Editorial Opinion</option>
                    <option value="sponsored">Sponsored Showcase</option>
                  </select>
                </div>

                {/* Author */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    BYLINE AUTHOR
                  </label>
                  <select
                    value={formData.author.id}
                    onChange={(e) => {
                      const sel = EDITORIAL_AUTHORS.find((a) => a.id === e.target.value);
                      if (sel) setFormData({ ...formData, author: sel });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#05070a',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                    }}
                  >
                    {EDITORIAL_AUTHORS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Flags */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    <span>Highlight as Featured Article</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isTrending}
                      onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                    />
                    <span>Show in Trending Stories</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Media & URL Slug Card */}
            <div
              style={{
                backgroundColor: '#090c12',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
                Media & Indexing
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Slug */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    CANONICAL URL SLUG *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#05070a',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>

                {/* Hero Image */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    HERO IMAGE URL
                  </label>
                  <input
                    type="url"
                    value={formData.heroImage}
                    onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#05070a',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                    }}
                  />
                  {formData.heroImage && (
                    <img
                      src={formData.heroImage}
                      alt="Preview"
                      style={{
                        marginTop: '0.5rem',
                        width: '100%',
                        height: '110px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                      }}
                    />
                  )}
                </div>

                {/* Image Attribution */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    IMAGE ATTRIBUTION / CREDIT
                  </label>
                  <input
                    type="text"
                    value={formData.imageCredit}
                    onChange={(e) => setFormData({ ...formData, imageCredit: e.target.value })}
                    placeholder="e.g. Factory Press Archive / Nürburgring 1927 GmbH"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#05070a',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                    }}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    TAGS (COMMA SEPARATED)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#05070a',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Live Preview Mode */
        <div
          style={{
            backgroundColor: '#090c12',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--accent-cyan)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              PREVIEW: {formData.category} // {formData.articleType}
            </span>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', margin: '0.5rem 0' }}>
              {formData.title || 'Untitled Article'}
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#cbd5e1' }}>{formData.subtitle}</p>
          </div>

          <img
            src={formData.heroImage}
            alt={formData.title}
            style={{ width: '100%', height: '360px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.5rem' }}
          />

          <div style={{ color: '#e2e8f0', fontSize: '1rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {formData.content}
          </div>
        </div>
      )}
    </div>
  );
};
