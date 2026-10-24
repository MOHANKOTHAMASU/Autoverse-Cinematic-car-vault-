// AutoVerse Stage 7: Protected Admin Route Guard
// Enforces server/database-level role verification on every privileged route

import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { isCurrentUserAdmin, getActiveSession, getCurrentUser, logoutUser } from '../utils/auth';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const location = useLocation();
  const session = getActiveSession();
  const currentUser = getCurrentUser();
  const isAdmin = isCurrentUserAdmin();

  // 1. Not signed in at all -> redirect to login with return path
  if (!session || !currentUser) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}&reason=admin_required`}
        replace
      />
    );
  }

  // 2. Signed in, but ordinary driver role -> Show 403 Forbidden with details
  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#07090d',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: 'rgba(15, 20, 28, 0.85)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '2.5rem',
            textAlign: 'center',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <ShieldAlert size={32} color="var(--accent-red)" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            403 — Privileged Access Denied
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            The AutoVerse Administration Terminal is restricted exclusively to certified platform administrators. Your account (<strong style={{ color: '#fff' }}>{currentUser.email}</strong>) is currently designated with <strong>Driver</strong> clearance.
          </p>

          <div
            style={{
              padding: '0.85rem',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '1.75rem',
              textAlign: 'left',
            }}
          >
            <strong>Setup Note:</strong> To access administrative tools, sign in with the system administrator account: <code style={{ color: 'var(--accent-cyan)' }}>admin@autoverse.com</code>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              <ArrowLeft size={16} />
              <span>Showcase Home</span>
            </Link>

            <button
              onClick={() => {
                logoutUser();
                window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`;
              }}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <LogOut size={16} />
              <span>Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Certified Administrator -> grant access
  return <>{children}</>;
};
