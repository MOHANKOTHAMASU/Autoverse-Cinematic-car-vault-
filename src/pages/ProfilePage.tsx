import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  Calendar,
  Lock,
  LogOut,
  Save,
  Check,
  AlertCircle,
  Layers,
  Heart,
  SlidersHorizontal,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSavedGarageSlugs, getFavoriteSlugs, getSavedComparisons } from '../utils/garage';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  // Active tab
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile');

  // Profile Form States
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [favoriteBrand, setFavoriteBrand] = useState(currentUser?.favoriteBrand || 'Porsche');
  const [drivingPreference, setDrivingPreference] = useState(
    currentUser?.drivingPreference || 'Electric High-Performance'
  );
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  // Keep state synchronized with currentUser updates
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setPhone(currentUser.phone || '');
      setFavoriteBrand(currentUser.favoriteBrand || 'Porsche');
      setDrivingPreference(currentUser.drivingPreference || 'Electric High-Performance');
      setBio(currentUser.bio || '');
      setAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser]);

  // Password Change States
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');

  // Toast / status messages
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Stats
  const savedCarsCount = getSavedGarageSlugs().length;
  const favoriteCarsCount = getFavoriteSlugs().length;
  const comparisonsCount = getSavedComparisons().length;

  if (!currentUser) {
    return null; // Protected route will handle redirect
  }

  // Initials for avatar
  const initials = currentUser.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const res = updateProfile({
      fullName,
      phone,
      favoriteBrand,
      drivingPreference,
      bio,
      avatarUrl,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: 'Driver profile updated and persisted.' });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPass !== confirmNewPass) {
      setFeedback({ type: 'error', message: 'New passkeys do not match.' });
      return;
    }

    const res = await changePassword(currentPass, newPass);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div
      style={{
        paddingTop: 'calc(var(--header-height) + 2rem)',
        paddingBottom: '6rem',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div className="container">
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

        {/* Profile Header Banner */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            padding: '2.5rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '2rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Avatar Photo or Initials Badge */}
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--accent-cyan)',
                  boxShadow: '0 0 35px rgba(0, 240, 255, 0.4)',
                }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #00f0ff 100%)',
                  color: '#07090d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '2rem',
                  fontWeight: 900,
                  boxShadow: '0 0 35px rgba(0, 240, 255, 0.4)',
                }}
              >
                {initials}
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#ffffff', fontWeight: 800 }}>
                  {currentUser.fullName}
                </h1>
                {currentUser.isVerified ? (
                  <span className="badge badge-verified" style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}>
                    <ShieldCheck size={13} /> VERIFIED DRIVER
                  </span>
                ) : (
                  <Link
                    to={`/verify-email?email=${encodeURIComponent(currentUser.email)}`}
                    className="badge badge-cyan"
                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', textDecoration: 'none' }}
                  >
                    VERIFY EMAIL ➔
                  </Link>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={14} color="var(--accent-cyan)" /> {currentUser.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} color="var(--accent-cyan)" /> Member since{' '}
                  {new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/garage" className="btn btn-secondary" style={{ fontSize: '0.88rem' }}>
              <Layers size={16} /> My Garage ({savedCarsCount})
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{
                fontSize: '0.88rem',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: '#f87171',
              }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            style={{
              marginBottom: '2rem',
              padding: '1rem 1.25rem',
              borderRadius: '8px',
              backgroundColor:
                feedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${
                feedback.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'
              }`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: feedback.type === 'success' ? '#34d399' : '#f87171',
              fontSize: '0.9rem',
            }}
          >
            {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <div>{feedback.message}</div>
          </div>
        )}

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            borderBottom: '1px solid var(--border-medium)',
            paddingBottom: '0.75rem',
            marginBottom: '2rem',
          }}
        >
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'profile' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'profile' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'profile' ? '#ffffff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Driver Information
          </button>

          <button
            onClick={() => setActiveTab('security')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'security' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'security' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'security' ? '#ffffff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Security & Passkey
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'activity' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              border: `1px solid ${activeTab === 'activity' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'activity' ? '#ffffff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Telemetry & Garage Overview
          </button>
        </div>

        {/* Tab 1: Profile Form */}
        {activeTab === 'profile' && (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '2.5rem',
              maxWidth: '720px',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '1.5rem', fontWeight: 700 }}>
              Driver Information Settings
            </h2>

            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-cyan)',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Full Legal / Driver Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-cyan)',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Contact Telephone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--accent-cyan)',
                      marginBottom: '0.4rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    Favorite Marque
                  </label>
                  <select
                    value={favoriteBrand}
                    onChange={(e) => setFavoriteBrand(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#0c1017',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="Porsche" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Porsche</option>
                    <option value="Tesla" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Tesla</option>
                    <option value="Audi" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Audi</option>
                    <option value="BMW" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>BMW</option>
                    <option value="Mercedes-Benz" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Mercedes-Benz</option>
                    <option value="Tata Motors" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Tata Motors</option>
                    <option value="Mahindra" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Mahindra</option>
                    <option value="Maruti Suzuki" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Maruti Suzuki</option>
                    <option value="Toyota" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Toyota</option>
                    <option value="Hyundai" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Hyundai</option>
                    <option value="Kia" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Kia</option>
                    <option value="Honda" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Honda</option>
                    <option value="MG" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>MG</option>
                    <option value="BYD" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>BYD</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--accent-cyan)',
                      marginBottom: '0.4rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    Driving Discipline Preference
                  </label>
                  <select
                    value={drivingPreference}
                    onChange={(e) => setDrivingPreference(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#0c1017',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="Electric High-Performance" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Electric High-Performance</option>
                    <option value="Track & Motorsport" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Track & Motorsport</option>
                    <option value="Grand Touring" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Grand Touring</option>
                    <option value="Acoustic Luxury" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Acoustic Luxury</option>
                    <option value="Daily Commute & Efficiency" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Daily Commute & Efficiency</option>
                    <option value="Off-Road & Adventure" style={{ backgroundColor: '#0c1017', color: '#ffffff' }}>Off-Road & Adventure</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-cyan)',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Driver Avatar / Photo URL
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or choose preset below"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                    }}
                  />
                  {avatarUrl && (
                    <img
                      src={avatarUrl}
                      alt="Avatar preview"
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--accent-cyan)',
                      }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>

                {/* Preset driver avatar buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Motorsport Racer', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
                    { label: 'Executive Driver', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
                    { label: 'EV Specialist', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80' },
                    { label: 'Track Master', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setAvatarUrl(preset.url)}
                      style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        backgroundColor: avatarUrl === preset.url ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${avatarUrl === preset.url ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                        color: avatarUrl === preset.url ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-cyan)',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Driver Bio / Garage Philosophy
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your driving collection or dream vehicles..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                  <Save size={16} /> Save Changes
                </button>

                {feedback && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      backgroundColor: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                      color: feedback.type === 'success' ? '#34d399' : '#f87171',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                    }}
                  >
                    {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                    <span>{feedback.message}</span>
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '2.5rem',
              maxWidth: '640px',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '1.5rem', fontWeight: 700 }}>
              Passkey & Account Security
            </h2>

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-cyan)',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Current Passkey
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-cyan)',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase',
                  }}
                >
                  New Passkey (Min 8 chars, 1 uppercase, 1 symbol)
                </label>
                <input
                  type="password"
                  required
                  placeholder="New secure passkey"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-cyan)',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Confirm New Passkey
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new secure passkey"
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                  <Lock size={16} /> Update Passkey
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Activity Overview */}
        {activeTab === 'activity' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '14px',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <Layers size={36} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>
                {savedCarsCount}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                Saved Vehicles in Garage
              </div>
              <Link to="/garage" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Open Garage
              </Link>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '14px',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <Heart size={36} color="#f43f5e" style={{ marginBottom: '1rem' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>
                {favoriteCarsCount}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                Favorite Flagship Vehicles
              </div>
              <Link to="/garage?tab=favorites" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                View Favorites
              </Link>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '14px',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <SlidersHorizontal size={36} color="#38bdf8" style={{ marginBottom: '1rem' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>
                {comparisonsCount}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                Saved Telemetry Comparisons
              </div>
              <Link to="/compare" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Compare Hub
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
