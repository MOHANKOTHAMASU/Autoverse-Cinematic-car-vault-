import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer
      style={{
        backgroundColor: '#05070a',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '5rem',
        paddingBottom: '3.5rem',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* Top Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3rem',
            marginBottom: '4rem',
          }}
        >
          {/* Brand Col */}
          <div style={{ maxWidth: '340px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #162032 0%, #0c1017 100%)',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 9L12 14L22 9L12 2Z"
                    stroke="#00f0ff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 15L12 20L22 15"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#ffffff',
                }}
              >
                AUTOVERSE
              </span>
            </div>

            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '1.25rem',
              }}
            >
              Discover the Machines. Experience the Motion. The definitive digital discovery
              platform for premium automotive engineering, benchmark telemetry, and high-speed motion cinema.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: '#34d399',
              }}
            >
              <ShieldCheck size={14} />
              <span>STAGE 1 VERIFIED DATASET</span>
            </div>
          </div>

          {/* Nav Links */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}
            >
              Navigation
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <li>
                <Link
                  to="/"
                  style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Home Showcase
                </Link>
              </li>
              <li>
                <Link
                  to="/discover"
                  style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}
                >
                  Discover Cars (Stage 2 Fleet)
                </Link>
              </li>
              <li>
                <Link
                  to="/launches"
                  style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}
                >
                  Latest Launches
                </Link>
              </li>
              <li>
                <Link
                  to="/compare"
                  style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}
                >
                  Side-by-Side Compare
                </Link>
              </li>
              <li>
                <Link
                  to="/cinema"
                  style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}
                >
                  Road Cinema Theater
                </Link>
              </li>
            </ul>
          </div>

          {/* Member Portal */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}
            >
              Member Portal
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <li>
                <Link
                  to="/garage"
                  style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}
                >
                  My Garage
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}
                >
                  Driver Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}
                >
                  Member Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}
                >
                  Create Account
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setActiveLegalModal('privacy')}
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveLegalModal('terms')}
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter / Dispatches */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}
            >
              The Telemetry Dispatch
            </h4>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '1rem',
              }}
            >
              Receive certified engineering telemetry briefings and Road Cinema drops directly to
              your inbox.
            </p>

            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                required
                placeholder="driver@autoverse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '4px',
                  padding: '0.65rem 0.85rem',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  flex: 1,
                  minWidth: 0,
                }}
                aria-label="Email for telemetry dispatch"
              />
              <button
                type="submit"
                className="btn btn-cyan"
                style={{ padding: '0.65rem 1rem' }}
                aria-label="Subscribe to dispatch"
              >
                <ArrowRight size={16} />
              </button>
            </form>

            {subscribed && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  marginTop: '0.65rem',
                  color: '#34d399',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                }}
              >
                <Check size={14} />
                <span>Subscription verified. Welcome to AutoVerse.</span>
              </div>
            )}
          </div>
        </div>

        {/* Source Attribution & Legal Disclaimer */}
        <div
          style={{
            paddingTop: '2.5rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: 'var(--text-secondary)' }}>Source Attribution: </strong>
            All automotive technical specifications, curb weights, acceleration benchmarks,
            and press premiere data presented in Stage 1 are sourced from official manufacturer
            media centers: Porsche AG Newsroom, Audi MediaCenter, BMW Group PressClub,
            Mercedes-Benz Group Media, and Tesla Investor Relations. Trademarks, logos, and
            model designations belong exclusively to their respective copyright holders.
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
            }}
          >
            <span>© 2024 AutoVerse. All rights reserved. Stage 1 Production Release.</span>
            <span>Discover the Machines. Experience the Motion.</span>
          </div>
        </div>
      </div>

      {/* Privacy / Terms Modal */}
      {activeLegalModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(5, 7, 10, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setActiveLegalModal(null)}
        >
          <div
            style={{
              maxWidth: '600px',
              backgroundColor: '#0c1017',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              padding: '2rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '1rem' }}>
              {activeLegalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {activeLegalModal === 'privacy'
                ? 'AutoVerse Stage 1 operates client-side telemetry exploration. We do not sell user data, track personal browsing profiles, or store unencrypted authentication tokens. All garage preferences are managed securely.'
                : 'AutoVerse provides verified automotive technical data for enthusiast discovery and research. Performance metrics reflect closed-circuit testing and official homologation. Always obey local traffic laws.'}
            </p>
            <button
              onClick={() => setActiveLegalModal(null)}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Close Disclosure
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
