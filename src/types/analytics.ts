// AutoVerse Stage 24: Advanced Automotive Analytics & Reporting Data Contracts

export type AnalyticsTimeRange = 'today' | '7d' | '30d' | '90d' | 'this_year' | 'all_time' | 'custom';

export interface DateFilterOptions {
  range: AnalyticsTimeRange;
  customStartDate?: string;
  customEndDate?: string;
}

// Key summary metrics for Overview Dashboard
export interface OverviewMetrics {
  totalCatalogVehicles: number;
  totalManufacturers: number;
  publishedLaunches: number;
  totalPublishedReviews: number;
  activeUsedListings: number;
  pendingDealerEnquiries: number;
  testDriveRequests: number;
  activeDealerOffers: number;
  savedFinancingScenarios: number;
  trackedSafetyRecalls: number;
}

// Categorical distribution point for charts
export interface DistributionDataPoint {
  label: string;
  count: number;
  percentage: number;
  value?: number;
  color?: string;
}

// Time-series trend point for line charts
export interface TimeSeriesPoint {
  date: string;
  label: string;
  count: number;
  secondaryCount?: number;
}

// Vehicle & Manufacturer Analytics
export interface VehicleCatalogAnalytics {
  totalVehicles: number;
  byManufacturer: DistributionDataPoint[];
  byPowertrain: DistributionDataPoint[];
  byBodyType: DistributionDataPoint[];
  byLaunchYear: DistributionDataPoint[];
  byPriceBracket: DistributionDataPoint[];
  catalogCompleteness: {
    specsCompletenessPct: number;
    safetyRatedPct: number;
    withHighResImagePct: number;
    electricOrHybridPct: number;
  };
}

// Marketplace Analytics
export interface MarketplaceAnalyticsSummary {
  totalListings: number;
  byStatus: DistributionDataPoint[];
  byFuelType: DistributionDataPoint[];
  topMakesListed: DistributionDataPoint[];
  averageAskingPrice: number;
  averageAskingPriceByFuel: { fuel: string; avgPrice: number }[];
  totalBuyerEnquiries: number;
  listingsAwaitingModeration: number;
  resolvedModerationCount: number;
  listingTimeline: TimeSeriesPoint[];
}

// Dealer & Test-Drive Analytics
export interface DealerAnalyticsSummary {
  totalDealers: number;
  byRegion: DistributionDataPoint[];
  byCity: DistributionDataPoint[];
  totalBookings: number;
  byStatus: DistributionDataPoint[];
  topRequestedVehicles: DistributionDataPoint[];
  bookingTimeline: TimeSeriesPoint[];
  pendingActionCount: number;
}

// Offers & Financing Analytics
export interface OffersAnalyticsSummary {
  totalOffers: number;
  activeOffersCount: number;
  expiredOffersCount: number;
  pendingOffersCount: number;
  byCategory: DistributionDataPoint[];
  byBenefitType: DistributionDataPoint[];
  savedScenariosCount: number;
  scenariosByTenure: DistributionDataPoint[];
  scenariosByDownPaymentTier: DistributionDataPoint[];
}

// Privacy-conscious telemetry event
export interface AnalyticsTelemetryEvent {
  id: string;
  eventType: 'vehicle_view' | 'vehicle_compare' | 'car_finder_search' | 'test_drive_requested' | 'marketplace_enquiry' | 'finance_calculated';
  entityId?: string;
  entityName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
