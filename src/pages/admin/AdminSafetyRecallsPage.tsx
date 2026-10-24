import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  ExternalLink,
  Flag,
} from 'lucide-react';
import { getAdminRecallsList, toggleRecallAdminReviewFlag } from '../../utils/safetyStore';
import type { OfficialRecall } from '../../types/safety';

export const AdminSafetyRecallsPage: React.FC = () => {
  const [recalls, setRecalls] = useState<OfficialRecall[]>(getAdminRecallsList());
  const [query, setQuery] = useState('');
  const [filterMarket, setFilterMarket] = useState('all');

  const handleToggleFlag = (id: string) => {
    toggleRecallAdminReviewFlag(id);
    setRecalls(getAdminRecallsList());
  };

  const filtered = recalls.filter((r) => {
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const match =
        r.title.toLowerCase().includes(q) ||
        r.officialCampaignNumber.toLowerCase().includes(q) ||
        r.make.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterMarket !== 'all' && r.market !== filterMarket) return false;
    return true;
  });

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link
            to="/admin/safety"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--accent-cyan)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} /> Back to Safety Administration
          </Link>
        </div>

        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
          Recall Repository & Vehicle Mapping
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Audit verified regulatory notices, inspect AutoVerse vehicle slug linkages, and flag records for review.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.75rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--accent-cyan)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by title, make, or campaign #..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-medium)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.85rem',
            }}
          />
        </div>

        <select
          value={filterMarket}
          onChange={(e) => setFilterMarket(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            backgroundColor: '#0c1017',
            border: '1px solid var(--border-medium)',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '0.85rem',
          }}
        >
          <option value="all">All Jurisdictions</option>
          <option value="India">India (MoRTH)</option>
          <option value="USA">USA (NHTSA)</option>
          <option value="Global">Global</option>
        </select>
      </div>

      {/* Recalls Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>CAMPAIGN #</th>
                <th style={{ padding: '0.85rem 1rem' }}>TITLE & MAKE</th>
                <th style={{ padding: '0.85rem 1rem' }}>MAPPED SLUGS</th>
                <th style={{ padding: '0.85rem 1rem' }}>SEVERITY</th>
                <th style={{ padding: '0.85rem 1rem' }}>AUTHORITY</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    {r.officialCampaignNumber}
                  </td>
                  <td style={{ padding: '1rem', maxWidth: '320px' }}>
                    <div style={{ color: '#ffffff', fontWeight: 700, marginBottom: '2px' }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {r.make} {r.model} (Years: {r.modelYears.join(', ')})
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {r.affectedVehicleSlugs.join(', ')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: r.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                        color: r.severity === 'critical' ? '#ef4444' : '#f59e0b',
                        fontWeight: 700,
                      }}
                    >
                      {r.severity}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    {r.sourceAuthority} ({r.market})
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleFlag(r.id)}
                        className="btn btn-secondary"
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.3rem 0.6rem',
                          color: r.adminReviewFlag ? '#f59e0b' : 'var(--text-muted)',
                          borderColor: r.adminReviewFlag ? '#f59e0b' : 'var(--border-subtle)',
                        }}
                      >
                        <Flag size={12} />
                        <span>{r.adminReviewFlag ? 'Flagged' : 'Flag'}</span>
                      </button>

                      <a
                        href={r.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
