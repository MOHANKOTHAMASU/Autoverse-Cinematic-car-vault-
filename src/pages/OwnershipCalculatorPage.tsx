import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { VEHICLES } from '../data/vehicles';
import type { Vehicle } from '../types';
import type {
  CurrencyCode,
  OwnershipPeriod,
  PurchaseMode,
  TcoParameters,
  TcoResult,
  SavedTcoScenario,
} from '../types/calculator';
import {
  REGIONAL_PROFILES,
  createDefaultTcoParameters,
  calculateOnRoadPrice,
  calculateTco,
  getSavedScenarios,
  deleteScenario,
} from '../utils/tcoCalculator';
import { VehicleRegionSelector } from '../components/calculator/VehicleRegionSelector';
import { OnRoadCostCard } from '../components/calculator/OnRoadCostCard';
import { EmiCalculatorCard } from '../components/calculator/EmiCalculatorCard';
import { EnergyExpenseCard } from '../components/calculator/EnergyExpenseCard';
import { MaintenanceInsuranceCard } from '../components/calculator/MaintenanceInsuranceCard';
import { TcoBreakdownCard } from '../components/calculator/TcoBreakdownCard';
import { MultiVehicleTcoComparison } from '../components/calculator/MultiVehicleTcoComparison';
import { SaveScenarioModal } from '../components/calculator/SaveScenarioModal';
import { Calculator, RefreshCw, Bookmark, ChevronRight } from 'lucide-react';

export const OwnershipCalculatorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const vehicleParam = searchParams.get('vehicle');
  const modeParam = searchParams.get('mode') as PurchaseMode | null;
  const periodParam = Number(searchParams.get('period')) as OwnershipPeriod | null;

  // Selected base vehicle
  const initialVehicle = useMemo(() => {
    if (vehicleParam) {
      const found = VEHICLES.find((v) => v.slug === vehicleParam || v.id === vehicleParam);
      if (found) return found;
    }
    // Default to Tata Curvv or Porsche Taycan Turbo S
    return VEHICLES.find((v) => v.slug === 'tata-curvv') || VEHICLES[0];
  }, [vehicleParam]);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(initialVehicle);
  const [selectedRegionKey, setSelectedRegionKey] = useState<string>('delhi');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');

  // Custom price override
  const [isCustomPriceActive, setIsCustomPriceActive] = useState(false);
  const [customPrice, setCustomPrice] = useState<number>(() => {
    const defaultParams = createDefaultTcoParameters(initialVehicle, 'delhi', 'INR');
    return defaultParams.onRoadCost.exShowroomPrice;
  });

  // Master TCO Parameters State
  const [parameters, setParameters] = useState<TcoParameters>(() => {
    const init = createDefaultTcoParameters(initialVehicle, 'delhi', 'INR');
    if (modeParam === 'cash' || modeParam === 'financed') {
      init.purchaseMode = modeParam;
    }
    if (periodParam && [1, 3, 5, 8].includes(periodParam)) {
      init.ownershipPeriodYears = periodParam;
    }
    return init;
  });

  // Additional fine-tuning states
  const [customRtoPercent, setCustomRtoPercent] = useState<number | undefined>(undefined);
  const [customInsurancePercent, setCustomInsurancePercent] = useState<number | undefined>(undefined);
  const [customAccessories, setCustomAccessories] = useState<number>(0);
  const [customOtherCosts, setCustomOtherCosts] = useState<number>(0);

  // Multi-vehicle compare slugs
  const [comparedSlugs, setComparedSlugs] = useState<string[]>(() => {
    const compareParam = searchParams.get('compare');
    if (compareParam) {
      return compareParam.split(',').filter((s) => s !== initialVehicle.slug);
    }
    // Suggest 1 realistic rival if available
    const rival = VEHICLES.find(
      (v) => v.slug !== initialVehicle.slug && v.bodyType === initialVehicle.bodyType
    );
    return rival ? [rival.slug] : [];
  });

  // Saved scenarios state & modal
  const [savedScenarios, setSavedScenarios] = useState<SavedTcoScenario[]>(() => getSavedScenarios());
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // When selected vehicle changes, recalculate baseline
  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsCustomPriceActive(false);
    const newDefaults = createDefaultTcoParameters(vehicle, selectedRegionKey, currency);
    setCustomPrice(newDefaults.onRoadCost.exShowroomPrice);
    setParameters((prev) => ({
      ...newDefaults,
      purchaseMode: prev.purchaseMode,
      ownershipPeriodYears: prev.ownershipPeriodYears,
    }));
  };

  // When region changes, update defaults
  const handleSelectRegionKey = (regionKey: string) => {
    setSelectedRegionKey(regionKey);
    const profile = REGIONAL_PROFILES[regionKey];
    if (profile) {
      setCurrency(profile.currency);
      const newDefaults = createDefaultTcoParameters(selectedVehicle, regionKey, profile.currency);
      setCustomPrice(newDefaults.onRoadCost.exShowroomPrice);
      setParameters((prev) => ({
        ...newDefaults,
        purchaseMode: prev.purchaseMode,
        ownershipPeriodYears: prev.ownershipPeriodYears,
      }));
    }
  };

  // Synchronize on-road price whenever vehicle price, RTO, or accessories change
  useEffect(() => {
    const exShowroom = isCustomPriceActive ? customPrice : parameters.onRoadCost.exShowroomPrice;
    const updatedOnRoad = calculateOnRoadPrice(
      exShowroom,
      selectedVehicle.powertrain,
      selectedRegionKey,
      customRtoPercent,
      customInsurancePercent,
      customAccessories,
      customOtherCosts
    );

    setParameters((prev) => {
      // Re-adjust down payment if price changed
      const newDownPayment = Math.min(
        updatedOnRoad.totalOnRoadPrice,
        Math.round(updatedOnRoad.totalOnRoadPrice * 0.2)
      );

      return {
        ...prev,
        onRoadCost: updatedOnRoad,
        loan: {
          ...prev.loan,
          vehiclePrice: updatedOnRoad.totalOnRoadPrice,
          downPayment: newDownPayment,
          principalFinanced: updatedOnRoad.totalOnRoadPrice - newDownPayment,
        },
      };
    });
  }, [
    customPrice,
    isCustomPriceActive,
    selectedRegionKey,
    customRtoPercent,
    customInsurancePercent,
    customAccessories,
    customOtherCosts,
    selectedVehicle.powertrain,
  ]);

  // Execute deterministic TCO calculation
  const results: TcoResult = useMemo(() => {
    return calculateTco(parameters);
  }, [parameters]);

  // Reset to factory defaults
  const handleReset = () => {
    setIsCustomPriceActive(false);
    setCustomRtoPercent(undefined);
    setCustomInsurancePercent(undefined);
    setCustomAccessories(0);
    setCustomOtherCosts(0);
    const resetParams = createDefaultTcoParameters(selectedVehicle, selectedRegionKey, currency);
    setCustomPrice(resetParams.onRoadCost.exShowroomPrice);
    setParameters(resetParams);
  };

  // Load a saved scenario
  const handleLoadScenario = (sc: SavedTcoScenario) => {
    setParameters(sc.parameters);
    const foundVehicle = VEHICLES.find((v) => v.slug === sc.parameters.vehicleSlug);
    if (foundVehicle) {
      setSelectedVehicle(foundVehicle);
    }
    setCurrency(sc.parameters.currency);
  };

  const handleDeleteScenario = (id: string) => {
    deleteScenario(id);
    setSavedScenarios(getSavedScenarios());
  };

  return (
    <div
      style={{
        backgroundColor: '#040608',
        color: '#f8fafc',
        minHeight: '100vh',
        paddingTop: 'calc(var(--header-height) + 1.5rem)',
        paddingBottom: '4rem',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 1.25rem',
        }}
      >
        {/* Breadcrumb Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#64748b',
            marginBottom: '1rem',
          }}
        >
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>
            Home
          </Link>
          <ChevronRight size={14} />
          <Link to="/discover" style={{ color: '#94a3b8', textDecoration: 'none' }}>
            Vehicles
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Price & TCO Calculator
          </span>
        </div>

        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                padding: '4px 10px',
                borderRadius: '999px',
                color: 'var(--accent-cyan)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
              }}
            >
              <Calculator size={13} />
              <span>Stage 12 Verified Financial Terminal</span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.03em',
                margin: 0,
              }}
            >
              Price, Finance & Total Cost of Ownership
            </h1>
            <p
              style={{
                fontSize: '0.95rem',
                color: '#94a3b8',
                marginTop: '6px',
                maxWidth: '680px',
                lineHeight: 1.5,
              }}
            >
              Compute true multi-year lifecycle ownership costs. Incorporates regional on-road levies,
              bank EMI schedules, realistic charging vs pump energy models, and non-double-counted TCO.
            </p>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '8px 14px',
                color: '#cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} /> Reset
            </button>

            <button
              type="button"
              onClick={() => {
                setSavedScenarios(getSavedScenarios());
                setIsSaveModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--accent-cyan)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#000000',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Bookmark size={15} /> Save / Export Scenario
            </button>
          </div>
        </div>

        {/* 8 Core Calculator Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Section 1: Vehicle & Regional Market */}
          <VehicleRegionSelector
            vehicles={VEHICLES}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={handleSelectVehicle}
            selectedRegionKey={selectedRegionKey}
            onSelectRegionKey={handleSelectRegionKey}
            currency={currency}
            onSelectCurrency={setCurrency}
            customPrice={customPrice}
            onChangeCustomPrice={setCustomPrice}
            isCustomPriceActive={isCustomPriceActive}
            onToggleCustomPrice={setIsCustomPriceActive}
            priceBasis={parameters.onRoadCost.priceBasis}
          />

          {/* Section 2: On-Road Cost Estimator */}
          <OnRoadCostCard
            onRoad={parameters.onRoadCost}
            currency={currency}
            regionKey={selectedRegionKey}
            powertrain={selectedVehicle.powertrain}
            customRtoPercent={customRtoPercent}
            onChangeCustomRtoPercent={setCustomRtoPercent}
            customInsurancePercent={customInsurancePercent}
            onChangeCustomInsurancePercent={setCustomInsurancePercent}
            customAccessories={customAccessories}
            onChangeCustomAccessories={setCustomAccessories}
            customOtherCosts={customOtherCosts}
            onChangeCustomOtherCosts={setCustomOtherCosts}
          />

          {/* Section 3: Loan EMI & Financing */}
          <EmiCalculatorCard
            vehiclePrice={parameters.onRoadCost.totalOnRoadPrice}
            vehicleName={`${selectedVehicle.brand} ${selectedVehicle.model}`}
            currency={currency}
            purchaseMode={parameters.purchaseMode}
            onChangePurchaseMode={(mode) => setParameters((p) => ({ ...p, purchaseMode: mode }))}
            loanParams={parameters.loan}
            onChangeLoanParams={(l) => setParameters((p) => ({ ...p, loan: l }))}
          />

          {/* Section 4: Fuel & EV Energy */}
          <EnergyExpenseCard
            energyParams={parameters.energy}
            onChangeEnergyParams={(e) => setParameters((p) => ({ ...p, energy: e }))}
            currency={currency}
            regionKey={selectedRegionKey}
            ownershipYears={parameters.ownershipPeriodYears}
          />

          {/* Section 5: Maintenance & Upkeep */}
          <MaintenanceInsuranceCard
            params={parameters.maintenance}
            onChangeParams={(m) => setParameters((p) => ({ ...p, maintenance: m }))}
            currency={currency}
            isEv={selectedVehicle.powertrain === 'electric'}
            ownershipYears={parameters.ownershipPeriodYears}
          />

          {/* Section 6: Total Cost of Ownership (TCO) & Net Synthesis */}
          <TcoBreakdownCard
            parameters={parameters}
            results={results}
            currency={currency}
            onChangePeriod={(period) =>
              setParameters((p) => ({ ...p, ownershipPeriodYears: period }))
            }
            onChangeResaleMethod={(method) =>
              setParameters((p) => ({ ...p, resaleValueMethod: method }))
            }
            onChangeCustomResaleValue={(val) =>
              setParameters((p) => ({ ...p, estimatedResaleValue: val }))
            }
          />

          {/* Section 7: Side-by-Side Multi-Vehicle Comparison */}
          <MultiVehicleTcoComparison
            vehicles={VEHICLES}
            baseVehicle={selectedVehicle}
            comparedSlugs={comparedSlugs}
            onAddVehicle={(slug) => setComparedSlugs((prev) => [...prev, slug])}
            onRemoveVehicle={(slug) => setComparedSlugs((prev) => prev.filter((s) => s !== slug))}
            currency={currency}
            regionKey={selectedRegionKey}
            ownershipYears={parameters.ownershipPeriodYears}
            purchaseMode={parameters.purchaseMode}
            annualDistanceKm={parameters.energy.annualDistanceKm}
          />
        </div>

        {/* Section 8: Save & Export Modal */}
        <SaveScenarioModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          parameters={parameters}
          results={results}
          savedScenarios={savedScenarios}
          onLoadScenario={handleLoadScenario}
          onDeleteScenario={handleDeleteScenario}
        />
      </div>
    </div>
  );
};
