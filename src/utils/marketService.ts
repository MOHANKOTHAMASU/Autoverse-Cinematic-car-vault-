// AutoVerse Stage 18: Market Intelligence & Price Analytics Engine
// Deterministic calculations, compatibility guards, CSV injection protection, and market aggregates

import type {
  VehiclePriceRecord,
  PriceChangeEvent,
  LaunchVsCurrentAnalysis,
  MarketSegmentAnalytics,
  ManufacturerAnalytics,
  EvVsIceComparison,
  CsvImportPreview,
} from '../types/market';
import type { CurrencyCode } from '../types/calculator';
import type { PowertrainType } from '../types';
import { INITIAL_PRICE_DATABASE } from '../data/marketPrices';

// 1. Safe Comparison & Percentage Math
export function calculatePriceChange(
  previous: VehiclePriceRecord,
  current: VehiclePriceRecord
): {
  absoluteChange: number;
  percentageChange: number;
  isCompatible: boolean;
  warning?: string;
  direction: 'increase' | 'decrease' | 'neutral';
} {
  // Guard 1: Incompatible currencies
  if (previous.currency !== current.currency) {
    return {
      absoluteChange: 0,
      percentageChange: 0,
      isCompatible: false,
      direction: 'neutral',
      warning: `Incompatible currencies: Cannot compare ${previous.currency} directly with ${current.currency} without verified historical conversion.`,
    };
  }

  // Guard 2: Incompatible price tax bases
  if (previous.taxBasis !== current.taxBasis) {
    return {
      absoluteChange: 0,
      percentageChange: 0,
      isCompatible: false,
      direction: 'neutral',
      warning: `Incompatible tax bases: Cannot directly compare ${previous.taxBasis} with ${current.taxBasis}.`,
    };
  }

  // Guard 3: Incompatible markets
  if (previous.market !== current.market) {
    return {
      absoluteChange: 0,
      percentageChange: 0,
      isCompatible: false,
      direction: 'neutral',
      warning: `Cross-market comparison: Price structures in ${previous.market} differ from ${current.market} due to local homologation and tariffs.`,
    };
  }

  // Guard 4: Zero or negative previous price
  if (previous.amount <= 0 || current.amount <= 0) {
    return {
      absoluteChange: 0,
      percentageChange: 0,
      isCompatible: false,
      direction: 'neutral',
      warning: 'Invalid zero or negative price observation encountered.',
    };
  }

  const absoluteChange = Math.round(current.amount - previous.amount);
  const percentageChange = Number((((current.amount - previous.amount) / previous.amount) * 100).toFixed(2));

  let direction: 'increase' | 'decrease' | 'neutral' = 'neutral';
  if (absoluteChange > 0) direction = 'increase';
  else if (absoluteChange < 0) direction = 'decrease';

  return {
    absoluteChange,
    percentageChange,
    isCompatible: true,
    direction,
  };
}

// 2. Vehicle Price History & Change Events
export function getVehiclePriceHistory(
  records: VehiclePriceRecord[],
  vehicleSlug: string
): {
  records: VehiclePriceRecord[];
  changeEvents: PriceChangeEvent[];
  hasHistory: boolean;
} {
  const vehicleRecords = records
    .filter((r) => r.vehicleSlug === vehicleSlug || r.vehicleId === vehicleSlug)
    .sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime());

  if (vehicleRecords.length === 0) {
    return { records: [], changeEvents: [], hasHistory: false };
  }

  const changeEvents: PriceChangeEvent[] = [];

  for (let i = 1; i < vehicleRecords.length; i++) {
    const prev = vehicleRecords[i - 1];
    const curr = vehicleRecords[i];
    const calc = calculatePriceChange(prev, curr);

    if (calc.isCompatible) {
      changeEvents.push({
        id: `evt_${prev.id}_to_${curr.id}`,
        vehicleId: curr.vehicleId,
        vehicleSlug: curr.vehicleSlug,
        vehicleName: curr.vehicleName,
        variant: curr.variant,
        market: curr.market,
        currency: curr.currency,
        priceType: curr.priceType,
        previousPrice: prev.amount,
        newPrice: curr.amount,
        absoluteChange: calc.absoluteChange,
        percentageChange: calc.percentageChange,
        direction: calc.direction,
        effectiveDate: curr.effectiveDate,
        sourceName: curr.sourceName,
        sourceUrl: curr.sourceUrl,
        isCorrection: curr.status === 'corrected',
        notes: curr.provenance || 'Documented manufacturer price revision',
      });
    }
  }

  return {
    records: vehicleRecords,
    changeEvents,
    hasHistory: vehicleRecords.length > 1,
  };
}

// 3. Launch vs Current Price Analysis
export function getLaunchVsCurrentAnalysis(
  records: VehiclePriceRecord[],
  vehicleSlug: string
): LaunchVsCurrentAnalysis | null {
  const vehicleRecords = records
    .filter((r) => r.vehicleSlug === vehicleSlug || r.vehicleId === vehicleSlug)
    .sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime());

  if (vehicleRecords.length === 0) return null;

  // Find explicit launch price or earliest available record
  const launchRecord =
    vehicleRecords.find((r) => r.priceType === 'launch_price') || vehicleRecords[0];

  // Find most recent active record
  const activeRecords = vehicleRecords.filter((r) => r.status === 'active');
  const currentRecord = activeRecords.length > 0
    ? activeRecords[activeRecords.length - 1]
    : vehicleRecords[vehicleRecords.length - 1];

  const calc = calculatePriceChange(launchRecord, currentRecord);

  const launchTime = new Date(launchRecord.effectiveDate).getTime();
  const currentTime = new Date(currentRecord.effectiveDate).getTime();
  const daysElapsed = Math.max(0, Math.round((currentTime - launchTime) / (1000 * 60 * 60 * 24)));

  return {
    vehicleId: currentRecord.vehicleId,
    vehicleSlug: currentRecord.vehicleSlug,
    vehicleName: currentRecord.vehicleName,
    variant: currentRecord.variant,
    market: currentRecord.market,
    currency: currentRecord.currency,
    launchPrice: launchRecord.amount,
    launchDate: launchRecord.effectiveDate,
    launchSource: launchRecord.sourceName,
    currentPrice: currentRecord.amount,
    currentDate: currentRecord.effectiveDate,
    currentSource: currentRecord.sourceName,
    absoluteChange: calc.absoluteChange,
    percentageChange: calc.percentageChange,
    daysElapsed,
    isComparable: calc.isCompatible,
    incompatibilityReason: calc.warning,
  };
}

// 4. Mathematical Helper: Median & Distribution
function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

// 5. Market Segment Analytics
export function getSegmentAnalytics(
  records: VehiclePriceRecord[],
  currency: CurrencyCode = 'USD'
): MarketSegmentAnalytics[] {
  // Filter active records matching currency
  const active = records.filter((r) => r.status === 'active' && r.currency === currency);
  if (active.length === 0) return [];

  // Group by distinct segments (BodyType + Powertrain categories)
  const segmentsMap: Record<string, VehiclePriceRecord[]> = {
    SUV: active.filter((r) => r.bodyType === 'suv'),
    Sedan: active.filter((r) => r.bodyType === 'sedan'),
    Coupe: active.filter((r) => r.bodyType === 'coupe'),
    'Electric (BEV)': active.filter((r) => r.powertrain === 'electric'),
    'Hybrid & PHEV': active.filter((r) => r.powertrain === 'hybrid' || r.powertrain === 'plug-in hybrid'),
    'Petrol & Diesel': active.filter((r) => r.powertrain === 'petrol' || r.powertrain === 'diesel'),
  };

  const results: MarketSegmentAnalytics[] = [];

  Object.entries(segmentsMap).forEach(([segmentName, segRecords]) => {
    if (segRecords.length === 0) return;

    const prices = segRecords.map((r) => r.amount);
    const medianPrice = computeMedian(prices);
    const meanPrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Compute Price Bands
    const bandThresholds =
      currency === 'INR'
        ? [
            { label: 'Under ₹15 Lakh', min: 0, max: 1500000 },
            { label: '₹15L - ₹30 Lakh', min: 1500000, max: 3000000 },
            { label: '₹30L - ₹60 Lakh', min: 3000000, max: 6000000 },
            { label: 'Over ₹60 Lakh', min: 6000000, max: Infinity },
          ]
        : [
            { label: 'Under $35,000', min: 0, max: 35000 },
            { label: '$35,000 - $75,000', min: 35000, max: 75000 },
            { label: '$75,000 - $125,000', min: 75000, max: 125000 },
            { label: 'Over $125,000', min: 125000, max: Infinity },
          ];

    const priceBands = bandThresholds.map((band) => {
      const count = segRecords.filter((r) => r.amount >= band.min && r.amount < band.max).length;
      return {
        rangeLabel: band.label,
        min: band.min,
        max: band.max,
        count,
        percentage: Number(((count / segRecords.length) * 100).toFixed(1)),
      };
    });

    // Powertrain breakdown
    const pMap: Record<string, number[]> = {};
    segRecords.forEach((r) => {
      if (!pMap[r.powertrain]) pMap[r.powertrain] = [];
      pMap[r.powertrain].push(r.amount);
    });

    const powertrainBreakdown = Object.entries(pMap).map(([p, pPrices]) => ({
      powertrain: p as PowertrainType,
      count: pPrices.length,
      medianPrice: computeMedian(pPrices),
    }));

    results.push({
      segment: segmentName,
      vehicleCount: segRecords.length,
      variantCount: segRecords.length,
      medianPrice,
      meanPrice,
      minPrice,
      maxPrice,
      currency,
      priceBands,
      powertrainBreakdown,
    });
  });

  return results;
}

// 6. EV vs Conventional ICE Price Comparison
export function getEvVsIceComparison(
  records: VehiclePriceRecord[],
  segment: 'SUV' | 'Sedan' | 'All' = 'SUV',
  currency: CurrencyCode = 'USD'
): EvVsIceComparison | null {
  let pool = records.filter((r) => r.status === 'active' && r.currency === currency);
  if (segment === 'SUV') pool = pool.filter((r) => r.bodyType === 'suv');
  else if (segment === 'Sedan') pool = pool.filter((r) => r.bodyType === 'sedan');

  const evRecords = pool.filter((r) => r.powertrain === 'electric');
  const iceRecords = pool.filter((r) => r.powertrain === 'petrol' || r.powertrain === 'diesel');
  const hybridRecords = pool.filter((r) => r.powertrain === 'hybrid' || r.powertrain === 'plug-in hybrid');

  if (evRecords.length === 0 || iceRecords.length === 0) return null;

  const evMedianPrice = computeMedian(evRecords.map((r) => r.amount));
  const iceMedianPrice = computeMedian(iceRecords.map((r) => r.amount));
  const hybridMedianPrice = computeMedian(hybridRecords.map((r) => r.amount));

  const evPremiumAmount = Math.round(evMedianPrice - iceMedianPrice);
  const evPremiumPercentage = iceMedianPrice > 0
    ? Number((((evMedianPrice - iceMedianPrice) / iceMedianPrice) * 100).toFixed(1))
    : 0;

  return {
    segment,
    evCount: evRecords.length,
    iceCount: iceRecords.length,
    hybridCount: hybridRecords.length,
    evMedianPrice,
    iceMedianPrice,
    hybridMedianPrice,
    evPremiumAmount,
    evPremiumPercentage,
    currency,
    sampleCriteria: `Calculated from ${evRecords.length} BEVs, ${iceRecords.length} ICE vehicles, and ${hybridRecords.length} hybrids in the ${segment} segment (${currency}).`,
  };
}

// 7. Manufacturer Analytics
export function getManufacturerAnalytics(
  records: VehiclePriceRecord[],
  currency: CurrencyCode = 'USD'
): ManufacturerAnalytics[] {
  const active = records.filter((r) => r.status === 'active' && r.currency === currency);
  const byBrand: Record<string, VehiclePriceRecord[]> = {};

  active.forEach((r) => {
    if (!byBrand[r.brand]) byBrand[r.brand] = [];
    byBrand[r.brand].push(r);
  });

  const results: ManufacturerAnalytics[] = [];

  Object.entries(byBrand).forEach(([brand, list]) => {
    const prices = list.map((r) => r.amount);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const medianPrice = computeMedian(prices);

    // Dominant powertrain
    const pCounts: Record<string, number> = {};
    list.forEach((r) => {
      pCounts[r.powertrain] = (pCounts[r.powertrain] || 0) + 1;
    });
    const dominantPowertrain = Object.entries(pCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'electric';

    results.push({
      brand,
      headquarters: list[0]?.country || 'Global',
      modelCount: new Set(list.map((r) => r.model)).size,
      variantCount: list.length,
      medianPrice,
      minPrice,
      maxPrice,
      currency,
      dominantPowertrain,
      priceSpreadRatio: minPrice > 0 ? Number((maxPrice / minPrice).toFixed(2)) : 1,
    });
  });

  return results.sort((a, b) => b.medianPrice - a.medianPrice);
}

// 8. CSV Formula Injection Defense (OWASP compliant)
export function sanitizeCsvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value);

  // If starts with risky characters: =, +, -, @, \t, \r, prepend single quote
  const riskyChars = ['=', '+', '-', '@', '\t', '\r'];
  let sanitized = str;

  if (riskyChars.some((char) => str.startsWith(char))) {
    sanitized = `'${str}`;
  }

  // Escape inner double quotes
  sanitized = sanitized.replace(/"/g, '""');
  return `"${sanitized}"`;
}

// 9. Generate Price Explorer CSV
export function generatePriceExplorerCsv(
  records: VehiclePriceRecord[],
  filterSummary?: string
): string {
  const metadataLines = [
    '# AUTOVERSE AUTOMOTIVE MARKET INTELLIGENCE — PRICE REPORT',
    `# Export Generated: ${new Date().toISOString()}`,
    `# Record Count: ${records.length}`,
    `# Applied Filters: ${filterSummary || 'All Available Records'}`,
    '# Data Source: Official OEM Price Circulars, SIAM/FADA Registry, Monroney Labels',
    '# Notice: Nominal prices as recorded. Prices subject to state taxes, logistics and registration.',
    '',
  ];

  const headers = [
    'Record ID',
    'Vehicle Name',
    'Brand',
    'Model',
    'Variant',
    'Powertrain',
    'Body Type',
    'Market',
    'Country',
    'Currency',
    'Price Type',
    'Amount',
    'Tax Basis',
    'Effective Date',
    'Status',
    'Source Name',
    'Source URL',
    'Verification Date',
  ];

  const csvRows = records.map((r) =>
    [
      sanitizeCsvCell(r.id),
      sanitizeCsvCell(r.vehicleName),
      sanitizeCsvCell(r.brand),
      sanitizeCsvCell(r.model),
      sanitizeCsvCell(r.variant),
      sanitizeCsvCell(r.powertrain),
      sanitizeCsvCell(r.bodyType),
      sanitizeCsvCell(r.market),
      sanitizeCsvCell(r.country),
      sanitizeCsvCell(r.currency),
      sanitizeCsvCell(r.priceType),
      sanitizeCsvCell(r.amount),
      sanitizeCsvCell(r.taxBasis),
      sanitizeCsvCell(r.effectiveDate),
      sanitizeCsvCell(r.status),
      sanitizeCsvCell(r.sourceName),
      sanitizeCsvCell(r.sourceUrl),
      sanitizeCsvCell(r.verificationDate),
    ].join(',')
  );

  return `${metadataLines.join('\n')}${headers.join(',')}\n${csvRows.join('\n')}`;
}

// 10. Parse & Validate CSV Imports with Formula Injection Defense
export function parseAndValidatePriceCsv(
  csvContent: string,
  existingDatabase: VehiclePriceRecord[] = INITIAL_PRICE_DATABASE
): CsvImportPreview {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#')); // Strip metadata comments

  if (lines.length < 2) {
    return { validRows: [], invalidRows: [], duplicateCount: 0, totalRows: 0 };
  }

  // Parse header
  const rawHeaders = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
  const rows = lines.slice(1);

  const validRows: VehiclePriceRecord[] = [];
  const invalidRows: { rowNumber: number; raw: Record<string, string>; errors: string[] }[] = [];
  let duplicateCount = 0;

  rows.forEach((line, idx) => {
    const rowNumber = idx + 2;
    // Simple CSV row parser handling quotes
    const cells: string[] = [];
    let insideQuote = false;
    let currentCell = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());

    // Map to object
    const rowObj: Record<string, string> = {};
    rawHeaders.forEach((h, hIdx) => {
      let val = cells[hIdx] || '';
      // Strip outer quotes
      val = val.replace(/^["']|["']$/g, '').trim();
      // Un-escape formula injection quotes if present
      if (val.startsWith("'")) val = val.slice(1);
      rowObj[h] = val;
    });

    // Validation
    const errors: string[] = [];
    const vehicleSlug = rowObj['vehicleslug'] || rowObj['vehicle_slug'] || rowObj['vehicleid'] || rowObj['id'];
    const amountStr = rowObj['amount'] || rowObj['price'] || rowObj['currentprice'];
    const currency = (rowObj['currency'] || 'USD').toUpperCase() as CurrencyCode;
    const effectiveDate = rowObj['effectivedate'] || rowObj['date'] || '2024-10-01';
    const sourceName = rowObj['sourcename'] || rowObj['source'] || 'Imported Dealer Dispatch';

    if (!vehicleSlug) errors.push('Missing required vehicle identifier or slug');
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) errors.push('Price amount must be a positive number');
    if (!['USD', 'INR', 'EUR', 'GBP'].includes(currency)) errors.push(`Unsupported currency: ${currency}`);
    if (isNaN(new Date(effectiveDate).getTime())) errors.push(`Invalid effective date format: ${effectiveDate}`);

    if (errors.length > 0) {
      invalidRows.push({ rowNumber, raw: rowObj, errors });
      return;
    }

    // Check duplicate in existing database
    const isDuplicate = existingDatabase.some(
      (r) =>
        (r.vehicleSlug === vehicleSlug || r.vehicleId === vehicleSlug) &&
        r.effectiveDate === effectiveDate &&
        r.amount === amount &&
        r.currency === currency
    );

    if (isDuplicate) {
      duplicateCount++;
      return;
    }

    const priceType = (rowObj['pricetype'] as any) || 'ex_showroom';
    const taxBasis = (rowObj['taxbasis'] as any) || (currency === 'INR' ? 'ex_showroom' : 'msrp');

    validRows.push({
      id: `pr_imp_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      vehicleId: vehicleSlug,
      vehicleSlug,
      vehicleName: rowObj['vehiclename'] || vehicleSlug,
      brand: rowObj['brand'] || 'AutoVerse Verified',
      model: rowObj['model'] || vehicleSlug,
      variant: rowObj['variant'] || 'Standard',
      powertrain: (rowObj['powertrain'] as any) || 'electric',
      bodyType: (rowObj['bodytype'] as any) || 'sedan',
      market: rowObj['market'] || (currency === 'INR' ? 'India' : 'United States'),
      country: rowObj['country'] || (currency === 'INR' ? 'India' : 'United States'),
      currency,
      priceType,
      amount,
      effectiveDate,
      sourceName,
      sourceUrl: rowObj['sourceurl'] || 'https://autoverse.internal',
      verificationDate: new Date().toISOString().split('T')[0],
      collectionTimestamp: new Date().toISOString(),
      taxBasis,
      status: 'active',
      provenance: 'Administrative CSV Batch Ingestion',
    });
  });

  return {
    validRows,
    invalidRows,
    duplicateCount,
    totalRows: rows.length,
  };
}
