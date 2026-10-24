import React from 'react';
import { ShieldCheck, X, CheckCircle2, Lock, FileCheck } from 'lucide-react';

interface VerifiedOwnerBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  vinMasked?: string;
  documentType?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export const VerifiedOwnerBadgeModal: React.FC<VerifiedOwnerBadgeModalProps> = ({
  isOpen,
  onClose,
  vinMasked,
  documentType,
  reviewedBy,
  reviewedAt,
}) => {
  if (!isOpen) return null;

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
          maxWidth: '520px',
          backgroundColor: '#0a0d14',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(16, 185, 129, 0.1)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verified-badge-title"
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

        {/* Header with verified emblem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={26} color="#10b981" />
          </div>
          <div>
            <h3 id="verified-badge-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              AutoVerse Verified Owner
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
              Official Identity & Ownership Audit
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          An AutoVerse <strong>Verified Owner</strong> badge is exclusively granted when a community member submits authentic proof of vehicle ownership (such as an official registration title certificate, purchase invoice, or active insurance endorsement) audited by AutoVerse Concierge moderators.
        </p>

        {/* Verification Checklist */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
            <CheckCircle2 size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#f8fafc' }}>
              <strong>Not Self-Awarded:</strong> Never granted automatically via checkboxes or unsupported claims.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
            <FileCheck size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#f8fafc' }}>
              <strong>Independent Concierge Audit:</strong> Verified against VIN chassis sequence and regional transport databases.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
            <Lock size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#f8fafc' }}>
              <strong>Privacy Guaranteed:</strong> Full personal identification documents are strictly restricted to authorized audit staff and never displayed publicly.
            </span>
          </div>
        </div>

        {/* Audit Details (if available) */}
        {vinMasked && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.06)',
              border: '1px dashed rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div><strong>Masked Chassis:</strong> {vinMasked}</div>
            {documentType && <div><strong>Audit Method:</strong> {documentType.replace(/_/g, ' ').toUpperCase()}</div>}
            {reviewedBy && <div><strong>Audited By:</strong> {reviewedBy}</div>}
            {reviewedAt && <div><strong>Audit Date:</strong> {new Date(reviewedAt).toLocaleDateString()}</div>}
          </div>
        )}

        <button
          onClick={onClose}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#10b981',
            borderColor: '#10b981',
            color: '#07090d',
            fontWeight: 700,
          }}
        >
          Understood
        </button>
      </div>
    </div>
  );
};
