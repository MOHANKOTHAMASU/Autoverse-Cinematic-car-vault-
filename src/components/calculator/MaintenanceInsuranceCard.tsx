import React from 'react';
import type { MaintenanceAndInsuranceParameters, CurrencyCode, OwnershipPeriod } from '../../types/calculator';
import type { VehicleExpense } from '../../types/ownership';
import { formatCurrency } from '../../utils/tcoCalculator';
import { getOwnedVehicles, getExpenses } from '../../utils/ownershipStore';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Sparkles, History } from 'lucide-react';

interface MaintenanceInsuranceCardProps {
  params: MaintenanceAndInsuranceParameters;
  onChangeParams: (params: MaintenanceAndInsuranceParameters) => void;
  currency: CurrencyCode;
  isEv: boolean;
  ownershipYears: OwnershipPeriod;
}

export const MaintenanceInsuranceCard: React.FC<MaintenanceInsuranceCardProps> = ({
  params,
  onChangeParams,
  currency,
  isEv,
  ownershipYears,
}) => {
  const { currentUser } = useAuth();

  const totalPeriodService = (params.annualRoutineService + params.annualRepairsAndTyres) * ownershipYears;
  const totalPeriodInsurance = params.annualInsuranceRenewal * ownershipYears;
  const totalOneTime = isEv ? params.oneTimeChargerEquipment : 0;
  const totalOther = (params.annualRoadTaxRenewals + params.otherRecurringAnnual) * ownershipYears;
  const grandTotal = totalPeriodService + totalPeriodInsurance + totalOneTime + totalOther;

  // Import from Stage 11 My Garage
  const handleImportGarageData = () => {
    if (!currentUser) return;
    const userVehicles = getOwnedVehicles(currentUser.id);
    if (!userVehicles.length) {
      alert('No logged vehicles found in My Garage. Add a vehicle in My Garage first.');
      return;
    }

    let totalServiceExp = 0;
    let totalInsExp = 0;
    let expenseCount = 0;

    userVehicles.forEach((veh) => {
      const expenses: VehicleExpense[] = getExpenses(currentUser.id, veh.id);
      expenses.forEach((e: VehicleExpense) => {
        expenseCount++;
        if (e.category === 'Maintenance' || e.category === 'Repairs') {
          totalServiceExp += e.amount;
        } else if (e.category === 'Insurance') {
          totalInsExp += e.amount;
        }
      });
    });

    if (expenseCount === 0) {
      alert('Vehicles found in Garage, but no historical expense entries logged yet.');
      return;
    }

    onChangeParams({
      ...params,
      annualRoutineService: totalServiceExp > 0 ? Math.round(totalServiceExp / userVehicles.length) : params.annualRoutineService,
      annualInsuranceRenewal: totalInsExp > 0 ? Math.round(totalInsExp / userVehicles.length) : params.annualInsuranceRenewal,
      isImportedFromGarage: true,
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
              backgroundColor: 'rgba(168, 85, 247, 0.12)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a855f7',
            }}
          >
            <Wrench size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              5. Maintenance, Insurance & Equipment Estimates
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, marginTop: '2px' }}>
              Routine services, replacement tyres, policy renewals, and home charger installation.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {currentUser && (
            <button
              type="button"
              onClick={handleImportGarageData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(168, 85, 247, 0.12)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#c084fc',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <History size={14} /> Import My Garage Records
            </button>
          )}

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              {ownershipYears}-Yr Total Upkeep
            </span>
            <div
              style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                color: '#c084fc',
                letterSpacing: '-0.02em',
              }}
            >
              {formatCurrency(grandTotal, currency)}
            </div>
          </div>
        </div>
      </div>

      {params.isImportedFromGarage && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.75rem',
            color: '#e9d5ff',
          }}
        >
          <Sparkles size={15} color="#c084fc" />
          <span>
            <strong>Historical Garage Baseline Applied:</strong> Figures calibrated using your registered My Garage ownership logs. Future projections remain subject to vehicle age and mileage wear.
          </span>
        </div>
      )}

      {/* Grid Inputs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Routine Service */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '10px',
            padding: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
            Annual Routine Servicing
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={params.annualRoutineService}
            onChange={(e) =>
              onChangeParams({
                ...params,
                annualRoutineService: Math.max(0, parseFloat(e.target.value) || 0),
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
            {isEv ? 'Cabin air filter, brake fluid, coolant flush' : 'Engine oil, oil filter, air & fuel filters'}
          </span>
        </div>

        {/* Tyres & Wear */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '10px',
            padding: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
            Annual Repairs, Tyres & Wear
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={params.annualRepairsAndTyres}
            onChange={(e) =>
              onChangeParams({
                ...params,
                annualRepairsAndTyres: Math.max(0, parseFloat(e.target.value) || 0),
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
            Tyre replacements every ~35,000 km, brake pads, alignment
          </span>
        </div>

        {/* Insurance Renewal */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '10px',
            padding: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
            Annual Insurance Renewal
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={params.annualInsuranceRenewal}
            onChange={(e) =>
              onChangeParams({
                ...params,
                annualInsuranceRenewal: Math.max(0, parseFloat(e.target.value) || 0),
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
            Comprehensive IDV renewal with No Claim Bonus (NCB)
          </span>
        </div>

        {/* EV Wallbox / Charger One-Time */}
        {isEv && (
          <div
            style={{
              backgroundColor: 'rgba(6, 182, 212, 0.03)',
              borderRadius: '10px',
              padding: '1rem',
              border: '1px solid rgba(6, 182, 212, 0.15)',
            }}
          >
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
              One-Time Home EV Charger & Installation
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={params.oneTimeChargerEquipment}
              onChange={(e) =>
                onChangeParams({
                  ...params,
                  oneTimeChargerEquipment: Math.max(0, parseFloat(e.target.value) || 0),
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
              7.4 kW / 11 kW AC Wallbox, cabling, MCB & earthing setup
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
