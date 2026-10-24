// AutoVerse Stage 16: EV Charging & Smart Trip Planner Types

export type ChargingPlugType = 'CCS2' | 'Type 2' | 'NACS' | 'GB/T' | 'CHAdeMO' | 'CCS1';
export type ChargingSpeedTier = 'ac_standard' | 'dc_fast' | 'dc_ultra_fast'; // AC (<22kW), Fast (50-150kW), Ultra Fast (>150kW)

export interface ChargingConnector {
  type: ChargingPlugType;
  powerKw: number;
  currentType: 'AC' | 'DC';
  totalPlugs: number;
  availablePlugs?: number; // Only if live status supplied
  pricePerKwh: number;
  currency: string;
}

export interface ChargingStation {
  id: string;
  name: string;
  operator: string; // e.g. Tata Power EZ Charge, Zeon Charging, Statiq, Jio-bp, Tesla Supercharger, Ionity
  address: string;
  city: string;
  state?: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  connectors: ChargingConnector[];
  maxPowerKw: number;
  is24Hours: boolean;
  openingHours: string;
  amenities: string[]; // e.g. 'Café', 'Restrooms', 'WiFi', 'Dining', 'Shopping', '24/7 Security'
  paymentMethods: string[]; // 'App', 'RFID Card', 'Credit/Debit Card', 'UPI'
  sourceAttribution: string; // e.g. "AutoVerse Verified EV Network Index"
  lastVerifiedAt: string;
  isLiveStatusAvailable: boolean;
  statusNotice?: string;
  websiteUrl?: string;
}

export interface EvVehicleProfile {
  id: string;
  slug: string;
  name: string;
  brand: string;
  variant: string;
  usableBatteryKwh: number;
  grossBatteryKwh?: number;
  publishedRangeKm: number;
  testCycle: string; // WLTP, EPA, ARAI
  efficiencyKwh100km: number;
  chargingMaxDcKw: number;
  chargingMaxAcKw: number;
  supportedConnectors: ChargingPlugType[];
  voltageArchitecture: string; // "400V" or "800V Ultra-Fast"
  chargingCurveTaperSoC: number; // typically 70% or 80% where taper begins
  isSpecificationVerified: boolean;
  missingFields: string[];
}

export type DrivingPreference = 'fast' | 'balanced' | 'max_range';

export interface TripPreferences {
  startingSoC: number; // e.g. 90%
  desiredArrivalSoC: number; // e.g. 15% reserve buffer
  minStationSoC: number; // e.g. 10% safety buffer on arrival at any charger
  maxDetourKm: number; // max acceptable detour from highway corridor
  drivingPreference: DrivingPreference;
  ambientTempC: number; // e.g. 25°C baseline
  departureTime?: string;
  preferOperators?: string[];
  avoidUnverifiedStations?: boolean;
}

export interface TripWaypoint {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isChargingStop?: boolean;
}

export interface PlannedChargingStop {
  id: string;
  station: ChargingStation;
  selectedConnector: ChargingConnector;
  arrivalSoC: number; // percentage
  departureSoC: number; // percentage
  energyAddedKwh: number;
  chargingDurationMinutes: number;
  effectiveChargingPowerKw: number;
  estimatedCost: number;
  currency: string;
  distanceFromPreviousStopKm: number;
  drivingTimeFromPreviousMinutes: number;
  detourKm: number;
  stopSequenceIndex: number;
}

export interface TripEnergySummary {
  totalDistanceKm: number;
  totalDrivingMinutes: number;
  totalChargingMinutes: number;
  totalTripMinutes: number;
  totalEnergyConsumedKwh: number;
  totalEnergyPurchasedKwh: number;
  totalChargingCost: number;
  costPerKm: number;
  currency: string;
  homeChargingCost: number;
  publicChargingCost: number;
  petrolComparisonCost: number;
  estimatedSavingsVsPetrol: number;
  averageConsumptionKwh100km: number;
}

export interface TripFeasibilityReport {
  isFeasible: boolean;
  confidenceRating: 'high' | 'moderate' | 'low';
  warnings: string[];
  notices: string[];
  safetyBuffersApplied: string[];
}

export interface TripPlanResult {
  id: string;
  title: string;
  origin: TripWaypoint;
  destination: TripWaypoint;
  waypoints: TripWaypoint[];
  vehicle: EvVehicleProfile;
  preferences: TripPreferences;
  chargingStops: PlannedChargingStop[];
  energySummary: TripEnergySummary;
  feasibility: TripFeasibilityReport;
  routePolylinePoints: [number, number][]; // [lat, lng]
  calculatedAt: string;
}

export interface SavedTrip {
  id: string;
  userId: string | 'guest';
  title: string;
  originName: string;
  destinationName: string;
  vehicleSlug: string;
  vehicleName: string;
  totalDistanceKm: number;
  totalTripMinutes: number;
  chargingStopsCount: number;
  totalCost: number;
  currency: string;
  planResult: TripPlanResult;
  createdAt: string;
  updatedAt: string;
}

export interface ChargingStationFilter {
  query?: string;
  city?: string;
  connectorType?: ChargingPlugType;
  minPowerKw?: number;
  isDcOnly?: boolean;
  operator?: string;
  hasAmenity?: string;
  is24Hours?: boolean;
}
