// AutoVerse Stage 18: Automotive Market Analytics & Price Intelligence Data Contracts
import type { CurrencyCode } from './calculator';
import type { PowertrainType, BodyType } from './index';

export type PriceType =
  | 'ex_showroom'
  | 'dealer_listed'
  | 'estimated_on_road'
  | 'launch_price'
  | 'user_estimate';

export type PriceTaxBasis =
  | 'ex_showroom'
  | 'on_road_inclusive'
  | 'msrp'
  | 'dst_excluded'
  | 'inclusive_gst';

export type PriceStatus = 'active' | 'superseded' | 'corrected' | 'withdrawn';

export interface VehiclePriceRecord {
  id: string;
  vehicleId: string;
  vehicleSlug: string;
  vehicleName: string;
  brand: string;
  model: string;
  variant: string;
  variantId?: string;
  powertrain: PowertrainType;
  bodyType: BodyType;
  market: string;
  country: string;
  currency: CurrencyCode;
  priceType: PriceType;
  amount: number;
  minPrice?: number;
  maxPrice?: number;
  effectiveDate: string; // ISO YYYY-MM-DD
  announcementDate?: string;
  sourceName: string;
  sourceUrl: string;
  verificationDate: string;
  collectionTimestamp: string;
  taxBasis: PriceTaxBasis;
  status: PriceStatus;
  provenance: string;
  correctionNote?: string;
  exchangeRateInfo?: {
    baseCurrency: CurrencyCode;
    rate: number;
    date: string;
    source: string;
  };
}

export interface PriceChangeEvent {
  id: string;
  vehicleId: string;
  vehicleSlug: string;
  vehicleName: string;
  variant: string;
  market: string;
  currency: CurrencyCode;
  priceType: PriceType;
  previousPrice: number;
  newPrice: number;
  absoluteChange: number;
  percentageChange: number;
  direction: 'increase' | 'decrease' | 'neutral';
  effectiveDate: string;
  sourceName: string;
  sourceUrl: string;
  isCorrection: boolean;
  notes: string;
}

export interface LaunchVsCurrentAnalysis {
  vehicleId: string;
  vehicleSlug: string;
  vehicleName: string;
  variant: string;
  market: string;
  currency: CurrencyCode;
  launchPrice: number;
  launchDate: string;
  launchSource: string;
  currentPrice: number;
  currentDate: string;
  currentSource: string;
  absoluteChange: number;
  percentageChange: number;
  daysElapsed: number;
  isComparable: boolean;
  incompatibilityReason?: string;
}

export interface MarketSegmentAnalytics {
  segment: string;
  vehicleCount: number;
  variantCount: number;
  medianPrice: number;
  meanPrice: number;
  minPrice: number;
  maxPrice: number;
  currency: CurrencyCode;
  priceBands: {
    rangeLabel: string;
    min: number;
    max: number;
    count: number;
    percentage: number;
  }[];
  powertrainBreakdown: {
    powertrain: PowertrainType;
    count: number;
    medianPrice: number;
  }[];
}

export interface ManufacturerAnalytics {
  brand: string;
  headquarters: string;
  modelCount: number;
  variantCount: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  currency: CurrencyCode;
  dominantPowertrain: string;
  priceSpreadRatio: number; // max / min
}

export interface EvVsIceComparison {
  segment: string;
  evCount: number;
  iceCount: number;
  hybridCount: number;
  evMedianPrice: number;
  iceMedianPrice: number;
  hybridMedianPrice: number;
  evPremiumAmount: number; // evMedian - iceMedian
  evPremiumPercentage: number;
  currency: CurrencyCode;
  sampleCriteria: string;
}

export interface MarketDataSourceConfig {
  id: string;
  name: string;
  region: string;
  coverage: string;
  updateFrequency: string;
  sourceType: 'official_oem' | 'government_registry' | 'industry_fada_siam' | 'verified_publication';
  url: string;
  status: 'active' | 'periodic' | 'manual';
  lastChecked: string;
  notes: string;
  recordCount: number;
}

export interface CsvImportPreview {
  validRows: VehiclePriceRecord[];
  invalidRows: {
    rowNumber: number;
    raw: Record<string, string>;
    errors: string[];
  }[];
  duplicateCount: number;
  totalRows: number;
}
