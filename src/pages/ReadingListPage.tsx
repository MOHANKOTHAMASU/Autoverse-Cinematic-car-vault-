// AutoVerse Stage 13: Personal Reading List & Saved Editorial Bookmarks
// User-isolated bookmark storage with offline persistence, read time estimates & quick removal

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Trash2,
  Clock,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  LogIn,
} from 'lucide-react';
import {
  getUserReadingList,
  getArticleById,
  toggleBookmarkArticle,
} from '../utils/editorialStore';
import type { Article } from '../types/editorial';
import { useAuth } from '../context/AuthContext';

export const ReadingListPage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);

  const loadSavedArticles = () => {
    if (!currentUser?.id) {
      setSavedArticles([]);
      return;
    }
    const items = getUserReadingList(currentUser.id);
    const resolved: Article[] = [];
    items.forEach((item) => {
      const art = getArticleById(item.articleId);
      if (art) resolved.push(art);
    });
    setSavedArticles(resolved);
  };

  useEffect(() => {
    loadSavedArticles();
    window.addEventListener('autoverse_editorial_updated', loadSavedArticles);
    return () => window.removeEventListener('autoverse_editorial_updated', loadSavedArticles);
  }, [currentUser?.id]);

  const handleRemove = (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser?.id) return;
    toggleBookmarkArticle(currentUser.id, articleId);
    setSavedArticles((prev) => prev.filter((a) => a.id !== articleId));
  };

  if (!isAuthenticated || !currentUser) {
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
          textAlign: 'center',
        }}
      >
        <Bookmark size={48} color="var(--accent-cyan)" style={{ marginBottom: '1.25rem' }} />
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.6rem' }}>
          Personal Reading List
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Sign in to your AutoVerse account to save technical analyses, track evaluations, and launch
          wire dispatches to read later.
        </p>
        <Link
          to="/login?redirect=/reading-list"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <LogIn size={16} /> Sign In to AutoVerse
        </Link>
      </div>
    );
  }

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
      <div className="container" style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
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
            }}
          >
            <ArrowLeft size={14} /> Back to Technical News
          </Link>
        </div>

        {/* Masthead */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
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
                color: '#fbbf24',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '0.25rem 0.65rem',
                borderRadius: '4px',
              }}
            >
              <Bookmark size={12} fill="#fbbf24" /> Saved Dossiers
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Curated for {currentUser.fullName || currentUser.email}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
            }}
          >
            Your Reading List ({savedArticles.length})
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px' }}>
            Technical dispatches and road tests saved to your profile for offline reflection and research.
          </p>
        </div>

        {/* Saved Articles List */}
        {savedArticles.length === 0 ? (
          <div
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '12px',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
            }}
          >
            <BookOpen size={42} color="var(--accent-cyan)" style={{ margin: '0 auto 1.25rem' }} />
            <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              Your Reading List is Empty
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Explore the latest technical dispatches and bookmark articles using the bookmark icon to read them anytime.
            </p>
            <Link to="/news" className="btn btn-primary">
              Browse Latest Stories
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {savedArticles.map((article) => (
              <div
                key={article.id}
                className="card-glass"
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: 'rgba(11, 15, 25, 0.7)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Thumbnail */}
                <Link
                  to={`/news/${article.slug}`}
                  style={{
                    display: 'block',
                    height: '100%',
                    minHeight: '180px',
                    position: 'relative',
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
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      left: '0.75rem',
                      backgroundColor: 'rgba(7, 9, 13, 0.85)',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {article.category.replace('_', ' ')}
                  </span>
                </Link>

                {/* Content */}
                <div
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span>By {article.author.name}</span>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} />
                      <span>{article.readingTimeMinutes} min</span>
                    </div>
                  </div>

                  <Link to={`/news/${article.slug}`} style={{ textDecoration: 'none' }}>
                    <h3
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        lineHeight: 1.35,
                        margin: '0 0 0.5rem',
                      }}
                    >
                      {article.title}
                    </h3>
                  </Link>

                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                      marginBottom: '1.25rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {article.excerpt}
                  </p>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <Link
                      to={`/news/${article.slug}`}
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--accent-cyan)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      Read Article <ArrowRight size={14} />
                    </Link>

                    <button
                      onClick={(e) => handleRemove(e, article.id)}
                      className="btn btn-secondary"
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.35rem 0.7rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: '#f87171',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
