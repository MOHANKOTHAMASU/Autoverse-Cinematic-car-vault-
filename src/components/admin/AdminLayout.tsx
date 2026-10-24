// AutoVerse Stage 7: Admin Dashboard Master Layout
// Responsive automotive editorial shell with collapsible sidebar, system status & profile controls

import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Building2,
  Calendar,
  Film,
  Users,
  ScrollText,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  PlusCircle,
  ShieldCheck,
  Newspaper,
  Gauge,
  ShieldAlert,
  Bot,
  Zap,
  TrendingUp,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { getCurrentAdmin, logoutUser } from '../../utils/auth';

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const admin = getCurrentAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/marketplace', label: 'Used Car Moderation', icon: ShoppingBag },
    { to: '/admin/dealers', label: 'Dealer Network', icon: Building2 },
    { to: '/admin/test-drives', label: 'Test-Drive Bookings', icon: Clock },
    { to: '/admin/market-data', label: 'Market & Price Intel', icon: TrendingUp },
    { to: '/admin/safety', label: 'Safety & Recalls', icon: ShieldCheck },
    { to: '/admin/assistant', label: 'AI Assistant & Tools', icon: Bot },
    { to: '/admin/charging', label: 'EV Charging & Network', icon: Zap },
    { to: '/admin/community', label: 'Community & Moderation', icon: ShieldAlert },
    { to: '/admin/articles', label: 'News & Articles', icon: Newspaper },
    { to: '/admin/reviews', label: 'Car Reviews', icon: Gauge },
    { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
    { to: '/admin/manufacturers', label: 'Marques & OEMs', icon: Building2 },
    { to: '/admin/launches', label: 'Launch Calendar', icon: Calendar },
    { to: '/admin/cinema', label: 'Road Cinema', icon: Film },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/activity', label: 'Audit Activity Log', icon: ScrollText },
    { to: '/admin/settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#05070a',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 998,
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 1. SIDEBAR NAVIGATION */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#090c12',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 999,
          transform: mobileMenuOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.3s ease',
        }}
        className={mobileMenuOpen ? 'open' : ''}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                letterSpacing: '0.15em',
                background: 'linear-gradient(135deg, #ffffff 40%, var(--accent-cyan))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AUTOVERSE
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              ADMIN
            </span>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              padding: '0 0.75rem 0.6rem',
            }}
          >
            Terminal Navigation
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.7rem 0.85rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                    border: isActive
                      ? '1px solid rgba(6, 182, 212, 0.3)'
                      : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer: Public Site & Current Admin Profile */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Quick link to public website */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.8rem',
              marginBottom: '1rem',
              border: '1px solid var(--border-subtle)',
              transition: 'background-color 0.2s ease',
            }}
          >
            <span>View Public Platform</span>
            <ExternalLink size={14} />
          </Link>

          {/* Admin Identity Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {admin?.fullName || 'Administrator'}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {admin?.email}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out of Admin Terminal"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div
        style={{
          flex: 1,
          marginLeft: '260px',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
        className="admin-main-content"
      >
        {/* Top Header Bar */}
        <header
          style={{
            height: '68px',
            backgroundColor: '#090c12',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          {/* Left: Mobile Menu Trigger + Environment Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '0.4rem',
              }}
              className="mobile-menu-trigger"
              aria-label="Open Navigation"
            >
              <Menu size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 10px #10b981',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Database Online & Verified
              </span>
            </div>
          </div>

          {/* Right: Quick Action Shortcuts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              to="/admin/vehicles?action=add"
              className="btn btn-primary"
              style={{
                fontSize: '0.82rem',
                padding: '0.45rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <PlusCircle size={15} />
              <span>New Vehicle</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: '2rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 991px) {
          aside {
            transform: translateX(-100%);
          }
          aside.open {
            transform: translateX(0) !important;
          }
          .admin-main-content {
            margin-left: 0 !important;
          }
          .mobile-menu-trigger {
            display: flex !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};
