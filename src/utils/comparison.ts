// AutoVerse Stage 4 — Comparison Intelligence & Metric Analysis Engine
import type { Vehicle } from '../types';

export interface ComparisonRow {
  id: string;
  label: string;
  category: 'basic' | 'performance' | 'electric' | 'efficiency' | 'dimensions' | 'interior' | 'safety';
  unit?: string;
  isNumeric?: boolean;
  higherIsBetter?: boolean; // true = higher is best (HP, range, boot), false = lower is best (0-60, weight, price)
  formatValue: (v: Vehicle) => string | number | null;
  getRawNumber?: (v: Vehicle) => number | null;
  appliesToVehicle?: (v: Vehicle) => boolean;
}

export interface DifferenceSummary {
  metric: string;
  leaderBrand: string;
  leaderModel: string;
  leaderValue: string;
  deltaText: string;
}

export const formatPrice = (price?: number, currency = 'USD'): string => {
  if (!price) return 'Not verified';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(price);
};

// Evaluate if all values across vehicles are identical
export const hasRowDifferences = (row: ComparisonRow, vehicles: Vehicle[]): boolean => {
  if (vehicles.length < 2) return false;
  const values = vehicles.map((v) => {
    const val = row.formatValue(v);
    return val === null || val === undefined ? 'N/A' : String(val).trim().toLowerCase();
  });
  const first = values[0];
  return values.some((v) => v !== first);
};

// Find the index of the vehicle with the best value for a given row
export const findBestVehicleIndex = (
  row: ComparisonRow,
  vehicles: Vehicle[]
): number | null => {
  if (!row.isNumeric || row.higherIsBetter === undefined || vehicles.length < 2) {
    return null;
  }

  const numericVals = vehicles.map((v) => {
    if (row.getRawNumber) return row.getRawNumber(v);
    const formatted = row.formatValue(v);
    if (typeof formatted === 'number') return formatted;
    return null;
  });

  const validNumbers = numericVals.filter((n): n is number => n !== null && !isNaN(n));
  if (validNumbers.length < 2) return null;

  // If all valid numbers are equal, no single winner
  const allEqual = validNumbers.every((n) => n === validNumbers[0]);
  if (allEqual) return null;

  let bestVal = row.higherIsBetter ? -Infinity : Infinity;
  let bestIdx: number | null = null;

  numericVals.forEach((val, idx) => {
    if (val !== null) {
      if (row.higherIsBetter ? val > bestVal : val < bestVal) {
        bestVal = val;
        bestIdx = idx;
      }
    }
  });

  return bestIdx;
};

// Generate Executive Key Takeaways summary from selected vehicles
export const generateComparisonSummary = (vehicles: Vehicle[]): DifferenceSummary[] => {
  if (vehicles.length < 2) return [];
  const takeaways: DifferenceSummary[] = [];

  // 1. Acceleration Leader
  const accelVals = vehicles
    .map((v) => ({ v, val: v.accelerationSeconds || v.specs?.acceleration0to60 }))
    .filter((item): item is { v: Vehicle; val: number } => Boolean(item.val && item.val > 0));

  if (accelVals.length >= 2) {
    accelVals.sort((a, b) => a.val - b.val);
    const leader = accelVals[0];
    const second = accelVals[1];
    const diff = (second.val - leader.val).toFixed(2);
    if (parseFloat(diff) > 0.05) {
      takeaways.push({
        metric: 'Quickest Acceleration (0–60 MPH)',
        leaderBrand: leader.v.brand,
        leaderModel: `${leader.v.model} ${leader.v.variant}`,
        leaderValue: `${leader.val}s`,
        deltaText: `${diff}s quicker than next competitor`,
      });
    }
  }

  // 2. Power Leader
  const powerVals = vehicles
    .map((v) => ({ v, val: v.horsepower || v.specs?.horsepower }))
    .filter((item): item is { v: Vehicle; val: number } => Boolean(item.val && item.val > 0));

  if (powerVals.length >= 2) {
    powerVals.sort((a, b) => b.val - a.val);
    const leader = powerVals[0];
    const second = powerVals[1];
    const diff = leader.val - second.val;
    if (diff >= 20) {
      takeaways.push({
        metric: 'Peak Power Output',
        leaderBrand: leader.v.brand,
        leaderModel: `${leader.v.model} ${leader.v.variant}`,
        leaderValue: `${leader.val.toLocaleString()} HP`,
        deltaText: `+${diff.toLocaleString()} HP advantage`,
      });
    }
  }

  // 3. Electric Range Leader (if any EVs)
  const rangeVals = vehicles
    .map((v) => ({ v, val: v.electricRangeMiles || v.specs?.electricRangeMiles || v.efficiencyDetails?.ratedRangeMiles }))
    .filter((item): item is { v: Vehicle; val: number } => Boolean(item.val && item.val > 0));

  if (rangeVals.length >= 2) {
    rangeVals.sort((a, b) => b.val - a.val);
    const leader = rangeVals[0];
    const second = rangeVals[1];
    const diff = leader.val - second.val;
    if (diff >= 10) {
      takeaways.push({
        metric: 'Longest Electric Driving Range',
        leaderBrand: leader.v.brand,
        leaderModel: `${leader.v.model} ${leader.v.variant}`,
        leaderValue: `${leader.val} Miles`,
        deltaText: `+${diff} miles additional cruising range`,
      });
    }
  }

  // 4. Cargo / Practicality Leader
  const cargoVals = vehicles
    .map((v) => ({
      v,
      val: (v.interiorDetails?.cargoCapacityLiters || 0) + (v.interiorDetails?.frunkCapacityLiters || 0),
    }))
    .filter((item): item is { v: Vehicle; val: number } => item.val > 0);

  if (cargoVals.length >= 2) {
    cargoVals.sort((a, b) => b.val - a.val);
    const leader = cargoVals[0];
    const second = cargoVals[1];
    const diff = leader.val - second.val;
    if (diff >= 50) {
      takeaways.push({
        metric: 'Maximum Total Cargo Volume',
        leaderBrand: leader.v.brand,
        leaderModel: `${leader.v.model} ${leader.v.variant}`,
        leaderValue: `${leader.val} Liters`,
        deltaText: `+${diff} L more total luggage capacity`,
      });
    }
  }

  return takeaways;
};
