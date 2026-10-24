// AutoVerse Stage 16: EV Vehicle Profile Adapter & Charging Dynamics
// Extracts verified EV specifications from the catalog, derives honest conservative baselines,
// models non-linear charging taper curves, and calculates effective real-world range adjustments.

import { VEHICLES } from '../data/vehicles';
import type { Vehicle } from '../types';
import type { EvVehicleProfile, ChargingPlugType, DrivingPreference } from '../types/tripPlanner';

/**
 * Maps raw vehicle record to a normalized EV profile
 */
export function buildEvProfile(vehicle: Vehicle): EvVehicleProfile {
  const isEv = vehicle.powertrain === 'electric' || vehicle.category === 'electric';
  const missingFields: string[] = [];

  // 1. Battery Capacity
  let usableBatteryKwh = vehicle.efficiencyDetails?.batteryUsableKwh;
  const grossBatteryKwh = vehicle.batteryCapacityKWh || vehicle.efficiencyDetails?.batteryGrossKwh;

  if (!usableBatteryKwh) {
    if (grossBatteryKwh) {
      usableBatteryKwh = Math.round(grossBatteryKwh * 0.94 * 10) / 10; // ~94% typical usable buffer
      missingFields.push('batteryUsableKwh (derived from gross)');
    } else {
      usableBatteryKwh = 60; // conservative default fallback
      missingFields.push('batteryCapacity (defaulted to 60 kWh)');
    }
  }

  // 2. Range & Test Cycle
  let publishedRangeKm = vehicle.electricRangeKm || vehicle.efficiencyDetails?.ratedRangeKm;
  if (!publishedRangeKm && vehicle.electricRangeMiles) {
    publishedRangeKm = Math.round(vehicle.electricRangeMiles * 1.60934);
  }
  if (!publishedRangeKm) {
    publishedRangeKm = 400; // baseline fallback
    missingFields.push('electricRangeKm (defaulted to 400 km)');
  }

  const testCycle = vehicle.efficiencyDetails?.rangeTestCycle || vehicle.specs?.verifiedSource?.includes('EPA') ? 'EPA' : 'WLTP';

  // 3. Efficiency (kWh / 100 km)
  let efficiencyKwh100km = vehicle.efficiencyDetails?.energyConsumptionKwh100Km;
  if (!efficiencyKwh100km) {
    // Derive mathematically: (Usable kWh / Range km) * 100
    efficiencyKwh100km = Math.round(((usableBatteryKwh / publishedRangeKm) * 100) * 10) / 10;
    missingFields.push('energyConsumptionKwh100km (mathematically derived from range)');
  }

  // 4. Charging Speeds
  let chargingMaxDcKw = vehicle.efficiencyDetails?.chargingMaxDcKw;
  if (!chargingMaxDcKw) {
    if (vehicle.specs?.voltageArchitecture?.includes('800V')) {
      chargingMaxDcKw = 270;
    } else if (vehicle.slug.includes('tesla')) {
      chargingMaxDcKw = 250;
    } else if (vehicle.slug.includes('tata') || vehicle.slug.includes('mahindra')) {
      chargingMaxDcKw = 60;
    } else {
      chargingMaxDcKw = 100;
    }
    missingFields.push('chargingMaxDcKw (derived from platform tier)');
  }

  let chargingMaxAcKw = vehicle.efficiencyDetails?.chargingMaxAcKw;
  if (!chargingMaxAcKw) {
    chargingMaxAcKw = 11; // 11 kW 3-phase AC standard
  }

  // 5. Connectors
  const supportedConnectors: ChargingPlugType[] = ['CCS2', 'Type 2'];
  if (vehicle.brand.toLowerCase() === 'tesla') {
    supportedConnectors.push('NACS');
  }

  // 6. Voltage Architecture
  const voltageArchitecture = vehicle.specs?.voltageArchitecture || (chargingMaxDcKw > 200 ? '800V Ultra-Fast' : '400V Standard');

  return {
    id: vehicle.id,
    slug: vehicle.slug,
    name: `${vehicle.brand} ${vehicle.model}`,
    brand: vehicle.brand,
    variant: vehicle.variant || 'Standard',
    usableBatteryKwh,
    grossBatteryKwh,
    publishedRangeKm,
    testCycle,
    efficiencyKwh100km,
    chargingMaxDcKw,
    chargingMaxAcKw,
    supportedConnectors,
    voltageArchitecture,
    chargingCurveTaperSoC: voltageArchitecture.includes('800V') ? 80 : 70,
    isSpecificationVerified: isEv && missingFields.length === 0,
    missingFields,
  };
}

/**
 * Returns all electric vehicles in the AutoVerse catalog as EV profiles
 */
export function getAllEvProfiles(): EvVehicleProfile[] {
  return VEHICLES.filter((v) => v.powertrain === 'electric' || v.category === 'electric').map(buildEvProfile);
}

/**
 * Retrieves EV profile by slug
 */
export function getEvProfileBySlug(slug: string): EvVehicleProfile | null {
  const v = VEHICLES.find((item) => item.slug === slug || item.id === slug);
  if (!v) return null;
  return buildEvProfile(v);
}

/**
 * Gets default flagship EV profile (Porsche Taycan Turbo S)
 */
export function getDefaultEvProfile(): EvVehicleProfile {
  const taycan = getEvProfileBySlug('porsche-taycan-turbo-s');
  if (taycan) return taycan;
  const all = getAllEvProfiles();
  return all[0] || {
    id: 'porsche-taycan-turbo-s',
    slug: 'porsche-taycan-turbo-s',
    name: 'Porsche Taycan',
    brand: 'Porsche',
    variant: 'Turbo S',
    usableBatteryKwh: 97,
    grossBatteryKwh: 105,
    publishedRangeKm: 590,
    testCycle: 'WLTP',
    efficiencyKwh100km: 17.9,
    chargingMaxDcKw: 320,
    chargingMaxAcKw: 22,
    supportedConnectors: ['CCS2', 'Type 2'],
    voltageArchitecture: '800V Ultra-Fast Architecture',
    chargingCurveTaperSoC: 80,
    isSpecificationVerified: true,
    missingFields: [],
  };
}

/**
 * Computes effective range accounting for ambient temperature and driving style
 */
export function getEffectiveRangeKm(
  profile: EvVehicleProfile,
  ambientTempC: number = 25,
  preference: DrivingPreference = 'balanced'
): number {
  let factor = 1.0;

  // Temperature penalty: Batteries lose efficiency below 15°C and above 38°C
  if (ambientTempC < 0) {
    factor *= 0.80; // 20% loss in sub-zero freezing
  } else if (ambientTempC < 15) {
    factor *= 0.90; // 10% loss in chilly weather
  } else if (ambientTempC > 38) {
    factor *= 0.92; // 8% loss in extreme heat due to AC cabin draw
  }

  // Driving style adjustments
  if (preference === 'fast') {
    factor *= 0.85; // sustained high speeds (120+ km/h) penalize aero
  } else if (preference === 'max_range') {
    factor *= 1.08; // hypermiling / steady 80-90 km/h cruising
  }

  return Math.round(profile.publishedRangeKm * factor);
}

/**
 * Realistic non-linear charging duration estimation based on DC taper curves
 * Returns duration in minutes
 */
export function estimateChargingDuration(
  profile: EvVehicleProfile,
  chargerPowerKw: number,
  startSoC: number,
  endSoC: number
): number {
  if (startSoC >= endSoC) return 0;

  const maxAllowedPower = Math.min(chargerPowerKw, profile.chargingMaxDcKw);
  const totalBatteryKwh = profile.usableBatteryKwh;
  const energyNeededKwh = ((endSoC - startSoC) / 100) * totalBatteryKwh;

  // Segmented non-linear charging speed simulation:
  // Phase 1 (10% - 70%): Peak rate (~95% efficiency)
  // Phase 2 (70% - 80%): Slight taper (~70% peak)
  // Phase 3 (80% - 90%): Heavy taper (~40% peak)
  // Phase 4 (90% - 100%): Trickle cell balancing (~18% peak)

  let weightedEffectiveKw = maxAllowedPower;
  if (endSoC > 80) {
    if (startSoC >= 80) {
      weightedEffectiveKw = maxAllowedPower * 0.35;
    } else {
      weightedEffectiveKw = maxAllowedPower * 0.65;
    }
  } else if (endSoC > 70) {
    weightedEffectiveKw = maxAllowedPower * 0.85;
  } else {
    weightedEffectiveKw = maxAllowedPower * 0.95;
  }

  // Ensure minimum realistic floor
  weightedEffectiveKw = Math.max(12, weightedEffectiveKw);

  // Time in hours = kWh / kW, converted to minutes + 2 min handshake buffer
  const durationMinutes = (energyNeededKwh / weightedEffectiveKw) * 60 + 2;
  return Math.max(5, Math.round(durationMinutes));
}
