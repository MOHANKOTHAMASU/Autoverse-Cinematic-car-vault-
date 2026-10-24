// AutoVerse Stage 13: Automotive News, Technical Dispatches & Editorial Hub
// Featured stories, category tabs, trending reels, load-more pagination, and verified bureau citations

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  Bookmark,
  Share2,
  CheckCircle2,
  Gauge,
  Zap,
  TrendingUp,
  Compass,
  SlidersHorizontal,
} from 'lucide-react';
import {
  getPublicArticles,
  getUserReadingList,
  toggleBookmarkArticle,
} from '../utils/editorialStore';
import type { Article, ArticleCategory } from '../types/editorial';
import { useAuth } from '../context/AuthContext';

const CATEGORIES: { id: ArticleCategory; label: string; icon: React.FC<{ size?: number }> }[] = [
  { id: 'all', label: 'All Stories', icon: Compass },
  { id: 'performance', label: 'Performance & Track', icon: Gauge },
  { id: 'indian_auto', label: 'Indian Automotive', icon: Sparkles },
  { id: 'ev', label: 'Pure Electric', icon: Zap },
  { id: 'hybrid', label: 'High-Performance Hybrid', icon: SlidersHorizontal },
  { id: 'luxury', label: 'Supercars & Luxury', icon: Sparkles },
  { id: 'technology', label: 'Tech & ADAS', icon: SlidersHorizontal },
  { id: 'motorsport', label: 'Motorsport & WEC', icon: Gauge },
];

export const NewsHomePage: React.FC = () => {
  const { slug: categoryParam } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory>(
    (categoryParam as ArticleCategory) || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [savedArticleIds, setSavedArticleIds] = useState<Set<string>>(new Set());

  // Load articles
  const loadArticles = () => {
    setArticles(getPublicArticles());
    if (currentUser?.id) {
      const list = getUserReadingList(currentUser.id);
      setSavedArticleIds(new Set(list.map((item) => item.articleId)));
    }
  };

  useEffect(() => {
    loadArticles();
    window.addEventListener('autoverse_editorial_updated', loadArticles);
    return () => window.removeEventListener('autoverse_editorial_updated', loadArticles);
  }, [currentUser?.id]);

  // Sync category param
  useEffect(() => {
    if (categoryParam) {
      const matched = CATEGORIES.find((c) => c.id === categoryParam);
      if (matched) setSelectedCategory(matched.id);
    } else {
      setSelectedCategory('all');
    }
  }, [categoryParam]);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === 'all' || article.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.subtitle.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.tags.some((t) => t.toLowerCase().includes(q)) ||
        article.author.name.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Featured article (first featured or first overall)
  const featuredArticle = useMemo(() => {
    return (
      filteredArticles.find((a) => a.isFeatured) ||
      filteredArticles[0] ||
      null
    );
  }, [filteredArticles]);

  // Remaining articles for grid
  const gridArticles = useMemo(() => {
    if (!featuredArticle) return [];
    return filteredArticles.filter((a) => a.id !== featuredArticle.id);
  }, [filteredArticles, featuredArticle]);

  const displayedGridArticles = useMemo(() => {
    return gridArticles.slice(0, visibleCount);
  }, [gridArticles, visibleCount]);

  // Bookmark toggle
  const handleToggleBookmark = (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || !currentUser?.id) {
      navigate('/login?redirect=/news');
      return;
    }
    const isSaved = toggleBookmarkArticle(currentUser.id, articleId);
    setSavedArticleIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.add(articleId);
      else next.delete(articleId);
      return next;
    });
  };

  // Share handler
  const handleShare = async (e: React.MouseEvent, article: Article) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/news/${article.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(article.slug);
      setTimeout(() => setCopiedSlug(null), 2500);
    } catch {
      // Ignored
    }
  };

  const handleCategoryClick = (catId: ArticleCategory) => {
    setSelectedCategory(catId);
    setVisibleCount(6);
    if (catId === 'all') {
      navigate('/news');
    } else {
      navigate(`/news/category/${catId}`);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

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
        {/* Editorial Masthead */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
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
              <Sparkles size={12} /> AutoVerse Editorial Bureau
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Independent Technical Assessments & Global Wire
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
                Automotive Dispatches & Engineering Analysis
              </h1>
              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-secondary)',
                  maxWidth: '740px',
                  lineHeight: 1.6,
                }}
              >
                Comprehensive track evaluations, telemetry breakdowns, and factory press reports.
                Every performance figure, lap time, and safety rating is cross-referenced with
                verified technical dossiers.
              </p>
            </div>

            {/* Quick Links to Reviews, Launches & Reading List */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                to="/reviews"
                className="btn btn-secondary"
                style={{
                  fontSize: '0.85rem',
                  padding: '0.6rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  borderRadius: '6px',
                }}
              >
                <Gauge size={15} color="var(--accent-cyan)" />
                <span>Car Road Tests</span>
              </Link>
              <Link
                to="/launches"
                className="btn btn-secondary"
                style={{
                  fontSize: '0.85rem',
                  padding: '0.6rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  borderRadius: '6px',
                }}
              >
                <Calendar size={15} color="var(--accent-cyan)" />
                <span>Launch Wire</span>
              </Link>
              {isAuthenticated && (
                <Link
                  to="/reading-list"
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.6rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    borderRadius: '6px',
                    borderColor: 'rgba(245, 158, 11, 0.4)',
                    color: '#fbbf24',
                  }}
                >
                  <Bookmark size={15} fill="#fbbf24" color="#fbbf24" />
                  <span>Reading List ({savedArticleIds.size})</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
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
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              maxWidth: '100%',
              paddingBottom: '0.2rem',
            }}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    border: isSelected
                      ? '1px solid var(--accent-cyan)'
                      : '1px solid rgba(255, 255, 255, 0.05)',
                    backgroundColor: isSelected
                      ? 'rgba(6, 182, 212, 0.15)'
                      : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px', maxWidth: '380px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search stories, topics, tags..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(6);
              }}
              style={{
                width: '100%',
                padding: '0.5rem 0.85rem 0.5rem 2.25rem',
                backgroundColor: 'rgba(5, 7, 10, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Notification */}
        {filteredArticles.length === 0 ? (
          <div
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.3)',
              borderRadius: '12px',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
            }}
          >
            <Compass size={36} color="var(--accent-cyan)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              No Articles Found
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              No published stories match your search criteria "{searchQuery}" in this category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* 1. CINEMATIC FEATURED ARTICLE (If available and on page 1) */}
            {featuredArticle && (
              <div style={{ marginBottom: '3rem' }}>
                <Link
                  to={`/news/${featuredArticle.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <article
                    className="card-glass"
                    style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      backgroundColor: 'rgba(11, 15, 25, 0.8)',
                    }}
                  >
                    {/* Featured Hero Media */}
                    <div
                      style={{
                        position: 'relative',
                        minHeight: '380px',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={featuredArticle.heroImage}
                        alt={featuredArticle.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.6s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '1.25rem',
                          left: '1.25rem',
                          display: 'flex',
                          gap: '0.5rem',
                          zIndex: 2,
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: '#07090d',
                            color: 'var(--accent-cyan)',
                            border: '1px solid rgba(6, 182, 212, 0.4)',
                            borderRadius: '4px',
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          FEATURED DISPATCH
                        </span>
                        {featuredArticle.isTrending && (
                          <span
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.9)',
                              color: '#ffffff',
                              borderRadius: '4px',
                              padding: '0.25rem 0.55rem',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              letterSpacing: '0.06em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <TrendingUp size={11} /> TRENDING
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Featured Content Dossier */}
                    <div
                      style={{
                        padding: 'clamp(1.75rem, 4vw, 3rem)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Meta info */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: '0.85rem',
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                          marginBottom: '1rem',
                        }}
                      >
                        <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                          {featuredArticle.category.toUpperCase()}
                        </span>
                        <span>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} />
                          <span>{formatDate(featuredArticle.publishedAt)}</span>
                        </div>
                        <span>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={13} />
                          <span>{featuredArticle.readingTimeMinutes} min read</span>
                        </div>
                      </div>

                      <h2
                        style={{
                          fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                          fontWeight: 800,
                          lineHeight: 1.25,
                          color: '#ffffff',
                          marginBottom: '0.75rem',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {featuredArticle.title}
                      </h2>

                      <h3
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 500,
                          color: '#cbd5e1',
                          lineHeight: 1.5,
                          marginBottom: '1.25rem',
                        }}
                      >
                        {featuredArticle.subtitle}
                      </h3>

                      <p
                        style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.92rem',
                          lineHeight: 1.65,
                          marginBottom: '1.75rem',
                        }}
                      >
                        {featuredArticle.excerpt}
                      </p>

                      {/* Author card & Actions */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          paddingTop: '1.25rem',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          marginTop: 'auto',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={featuredArticle.author.avatarUrl}
                            alt={featuredArticle.author.name}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1px solid rgba(6, 182, 212, 0.3)',
                            }}
                          />
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                              {featuredArticle.author.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {featuredArticle.author.role}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={(e) => handleToggleBookmark(e, featuredArticle.id)}
                            title={savedArticleIds.has(featuredArticle.id) ? 'Remove bookmark' : 'Save to reading list'}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '6px',
                              backgroundColor: savedArticleIds.has(featuredArticle.id)
                                ? 'rgba(245, 158, 11, 0.2)'
                                : 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: savedArticleIds.has(featuredArticle.id) ? '#fbbf24' : '#94a3b8',
                              cursor: 'pointer',
                            }}
                          >
                            <Bookmark
                              size={16}
                              fill={savedArticleIds.has(featuredArticle.id) ? '#fbbf24' : 'none'}
                            />
                          </button>

                          <button
                            onClick={(e) => handleShare(e, featuredArticle)}
                            title="Share article"
                            style={{
                              padding: '0.5rem',
                              borderRadius: '6px',
                              backgroundColor: copiedSlug === featuredArticle.slug
                                ? 'rgba(16, 185, 129, 0.2)'
                                : 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: copiedSlug === featuredArticle.slug ? '#34d399' : '#94a3b8',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.75rem',
                            }}
                          >
                            {copiedSlug === featuredArticle.slug ? (
                              <>
                                <CheckCircle2 size={15} /> Copied
                              </>
                            ) : (
                              <Share2 size={16} />
                            )}
                          </button>

                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: 'var(--accent-cyan)',
                              marginLeft: '0.5rem',
                            }}
                          >
                            Read Full Dossier <ArrowRight size={15} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              </div>
            )}

            {/* 2. RESPONSIVE EDITORIAL GRID */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '0.75rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>Latest Dispatches</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                    }}
                  >
                    {gridArticles.length} stories
                  </span>
                </h3>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.75rem',
                  marginBottom: '3rem',
                }}
              >
                {displayedGridArticles.map((article) => (
                  <article
                    key={article.id}
                    className="card-glass"
                    style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'rgba(11, 15, 25, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {/* Thumbnail */}
                    <Link
                      to={`/news/${article.slug}`}
                      style={{
                        position: 'relative',
                        display: 'block',
                        height: '210px',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={article.heroImage}
                        alt={article.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.4s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: '0.85rem',
                          left: '0.85rem',
                          backgroundColor: 'rgba(7, 9, 13, 0.85)',
                          backdropFilter: 'blur(8px)',
                          color: 'var(--accent-cyan)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-mono)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                        }}
                      >
                        {article.category.replace('_', ' ')}
                      </span>
                    </Link>

                    {/* Content Details */}
                    <div
                      style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                      }}
                    >
                      {/* Meta line */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <span>{formatDate(article.publishedAt)}</span>
                        <span>•</span>
                        <span>{article.readingTimeMinutes} min read</span>
                      </div>

                      <Link
                        to={`/news/${article.slug}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <h4
                          style={{
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            lineHeight: 1.35,
                            color: '#ffffff',
                            marginBottom: '0.6rem',
                            transition: 'color 0.2s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-cyan)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
                        >
                          {article.title}
                        </h4>
                      </Link>

                      <p
                        style={{
                          fontSize: '0.88rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.55,
                          marginBottom: '1.25rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {article.excerpt}
                      </p>

                      {/* Author & Actions Footer */}
                      <div
                        style={{
                          marginTop: 'auto',
                          paddingTop: '1rem',
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img
                            src={article.author.avatarUrl}
                            alt={article.author.name}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />
                          <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
                            {article.author.name}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={(e) => handleToggleBookmark(e, article.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: savedArticleIds.has(article.id) ? '#fbbf24' : '#64748b',
                              cursor: 'pointer',
                              padding: '0.3rem',
                            }}
                            title="Save article"
                          >
                            <Bookmark
                              size={15}
                              fill={savedArticleIds.has(article.id) ? '#fbbf24' : 'none'}
                            />
                          </button>
                          <button
                            onClick={(e) => handleShare(e, article)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: copiedSlug === article.slug ? '#34d399' : '#64748b',
                              cursor: 'pointer',
                              padding: '0.3rem',
                            }}
                            title="Share link"
                          >
                            {copiedSlug === article.slug ? <CheckCircle2 size={15} /> : <Share2 size={15} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Load More Button */}
              {displayedGridArticles.length < gridArticles.length && (
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.75rem 2rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                    }}
                  >
                    Load More Technical Stories ({gridArticles.length - displayedGridArticles.length} remaining)
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
