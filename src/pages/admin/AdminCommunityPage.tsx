import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Star,
  RefreshCw,
} from 'lucide-react';
import {
  getAdminReports,
  moderateReportedContent,
  getAdminVerificationRequests,
  moderateVerificationRequest,
  getAllReviews,
} from '../../utils/communityStore';
import type { ContentReport, OwnershipVerificationRequest, OwnerReview } from '../../types/community';
import { getCurrentAdmin } from '../../utils/auth';

export const AdminCommunityPage: React.FC = () => {
  const admin = getCurrentAdmin() || { id: 'admin_sys', fullName: 'Automated Admin' };

  const [activeTab, setActiveTab] = useState<'reports' | 'verifications' | 'all_reviews'>('reports');
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [verifications, setVerifications] = useState<OwnershipVerificationRequest[]>([]);
  const [allReviews, setAllReviews] = useState<OwnerReview[]>([]);

  const loadAdminData = () => {
    setReports(getAdminReports());
    setVerifications(getAdminVerificationRequests());
    setAllReviews(getAllReviews());
  };

  useEffect(() => {
    loadAdminData();
    const handleUpdate = () => loadAdminData();
    window.addEventListener('autoverse_reports_updated', handleUpdate);
    window.addEventListener('autoverse_verifications_updated', handleUpdate);
    window.addEventListener('autoverse_reviews_updated', handleUpdate);
    return () => {
      window.removeEventListener('autoverse_reports_updated', handleUpdate);
      window.removeEventListener('autoverse_verifications_updated', handleUpdate);
      window.removeEventListener('autoverse_reviews_updated', handleUpdate);
    };
  }, []);

  const handleModerateReport = (reportId: string, action: 'hide' | 'delete' | 'dismiss') => {
    const reason = window.prompt(`Enter moderation rationale for ${action.toUpperCase()}:`, 'Violates AutoVerse content policy');
    if (reason === null) return;

    const res = moderateReportedContent(reportId, action, reason, admin);
    if (res.success) {
      loadAdminData();
    } else {
      alert(res.error || 'Failed to moderate report.');
    }
  };

  const handleModerateVerification = (reqId: string, action: 'approve' | 'reject') => {
    const reason = window.prompt(
      action === 'approve'
        ? 'Enter approval notes for verified owner status:'
        : 'Enter reason for rejecting ownership verification proof:',
      action === 'approve' ? 'Chassis number validated against registration records.' : 'Proof document missing official state seal.'
    );
    if (reason === null) return;

    const res = moderateVerificationRequest(reqId, action, reason, admin);
    if (res.success) {
      loadAdminData();
    } else {
      alert(res.error || 'Failed to update verification request.');
    }
  };

  const pendingReports = reports.filter((r) => r.status === 'pending');
  const pendingVerifications = verifications.filter((v) => v.status === 'pending');

  return (
    <div style={{ padding: '2rem' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ADMINISTRATION CONSOLE
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0' }}>
            Community Moderation & Verification Hub
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Audit reported owner reviews, moderate technical forums, and verify official vehicle ownership proof.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="btn btn-secondary"
          style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <RefreshCw size={14} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ padding: '1.25rem', backgroundColor: '#090c12', border: '1px solid var(--border-medium)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Flagged Reports</span>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: pendingReports.length > 0 ? '#ef4444' : '#10b981' }}>
            {pendingReports.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending moderator audit</span>
        </div>

        <div style={{ padding: '1.25rem', backgroundColor: '#090c12', border: '1px solid var(--border-medium)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ownership Verifications</span>
            <ShieldCheck size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: pendingVerifications.length > 0 ? '#f59e0b' : '#10b981' }}>
            {pendingVerifications.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting registration audit</span>
        </div>

        <div style={{ padding: '1.25rem', backgroundColor: '#090c12', border: '1px solid var(--border-medium)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Published Reviews</span>
            <Star size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
            {allReviews.filter((r) => r.status === 'published').length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across 50 catalog models</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.75rem' }}>
        <button
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'reports' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            color: activeTab === 'reports' ? '#ffffff' : 'var(--text-muted)',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertTriangle size={16} color={pendingReports.length > 0 ? '#ef4444' : 'currentColor'} />
          <span>Reported Content ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'verifications' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            color: activeTab === 'verifications' ? '#ffffff' : 'var(--text-muted)',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShieldCheck size={16} color={pendingVerifications.length > 0 ? '#f59e0b' : 'currentColor'} />
          <span>Ownership Verifications ({verifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all_reviews')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'all_reviews' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            color: activeTab === 'all_reviews' ? '#ffffff' : 'var(--text-muted)',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Star size={16} color="currentColor" />
          <span>All Catalog Reviews ({allReviews.length})</span>
        </button>
      </div>

      {/* TAB 1: REPORTED CONTENT QUEUE */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#090c12', borderRadius: '12px' }}>
              <CheckCircle2 size={36} color="#10b981" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Zero Flagged Content Items</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>All owner reviews and discussions meet AutoVerse publishing standards.</p>
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#090c12',
                  border: rep.status === 'pending' ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {rep.reason.replace(/_/g, ' ')}
                    </span>
                    <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                      Target: {rep.targetType.toUpperCase()} — {rep.targetTitle || rep.targetId}
                    </strong>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: rep.status === 'pending' ? '#ef4444' : 'var(--text-muted)',
                      fontWeight: 700,
                    }}
                  >
                    STATUS: {rep.status.toUpperCase()} {rep.actionTaken && `(${rep.actionTaken})`}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong>Report Details:</strong> {rep.details}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span>Reported by: {rep.reporterName} on {new Date(rep.createdAt).toLocaleDateString()}</span>

                  {rep.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleModerateReport(rep.id, 'dismiss')}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        Dismiss Report
                      </button>

                      <button
                        onClick={() => handleModerateReport(rep.id, 'hide')}
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.78rem',
                          backgroundColor: 'rgba(245, 158, 11, 0.15)',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          borderRadius: '6px',
                          color: '#f59e0b',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Hide Content
                      </button>

                      <button
                        onClick={() => handleModerateReport(rep.id, 'delete')}
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.78rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          borderRadius: '6px',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Delete Permanently
                      </button>
                    </div>
                  )}

                  {rep.status === 'actioned' && (
                    <span style={{ color: 'var(--text-muted)' }}>
                      Audited by {rep.moderatedBy} • Notes: {rep.moderationNotes}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: OWNERSHIP VERIFICATIONS QUEUE */}
      {activeTab === 'verifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {verifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#090c12', borderRadius: '12px' }}>
              <ShieldCheck size={36} color="#10b981" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Zero Pending Verifications</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>All submitted ownership credentials have been audited.</p>
            </div>
          ) : (
            verifications.map((req) => (
              <div
                key={req.id}
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#090c12',
                  border: req.status === 'pending' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <ShieldCheck size={18} color={req.status === 'approved' ? '#10b981' : req.status === 'rejected' ? '#ef4444' : '#f59e0b'} />
                    <strong style={{ color: '#ffffff', fontSize: '1.05rem' }}>
                      {req.userFullName} — {req.vehicleModel}
                    </strong>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      backgroundColor: req.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : req.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: req.status === 'approved' ? '#10b981' : req.status === 'rejected' ? '#ef4444' : '#f59e0b',
                      fontWeight: 700,
                    }}
                  >
                    {req.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', fontSize: '0.82rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: '8px' }}>
                  <div><strong>Email:</strong> {req.userEmail}</div>
                  <div><strong>Document Type:</strong> {req.documentType.replace(/_/g, ' ').toUpperCase()}</div>
                  <div><strong>Masked VIN:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{req.vinMasked}</span></div>
                  <div><strong>Internal Audit Token:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{req.proofReference}</span></div>
                </div>

                {req.reviewerNotes && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong>Moderator Notes:</strong> {req.reviewerNotes}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span>Submitted on {new Date(req.createdAt).toLocaleDateString()}</span>

                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleModerateVerification(req.id, 'approve')}
                        style={{
                          padding: '0.4rem 0.95rem',
                          fontSize: '0.78rem',
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid #10b981',
                          borderRadius: '6px',
                          color: '#10b981',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        Approve Verified Owner
                      </button>

                      <button
                        onClick={() => handleModerateVerification(req.id, 'reject')}
                        style={{
                          padding: '0.4rem 0.95rem',
                          fontSize: '0.78rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid #ef4444',
                          borderRadius: '6px',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        Reject Request
                      </button>
                    </div>
                  )}

                  {req.status !== 'pending' && req.reviewedBy && (
                    <span>Audited by {req.reviewedBy} on {new Date(req.reviewedAt || '').toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ALL CATALOG REVIEWS */}
      {activeTab === 'all_reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {allReviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                padding: '1.25rem',
                backgroundColor: '#090c12',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                    {rev.vehicleBrand} {rev.vehicleModel}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({rev.vehicleVariant})</span>
                  {rev.verificationStatus === 'verified' && (
                    <span style={{ color: '#10b981', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <ShieldCheck size={11} /> VERIFIED
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  "{rev.title}" by {rev.authorName} ({rev.overallRating} ★)
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: rev.status === 'published' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: rev.status === 'published' ? '#10b981' : '#ef4444',
                    fontWeight: 700,
                  }}
                >
                  {rev.status.toUpperCase()}
                </span>

                <Link
                  to={`/community/reviews/${rev.id}`}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
