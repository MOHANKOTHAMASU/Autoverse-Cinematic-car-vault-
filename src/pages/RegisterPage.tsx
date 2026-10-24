import React, { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { evaluatePasswordStrength } from '../utils/auth';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Ensure clean state on mount
  React.useEffect(() => {
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAgreedToTerms(false);
  }, []);

  const passwordStrength = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please provide your full legal or driver name (minimum 2 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!passwordStrength.isStrongEnough) {
      setError(`Password requirement: ${passwordStrength.feedback.join(', ')}`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreedToTerms) {
      setError('You must accept the AutoVerse Terms of Service and Privacy Policy.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(fullName, email, password);
      if (res.success) {
        setSuccessMessage(
          'Registration successful! Please check your email inbox to verify your driver account.'
        );
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 1800);
      } else {
        setError(res.message);
      }
    } catch {
      setError('A network or server error occurred. Please try again.');
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
            maxWidth: '520px',
            width: '100%',
            margin: 'auto',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>
              <Sparkles size={12} /> STAGE 6 IDENTITY & ACCESS
            </span>
            <h1 style={{ fontSize: '1.95rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
              Create Driver Profile
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Register your verified AutoVerse credentials to synchronize cloud garages,
              saved telemetry comparisons, and member-exclusive driving dispatches.
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

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {/* Full Name */}
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
                Full Name / Driver Handle
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
                <User size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  name="autoverse_reg_fullname"
                  id="reg_fullname"
                  autoComplete="off"
                  required
                  placeholder="e.g. Marcus Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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

            {/* Email Address */}
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
                  name="autoverse_reg_email"
                  id="reg_email"
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
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

            {/* Password */}
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
                Security Passkey
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
                  name="autoverse_reg_password"
                  id="reg_password"
                  autoComplete="new-password"
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

              {/* Password Strength Indicator */}
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
                      : `Criteria needed: ${passwordStrength.feedback.join(' • ')}`}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
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
                Confirm Passkey
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
                  name="autoverse_reg_confirm_password"
                  id="reg_confirm_password"
                  autoComplete="new-password"
                  required
                  placeholder="Re-enter passkey"
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

            {/* Terms and Privacy Checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{ marginTop: '0.25rem', accentColor: 'var(--accent-cyan)' }}
              />
              <label
                htmlFor="terms"
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  cursor: 'pointer',
                }}
              >
                I acknowledge and agree to the AutoVerse{' '}
                <span style={{ color: 'var(--accent-cyan)' }}>Terms of Service</span> and{' '}
                <span style={{ color: 'var(--accent-cyan)' }}>Driver Privacy Code</span>.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: '0.75rem',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 size={16} className="spin-animation" /> Registering Driver Identity...
                </span>
              ) : (
                'Create AutoVerse Account'
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div
            style={{
              marginTop: '1.75rem',
              textAlign: 'center',
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
            }}
          >
            Already an authenticated member?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--accent-cyan)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Sign In Here
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
              Stage 6 Web Crypto Architecture: Passwords are salted and hashed with SHA-256 before storage.
              Plain-text passwords are never retained.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
