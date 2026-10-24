import React, { useState } from 'react';
import { AlertTriangle, X, Send } from 'lucide-react';
import type { ReportReason } from '../../types/community';
import { submitContentReport } from '../../utils/communityStore';
import { useAuth } from '../../context/AuthContext';

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'review' | 'discussion' | 'reply';
  targetId: string;
  targetTitle?: string;
}

const REPORT_REASONS: { value: ReportReason; label: string; desc: string }[] = [
  { value: 'spam', label: 'Spam or Commercial Promotion', desc: 'Unsolicited links, referral codes, or automated text.' },
  { value: 'abusive_harassment', label: 'Abusive Language or Harassment', desc: 'Hate speech, personal attacks, or aggressive behavior.' },
  { value: 'misleading_false_info', label: 'Misleading or Fabricated Information', desc: 'Factual inaccuracies or deceptive claims regarding vehicle ownership.' },
  { value: 'inappropriate', label: 'Inappropriate or Off-Topic Content', desc: 'Content unrelated to automotive ownership or AutoVerse standards.' },
  { value: 'commercial_solicitation', label: 'Unauthorized Dealership Solicitation', desc: 'Unverified commercial sales or broker promotions.' },
];

export const ReportContentModal: React.FC<ReportContentModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !currentUser) {
      setFeedback({ type: 'error', message: 'Please sign in to submit a report for moderation review.' });
      return;
    }

    setIsSubmitting(true);
    const result = submitContentReport(targetType, targetId, reason, details, currentUser);
    setIsSubmitting(false);

    if (result.success) {
      setFeedback({
        type: 'success',
        message: 'Report submitted successfully. Our automotive moderation team will inspect this item.',
      });
      setTimeout(() => {
        setFeedback(null);
        setDetails('');
        onClose();
      }, 2000);
    } else {
      setFeedback({ type: 'error', message: result.error || 'Failed to submit report.' });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: '#0a0d14',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(239, 68, 68, 0.08)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
          }}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={22} color="#ef4444" />
          </div>
          <div>
            <h3 id="report-dialog-title" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Report {targetType === 'review' ? 'Owner Review' : 'Community Post'}
            </h3>
            {targetTitle && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                "{targetTitle.slice(0, 40)}..."
              </span>
            )}
          </div>
        </div>

        {feedback && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              backgroundColor: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${feedback.type === 'success' ? '#10b981' : '#ef4444'}`,
              color: feedback.type === 'success' ? '#10b981' : '#ef4444',
            }}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              Select Reason
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: reason === r.value ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: reason === r.value ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{r.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Additional Context (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide specific timestamps, quotes, or details for the moderation audit..."
              rows={3}
              style={{
                width: '100%',
                backgroundColor: 'rgba(7, 9, 13, 0.8)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.85rem',
                backgroundColor: '#ef4444',
                borderColor: '#ef4444',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <Send size={14} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
