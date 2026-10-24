import React from 'react';
import type { Vehicle } from '../../types';
import type {
  CurrencyCode,
  OwnershipPeriod,
  PurchaseMode,
  TcoParameters,
  TcoResult,
} from '../../types/calculator';
import {
  formatCurrency,
  createDefaultTcoParameters,
  calculateTco,
  calculateLoanEmi,
} from '../../utils/tcoCalculator';
import { Scale, X, Award, Fuel, Zap } from 'lucide-react';

interface MultiVehicleTcoComparisonProps {
  vehicles: Vehicle[];
  baseVehicle: Vehicle;
  comparedSlugs: string[];
  onAddVehicle: (slug: string) => void;
  onRemoveVehicle: (slug: string) => void;
  currency: CurrencyCode;
  regionKey: string;
  ownershipYears: OwnershipPeriod;
  purchaseMode: PurchaseMode;
  annualDistanceKm: number;
}

export const MultiVehicleTcoComparison: React.FC<MultiVehicleTcoComparisonProps> = ({
  vehicles,
  baseVehicle,
  comparedSlugs,
  onAddVehicle,
  onRemoveVehicle,
  currency,
  regionKey,
  ownershipYears,
  purchaseMode,
  annualDistanceKm,
}) => {
  // Combine baseVehicle and compared vehicles (up to 4 total)
  const activeSlugs = [baseVehicle.slug, ...comparedSlugs.filter((s) => s !== baseVehicle.slug)].slice(
    0,
    4
  );

  const activeVehicles = activeSlugs
    .map((slug) => vehicles.find((v) => v.slug === slug))
    .filter((v): v is Vehicle => Boolean(v));

  // Compute uniform TCO across all vehicles using identical environmental parameters
  const calculatedItems = activeVehicles.map((veh) => {
    const defaultParams = createDefaultTcoParameters(veh, regionKey, currency);

    const uniformParams: TcoParameters = {
      ...defaultParams,
      currency,
      purchaseMode,
      ownershipPeriodYears: ownershipYears,
      energy: {
        ...defaultParams.energy,
        annualDistanceKm,
      },
    };

    const results: TcoResult = calculateTco(uniformParams);
    const loanResult = calculateLoanEmi(uniformParams.loan);

    return {
      vehicle: veh,
      parameters: uniformParams,
      results,
      loanResult,
    };
  });

  // Determine winners (Lowest Net TCO & Lowest Monthly EMI)
  let lowestTcoIndex = 0;
  let lowestEmiIndex = 0;
  calculatedItems.forEach((item, idx) => {
    if (item.results.netTco < calculatedItems[lowestTcoIndex].results.netTco) {
      lowestTcoIndex = idx;
    }
    if (item.loanResult.monthlyEmi < calculatedItems[lowestEmiIndex].loanResult.monthlyEmi) {
      lowestEmiIndex = idx;
    }
  });

  // Available vehicles to add (not currently in list)
  const remainingVehicles = vehicles.filter((v) => !activeSlugs.includes(v.slug));

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
            <Scale size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              7. Multi-Vehicle Ownership Cost Comparison
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, marginTop: '2px' }}>
              Side-by-side financial benchmarking with normalized distance ({annualDistanceKm.toLocaleString()} km/yr), {ownershipYears}-year horizon, and identical regional tariffs.
            </p>
          </div>
        </div>

        {/* Add vehicle dropdown selector if less than 4 */}
        {activeVehicles.length < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              aria-label="Add Vehicle to Compare"
              onChange={(e) => {
                if (e.target.value) {
                  onAddVehicle(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#f8fafc',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="" disabled>
                + Compare Another Vehicle ({4 - activeVehicles.length} slots free)
              </option>
              {remainingVehicles.map((v) => (
                <option key={v.slug} value={v.slug}>
                  {v.brand} {v.model} ({v.variant})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Comparison Grid Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: `${activeVehicles.length * 200 + 160}px`,
            fontSize: '0.82rem',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  color: '#64748b',
                  width: '180px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                Metric
              </th>
              {calculatedItems.map((item, idx) => (
                <th
                  key={item.vehicle.slug}
                  style={{
                    textAlign: 'left',
                    padding: '12px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    verticalAlign: 'top',
                    backgroundColor:
                      idx === lowestTcoIndex ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                    borderTopLeftRadius: idx === lowestTcoIndex ? '8px' : 0,
                    borderTopRightRadius: idx === lowestTcoIndex ? '8px' : 0,
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    {/* Remove button for non-base vehicles */}
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => onRemoveVehicle(item.vehicle.slug)}
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                        title="Remove vehicle"
                      >
                        <X size={14} />
                      </button>
                    )}

                    {/* Best TCO Badge */}
                    {idx === lowestTcoIndex && activeVehicles.length > 1 && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: '#10b981',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          marginBottom: '6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        <Award size={11} /> Lowest {ownershipYears}-Yr TCO
                      </span>
                    )}

                    <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>
                      {item.vehicle.brand} {item.vehicle.model}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {item.vehicle.variant}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.7rem',
                        color:
                          item.vehicle.powertrain === 'electric' ? 'var(--accent-cyan)' : '#f59e0b',
                        marginTop: '4px',
                      }}
                    >
                      {item.vehicle.powertrain === 'electric' ? <Zap size={12} /> : <Fuel size={12} />}
                      {item.vehicle.powertrain.toUpperCase()}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* On-Road Price */}
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <td style={{ padding: '8px 12px', color: '#94a3b8', fontWeight: 500 }}>
                Estimated On-Road Price
              </td>
              {calculatedItems.map((item) => (
                <td
                  key={item.vehicle.slug}
                  style={{
                    padding: '8px 12px',
                    fontWeight: 600,
                    color: '#f8fafc',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {formatCurrency(item.parameters.onRoadCost.totalOnRoadPrice, currency)}
                </td>
              ))}
            </tr>

            {/* Monthly EMI */}
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <td style={{ padding: '8px 12px', color: '#94a3b8', fontWeight: 500 }}>
                Monthly EMI (60 Mos)
              </td>
              {calculatedItems.map((item, idx) => (
                <td
                  key={item.vehicle.slug}
                  style={{
                    padding: '8px 12px',
                    fontWeight: 600,
                    color: idx === lowestEmiIndex ? 'var(--accent-cyan)' : '#e2e8f0',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {formatCurrency(item.loanResult.monthlyEmi, currency)}/mo
                  {idx === lowestEmiIndex && activeVehicles.length > 1 && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', marginLeft: '4px' }}>
                      (Lowest)
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Total Loan Interest */}
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <td style={{ padding: '8px 12px', color: '#94a3b8', fontWeight: 500 }}>
                Total Loan Interest
              </td>
              {calculatedItems.map((item) => (
                <td
                  key={item.vehicle.slug}
                  style={{
                    padding: '8px 12px',
                    color: '#f59e0b',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {formatCurrency(item.results.totalLoanInterest, currency)}
                </td>
              ))}
            </tr>

            {/* Energy / Fuel Costs */}
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <td style={{ padding: '8px 12px', color: '#94a3b8', fontWeight: 500 }}>
                {ownershipYears}-Yr Energy / Charging
              </td>
              {calculatedItems.map((item) => (
                <td
                  key={item.vehicle.slug}
                  style={{
                    padding: '8px 12px',
                    color:
                      item.vehicle.powertrain === 'electric' ? 'var(--accent-cyan)' : '#f59e0b',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {formatCurrency(item.results.totalEnergyCost, currency)}
                </td>
              ))}
            </tr>

            {/* Maintenance & Servicing */}
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <td style={{ padding: '8px 12px', color: '#94a3b8', fontWeight: 500 }}>
                {ownershipYears}-Yr Maintenance & Tyres
              </td>
              {calculatedItems.map((item) => (
                <td
                  key={item.vehicle.slug}
                  style={{
                    padding: '8px 12px',
                    color: '#c084fc',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {formatCurrency(item.results.totalMaintenanceAndRepairs, currency)}
                </td>
              ))}
            </tr>

            {/* Insurance Renewals */}
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <td style={{ padding: '8px 12px', color: '#94a3b8', fontWeight: 500 }}>
                {ownershipYears}-Yr Insurance Renewals
              </td>
              {calculatedItems.map((item) => (
                <td
                  key={item.vehicle.slug}
                  style={{
                    padding: '8px 12px',
                    color: '#94a3b8',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {formatCurrency(item.results.totalInsuranceRenewals, currency)}
                </td>
              ))}
            </tr>

            {/* Estimated Resale Recovery */}
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <td style={{ padding: '8px 12px', color: '#94a3b8', fontWeight: 500 }}>
                Resale Value Recovered
              </td>
              {calculatedItems.map((item) => (
                <td
                  key={item.vehicle.slug}
                  style={{
                    padding: '8px 12px',
                    color: '#10b981',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  +{formatCurrency(item.results.resaleValue, currency)}
                </td>
              ))}
            </tr>

            {/* NET TCO ROW */}
            <tr
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderTop: '2px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <td
                style={{
                  padding: '12px',
                  fontWeight: 700,
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                }}
              >
                Estimated Net TCO ({ownershipYears} Yrs)
              </td>
              {calculatedItems.map((item, idx) => (
                <td
                  key={item.vehicle.slug}
                  style={{
                    padding: '12px',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: idx === lowestTcoIndex ? '#10b981' : '#f8fafc',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor:
                      idx === lowestTcoIndex ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  }}
                >
                  {formatCurrency(item.results.netTco, currency)}
                </td>
              ))}
            </tr>

            {/* Cost Per Km */}
            <tr>
              <td style={{ padding: '8px 12px', color: '#64748b' }}>Running Cost Per Km</td>
              {calculatedItems.map((item, idx) => (
                <td
                  key={item.vehicle.slug}
                  style={{
                    padding: '8px 12px',
                    fontWeight: 600,
                    color: idx === lowestTcoIndex ? '#10b981' : '#94a3b8',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor:
                      idx === lowestTcoIndex ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                  }}
                >
                  {currency === 'INR' ? '₹' : '$'}{item.results.costPerKm.toFixed(2)}/km
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
