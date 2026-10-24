import React from 'react';
import type { EnergyParameters, CurrencyCode, OwnershipPeriod } from '../../types/calculator';
import { formatCurrency, calculateEnergyExpenses, REGIONAL_PROFILES } from '../../utils/tcoCalculator';
import { Fuel, Zap } from 'lucide-react';

interface EnergyExpenseCardProps {
  energyParams: EnergyParameters;
  onChangeEnergyParams: (params: EnergyParameters) => void;
  currency: CurrencyCode;
  regionKey: string;
  ownershipYears: OwnershipPeriod;
}

export const EnergyExpenseCard: React.FC<EnergyExpenseCardProps> = ({
  energyParams,
  onChangeEnergyParams,
  currency,
  regionKey,
  ownershipYears,
}) => {
  const profile = REGIONAL_PROFILES[regionKey] || REGIONAL_PROFILES.delhi;
  const pType = (energyParams.powertrain || 'petrol').toLowerCase();
  const isEv = pType === 'electric';
  const isHybrid = pType === 'hybrid' || pType === 'plug-in hybrid';

  const energyResult = calculateEnergyExpenses(energyParams, ownershipYears);

  const handleAnnualDistanceChange = (distance: number) => {
    onChangeEnergyParams({
      ...energyParams,
      annualDistanceKm: Math.max(1000, distance),
    });
  };

  const handleHomeRatioChange = (homePct: number) => {
    const validHome = Math.min(100, Math.max(0, homePct));
    onChangeEnergyParams({
      ...energyParams,
      homeChargingPercent: validHome,
      publicChargingPercent: 100 - validHome,
    });
  };

  const handleHybridSplitChange = (evPct: number) => {
    const validEv = Math.min(100, Math.max(0, evPct));
    onChangeEnergyParams({
      ...energyParams,
      hybridEvSharePercent: validEv,
    });
  };

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
              backgroundColor: isEv ? 'rgba(6, 182, 212, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              border: isEv
                ? '1px solid rgba(6, 182, 212, 0.3)'
                : '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isEv ? 'var(--accent-cyan)' : '#f59e0b',
            }}
          >
            {isEv ? <Zap size={18} /> : <Fuel size={18} />}
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              4. Fuel & EV Charging Energy Calculator
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, marginTop: '2px' }}>
              Modeled consumption based on powertrain architecture ({energyParams.powertrain.toUpperCase()}).
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>
            {ownershipYears}-Year Total Energy Cost
          </span>
          <div
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: isEv ? 'var(--accent-cyan)' : '#f59e0b',
              letterSpacing: '-0.02em',
            }}
          >
            {formatCurrency(energyResult.periodEnergyCost, currency)}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Driving Distance & Mileage */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <h3
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#e2e8f0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
            }}
          >
            Usage & Efficiency
          </h3>

          {/* Annual Distance */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                marginBottom: '0.35rem',
              }}
            >
              <span style={{ color: '#cbd5e1' }}>Expected Annual Distance</span>
              <span style={{ color: '#f8fafc', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {energyParams.annualDistanceKm.toLocaleString()} km / yr
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="range"
                min="5000"
                max="50000"
                step="1000"
                value={energyParams.annualDistanceKm}
                onChange={(e) => handleAnnualDistanceChange(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-cyan)' }}
              />
              <input
                type="number"
                min="1000"
                max="100000"
                step="1000"
                value={energyParams.annualDistanceKm}
                onChange={(e) => handleAnnualDistanceChange(parseInt(e.target.value) || 10000)}
                style={{
                  width: '90px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
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

          {/* Powertrain Specific Efficiency Inputs */}
          {isEv && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  marginBottom: '0.35rem',
                }}
              >
                <span style={{ color: '#cbd5e1' }}>EV Consumption (kWh/100 km)</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  {energyParams.evEfficiencyKwh100Km?.toFixed(1) || '16.5'} kWh
                </span>
              </div>
              <input
                type="number"
                min="8"
                max="40"
                step="0.5"
                value={energyParams.evEfficiencyKwh100Km || 16.5}
                onChange={(e) =>
                  onChangeEnergyParams({
                    ...energyParams,
                    evEfficiencyKwh100Km: parseFloat(e.target.value) || 16.5,
                  })
                }
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {!isEv && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  marginBottom: '0.35rem',
                }}
              >
                <span style={{ color: '#cbd5e1' }}>Fuel Economy (km/L)</span>
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                  {energyParams.fuelEconomyKmL?.toFixed(1) || '15.0'} km/L
                </span>
              </div>
              <input
                type="number"
                min="3"
                max="40"
                step="0.5"
                value={energyParams.fuelEconomyKmL || 15.0}
                onChange={(e) =>
                  onChangeEnergyParams({
                    ...energyParams,
                    fuelEconomyKmL: parseFloat(e.target.value) || 15.0,
                  })
                }
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* Hybrid Split Slider */}
          {isHybrid && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  marginBottom: '0.35rem',
                }}
              >
                <span style={{ color: '#cbd5e1' }}>Driving Partition Split</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  {energyParams.hybridEvSharePercent ?? 40}% EV /{' '}
                  {100 - (energyParams.hybridEvSharePercent ?? 40)}% Fuel
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={energyParams.hybridEvSharePercent ?? 40}
                onChange={(e) => handleHybridSplitChange(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
            </div>
          )}
        </div>

        {/* Tariffs & Supply Split Right */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <h3
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#e2e8f0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
            }}
          >
            Tariff & Energy Price Settings
          </h3>

          {/* EV Charging Split & Tariffs */}
          {(isEv || isHybrid) && (
            <>
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    marginBottom: '0.35rem',
                  }}
                >
                  <span style={{ color: '#cbd5e1' }}>Home vs Public Charging Ratio</span>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    {energyParams.homeChargingPercent ?? 80}% Home /{' '}
                    {energyParams.publicChargingPercent ?? 20}% Public
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={energyParams.homeChargingPercent ?? 80}
                  onChange={(e) => handleHomeRatioChange(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      color: '#94a3b8',
                      marginBottom: '2px',
                    }}
                  >
                    Home Tariff ({profile.currencySymbol}/kWh)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={energyParams.homeElectricityTariff || 6.5}
                    onChange={(e) =>
                      onChangeEnergyParams({
                        ...energyParams,
                        homeElectricityTariff: parseFloat(e.target.value) || 6.5,
                      })
                    }
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      color: '#94a3b8',
                      marginBottom: '2px',
                    }}
                  >
                    Public Fast DC ({profile.currencySymbol}/kWh)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={energyParams.publicChargingTariff || 18.0}
                    onChange={(e) =>
                      onChangeEnergyParams({
                        ...energyParams,
                        publicChargingTariff: parseFloat(e.target.value) || 18.0,
                      })
                    }
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Fuel Price */}
          {!isEv && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: '#cbd5e1',
                  marginBottom: '4px',
                }}
              >
                Fuel Price ({profile.currencySymbol}/Liter in {profile.name})
              </label>
              <input
                type="number"
                min="10"
                step="0.5"
                value={
                  energyParams.fuelPricePerLiter ||
                  (pType === 'diesel'
                    ? profile.defaultFuelPriceDiesel
                    : profile.defaultFuelPricePetrol)
                }
                onChange={(e) =>
                  onChangeEnergyParams({
                    ...energyParams,
                    fuelPricePerLiter: parseFloat(e.target.value) || 95.0,
                  })
                }
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                Current official regional pump rate: {profile.source} ({profile.lastVerifiedDate})
              </span>
            </div>
          )}

          {/* Annual Energy Summary Result */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              marginTop: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                marginBottom: '2px',
              }}
            >
              <span style={{ color: '#94a3b8' }}>Annual Energy Expense:</span>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>
                {formatCurrency(energyResult.totalAnnualEnergyCost, currency)} / yr
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{energyResult.sourceNotes}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
