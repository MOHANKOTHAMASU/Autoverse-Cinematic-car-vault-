// AutoVerse Stage 19: Personalized Automotive Dashboard & Ownership Insights Types
import type { Vehicle, BodyType } from './index';
import type { CurrencyCode } from './ownership';

export interface WidgetVisibilitySettings {
  garageOverview: boolean;
  maintenanceTimeline: boolean;
  safetyAlerts: boolean;
  savedTrips: boolean;
  readingList: boolean;
  recommendations: boolean;
  costInsights: boolean;
  recentActivity: boolean;
}

export interface DashboardPreferences {
  userId: string;
  budgetMin: number;
  budgetMax: number;
  currency: CurrencyCode;
  preferredBodyTypes: BodyType[];
  preferredPowertrains: ('electric' | 'hybrid' | 'petrol' | 'diesel')[];
  minSeats: number;
  drivingStyle: 'daily_commute' | 'high_performance' | 'grand_touring' | 'family_utility' | 'offroad_adventure';
  dismissedRecommendationSlugs: string[];
  widgetVisibility: WidgetVisibilitySettings;
  updatedAt: string;
}

export interface DashboardSummary {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  formattedDate: string;
  greeting: string;
  contextSummary: string;
  totalSavedVehicles: number;
  ownedVehiclesCount: number;
  shortlistedVehiclesCount: number;
  upcomingMaintenanceCount: number;
  overdueMaintenanceCount: number;
  activeRecallsCount: number;
  savedTripsCount: number;
  savedArticlesCount: number;
}

export interface VehicleRecommendation {
  vehicle: Vehicle;
  matchScore: number; // 0 - 100 percentage
  reasons: string[];
  highlightTag: string;
}

export type ActivityEventType =
  | 'vehicle_owned'
  | 'vehicle_saved'
  | 'maintenance_completed'
  | 'service_recorded'
  | 'trip_saved'
  | 'article_bookmarked'
  | 'review_published'
  | 'reminder_set';

export interface UserActivityEvent {
  id: string;
  userId: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string;
  linkUrl: string;
  category: 'fleet' | 'maintenance' | 'travel' | 'editorial' | 'community';
}

export interface DashboardCostInsights {
  totalRecordedExpenses: number;
  currency: CurrencyCode;
  maintenanceTotal: number;
  chargingFuelTotal: number;
  insuranceTotal: number;
  repairsTotal: number;
  expensesByCategory: Record<string, number>;
  recordedTransactionsCount: number;
  periodDescription: string;
  isEstimate: boolean;
}
