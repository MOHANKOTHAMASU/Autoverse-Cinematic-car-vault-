import React, { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse redirect URL if present
  const queryParams = new URLSearchParams(location.search);
  const redirectTarget = queryParams.get('redirect') || '/garage';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both your driver email and security passkey.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        setSuccessMessage('Identity verified. Synchronizing driver garage...');
        setTimeout(() => {
          navigate(redirectTarget);
        }, 1200);
      } else {
        setError(res.message);
      }
    } catch {
      setError('An unexpected communication error occurred. Please try again.');
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
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <ArrowLeft size={14} /> Back to Homepage
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
              <Sparkles size={12} /> STAGE 6 SECURE LOGIN
            </span>
            <h1 style={{ fontSize: '1.95rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
              Member Access
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Sign in to access synchronized cloud garage telemetries, saved vehicle comparisons,
              and verified performance dispatches.
            </p>
          </div>

          {/* Error Message */}
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
              role="alert"
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>{error}</div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: '#34d399',
                fontSize: '0.85rem',
              }}
            >
              <Check size={18} />
              <div>{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Driver Identifier */}
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
                Driver Identifier (Email)
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
                  name="email"
                  id="login_email"
                  autoComplete="username"
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

            {/* Passkey */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--accent-cyan)',
                    textTransform: 'uppercase',
                  }}
                >
                  Security Passkey
                </label>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  Forgot Passkey?
                </Link>
              </div>

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
                  name="password"
                  id="login_password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
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
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--accent-cyan)' }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Remember this trusted device for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 size={16} className="spin-animation" /> Authenticating Credentials...
                </span>
              ) : (
                'Sign In to AutoVerse'
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div
            style={{
              marginTop: '1.75rem',
              textAlign: 'center',
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
            }}
          >
            New to AutoVerse?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--accent-cyan)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Create an Account
            </Link>
          </div>

          {/* Security Notice */}
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
              Stage 6 Security Guard: Session credentials utilize Web Crypto SHA-256 with salt.
              Anti-brute force tracking automatically protects against credential stuffing.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
