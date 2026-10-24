// AutoVerse Stage 19: Dashboard Data Aggregation, Recommendations & Preferences Store
import type {
  DashboardPreferences,
  DashboardSummary,
  VehicleRecommendation,
  UserActivityEvent,
  DashboardCostInsights,
  WidgetVisibilitySettings,
} from '../types/dashboard';
import type { BodyType } from '../types';
import { VEHICLES } from '../data/vehicles';
import { getOwnedVehicles, getMaintenanceTasks, getExpenses, getServiceRecords, getReminders } from './ownershipStore';
import { getSavedGarageSlugs } from './garage';
import { getUserSafetyAlerts } from './safetyService';
import { getUserSavedTrips } from './tripPlannerStore';
import { getUserReadingList, getArticleById } from './editorialStore';
import { getAllReviews } from './communityStore';

const PREFS_STORAGE_PREFIX = 'autoverse_dashboard_prefs_v19_';

// 1. DEFAULT WIDGET VISIBILITY & PREFERENCES
export const DEFAULT_WIDGET_VISIBILITY: WidgetVisibilitySettings = {
  garageOverview: true,
  maintenanceTimeline: true,
  safetyAlerts: true,
  savedTrips: true,
  readingList: true,
  recommendations: true,
  costInsights: true,
  recentActivity: true,
};

export function getDefaultDashboardPreferences(userId: string): DashboardPreferences {
  return {
    userId,
    budgetMin: 20000,
    budgetMax: 250000,
    currency: 'USD',
    preferredBodyTypes: ['suv', 'sedan'],
    preferredPowertrains: ['electric', 'hybrid', 'petrol'],
    minSeats: 4,
    drivingStyle: 'daily_commute',
    dismissedRecommendationSlugs: [],
    widgetVisibility: { ...DEFAULT_WIDGET_VISIBILITY },
    updatedAt: new Date().toISOString(),
  };
}

// 2. PREFERENCES CRUD (Scoped strictly per authenticated userId)
export function getDashboardPreferences(userId: string): DashboardPreferences {
  if (!userId || typeof window === 'undefined') {
    return getDefaultDashboardPreferences(userId || 'guest');
  }

  try {
    const raw = localStorage.getItem(`${PREFS_STORAGE_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...getDefaultDashboardPreferences(userId),
        ...parsed,
        widgetVisibility: {
          ...DEFAULT_WIDGET_VISIBILITY,
          ...(parsed.widgetVisibility || {}),
        },
      };
    }
  } catch (err) {
    console.error('Failed to load user dashboard preferences:', err);
  }

  return getDefaultDashboardPreferences(userId);
}

export function saveDashboardPreferences(userId: string, prefs: Partial<DashboardPreferences>): DashboardPreferences {
  if (!userId || typeof window === 'undefined') {
    return getDefaultDashboardPreferences(userId || 'guest');
  }

  const current = getDashboardPreferences(userId);
  const updated: DashboardPreferences = {
    ...current,
    ...prefs,
    userId,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(`${PREFS_STORAGE_PREFIX}${userId}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('autoverse_dashboard_prefs_updated', { detail: { userId } }));
  } catch (err) {
    console.error('Failed to save dashboard preferences:', err);
  }

  return updated;
}

export function resetDashboardPreferences(userId: string): DashboardPreferences {
  const defaults = getDefaultDashboardPreferences(userId);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${PREFS_STORAGE_PREFIX}${userId}`, JSON.stringify(defaults));
      window.dispatchEvent(new CustomEvent('autoverse_dashboard_prefs_updated', { detail: { userId } }));
    } catch (err) {
      console.error('Failed to reset dashboard preferences:', err);
    }
  }
  return defaults;
}

export function dismissRecommendation(userId: string, slug: string): void {
  const prefs = getDashboardPreferences(userId);
  if (!prefs.dismissedRecommendationSlugs.includes(slug)) {
    const updated = [...prefs.dismissedRecommendationSlugs, slug];
    saveDashboardPreferences(userId, { dismissedRecommendationSlugs: updated });
  }
}

// 3. EXECUTIVE DASHBOARD SUMMARY AGGREGATOR
export function getDashboardSummary(
  userId: string,
  userProfile?: { fullName?: string; email?: string; avatarUrl?: string }
): DashboardSummary {
  const now = new Date();
  const hours = now.getHours();
  let timeGreeting = 'Good morning';
  if (hours >= 12 && hours < 17) {
    timeGreeting = 'Good afternoon';
  } else if (hours >= 17) {
    timeGreeting = 'Good evening';
  }

  const name = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'Driver';
  const greeting = `${timeGreeting}, ${name}`;

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  const owned = getOwnedVehicles(userId);
  const savedSlugs = getSavedGarageSlugs();
  const maintTasks = getMaintenanceTasks(userId);
  const activeAlerts = getUserSafetyAlerts(userId).filter((a) => !a.isReviewed);
  const savedTrips = getUserSavedTrips(userId);
  const readingList = getUserReadingList(userId);

  const upcomingMaintenance = maintTasks.filter((t) => !t.isCompleted && (t.status === 'upcoming' || t.status === 'due'));
  const overdueMaintenance = maintTasks.filter((t) => !t.isCompleted && t.status === 'overdue');

  // Formulate automotive context summary
  let contextSummary = '';
  if (owned.length === 0 && savedSlugs.length === 0) {
    contextSummary = 'Welcome to AutoVerse. Add your owned vehicles or explore the fleet to activate telemetry.';
  } else if (overdueMaintenance.length > 0) {
    contextSummary = `Attention required: ${overdueMaintenance.length} maintenance item(s) currently overdue for your fleet.`;
  } else if (activeAlerts.length > 0) {
    contextSummary = `Notice: ${activeAlerts.length} official safety recall notice(s) identified for your saved vehicles.`;
  } else if (upcomingMaintenance.length > 0) {
    contextSummary = `Your fleet is operational. ${upcomingMaintenance.length} scheduled service item(s) upcoming.`;
  } else {
    contextSummary = `All systems nominal across ${owned.length} owned machine(s) and ${savedSlugs.length} saved vehicle(s).`;
  }

  return {
    userId,
    userName: userProfile?.fullName || 'AutoVerse Member',
    userEmail: userProfile?.email || '',
    userAvatar: userProfile?.avatarUrl,
    formattedDate,
    greeting,
    contextSummary,
    totalSavedVehicles: owned.length + savedSlugs.length,
    ownedVehiclesCount: owned.length,
    shortlistedVehiclesCount: savedSlugs.length,
    upcomingMaintenanceCount: upcomingMaintenance.length,
    overdueMaintenanceCount: overdueMaintenance.length,
    activeRecallsCount: activeAlerts.length,
    savedTripsCount: savedTrips.length,
    savedArticlesCount: readingList.length,
  };
}

// 4. TRANSPARENT VEHICLE RECOMMENDATION ENGINE
export function getPersonalizedRecommendations(userId: string, limit = 4): VehicleRecommendation[] {
  const prefs = getDashboardPreferences(userId);
  const owned = getOwnedVehicles(userId);
  const ownedSlugs = new Set(owned.map((v) => v.vehicleSlug).filter(Boolean));
  const dismissed = new Set(prefs.dismissedRecommendationSlugs || []);
  const savedSlugs = new Set(getSavedGarageSlugs());

  // Filter candidates: exclude owned and dismissed vehicles
  const candidates = VEHICLES.filter((v) => {
    if (ownedSlugs.has(v.id) || ownedSlugs.has(v.slug)) return false;
    if (dismissed.has(v.id) || dismissed.has(v.slug)) return false;
    return true;
  });

  const scored: VehicleRecommendation[] = candidates.map((vehicle) => {
    let score = 50; // base score
    const reasons: string[] = [];

    // 1. Budget alignment
    const price = vehicle.price || 50000;
    if (price >= prefs.budgetMin && price <= prefs.budgetMax) {
      score += 25;
      reasons.push(`Priced at $${price.toLocaleString()} within your target budget ceiling of $${prefs.budgetMax.toLocaleString()}`);
    } else if (price < prefs.budgetMin) {
      score += 10;
      reasons.push(`Accessible price point of $${price.toLocaleString()} under your minimum target`);
    }

    // 2. Body type preference
    const vBody = vehicle.bodyType as BodyType;
    if (prefs.preferredBodyTypes.includes(vBody)) {
      score += 20;
      reasons.push(`Matches your preferred ${vehicle.bodyType.replace('_', ' ')} architecture`);
    }

    // 3. Powertrain preference
    const vPower = vehicle.powertrain.toLowerCase() as 'electric' | 'hybrid' | 'petrol' | 'diesel';
    if (prefs.preferredPowertrains.includes(vPower)) {
      score += 20;
      if (vPower === 'electric') {
        reasons.push('Zero tailpipe emissions and high-voltage DC fast-charging capable');
      } else if (vPower === 'hybrid') {
        reasons.push('High-efficiency regenerative hybrid powertrain for extended highway range');
      } else {
        reasons.push('Internal combustion engine with high specific power output');
      }
    }

    // 4. Seating capacity
    const seats = vehicle.interiorDetails?.seatingCapacity || 5;
    if (seats >= prefs.minSeats) {
      score += 10;
      reasons.push(`Accommodates ${seats} passengers comfortably, satisfying your requirement`);
    }

    // 5. Shortlist affinity
    if (savedSlugs.has(vehicle.id) || savedSlugs.has(vehicle.slug)) {
      score += 10;
      reasons.push('Currently saved on your garage shortlist for comparative benchmarking');
    }

    // 6. Highlight tag
    let highlightTag = 'Top Recommendation';
    if (vPower === 'electric') {
      highlightTag = 'Electric Fleet Highlight';
    } else if (vehicle.price && vehicle.price > 100000) {
      highlightTag = 'Luxury Performance';
    } else if (vBody === 'suv') {
      highlightTag = 'High Utility SUV';
    }

    // Clamp score
    const matchScore = Math.min(Math.max(score, 30), 98);

    return {
      vehicle,
      matchScore,
      reasons: reasons.slice(0, 3),
      highlightTag,
    };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}

// 5. USER ACTIVITY TIMELINE AGGREGATOR (Genuine user records only)
export function getUserActivityTimeline(userId: string, limit = 8): UserActivityEvent[] {
  if (!userId) return [];

  const events: UserActivityEvent[] = [];

  // A. Owned vehicles
  const owned = getOwnedVehicles(userId);
  owned.forEach((v) => {
    events.push({
      id: `act_own_${v.id}`,
      userId,
      type: 'vehicle_owned',
      title: `${v.year} ${v.make} ${v.model}`,
      description: `Added to verified private fleet with odometer at ${v.currentOdometer.toLocaleString()} ${v.odometerUnit}.`,
      timestamp: v.createdAt,
      linkUrl: `/garage?tab=owned`,
      category: 'fleet',
    });
  });

  // B. Maintenance completed
  const maint = getMaintenanceTasks(userId);
  maint
    .filter((t) => t.isCompleted && t.completedDate)
    .forEach((t) => {
      events.push({
        id: `act_maint_${t.id}`,
        userId,
        type: 'maintenance_completed',
        title: `Service Task: ${t.taskName}`,
        description: `Marked completed on ${t.completedDate}. (${t.serviceProvider || 'AutoVerse Certified Partner'})`,
        timestamp: t.updatedAt || t.createdAt,
        linkUrl: `/garage?tab=maintenance`,
        category: 'maintenance',
      });
    });

  // C. Service records
  const services = getServiceRecords(userId);
  services.forEach((s) => {
    events.push({
      id: `act_srv_${s.id}`,
      userId,
      type: 'service_recorded',
      title: `Service Record: ${s.workPerformed}`,
      description: `Logged at ${s.serviceProvider} for $${s.cost.toLocaleString()} ${s.currency}.`,
      timestamp: s.createdAt,
      linkUrl: `/garage?tab=service`,
      category: 'maintenance',
    });
  });

  // D. Saved trips
  const trips = getUserSavedTrips(userId);
  trips.forEach((tr) => {
    events.push({
      id: `act_trip_${tr.id}`,
      userId,
      type: 'trip_saved',
      title: `EV Corridor: ${tr.title}`,
      description: `Route: ${tr.originName} → ${tr.destinationName} (${tr.totalDistanceKm} km, ${tr.chargingStopsCount} charging stop(s)).`,
      timestamp: tr.planResult?.id ? new Date().toISOString() : tr.planResult?.id || new Date().toISOString(),
      linkUrl: `/trip-planner/plan/${tr.id}`,
      category: 'travel',
    });
  });

  // E. Bookmarked editorial stories
  const bookmarks = getUserReadingList(userId);
  bookmarks.forEach((b) => {
    const art = getArticleById(b.articleId);
    if (art) {
      events.push({
        id: `act_art_${b.articleId}`,
        userId,
        type: 'article_bookmarked',
        title: `Reading List: ${art.title}`,
        description: `Saved editorial dispatch (${art.category.toUpperCase()} • ${art.readingTimeMinutes} min read).`,
        timestamp: b.savedAt,
        linkUrl: `/news/${art.slug}`,
        category: 'editorial',
      });
    }
  });

  // F. Published community reviews
  const reviews = getAllReviews().filter((r) => r.authorId === userId);
  reviews.forEach((r) => {
    events.push({
      id: `act_rev_${r.id}`,
      userId,
      type: 'review_published',
      title: `Owner Review: ${r.vehicleBrand} ${r.vehicleModel}`,
      description: `Rated ${r.overallRating.toFixed(1)} ★: "${r.title}".`,
      timestamp: r.createdAt,
      linkUrl: `/community/reviews/${r.id}`,
      category: 'community',
    });
  });

  // G. Reminders
  const reminders = getReminders(userId);
  reminders.forEach((rem) => {
    events.push({
      id: `act_rem_${rem.id}`,
      userId,
      type: 'reminder_set',
      title: `Reminder: ${rem.title}`,
      description: `Scheduled for ${rem.dueDate} (${rem.type.replace('_', ' ')}).`,
      timestamp: rem.createdAt,
      linkUrl: `/garage?tab=reminders`,
      category: 'maintenance',
    });
  });

  // Sort latest first
  return events
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// 6. DASHBOARD COST & OWNERSHIP INSIGHTS AGGREGATOR
export function getDashboardCostInsights(userId: string): DashboardCostInsights {
  const expenses = getExpenses(userId);
  let total = 0;
  let maintTotal = 0;
  let chargingTotal = 0;
  let insuranceTotal = 0;
  let repairsTotal = 0;
  const byCat: Record<string, number> = {};

  expenses.forEach((e) => {
    total += e.amount;
    byCat[e.category] = (byCat[e.category] || 0) + e.amount;
    const cat = e.category.toLowerCase();
    if (cat.includes('maint')) maintTotal += e.amount;
    else if (cat.includes('charge') || cat.includes('fuel')) chargingTotal += e.amount;
    else if (cat.includes('insur')) insuranceTotal += e.amount;
    else if (cat.includes('repair')) repairsTotal += e.amount;
  });

  const currency = expenses[0]?.currency || 'USD';

  return {
    totalRecordedExpenses: Number(total.toFixed(2)),
    currency,
    maintenanceTotal: Number(maintTotal.toFixed(2)),
    chargingFuelTotal: Number(chargingTotal.toFixed(2)),
    insuranceTotal: Number(insuranceTotal.toFixed(2)),
    repairsTotal: Number(repairsTotal.toFixed(2)),
    expensesByCategory: byCat,
    recordedTransactionsCount: expenses.length,
    periodDescription: expenses.length > 0 ? 'Verified transactions recorded in owner ledger' : 'No recorded transactions yet',
    isEstimate: false,
  };
}
