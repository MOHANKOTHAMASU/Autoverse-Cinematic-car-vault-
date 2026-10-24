import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { VEHICLES } from '../data/vehicles';
import type { Vehicle } from '../types';
import { CarImage } from '../components/CarImage';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  RefreshCw,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Scale,
  Award,
  Zap,
  SlidersHorizontal,
  Info,
  Car,
  BatteryCharging,
  Fuel,
  Bot,
  Bookmark,
  Calculator,
} from 'lucide-react';
import { CompareVehicleSelectorModal } from '../components/CompareVehicleSelectorModal';
import { saveComparison } from '../utils/garage';
import {
  type ComparisonRow,
  formatPrice,
  hasRowDifferences,
  findBestVehicleIndex,
  generateComparisonSummary,
} from '../utils/comparison';

export const ComparePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse initial vehicles from URL (?cars=slug1,slug2 or ?a=slug1&b=slug2)
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>(() => {
    const carsParam = searchParams.get('cars');
    const paramA = searchParams.get('a');
    const paramB = searchParams.get('b');

    let slugs: string[] = [];
    if (carsParam) {
      slugs = carsParam.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (paramA || paramB) {
      if (paramA) slugs.push(paramA);
      if (paramB) slugs.push(paramB);
    }

    const matched = slugs
      .map((slug) => VEHICLES.find((v) => v.slug === slug || v.id === slug))
      .filter((v): v is Vehicle => Boolean(v));

    if (matched.length >= 2) {
      return matched.slice(0, 4);
    }
    if (matched.length === 1) {
      const partner = (matched[0].id === VEHICLES[0].id || matched[0].slug === VEHICLES[0].slug) ? VEHICLES[1] : VEHICLES[0];
      return [matched[0], partner];
    }
    // Default to flagship Porsche Taycan Turbo S and Tesla Model S Plaid
    return [VEHICLES[0], VEHICLES[1]];
  });

  // Selector modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replacingSlotIndex, setReplacingSlotIndex] = useState<number | null>(null);

  // Filters & Toggles
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const [highlightBestValues, setHighlightBestValues] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Accordion collapsed state for 7 categories
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
    basic: false,
    performance: false,
    electric: false,
    efficiency: false,
    dimensions: false,
    interior: false,
    safety: false,
  });

  // Keep URL in sync with selected vehicles
  useEffect(() => {
    const slugs = selectedVehicles.map((v) => v.slug || v.id).join(',');
    setSearchParams({ cars: slugs }, { replace: true });
  }, [selectedVehicles, setSearchParams]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareComparison = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(
        () => showToast('Shareable comparison URL copied to clipboard!'),
        () => showToast('Comparison URL: ' + url)
      );
    }
  };

  const handleRemoveVehicle = (index: number) => {
    if (selectedVehicles.length <= 2) {
      showToast('A minimum of 2 vehicles is required for comparison.');
      return;
    }
    setSelectedVehicles((prev) => prev.filter((_, idx) => idx !== index));
    showToast('Vehicle removed from comparison.');
  };

  const handleOpenAddModal = () => {
    if (selectedVehicles.length >= 4) {
      showToast('Maximum of 4 vehicles can be compared simultaneously.');
      return;
    }
    setReplacingSlotIndex(null);
    setIsModalOpen(true);
  };

  const handleOpenReplaceModal = (index: number) => {
    setReplacingSlotIndex(index);
    setIsModalOpen(true);
  };

  const handleSelectFromModal = (vehicle: Vehicle) => {
    if (replacingSlotIndex !== null) {
      setSelectedVehicles((prev) => {
        const next = [...prev];
        next[replacingSlotIndex] = vehicle;
        return next;
      });
      showToast(`Slot replaced with ${vehicle.brand} ${vehicle.model}`);
    } else {
      if (selectedVehicles.length < 4) {
        setSelectedVehicles((prev) => [...prev, vehicle]);
        showToast(`Added ${vehicle.brand} ${vehicle.model} to comparison`);
      }
    }
    setIsModalOpen(false);
  };

  const handleResetToDefault = () => {
    setSelectedVehicles([VEHICLES[0], VEHICLES[1]]);
    showToast('Comparison reset to default flagship models.');
  };

  const handleSaveComparison = () => {
    if (selectedVehicles.length < 2) {
      showToast('Select at least 2 vehicles to save a comparison.');
      return;
    }
    const name = selectedVehicles.map((v) => `${v.brand} ${v.model}`).join(' vs ');
    const slugs = selectedVehicles.map((v) => v.slug || v.id);
    saveComparison(name, slugs);
    showToast('Comparison successfully saved to My Garage!');
  };

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const toggleAllCategories = () => {
    const allCollapsed = Object.values(collapsedCategories).every(Boolean);
    const nextState = !allCollapsed;
    setCollapsedCategories({
      basic: nextState,
      performance: nextState,
      electric: nextState,
      efficiency: nextState,
      dimensions: nextState,
      interior: nextState,
      safety: nextState,
    });
  };

  // Executive Difference Summaries
  const differenceTakeaways = useMemo(() => {
    return generateComparisonSummary(selectedVehicles);
  }, [selectedVehicles]);

  // Check if any compared vehicle is pure electric or hybrid
  const hasElectricVehicle = useMemo(() => {
    return selectedVehicles.some((v) => v.powertrain === 'electric' || v.powertrain === 'plug-in hybrid' || v.powertrain === 'hybrid');
  }, [selectedVehicles]);

  // Master Specification Rows Definition across 7 categories
  const comparisonRows: ComparisonRow[] = useMemo(() => {
    return [
      // 1. Basic Information
      {
        id: 'brand',
        label: 'Manufacturer & Brand',
        category: 'basic',
        formatValue: (v) => v.brand,
      },
      {
        id: 'modelVariant',
        label: 'Model & Variant',
        category: 'basic',
        formatValue: (v) => `${v.model} ${v.variant}`,
      },
      {
        id: 'modelYear',
        label: 'Model Year & Generation',
        category: 'basic',
        formatValue: (v) => `${v.modelYear} (${v.generation || 'Certified Series'})`,
      },
      {
        id: 'bodyType',
        label: 'Body Topology',
        category: 'basic',
        formatValue: (v) => v.bodyType.replace('_', ' ').toUpperCase(),
      },
      {
        id: 'market',
        label: 'Homologation Market',
        category: 'basic',
        formatValue: (v) => v.market,
      },
      {
        id: 'powertrain',
        label: 'Propulsion Architecture',
        category: 'basic',
        formatValue: (v) => v.powertrain.toUpperCase(),
      },
      {
        id: 'price',
        label: 'Starting MSRP (Verified)',
        category: 'basic',
        isNumeric: true,
        higherIsBetter: false,
        getRawNumber: (v) => v.price || v.priceStartingUsd || null,
        formatValue: (v) => formatPrice(v.price || v.priceStartingUsd, v.currency),
      },

      // 2. Performance
      {
        id: 'systemHp',
        label: 'Peak System Output (HP)',
        category: 'performance',
        unit: 'HP',
        isNumeric: true,
        higherIsBetter: true,
        getRawNumber: (v) => v.performanceDetails?.systemPowerHp ?? v.horsepower ?? null,
        formatValue: (v) => {
          const hp = v.performanceDetails?.systemPowerHp ?? v.horsepower;
          return hp ? `${hp.toLocaleString()} HP` : 'Not verified';
        },
      },
      {
        id: 'systemKw',
        label: 'Power Output in Kilowatts',
        category: 'performance',
        unit: 'kW',
        isNumeric: true,
        higherIsBetter: true,
        getRawNumber: (v) => v.performanceDetails?.systemPowerKw ?? v.powerKw ?? null,
        formatValue: (v) => {
          const kw = v.performanceDetails?.systemPowerKw ?? v.powerKw;
          return kw ? `${kw.toLocaleString()} kW` : 'Not verified';
        },
      },
      {
        id: 'systemTorque',
        label: 'Maximum System Torque',
        category: 'performance',
        unit: 'Nm',
        isNumeric: true,
        higherIsBetter: true,
        getRawNumber: (v) => v.performanceDetails?.systemTorqueNm ?? v.torqueNm ?? null,
        formatValue: (v) => {
          const t = v.performanceDetails?.systemTorqueNm ?? v.torqueNm;
          return t ? `${t.toLocaleString()} Nm` : 'Not verified';
        },
      },
      {
        id: 'accel0to100',
        label: '0–100 km/h Acceleration',
        category: 'performance',
        unit: 'sec',
        isNumeric: true,
        higherIsBetter: false,
        getRawNumber: (v) => v.performanceDetails?.acceleration0to100Kmh ?? v.specs?.acceleration0to100Kmh ?? null,
        formatValue: (v) => {
          const s = v.performanceDetails?.acceleration0to100Kmh ?? v.specs?.acceleration0to100Kmh;
          return s ? `${s}s` : 'Not verified';
        },
      },
      {
        id: 'accel0to60',
        label: '0–60 MPH Acceleration',
        category: 'performance',
        unit: 'sec',
        isNumeric: true,
        higherIsBetter: false,
        getRawNumber: (v) => v.accelerationSeconds || v.specs?.acceleration0to60 || null,
        formatValue: (v) => `${v.accelerationSeconds || v.specs?.acceleration0to60}s`,
      },
      {
        id: 'topSpeedKmh',
        label: 'Top Track Speed (km/h)',
        category: 'performance',
        unit: 'km/h',
        isNumeric: true,
        higherIsBetter: true,
        getRawNumber: (v) => v.topSpeedKmh || v.specs?.topSpeedKmh || null,
        formatValue: (v) => {
          const spd = v.topSpeedKmh || v.specs?.topSpeedKmh;
          return spd ? `${spd} km/h` : 'Not verified';
        },
      },
      {
        id: 'topSpeedMph',
        label: 'Top Track Speed (MPH)',
        category: 'performance',
        unit: 'MPH',
        isNumeric: true,
        higherIsBetter: true,
        getRawNumber: (v) => v.topSpeedMph || v.specs?.topSpeedMph || null,
        formatValue: (v) => `${v.topSpeedMph || v.specs?.topSpeedMph} MPH`,
      },
      {
        id: 'engineType',
        label: 'Engine / Motor Configuration',
        category: 'performance',
        formatValue: (v) => v.performanceDetails?.engineConfiguration || v.performanceDetails?.motorType || v.specs?.engineType,
      },
      {
        id: 'transmission',
        label: 'Transmission Hardware',
        category: 'performance',
        formatValue: (v) => v.performanceDetails?.transmissionType || v.transmission || v.specs?.transmission,
      },
      {
        id: 'drivetrain',
        label: 'Drivetrain & Differential',
        category: 'performance',
        formatValue: (v) => v.performanceDetails?.drivetrainLayout || v.drivetrain || v.specs?.drivetrain,
      },
      {
        id: 'curbWeight',
        label: 'Curb Weight',
        category: 'performance',
        unit: 'kg',
        isNumeric: true,
        higherIsBetter: false,
        getRawNumber: (v) => v.specs?.curbWeightKg || null,
        formatValue: (v) => {
          if (v.specs?.curbWeightKg) {
            return `${v.specs.curbWeightKg.toLocaleString()} kg (${v.specs.curbWeightLbs?.toLocaleString()} lbs)`;
          }
          return 'Not verified';
        },
      },

      // 3. Electric Vehicle Specifications (EV/PHEV)
      {
        id: 'batteryGross',
        label: 'Battery Capacity (Gross)',
        category: 'electric',
        unit: 'kWh',
        isNumeric: true,
        higherIsBetter: true,
        getRawNumber: (v) => v.efficiencyDetails?.batteryGrossKwh ?? v.batteryCapacityKWh ?? null,
        formatValue: (v) => {
          const kwh = v.efficiencyDetails?.batteryGrossKwh ?? v.batteryCapacityKWh;
          return kwh ? `${kwh} kWh` : 'N/A (Combustion)';
        },
      },
      {
        id: 'batteryUsable',
        label: 'Battery Capacity (Usable Net)',
        category: 'electric',
        unit: 'kWh',
        isNumeric: true,
        higherIsBetter: true,
        getRawNumber: (v) => v.efficiencyDetails?.batteryUsableKwh ?? null,
        formatValue: (v) => {
          const net = v.efficiencyDetails?.batteryUsableKwh;
          return net ? `${net} kWh net` : 'N/A';
        },
      },
      {
        id: 'electricRange',
        label: 'Official Electric Range',
        category: 'electric',
        unit: 'miles',
        isNumeric: true,
        higherIsBetter: true,
        getRawNumber: (v) => v.efficiencyDetails?.ratedRangeMiles ?? v.electricRangeMiles ?? null,
        formatValue: (v) => {
          const mi = v.efficiencyDetails?.ratedRangeMiles ?? v.electricRangeMiles;
          const km = v.efficiencyDetails?.ratedRangeKm ?? v.electricRangeKm;
          if (mi) {
            return `${mi} mi (${km || Math.round(mi * 1.609)} km) [${v.efficiencyDetails?.rangeTestCycle || 'WLTP'}]`;
          }
          return 'N/A (Combustion)';
        },
      },
      {
        id: 'fastChargingDc',
        label: 'Peak DC Fast-Charging Rate',
        category: 'electric',
        unit: 'kW',
        isNumeric: true,
        higherIsBetter: true,
        getRawNumber: (v) => v.efficiencyDetails?.chargingMaxDcKw ?? null,
        formatValue: (v) => {
          const dc = v.efficiencyDetails?.chargingMaxDcKw;
          return dc ? `${dc} kW Peak` : 'N/A';
        },
      },
      {
        id: 'chargeTime',
        label: '10%–80% Fast Charge Duration',
        category: 'electric',
        formatValue: (v) => v.efficiencyDetails?.chargingTimeDc10to80 || 'N/A',
      },
      {
        id: 'motorTech',
        label: 'Electric Motor & Inverter Tech',
        category: 'electric',
        formatValue: (v) => v.manufacturingDetails?.electricMotorTech || 'N/A (Combustion Engine)',
      },

      // 4. Fuel Economy & Efficiency
      {
        id: 'fuelEconomy',
        label: 'Combined Fuel Economy',
        category: 'efficiency',
        formatValue: (v) => {
          if (v.efficiencyDetails?.fuelEconomyMpgCombined) {
            return `${v.efficiencyDetails.fuelEconomyMpgCombined} MPG Combined (${v.efficiencyDetails.fuelEconomyLiters100Km} L/100km)`;
          }
          if (v.efficiencyDetails?.energyConsumptionKwh100Km) {
            return `${v.efficiencyDetails.energyConsumptionKwh100Km} kWh/100km (${v.efficiencyDetails.energyConsumptionMpge || 85} MPGe)`;
          }
          return 'Not verified';
        },
      },
      {
        id: 'fuelTank',
        label: 'Fuel Tank Capacity',
        category: 'efficiency',
        isNumeric: true,
        higherIsBetter: true,
        getRawNumber: (v) => v.efficiencyDetails?.fuelTankCapacityLiters ?? null,
        formatValue: (v) => {
          const tank = v.efficiencyDetails?.fuelTankCapacityLiters;
          return tank ? `${tank} L (${v.efficiencyDetails?.fuelTankCapacityGallons} gal)` : 'N/A (All-Electric)';
        },
      },

      // 5. Dimensions & Practicality
      {
        id: 'length',
        label: 'Overall Length',
        category: 'dimensions',
        unit: 'mm',
        isNumeric: true,
        getRawNumber: (v) => v.dimensions?.lengthMm ?? null,
        formatValue: (v) => v.dimensions?.lengthMm ? `${v.dimensions.lengthMm.toLocaleString()} mm` : 'Not verified',
      },
      {
        id: 'width',
        label: 'Overall Width (Excl. Mirrors)',
        category: 'dimensions',
        unit: 'mm',
        isNumeric: true,
        getRawNumber: (v) => v.dimensions?.widthMm ?? null,
        formatValue: (v) => v.dimensions?.widthMm ? `${v.dimensions.widthMm.toLocaleString()} mm` : 'Not verified',
      },
      {
        id: 'height',
        label: 'Overall Height',
        category: 'dimensions',
        unit: 'mm',
        isNumeric: true,
        getRawNumber: (v) => v.dimensions?.heightMm ?? null,
        formatValue: (v) => v.dimensions?.heightMm ? `${v.dimensions.heightMm.toLocaleString()} mm` : 'Not verified',
      },
      {
        id: 'wheelbase',
        label: 'Wheelbase',
        category: 'dimensions',
        unit: 'mm',
        isNumeric: true,
        getRawNumber: (v) => v.dimensions?.wheelbaseMm ?? null,
        formatValue: (v) => v.dimensions?.wheelbaseMm ? `${v.dimensions.wheelbaseMm.toLocaleString()} mm` : 'Not verified',
      },
      {
        id: 'groundClearance',
        label: 'Ground Clearance',
        category: 'dimensions',
        unit: 'mm',
        isNumeric: true,
        getRawNumber: (v) => v.dimensions?.groundClearanceMm ?? null,
        formatValue: (v) => v.dimensions?.groundClearanceMm ? `${v.dimensions.groundClearanceMm} mm` : 'Not verified',
      },
      {
        id: 'seating',
        label: 'Seating Capacity',
        category: 'dimensions',
        unit: 'passengers',
        isNumeric: true,
        higherIsBetter: true,
        getRawNumber: (v) => v.interiorDetails?.seatingCapacity ?? null,
        formatValue: (v) => v.interiorDetails?.seatingCapacity ? `${v.interiorDetails.seatingCapacity} Passengers` : '4 Passengers',
      },
      {
        id: 'cargoBoot',
        label: 'Boot / Rear Cargo Volume',
        category: 'dimensions',
        unit: 'liters',
        isNumeric: true,
        higherIsBetter: true,
        getRawNumber: (v) => v.interiorDetails?.cargoCapacityLiters ?? null,
        formatValue: (v) => {
          const l = v.interiorDetails?.cargoCapacityLiters;
          return l !== undefined ? `${l} L (${v.interiorDetails?.cargoCapacityCuFt || 0} cu ft)` : 'Not verified';
        },
      },
      {
        id: 'frunk',
        label: 'Front Trunk (Frunk) Volume',
        category: 'dimensions',
        unit: 'liters',
        isNumeric: true,
        higherIsBetter: true,
        getRawNumber: (v) => v.interiorDetails?.frunkCapacityLiters ?? null,
        formatValue: (v) => {
          const f = v.interiorDetails?.frunkCapacityLiters;
          return f ? `${f} L (${v.interiorDetails?.frunkCapacityCuFt} cu ft)` : 'None / Engine Bay';
        },
      },
      {
        id: 'torsionalRigidity',
        label: 'Torsional Chassis Stiffness',
        category: 'dimensions',
        unit: 'Nm/deg',
        isNumeric: true,
        higherIsBetter: true,
        getRawNumber: (v) => v.manufacturingDetails?.torsionalRigidityNmDeg ?? null,
        formatValue: (v) => {
          const t = v.manufacturingDetails?.torsionalRigidityNmDeg;
          return t ? `${t.toLocaleString()} Nm/degree` : 'Not verified';
        },
      },

      // 6. Interior & Comfort
      {
        id: 'upholstery',
        label: 'Standard Seat Upholstery',
        category: 'interior',
        formatValue: (v) => v.interiorDetails?.upholsteryStandard || 'Premium Interior Trim',
      },
      {
        id: 'seatAdjustment',
        label: 'Front Seat Adjustments',
        category: 'interior',
        formatValue: (v) => v.interiorDetails?.frontSeatAdjustment || 'Power Multi-Way Seats',
      },
      {
        id: 'seatHeating',
        label: 'Front Seat Heating',
        category: 'interior',
        formatValue: (v) => v.interiorDetails?.heatingStandard ? 'Standard Equipment' : 'Optional / Not Equipped',
      },
      {
        id: 'seatVentilation',
        label: 'Front Seat Ventilation',
        category: 'interior',
        formatValue: (v) => v.interiorDetails?.ventilationAvailability || 'Not Available',
      },
      {
        id: 'seatMassage',
        label: 'Active Seat Massage',
        category: 'interior',
        formatValue: (v) => v.interiorDetails?.massageAvailability || 'Not Available',
      },
      {
        id: 'climateControl',
        label: 'Climate & Air Quality',
        category: 'interior',
        formatValue: (v) => v.interiorDetails?.climateControl || 'Automatic Climate Control',
      },
      {
        id: 'infotainmentDisplay',
        label: 'Cockpit Screen Topology',
        category: 'interior',
        formatValue: (v) => v.interiorDetails?.infotainmentDisplay || 'Central Digital Touchscreen',
      },
      {
        id: 'audioSystem',
        label: 'Sound System Brand & Speakers',
        category: 'interior',
        formatValue: (v) => {
          const aud = v.interiorDetails;
          return aud?.audioSystemBrand
            ? `${aud.audioSystemBrand} (${aud.speakerCount} Speakers${aud.audioTotalWatts ? `, ${aud.audioTotalWatts}W` : ''})`
            : 'Premium Sound Package';
        },
      },

      // 7. Safety & Driver Assistance
      {
        id: 'airbags',
        label: 'Airbag Count & Deployment',
        category: 'safety',
        isNumeric: true,
        higherIsBetter: true,
        getRawNumber: (v) => v.safetyDetails?.airbagCount ?? null,
        formatValue: (v) => v.safetyDetails?.airbagCount ? `${v.safetyDetails.airbagCount} Airbags` : 'Standard Safety Suite',
      },
      {
        id: 'driverAssistance',
        label: 'Driver Assistance Suite',
        category: 'safety',
        formatValue: (v) => v.safetyDetails?.driverAssistanceSuite || 'Active Driver Safety Package',
      },
      {
        id: 'adasLevel',
        label: 'ADAS Classification Level',
        category: 'safety',
        formatValue: (v) => v.safetyDetails?.adasLevel || 'Level 2 SAE Driver Assistance',
      },
      {
        id: 'crashRating',
        label: 'Official Crash-Test Rating',
        category: 'safety',
        formatValue: (v) => {
          const cr = v.safetyDetails?.crashTestRating;
          return cr ? `${cr.agency}: ${cr.score} (${cr.testYear})` : 'Not Rated in Selected Market';
        },
      },
      {
        id: 'brakes',
        label: 'Braking Hardware Specification',
        category: 'safety',
        formatValue: (v) => v.safetyDetails?.brakingHardware || 'Ventilated High-Performance Disc Brakes',
      },
    ];
  }, []);

  // Filter rows by differences toggle and category
  const filteredRowsByCategory = useMemo(() => {
    const categories = [
      { id: 'basic', title: 'A. Basic Information & Homologation', icon: <Info size={17} /> },
      { id: 'performance', title: 'B. Performance & Propulsion Dynamics', icon: <Zap size={17} /> },
      ...(hasElectricVehicle ? [{ id: 'electric', title: 'C. Electric Powertrain & Battery Architecture', icon: <BatteryCharging size={17} /> }] : []),
      { id: 'efficiency', title: 'D. Fuel Economy & Environmental Efficiency', icon: <Fuel size={17} /> },
      { id: 'dimensions', title: 'E. Dimensions, Practicality & Chassis', icon: <Scale size={17} /> },
      { id: 'interior', title: 'F. Seats, Interior Comfort & Audio Luxury', icon: <Car size={17} /> },
      { id: 'safety', title: 'G. Safety, Braking & Driver Assistance (ADAS)', icon: <ShieldCheck size={17} /> },
    ];

    return categories.map((cat) => {
      let rows = comparisonRows.filter((r) => r.category === cat.id);
      if (showDifferencesOnly) {
        rows = rows.filter((r) => hasRowDifferences(r, selectedVehicles));
      }
      return {
        ...cat,
        rows,
      };
    });
  }, [comparisonRows, selectedVehicles, showDifferencesOnly, hasElectricVehicle]);

  // Column width percentage calculation
  const colCount = selectedVehicles.length;

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
            padding: '0.85rem 1.5rem',
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

      {/* Vehicle Selector Modal */}
      <CompareVehicleSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectVehicle={handleSelectFromModal}
        currentlySelectedIds={selectedVehicles.map((v) => v.slug || v.id)}
        replacingVehicleTitle={
          replacingSlotIndex !== null && selectedVehicles[replacingSlotIndex]
            ? `${selectedVehicles[replacingSlotIndex].brand} ${selectedVehicles[replacingSlotIndex].model}`
            : undefined
        }
      />

      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/discover"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <ArrowLeft size={14} /> Back to Fleet Catalog
          </Link>
        </div>

        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-cyan">
                <Scale size={12} /> STAGE 4 MULTI-VEHICLE BENCHMARK
              </span>
              <span className="badge badge-verified">
                <ShieldCheck size={12} /> {selectedVehicles.length} OF 4 VEHICLES LOADED
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.3rem, 5vw, 3.8rem)',
                color: '#ffffff',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: '0.75rem',
              }}
            >
              Head-to-Head Specification Matrix
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '740px', lineHeight: 1.6 }}>
              Compare 2 to 4 automotive machines side by side across verified powertrain telemetry,
              homologation dimensions, luxury appointments, and certified safety ratings.
            </p>
          </div>

          {/* Action Buttons: Save, Share & Reset */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={handleSaveComparison} className="btn btn-secondary" title="Save this comparison to My Garage">
              <Bookmark size={16} color="var(--accent-cyan)" />
              <span>Save to Garage</span>
            </button>
            <Link
              to={`/assistant?q=${encodeURIComponent(`Compare the ${selectedVehicles.map((v) => `${v.brand} ${v.model}`).join(' and ')} in detail for performance, charging speed, and value.`)}`}
              className="btn btn-secondary"
              style={{
                borderColor: 'rgba(0, 240, 255, 0.4)',
                color: 'var(--accent-cyan)',
                background: 'rgba(0, 240, 255, 0.08)',
              }}
              title="Ask AutoVerse AI to analyze this comparison"
            >
              <Bot size={15} />
              <span>Ask AI Analysis</span>
            </Link>
            <Link
              to={`/ownership-calculator?vehicle=${selectedVehicles[0]?.slug || ''}&compare=${selectedVehicles.slice(1).map((v) => v.slug).join(',')}`}
              className="btn btn-secondary"
              style={{
                borderColor: 'rgba(16, 185, 129, 0.4)',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.08)',
              }}
              title="Compare 5-Year Ownership Costs & Financing"
            >
              <Calculator size={15} />
              <span>Compare Ownership Costs (TCO)</span>
            </Link>
            <button onClick={handleShareComparison} className="btn btn-secondary" title="Copy shareable link">
              <Share2 size={16} color="var(--accent-cyan)" />
              <span>Share Matrix</span>
            </button>
            <button onClick={handleResetToDefault} className="btn btn-ghost" title="Reset comparison">
              <RefreshCw size={15} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Executive Takeaways Summary Card */}
        {differenceTakeaways.length > 0 && (
          <div
            style={{
              backgroundColor: 'rgba(12, 16, 23, 0.9)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '1.5rem 2rem',
              marginBottom: '2.5rem',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--accent-cyan)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              <Award size={16} /> EXECUTIVE BENCHMARK TAKEAWAYS
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {differenceTakeaways.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.025)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '1rem',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    {item.metric}
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                    {item.leaderBrand} {item.leaderModel}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    <span>{item.leaderValue}</span>
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                    <span style={{ color: '#34d399' }}>{item.deltaText}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intelligence Controls Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.5rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '10px',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Show Differences Only Toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                cursor: 'pointer',
                userSelect: 'none',
                fontSize: '0.88rem',
                color: showDifferencesOnly ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={showDifferencesOnly}
                onChange={(e) => setShowDifferencesOnly(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--accent-cyan)',
                  cursor: 'pointer',
                }}
              />
              <SlidersHorizontal size={15} />
              <span>Show Differences Only</span>
            </label>

            {/* Highlight Best Values Toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                cursor: 'pointer',
                userSelect: 'none',
                fontSize: '0.88rem',
                color: highlightBestValues ? '#34d399' : 'var(--text-secondary)',
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={highlightBestValues}
                onChange={(e) => setHighlightBestValues(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#34d399',
                  cursor: 'pointer',
                }}
              />
              <Award size={15} />
              <span>Highlight Leaders / Best Values</span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={toggleAllCategories}
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              <span>{Object.values(collapsedCategories).every(Boolean) ? 'Expand All Categories' : 'Collapse All'}</span>
            </button>

            {selectedVehicles.length < 4 && (
              <button
                onClick={handleOpenAddModal}
                className="btn btn-cyan"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
              >
                <Plus size={15} />
                <span>Add Vehicle ({selectedVehicles.length}/4)</span>
              </button>
            )}
          </div>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Scrollable Container with Sticky Headers */}
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <div style={{ minWidth: colCount > 2 ? '960px' : '720px' }}>
              {/* Sticky Vehicle Header Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `280px repeat(${colCount}, 1fr)`,
                  borderBottom: '2px solid var(--border-medium)',
                  backgroundColor: '#0a0e16',
                  position: 'sticky',
                  top: 'var(--header-height)',
                  zIndex: 20,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                }}
              >
                {/* Column 0: Label Column Header */}
                <div
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    borderRight: '1px solid var(--border-subtle)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                    BENCHMARK MATRIX
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                    Specification Grid
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Comparing {colCount} vehicles
                  </span>
                </div>

                {/* Compared Vehicle Cards Header */}
                {selectedVehicles.map((car, idx) => (
                  <div
                    key={car.id}
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRight: idx === colCount - 1 ? 'none' : '1px solid var(--border-subtle)',
                      backgroundColor: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                    }}
                  >
                    {/* Vehicle Exterior Image */}
                    <div
                      style={{
                        height: '140px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative',
                        marginBottom: '0.85rem',
                        backgroundColor: '#000',
                      }}
                    >
                      <CarImage
                        src={car.thumbnail || car.heroImage}
                        alt={`${car.brand} ${car.model}`}
                        manufacturer={car.brand}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0.4rem',
                          left: '0.4rem',
                          zIndex: 2,
                        }}
                      >
                        <span className="badge" style={{ fontSize: '0.62rem', padding: '0.15rem 0.4rem' }}>
                          {car.powertrain.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Vehicle Identity */}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {car.brand} // {car.modelYear}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 800, margin: '2px 0 0.5rem' }}>
                      {car.model} <span style={{ color: 'var(--accent-cyan)' }}>{car.variant}</span>
                    </h3>

                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)', marginBottom: '0.85rem' }}>
                      {formatPrice(car.price, car.currency)}
                    </div>

                    {/* Quick Column Actions */}
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}>
                      <Link
                        to={`/cars/${car.slug || car.id}`}
                        className="btn btn-primary"
                        style={{ flex: 1, fontSize: '0.72rem', padding: '0.45rem 0.6rem', justifyContent: 'center' }}
                      >
                        <span>Details</span>
                        <ArrowRight size={12} />
                      </Link>

                      <button
                        onClick={() => handleOpenReplaceModal(idx)}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.6rem', fontSize: '0.72rem' }}
                        title="Swap with another vehicle"
                      >
                        <RefreshCw size={13} />
                      </button>

                      <button
                        onClick={() => handleRemoveVehicle(idx)}
                        disabled={selectedVehicles.length <= 2}
                        className="btn btn-ghost"
                        style={{
                          padding: '0.45rem 0.6rem',
                          color: selectedVehicles.length <= 2 ? 'var(--text-muted)' : 'var(--accent-red)',
                          cursor: selectedVehicles.length <= 2 ? 'not-allowed' : 'pointer',
                        }}
                        title={selectedVehicles.length <= 2 ? 'Minimum 2 vehicles required' : 'Remove vehicle'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Specification Categories & Rows */}
              {filteredRowsByCategory.map((category) => {
                const isCollapsed = collapsedCategories[category.id] ?? false;

                return (
                  <div key={category.id} style={{ borderBottom: '1px solid var(--border-medium)' }}>
                    {/* Category Accordion Header */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      style={{
                        width: '100%',
                        padding: '1rem 1.75rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ color: 'var(--accent-cyan)' }}>{category.icon}</span>
                        <h3 style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                          {category.title}
                        </h3>
                        <span className="badge" style={{ fontSize: '0.65rem', marginLeft: '0.5rem' }}>
                          {category.rows.length} {category.rows.length === 1 ? 'Metric' : 'Metrics'}
                        </span>
                      </div>

                      <div style={{ color: 'var(--text-secondary)' }}>
                        {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                      </div>
                    </button>

                    {/* Category Rows Table */}
                    {!isCollapsed && (
                      <div>
                        {category.rows.length > 0 ? (
                          category.rows.map((row, rIdx) => {
                            const isDifferent = hasRowDifferences(row, selectedVehicles);
                            const bestIdx = highlightBestValues ? findBestVehicleIndex(row, selectedVehicles) : null;

                            return (
                              <div
                                key={row.id}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: `280px repeat(${colCount}, 1fr)`,
                                  borderBottom: rIdx === category.rows.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                                  backgroundColor: rIdx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                                  transition: 'background-color 0.15s ease',
                                }}
                              >
                                {/* Row Label */}
                                <div
                                  style={{
                                    padding: '1rem 1.5rem',
                                    borderRight: '1px solid var(--border-subtle)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.5rem',
                                  }}
                                >
                                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                    {row.label}
                                  </span>

                                  {isDifferent && showDifferencesOnly && (
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }} />
                                  )}
                                </div>

                                {/* Row Values Across Vehicles */}
                                {selectedVehicles.map((car, cIdx) => {
                                  const formatted = row.formatValue(car);
                                  const isBest = bestIdx === cIdx;
                                  const isNA = formatted === null || formatted === undefined || formatted === 'N/A' || formatted === 'Not verified';

                                  return (
                                    <div
                                      key={`${row.id}-${car.id}`}
                                      style={{
                                        padding: '1rem 1.5rem',
                                        borderRight: cIdx === colCount - 1 ? 'none' : '1px solid var(--border-subtle)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: isBest ? 'rgba(52, 211, 153, 0.08)' : undefined,
                                        position: 'relative',
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: '0.92rem',
                                          fontWeight: isBest ? 700 : 500,
                                          color: isNA
                                            ? 'var(--text-muted)'
                                            : isBest
                                            ? '#34d399'
                                            : '#ffffff',
                                          lineHeight: 1.4,
                                        }}
                                      >
                                        {formatted ?? 'Not available'}
                                      </span>

                                      {isBest && (
                                        <span
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '2px',
                                            backgroundColor: 'rgba(52, 211, 153, 0.2)',
                                            color: '#34d399',
                                            padding: '0.15rem 0.4rem',
                                            borderRadius: '4px',
                                            fontSize: '0.65rem',
                                            fontFamily: 'var(--font-mono)',
                                            fontWeight: 700,
                                            marginLeft: '0.5rem',
                                            flexShrink: 0,
                                          }}
                                          title="Class-leading benchmark in this comparison"
                                        >
                                          <Check size={10} /> BEST
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ padding: '1.25rem 2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            All specifications in this category are identical across compared vehicles (hidden by Differences filter).
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Sourcing & Homologation Audit */}
        <div
          style={{
            marginTop: '3.5rem',
            backgroundColor: 'rgba(12, 16, 23, 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
            <ShieldCheck size={18} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              DATA INTEGRITY & HOMOLOGATION AUDIT
            </h4>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            AutoVerse compares vehicles strictly using official manufacturer homologation datasheets, certified test cycles (WLTP / EPA),
            and independently instrumented track benchmarks. Units and test cycles are preserved to ensure honest, unbiased engineering evaluations.
          </p>
        </div>
      </div>
    </div>
  );
};
