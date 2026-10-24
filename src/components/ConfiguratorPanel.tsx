import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  VehicleConfigProfile,
  ActiveConfigurationState,
} from '../data/configuratorData';
import { calculateConfigurationPricing } from '../data/configuratorData';
import {
  Check,
  ArrowRight,
  Bookmark,
  Share2,
  RotateCcw,
  Scale,
  ExternalLink,
  Calculator,
} from 'lucide-react';

interface ConfiguratorPanelProps {
  profile: VehicleConfigProfile;
  state: ActiveConfigurationState;
  onChangeState: (updated: ActiveConfigurationState) => void;
  onSaveConfig: () => void;
  onShareConfig: () => void;
  onResetConfig: () => void;
  onOpenDetails: () => void;
  onCompare: () => void;
}

export type ConfiguratorTab = 'variants' | 'paint' | 'wheels' | 'interior' | 'packages' | 'summary';

export const ConfiguratorPanel: React.FC<ConfiguratorPanelProps> = ({
  profile,
  state,
  onChangeState,
  onSaveConfig,
  onShareConfig,
  onResetConfig,
  onOpenDetails,
  onCompare,
}) => {
  const [activeTab, setActiveTab] = useState<ConfiguratorTab>('paint');

  const pricing = calculateConfigurationPricing(profile, state);

  const formatPrice = (price?: number, currency = 'USD') => {
    if (!price && price !== 0) return 'Price on Request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSelectVariant = (variantId: string) => {
    onChangeState({ ...state, variantId });
  };

  const handleSelectPaint = (paintId: string) => {
    onChangeState({ ...state, paintId });
  };

  const handleSelectWheel = (wheelId: string) => {
    onChangeState({ ...state, wheelId });
  };

  const handleSelectInterior = (interiorId: string) => {
    onChangeState({ ...state, interiorId });
  };

  const handleTogglePackage = (pkgId: string) => {
    const existing = state.selectedPackageIds;
    const updated = existing.includes(pkgId)
      ? existing.filter((id) => id !== pkgId)
      : [...existing, pkgId];
    onChangeState({ ...state, selectedPackageIds: updated });
  };

  const tabs: { id: ConfiguratorTab; label: string }[] = [
    { id: 'variants', label: '1. Variant' },
    { id: 'paint', label: '2. Exterior' },
    { id: 'wheels', label: '3. Wheels' },
    { id: 'interior', label: '4. Interior' },
    { id: 'packages', label: '5. Packages' },
    { id: 'summary', label: '6. Summary' },
  ];

  return (
    <div
      className="card-glass"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '14px',
        backgroundColor: 'rgba(10, 14, 22, 0.92)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Top Configurator Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          backgroundColor: 'rgba(7, 9, 13, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          scrollbarWidth: 'none',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.85rem 1rem',
              border: 'none',
              background: 'none',
              color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab Content Body (Scrollable) */}
      <div
        style={{
          flex: 1,
          padding: '1.5rem',
          overflowY: 'auto',
          minHeight: '340px',
        }}
      >
        {/* Tab 1: Powertrain & Factory Variants */}
        {activeTab === 'variants' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                Select Model Variant & Powertrain
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Factory homologated specifications for {profile.vehicleName}.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {profile.variants.map((v) => {
                const isSelected = state.variantId === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => handleSelectVariant(v.id)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>{v.name}</span>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {formatPrice(v.basePrice, profile.currency)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                      <span><strong>{v.horsepower}</strong> HP</span>
                      <span>•</span>
                      <span><strong>{v.accel0to60}s</strong> 0–60 MPH</span>
                      <span>•</span>
                      <span><strong>{v.topSpeedMph}</strong> MPH Top Track Speed</span>
                      {v.electricRangeMiles && (
                        <>
                          <span>•</span>
                          <span><strong>{v.electricRangeMiles}</strong> mi Range</span>
                        </>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                        Key Standard Hardware:
                      </span>
                      <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {v.standardEquipment.slice(0, 3).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Exterior Paint Colors */}
        {activeTab === 'paint' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Exterior Paintwork
                </h3>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {pricing.selectedPaint.price === 0 ? 'Included ($0)' : `+${formatPrice(pricing.selectedPaint.price, profile.currency)}`}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                Selected: <strong>{pricing.selectedPaint.name}</strong> ({pricing.selectedPaint.finish})
              </p>
            </div>

            {/* Color Swatch Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                gap: '0.85rem',
                marginBottom: '1.5rem',
              }}
            >
              {profile.paintOptions.map((paint) => {
                const isSelected = state.paintId === paint.id;
                return (
                  <button
                    key={paint.id}
                    onClick={() => handleSelectPaint(paint.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.35rem',
                    }}
                    title={`${paint.name} (${paint.finish}) — ${paint.price === 0 ? 'Included' : formatPrice(paint.price, profile.currency)}`}
                  >
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        backgroundColor: paint.hex,
                        border: isSelected ? '3px solid var(--accent-cyan)' : '2px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: isSelected
                          ? '0 0 16px rgba(6, 182, 212, 0.6), inset 0 2px 4px rgba(255,255,255,0.4)'
                          : 'inset 0 2px 4px rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s ease',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1.0)',
                      }}
                    >
                      {isSelected && (
                        <Check
                          size={18}
                          color={paint.hex === '#ffffff' || paint.hex === '#f0f3f6' ? '#07090d' : '#ffffff'}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        color: isSelected ? '#ffffff' : 'var(--text-muted)',
                        marginTop: '0.4rem',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        fontWeight: isSelected ? 700 : 500,
                      }}
                    >
                      {paint.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Paintwork Details Box */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Finish Quality:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{pricing.selectedPaint.finish} Coat</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Verification Status:</span>
                <span style={{ color: pricing.selectedPaint.isFactoryVerified ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                  {pricing.selectedPaint.isFactoryVerified ? 'Verified Factory Paint' : 'Studio Custom Palette'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Wheels */}
        {activeTab === 'wheels' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Wheels & Aeroblades
                </h3>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {pricing.selectedWheel.price === 0 ? 'Included ($0)' : `+${formatPrice(pricing.selectedWheel.price, profile.currency)}`}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                Selected: <strong>{pricing.selectedWheel.name}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {profile.wheelOptions.map((wheel) => {
                const isSelected = state.wheelId === wheel.id;
                return (
                  <div
                    key={wheel.id}
                    onClick={() => handleSelectWheel(wheel.id)}
                    style={{
                      padding: '0.9rem',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff', display: 'block' }}>
                        {wheel.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {wheel.sizeInches}-inch diameter • {wheel.finish}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? 'var(--accent-cyan)' : '#ffffff' }}>
                        {wheel.price === 0 ? 'Standard' : `+${formatPrice(wheel.price, profile.currency)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Interior */}
        {activeTab === 'interior' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Interior Architecture & Upholstery
                </h3>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {pricing.selectedInterior.price === 0 ? 'Included ($0)' : `+${formatPrice(pricing.selectedInterior.price, profile.currency)}`}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                Selected: <strong>{pricing.selectedInterior.name}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {profile.interiorOptions.map((interior) => {
                const isSelected = state.interiorId === interior.id;
                return (
                  <div
                    key={interior.id}
                    onClick={() => handleSelectInterior(interior.id)}
                    style={{
                      padding: '0.9rem',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: interior.hex,
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        flexShrink: 0,
                      }}
                    />

                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff', display: 'block' }}>
                        {interior.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {interior.material}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? 'var(--accent-cyan)' : '#ffffff' }}>
                      {interior.price === 0 ? 'Standard' : `+${formatPrice(interior.price, profile.currency)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: Optional Equipment Packages */}
        {activeTab === 'packages' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                Equipment Packages & Enhancements
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Select optional performance, acoustic, and driver assistance packages.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {profile.packages.map((pkg) => {
                const isSelected = state.selectedPackageIds.includes(pkg.id);
                return (
                  <div
                    key={pkg.id}
                    onClick={() => handleTogglePackage(pkg.id)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.3)'}`,
                            backgroundColor: isSelected ? 'var(--accent-cyan)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isSelected && <Check size={12} color="#07090d" />}
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>{pkg.name}</span>
                      </div>

                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: isSelected ? 'var(--accent-cyan)' : '#ffffff' }}>
                        +{formatPrice(pkg.price, profile.currency)}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 1.6rem', lineHeight: 1.4 }}>
                      {pkg.description}
                    </p>

                    <ul style={{ margin: 0, paddingLeft: '2.6rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {pkg.includedFeatures.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 6: Summary & Financial Breakdown */}
        {activeTab === 'summary' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                Configuration Summary & Financial Breakdown
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Itemized specification sheet for your custom build.
              </p>
            </div>

            {/* Itemized Table */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Base Variant ({pricing.selectedVariant.name})</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>{formatPrice(pricing.basePrice, profile.currency)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Paint ({pricing.selectedPaint.name})</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
                  {pricing.paintPrice === 0 ? 'Included' : `+${formatPrice(pricing.paintPrice, profile.currency)}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wheels ({pricing.selectedWheel.name})</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
                  {pricing.wheelPrice === 0 ? 'Included' : `+${formatPrice(pricing.wheelPrice, profile.currency)}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Interior ({pricing.selectedInterior.name})</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
                  {pricing.interiorPrice === 0 ? 'Included' : `+${formatPrice(pricing.interiorPrice, profile.currency)}`}
                </span>
              </div>

              {pricing.selectedPackages.map((pkg) => (
                <div key={pkg.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{pkg.name}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>+{formatPrice(pkg.price, profile.currency)}</span>
                </div>
              ))}

              {/* Total Line */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Total Indicative MSRP</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                  {formatPrice(pricing.totalPrice, profile.currency)}
                </span>
              </div>
            </div>

            {/* Estimated Financing */}
            <div
              style={{
                backgroundColor: 'rgba(6, 182, 212, 0.05)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                borderRadius: '8px',
                padding: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Estimated Monthly Finance:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  ~{formatPrice(Math.round(pricing.totalPrice / 60 * 1.05), profile.currency)} / mo
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                Based on 60-month term @ 5.9% APR with 10% initial deposit.
              </span>
            </div>

            {/* Action Buttons cluster */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', marginBottom: '1rem' }}>
              <button
                onClick={onSaveConfig}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem',
                  fontSize: '0.82rem',
                }}
              >
                <Bookmark size={15} />
                Save to My Garage
              </button>

              <button
                onClick={onShareConfig}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem',
                  fontSize: '0.82rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Share2 size={15} />
                Share Build Link
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                onClick={onOpenDetails}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem',
                  fontSize: '0.78rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                <ExternalLink size={13} />
                Full Specifications
              </button>

              <button
                onClick={onCompare}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem',
                  fontSize: '0.78rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                <Scale size={13} />
                Compare Vehicle
              </button>
            </div>

            <Link
              to={`/ownership-calculator?vehicle=${profile.vehicleSlug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.65rem',
                fontSize: '0.82rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                borderRadius: '6px',
                fontWeight: 600,
                textDecoration: 'none',
                marginTop: '0.5rem',
              }}
            >
              <Calculator size={15} />
              Calculate Finance & 5-Year Ownership Costs (TCO)
            </Link>
          </div>
        )}
      </div>

      {/* Sticky Bottom Summary Bar */}
      <div
        style={{
          padding: '1rem 1.5rem',
          backgroundColor: 'rgba(7, 9, 13, 0.98)',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.08em' }}>
            Indicative Price ({profile.currency})
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
            {formatPrice(pricing.totalPrice, profile.currency)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={onResetConfig}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.6rem',
            }}
            title="Reset to factory standard"
          >
            <RotateCcw size={13} />
            Reset
          </button>

          {activeTab !== 'summary' ? (
            <button
              onClick={() => {
                const currentIndex = tabs.findIndex((t) => t.id === activeTab);
                if (currentIndex < tabs.length - 1) {
                  setActiveTab(tabs[currentIndex + 1].id);
                }
              }}
              className="btn btn-primary"
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              Next Step
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={onSaveConfig}
              className="btn btn-primary"
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'var(--accent-cyan)',
                color: '#07090d',
                fontWeight: 700,
              }}
            >
              <Bookmark size={14} />
              Save Build
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
