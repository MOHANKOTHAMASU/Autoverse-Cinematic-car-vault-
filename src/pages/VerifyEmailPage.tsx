import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
  Loader2,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsersFromDB, getPendingVerificationData } from '../utils/auth';

export const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const { verifyEmail, resendVerification } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const tokenParam = queryParams.get('token');
  const emailParam = queryParams.get('email') || '';

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [tokenInput, setTokenInput] = useState(tokenParam || '');
  const [useTokenMode, setUseTokenMode] = useState(Boolean(tokenParam && tokenParam.length > 10));
  const [resendTarget, setResendTarget] = useState(emailParam || '');
  const [verifyMethod, setVerifyMethod] = useState<'email' | 'phone'>('email');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [cooldown, setCooldown] = useState<number>(0);
  const [dispatchedOtp, setDispatchedOtp] = useState<string>('');

  // Find user data from DB
  const pendingData = getPendingVerificationData(resendTarget || emailParam);
  const targetUser = emailParam
    ? getUsersFromDB().find((u) => u.email === emailParam.toLowerCase())
    : null;

  useEffect(() => {
    if (pendingData && pendingData.otp) {
      setDispatchedOtp(pendingData.otp);
    }
  }, [pendingData]);

  // If token is in URL on load, verify immediately
  useEffect(() => {
    if (tokenParam) {
      handleVerify(tokenParam);
    }
  }, [tokenParam]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (clean.length > 1) {
      // User pasted multiple digits
      const pasted = clean.slice(0, 6).split('');
      pasted.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      if (pasted.length === 6) {
        handleVerify(pasted.join(''));
      }
      return;
    }

    newDigits[index] = clean;
    setOtpDigits(newDigits);

    // Auto focus next input
    if (clean && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto submit if all 6 filled
    if (newDigits.every((d) => d !== '')) {
      handleVerify(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = (codeToVerify: string) => {
    const clean = codeToVerify.trim();
    if (!clean) {
      setStatus('error');
      setMessage('Please enter your 6-digit OTP or verification token.');
      return;
    }

    setStatus('verifying');
    setTimeout(() => {
      const res = verifyEmail(clean);
      if (res.success) {
        setStatus('success');
        setMessage(res.message);
      } else {
        setStatus('error');
        setMessage(res.message);
      }
    }, 500);
  };

  const handleResend = () => {
    const target = resendTarget.trim();
    if (!target) {
      setStatus('error');
      setMessage('Please enter your account email or phone number to receive OTP.');
      return;
    }

    const res = resendVerification(target);
    if (res.success) {
      setMessage(res.message);
      if (res.otp) {
        setDispatchedOtp(res.otp);
      }
      setCooldown(60);
    } else {
      setMessage(res.message);
      if (res.cooldownRemaining) setCooldown(res.cooldownRemaining);
    }
  };

  const activeOtpCode = dispatchedOtp || targetUser?.verificationOtp || '849201';

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

        {/* Center Card */}
        <div
          style={{
            maxWidth: '540px',
            width: '100%',
            margin: 'auto',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '18px',
            padding: '2.5rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top ambient glow */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)',
            }}
          />

          {status === 'success' ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid #10b981',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  boxShadow: '0 0 25px rgba(16, 185, 129, 0.3)',
                }}
              >
                <CheckCircle2 size={38} />
              </div>

              <h1 style={{ fontSize: '1.95rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
                Identity Confirmed
              </h1>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                {message || 'Your driver credentials are confirmed and your account is active.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/garage" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                  <span>Enter My Garage</span>
                  <ExternalLink size={16} />
                </Link>

                <Link to="/profile" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                  <span>View Driver Profile</span>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Header with Avatar / Photo */}
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.25rem' }}>
                  {targetUser?.avatarUrl ? (
                    <img
                      src={targetUser.avatarUrl}
                      alt={targetUser.fullName}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--accent-cyan)',
                        boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                      }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 240, 255, 0.12)',
                        border: '1px solid var(--accent-cyan)',
                        color: 'var(--accent-cyan)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        boxShadow: '0 0 20px rgba(0, 240, 255, 0.25)',
                      }}
                    >
                      <Mail size={32} />
                    </div>
                  )}

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      backgroundColor: '#07090d',
                      borderRadius: '50%',
                      padding: '3px',
                    }}
                  >
                    <ShieldCheck size={18} color="var(--accent-cyan)" />
                  </div>
                </div>

                <h1 style={{ fontSize: '1.85rem', color: '#ffffff', marginBottom: '0.4rem', fontWeight: 800 }}>
                  Confirm Driver Identity
                </h1>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {emailParam ? (
                    <>
                      Verification token issued for <strong style={{ color: '#ffffff' }}>{emailParam}</strong>.
                      Enter the 6-digit OTP code sent to your Gmail or phone.
                    </>
                  ) : (
                    'Enter the 6-digit OTP code sent to your registered Gmail address or mobile phone.'
                  )}
                </p>
              </div>

              {/* Live Sandbox Dispatch Box (Simulated Real-World Dispatch) */}
              <div
                style={{
                  marginBottom: '1.75rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0, 240, 255, 0.06)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Sparkles size={15} color="var(--accent-cyan)" />
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent-cyan)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Dispatched Verification OTP
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Valid for 15m
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Code sent to:{' '}
                      <strong style={{ color: '#ffffff' }}>{emailParam || resendTarget || 'driver@autoverse.com'}</strong>
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        letterSpacing: '0.25em',
                        color: 'var(--accent-cyan)',
                        marginTop: '0.25rem',
                      }}
                    >
                      {activeOtpCode}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const digits = activeOtpCode.split('');
                      setOtpDigits(digits);
                      handleVerify(activeOtpCode);
                    }}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.45rem 0.85rem',
                      borderColor: 'var(--accent-cyan)',
                      color: 'var(--accent-cyan)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Auto-Fill & Verify
                  </button>
                </div>
              </div>

              {/* Status Message */}
              {message && (
                <div
                  style={{
                    marginBottom: '1.5rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    backgroundColor:
                      status === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 240, 255, 0.1)',
                    border: `1px solid ${status === 'error' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(0, 240, 255, 0.3)'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    color: status === 'error' ? '#f87171' : 'var(--accent-cyan)',
                    fontSize: '0.85rem',
                  }}
                >
                  {status === 'error' ? (
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                  ) : (
                    <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                  )}
                  <div>{message}</div>
                </div>
              )}

              {/* Switch Mode: 6-Digit OTP vs Security Token */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyMethod('email');
                      setUseTokenMode(false);
                    }}
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      background: !useTokenMode && verifyMethod === 'email' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                      border: `1px solid ${!useTokenMode && verifyMethod === 'email' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      color: !useTokenMode && verifyMethod === 'email' ? '#ffffff' : 'var(--text-muted)',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Mail size={12} /> Gmail OTP
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVerifyMethod('phone');
                      setUseTokenMode(false);
                    }}
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      background: !useTokenMode && verifyMethod === 'phone' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                      border: `1px solid ${!useTokenMode && verifyMethod === 'phone' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      color: !useTokenMode && verifyMethod === 'phone' ? '#ffffff' : 'var(--text-muted)',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Smartphone size={12} /> Phone OTP
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setUseTokenMode(!useTokenMode)}
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {useTokenMode ? 'Switch to 6-Digit OTP' : 'Use 32-char token'}
                </button>
              </div>

              {/* 6-Digit OTP Input Form */}
              {!useTokenMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: 'var(--accent-cyan)',
                        marginBottom: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                      }}
                    >
                      Enter 6-Digit Verification Code
                    </label>

                    {/* 6-box input */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.65rem',
                      }}
                    >
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          style={{
                            width: '48px',
                            height: '56px',
                            textAlign: 'center',
                            fontSize: '1.4rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono)',
                            color: '#ffffff',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: digit
                              ? '2px solid var(--accent-cyan)'
                              : '1px solid var(--border-medium)',
                            borderRadius: '10px',
                            outline: 'none',
                            boxShadow: digit ? '0 0 12px rgba(0, 240, 255, 0.25)' : 'none',
                            transition: 'all 0.2s ease',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerify(otpDigits.join(''))}
                    disabled={status === 'verifying' || otpDigits.join('').length < 6}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
                  >
                    {status === 'verifying' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Loader2 size={16} className="spin-animation" /> Verifying OTP...
                      </span>
                    ) : (
                      'Verify Account'
                    )}
                  </button>
                </div>
              ) : (
                /* Legacy 32-character Token Form (Preserves Stage 6 tests) */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                      Verification Security Token
                    </label>
                    <input
                      type="text"
                      placeholder="Paste 32-character token"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.85rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerify(tokenInput)}
                    disabled={status === 'verifying'}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
                  >
                    {status === 'verifying' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Loader2 size={16} className="spin-animation" /> Verifying Token...
                      </span>
                    ) : (
                      'Verify My Account'
                    )}
                  </button>

                  {targetUser && targetUser.verificationToken && (
                    <button
                      type="button"
                      onClick={() => {
                        if (targetUser.verificationToken) {
                          setTokenInput(targetUser.verificationToken);
                          handleVerify(targetUser.verificationToken);
                        }
                      }}
                      style={{
                        background: 'rgba(0, 240, 255, 0.08)',
                        border: '1px dashed var(--accent-cyan)',
                        borderRadius: '6px',
                        padding: '0.55rem',
                        color: 'var(--accent-cyan)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      ⚡ Auto-Fill 32-Char Token & Verify
                    </button>
                  )}
                </div>
              )}

              {/* Resend Action with Rate-Limit Cooldown */}
              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder={verifyMethod === 'email' ? 'driver@autoverse.com' : '+91 98480 22338'}
                    value={resendTarget}
                    onChange={(e) => setResendTarget(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.55rem 0.85rem',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <RotateCcw size={13} className={cooldown > 0 ? 'spin-animation' : ''} />
                    <span>{cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend OTP'}</span>
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>Need help? Contact support@autoverse.com</span>
                  <Link to="/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                    Sign in to existing account ➔
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
