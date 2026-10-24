// AutoVerse Stage 17: Automotive Safety Intelligence & Recall Alerts Type System

export type SafetySeverity = 'critical' | 'high' | 'moderate' | 'low';
export type SafetyCategory = 'recall' | 'service_campaign' | 'safety_advisory';
export type GeographicMarket = 'India' | 'USA' | 'Global' | 'Europe';
export type RemedyStatus = 'available_free' | 'software_ota' | 'parts_pending' | 'under_investigation';
export type MatchClassification = 'confirmed_match' | 'potential_match' | 'insufficient_info' | 'no_match';

export interface OfficialRecall {
  id: string; // e.g. 'RCL-2024-NHTSA-473', 'RCL-2024-MORTH-412'
  slug: string; // URL friendly identifier
  officialCampaignNumber: string; // e.g. '24V-473', 'MORTH/REC/2024/0412'
  title: string;
  category: SafetyCategory;
  severity: SafetySeverity;
  manufacturer: string;
  make: string;
  model: string;
  affectedVehicleSlugs: string[]; // matches AutoVerse vehicle id / slug
  modelYears: number[];
  productionRange?: { from: string; to: string };
  affectedVariants?: string[];
  estimatedUnitsAffected: number;
  market: GeographicMarket;
  sourceAuthority: 'MoRTH' | 'NHTSA' | 'Euro NCAP' | 'SIAM' | 'Bharat NCAP';
  sourceUrl: string;
  publishedDate: string; // ISO date format
  lastVerifiedDate: string;
  retrievedAt: string;
  defectSummary: string;
  safetyRiskConsequence: string;
  remedyDescription: string;
  remedyStatus: RemedyStatus;
  isFreeDealerRepair: boolean;
  manufacturerHotline?: string;
  officialCheckUrl?: string;
  status: 'active' | 'in_progress' | 'completed' | 'archived';
  adminReviewFlag?: boolean;
  notes?: string;
}

export interface UserSafetyAlert {
  id: string;
  userId: string;
  vehicleSlug: string;
  vehicleName: string;
  recallId: string;
  recallTitle: string;
  severity: SafetySeverity;
  category: SafetyCategory;
  matchClassification: MatchClassification;
  matchReason: string;
  createdAt: string;
  isReviewed: boolean;
  reviewedAt?: string;
  officialUrl: string;
  actionTaken?: 'none' | 'dealer_contacted' | 'repaired' | 'dismissed';
}

export interface SafetySourceConfig {
  id: string;
  name: string;
  authority: 'MoRTH' | 'NHTSA' | 'Euro NCAP' | 'SIAM' | 'Bharat NCAP';
  market: GeographicMarket;
  endpoint: string;
  status: 'operational' | 'degraded' | 'offline';
  syncIntervalHours: number;
  lastSyncTimestamp: string;
  recordsCount: number;
  enabled: boolean;
}

export interface SafetySyncLog {
  id: string;
  timestamp: string;
  sourceId: string;
  sourceName: string;
  status: 'success' | 'partial' | 'failed';
  recordsIngested: number;
  recordsUpdated: number;
  durationMs: number;
  notes: string;
}

export interface VehicleSafetyProfile {
  vehicleSlug: string;
  vehicleName: string;
  make: string;
  model: string;
  bharatNcapStars?: number;
  euroNcapStars?: number;
  adultOccupantScore?: string;
  childOccupantScore?: string;
  activeRecallsCount: number;
  serviceCampaignsCount: number;
  advisoriesCount: number;
  recalls: OfficialRecall[];
  lastAuditDate: string;
}
