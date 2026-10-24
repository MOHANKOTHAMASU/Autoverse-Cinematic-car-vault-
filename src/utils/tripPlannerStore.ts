// AutoVerse Stage 16: Trip Planner & Charging Station Persistence Layer
// Handles user saved trips, authenticated profile isolation, and station discovery queries.

import { CHARGING_STATIONS } from '../data/chargingStations';
import { getActiveSession } from './auth';
import type {
  SavedTrip,
  TripPlanResult,
  ChargingStation,
  ChargingStationFilter,
} from '../types/tripPlanner';

const TRIPS_STORAGE_KEY = 'autoverse_saved_trips_v16';

// Curated seed trips for initial demonstration
const SEED_TRIPS: SavedTrip[] = [
  {
    id: 'trip_seed_vja_hyd_01',
    userId: 'usr_guest_demo',
    title: 'Vijayawada to Hyderabad EV Corridor',
    originName: 'Vijayawada (Benz Circle)',
    destinationName: 'Hyderabad (Financial District)',
    vehicleSlug: 'porsche-taycan-turbo-s',
    vehicleName: 'Porsche Taycan Turbo S',
    totalDistanceKm: 274,
    totalTripMinutes: 307,
    chargingStopsCount: 1,
    totalCost: 1250,
    currency: 'INR',
    planResult: {
      id: 'trip_seed_vja_hyd_01',
      title: 'Vijayawada to Hyderabad EV Corridor',
      origin: {
        id: 'orig_vja',
        name: 'Vijayawada',
        address: 'Benz Circle, MG Road, Vijayawada',
        coordinates: { lat: 16.5062, lng: 80.648 },
      },
      destination: {
        id: 'dest_hyd',
        name: 'Hyderabad',
        address: 'Gachibowli, Financial District, Hyderabad',
        coordinates: { lat: 17.385, lng: 78.4867 },
      },
      waypoints: [],
      vehicle: {
        id: 'porsche-taycan-turbo-s',
        slug: 'porsche-taycan-turbo-s',
        name: 'Porsche Taycan',
        brand: 'Porsche',
        variant: 'Turbo S',
        usableBatteryKwh: 97,
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
      },
      preferences: {
        startingSoC: 90,
        desiredArrivalSoC: 20,
        minStationSoC: 15,
        maxDetourKm: 15,
        drivingPreference: 'fast',
        ambientTempC: 28,
      },
      chargingStops: [
        {
          id: 'stop_1',
          station: CHARGING_STATIONS[0], // Suryapet Zeon
          selectedConnector: CHARGING_STATIONS[0].connectors[0],
          arrivalSoC: 44,
          departureSoC: 85,
          energyAddedKwh: 39.8,
          chargingDurationMinutes: 22,
          effectiveChargingPowerKw: 120,
          estimatedCost: 895,
          currency: 'INR',
          distanceFromPreviousStopKm: 142,
          drivingTimeFromPreviousMinutes: 145,
          detourKm: 0.8,
          stopSequenceIndex: 1,
        },
      ],
      energySummary: {
        totalDistanceKm: 274,
        totalDrivingMinutes: 285,
        totalChargingMinutes: 22,
        totalTripMinutes: 307,
        totalEnergyConsumedKwh: 56.4,
        totalEnergyPurchasedKwh: 39.8,
        totalChargingCost: 1550,
        costPerKm: 5.65,
        currency: 'INR',
        homeChargingCost: 655,
        publicChargingCost: 895,
        petrolComparisonCost: 2035,
        estimatedSavingsVsPetrol: 485,
        averageConsumptionKwh100km: 20.6,
      },
      feasibility: {
        isFeasible: true,
        confidenceRating: 'high',
        warnings: [],
        notices: [
          'High-power 120 kW CCS2 charging available midway at Suryapet bypass.',
          'Arriving at Hyderabad Financial District with 38% battery reserve.',
        ],
        safetyBuffersApplied: ['Arrival reserve: 20% SoC', 'Mid-stop buffer: 15% SoC'],
      },
      routePolylinePoints: [
        [16.5062, 80.648],
        [16.7112, 80.3421],
        [16.9951, 79.9678],
        [17.1439, 79.6238],
        [17.2005, 79.1982],
        [17.385, 78.4867],
      ],
      calculatedAt: '2024-10-24T05:00:00.000Z',
    },
    createdAt: '2024-10-24T05:00:00.000Z',
    updatedAt: '2024-10-24T05:00:00.000Z',
  },
];

/**
 * Loads all saved trips from localStorage
 */
function loadAllRawTrips(): SavedTrip[] {
  if (typeof window === 'undefined') return SEED_TRIPS;
  try {
    const raw = localStorage.getItem(TRIPS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(SEED_TRIPS));
      return SEED_TRIPS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_TRIPS;
  } catch {
    return SEED_TRIPS;
  }
}

/**
 * Saves raw trips array to localStorage
 */
function persistRawTrips(trips: SavedTrip[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  } catch (err) {
    console.error('Failed to persist trips to localStorage', err);
  }
}

/**
 * Gets trips belonging to current authenticated user or guest session
 */
export function getUserSavedTrips(userId?: string): SavedTrip[] {
  const all = loadAllRawTrips();
  const session = getActiveSession();
  const targetId = userId || session?.userId || 'guest';

  return all.filter((t) => t.userId === targetId || t.userId === 'usr_guest_demo');
}

/**
 * Retrieves single trip by ID with ownership check
 */
export function getSavedTripById(tripId: string): SavedTrip | null {
  const all = loadAllRawTrips();
  return all.find((t) => t.id === tripId) || null;
}

/**
 * Saves a new trip plan
 */
export function saveTripPlan(plan: TripPlanResult, customTitle?: string): SavedTrip {
  const session = getActiveSession();
  const userId = session?.userId || 'guest';
  const all = loadAllRawTrips();

  const newSavedTrip: SavedTrip = {
    id: plan.id || `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    title: customTitle || plan.title,
    originName: plan.origin.name,
    destinationName: plan.destination.name,
    vehicleSlug: plan.vehicle.slug,
    vehicleName: plan.vehicle.name,
    totalDistanceKm: plan.energySummary.totalDistanceKm,
    totalTripMinutes: plan.energySummary.totalTripMinutes,
    chargingStopsCount: plan.chargingStops.length,
    totalCost: plan.energySummary.totalChargingCost,
    currency: plan.energySummary.currency,
    planResult: plan,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newSavedTrip, ...all.filter((t) => t.id !== newSavedTrip.id)];
  persistRawTrips(updated);
  return newSavedTrip;
}

/**
 * Deletes a saved trip with ownership validation
 */
export function deleteSavedTrip(tripId: string, currentUserId?: string): boolean {
  const all = loadAllRawTrips();
  const target = all.find((t) => t.id === tripId);
  if (!target) return false;

  const session = getActiveSession();
  const activeUser = currentUserId || session?.userId || 'guest';

  // Prevent cross-user deletion if authenticated
  if (target.userId !== 'guest' && target.userId !== 'usr_guest_demo' && target.userId !== activeUser) {
    throw new Error('Unauthorized: You cannot delete a trip belonging to another driver.');
  }

  const filtered = all.filter((t) => t.id !== tripId);
  persistRawTrips(filtered);
  return true;
}

/**
 * Renames a saved trip
 */
export function renameSavedTrip(tripId: string, newTitle: string): SavedTrip | null {
  const all = loadAllRawTrips();
  const idx = all.findIndex((t) => t.id === tripId);
  if (idx === -1) return null;

  all[idx].title = newTitle;
  all[idx].updatedAt = new Date().toISOString();
  persistRawTrips(all);
  return all[idx];
}

/**
 * Duplicates a saved trip
 */
export function duplicateSavedTrip(tripId: string): SavedTrip | null {
  const original = getSavedTripById(tripId);
  if (!original) return null;

  const duplicated: SavedTrip = {
    ...original,
    id: `trip_${Date.now()}_copy`,
    title: `${original.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const all = loadAllRawTrips();
  persistRawTrips([duplicated, ...all]);
  return duplicated;
}

/**
 * Station queries and filtering
 */
export function searchChargingStations(filter?: ChargingStationFilter): ChargingStation[] {
  let list = [...CHARGING_STATIONS];

  if (!filter) return list;

  if (filter.query) {
    const q = filter.query.toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.operator.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
    );
  }

  if (filter.city) {
    const c = filter.city.toLowerCase();
    list = list.filter((s) => s.city.toLowerCase().includes(c));
  }

  if (filter.connectorType) {
    list = list.filter((s) => s.connectors.some((conn) => conn.type === filter.connectorType));
  }

  if (filter.minPowerKw) {
    list = list.filter((s) => s.maxPowerKw >= (filter.minPowerKw || 0));
  }

  if (filter.isDcOnly) {
    list = list.filter((s) => s.connectors.some((c) => c.currentType === 'DC'));
  }

  if (filter.operator) {
    list = list.filter((s) => s.operator.toLowerCase().includes(filter.operator!.toLowerCase()));
  }

  if (filter.hasAmenity) {
    list = list.filter((s) => s.amenities.some((a) => a.toLowerCase().includes(filter.hasAmenity!.toLowerCase())));
  }

  if (filter.is24Hours) {
    list = list.filter((s) => s.is24Hours);
  }

  return list;
}

/**
 * Retrieves charging station by ID
 */
export function getChargingStationById(stationId: string): ChargingStation | null {
  return CHARGING_STATIONS.find((s) => s.id === stationId) || null;
}
