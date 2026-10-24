import React from 'react';
import type { TcoParameters, TcoResult, OwnershipPeriod, CurrencyCode } from '../../types/calculator';
import { formatCurrency } from '../../utils/tcoCalculator';
import { PieChart, Scale } from 'lucide-react';

interface TcoBreakdownCardProps {
  parameters: TcoParameters;
  results: TcoResult;
  currency: CurrencyCode;
  onChangePeriod: (period: OwnershipPeriod) => void;
  onChangeResaleMethod: (method: 'none' | 'depreciation_percent' | 'custom_amount') => void;
  onChangeCustomResaleValue: (amount: number) => void;
}

export const TcoBreakdownCard: React.FC<TcoBreakdownCardProps> = ({
  parameters,
  results,
  currency,
  onChangePeriod,
  onChangeResaleMethod,
  onChangeCustomResaleValue,
}) => {
  const isFinanced = results.purchaseMode === 'financed';
  const periods: OwnershipPeriod[] = [1, 3, 5, 8];

  // Visual breakdown calculation
  const totalGross = Math.max(1, results.grossTco);
  const purchaseShare = ((isFinanced ? results.initialOutlay : results.initialOutlay) / totalGross) * 100;
  const loanInterestShare = isFinanced ? (results.totalLoanInterest / totalGross) * 100 : 0;
  const energyShare = (results.totalEnergyCost / totalGross) * 100;
  const maintenanceShare = (results.totalMaintenanceAndRepairs / totalGross) * 100;
  const insuranceShare = (results.totalInsuranceRenewals / totalGross) * 100;
  const feesShare = (results.totalOtherFees / totalGross) * 100;

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
      {/* Header & Ownership Duration Selector */}
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
              backgroundColor: 'rgba(234, 179, 8, 0.12)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#eab308',
            }}
          >
            <PieChart size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              6. Total Cost of Ownership (TCO) & Net Capital Outlay
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, marginTop: '2px' }}>
              Comprehensive multi-year lifecycle financial synthesis.
            </p>
          </div>
        </div>

        {/* Ownership Period Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
            Horizon:
          </span>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChangePeriod(p)}
                style={{
                  background: parameters.ownershipPeriodYears === p ? '#eab308' : 'transparent',
                  color: parameters.ownershipPeriodYears === p ? '#000000' : '#cbd5e1',
                  fontWeight: parameters.ownershipPeriodYears === p ? 700 : 500,
                  fontSize: '0.75rem',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {p} {p === 1 ? 'Year' : 'Years'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Net TCO Metric Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Net TCO */}
        <div
          style={{
            backgroundColor: 'rgba(6, 182, 212, 0.06)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', fontWeight: 600 }}>
            Estimated Net TCO (After Resale)
          </span>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.02em',
              margin: '4px 0',
            }}
          >
            {formatCurrency(results.netTco, currency)}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Over {results.ownershipPeriodYears} {results.ownershipPeriodYears === 1 ? 'year' : 'years'} ({results.totalDistanceKm.toLocaleString()} km total)
          </span>
        </div>

        {/* Cost Per Year */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Average Cost Per Year
          </span>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#e2e8f0',
              margin: '4px 0',
            }}
          >
            {formatCurrency(results.costPerYear, currency)}
            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b' }}> / yr</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {formatCurrency(results.costPerYear / 12, currency)} / month all-in
          </span>
        </div>

        {/* Cost Per Kilometer */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            True Cost Per Kilometer
          </span>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#10b981',
              margin: '4px 0',
            }}
          >
            {currency === 'INR' ? '₹' : '$'}{results.costPerKm.toFixed(2)}
            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b' }}> / km</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Inclusive of depreciation & operational wear
          </span>
        </div>

        {/* Gross Cash Outlay */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Gross Out-of-Pocket Outlay
          </span>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#f8fafc',
              margin: '4px 0',
            }}
          >
            {formatCurrency(results.grossTco, currency)}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Before subtracting resale proceeds
          </span>
        </div>
      </div>

      {/* Visual Stacked Cost Distribution Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: '#94a3b8',
            marginBottom: '6px',
          }}
        >
          <span>Lifecycle Outlay Allocation</span>
          <span>100% Total Gross Outlay</span>
        </div>

        <div
          style={{
            height: '24px',
            width: '100%',
            borderRadius: '6px',
            overflow: 'hidden',
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <div
            style={{
              width: `${purchaseShare}%`,
              backgroundColor: '#3b82f6',
              height: '100%',
              transition: 'width 0.4s ease',
            }}
            title={`Initial Vehicle Outlay: ${purchaseShare.toFixed(1)}%`}
          />
          {isFinanced && (
            <div
              style={{
                width: `${loanInterestShare}%`,
                backgroundColor: '#f59e0b',
                height: '100%',
                transition: 'width 0.4s ease',
              }}
              title={`Loan Financing Interest: ${loanInterestShare.toFixed(1)}%`}
            />
          )}
          <div
            style={{
              width: `${energyShare}%`,
              backgroundColor: '#06b6d4',
              height: '100%',
              transition: 'width 0.4s ease',
            }}
            title={`Energy / Fuel: ${energyShare.toFixed(1)}%`}
          />
          <div
            style={{
              width: `${maintenanceShare}%`,
              backgroundColor: '#a855f7',
              height: '100%',
              transition: 'width 0.4s ease',
            }}
            title={`Maintenance: ${maintenanceShare.toFixed(1)}%`}
          />
          <div
            style={{
              width: `${insuranceShare}%`,
              backgroundColor: '#10b981',
              height: '100%',
              transition: 'width 0.4s ease',
            }}
            title={`Insurance Renewals: ${insuranceShare.toFixed(1)}%`}
          />
          <div
            style={{
              width: `${feesShare}%`,
              backgroundColor: '#64748b',
              height: '100%',
              transition: 'width 0.4s ease',
            }}
            title={`Recurring Taxes & Fees: ${feesShare.toFixed(1)}%`}
          />
        </div>

        {/* Color Legend */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            marginTop: '8px',
            fontSize: '0.7rem',
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#3b82f6' }} />
            {isFinanced ? 'Down Payment & Fees' : 'Vehicle Purchase'} ({purchaseShare.toFixed(0)}%)
          </div>
          {isFinanced && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#f59e0b' }} />
              Financing Interest ({loanInterestShare.toFixed(0)}%)
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#06b6d4' }} />
            Energy / Charging ({energyShare.toFixed(0)}%)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#a855f7' }} />
            Upkeep & Tyres ({maintenanceShare.toFixed(0)}%)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#10b981' }} />
            Insurance Renewals ({insuranceShare.toFixed(0)}%)
          </div>
        </div>
      </div>

      {/* Resale Modeling Section */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
              Estimated Resale Recovery Value
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Optionally model recovered capital upon vehicle disposition after {results.ownershipPeriodYears} {results.ownershipPeriodYears === 1 ? 'year' : 'years'}.
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              type="button"
              onClick={() => onChangeResaleMethod('depreciation_percent')}
              style={{
                background: parameters.resaleValueMethod === 'depreciation_percent' ? '#10b981' : 'transparent',
                color: parameters.resaleValueMethod === 'depreciation_percent' ? '#000000' : '#cbd5e1',
                fontWeight: 600,
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Industry Curve
            </button>
            <button
              type="button"
              onClick={() => onChangeResaleMethod('custom_amount')}
              style={{
                background: parameters.resaleValueMethod === 'custom_amount' ? '#10b981' : 'transparent',
                color: parameters.resaleValueMethod === 'custom_amount' ? '#000000' : '#cbd5e1',
                fontWeight: 600,
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Custom Amount
            </button>
            <button
              type="button"
              onClick={() => onChangeResaleMethod('none')}
              style={{
                background: parameters.resaleValueMethod === 'none' ? '#ef4444' : 'transparent',
                color: parameters.resaleValueMethod === 'none' ? '#ffffff' : '#cbd5e1',
                fontWeight: 600,
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Exclude Resale (0)
            </button>
          </div>
        </div>

        {parameters.resaleValueMethod !== 'none' && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0',
              borderTop: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Projected Recouped Value:
            </span>
            {parameters.resaleValueMethod === 'custom_amount' ? (
              <input
                type="number"
                min="0"
                step="1000"
                value={parameters.estimatedResaleValue || 0}
                onChange={(e) => onChangeCustomResaleValue(parseFloat(e.target.value) || 0)}
                style={{
                  width: '130px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  color: '#10b981',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textAlign: 'right',
                  outline: 'none',
                }}
              />
            ) : (
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>
                +{formatCurrency(results.resaleValue, currency)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Documented Accounting Formula Methodology Box */}
      <div
        style={{
          padding: '1rem',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.75rem',
          color: '#94a3b8',
          lineHeight: 1.5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}>
          <Scale size={14} color="var(--accent-cyan)" />
          <span>Accounting Methodology & Non-Double-Counting Guarantee</span>
        </div>
        <p style={{ margin: 0 }}>
          {results.accountingMethod}
        </p>
        <p style={{ margin: 0, marginTop: '4px', color: '#64748b' }}>
          *Note: Financed principal is never added on top of vehicle price; interest payments and down payment represent true out-of-pocket cash outflows.
        </p>
      </div>
    </div>
  );
};
