// AutoVerse Stage 13: Admin Article & Editorial Management
// Filter by publication status, author, category, with quick publish/unpublish & delete

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Search,
} from 'lucide-react';
import {
  getEditorialArticles,
  deleteEditorialArticle,
  setArticleStatus,
} from '../../utils/editorialStore';
import type { Article, PublicationStatus } from '../../types/editorial';

export const AdminArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | PublicationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    setArticles(getEditorialArticles());
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

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesStatus = statusFilter === 'all' || a.publicationStatus === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.author.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [articles, statusFilter, searchQuery]);

  const handleStatusToggle = (article: Article) => {
    const nextStatus: PublicationStatus =
      article.publicationStatus === 'published' ? 'draft' : 'published';
    setArticleStatus(article.id, nextStatus);
    showToast(`Article status changed to ${nextStatus.toUpperCase()}`);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete article "${title}"?`)) {
      deleteEditorialArticle(id);
      showToast('Article removed from database.');
    }
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

      {/* Header & New Article CTA */}
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
            Editorial Newsroom & Articles
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0 }}>
            Create technical dispatches, manage publication lifecycle, and maintain verified citations.
          </p>
        </div>

        <Link
          to="/admin/articles/new"
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
          <Plus size={16} /> New Article
        </Link>
      </div>

      {/* Toolbar: Status Filter and Search */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          backgroundColor: '#090c12',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(['all', 'published', 'draft', 'in_review', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
                color: statusFilter === tab ? '#07090d' : '#94a3b8',
                backgroundColor: statusFilter === tab ? 'var(--accent-cyan)' : 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
              }}
            >
              {tab === 'all' ? 'All Articles' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
            }}
          />
          <input
            type="text"
            placeholder="Search headline, author, category..."
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

      {/* Articles Table */}
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
                <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontWeight: 600 }}>ARTICLE TITLE</th>
                <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 600 }}>CATEGORY</th>
                <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 600 }}>AUTHOR</th>
                <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 600 }}>DATE</th>
                <th style={{ padding: '0.85rem 1.25rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    No editorial articles match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => {
                  const isPublished = article.publicationStatus === 'published';
                  return (
                    <tr
                      key={article.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Title & Excerpt */}
                      <td style={{ padding: '1rem 1.25rem', maxWidth: '360px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <img
                            src={article.heroImage}
                            alt={article.title}
                            style={{
                              width: '54px',
                              height: '40px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.35, marginBottom: '0.2rem' }}>
                              {article.title}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                              /{article.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            color: '#cbd5e1',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {article.category}
                        </span>
                      </td>

                      {/* Author */}
                      <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <img
                            src={article.author.avatarUrl}
                            alt={article.author.name}
                            style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span>{article.author.name}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem' }}>
                        <button
                          onClick={() => handleStatusToggle(article)}
                          title="Click to toggle publish/draft"
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-mono)',
                            cursor: 'pointer',
                            border: 'none',
                            backgroundColor: isPublished ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: isPublished ? '#34d399' : '#fbbf24',
                          }}
                        >
                          {article.publicationStatus}
                        </button>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                        {new Date(article.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Link
                            to={`/news/${article.slug}`}
                            target="_blank"
                            title="View on Live Site"
                            style={{
                              padding: '0.4rem',
                              color: '#94a3b8',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <ExternalLink size={15} />
                          </Link>

                          <Link
                            to={`/admin/articles/${article.id}/edit`}
                            title="Edit Article"
                            style={{
                              padding: '0.4rem',
                              color: 'var(--accent-cyan)',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Edit2 size={15} />
                          </Link>

                          <button
                            onClick={() => handleDelete(article.id, article.title)}
                            title="Delete Article"
                            style={{
                              padding: '0.4rem',
                              color: '#f87171',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
