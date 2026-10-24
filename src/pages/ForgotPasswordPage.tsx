import React, { useState } from 'react';
import { ArrowLeft, Mail, ShieldCheck, Check, AlertCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { requestPasswordReset } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide your registered driver email.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = requestPasswordReset(email.trim());
      setIsSubmitting(false);
      setSubmitted(true);
      if (res.demoToken) {
        setDemoToken(res.demoToken);
      }
    }, 600);
  };

  return (
    <div
      style={{
        paddingTop: 'calc(var(--header-height) + 2rem)',
        paddingBottom: '6rem',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>

        {/* Center Auth Card */}
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            margin: 'auto',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>
              <Sparkles size={12} /> ACCOUNT RECOVERY
            </span>
            <h1 style={{ fontSize: '1.85rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
              Reset Security Passkey
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Enter the driver email associated with your AutoVerse credentials to receive
              a secure cryptographic recovery token.
            </p>
          </div>

          {error && (
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                color: '#f87171',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={18} />
              <div>{error}</div>
            </div>
          )}

          {submitted ? (
            <div>
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34d399',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                }}
              >
                <Check size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Recovery Dispatched:</strong> If an account exists for {email}, reset instructions
                  have been authorized.
                </div>
              </div>

              {/* Sandbox Direct Link Helper */}
              {demoToken && (
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 240, 255, 0.08)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: 'var(--accent-cyan)',
                      textTransform: 'uppercase',
                      marginBottom: '0.4rem',
                      fontWeight: 700,
                    }}
                  >
                    ⚡ Sandbox Simulation Direct Link
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
                    Because external email relays are not configured in this sandbox environment, use the direct reset link below:
                  </p>
                  <Link
                    to={`/reset-password?token=${demoToken}`}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      padding: '0.65rem',
                    }}
                  >
                    <span>Proceed to Reset Passkey</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              <Link
                to="/login"
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--accent-cyan)',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Registered Driver Email
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    padding: '0.7rem 0.85rem',
                  }}
                >
                  <Mail size={16} color="var(--text-muted)" />
                  <input
                    type="email"
                    required
                    placeholder="driver@autoverse.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      width: '100%',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontWeight: 700,
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Loader2 size={16} className="spin-animation" /> Issuing Recovery Token...
                  </span>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </form>
          )}

          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.45rem',
            }}
          >
            <ShieldCheck size={15} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>
              Security Policy: AutoVerse never reveals account existence through public error messages.
              Tokens expire automatically after 60 minutes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
