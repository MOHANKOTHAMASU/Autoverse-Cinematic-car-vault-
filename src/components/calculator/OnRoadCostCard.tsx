import React from 'react';
import type { OnRoadCostBreakdown, CurrencyCode } from '../../types/calculator';
import { formatCurrency, REGIONAL_PROFILES } from '../../utils/tcoCalculator';
import { Receipt } from 'lucide-react';

interface OnRoadCostCardProps {
  onRoad: OnRoadCostBreakdown;
  currency: CurrencyCode;
  regionKey: string;
  powertrain: string;
  customRtoPercent?: number;
  onChangeCustomRtoPercent: (pct: number) => void;
  customInsurancePercent?: number;
  onChangeCustomInsurancePercent: (pct: number) => void;
  customAccessories: number;
  onChangeCustomAccessories: (amount: number) => void;
  customOtherCosts: number;
  onChangeCustomOtherCosts: (amount: number) => void;
}

export const OnRoadCostCard: React.FC<OnRoadCostCardProps> = ({
  onRoad,
  currency,
  regionKey,
  powertrain,
  customRtoPercent,
  onChangeCustomRtoPercent,
  customInsurancePercent,
  onChangeCustomInsurancePercent,
  customAccessories,
  onChangeCustomAccessories,
  customOtherCosts,
  onChangeCustomOtherCosts,
}) => {
  const profile = REGIONAL_PROFILES[regionKey] || REGIONAL_PROFILES.delhi;
  const isEv = powertrain.toLowerCase() === 'electric';

  const defaultRto = isEv ? profile.defaultRtoPercentEv : profile.defaultRtoPercentIce;
  const effectiveRto = customRtoPercent !== undefined ? customRtoPercent : defaultRto;
  const effectiveIns =
    customInsurancePercent !== undefined ? customInsurancePercent : profile.defaultInsurancePercent;

  return (
    <div
      style={{
        backgroundColor: 'rgba(12, 16, 24, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}
          >
            <Receipt size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              2. Regional On-Road Cost Estimator
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, marginTop: '2px' }}>
              Detailed breakdown of statutory levies, insurance, and municipal registration.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>
            Estimated On-Road Price
          </span>
          <span
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: '#10b981',
              letterSpacing: '-0.02em',
            }}
          >
            {formatCurrency(onRoad.totalOnRoadPrice, currency)}
          </span>
        </div>
      </div>

      {/* Breakdown Table Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Left Column: Fixed / Statutory Costs */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <h3
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#e2e8f0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}
          >
            Statutory & Mandatory Fees
          </h3>

          {/* Ex-showroom row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Ex-Showroom Price</span>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Manufacturer catalog MSRP</div>
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
              {formatCurrency(onRoad.exShowroomPrice, currency)}
            </span>
          </div>

          {/* RTO / Registration */}
          <div
            style={{
              padding: '0.75rem 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.35rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Road Tax / Registration (RTO)
                </span>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {profile.name} {isEv ? '(EV Concession)' : ''}
                </div>
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                {formatCurrency(onRoad.registrationRoadTax, currency)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={effectiveRto}
                onChange={(e) => onChangeCustomRtoPercent(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: '#10b981' }}
              />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#10b981',
                  minWidth: '45px',
                  textAlign: 'right',
                }}
              >
                {effectiveRto.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Mandatory Charges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.65rem 0',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Mandatory Formalities & TCS
              </span>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Fastag RFID, RTO Smart Card & 1% TCS (&gt;₹10L)
              </div>
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
              {formatCurrency(onRoad.mandatoryCharges, currency)}
            </span>
          </div>
        </div>

        {/* Right Column: Insurance & User Additions */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <h3
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#e2e8f0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}
          >
            Insurance & Optional Accessories
          </h3>

          {/* Insurance */}
          <div
            style={{
              paddingBottom: '0.75rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.35rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  First-Year Comprehensive Insurance
                </span>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  1-Yr Own Damage + 3-Yr Mandatory Third Party
                </div>
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                {formatCurrency(onRoad.insurance, currency)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="range"
                min="1"
                max="8"
                step="0.1"
                value={effectiveIns}
                onChange={(e) => onChangeCustomInsurancePercent(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-cyan)' }}
              />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-cyan)',
                  minWidth: '45px',
                  textAlign: 'right',
                }}
              >
                {effectiveIns.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Accessories */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.65rem 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>OEM Accessories Pack</span>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Floor mats, mudflaps, dashcam</div>
            </div>
            <div style={{ width: '120px' }}>
              <input
                type="number"
                min="0"
                step="1000"
                value={customAccessories}
                onChange={(e) => onChangeCustomAccessories(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  textAlign: 'right',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Other Costs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.65rem 0',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Extended Warranty / Other</span>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Custom user costs</div>
            </div>
            <div style={{ width: '120px' }}>
              <input
                type="number"
                min="0"
                step="1000"
                value={customOtherCosts}
                onChange={(e) => onChangeCustomOtherCosts(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  textAlign: 'right',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
