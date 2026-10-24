// AutoVerse Stage 13: Technical Article Reader
// Dynamic table of contents, scroll progress bar, verified source citations, reading list toggle, and related vehicle integration

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Car,
  List,
  AlertCircle,
} from 'lucide-react';
import {
  getArticleBySlug,
  getPublicArticles,
  getUserReadingList,
  toggleBookmarkArticle,
} from '../utils/editorialStore';
import type { Article } from '../types/editorial';
import { useAuth } from '../context/AuthContext';
import { VEHICLES } from '../data/vehicles';

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  const contentRef = useRef<HTMLDivElement | null>(null);

  // Load article
  useEffect(() => {
    if (!slug) return;
    const found = getArticleBySlug(slug);
    if (found) {
      setArticle(found);
      document.title = `${found.title} | AutoVerse Technical Editorial`;
    } else {
      setArticle(null);
    }
  }, [slug]);

  // Sync bookmark status
  useEffect(() => {
    if (currentUser?.id && article?.id) {
      const list = getUserReadingList(currentUser.id);
      setIsSaved(list.some((item) => item.articleId === article.id));
    } else {
      setIsSaved(false);
    }
  }, [currentUser?.id, article?.id]);

  // Scroll progress listener
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const totalHeight = el.scrollHeight - el.clientHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Extract table of contents from content sections
  const tableOfContents = useMemo(() => {
    if (!article?.content) return [];
    const lines = article.content.split('\n');
    const headings: { id: string; text: string }[] = [];
    lines.forEach((line) => {
      if (line.startsWith('## ')) {
        const text = line.replace('## ', '').trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headings.push({ id, text });
      }
    });
    return headings;
  }, [article?.content]);

  // Find related vehicles in catalog
  const relatedVehicles = useMemo(() => {
    if (!article?.relatedVehicleSlugs?.length) return [];
    return VEHICLES.filter((v) => article.relatedVehicleSlugs.includes(v.slug));
  }, [article?.relatedVehicleSlugs]);

  // Adjacent articles for navigation
  const adjacentArticles = useMemo(() => {
    const all = getPublicArticles();
    if (!article) return { prev: null, next: null };
    const currentIndex = all.findIndex((a) => a.id === article.id);
    return {
      prev: currentIndex > 0 ? all[currentIndex - 1] : null,
      next: currentIndex < all.length - 1 ? all[currentIndex + 1] : null,
    };
  }, [article]);

  const handleToggleSave = () => {
    if (!isAuthenticated || !currentUser?.id || !article) {
      navigate(`/login?redirect=/news/${article?.slug || ''}`);
      return;
    }
    const saved = toggleBookmarkArticle(currentUser.id, article.id);
    setIsSaved(saved);
  };

  const handleShare = async () => {
    if (!article) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url,
        });
        return;
      } catch {
        // Fallback
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // Ignored
    }
  };

  const scrollToHeading = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveHeadingId(id);
    }
  };

  // Render markdown-like sections cleanly
  const renderFormattedContent = (content: string) => {
    const sections = content.split('\n\n');
    return sections.map((sec, idx) => {
      const trimmed = sec.trim();
      if (trimmed.startsWith('## ')) {
        const title = trimmed.replace('## ', '');
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return (
          <h2
            key={idx}
            id={id}
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#ffffff',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h2>
        );
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('1. ')) {
        const items = trimmed.split('\n');
        return (
          <ul
            key={idx}
            style={{
              paddingLeft: '1.5rem',
              marginBottom: '1.5rem',
              color: '#cbd5e1',
              lineHeight: 1.8,
            }}
          >
            {items.map((item, itemIdx) => {
              const text = item.replace(/^[-*]|\d+\.\s*/, '');
              // Bold check
              const parts = text.split(/(\*\*.*?\*\*)/g);
              return (
                <li key={itemIdx} style={{ marginBottom: '0.4rem' }}>
                  {parts.map((part, pIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={pIdx} style={{ color: '#ffffff' }}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  })}
                </li>
              );
            })}
          </ul>
        );
      }

      // Standard paragraph
      return (
        <p
          key={idx}
          style={{
            fontSize: '1.08rem',
            lineHeight: 1.85,
            color: '#e2e8f0',
            marginBottom: '1.5rem',
          }}
        >
          {sec}
        </p>
      );
    });
  };

  if (!article) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#040608',
          color: '#ffffff',
          padding: '2rem',
        }}
      >
        <AlertCircle size={48} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Article Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          The requested technical report or dispatch is unavailable or has been archived.
        </p>
        <Link to="/news" className="btn btn-primary">
          Back to Dispatches Hub
        </Link>
      </div>
    );
  }

  const articleTypeBadge = {
    news: { label: 'Technical Wire', color: 'var(--accent-cyan)' },
    review: { label: 'Track Evaluation', color: '#10b981' },
    analysis: { label: 'Engineering Dossier', color: '#8b5cf6' },
    opinion: { label: 'Editorial Opinion', color: '#f59e0b' },
    sponsored: { label: 'Sponsored Showcase', color: '#94a3b8' },
    launch: { label: 'Official Launch', color: '#3b82f6' },
  }[article.articleType] || { label: 'Editorial', color: 'var(--accent-cyan)' };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#040608',
        color: '#f8fafc',
        paddingTop: 'calc(var(--header-height) + 1.5rem)',
        paddingBottom: '6rem',
        position: 'relative',
      }}
    >
      {/* 1. STICKY READING PROGRESS BAR */}
      <div
        style={{
          position: 'fixed',
          top: 'var(--header-height)',
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          zIndex: 99,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${scrollProgress}%`,
            backgroundColor: 'var(--accent-cyan)',
            boxShadow: '0 0 10px var(--accent-cyan)',
            transition: 'width 0.1s ease-out',
          }}
        />
      </div>

      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Navigation Breadcrumb */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
          }}
        >
          <Link
            to="/news"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <ArrowLeft size={14} /> Back to Automotive News
          </Link>

          {/* Quick Action Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleToggleSave}
              className="btn btn-secondary"
              style={{
                fontSize: '0.82rem',
                padding: '0.45rem 0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderRadius: '6px',
                borderColor: isSaved ? 'rgba(245, 158, 11, 0.4)' : undefined,
                color: isSaved ? '#fbbf24' : undefined,
              }}
            >
              <Bookmark size={14} fill={isSaved ? '#fbbf24' : 'none'} />
              <span>{isSaved ? 'Saved to List' : 'Save Article'}</span>
            </button>

            <button
              onClick={handleShare}
              className="btn btn-secondary"
              style={{
                fontSize: '0.82rem',
                padding: '0.45rem 0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderRadius: '6px',
              }}
            >
              {copiedShare ? (
                <>
                  <CheckCircle2 size={14} color="#34d399" />
                  <span style={{ color: '#34d399' }}>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Article Header & Typography */}
        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <span
              style={{
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                border: `1px solid ${articleTypeBadge.color}`,
                color: articleTypeBadge.color,
                borderRadius: '4px',
                padding: '0.25rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {articleTypeBadge.label}
            </span>

            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              {article.category.replace('_', ' ')}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '1rem',
            }}
          >
            {article.title}
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              color: '#cbd5e1',
              lineHeight: 1.5,
              fontWeight: 400,
              maxWidth: '900px',
              marginBottom: '2rem',
            }}
          >
            {article.subtitle}
          </p>

          {/* Author Byline Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
              padding: '1.25rem 1.5rem',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                src={article.author.avatarUrl}
                alt={article.author.name}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(6, 182, 212, 0.4)',
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                    {article.author.name}
                  </span>
                  {article.author.verifiedCredentials && (
                    <span
                      title={article.author.verifiedCredentials}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: 'var(--accent-cyan)',
                      }}
                    >
                      <ShieldCheck size={15} />
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {article.author.role}
                </div>
              </div>
            </div>

            {/* Publishing Timestamps & Read Time */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} color="var(--accent-cyan)" />
                <span>
                  Published:{' '}
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {article.updatedAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={13} color="#10b981" />
                  <span>
                    Updated:{' '}
                    {new Date(article.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={13} color="var(--accent-cyan)" />
                <span>{article.readingTimeMinutes} min read</span>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Hero Image & Attribution */}
        <figure style={{ margin: '0 0 3rem 0' }}>
          <div
            style={{
              borderRadius: '14px',
              overflow: 'hidden',
              maxHeight: '560px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <img
              src={article.heroImage}
              alt={article.imageCaption || article.title}
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '560px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
          <figcaption
            style={{
              padding: '0.75rem 0.5rem 0',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>{article.imageCaption}</span>
            <span style={{ color: '#94a3b8' }}>Attribution: {article.imageCredit}</span>
          </figcaption>
        </figure>

        {/* Article Layout Grid (Content + Table of Contents Sidebar) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: tableOfContents.length > 0 ? 'minmax(0, 1fr) 280px' : '1fr',
            gap: '3rem',
            alignItems: 'start',
          }}
        >
          {/* Main Article Prose */}
          <main ref={contentRef} style={{ minWidth: 0 }}>
            {renderFormattedContent(article.content)}

            {/* Author Biography Box */}
            <div
              style={{
                marginTop: '4rem',
                padding: '1.75rem',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start',
              }}
            >
              <img
                src={article.author.avatarUrl}
                alt={article.author.name}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(6, 182, 212, 0.4)',
                }}
              />
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                  About the Author: {article.author.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                  {article.author.role} • {article.author.verifiedCredentials}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {article.author.bio}
                </p>
              </div>
            </div>

            {/* Verified Bureau Citations & References Section */}
            {article.sourceReferences?.length > 0 && (
              <div
                style={{
                  marginTop: '2.5rem',
                  padding: '1.5rem',
                  backgroundColor: 'rgba(7, 9, 13, 0.9)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: '1rem',
                  }}
                >
                  <ShieldCheck size={16} /> Verified Sources & Fact-Checking Dossier
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {article.sourceReferences.map((ref, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.82rem',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '6px',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#ffffff', display: 'block' }}>{ref.title}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          Publisher: {ref.publisher} • Checked: {ref.checkedDate}
                        </span>
                      </div>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: 'var(--accent-cyan)',
                          fontSize: '0.78rem',
                          textDecoration: 'none',
                        }}
                      >
                        <span>Official Source</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Vehicles Spotlight */}
            {relatedVehicles.length > 0 && (
              <div style={{ marginTop: '3.5rem' }}>
                <h3
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Car size={18} color="var(--accent-cyan)" />
                  Featured Vehicles in this Dispatch
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {relatedVehicles.map((car) => (
                    <Link
                      key={car.id}
                      to={`/cars/${car.slug}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        className="card-glass"
                        style={{
                          padding: '1.25rem',
                          borderRadius: '10px',
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'center',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        <img
                          src={car.heroImage}
                          alt={car.name}
                          style={{
                            width: '80px',
                            height: '56px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--accent-cyan)',
                              textTransform: 'uppercase',
                              display: 'block',
                            }}
                          >
                            {car.brand} • {car.modelYear}
                          </span>
                          <h4
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              color: '#ffffff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              margin: '0.2rem 0',
                            }}
                          >
                            {car.name}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            View Spec Dossier & Road Tests →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Adjacent Stories Navigation */}
            <div
              style={{
                marginTop: '3.5rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {adjacentArticles.prev ? (
                <Link
                  to={`/news/${adjacentArticles.prev.slug}`}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    ← PREVIOUS DISPATCH
                  </span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginTop: '0.4rem' }}>
                    {adjacentArticles.prev.title}
                  </div>
                </Link>
              ) : <div />}

              {adjacentArticles.next && (
                <Link
                  to={`/news/${adjacentArticles.next.slug}`}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'right',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    NEXT DISPATCH →
                  </span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginTop: '0.4rem' }}>
                    {adjacentArticles.next.title}
                  </div>
                </Link>
              )}
            </div>
          </main>

          {/* Sticky Table of Contents Sidebar */}
          {tableOfContents.length > 0 && (
            <aside
              style={{
                position: 'sticky',
                top: 'calc(var(--header-height) + 2rem)',
                backgroundColor: 'rgba(11, 15, 25, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1.5rem',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-cyan)',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <List size={14} /> Contents
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {tableOfContents.map((heading) => (
                  <button
                    key={heading.id}
                    onClick={() => scrollToHeading(heading.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                      color: activeHeadingId === heading.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      fontWeight: activeHeadingId === heading.id ? 600 : 400,
                      cursor: 'pointer',
                      padding: '0.2rem 0',
                      transition: 'color 0.2s ease',
                      lineHeight: 1.4,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color =
                        activeHeadingId === heading.id ? 'var(--accent-cyan)' : 'var(--text-secondary)')
                    }
                  >
                    {heading.text}
                  </button>
                ))}
              </nav>

              {/* Tags Cloud */}
              {article.tags?.length > 0 && (
                <div style={{ marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Topic Index
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: '#cbd5e1',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
