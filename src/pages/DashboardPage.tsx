// AutoVerse Stage 19: Personalized Automotive Dashboard & Ownership Command Center
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Navigation,
  Bookmark,
  Sparkles,
  DollarSign,
  RefreshCw,
  Settings,
  ChevronRight,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  RotateCcw,
  Compass,
  X,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import {
  getDashboardSummary,
  getDashboardPreferences,
  saveDashboardPreferences,
  resetDashboardPreferences,
  getPersonalizedRecommendations,
  getUserActivityTimeline,
  getDashboardCostInsights,
  dismissRecommendation,
} from '../utils/dashboardStore';
import { getOwnedVehicles, getMaintenanceTasks, completeMaintenanceTask } from '../utils/ownershipStore';
import { getSavedGarageSlugs } from '../utils/garage';
import { getUserSafetyAlerts } from '../utils/safetyService';
import { getUserSavedTrips } from '../utils/tripPlannerStore';
import { getUserReadingList, getArticleById } from '../utils/editorialStore';
import { getUserBookings } from '../utils/dealerStore';
import { getSellerListings, getUserSavedListingsWithDetails } from '../utils/marketplaceStore';
import { VEHICLES } from '../data/vehicles';
import type { DashboardPreferences } from '../types/dashboard';
import type { BodyType } from '../types';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'demo_user';

  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local editable preferences for modal
  const [prefs, setPrefs] = useState<DashboardPreferences>(() => getDashboardPreferences(userId));

  // Load dashboard data
  const summary = getDashboardSummary(userId, currentUser || undefined);
  const ownedVehicles = getOwnedVehicles(userId);
  const savedSlugs = getSavedGarageSlugs();
  const savedVehicles = VEHICLES.filter((v) => savedSlugs.includes(v.id) || savedSlugs.includes(v.slug));
  const maintenanceTasks = getMaintenanceTasks(userId);
  const safetyAlerts = getUserSafetyAlerts(userId);
  const savedTrips = getUserSavedTrips(userId);
  const readingListItems = getUserReadingList(userId);
  const readingArticles = readingListItems
    .map((item) => getArticleById(item.articleId))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  const recommendations = getPersonalizedRecommendations(userId, 4);
  const costInsights = getDashboardCostInsights(userId);
  const activityEvents = getUserActivityTimeline(userId, 6);
  const userTestDrives = getUserBookings(userId);
  const userListings = getSellerListings(userId);
  const userSavedListings = getUserSavedListingsWithDetails(userId);

  // Synchronize on external changes
  useEffect(() => {
    const handleSync = () => {
      setRefreshKey((k) => k + 1);
      setPrefs(getDashboardPreferences(userId));
    };

    window.addEventListener('autoverse_ownership_updated', handleSync);
    window.addEventListener('autoverse_garage_updated', handleSync);
    window.addEventListener('autoverse_safety_alerts_changed', handleSync);
    window.addEventListener('autoverse_editorial_updated', handleSync);
    window.addEventListener('autoverse_dashboard_prefs_updated', handleSync);
    window.addEventListener('autoverse_test_drives_updated', handleSync);
    window.addEventListener('autoverse_marketplace_updated', handleSync);
    window.addEventListener('autoverse_saved_listings_updated', handleSync);
    window.addEventListener('autoverse_marketplace_enquiries_updated', handleSync);

    return () => {
      window.removeEventListener('autoverse_ownership_updated', handleSync);
      window.removeEventListener('autoverse_garage_updated', handleSync);
      window.removeEventListener('autoverse_safety_alerts_changed', handleSync);
      window.removeEventListener('autoverse_editorial_updated', handleSync);
      window.removeEventListener('autoverse_dashboard_prefs_updated', handleSync);
      window.removeEventListener('autoverse_test_drives_updated', handleSync);
      window.removeEventListener('autoverse_marketplace_updated', handleSync);
      window.removeEventListener('autoverse_saved_listings_updated', handleSync);
      window.removeEventListener('autoverse_marketplace_enquiries_updated', handleSync);
    };
  }, [userId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setIsRefreshing(false);
      showToast('Dashboard telemetry synchronized');
    }, 400);
  };

  const handleCompleteTask = (taskId: string) => {
    completeMaintenanceTask(taskId, userId, { createServiceRecord: true });
    setRefreshKey((k) => k + 1);
    showToast('Maintenance task marked completed');
  };

  const handleDismissRecommendation = (slug: string) => {
    dismissRecommendation(userId, slug);
    setRefreshKey((k) => k + 1);
    showToast('Vehicle removed from recommendations');
  };

  const handleSavePreferences = () => {
    saveDashboardPreferences(userId, prefs);
    setShowPrefsModal(false);
    setRefreshKey((k) => k + 1);
    showToast('Personalization preferences updated');
  };

  const handleResetPreferences = () => {
    const defaults = resetDashboardPreferences(userId);
    setPrefs(defaults);
    setRefreshKey((k) => k + 1);
    showToast('Preferences restored to defaults');
  };

  const toggleWidget = (widgetKey: keyof typeof prefs.widgetVisibility) => {
    setPrefs((prev) => ({
      ...prev,
      widgetVisibility: {
        ...prev.widgetVisibility,
        [widgetKey]: !prev.widgetVisibility[widgetKey],
      },
    }));
  };

  const toggleBodyType = (bt: BodyType) => {
    setPrefs((prev) => {
      const exists = prev.preferredBodyTypes.includes(bt);
      const updated = exists
        ? prev.preferredBodyTypes.filter((t) => t !== bt)
        : [...prev.preferredBodyTypes, bt];
      return { ...prev, preferredBodyTypes: updated };
    });
  };

  const togglePowertrain = (pt: 'electric' | 'hybrid' | 'petrol' | 'diesel') => {
    setPrefs((prev) => {
      const exists = prev.preferredPowertrains.includes(pt);
      const updated = exists
        ? prev.preferredPowertrains.filter((t) => t !== pt)
        : [...prev.preferredPowertrains, pt];
      return { ...prev, preferredPowertrains: updated };
    });
  };

  // Visibility state shortcut
  const vis = prefs.widgetVisibility;

  return (
    <div
      style={{
        paddingTop: 'calc(var(--header-height) + 2rem)',
        paddingBottom: '6rem',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 9999,
            backgroundColor: 'var(--accent-cyan)',
            color: '#07090d',
            padding: '0.85rem 1.4rem',
            borderRadius: '8px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.85rem',
            boxShadow: '0 10px 30px rgba(0, 240, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="container" key={refreshKey}>
        {/* ========================================================= */}
        {/* SECTION A: WELCOME HEADER & EXECUTIVE COMMAND BAR         */}
        {/* ========================================================= */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1.5rem',
            marginBottom: '2.5rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-cyan">
                <ShieldCheck size={12} /> PERSONAL AUTOMOTIVE COMMAND CENTER
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {summary.formattedDate}
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                color: '#ffffff',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                marginBottom: '0.65rem',
              }}
            >
              {summary.greeting}
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '780px', lineHeight: 1.5 }}>
              {summary.contextSummary}
            </p>
          </div>

          {/* Quick Action Group */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
            <button
              onClick={handleManualRefresh}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.6rem 0.85rem' }}
              title="Synchronize live dashboard telemetry"
              disabled={isRefreshing}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin-anim' : ''} color="var(--accent-cyan)" />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={() => setShowPrefsModal(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.6rem 0.85rem' }}
              title="Configure recommendations and widget visibility"
            >
              <Settings size={14} />
              <span>Customize</span>
            </button>

            <Link
              to="/discover"
              className="btn btn-primary"
              style={{ fontSize: '0.82rem', padding: '0.6rem 1rem' }}
            >
              <Plus size={14} />
              <span>Add Vehicle</span>
            </Link>
          </div>
        </div>

        {/* Quick Access Action Cards Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          <Link
            to="/garage?tab=owned"
            className="hover-cyan"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '1.15rem 1.25rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Car size={20} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Owned Fleet
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                {summary.ownedVehiclesCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Vehicles</span>
              </div>
            </div>
          </Link>

          <Link
            to="/garage?tab=maintenance"
            className="hover-cyan"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: summary.overdueMaintenanceCount > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '1.15rem 1.25rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: summary.overdueMaintenanceCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Wrench size={20} color={summary.overdueMaintenanceCount > 0 ? '#ef4444' : '#f59e0b'} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Maintenance Tasks
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                {summary.upcomingMaintenanceCount + summary.overdueMaintenanceCount}{' '}
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: summary.overdueMaintenanceCount > 0 ? '#ef4444' : 'var(--text-secondary)' }}>
                  ({summary.overdueMaintenanceCount} overdue)
                </span>
              </div>
            </div>
          </Link>

          <Link
            to="/safety/my-alerts"
            className="hover-cyan"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: summary.activeRecallsCount > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '1.15rem 1.25rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: summary.activeRecallsCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldAlert size={20} color={summary.activeRecallsCount > 0 ? '#ef4444' : '#10b981'} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Recall Bulletins
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                {summary.activeRecallsCount}{' '}
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: summary.activeRecallsCount > 0 ? '#ef4444' : '#10b981' }}>
                  {summary.activeRecallsCount === 0 ? 'Clear' : 'Active'}
                </span>
              </div>
            </div>
          </Link>

          <Link
            to="/trip-planner"
            className="hover-cyan"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '1.15rem 1.25rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Navigation size={20} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Saved EV Trips
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                {summary.savedTripsCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Routes</span>
              </div>
            </div>
          </Link>

          {/* Quick Test Drives Card */}
          <Link
            to="/test-drive?tab=my_bookings"
            className="hover-cyan"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '1.15rem 1.25rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Clock size={20} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Test Drives
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                {userTestDrives.length}{' '}
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Active/Booked
                </span>
              </div>
            </div>
          </Link>

          {/* Quick Pre-Owned Marketplace Card */}
          <Link
            to="/my-listings"
            className="hover-cyan"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '1.15rem 1.25rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Car size={20} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Used Marketplace
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                {userListings.length}{' '}
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Listings ({userSavedListings.length} Saved)
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* ========================================================= */}
        {/* MAIN DASHBOARD CONTENT GRID                               */}
        {/* ========================================================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>
          
          {/* LEFT 8 COLUMNS: Fleet, Maintenance, Trips, Recommendations */}
          <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* WIDGET B: MY GARAGE OVERVIEW */}
            {vis.garageOverview && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Car size={18} color="var(--accent-cyan)" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      My Garage Overview
                    </h2>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      {ownedVehicles.length} Owned • {savedVehicles.length} Shortlisted
                    </span>
                  </div>

                  <Link
                    to="/garage"
                    style={{
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span>Open Garage</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                {ownedVehicles.length === 0 && savedVehicles.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '3rem 1.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '12px',
                      border: '1px dashed var(--border-subtle)',
                    }}
                  >
                    <Car size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                    <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.35rem' }}>Your Garage is Empty</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                      No vehicles are currently saved or marked as owned in your profile. Explore our 50 curated models to start tracking.
                    </p>
                    <Link to="/discover" className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
                      <Compass size={14} />
                      <span>Explore Fleet</span>
                    </Link>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {/* Owned Vehicles First */}
                    {ownedVehicles.map((v) => (
                      <div
                        key={v.id}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'border-color 0.2s ease',
                        }}
                      >
                        <div style={{ height: '140px', backgroundColor: '#07090d', position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={v.photoUrl || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80'}
                            alt={`${v.make} ${v.model}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: '0.65rem',
                              left: '0.65rem',
                              backgroundColor: 'rgba(16, 185, 129, 0.9)',
                              color: '#ffffff',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                            }}
                          >
                            OWNED MACHINE
                          </span>
                        </div>

                        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '2px' }}>
                            {v.year} • {v.powertrain}
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                            {v.make} {v.model}
                          </div>
                          {v.nickname && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                              "{v.nickname}"
                            </div>
                          )}

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.72rem',
                              color: 'var(--text-secondary)',
                              marginTop: 'auto',
                              paddingTop: '0.65rem',
                              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            }}
                          >
                            <span>Odometer</span>
                            <span style={{ color: '#ffffff', fontWeight: 700 }}>
                              {v.currentOdometer.toLocaleString()} {v.odometerUnit}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                            {v.vehicleSlug && (
                              <Link
                                to={`/vehicles/${v.vehicleSlug}`}
                                className="btn btn-secondary"
                                style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem', justifyContent: 'center' }}
                              >
                                <span>Specs</span>
                              </Link>
                            )}
                            <Link
                              to={`/garage?tab=owned`}
                              className="btn btn-secondary"
                              style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem', justifyContent: 'center', borderColor: 'var(--accent-cyan)' }}
                            >
                              <span>Manage</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Shortlisted / Saved Vehicles */}
                    {savedVehicles.map((v) => (
                      <div
                        key={v.id}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'border-color 0.2s ease',
                        }}
                      >
                        <div style={{ height: '140px', backgroundColor: '#07090d', position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={v.thumbnail || v.imageGallery?.[0] || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80'}
                            alt={`${v.brand} ${v.model}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: '0.65rem',
                              left: '0.65rem',
                              backgroundColor: 'rgba(0, 240, 255, 0.2)',
                              color: 'var(--accent-cyan)',
                              border: '1px solid rgba(0, 240, 255, 0.4)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                            }}
                          >
                            SHORTLISTED
                          </span>
                        </div>

                        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '2px' }}>
                            {v.bodyType.toUpperCase()} • {v.powertrain.toUpperCase()}
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                            {v.brand} {v.model}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Starting at ${v.price?.toLocaleString()}
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.65rem' }}>
                            <Link
                              to={`/vehicles/${v.slug || v.id}`}
                              className="btn btn-secondary"
                              style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem', justifyContent: 'center' }}
                            >
                              <span>Specs</span>
                            </Link>
                            <Link
                              to={`/compare?a=${v.slug || v.id}`}
                              className="btn btn-secondary"
                              style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem', justifyContent: 'center' }}
                            >
                              <span>Compare</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WIDGET C: MAINTENANCE AND SERVICE TIMELINE */}
            {vis.maintenanceTimeline && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Wrench size={18} color="#f59e0b" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      Maintenance & Service Timeline
                    </h2>
                  </div>

                  <Link
                    to="/garage?tab=maintenance"
                    style={{
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span>Full Schedule</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                {maintenanceTasks.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '2.5rem 1.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '12px',
                    }}
                  >
                    <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                    <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.25rem' }}>All Scheduled Tasks Clear</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      No pending or overdue service records logged for your current vehicles.
                    </p>
                    <Link to="/garage?tab=maintenance" className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                      <Plus size={13} />
                      <span>Schedule Maintenance</span>
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {maintenanceTasks.slice(0, 4).map((task) => {
                      const isOverdue = task.status === 'overdue';
                      const isDue = task.status === 'due';
                      const isCompleted = task.isCompleted;

                      return (
                        <div
                          key={task.id}
                          style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '10px',
                            backgroundColor: isOverdue
                              ? 'rgba(239, 68, 68, 0.05)'
                              : isDue
                              ? 'rgba(245, 158, 11, 0.05)'
                              : 'rgba(255, 255, 255, 0.02)',
                            border: isOverdue
                              ? '1px solid rgba(239, 68, 68, 0.25)'
                              : isDue
                              ? '1px solid rgba(245, 158, 11, 0.25)'
                              : '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '1rem',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '4px',
                                  backgroundColor: isCompleted
                                    ? 'rgba(16, 185, 129, 0.2)'
                                    : isOverdue
                                    ? 'rgba(239, 68, 68, 0.2)'
                                    : 'rgba(245, 158, 11, 0.2)',
                                  color: isCompleted ? '#10b981' : isOverdue ? '#ef4444' : '#f59e0b',
                                }}
                              >
                                {isCompleted ? 'COMPLETED' : isOverdue ? 'OVERDUE' : 'DUE SOON'}
                              </span>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                                {task.taskName}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                              {task.nextDueDate && <span>Due Date: {task.nextDueDate}</span>}
                              {task.nextDueOdometer && <span>Due Odometer: {task.nextDueOdometer.toLocaleString()} km</span>}
                              {task.serviceProvider && <span>Provider: {task.serviceProvider}</span>}
                              {task.estimatedCost && <span>Est: ${task.estimatedCost}</span>}
                            </div>
                          </div>

                          <div>
                            {!isCompleted ? (
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#10b981' }}
                              >
                                <Check size={13} />
                                <span>Mark Completed</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                                Done on {task.completedDate}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* WIDGET D: SAFETY & RECALL ALERTS */}
            {vis.safetyAlerts && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <ShieldAlert size={18} color={safetyAlerts.length > 0 ? '#ef4444' : '#10b981'} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      Safety & Official Recall Bulletins
                    </h2>
                  </div>

                  <Link
                    to="/safety/my-alerts"
                    style={{
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span>View All Alerts</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                {safetyAlerts.length === 0 ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                    }}
                  >
                    <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
                        No Active Safety Campaigns on File
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Your currently monitored garage fleet has no pending recalls in the monitored NHTSA and MoRTH datasets.
                        <br />
                        <strong style={{ color: 'var(--text-muted)' }}>Important Disclaimer:</strong> The absence of a record does not guarantee your vehicle is recall-free. Always verify your 17-character VIN at official portals.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {safetyAlerts.slice(0, 3).map((alert) => (
                      <div
                        key={alert.id}
                        style={{
                          padding: '1.2rem',
                          borderRadius: '10px',
                          backgroundColor: alert.isReviewed ? 'rgba(255, 255, 255, 0.02)' : 'rgba(239, 68, 68, 0.05)',
                          border: alert.isReviewed ? '1px solid var(--border-subtle)' : '1px solid rgba(239, 68, 68, 0.3)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                          <div>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                backgroundColor: alert.severity === 'critical' ? '#ef4444' : 'rgba(245, 158, 11, 0.2)',
                                color: '#ffffff',
                                display: 'inline-block',
                                marginBottom: '4px',
                              }}
                            >
                              {alert.severity.toUpperCase()} SEVERITY
                            </span>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                              {alert.recallTitle}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                              Vehicle: {alert.vehicleName}
                            </div>
                          </div>

                          <Link
                            to={`/safety/recalls/${alert.recallId}`}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', flexShrink: 0 }}
                          >
                            <span>Dossier</span>
                            <ArrowRight size={12} />
                          </Link>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {alert.matchReason}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WIDGET G: PERSONALIZED CAR RECOMMENDATIONS */}
            {vis.recommendations && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Sparkles size={18} color="var(--accent-cyan)" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      Personalized Recommendations
                    </h2>
                  </div>

                  <Link
                    to="/car-finder"
                    style={{
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span>Car Finder</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {recommendations.map(({ vehicle, matchScore, reasons, highlightTag }) => (
                    <div
                      key={vehicle.id}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{ height: '140px', backgroundColor: '#07090d', position: 'relative' }}>
                        <img
                          src={vehicle.thumbnail || vehicle.imageGallery?.[0] || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80'}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            top: '0.65rem',
                            left: '0.65rem',
                            backgroundColor: 'rgba(0, 240, 255, 0.25)',
                            backdropFilter: 'blur(8px)',
                            color: 'var(--accent-cyan)',
                            border: '1px solid rgba(0, 240, 255, 0.4)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                          }}
                        >
                          {matchScore}% MATCH • {highlightTag}
                        </span>

                        <button
                          onClick={() => handleDismissRecommendation(vehicle.slug || vehicle.id)}
                          style={{
                            position: 'absolute',
                            top: '0.65rem',
                            right: '0.65rem',
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            border: 'none',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Dismiss recommendation"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div style={{ padding: '1.1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '2px' }}>
                          {vehicle.bodyType.toUpperCase()} • ${vehicle.price?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.65rem' }}>
                          {vehicle.brand} {vehicle.model}
                        </div>

                        {/* Explainable Rationale */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                          {reasons.map((r, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                              <CheckCircle2 size={12} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                          <Link
                            to={`/vehicles/${vehicle.slug || vehicle.id}`}
                            className="btn btn-secondary"
                            style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem', justifyContent: 'center' }}
                          >
                            <span>Dossier</span>
                          </Link>
                          <Link
                            to={`/compare?a=${vehicle.slug || vehicle.id}`}
                            className="btn btn-secondary"
                            style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem', justifyContent: 'center', borderColor: 'var(--accent-cyan)' }}
                          >
                            <span>Compare</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WIDGET E: SAVED TRIPS & EV CHARGING PLANS */}
            {vis.savedTrips && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Navigation size={18} color="#38bdf8" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      Saved EV Trips & Charging Corridors
                    </h2>
                  </div>

                  <Link
                    to="/trip-planner"
                    style={{
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span>Plan Route</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                {savedTrips.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '2.5rem 1.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '12px',
                    }}
                  >
                    <Navigation size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                    <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.25rem' }}>No Saved Routes</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      Plan an EV highway journey with verified 800V and 150kW fast-charging stops.
                    </p>
                    <Link to="/trip-planner" className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
                      <Navigation size={13} />
                      <span>Plan Route</span>
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {savedTrips.slice(0, 3).map((tr) => (
                      <div
                        key={tr.id}
                        style={{
                          padding: '1.25rem',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '2px' }}>
                            {tr.vehicleName}
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
                            {tr.title}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {tr.originName} → {tr.destinationName}
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: '1rem',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            paddingTop: '0.5rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Distance</span>
                            <span style={{ color: '#ffffff', fontWeight: 700 }}>{tr.totalDistanceKm} km</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Stops</span>
                            <span style={{ color: '#ffffff', fontWeight: 700 }}>{tr.chargingStopsCount}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Est. Cost</span>
                            <span style={{ color: '#ffffff', fontWeight: 700 }}>
                              {tr.currency} {tr.totalCost}
                            </span>
                          </div>
                        </div>

                        <Link
                          to={`/trip-planner/plan/${tr.id}`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'center', marginTop: 'auto' }}
                        >
                          <span>Resume Highway Plan</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WIDGET H: OWNERSHIP & COST INSIGHTS */}
            {vis.costInsights && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <DollarSign size={18} color="#10b981" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      Ownership & Ledger Insights
                    </h2>
                  </div>

                  <Link
                    to="/ownership-calculator"
                    style={{
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span>TCO Calculator</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>TOTAL RECORDED</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>
                      ${costInsights.totalRecordedExpenses.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {costInsights.recordedTransactionsCount} recorded transactions
                    </div>
                  </div>

                  <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>MAINTENANCE & SERVICE</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', margin: '4px 0' }}>
                      ${costInsights.maintenanceTotal.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Authorized service records</div>
                  </div>

                  <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>ENERGY & CHARGING</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', margin: '4px 0' }}>
                      ${costInsights.chargingFuelTotal.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Logged sessions</div>
                  </div>

                  <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>ANNUAL INSURANCE</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a78bfa', margin: '4px 0' }}>
                      ${costInsights.insuranceTotal.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Active policy premium</div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 240, 255, 0.05)',
                    border: '1px solid rgba(0, 240, 255, 0.15)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <span>Ledger reflects actual owner receipts. Loan estimates and resale models are kept in TCO Calculator.</span>
                  <Link to="/market-intelligence" style={{ color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'none' }}>
                    View Market Price Intel →
                  </Link>
                </div>
              </div>
            )}

            {/* WIDGET F: READING LIST & EDITORIAL BOOKMARKS */}
            {vis.readingList && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Bookmark size={18} color="#a78bfa" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      Saved Editorial & Reading List
                    </h2>
                  </div>

                  <Link
                    to="/reading-list"
                    style={{
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span>Reading List</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                {readingArticles.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '2.5rem 1.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '12px',
                    }}
                  >
                    <Bookmark size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                    <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.25rem' }}>No Bookmarks Saved</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      Save technical journalism stories, world premieres, and verified track tests for offline reading.
                    </p>
                    <Link to="/editorial" className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                      <span>Explore Stories</span>
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {readingArticles.slice(0, 3).map((art) => (
                      <Link
                        key={art.id}
                        to={`/news/${art.slug}`}
                        className="hover-cyan"
                        style={{
                          textDecoration: 'none',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ height: '130px', backgroundColor: '#07090d', overflow: 'hidden' }}>
                          <img
                            src={art.heroImage}
                            alt={art.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                              {art.category}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>•</span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              <Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                              {art.readingTimeMinutes} min read
                            </span>
                          </div>

                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.35, marginBottom: '0.5rem' }}>
                            {art.title}
                          </div>

                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>
                            By {art.author.name}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WIDGET I: RECENT ACTIVITY TIMELINE */}
            {vis.recentActivity && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                  <Clock size={18} color="var(--accent-cyan)" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Recent Automotive Activity
                  </h2>
                </div>

                {activityEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No recorded activity events logged yet. Your actions will appear here as you interact with AutoVerse.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activityEvents.map((evt) => (
                      <div
                        key={evt.id}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(0, 240, 255, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {evt.category === 'fleet' && <Car size={16} color="var(--accent-cyan)" />}
                            {evt.category === 'maintenance' && <Wrench size={16} color="#f59e0b" />}
                            {evt.category === 'travel' && <Navigation size={16} color="#38bdf8" />}
                            {evt.category === 'editorial' && <Bookmark size={16} color="#a78bfa" />}
                            {evt.category === 'community' && <ShieldCheck size={16} color="#10b981" />}
                          </div>

                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                              {evt.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {evt.description}
                            </div>
                          </div>
                        </div>

                        <Link
                          to={evt.linkUrl}
                          style={{
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--accent-cyan)',
                            textDecoration: 'none',
                            flexShrink: 0,
                          }}
                        >
                          View →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PERSONALIZATION & LAYOUT CUSTOMIZATION MODAL             */}
      {/* ========================================================= */}
      {showPrefsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(7, 9, 13, 0.85)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setShowPrefsModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Dashboard Personalization & Layout
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '4px 0 0' }}>
                  Tune your recommendation engine and configure which widgets appear on your command center.
                </p>
              </div>

              <button
                onClick={() => setShowPrefsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* 1. Target Budget Range */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Maximum Target Budget ($ USD)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="range"
                  min="20000"
                  max="350000"
                  step="5000"
                  value={prefs.budgetMax}
                  onChange={(e) => setPrefs({ ...prefs, budgetMax: Number(e.target.value) })}
                  style={{ flex: 1, accentColor: 'var(--accent-cyan)' }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)', minWidth: '90px' }}>
                  ${prefs.budgetMax.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 2. Preferred Body Architectures */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Preferred Body Styles
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(['suv', 'sedan', 'coupe', 'hatchback', 'hypercar'] as BodyType[]).map((bt) => {
                  const active = prefs.preferredBodyTypes.includes(bt);
                  return (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => toggleBodyType(bt)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '999px',
                        border: active ? '1px solid var(--accent-cyan)' : '1px solid var(--border-medium)',
                        backgroundColor: active ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {bt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Preferred Powertrains */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Preferred Powertrain Propulsion
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(['electric', 'hybrid', 'petrol', 'diesel'] as const).map((pt) => {
                  const active = prefs.preferredPowertrains.includes(pt);
                  return (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => togglePowertrain(pt)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '999px',
                        border: active ? '1px solid var(--accent-cyan)' : '1px solid var(--border-medium)',
                        backgroundColor: active ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {pt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Widget Visibility Toggles */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
                Active Dashboard Widgets
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
                {[
                  { key: 'garageOverview', label: 'My Garage Overview' },
                  { key: 'maintenanceTimeline', label: 'Maintenance & Service' },
                  { key: 'safetyAlerts', label: 'Safety & Recall Alerts' },
                  { key: 'recommendations', label: 'Car Recommendations' },
                  { key: 'savedTrips', label: 'Saved EV Trips' },
                  { key: 'costInsights', label: 'Ownership & Ledger Costs' },
                  { key: 'readingList', label: 'Saved Reading List' },
                  { key: 'recentActivity', label: 'Recent Activity Feed' },
                ].map(({ key, label }) => {
                  const isVisible = prefs.widgetVisibility[key as keyof typeof prefs.widgetVisibility];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleWidget(key as keyof typeof prefs.widgetVisibility)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        backgroundColor: isVisible ? 'rgba(0, 240, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                        border: isVisible ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid var(--border-subtle)',
                        color: isVisible ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        textAlign: 'left',
                      }}
                    >
                      <span>{label}</span>
                      {isVisible ? <Eye size={15} color="var(--accent-cyan)" /> : <EyeOff size={15} color="var(--text-muted)" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={handleResetPreferences}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem' }}
              >
                <RotateCcw size={13} />
                <span>Reset to Default</span>
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPrefsModal(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="btn btn-primary"
                  style={{ fontSize: '0.82rem' }}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
