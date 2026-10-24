// AutoVerse Stage 22: Smart Finance & Offer Store Engine
// High-precision financial mathematics, reducing-balance EMI calculations,
// zero-interest handling, offer lifecycle management, and privacy-isolated persistence.

import type {
  VehicleOffer,
  OfferFilterParams,
  FinanceCalculationInputs,
  FinanceCalculationResult,
  MonthlyAmortizationPoint,
  SavedFinanceScenario,
  FinanceSystemSettings,
  OfferStatus,
} from '../types/offers';
import {
  INITIAL_VEHICLE_OFFERS,
  DEFAULT_FINANCE_SETTINGS,
} from '../data/dealerOffers';
import type { User, UserPublicProfile } from '../types/auth';

type FinanceUser = User | UserPublicProfile;

const OFFERS_STORAGE_KEY = 'autoverse_dealer_offers';
const SAVED_SCENARIOS_STORAGE_KEY = 'autoverse_saved_finance_scenarios';
const FINANCE_SETTINGS_STORAGE_KEY = 'autoverse_finance_settings';

// Custom event identifiers for reactive multi-tab updates
export const EVENT_OFFERS_UPDATED = 'autoverse_offers_updated';
export const EVENT_SCENARIOS_UPDATED = 'autoverse_saved_scenarios_updated';
export const EVENT_SETTINGS_UPDATED = 'autoverse_finance_settings_updated';

function dispatchSyncEvent(eventName: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName));
  }
}

// -------------------------------------------------------------
// 1. FINANCIAL MATHEMATICS & EMI CALCULATOR ENGINE
// -------------------------------------------------------------

/**
 * High-Precision Reducing-Balance EMI Calculation
 *
 * Formula:
 * Monthly rate: r = annualInterestRate / 12 / 100
 * Financed Principal: P = max(0, vehiclePrice - downPayment)
 *
 * For standard loan (no balloon payment):
 * EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
 *
 * For balloon payment B due at month n:
 * PV(B) = B / (1 + r)^n
 * P_amortized = P - PV(B)
 * EMI = [P_amortized * r * (1 + r)^n] / [(1 + r)^n - 1]
 *
 * For zero interest (r = 0):
 * EMI = (P - B) / n
 */
export function calculateFinanceEMI(inputs: FinanceCalculationInputs): FinanceCalculationResult {
  const vehiclePrice = Math.max(0, Number(inputs.vehiclePrice) || 0);
  
  // Calculate down payment (ensure within 0 to vehiclePrice)
  let downPayment = Math.max(0, Number(inputs.downPayment) || 0);
  if (inputs.downPaymentPercent && (!inputs.downPayment || inputs.downPayment === 0)) {
    downPayment = Math.round((vehiclePrice * Math.min(100, Math.max(0, inputs.downPaymentPercent))) / 100);
  }
  downPayment = Math.min(vehiclePrice, downPayment);

  const downPaymentPercent = vehiclePrice > 0 ? (downPayment / vehiclePrice) * 100 : 0;
  const loanPrincipal = Math.max(0, vehiclePrice - downPayment);
  const annualInterestRate = Math.max(0, Math.min(40, Number(inputs.annualInterestRate) || 0));
  const loanTenureMonths = Math.max(1, Math.min(120, Math.round(Number(inputs.loanTenureMonths) || 60)));
  const processingFee = Math.max(0, Number(inputs.processingFee) || 0);
  const otherUpfrontCharges = Math.max(0, Number(inputs.otherUpfrontCharges) || 0);
  const rawBalloon = Math.max(0, Number(inputs.balloonPayment) || 0);
  const balloonPayment = Math.min(loanPrincipal, rawBalloon);

  // Case A: Zero loan principal (100% Cash / Down Payment)
  if (loanPrincipal === 0) {
    const totalUpfront = downPayment + processingFee + otherUpfrontCharges;
    return {
      vehiclePrice,
      downPayment,
      downPaymentPercent,
      loanPrincipal: 0,
      annualInterestRate,
      loanTenureMonths,
      monthlyEmi: 0,
      balloonPayment: 0,
      totalScheduledRepayments: 0,
      totalInterest: 0,
      processingFee,
      otherUpfrontCharges,
      totalUpfrontOutlay: totalUpfront,
      totalFinancingOutlay: totalUpfront,
      effectiveAnnualRate: annualInterestRate,
      isZeroInterest: true,
      monthlyBreakdown: [],
    };
  }

  // Case B: 0% Zero-Interest Loan
  if (annualInterestRate === 0) {
    const amortizedAmount = Math.max(0, loanPrincipal - balloonPayment);
    const monthlyEmi = amortizedAmount / loanTenureMonths;
    const totalScheduledRepayments = (monthlyEmi * loanTenureMonths) + balloonPayment;
    const totalInterest = 0;
    const totalUpfrontOutlay = downPayment + processingFee + otherUpfrontCharges;
    const totalFinancingOutlay = totalUpfrontOutlay + totalScheduledRepayments;

    // Generate month-by-month breakdown
    const monthlyBreakdown: MonthlyAmortizationPoint[] = [];
    let balance = loanPrincipal;
    for (let m = 1; m <= loanTenureMonths; m++) {
      const isLastMonth = m === loanTenureMonths;
      const principalPortion = isLastMonth ? balance : monthlyEmi;
      balance = Math.max(0, balance - principalPortion);
      monthlyBreakdown.push({
        month: m,
        payment: isLastMonth ? monthlyEmi + balloonPayment : monthlyEmi,
        principal: principalPortion,
        interest: 0,
        remainingBalance: balance,
      });
    }

    return {
      vehiclePrice,
      downPayment,
      downPaymentPercent,
      loanPrincipal,
      annualInterestRate: 0,
      loanTenureMonths,
      monthlyEmi,
      balloonPayment,
      totalScheduledRepayments,
      totalInterest,
      processingFee,
      otherUpfrontCharges,
      totalUpfrontOutlay,
      totalFinancingOutlay,
      effectiveAnnualRate: 0,
      isZeroInterest: true,
      monthlyBreakdown,
    };
  }

  // Case C: Standard Reducing-Balance Loan with Interest
  const monthlyRate = annualInterestRate / 12 / 100;
  const n = loanTenureMonths;
  const compound = Math.pow(1 + monthlyRate, n);

  let monthlyEmi: number;
  if (balloonPayment > 0) {
    // Present value of balloon payment
    const pvBalloon = balloonPayment / compound;
    const amortizedPrincipal = Math.max(0, loanPrincipal - pvBalloon);
    monthlyEmi = (amortizedPrincipal * monthlyRate * compound) / (compound - 1);
  } else {
    monthlyEmi = (loanPrincipal * monthlyRate * compound) / (compound - 1);
  }

  const totalScheduledRepayments = (monthlyEmi * n) + balloonPayment;
  const totalInterest = Math.max(0, totalScheduledRepayments - loanPrincipal);
  const totalUpfrontOutlay = downPayment + processingFee + otherUpfrontCharges;
  // Total outlay does not double-count principal because totalScheduledRepayments includes principal + interest
  const totalFinancingOutlay = totalUpfrontOutlay + totalScheduledRepayments;

  // Generate Amortization Schedule
  const monthlyBreakdown: MonthlyAmortizationPoint[] = [];
  let currentBalance = loanPrincipal;

  for (let m = 1; m <= n; m++) {
    const interestPortion = currentBalance * monthlyRate;
    let principalPortion = monthlyEmi - interestPortion;
    const isLastMonth = m === n;

    if (isLastMonth) {
      principalPortion = currentBalance;
      currentBalance = 0;
    } else {
      currentBalance = Math.max(0, currentBalance - principalPortion);
    }

    monthlyBreakdown.push({
      month: m,
      payment: isLastMonth ? monthlyEmi + balloonPayment : monthlyEmi,
      principal: principalPortion,
      interest: interestPortion,
      remainingBalance: currentBalance,
    });
  }

  return {
    vehiclePrice,
    downPayment,
    downPaymentPercent,
    loanPrincipal,
    annualInterestRate,
    loanTenureMonths,
    monthlyEmi,
    balloonPayment,
    totalScheduledRepayments,
    totalInterest,
    processingFee,
    otherUpfrontCharges,
    totalUpfrontOutlay,
    totalFinancingOutlay,
    effectiveAnnualRate: annualInterestRate,
    isZeroInterest: false,
    monthlyBreakdown,
  };
}

// -------------------------------------------------------------
// 2. VEHICLE OFFERS STORE & LIFECYCLE MANAGEMENT
// -------------------------------------------------------------

function getStoredOffers(): VehicleOffer[] {
  if (typeof window === 'undefined') return INITIAL_VEHICLE_OFFERS;
  const raw = localStorage.getItem(OFFERS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(INITIAL_VEHICLE_OFFERS));
    return INITIAL_VEHICLE_OFFERS;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse vehicle offers from storage:', err);
    return INITIAL_VEHICLE_OFFERS;
  }
}

function saveStoredOffers(offers: VehicleOffer[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
  dispatchSyncEvent(EVENT_OFFERS_UPDATED);
}

/**
 * Check and refresh expiry status for all offers
 */
export function refreshOfferExpiryStatus(): VehicleOffer[] {
  const offers = getStoredOffers();
  const todayStr = new Date().toISOString().split('T')[0];
  let changed = false;

  const updated = offers.map((offer) => {
    if (offer.status === 'approved' && offer.validUntil < todayStr) {
      changed = true;
      return {
        ...offer,
        status: 'expired' as OfferStatus,
        published: false,
        auditLog: [
          ...offer.auditLog,
          {
            action: 'EXPIRED_ON_DATE',
            performedBy: 'system_scheduler',
            timestamp: new Date().toISOString(),
            note: `Validity ended on ${offer.validUntil}`,
          },
        ],
      };
    }
    return offer;
  });

  if (changed) {
    saveStoredOffers(updated);
  }
  return updated;
}

/**
 * Retrieve all vehicle offers (including archived/pending for moderators)
 */
export function getAllOffers(): VehicleOffer[] {
  return refreshOfferExpiryStatus();
}

/**
 * Retrieve active, approved, and currently valid offers for discovery
 */
export function getActiveOffers(params?: OfferFilterParams): {
  offers: VehicleOffer[];
  total: number;
  page: number;
  totalPages: number;
} {
  const allOffers = refreshOfferExpiryStatus();
  const todayStr = new Date().toISOString().split('T')[0];

  let filtered = allOffers.filter((o) => {
    // Exclude unapproved, withdrawn, or rejected
    if (o.status !== 'approved' || !o.published) return false;
    // Check expiration unless explicitly requested
    if (!params?.includeExpired && o.validUntil < todayStr) return false;
    return true;
  });

  if (!params) {
    return {
      offers: filtered,
      total: filtered.length,
      page: 1,
      totalPages: 1,
    };
  }

  // Full-text search
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.vehicleTitle.toLowerCase().includes(q) ||
        o.dealerName.toLowerCase().includes(q) ||
        o.dealerCity.toLowerCase().includes(q) ||
        (o.vehicleVariant && o.vehicleVariant.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (params.category && params.category !== 'all') {
    filtered = filtered.filter((o) => o.category === params.category);
  }

  // Vehicle filter
  if (params.vehicleId && params.vehicleId !== 'all') {
    filtered = filtered.filter((o) => o.vehicleId === params.vehicleId || o.vehicleId === 'all_models');
  }

  // Dealer filter
  if (params.dealerId && params.dealerId !== 'all') {
    filtered = filtered.filter((o) => o.dealerId === params.dealerId);
  }

  // Region filter
  if (params.region && params.region !== 'all') {
    filtered = filtered.filter((o) => o.isNationwide || o.region.toLowerCase().includes(params.region!.toLowerCase()));
  }

  // Condition filter
  if (params.vehicleCondition && params.vehicleCondition !== 'all') {
    filtered = filtered.filter((o) => o.vehicleCondition === params.vehicleCondition || o.vehicleCondition === 'all');
  }

  // Benefit range
  if (params.minBenefit !== undefined && params.minBenefit > 0) {
    filtered = filtered.filter((o) => o.benefitAmount >= params.minBenefit!);
  }
  if (params.maxBenefit !== undefined && params.maxBenefit > 0) {
    filtered = filtered.filter((o) => o.benefitAmount <= params.maxBenefit!);
  }

  // Verification status
  if (params.verificationStatus && params.verificationStatus !== 'all') {
    filtered = filtered.filter((o) => o.verificationStatus === params.verificationStatus);
  }

  // Sorting
  filtered.sort((a, b) => {
    switch (params.sortBy) {
      case 'benefit_desc':
        return b.benefitAmount - a.benefitAmount;
      case 'benefit_asc':
        return a.benefitAmount - b.benefitAmount;
      case 'expiring_soon':
        return a.validUntil.localeCompare(b.validUntil);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Pagination
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 9);
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    offers: paginated,
    total,
    page,
    totalPages,
  };
}

/**
 * Retrieve a single offer by its unique slug
 */
export function getOfferBySlug(slug: string): VehicleOffer | undefined {
  const offers = getAllOffers();
  return offers.find((o) => o.slug === slug);
}

/**
 * Retrieve a single offer by its ID
 */
export function getOfferById(id: string): VehicleOffer | undefined {
  const offers = getAllOffers();
  return offers.find((o) => o.id === id);
}

/**
 * Retrieve all active verified offers linked to a vehicle ID
 */
export function getOffersForVehicle(vehicleId: string): VehicleOffer[] {
  const all = getActiveOffers().offers;
  return all.filter((o) => o.vehicleId === vehicleId || o.vehicleId === 'all_models');
}

/**
 * Retrieve all active verified offers provided by a dealership ID
 */
export function getOffersForDealer(dealerId: string): VehicleOffer[] {
  const all = getActiveOffers().offers;
  return all.filter((o) => o.dealerId === dealerId);
}

/**
 * Create a new vehicle offer (requires admin or dealer authorization)
 */
export function createVehicleOffer(
  payload: Omit<VehicleOffer, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'auditLog'>,
  user?: FinanceUser | null
): { success: boolean; offer?: VehicleOffer; error?: string } {
  if (!payload.title || payload.title.trim().length < 5) {
    return { success: false, error: 'Offer title must be at least 5 characters.' };
  }
  if (!payload.vehicleTitle || !payload.dealerName) {
    return { success: false, error: 'Vehicle title and dealer provider are required.' };
  }
  if (!payload.validFrom || !payload.validUntil) {
    return { success: false, error: 'Valid start and expiry dates are required.' };
  }
  if (payload.validUntil < payload.validFrom) {
    return { success: false, error: 'Expiry date cannot precede start date.' };
  }

  const id = `offer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const baseSlug = payload.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const slug = `${baseSlug}-${id.slice(-4)}`;

  const now = new Date().toISOString();
  const userName = (user as any)?.fullName || user?.email || 'admin_user';

  const newOffer: VehicleOffer = {
    ...payload,
    id,
    slug,
    createdAt: now,
    updatedAt: now,
    createdBy: userName,
    auditLog: [
      {
        action: 'CREATED',
        performedBy: userName,
        timestamp: now,
        note: `Created with status: ${payload.status}`,
      },
    ],
  };

  const current = getStoredOffers();
  current.unshift(newOffer);
  saveStoredOffers(current);

  return { success: true, offer: newOffer };
}

/**
 * Update an existing vehicle offer
 */
export function updateVehicleOffer(
  id: string,
  updates: Partial<VehicleOffer>,
  user?: FinanceUser | null
): { success: boolean; offer?: VehicleOffer; error?: string } {
  const current = getStoredOffers();
  const index = current.findIndex((o) => o.id === id);
  if (index === -1) {
    return { success: false, error: 'Offer not found.' };
  }

  const existing = current[index];
  const now = new Date().toISOString();
  const userName = (user as any)?.fullName || user?.email || 'admin_user';

  const updated: VehicleOffer = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: now,
    auditLog: [
      ...existing.auditLog,
      {
        action: 'UPDATED',
        performedBy: userName,
        timestamp: now,
        note: 'Offer fields updated by administrator.',
      },
    ],
  };

  current[index] = updated;
  saveStoredOffers(current);
  return { success: true, offer: updated };
}

/**
 * Change status of an offer (approve, reject, expire, withdraw)
 */
export function setOfferStatus(
  id: string,
  status: OfferStatus,
  reason?: string,
  user?: FinanceUser | null
): { success: boolean; offer?: VehicleOffer; error?: string } {
  const current = getStoredOffers();
  const index = current.findIndex((o) => o.id === id);
  if (index === -1) {
    return { success: false, error: 'Offer not found.' };
  }

  const existing = current[index];
  if (status === 'rejected' && (!reason || reason.trim().length < 5)) {
    return { success: false, error: 'A documented rejection reason (min 5 chars) is mandatory.' };
  }

  const now = new Date().toISOString();
  const userName = (user as any)?.fullName || user?.email || 'admin_moderator';

  const updated: VehicleOffer = {
    ...existing,
    status,
    published: status === 'approved',
    rejectionReason: status === 'rejected' ? reason : undefined,
    updatedAt: now,
    auditLog: [
      ...existing.auditLog,
      {
        action: `STATUS_CHANGE_TO_${status.toUpperCase()}`,
        performedBy: userName,
        timestamp: now,
        note: reason || `Status set to ${status}`,
      },
    ],
  };

  current[index] = updated;
  saveStoredOffers(current);
  return { success: true, offer: updated };
}

/**
 * Delete an offer
 */
export function deleteVehicleOffer(id: string, user?: FinanceUser | null): boolean {
  const current = getStoredOffers();
  const filtered = current.filter((o) => o.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredOffers(filtered);
  console.log(`Offer ${id} removed by ${(user as any)?.fullName || 'admin'}`);
  return true;
}

/**
 * Safe CSV export with CWE-1236 Formula Injection Neutralization
 */
export function exportOffersCSV(): string {
  const offers = getAllOffers();

  // Neutralize formula injection: prepend single quote to fields starting with =, +, -, @, \t, \r
  const sanitize = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    let s = String(val).replace(/"/g, '""');
    if (/^[=+\-@\t\r]/.test(s)) {
      s = `'${s}`;
    }
    return `"${s}"`;
  };

  const headers = [
    'Offer ID',
    'Title',
    'Category',
    'Vehicle',
    'Dealer Provider',
    'City',
    'Region',
    'Benefit Amount',
    'Currency',
    'Benefit Summary',
    'Valid From',
    'Valid Until',
    'Status',
    'Verification Status',
    'Source',
    'Created At',
  ];

  const rows = offers.map((o) => [
    sanitize(o.id),
    sanitize(o.title),
    sanitize(o.category),
    sanitize(o.vehicleTitle),
    sanitize(o.dealerName),
    sanitize(o.dealerCity),
    sanitize(o.region),
    o.benefitAmount,
    sanitize(o.currency),
    sanitize(o.benefitFormatted),
    sanitize(o.validFrom),
    sanitize(o.validUntil),
    sanitize(o.status),
    sanitize(o.verificationStatus),
    sanitize(o.source),
    sanitize(o.createdAt),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

// -------------------------------------------------------------
// 3. SAVED FINANCING SCENARIOS (USER PRIVACY ISOLATED)
// -------------------------------------------------------------

function getStoredScenarios(): SavedFinanceScenario[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(SAVED_SCENARIOS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredScenarios(scenarios: SavedFinanceScenario[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SAVED_SCENARIOS_STORAGE_KEY, JSON.stringify(scenarios));
  dispatchSyncEvent(EVENT_SCENARIOS_UPDATED);
}

/**
 * Retrieve saved finance scenarios for the authenticated user only
 */
export function getUserSavedScenarios(userId: string): SavedFinanceScenario[] {
  if (!userId) return [];
  const all = getStoredScenarios();
  return all.filter((s) => s.userId === userId);
}

/**
 * Save a new finance scenario scoped to user
 */
export function saveUserFinanceScenario(
  payload: Omit<SavedFinanceScenario, 'id' | 'createdAt' | 'updatedAt' | 'calculationVersion'>
): SavedFinanceScenario {
  const id = `scenario-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newScenario: SavedFinanceScenario = {
    ...payload,
    id,
    calculationVersion: '2.0.0',
    createdAt: now,
    updatedAt: now,
  };

  const all = getStoredScenarios();
  all.unshift(newScenario);
  saveStoredScenarios(all);
  return newScenario;
}

/**
 * Update an existing scenario (strict ownership check)
 */
export function updateUserFinanceScenario(
  id: string,
  userId: string,
  updates: Partial<SavedFinanceScenario>
): { success: boolean; scenario?: SavedFinanceScenario; error?: string } {
  const all = getStoredScenarios();
  const index = all.findIndex((s) => s.id === id);
  if (index === -1) {
    return { success: false, error: 'Scenario not found.' };
  }

  // Cross-user security isolation
  if (all[index].userId !== userId) {
    return { success: false, error: 'Unauthorized: Cross-user scenario access denied.' };
  }

  const updated: SavedFinanceScenario = {
    ...all[index],
    ...updates,
    id: all[index].id,
    userId: all[index].userId,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  saveStoredScenarios(all);
  return { success: true, scenario: updated };
}

/**
 * Delete a scenario (strict ownership check)
 */
export function deleteUserFinanceScenario(id: string, userId: string): boolean {
  const all = getStoredScenarios();
  const scenario = all.find((s) => s.id === id);
  if (!scenario || scenario.userId !== userId) {
    return false;
  }
  const filtered = all.filter((s) => s.id !== id);
  saveStoredScenarios(filtered);
  return true;
}

// -------------------------------------------------------------
// 4. PLATFORM FINANCE SYSTEM SETTINGS
// -------------------------------------------------------------

export function getFinanceSettings(): FinanceSystemSettings {
  if (typeof window === 'undefined') return DEFAULT_FINANCE_SETTINGS;
  const raw = localStorage.getItem(FINANCE_SETTINGS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(FINANCE_SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_FINANCE_SETTINGS));
    return DEFAULT_FINANCE_SETTINGS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FINANCE_SETTINGS;
  }
}

export function updateFinanceSettings(
  updates: Partial<FinanceSystemSettings>,
  adminUser?: FinanceUser | null
): FinanceSystemSettings {
  const current = getFinanceSettings();
  const updated: FinanceSystemSettings = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString(),
    updatedBy: (adminUser as any)?.fullName || adminUser?.email || 'admin_user',
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(FINANCE_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    dispatchSyncEvent(EVENT_SETTINGS_UPDATED);
  }
  return updated;
}
