// AutoVerse Stage 14: Community, Owner Reviews, Ratings & Verification Data Contracts

export type OwnershipDuration =
  | 'less_than_6_months'
  | '6_to_12_months'
  | '1_to_2_years'
  | '2_to_5_years'
  | '5_plus_years';

export type DrivingCondition =
  | 'city_commuter'
  | 'highway_cruiser'
  | 'mixed_daily'
  | 'spirited_track'
  | 'rural_offroad';

export type VerificationStatus =
  | 'not_verified'
  | 'pending'
  | 'verification_pending'
  | 'verified'
  | 'rejected';

export type ReviewStatus = 'published' | 'hidden' | 'flagged' | 'deleted';

export type DiscussionCategory =
  | 'general'
  | 'troubleshooting'
  | 'modifications'
  | 'buying_advice'
  | 'range_efficiency'
  | 'maintenance';

export type DiscussionStatus = 'active' | 'locked' | 'hidden' | 'flagged' | 'deleted';

export type ReportReason =
  | 'spam'
  | 'abusive_harassment'
  | 'misleading_false_info'
  | 'inappropriate'
  | 'commercial_solicitation';

export type ReportStatus = 'pending' | 'dismissed' | 'actioned';

export type DocumentType =
  | 'registration_certificate'
  | 'purchase_invoice'
  | 'insurance_policy'
  | 'title_deed';

export interface CategoryRatings {
  comfort?: number;
  performance?: number;
  reliability?: number;
  practicality?: number;
  technology?: number;
  valueForMoney?: number;
}

export interface ReviewCategoryRatings extends CategoryRatings {}

export interface OwnershipCostObservations {
  fuelEconomyObserved?: string;
  annualMaintenanceCost?: string;
  insuranceExperience?: string;
  unexpectedRepairs?: string;
}

export interface VerificationDetails {
  vinMasked?: string; // e.g. "WP0AB2Y1***4928" (strictly masked for public safety)
  documentType?: DocumentType;
  proofReference?: string; // Internal audit reference token
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  verifiedBadgeExplanation?: string;
}

export interface OwnerReview {
  id: string;
  vehicleSlug: string;
  vehicleModel: string;
  vehicleBrand: string;
  vehicleVariant: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  overallRating: number; // 1.0 - 5.0
  categoryRatings?: CategoryRatings;
  ownershipDuration: OwnershipDuration;
  drivingConditions: DrivingCondition;
  approximateMileage?: string;
  title: string;
  writtenExperience: string;
  pros: string[];
  cons: string[];
  ownershipCostObservations?: OwnershipCostObservations;
  verificationStatus: VerificationStatus;
  verificationDetails?: VerificationDetails;
  status: ReviewStatus;
  helpfulCount: number;
  notHelpfulCount: number;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleDiscussion {
  id: string;
  vehicleSlug: string;
  vehicleModel: string;
  vehicleBrand: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isVerifiedOwner: boolean;
  title: string;
  content: string;
  category: DiscussionCategory;
  tags: string[];
  status: DiscussionStatus;
  helpfulVotes: number;
  replyCount: number;
  reportCount: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isVerifiedOwner: boolean;
  content: string;
  helpfulVotes: number;
  reportCount: number;
  status: 'active' | 'hidden' | 'flagged';
  createdAt: string;
  updatedAt: string;
}

export interface HelpfulVote {
  id: string;
  userId: string;
  targetType: 'review' | 'discussion' | 'reply';
  targetId: string;
  voteType: 'helpful' | 'not_helpful';
  createdAt: string;
}

export interface SavedCommunityItem {
  id: string;
  userId: string;
  itemType: 'review' | 'discussion';
  itemId: string;
  savedAt: string;
}

export interface ContentReport {
  id: string;
  reporterId: string;
  reporterName?: string;
  targetType: 'review' | 'discussion' | 'reply';
  targetId: string;
  targetTitle?: string;
  vehicleSlug?: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  actionTaken?: 'hidden' | 'deleted' | 'dismissed';
  moderatedBy?: string;
  moderatedAt?: string;
  moderationNotes?: string;
  createdAt: string;
}

export interface OwnershipVerificationRequest {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  vehicleSlug: string;
  vehicleModel: string;
  documentType: DocumentType;
  vinMasked: string;
  proofReference: string; // Token reference, sensitive files are restricted
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewerNotes?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface VehicleCommunitySummary {
  vehicleSlug: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  categoryAverages: {
    comfort: number;
    performance: number;
    reliability: number;
    practicality: number;
    technology: number;
    valueForMoney: number;
  };
  verifiedOwnerReviewsCount: number;
  totalDiscussions: number;
  isSampleSmall: boolean;
  topPros: { text: string; count: number }[];
  topCons: { text: string; count: number }[];
}

export interface CommunityFilterOptions {
  searchQuery?: string;
  vehicleSlug?: string;
  brand?: string;
  powertrain?: string;
  bodyType?: string;
  ownershipDuration?: OwnershipDuration | 'all';
  minRating?: number;
  verifiedOnly?: boolean;
  sortBy?: 'newest' | 'highest_rated' | 'most_helpful' | 'longest_ownership';
}
