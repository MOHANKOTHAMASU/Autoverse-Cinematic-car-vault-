import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Car,
  Film,
  SlidersHorizontal,
  Sparkles,
  User,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Compass,
  LogOut,
  ChevronDown,
  Calculator,
  Newspaper,
  Gauge,
  Bookmark,
  Users,
  Bot,
  Navigation,
  Zap,
  Search,
  Bell,
  PenTool,
  TrendingUp,
  LayoutDashboard,
  Building2,
  Clock,
  ShoppingBag,
  PlusCircle,
  MessageSquare,
  Tag,
  Landmark,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSavedGarageSlugs } from '../utils/garage';

interface NavbarProps {
  onOpenGarageModal?: () => void;
  onOpenLoginModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const { currentUser, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const savedCarsCount = getSavedGarageSlugs().length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleDropdownEnter = (menuKey: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(menuKey);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const handleNavClick = (path: string, hash?: string) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    if (location.pathname === '/' && hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(path);
  };

  const navCategories = [
    {
      key: 'fleet',
      label: 'Fleet',
      icon: Car,
      activeCheck: ['/discover', '/compare', '/manufacturers', '/launches', '/cars', '/vehicle', '/dealers', '/used-cars', '/sell-car', '/offers'],
      items: [
        { name: 'Discover Cars', path: '/discover', icon: Car, desc: 'Curated 50 benchmark performance & luxury models' },
        { name: 'Dealer Offers & Specials', path: '/offers', icon: Tag, desc: 'Verified manufacturer discounts, exchange bonuses & promotions' },
        { name: 'Used Cars Marketplace', path: '/used-cars', icon: ShoppingBag, desc: 'Verified pre-owned vehicles, seller disclosures & direct enquiries' },
        { name: 'Sell Your Car', path: '/sell-car', icon: PlusCircle, desc: 'List your pre-owned vehicle in 4 guided steps' },
        { name: 'Dealer Network', path: '/dealers', icon: Building2, desc: 'Verified OEM showrooms, service hubs & test drives' },
        { name: 'Side-by-Side Compare', path: '/compare', icon: SlidersHorizontal, desc: 'Technical & kinematic specifications comparison' },
        { name: 'Marques & Heritage', path: '/manufacturers', icon: Compass, desc: 'Global automotive marques & legacy engineering' },
        { name: 'New Launches', path: '/launches', icon: Sparkles, desc: 'World premieres & upcoming vehicle debuts' },
      ],
    },
    {
      key: 'tools',
      label: 'Electric & Tools',
      icon: Zap,
      activeCheck: ['/trip-planner', '/charging-stations', '/car-finder', '/configurator', '/ownership-calculator', '/calculator', '/financing'],
      items: [
        { name: 'Car Finance & EMI Calculator', path: '/financing', icon: Landmark, desc: 'Reducing-balance EMI, zero-interest loans & scenario comparisons' },
        { name: 'EV Smart Trip Planner', path: '/trip-planner', icon: Navigation, desc: 'Battery SoC simulation & corridor stop routing' },
        { name: 'Charging Stations', path: '/charging-stations', icon: Zap, desc: 'High-power DC fast charger discovery & tariffs' },
        { name: 'Car Finder', path: '/car-finder', icon: Sparkles, desc: 'Algorithm-driven vehicle recommendation engine' },
        { name: '3D Studio Configurator', path: '/configurator', icon: SlidersHorizontal, desc: 'Custom paint, aerodynamics & bespoke trim' },
        { name: 'Finance & TCO Calculator', path: '/ownership-calculator', icon: Calculator, desc: '5-year ownership math, loans & running cost' },
      ],
    },
    {
      key: 'intel',
      label: 'Safety & Intel',
      icon: ShieldCheck,
      activeCheck: ['/safety', '/market-intelligence', '/news', '/reviews', '/assistant'],
      items: [
        { name: 'Market Intelligence', path: '/market-intelligence', icon: TrendingUp, desc: 'Verified pricing observations, launch deltas & segment analytics' },
        { name: 'Vehicle Price Explorer', path: '/market-intelligence/prices', icon: Search, desc: 'Search ex-showroom & MSRP prices across catalog models' },
        { name: 'Safety & Recall Intel', path: '/safety', icon: ShieldAlert, desc: 'Official MoRTH & NHTSA safety recall alerts & NCAP' },
        { name: 'Searchable Recall Base', path: '/safety/recalls', icon: Search, desc: 'Search active automotive safety defects & remedies' },
        { name: 'News & Editorial', path: '/news', icon: Newspaper, desc: 'Deep-dive automotive journalism & industry analysis' },
        { name: 'Road Tests & Reviews', path: '/reviews', icon: Gauge, desc: 'Instrumented telemetry & comprehensive track reviews' },
        { name: 'AI Assistant', path: '/assistant', icon: Bot, desc: 'Ground-truth engineering intelligence & recalls query' },
      ],
    },
    {
      key: 'community',
      label: 'Community',
      icon: Users,
      activeCheck: ['/community'],
      items: [
        { name: 'Community', path: '/community', icon: Users, desc: 'Discussions, verified telemetry & owner questions' },
        { name: 'Verified Owner Reviews', path: '/community', icon: ShieldCheck, desc: 'Long-term reliability reports by verified drivers' },
        { name: 'Write an Owner Review', path: '/community/write-review', icon: PenTool, desc: 'Share your vehicle experience with AutoVerse' },
      ],
    },
  ];

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'var(--header-height)',
          zIndex: 100,
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          backgroundColor: scrolled
            ? 'rgba(7, 9, 13, 0.94)'
            : 'rgba(7, 9, 13, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled
            ? '1px solid rgba(0, 240, 255, 0.15)'
            : '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <div
          className="container"
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Brand Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              flexShrink: 0,
            }}
            aria-label="AutoVerse Home"
          >
            {/* Aerodynamic Emblem */}
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #162032 0%, #0c1017 100%)',
                border: '1px solid rgba(0, 240, 255, 0.5)',
                boxShadow: '0 0 15px rgba(0, 240, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                AUTOVERSE
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-cyan)',
                    display: 'inline-block',
                    boxShadow: '0 0 8px var(--accent-cyan)',
                  }}
                />
              </div>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginTop: '-3px',
                }}
              >
                Automotive Intelligence
              </span>
            </div>
          </Link>

          {/* Grouped Desktop Navigation Bar (Movie-grade, no overflow) */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            className="desktop-nav"
          >
            {navCategories.map((cat) => {
              const isCatActive = cat.activeCheck.some((p) =>
                location.pathname === p || (p !== '/' && location.pathname.startsWith(p))
              );
              const isOpen = activeDropdown === cat.key;
              const IconComp = cat.icon;

              return (
                <div
                  key={cat.key}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => handleDropdownEnter(cat.key)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      color: isCatActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      backgroundColor: isOpen ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                      border: 'none',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <IconComp size={15} color={isCatActive ? 'var(--accent-cyan)' : 'currentColor'} />
                    <span>{cat.label}</span>
                    <ChevronDown
                      size={13}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease',
                        opacity: 0.7,
                      }}
                    />
                  </button>

                  {/* Dropdown Menu Panel */}
                  {isOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 0.4rem)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '320px',
                        backgroundColor: 'rgba(9, 13, 20, 0.98)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '14px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85)',
                        padding: '0.65rem',
                        zIndex: 110,
                        animation: 'fadeIn 0.18s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                        }}
                      >
                        {cat.items.map((sub) => {
                          const SubIcon = sub.icon;
                          const isSubActive = location.pathname === sub.path;
                          return (
                            <Link
                              key={sub.name}
                              to={sub.path}
                              onClick={() => setActiveDropdown(null)}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.75rem',
                                padding: '0.65rem 0.75rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                backgroundColor: isSubActive ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = isSubActive
                                  ? 'rgba(0, 240, 255, 0.1)'
                                  : 'transparent';
                              }}
                            >
                              <div
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '6px',
                                  backgroundColor: isSubActive ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  marginTop: '2px',
                                }}
                              >
                                <SubIcon size={15} color={isSubActive ? 'var(--accent-cyan)' : 'var(--text-secondary)'} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    color: isSubActive ? 'var(--accent-cyan)' : '#ffffff',
                                    marginBottom: '2px',
                                  }}
                                >
                                  {sub.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.72rem',
                                    color: 'var(--text-muted)',
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {sub.desc}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Direct Road Cinema Link with Cinematic Glow */}
            <Link
              to="/cinema"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: location.pathname === '/cinema' ? '#ff4d4d' : 'var(--text-secondary)',
                textDecoration: 'none',
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = location.pathname === '/cinema' ? '#ff4d4d' : 'var(--text-secondary)')
              }
            >
              <Film size={15} color={location.pathname === '/cinema' ? '#ff4d4d' : 'currentColor'} />
              <span>Road Cinema</span>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  boxShadow: '0 0 6px #ef4444',
                  display: 'inline-block',
                }}
              />
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.75rem',
            }}
            className="desktop-actions"
          >
            {/* Quick Safety Intelligence Shortcut */}
            <Link
              to="/safety"
              className="btn btn-secondary"
              style={{
                fontSize: '0.82rem',
                padding: '0.45rem 0.85rem',
                borderColor: location.pathname.startsWith('/safety') ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: location.pathname.startsWith('/safety') ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              }}
              title="Official Automotive Safety & Recall Intelligence"
            >
              <ShieldAlert size={14} color="var(--accent-cyan)" />
              <span>Safety</span>
            </Link>

            {/* Garage Link with Counter */}
            <Link
              to="/garage"
              className="btn btn-secondary"
              style={{
                fontSize: '0.82rem',
                padding: '0.45rem 0.95rem',
                borderColor: 'rgba(0, 240, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <ShieldCheck size={15} color="var(--accent-cyan)" />
              <span>My Garage</span>
              {savedCarsCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'rgba(0, 240, 255, 0.2)',
                    color: 'var(--accent-cyan)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                  }}
                >
                  {savedCarsCount}
                </span>
              )}
            </Link>

            {/* Authenticated User Menu vs Guest Buttons */}
            {isAuthenticated && currentUser ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '999px',
                    padding: '0.3rem 0.75rem 0.3rem 0.4rem',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  aria-expanded={userMenuOpen}
                  aria-label="User account menu"
                >
                  {/* Photo or Initials circle */}
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid var(--accent-cyan)',
                        boxShadow: '0 0 8px rgba(0, 240, 255, 0.3)',
                      }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0284c7 0%, #00f0ff 100%)',
                        color: '#07090d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                      }}
                    >
                      {currentUser.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}

                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {currentUser.fullName.split(' ')[0]}
                  </span>

                  <ChevronDown size={14} color="var(--text-muted)" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.6rem)',
                      right: 0,
                      width: '230px',
                      backgroundColor: 'rgba(9, 13, 20, 0.98)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '12px',
                      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
                      padding: '0.5rem',
                      zIndex: 110,
                      animation: 'fadeIn 0.2s ease',
                    }}
                  >
                    <div style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                        {currentUser.fullName}
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {currentUser.email}
                      </div>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.75rem',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(0, 240, 255, 0.08)',
                        marginBottom: '4px',
                      }}
                    >
                      <LayoutDashboard size={15} color="var(--accent-cyan)" />
                      <span>Owner Dashboard</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.75rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        borderRadius: '6px',
                      }}
                    >
                      <User size={15} color="var(--accent-cyan)" />
                      <span>Driver Profile & Photo</span>
                    </Link>

                    <Link
                      to="/safety/my-alerts"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.75rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        borderRadius: '6px',
                      }}
                    >
                      <Bell size={15} color="#f59e0b" />
                      <span>My Safety Alerts</span>
                    </Link>

                    <Link
                      to="/test-drive?tab=my_bookings"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.75rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        borderRadius: '6px',
                      }}
                    >
                      <Clock size={15} color="var(--accent-cyan)" />
                      <span>My Test Drives</span>
                    </Link>

                    <Link
                      to="/my-listings"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.75rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        borderRadius: '6px',
                      }}
                    >
                      <Car size={15} color="#10b981" />
                      <span>My Vehicle Listings</span>
                    </Link>

                    <Link
                      to="/saved-listings"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.75rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        borderRadius: '6px',
                      }}
                    >
                      <Bookmark size={15} color="var(--accent-cyan)" />
                      <span>Saved Vehicles</span>
                    </Link>

                    <Link
                      to="/my-enquiries"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.75rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        borderRadius: '6px',
                      }}
                    >
                      <MessageSquare size={15} color="#38bdf8" />
                      <span>My Enquiries</span>
                    </Link>

                    <Link
                      to="/my-financing"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.75rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        borderRadius: '6px',
                      }}
                    >
                      <Landmark size={15} color="#34d399" />
                      <span>My Saved Financing</span>
                    </Link>

                    <Link
                      to="/garage"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.75rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        borderRadius: '6px',
                      }}
                    >
                      <ShieldCheck size={15} color="var(--accent-cyan)" />
                      <span>My Garage ({savedCarsCount})</span>
                    </Link>

                    <Link
                      to="/reading-list"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.75rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        borderRadius: '6px',
                      }}
                    >
                      <Bookmark size={15} color="#fbbf24" />
                      <span>Reading List</span>
                    </Link>

                    <Link
                      to="/community/my-reviews"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.75rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        borderRadius: '6px',
                      }}
                    >
                      <Users size={15} color="#10b981" />
                      <span>My Owner Reviews</span>
                    </Link>

                    <Link
                      to="/community/saved"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.75rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        borderRadius: '6px',
                      }}
                    >
                      <Bookmark size={15} color="#38bdf8" />
                      <span>Saved Community</span>
                    </Link>

                    {currentUser.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.65rem 0.75rem',
                          color: 'var(--accent-cyan)',
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          backgroundColor: 'rgba(6, 182, 212, 0.12)',
                          border: '1px solid rgba(6, 182, 212, 0.25)',
                          marginTop: '0.35rem',
                          marginBottom: '0.35rem',
                        }}
                      >
                        <Shield size={15} color="var(--accent-cyan)" />
                        <span>Admin Terminal</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.75rem',
                        color: '#f87171',
                        fontSize: '0.85rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderTop: '1px solid var(--border-subtle)',
                        marginTop: '0.25rem',
                      }}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem' }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              color: 'var(--text-primary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(7, 9, 13, 0.98)',
            backdropFilter: 'blur(20px)',
            zIndex: 99,
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {navCategories.map((cat) => (
            <div key={cat.key}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-cyan)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '0.65rem',
                }}
              >
                {cat.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {cat.items.map((sub) => {
                  const SubIcon = sub.icon;
                  return (
                    <button
                      key={sub.name}
                      type="button"
                      onClick={() => handleNavClick(sub.path)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <SubIcon size={16} color="var(--accent-cyan)" />
                      <span>{sub.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Road Cinema in Mobile */}
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                color: '#ef4444',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.65rem',
              }}
            >
              Cinematic Motion
            </div>
            <button
              type="button"
              onClick={() => handleNavClick('/cinema')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ffffff',
                fontSize: '0.9rem',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <Film size={16} color="#ef4444" />
              <span>Road Cinema Experience</span>
            </button>
          </div>

          {/* Mobile Garage & Auth */}
          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-medium)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <Link
              to="/garage"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShieldCheck size={16} color="var(--accent-cyan)" />
              <span>My Garage ({savedCarsCount})</span>
            </Link>

            {isAuthenticated && currentUser ? (
              <>
                <Link
                  to="/profile"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={16} />
                  <span>Profile ({currentUser.fullName.split(' ')[0]})</span>
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', color: '#f87171' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  style={{ justifyContent: 'center' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media query styling for responsive desktop elements */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-actions {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
