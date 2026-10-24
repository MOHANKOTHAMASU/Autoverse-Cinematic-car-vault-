// AutoVerse Stage 22: Dealer Offers & Smart Car Financing Types
// Financial-calculator data contracts, offer taxonomies, and scenario models.

import type { CurrencyCode, PriceBasis } from './calculator';

export type OfferCategory =
  | 'manufacturer_discount'
  | 'dealer_discount'
  | 'exchange_bonus'
  | 'loyalty_benefit'
  | 'accessory_package'
  | 'promotional_financing'
  | 'corporate_discount';

export type VehicleConditionScope = 'new_car' | 'used_car' | 'all';

export type BenefitType =
  | 'cash_discount'
  | 'exchange_bonus'
  | 'accessory_pack'
  | 'promo_apr'
  | 'service_pack'
  | 'corporate_deduction'
  | 'custom';

export type OfferVerificationStatus = 'verified' | 'unverified' | 'awaiting_confirmation';

export type OfferStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'expired' | 'withdrawn';

export interface OfferAuditEntry {
  action: string;
  performedBy: string;
  timestamp: string;
  note?: string;
}

export interface VehicleOffer {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: OfferCategory;
  vehicleId: string; // ID from vehicles.ts or 'all_models'
  vehicleTitle: string;
  vehicleVariant?: string;
  vehicleImage?: string;
  dealerId: string; // ID from dealers.ts or 'oem_direct'
  dealerName: string;
  dealerCity: string;
  dealerContactPhone?: string;
  dealerContactEmail?: string;
  benefitType: BenefitType;
  benefitAmount: number; // Numeric value in currency (or 0 for apr)
  benefitFormatted: string; // e.g., "₹4,50,000 Bespoke Pack", "3.99% Fixed Promo APR"
  promoApr?: number; // Optional promotional APR rate for promotional_financing
  currency: CurrencyCode;
  region: string; // e.g., 'Maharashtra / Mumbai', 'Baden-Württemberg', 'California'
  isNationwide: boolean;
  vehicleCondition: VehicleConditionScope;
  validFrom: string; // ISO Date YYYY-MM-DD
  validUntil: string; // ISO Date YYYY-MM-DD
  verificationStatus: OfferVerificationStatus;
  source: string; // e.g., 'Official Dealer Bulletin Q4 2024'
  lastVerifiedDate: string;
  termsAndConditions: string[];
  eligibilityCriteria: string[];
  canBeCombined: boolean;
  exclusions: string[];
  isEstimate: boolean;
  status: OfferStatus;
  published: boolean;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  rejectionReason?: string;
  auditLog: OfferAuditEntry[];
}

export interface OfferFilterParams {
  search?: string;
  category?: OfferCategory | 'all';
  vehicleId?: string;
  dealerId?: string;
  region?: string;
  vehicleCondition?: VehicleConditionScope | 'all';
  minBenefit?: number;
  maxBenefit?: number;
  verificationStatus?: OfferVerificationStatus | 'all';
  includeExpired?: boolean;
  sortBy?: 'benefit_desc' | 'benefit_asc' | 'expiring_soon' | 'newest';
  page?: number;
  limit?: number;
}

export interface FinanceProvider {
  id: string;
  name: string;
  code: string;
  type: 'bank' | 'captive_nbfc' | 'credit_union';
  logoUrl?: string;
  supportedRegions: string[];
  headlineApr: number;
  minApr: number;
  maxApr: number;
  isFixedRate: boolean;
  minTenureMonths: number;
  maxTenureMonths: number;
  processingFeePercent: number;
  processingFeeMin: number;
  processingFeeMax: number;
  eligibilitySummary: string;
  source: string;
  isVerified: boolean;
  lastVerified: string;
  disclaimer: string;
}

export interface FinanceCalculationInputs {
  vehiclePrice: number;
  downPayment: number;
  downPaymentPercent: number;
  annualInterestRate: number; // e.g. 8.5 for 8.5%
  loanTenureMonths: number; // e.g. 60
  processingFee: number;
  otherUpfrontCharges: number;
  balloonPayment: number; // optional lump-sum balloon payment at end
  currency: CurrencyCode;
  priceBasis: PriceBasis;
  vehicleId?: string;
  vehicleTitle?: string;
  providerId?: string;
  providerName?: string;
}

export interface MonthlyAmortizationPoint {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface FinanceCalculationResult {
  vehiclePrice: number;
  downPayment: number;
  downPaymentPercent: number;
  loanPrincipal: number;
  annualInterestRate: number;
  loanTenureMonths: number;
  monthlyEmi: number;
  balloonPayment: number;
  totalScheduledRepayments: number; // (EMI * months) + balloonPayment
  totalInterest: number; // totalScheduledRepayments - loanPrincipal
  processingFee: number;
  otherUpfrontCharges: number;
  totalUpfrontOutlay: number; // downPayment + processingFee + otherUpfrontCharges
  totalFinancingOutlay: number; // totalUpfrontOutlay + totalScheduledRepayments
  effectiveAnnualRate: number;
  isZeroInterest: boolean;
  monthlyBreakdown: MonthlyAmortizationPoint[];
}

export interface FinanceScenario {
  id: string;
  name: string;
  inputs: FinanceCalculationInputs;
  result: FinanceCalculationResult;
  isVerifiedProvider: boolean;
}

export interface SavedFinanceScenario {
  id: string;
  userId: string;
  name: string;
  vehicleId?: string;
  vehicleTitle: string;
  inputs: FinanceCalculationInputs;
  result: FinanceCalculationResult;
  notes?: string;
  calculationVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceSystemSettings {
  minInterestRate: number; // e.g. 0%
  maxInterestRate: number; // e.g. 30%
  defaultInterestRate: number; // e.g. 8.5%
  minTenureMonths: number; // e.g. 6
  maxTenureMonths: number; // e.g. 120
  defaultTenureMonths: number; // e.g. 60
  defaultDownPaymentPercent: number; // e.g. 20%
  defaultProcessingFeePercent: number; // e.g. 1.0%
  allowBalloonPayments: boolean;
  supportedCurrencies: CurrencyCode[];
  verifiedProviders: FinanceProvider[];
  lastUpdated: string;
  updatedBy: string;
}
