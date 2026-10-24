import React, { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { evaluatePasswordStrength } from '../utils/auth';

export const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { resetPassword } = useAuth();
  const passwordStrength = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing password reset security token in request URL.');
      return;
    }

    if (!passwordStrength.isStrongEnough) {
      setError(`Passkey requirement: ${passwordStrength.feedback.join(', ')}`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passkeys do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        setIsSuccess(true);
        setSuccessMessage(res.message);
      } else {
        setError(res.message);
      }
    } catch {
      setError('An error occurred during passkey reset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Center Card */}
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
          {isSuccess ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid #10b981',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h1 style={{ fontSize: '1.85rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
                Passkey Updated
              </h1>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                {successMessage || 'Your driver credentials have been re-encrypted with salted SHA-256.'}
              </p>

              <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Sign In With New Passkey
              </Link>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>
                  RE-ENCRYPTION PROTOCOL
                </span>
                <h1 style={{ fontSize: '1.85rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
                  Enter New Passkey
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Establish a new high-entropy security passkey for your AutoVerse account.
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

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* New Password */}
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
                    New Security Passkey
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
                    <Lock size={16} color="var(--text-muted)" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {password.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '0.4rem' }}>
                        {[1, 2, 3, 4].map((step) => {
                          let barColor = 'rgba(255,255,255,0.1)';
                          if (step <= passwordStrength.score) {
                            if (passwordStrength.score <= 1) barColor = '#ef4444';
                            else if (passwordStrength.score <= 2) barColor = '#eab308';
                            else if (passwordStrength.score === 3) barColor = '#38bdf8';
                            else barColor = '#10b981';
                          }
                          return (
                            <div
                              key={step}
                              style={{
                                flex: 1,
                                backgroundColor: barColor,
                                borderRadius: '2px',
                                transition: 'background-color 0.25s ease',
                              }}
                            />
                          );
                        })}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.68rem',
                          color: passwordStrength.isStrongEnough ? '#10b981' : 'var(--text-muted)',
                        }}
                      >
                        {passwordStrength.isStrongEnough
                          ? '✓ Strong passkey standards met'
                          : `Requirements: ${passwordStrength.feedback.join(' • ')}`}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
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
                    Confirm New Passkey
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
                    <Lock size={16} color="var(--text-muted)" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new passkey"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
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
                      <Loader2 size={16} className="spin-animation" /> Updating Passkey...
                    </span>
                  ) : (
                    'Set New Passkey'
                  )}
                </button>
              </form>
            </div>
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
              Passkey updates invalidate existing reset tokens immediately.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
