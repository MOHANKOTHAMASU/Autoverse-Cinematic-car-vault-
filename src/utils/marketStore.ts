// AutoVerse Stage 18: Market Intelligence & Pricing Store
import type {
  VehiclePriceRecord,
  MarketDataSourceConfig,
  PriceChangeEvent,
} from '../types/market';
import type { CurrencyCode } from '../types/calculator';
import { INITIAL_PRICE_DATABASE, OFFICIAL_MARKET_SOURCES } from '../data/marketPrices';
import { calculatePriceChange } from './marketService';

const MARKET_PRICES_STORAGE_KEY = 'autoverse_market_prices_v18';
const MARKET_SOURCES_STORAGE_KEY = 'autoverse_market_sources_v18';
const MARKET_IMPORT_LOGS_KEY = 'autoverse_market_import_logs_v18';

export interface MarketImportLog {
  id: string;
  timestamp: string;
  fileName: string;
  importedCount: number;
  duplicateCount: number;
  rejectedCount: number;
  status: 'success' | 'partial' | 'failed';
  notes: string;
}

// 1. Retrieve Price Records from storage with fallback to initial database
export function getAllPriceRecords(): VehiclePriceRecord[] {
  if (typeof window === 'undefined') return INITIAL_PRICE_DATABASE;

  try {
    const raw = localStorage.getItem(MARKET_PRICES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MARKET_PRICES_STORAGE_KEY, JSON.stringify(INITIAL_PRICE_DATABASE));
      return INITIAL_PRICE_DATABASE;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRICE_DATABASE;
  } catch {
    return INITIAL_PRICE_DATABASE;
  }
}

// 2. Save Price Records
export function savePriceRecords(records: VehiclePriceRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MARKET_PRICES_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to persist market price records to storage:', err);
  }
}

// 3. Add Single Price Observation
export function addPriceRecord(record: VehiclePriceRecord): void {
  const current = getAllPriceRecords();
  const updated = [record, ...current];
  savePriceRecords(updated);
}

// 4. Update Price Observation
export function updatePriceRecord(id: string, updates: Partial<VehiclePriceRecord>): boolean {
  const current = getAllPriceRecords();
  const idx = current.findIndex((r) => r.id === id);
  if (idx === -1) return false;

  current[idx] = {
    ...current[idx],
    ...updates,
    verificationDate: new Date().toISOString().split('T')[0],
  };
  savePriceRecords(current);
  return true;
}

// 5. Delete or Supersede Observation
export function deletePriceRecord(id: string): boolean {
  const current = getAllPriceRecords();
  const filtered = current.filter((r) => r.id !== id);
  if (filtered.length === current.length) return false;
  savePriceRecords(filtered);
  return true;
}

// 6. Commit Batch Import
export function commitImportedRecords(
  records: VehiclePriceRecord[],
  fileName: string = 'manual_upload.csv',
  duplicateCount: number = 0,
  rejectedCount: number = 0
): { count: number } {
  const current = getAllPriceRecords();
  const updated = [...records, ...current];
  savePriceRecords(updated);

  // Record audit log
  const log: MarketImportLog = {
    id: `log_imp_${Date.now()}`,
    timestamp: new Date().toISOString(),
    fileName,
    importedCount: records.length,
    duplicateCount,
    rejectedCount,
    status: rejectedCount === 0 ? 'success' : 'partial',
    notes: `Imported ${records.length} records into active catalog; skipped ${duplicateCount} duplicates and ${rejectedCount} malformed rows.`,
  };

  const logs = getMarketImportLogs();
  saveMarketImportLogs([log, ...logs]);

  return { count: records.length };
}

// 7. Market Data Sources Management
export function getMarketSources(): MarketDataSourceConfig[] {
  if (typeof window === 'undefined') return OFFICIAL_MARKET_SOURCES;

  try {
    const raw = localStorage.getItem(MARKET_SOURCES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MARKET_SOURCES_STORAGE_KEY, JSON.stringify(OFFICIAL_MARKET_SOURCES));
      return OFFICIAL_MARKET_SOURCES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : OFFICIAL_MARKET_SOURCES;
  } catch {
    return OFFICIAL_MARKET_SOURCES;
  }
}

export function saveMarketSources(sources: MarketDataSourceConfig[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MARKET_SOURCES_STORAGE_KEY, JSON.stringify(sources));
  } catch (err) {
    console.error('Failed to save market sources:', err);
  }
}

export function toggleMarketSourceStatus(id: string): boolean {
  const sources = getMarketSources();
  const source = sources.find((s) => s.id === id);
  if (!source) return false;

  source.status = source.status === 'active' ? 'manual' : 'active';
  source.lastChecked = new Date().toISOString().split('T')[0];
  saveMarketSources(sources);
  return true;
}

// 8. Import Logs
export function getMarketImportLogs(): MarketImportLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MARKET_IMPORT_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMarketImportLogs(logs: MarketImportLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MARKET_IMPORT_LOGS_KEY, JSON.stringify(logs));
  } catch {
    // silent catch
  }
}

// 9. High-Level Executive Dashboard KPIs
export function getMarketExecutiveKpis(currency: CurrencyCode = 'USD'): {
  totalMonitoredVehicles: number;
  totalPriceObservations: number;
  activeObservations: number;
  medianCatalogPrice: number;
  recentPriceChangesCount: number;
  recentPriceAdjustments: PriceChangeEvent[];
  mostExpensiveVehicle: VehiclePriceRecord | null;
  mostAffordableVehicle: VehiclePriceRecord | null;
} {
  const all = getAllPriceRecords();
  const inCurrency = all.filter((r) => r.currency === currency && r.status === 'active');

  const uniqueVehicles = new Set(all.map((r) => r.vehicleSlug));
  const prices = inCurrency.map((r) => r.amount).sort((a, b) => a - b);

  let medianCatalogPrice = 0;
  if (prices.length > 0) {
    const mid = Math.floor(prices.length / 2);
    medianCatalogPrice = prices.length % 2 !== 0 ? prices[mid] : Math.round((prices[mid - 1] + prices[mid]) / 2);
  }

  // Derive all documented change events across the whole database
  const changes: PriceChangeEvent[] = [];
  uniqueVehicles.forEach((slug) => {
    const records = all
      .filter((r) => r.vehicleSlug === slug)
      .sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime());

    for (let i = 1; i < records.length; i++) {
      const prev = records[i - 1];
      const curr = records[i];
      const calc = calculatePriceChange(prev, curr);

      if (calc.isCompatible && calc.absoluteChange !== 0) {
        changes.push({
          id: `kpi_evt_${prev.id}_${curr.id}`,
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
          notes: curr.provenance || 'Manufacturer revision',
        });
      }
    }
  });

  changes.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());

  const mostExpensiveVehicle = inCurrency.length > 0 ? inCurrency[inCurrency.length - 1] : null;
  const mostAffordableVehicle = inCurrency.length > 0 ? inCurrency[0] : null;

  return {
    totalMonitoredVehicles: uniqueVehicles.size,
    totalPriceObservations: all.length,
    activeObservations: all.filter((r) => r.status === 'active').length,
    medianCatalogPrice,
    recentPriceChangesCount: changes.length,
    recentPriceAdjustments: changes.slice(0, 8),
    mostExpensiveVehicle,
    mostAffordableVehicle,
  };
}
