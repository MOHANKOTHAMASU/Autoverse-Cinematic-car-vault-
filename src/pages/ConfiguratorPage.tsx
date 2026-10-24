import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { VEHICLES } from '../data/vehicles';
import type { Vehicle } from '../types';
import {
  type VehicleConfigProfile,
  type ActiveConfigurationState,
  getOrCreateConfigProfile,
  calculateConfigurationPricing,
  validateCompatibilityRules,
  encodeConfigToUrlParams,
  decodeUrlParamsToConfig,
} from '../data/configuratorData';
import { ConfiguratorVisualizer } from '../components/ConfiguratorVisualizer';
import { ConfiguratorPanel } from '../components/ConfiguratorPanel';
import {
  getSavedConfigurations,
  saveVehicleConfiguration,
  deleteSavedConfiguration,
  renameSavedConfiguration,
} from '../utils/garage';
import type { SavedConfiguration } from '../types/auth';
import {
  Car,
  ChevronDown,
  Bookmark,
  Share2,
  Check,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Edit2,
  X,
  Search,
} from 'lucide-react';

export const ConfiguratorPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Find vehicle by slug, or default to flagship Porsche Taycan Turbo S
  const activeVehicle: Vehicle = useMemo(() => {
    if (slug) {
      const found = VEHICLES.find((v) => v.slug === slug || v.id === slug);
      if (found) return found;
    }
    return VEHICLES[0]; // Porsche Taycan Turbo S default
  }, [slug]);

  // Retrieve or generate vehicle configuration profile
  const profile: VehicleConfigProfile = useMemo(() => {
    return getOrCreateConfigProfile(activeVehicle);
  }, [activeVehicle]);

  // Active configuration state (variant, paint, wheels, interior, packages)
  const [configState, setConfigState] = useState<ActiveConfigurationState>(() => {
    return decodeUrlParamsToConfig(profile, searchParams);
  });

  // Modals & Drawers
  const [isVehicleSelectorOpen, setIsVehicleSelectorOpen] = useState<boolean>(false);
  const [isSavedBuildsOpen, setIsSavedBuildsOpen] = useState<boolean>(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved configurations list from garage
  const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>([]);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // Re-sync config state when profile/slug changes
  useEffect(() => {
    const initial = decodeUrlParamsToConfig(profile, searchParams);
    setConfigState(initial);
  }, [profile.vehicleSlug]);

  // Refresh saved configs from garage
  const refreshSavedConfigs = () => {
    setSavedConfigs(getSavedConfigurations());
  };

  useEffect(() => {
    refreshSavedConfigs();
    window.addEventListener('autoverse_configurations_updated', refreshSavedConfigs);
    return () => window.removeEventListener('autoverse_configurations_updated', refreshSavedConfigs);
  }, []);

  // Sync state into URL search params
  useEffect(() => {
    const params = encodeConfigToUrlParams(configState);
    setSearchParams(params, { replace: true });
  }, [configState, setSearchParams]);

  // Real-time calculation and validation
  const pricing = useMemo(() => {
    return calculateConfigurationPricing(profile, configState);
  }, [profile, configState]);

  const compatibility = useMemo(() => {
    return validateCompatibilityRules(profile, configState);
  }, [profile, configState]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers
  const handleSelectVehicle = (selectedSlug: string) => {
    setIsVehicleSelectorOpen(false);
    navigate(`/configurator/${selectedSlug}`);
  };

  const handleResetConfig = () => {
    const defaultState: ActiveConfigurationState = {
      vehicleSlug: profile.vehicleSlug,
      variantId: profile.variants[0].id,
      paintId: profile.paintOptions[0].id,
      wheelId: profile.wheelOptions[0].id,
      interiorId: profile.interiorOptions[0].id,
      selectedPackageIds: [],
    };
    setConfigState(defaultState);
    showToast('Reset to factory standard configuration.');
  };

  const handleSaveConfig = () => {
    const newConfig: SavedConfiguration = {
      id: `config_${Date.now()}`,
      vehicleSlug: activeVehicle.slug || activeVehicle.id,
      vehicleName: `${activeVehicle.brand} ${activeVehicle.model}`,
      variantId: pricing.selectedVariant.id,
      variantName: pricing.selectedVariant.name,
      paintId: pricing.selectedPaint.id,
      paintName: pricing.selectedPaint.name,
      paintHex: pricing.selectedPaint.hex,
      wheelId: pricing.selectedWheel.id,
      wheelName: pricing.selectedWheel.name,
      interiorId: pricing.selectedInterior.id,
      interiorName: pricing.selectedInterior.name,
      packageIds: configState.selectedPackageIds,
      totalPrice: pricing.totalPrice,
      currency: profile.currency,
      savedAt: new Date().toISOString(),
      customName: `${activeVehicle.model} ${pricing.selectedPaint.name} Build`,
    };

    saveVehicleConfiguration(newConfig);
    showToast(`Saved custom build to My Garage!`);
  };

  const handleShareConfig = () => {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url);
      showToast('Configuration share link copied to clipboard!');
    } else {
      showToast('Share link ready in address bar.');
    }
  };

  const handleLoadSavedBuild = (build: SavedConfiguration) => {
    if (build.vehicleSlug !== activeVehicle.slug) {
      navigate(
        `/configurator/${build.vehicleSlug}?variant=${build.variantId}&paint=${build.paintId}&wheels=${build.wheelId}&interior=${build.interiorId}&packages=${build.packageIds.join(',')}`
      );
    } else {
      setConfigState({
        vehicleSlug: build.vehicleSlug,
        variantId: build.variantId,
        paintId: build.paintId,
        wheelId: build.wheelId,
        interiorId: build.interiorId,
        selectedPackageIds: build.packageIds,
      });
    }
    setIsSavedBuildsOpen(false);
    showToast(`Loaded ${build.customName || build.vehicleName}!`);
  };

  const handleDeleteSavedBuild = (id: string) => {
    deleteSavedConfiguration(id);
    showToast('Deleted build from My Garage.');
  };

  const handleStartRename = (build: SavedConfiguration) => {
    setEditingConfigId(build.id);
    setEditingName(build.customName || build.vehicleName);
  };

  const handleConfirmRename = (id: string) => {
    if (editingName.trim()) {
      renameSavedConfiguration(id, editingName.trim());
      setEditingConfigId(null);
      showToast('Build renamed.');
    }
  };

  // Filter published vehicles for selector
  const availableVehicles = useMemo(() => {
    return VEHICLES.filter((v) => {
      if (!vehicleSearchQuery.trim()) return true;
      const q = vehicleSearchQuery.toLowerCase();
      const name = `${v.brand} ${v.model} ${v.variant}`.toLowerCase();
      return name.includes(q);
    });
  }, [vehicleSearchQuery]);

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#07090d',
        paddingTop: 'calc(var(--header-height) + 1.25rem)',
        paddingBottom: '4rem',
      }}
    >
      <div className="container" style={{ maxWidth: '1480px', margin: '0 auto', padding: '0 1.25rem' }}>
        {/* Toast Notification Pill */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              zIndex: 9999,
              backgroundColor: 'rgba(7, 9, 13, 0.95)',
              border: '1px solid var(--accent-cyan)',
              color: '#ffffff',
              padding: '0.85rem 1.4rem',
              borderRadius: '8px',
              boxShadow: '0 12px 35px rgba(0, 240, 255, 0.25)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            <Check size={16} color="var(--accent-cyan)" />
            {toastMessage}
          </div>
        )}

        {/* Top Header Bar: Vehicle Title, Switcher & Quick Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1.75rem',
          }}
        >
          {/* Left: Vehicle Title and Switcher Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--accent-cyan)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  {activeVehicle.brand || activeVehicle.manufacturerName}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {activeVehicle.modelYear || activeVehicle.year} STUDIO CONFIGURATOR
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                  {activeVehicle.model} {activeVehicle.variant}
                </h1>

                <button
                  onClick={() => setIsVehicleSelectorOpen(true)}
                  aria-label="Switch vehicle model"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  title="Switch to another vehicle in the AutoVerse fleet"
                >
                  <Car size={13} />
                  Switch Model
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={() => setIsSavedBuildsOpen(true)}
              aria-label="View saved custom configurations"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Bookmark size={14} color="var(--accent-cyan)" />
              Saved Builds ({savedConfigs.length})
            </button>

            <button
              onClick={handleShareConfig}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Share2 size={14} />
              Share
            </button>

            <Link
              to={`/cars/${activeVehicle.slug || activeVehicle.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={14} />
              Specs
            </Link>
          </div>
        </div>

        {/* Compatibility Alert Banner if invalid rules are triggered */}
        {!compatibility.isValid && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <AlertTriangle size={18} color="#ef4444" />
              <span style={{ fontSize: '0.85rem', color: '#ffffff' }}>
                Configuration conflict: {compatibility.conflictReasons.join(' ')}
              </span>
            </div>
            <button
              onClick={() => setConfigState(compatibility.autoResolvedState)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Auto-Resolve
            </button>
          </div>
        )}

        {/* Main Configurator Dual Stage Layout: 3D Visualizer (Left) & Customization Panel (Right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.35fr) minmax(360px, 1fr)',
            gap: '1.75rem',
            alignItems: 'stretch',
          }}
        >
          {/* Left Column: Visual Studio Stage */}
          <div style={{ minHeight: '520px', display: 'flex' }}>
            <ConfiguratorVisualizer
              vehicle={activeVehicle}
              profile={profile}
              activeState={configState}
              selectedPaint={pricing.selectedPaint}
              selectedWheel={pricing.selectedWheel}
              selectedInterior={pricing.selectedInterior}
            />
          </div>

          {/* Right Column: Customization Panel */}
          <div style={{ minHeight: '520px', display: 'flex' }}>
            <ConfiguratorPanel
              profile={profile}
              state={configState}
              onChangeState={setConfigState}
              onSaveConfig={handleSaveConfig}
              onShareConfig={handleShareConfig}
              onResetConfig={handleResetConfig}
              onOpenDetails={() => navigate(`/cars/${activeVehicle.slug || activeVehicle.id}`)}
              onCompare={() => navigate(`/compare?cars=${activeVehicle.slug || activeVehicle.id}`)}
            />
          </div>
        </div>

        {/* Vehicle Selector Modal */}
        {isVehicleSelectorOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
              zIndex: 9990,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
            onClick={() => setIsVehicleSelectorOpen(false)}
          >
            <div
              className="card-glass"
              style={{
                width: '100%',
                maxWidth: '680px',
                maxHeight: '80vh',
                backgroundColor: 'rgba(10, 14, 22, 0.98)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Select Vehicle to Configure
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Choose from 50 vehicles in the AutoVerse fleet
                  </span>
                </div>
                <button
                  onClick={() => setIsVehicleSelectorOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Bar in modal */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.85rem', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={vehicleSearchQuery}
                    onChange={(e) => setVehicleSearchQuery(e.target.value)}
                    placeholder="Search by marque or model name (e.g. Taycan, Plaid, M4)..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Vehicle List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                  {availableVehicles.map((v) => {
                    const isCurrent = v.slug === activeVehicle.slug || v.id === activeVehicle.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => handleSelectVehicle(v.slug || v.id)}
                        style={{
                          padding: '0.85rem',
                          borderRadius: '8px',
                          backgroundColor: isCurrent ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${isCurrent ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                        }}
                      >
                        <img
                          src={v.thumbnail || v.heroImage}
                          alt={v.model}
                          style={{ width: '56px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>
                            {v.brand}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {v.model} {v.variant}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saved Builds Modal / Drawer */}
        {isSavedBuildsOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
              zIndex: 9990,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
            onClick={() => setIsSavedBuildsOpen(false)}
          >
            <div
              className="card-glass"
              style={{
                width: '100%',
                maxWidth: '640px',
                maxHeight: '80vh',
                backgroundColor: 'rgba(10, 14, 22, 0.98)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    My Saved Custom Builds
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Persisted in My Garage ({savedConfigs.length} builds)
                  </span>
                </div>
                <button
                  onClick={() => setIsSavedBuildsOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
                {savedConfigs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {savedConfigs.map((b) => (
                      <div
                        key={b.id}
                        style={{
                          padding: '1rem',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: b.paintHex,
                              border: '1px solid rgba(255,255,255,0.2)',
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            {editingConfigId === b.id ? (
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <input
                                  type="text"
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '0.82rem',
                                    borderRadius: '4px',
                                    border: '1px solid var(--accent-cyan)',
                                    backgroundColor: '#0a0d14',
                                    color: '#ffffff',
                                  }}
                                />
                                <button
                                  onClick={() => handleConfirmRename(b.id)}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '0.75rem',
                                    borderRadius: '4px',
                                    border: 'none',
                                    backgroundColor: 'var(--accent-cyan)',
                                    color: '#07090d',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
                                  {b.customName || b.vehicleName}
                                </span>
                                <button
                                  onClick={() => handleStartRename(b)}
                                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                                  title="Rename build"
                                >
                                  <Edit2 size={12} />
                                </button>
                              </div>
                            )}

                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                              {b.variantName} • {b.paintName} • ${b.totalPrice.toLocaleString()} {b.currency}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleLoadSavedBuild(b)}
                            className="btn btn-primary"
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                          >
                            Load Build
                          </button>
                          <button
                            onClick={() => handleDeleteSavedBuild(b.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'rgba(239, 68, 68, 0.7)',
                              cursor: 'pointer',
                              padding: '0.35rem',
                            }}
                            title="Delete build"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <Bookmark size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <span style={{ fontSize: '0.92rem', color: '#ffffff', display: 'block', fontWeight: 600 }}>
                      No custom builds saved yet
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Customize your vehicle options and click "Save to My Garage" to build your private collection.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
