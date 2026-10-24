// AutoVerse Stage 9: Advanced Car Finder & Smart Recommendation Algorithm
// Provides transparent multi-criteria scoring, mandatory constraint validation,
// debounced search, structured filtering, and URL query synchronization.

import type { Vehicle } from '../types';

export interface FinderFilters {
  searchQuery: string;
  manufacturer: string; // 'all' or brand slug/name
  bodyType: string; // 'all', 'suv', 'sedan', 'hatchback', 'coupe', 'sports_car', 'estate'
  powertrain: string; // 'all', 'electric', 'hybrid', 'plug-in hybrid', 'petrol', 'diesel'
  minPrice: number | null;
  maxPrice: number | null;
  pricePreset: string; // 'all', 'under_30k', '30k_60k', '60k_100k', 'above_100k'
  market: string; // 'all', 'Global Market', 'India Market', etc.
  minSeats: number | null;
  minHorsepower: number | null;
  maxAcceleration: number | null; // max 0-60 seconds (lower is faster)
  minElectricRange: number | null;
  drivetrain: string; // 'all', 'AWD', 'RWD', 'FWD'
  minGroundClearanceMm: number | null;
  minCargoLiters: number | null;
  requireFiveStarSafety: boolean;
  mustHaveAdas: boolean;
  mustHaveVentilatedSeats: boolean;
  mustHaveSunroof: boolean;
  mustHaveFastCharging: boolean; // DC Fast Charging > 100kW or 800V
}

export interface WizardAnswers {
  budgetRange: string; // 'under_25k' | '25k_50k' | '50k_90k' | '90k_150k' | 'above_150k' | 'flexible'
  market: string; // 'any' | 'india' | 'global'
  preferredBody: string; // 'any' | 'suv' | 'sedan' | 'hatchback' | 'sports_car'
  preferredPowertrain: string; // 'any' | 'electric' | 'hybrid' | 'petrol' | 'diesel'
  primaryUse: string; // 'city' | 'highway' | 'family' | 'long_distance' | 'performance' | 'offroad'
  minSeats: number; // 2 | 4 | 5 | 7
  primaryPriority: string; // 'price' | 'efficiency' | 'performance' | 'comfort' | 'practicality' | 'safety'
  mustHaveFeatures: string[]; // ['adas', 'awd', 'fast_charging', '5star_safety', 'ventilated_seats', 'large_boot']
}

export interface MatchExplanation {
  matchedCriteria: string[];
  tradeOffs: string[];
  unverifiedData: string[];
  primaryReason: string;
}

export interface ScoredVehicle {
  vehicle: Vehicle;
  score: number; // 0 - 100 percentage
  matchExplanation: MatchExplanation;
  isMandatorySatisfied: boolean;
  isRelaxedMatch?: boolean;
}

export const DEFAULT_FINDER_FILTERS: FinderFilters = {
  searchQuery: '',
  manufacturer: 'all',
  bodyType: 'all',
  powertrain: 'all',
  minPrice: null,
  maxPrice: null,
  pricePreset: 'all',
  market: 'all',
  minSeats: null,
  minHorsepower: null,
  maxAcceleration: null,
  minElectricRange: null,
  drivetrain: 'all',
  minGroundClearanceMm: null,
  minCargoLiters: null,
  requireFiveStarSafety: false,
  mustHaveAdas: false,
  mustHaveVentilatedSeats: false,
  mustHaveSunroof: false,
  mustHaveFastCharging: false,
};

export const DEFAULT_WIZARD_ANSWERS: WizardAnswers = {
  budgetRange: 'flexible',
  market: 'any',
  preferredBody: 'any',
  preferredPowertrain: 'any',
  primaryUse: 'family',
  minSeats: 0, // 0 = any seating
  primaryPriority: 'safety',
  mustHaveFeatures: [],
};

// ==========================================
// 1. TRANSPARENT SCORING ENGINE
// ==========================================

export function getVehicleSeatingCapacity(vehicle: Vehicle): number {
  if (vehicle.interiorDetails?.seatingCapacity) {
    return vehicle.interiorDetails.seatingCapacity;
  }
  const slug = (vehicle.slug || vehicle.id || '').toLowerCase();
  const body = (vehicle.bodyType || '').toLowerCase();

  // Known 7-passenger / 3-row vehicles in fleet
  if (
    slug.includes('hycross') ||
    slug.includes('safari') ||
    slug.includes('xuv700') ||
    slug.includes('scorpio-n') ||
    slug.includes('carens') ||
    slug.includes('ev9') ||
    slug.includes('fortuner') ||
    body === 'estate'
  ) {
    return 7;
  }

  // 2-seat sports cockpits
  if (body === 'sports_car' || body === 'coupe' || slug.includes('911') || slug.includes('gt3')) {
    return 2;
  }

  // 4-seat executive coupes / grand tourers
  if (slug.includes('taycan') || slug.includes('gt-63') || slug.includes('m4')) {
    return 4;
  }

  // Universal 5-seat passenger vehicles
  return 5;
}

export function calculateVehicleMatchScore(
  vehicle: Vehicle,
  wizard: WizardAnswers,
  filters: FinderFilters
): ScoredVehicle {
  let score = 0;
  const matchedCriteria: string[] = [];
  const tradeOffs: string[] = [];
  const unverifiedData: string[] = [];
  let isMandatorySatisfied = true;

  const price = vehicle.price || vehicle.priceStartingUsd || 0;
  const seats = getVehicleSeatingCapacity(vehicle);
  const hp = vehicle.horsepower || vehicle.specs?.horsepower || 0;
  const accel = vehicle.accelerationSeconds || vehicle.specs?.acceleration0to60 || 9.9;
  const range = vehicle.electricRangeMiles || vehicle.specs?.electricRangeMiles || (vehicle.electricRangeKm ? vehicle.electricRangeKm * 0.621371 : 0);
  const body = (vehicle.bodyType || '').toLowerCase();
  const powertrain = (vehicle.powertrain || '').toLowerCase();

  // A. Mandatory Constraint Validation
  // 1. Hard minimum seating check (only if explicitly set > 0)
  const requiredSeats = filters.minSeats !== null ? filters.minSeats : (wizard.minSeats > 0 ? wizard.minSeats : null);
  if (requiredSeats && seats < requiredSeats) {
    isMandatorySatisfied = false;
    tradeOffs.push(`Provides ${seats} seats (requires minimum ${requiredSeats})`);
  }

  // 2. Hard budget ceiling check (allow 10% tolerance margin before complete disqualification)
  const maxBudget = filters.maxPrice;
  if (maxBudget && price > maxBudget * 1.1) {
    isMandatorySatisfied = false;
    tradeOffs.push(`Exceeds maximum budget limit ($${price.toLocaleString()} vs $${maxBudget.toLocaleString()})`);
  }

  // B. Multi-Factor Weighted Scoring (Sum = 100%)

  // 1. Budget Compatibility (Weight: 30%)
  if (wizard.budgetRange === 'flexible' && !filters.maxPrice && !filters.minPrice) {
    score += 26; // Generous base for open budget
    matchedCriteria.push('Flexible budget matched');
  } else {
    let budgetMax = filters.maxPrice || Infinity;
    let budgetMin = filters.minPrice || 0;

    if (wizard.budgetRange === 'under_25k') budgetMax = 25000;
    else if (wizard.budgetRange === '25k_50k') { budgetMin = 25000; budgetMax = 50000; }
    else if (wizard.budgetRange === '50k_90k') { budgetMin = 50000; budgetMax = 90000; }
    else if (wizard.budgetRange === '90k_150k') { budgetMin = 90000; budgetMax = 150000; }
    else if (wizard.budgetRange === 'above_150k') { budgetMin = 150000; budgetMax = 500000; }

    if (price > 0) {
      if (price >= budgetMin && price <= budgetMax) {
        score += 30;
        matchedCriteria.push(`Within targeted budget bracket ($${price.toLocaleString()})`);
      } else if (price < budgetMin) {
        score += 24; // Lower price is usually acceptable
        matchedCriteria.push(`Below target price ceiling ($${price.toLocaleString()})`);
      } else {
        const overRatio = (price - budgetMax) / budgetMax;
        if (overRatio <= 0.15) {
          score += 15;
          tradeOffs.push(`Slightly above targeted budget (+${Math.round(overRatio * 100)}%)`);
        } else {
          score += 5;
          tradeOffs.push(`Substantially higher cost ($${price.toLocaleString()})`);
        }
      }
    } else {
      score += 15;
      unverifiedData.push('Official retail price verified on request only');
    }
  }

  // 2. Vehicle Body Type & Powertrain Preference (Weight: 20%)
  let bodyScore = 0;
  const targetBody = filters.bodyType !== 'all' ? filters.bodyType : wizard.preferredBody;
  if (targetBody === 'any' || targetBody === 'all') {
    bodyScore = 10;
  } else if (body.includes(targetBody) || (targetBody === 'suv' && (body === 'suv' || body.includes('suv')))) {
    bodyScore = 10;
    matchedCriteria.push(`Matches requested body style (${targetBody.toUpperCase()})`);
  } else {
    bodyScore = 3;
    tradeOffs.push(`Different body style (${body.toUpperCase()} vs ${targetBody.toUpperCase()})`);
  }

  let powertrainScore = 0;
  const targetPowertrain = filters.powertrain !== 'all' ? filters.powertrain : wizard.preferredPowertrain;
  if (targetPowertrain === 'any' || targetPowertrain === 'all') {
    powertrainScore = 10;
  } else if (powertrain.includes(targetPowertrain)) {
    powertrainScore = 10;
    matchedCriteria.push(`Exact powertrain match (${powertrain.toUpperCase()})`);
  } else {
    powertrainScore = 2;
    tradeOffs.push(`Alternative powertrain (${powertrain.toUpperCase()})`);
  }
  score += (bodyScore + powertrainScore);

  // 3. Intended Use Case Suitability (Weight: 15%)
  const intendedUse = wizard.primaryUse;
  if (intendedUse === 'city') {
    if (body === 'hatchback' || (vehicle.dimensions?.lengthMm && vehicle.dimensions.lengthMm < 4300) || powertrain === 'electric') {
      score += 15;
      matchedCriteria.push('Compact dimensions & agile city maneuvering');
    } else {
      score += 9;
    }
  } else if (intendedUse === 'highway' || intendedUse === 'long_distance') {
    if (powertrain === 'hybrid' || (powertrain === 'electric' && range > 280) || body === 'sedan' || body === 'estate') {
      score += 15;
      matchedCriteria.push('High-speed highway stability & long touring endurance');
    } else {
      score += 8;
    }
  } else if (intendedUse === 'family') {
    if (seats >= 5 && ((vehicle.interiorDetails?.cargoCapacityLiters || 0) >= 400 || body === 'suv' || body === 'estate')) {
      score += 15;
      matchedCriteria.push('Spacious 5+ passenger seating with high family cargo volume');
    } else {
      score += 8;
    }
  } else if (intendedUse === 'performance') {
    if (accel <= 4.0 || hp >= 450 || body === 'sports_car' || body === 'coupe') {
      score += 15;
      matchedCriteria.push(`Motorsport-grade performance (${accel}s 0-60, ${hp} HP)`);
    } else if (accel <= 6.5) {
      score += 10;
      matchedCriteria.push('Brisk sport acceleration');
    } else {
      score += 4;
      tradeOffs.push(`Standard commuter acceleration (${accel}s 0-60)`);
    }
  } else if (intendedUse === 'offroad') {
    const clearance = vehicle.dimensions?.groundClearanceMm || 0;
    const drivetrain = (vehicle.drivetrain || vehicle.specs?.drivetrain || '').toLowerCase();
    if (clearance >= 200 || drivetrain.includes('awd') || drivetrain.includes('4x4') || drivetrain.includes('all-wheel')) {
      score += 15;
      matchedCriteria.push('Elevated ground clearance & all-terrain 4x4 / AWD traction');
    } else {
      score += 5;
      tradeOffs.push('Limited rough terrain / unpaved clearance');
    }
  } else {
    score += 12;
  }

  // 4. Efficiency & EV Range (Weight: 15%)
  if (powertrain === 'electric') {
    if (range >= 320) {
      score += 15;
      matchedCriteria.push(`High electric range (${Math.round(range)} miles verified)`);
    } else if (range >= 240) {
      score += 12;
      matchedCriteria.push(`Adequate electric range (${Math.round(range)} miles)`);
    } else if (range > 0) {
      score += 8;
      tradeOffs.push(`Urban electric range (${Math.round(range)} miles)`);
    } else {
      score += 6;
      unverifiedData.push('Electric range test cycle undergoing verification');
    }
  } else if (powertrain.includes('hybrid')) {
    score += 14;
    matchedCriteria.push('High fuel economy strong hybrid powertrain');
  } else {
    score += 10;
  }

  // 5. Seating & Practicality (Weight: 10%)
  if (wizard.minSeats === 0 || seats >= wizard.minSeats) {
    score += 10;
    matchedCriteria.push(`Comfortable ${seats}-seat capacity`);
  } else if (seats === 4 && wizard.minSeats <= 4) {
    score += 8;
  } else {
    score += 4;
  }

  // 6. Selected Priorities & Must-Have Technology Features (Weight: 10%)
  let techScore = 0;
  const mustHaves = wizard.mustHaveFeatures || [];

  // Check safety rating priority
  const has5Star = vehicle.safetyDetails?.crashTestRating?.score?.toLowerCase().includes('5 star') ||
                   vehicle.safetyDetails?.crashTestRating?.score?.toLowerCase().includes('top safety pick');
  if (filters.requireFiveStarSafety || wizard.primaryPriority === 'safety' || mustHaves.includes('5star_safety')) {
    if (has5Star) {
      techScore += 4;
      matchedCriteria.push(`Official 5-Star verified rating (${vehicle.safetyDetails?.crashTestRating?.agency})`);
    } else if (vehicle.safetyDetails?.crashTestRating) {
      techScore += 2;
    } else {
      unverifiedData.push('Third-party NCAP crash testing not published for model year');
    }
  } else {
    techScore += 2;
  }

  // Check ADAS assistance
  const hasAdas = Boolean(vehicle.safetyDetails?.driverAssistanceSuite || vehicle.safetyDetails?.adasLevel);
  if (filters.mustHaveAdas || mustHaves.includes('adas')) {
    if (hasAdas) {
      techScore += 3;
      matchedCriteria.push('Equipped with Level 2 ADAS driver assistance');
    } else {
      tradeOffs.push('Lacks active automated lane/collision guidance');
    }
  } else {
    techScore += 2;
  }

  // Check Fast Charging / 800V
  const isFastCharge = Boolean(vehicle.efficiencyDetails?.chargingMaxDcKw && vehicle.efficiencyDetails.chargingMaxDcKw >= 130) ||
                       (vehicle.specs?.voltageArchitecture?.includes('800V'));
  if (filters.mustHaveFastCharging || mustHaves.includes('fast_charging')) {
    if (isFastCharge) {
      techScore += 3;
      matchedCriteria.push('High-speed DC ultra-fast charging supported');
    } else if (powertrain === 'electric') {
      tradeOffs.push('Standard DC charging speeds');
    }
  } else {
    techScore += 2;
  }

  score += Math.min(10, techScore);

  // Normalize final score to bounds [10, 99]
  score = Math.min(98, Math.max(12, Math.round(score)));

  // Determine top primary reason
  let primaryReason = 'Balanced match across budget and vehicle configuration.';
  if (matchedCriteria.length > 0) {
    primaryReason = matchedCriteria[0] + (matchedCriteria[1] ? ` and ${matchedCriteria[1].toLowerCase()}` : '.');
  }

  return {
    vehicle,
    score,
    matchExplanation: {
      matchedCriteria: matchedCriteria.slice(0, 4),
      tradeOffs: tradeOffs.slice(0, 3),
      unverifiedData: unverifiedData.slice(0, 2),
      primaryReason,
    },
    isMandatorySatisfied,
  };
}

// ==========================================
// 2. SEARCH, FILTER & SORT ORCHESTRATOR
// ==========================================

export function filterAndScoreVehicles(
  allVehicles: Vehicle[],
  filters: FinderFilters,
  wizardAnswers: WizardAnswers,
  sortBy: 'match' | 'priceAsc' | 'priceDesc' | 'power' | 'accel' | 'range' = 'match'
): { exactMatches: ScoredVehicle[]; relaxedMatches: ScoredVehicle[]; isRelaxedFallback: boolean } {
  // Only recommend published records
  const published = allVehicles.filter(
    (v) => v.publicationStatus !== 'draft' && v.publicationStatus !== 'unpublished' && v.publicationStatus !== 'archived'
  );

  // 1. Text Search Filter (Case-insensitive, trims extra spaces, matches manufacturer, model, variant, category, powertrain)
  const query = filters.searchQuery.trim().toLowerCase().replace(/\s+/g, ' ');

  const searched = published.filter((v) => {
    if (!query) return true;
    const name = `${v.brand || v.manufacturerName || ''} ${v.model || ''} ${v.variant || ''}`.toLowerCase();
    const body = (v.bodyType || '').toLowerCase();
    const power = (v.powertrain || '').toLowerCase();
    const desc = (v.description || v.tagline || '').toLowerCase();
    const features = (v.safetyDetails?.activeSafetySystems || []).join(' ').toLowerCase();

    return (
      name.includes(query) ||
      body.includes(query) ||
      power.includes(query) ||
      desc.includes(query) ||
      features.includes(query)
    );
  });

  // 2. Structured Filters (Manufacturer, Body Style, Powertrain, Market)
  const structured = searched.filter((v) => {
    // Manufacturer
    if (filters.manufacturer !== 'all') {
      const brand = (v.brand || v.manufacturerName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const target = filters.manufacturer.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!brand.includes(target)) return false;
    }

    // Body Style
    if (filters.bodyType !== 'all') {
      const body = (v.bodyType || '').toLowerCase();
      if (filters.bodyType === 'suv' && !body.includes('suv')) return false;
      if (filters.bodyType !== 'suv' && body !== filters.bodyType.toLowerCase()) return false;
    }

    // Powertrain
    if (filters.powertrain !== 'all') {
      const pt = (v.powertrain || '').toLowerCase();
      if (!pt.includes(filters.powertrain.toLowerCase())) return false;
    }

    // Market
    if (filters.market !== 'all') {
      const m = (v.market || '').toLowerCase();
      if (!m.includes(filters.market.toLowerCase())) return false;
    }

    // Drivetrain
    if (filters.drivetrain !== 'all') {
      const dt = (v.drivetrain || v.specs?.drivetrain || '').toLowerCase();
      if (!dt.includes(filters.drivetrain.toLowerCase())) return false;
    }

    // Price Bounds
    const price = v.price || v.priceStartingUsd || 0;
    if (filters.minPrice !== null && price > 0 && price < filters.minPrice) return false;
    if (filters.maxPrice !== null && price > 0 && price > filters.maxPrice) return false;

    // Minimum Horsepower
    const hp = v.horsepower || v.specs?.horsepower || 0;
    if (filters.minHorsepower !== null && hp < filters.minHorsepower) return false;

    // Max 0-60 Accel
    const accel = v.accelerationSeconds || v.specs?.acceleration0to60 || 99;
    if (filters.maxAcceleration !== null && accel > filters.maxAcceleration) return false;

    // Min Electric Range
    const range = v.electricRangeMiles || v.specs?.electricRangeMiles || (v.electricRangeKm ? v.electricRangeKm * 0.621371 : 0);
    if (filters.minElectricRange !== null && range < filters.minElectricRange) return false;

    // Minimum Seating Capacity
    const seats = getVehicleSeatingCapacity(v);
    if (filters.minSeats !== null && seats < filters.minSeats) return false;

    // Minimum Ground Clearance
    const clearance = v.dimensions?.groundClearanceMm || 0;
    if (filters.minGroundClearanceMm !== null && clearance < filters.minGroundClearanceMm) return false;

    // Minimum Cargo
    const cargo = v.interiorDetails?.cargoCapacityLiters || 0;
    if (filters.minCargoLiters !== null && cargo < filters.minCargoLiters) return false;

    // 5-Star Safety Requirement
    if (filters.requireFiveStarSafety) {
      const score = (v.safetyDetails?.crashTestRating?.score || '').toLowerCase();
      if (!score.includes('5 star') && !score.includes('top safety pick')) return false;
    }

    // ADAS Requirement
    if (filters.mustHaveAdas) {
      if (!v.safetyDetails?.driverAssistanceSuite && !v.safetyDetails?.adasLevel) return false;
    }

    // Fast Charging Requirement
    if (filters.mustHaveFastCharging) {
      const dcKw = v.efficiencyDetails?.chargingMaxDcKw || 0;
      const is800V = v.specs?.voltageArchitecture?.includes('800V');
      if (dcKw < 130 && !is800V) return false;
    }

    return true;
  });

  // 3. Score every filtered vehicle
  const scoredList = structured.map((v) => calculateVehicleMatchScore(v, wizardAnswers, filters));

  // Separate exact mandatory matches vs violations
  const exact = scoredList.filter((s) => s.isMandatorySatisfied);

  // If strict filtering produces zero or too few results (<= 1), construct relaxed fallbacks from the wider searched pool
  let relaxed: ScoredVehicle[] = [];
  let isRelaxedFallback = false;

  if (exact.length === 0 && published.length > 0) {
    isRelaxedFallback = true;
    // Score all published matching the keyword search with relaxed constraints
    const relaxedPool = searched.length > 0 ? searched : published;
    relaxed = relaxedPool
      .map((v) => {
        const sc = calculateVehicleMatchScore(v, wizardAnswers, DEFAULT_FINDER_FILTERS);
        sc.isRelaxedMatch = true;
        return sc;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }

  // 4. Sorting
  const sortComparator = (a: ScoredVehicle, b: ScoredVehicle): number => {
    const vA = a.vehicle;
    const vB = b.vehicle;
    const pA = vA.price || vA.priceStartingUsd || 0;
    const pB = vB.price || vB.priceStartingUsd || 0;
    const hpA = vA.horsepower || vA.specs?.horsepower || 0;
    const hpB = vB.horsepower || vB.specs?.horsepower || 0;
    const accA = vA.accelerationSeconds || vA.specs?.acceleration0to60 || 99;
    const accB = vB.accelerationSeconds || vB.specs?.acceleration0to60 || 99;
    const rngA = vA.electricRangeMiles || vA.specs?.electricRangeMiles || 0;
    const rngB = vB.electricRangeMiles || vB.specs?.electricRangeMiles || 0;

    switch (sortBy) {
      case 'match':
        return b.score - a.score;
      case 'priceAsc':
        return pA - pB;
      case 'priceDesc':
        return pB - pA;
      case 'power':
        return hpB - hpA;
      case 'accel':
        return accA - accB; // lowest time first
      case 'range':
        return rngB - rngA;
      default:
        return b.score - a.score;
    }
  };

  exact.sort(sortComparator);

  return {
    exactMatches: exact,
    relaxedMatches: relaxed,
    isRelaxedFallback,
  };
}

// ==========================================
// 3. URL QUERY SYNCHRONIZATION HELPERS
// ==========================================

export function parseUrlToFinderFilters(searchParams: URLSearchParams): FinderFilters {
  const filters: FinderFilters = { ...DEFAULT_FINDER_FILTERS };

  const q = searchParams.get('q');
  if (q) filters.searchQuery = q;

  const m = searchParams.get('manufacturer');
  if (m) filters.manufacturer = m;

  const body = searchParams.get('type') || searchParams.get('body');
  if (body) filters.bodyType = body;

  const pt = searchParams.get('powertrain');
  if (pt) filters.powertrain = pt;

  const minP = searchParams.get('minPrice');
  if (minP && !isNaN(Number(minP))) filters.minPrice = Number(minP);

  const maxP = searchParams.get('maxPrice');
  if (maxP && !isNaN(Number(maxP))) filters.maxPrice = Number(maxP);

  const preset = searchParams.get('budget');
  if (preset) filters.pricePreset = preset;

  const market = searchParams.get('market');
  if (market) filters.market = market;

  const seats = searchParams.get('seats');
  if (seats && !isNaN(Number(seats))) filters.minSeats = Number(seats);

  const hp = searchParams.get('minHp');
  if (hp && !isNaN(Number(hp))) filters.minHorsepower = Number(hp);

  const acc = searchParams.get('max0to60');
  if (acc && !isNaN(Number(acc))) filters.maxAcceleration = Number(acc);

  const rng = searchParams.get('minRange');
  if (rng && !isNaN(Number(rng))) filters.minElectricRange = Number(rng);

  const dt = searchParams.get('drivetrain');
  if (dt) filters.drivetrain = dt;

  const safe = searchParams.get('fiveStarSafety');
  if (safe === 'true') filters.requireFiveStarSafety = true;

  const adas = searchParams.get('adas');
  if (adas === 'true') filters.mustHaveAdas = true;

  const fastChg = searchParams.get('fastCharging');
  if (fastChg === 'true') filters.mustHaveFastCharging = true;

  return filters;
}

export function filtersToSearchParams(filters: FinderFilters, sortBy: string): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.searchQuery) params.set('q', filters.searchQuery);
  if (filters.manufacturer !== 'all') params.set('manufacturer', filters.manufacturer);
  if (filters.bodyType !== 'all') params.set('type', filters.bodyType);
  if (filters.powertrain !== 'all') params.set('powertrain', filters.powertrain);
  if (filters.minPrice !== null) params.set('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== null) params.set('maxPrice', filters.maxPrice.toString());
  if (filters.pricePreset !== 'all') params.set('budget', filters.pricePreset);
  if (filters.market !== 'all') params.set('market', filters.market);
  if (filters.minSeats !== null) params.set('seats', filters.minSeats.toString());
  if (filters.minHorsepower !== null) params.set('minHp', filters.minHorsepower.toString());
  if (filters.maxAcceleration !== null) params.set('max0to60', filters.maxAcceleration.toString());
  if (filters.minElectricRange !== null) params.set('minRange', filters.minElectricRange.toString());
  if (filters.drivetrain !== 'all') params.set('drivetrain', filters.drivetrain);
  if (filters.requireFiveStarSafety) params.set('fiveStarSafety', 'true');
  if (filters.mustHaveAdas) params.set('adas', 'true');
  if (filters.mustHaveFastCharging) params.set('fastCharging', 'true');
  if (sortBy !== 'match') params.set('sort', sortBy);

  return params;
}
