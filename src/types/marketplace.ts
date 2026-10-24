// AutoVerse Stage 21: Used-Car Marketplace Types
// Comprehensive data contracts for vehicle listings, seller workflows, buyer enquiries, and admin moderation.

export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'rejected'
  | 'paused'
  | 'sold'
  | 'expired'
  | 'removed';

export type SellerType = 'individual' | 'dealer';

export type MarketplaceCurrency = 'INR' | 'USD' | 'EUR' | 'GBP';

export type VehicleCondition = 'excellent' | 'very_good' | 'good' | 'fair';

export type ServiceHistoryType = 'full_oem' | 'partial_oem' | 'independent_records' | 'none';

export interface ListingAuditEntry {
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: 'seller' | 'admin' | 'system';
  action: string;
  notes?: string;
  previousStatus?: ListingStatus;
  newStatus?: ListingStatus;
}

export interface MarketplaceListing {
  id: string;
  slug: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string; // Kept private, never exposed in public responses
  sellerPhone?: string; // Kept private, shared only with enquiry consent
  sellerType: SellerType;
  vehicleSlug?: string; // Optional foreign link to official catalog vehicle
  make: string;
  model: string;
  variant: string;
  year: number;
  askingPrice: number;
  currency: MarketplaceCurrency;
  mileageKm: number;
  fuelType: 'electric' | 'petrol' | 'diesel' | 'hybrid' | 'plug_in_hybrid';
  transmission: 'automatic' | 'manual' | 'dual_clutch' | 'single_speed';
  bodyType: 'sedan' | 'suv' | 'coupe' | 'convertible' | 'hatchback' | 'estate' | 'truck';
  color: string;
  previousOwners: number;
  locationCity: string;
  locationState?: string;
  locationCountry: string;
  registrationRegionMasked?: string; // e.g. "MH-02-****" or "KA-01-****"
  images: string[];
  featuredImage: string;
  overallCondition: VehicleCondition;
  declaredDefects: string;
  serviceHistory: ServiceHistoryType;
  serviceHistoryNotes?: string;
  description: string;
  features: string[];
  reasonForSelling?: string;
  status: ListingStatus;
  rejectionReason?: string;
  moderatorNotes?: string;
  viewsCount: number;
  enquiriesCount: number;
  featured?: boolean;
  verifiedSeller?: boolean;
  createdAt: string;
  updatedAt: string;
  auditHistory: ListingAuditEntry[];
}

export interface MarketplaceEnquiry {
  id: string;
  listingId: string;
  listingTitle: string;
  listingSlug: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  sellerId: string;
  message: string;
  offeredPrice?: number;
  preferredContact: 'email' | 'phone' | 'in_app';
  consentGiven: boolean;
  status: 'pending' | 'read' | 'replied' | 'closed';
  sellerReply?: string;
  sellerRepliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportReason =
  | 'misleading_condition'
  | 'pricing_fraud'
  | 'suspected_duplicate'
  | 'stolen_unauthorized'
  | 'inappropriate_content'
  | 'other';

export interface MarketplaceReport {
  id: string;
  listingId: string;
  listingTitle: string;
  reporterId: string;
  reporterEmail: string;
  reason: ReportReason;
  details: string;
  status: 'pending' | 'investigated' | 'action_taken' | 'dismissed';
  moderatorNotes?: string;
  actionTaken?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface SavedListing {
  userId: string;
  listingId: string;
  savedAt: string;
}

export interface MarketplaceFilterParams {
  search?: string;
  make?: string;
  model?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  city?: string;
  sellerType?: string;
  condition?: string;
  currency?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'mileage_asc' | 'year_desc';
  page?: number;
  pageSize?: number;
}

export interface CreateListingPayload {
  vehicleSlug?: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  askingPrice: number;
  currency: MarketplaceCurrency;
  mileageKm: number;
  fuelType: 'electric' | 'petrol' | 'diesel' | 'hybrid' | 'plug_in_hybrid';
  transmission: 'automatic' | 'manual' | 'dual_clutch' | 'single_speed';
  bodyType: 'sedan' | 'suv' | 'coupe' | 'convertible' | 'hatchback' | 'estate' | 'truck';
  color: string;
  previousOwners: number;
  locationCity: string;
  locationState?: string;
  locationCountry: string;
  registrationRegionMasked?: string;
  images: string[];
  overallCondition: VehicleCondition;
  declaredDefects: string;
  serviceHistory: ServiceHistoryType;
  serviceHistoryNotes?: string;
  description: string;
  features: string[];
  reasonForSelling?: string;
  sellerType?: SellerType;
}

export interface CreateEnquiryPayload {
  listingId: string;
  message: string;
  offeredPrice?: number;
  preferredContact: 'email' | 'phone' | 'in_app';
  contactPhone?: string;
  consentGiven: boolean;
}

export interface CreateReportPayload {
  listingId: string;
  reason: ReportReason;
  details: string;
}
