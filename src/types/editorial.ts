// AutoVerse Stage 13: Automotive News, Reviews & Launches Data Contracts
// Author profiles, articles, category definitions, road test rubrics, and launch verification models

export type ArticleType = 'news' | 'review' | 'launch' | 'opinion' | 'sponsored' | 'analysis';

export type ArticleCategory =
  | 'all'
  | 'ev'
  | 'hybrid'
  | 'performance'
  | 'luxury'
  | 'motorsport'
  | 'technology'
  | 'indian_auto'
  | 'industry';

export type PublicationStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

export type VerificationStatus = 'officially_confirmed' | 'credible_source' | 'rumoured';

export interface SourceReference {
  title: string;
  publisher: string;
  url: string;
  checkedDate: string;
  isOfficialBureau?: boolean;
}

export interface AuthorProfile {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  bio: string;
  verifiedCredentials?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: string; // Markdown / structured content with headings
  excerpt: string;
  category: ArticleCategory;
  tags: string[];
  author: AuthorProfile;
  heroImage: string;
  imageCaption: string;
  imageCredit: string;
  publicationStatus: PublicationStatus;
  publishedAt: string;
  updatedAt?: string;
  readingTimeMinutes: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  relatedVehicleSlugs: string[];
  sourceReferences: SourceReference[];
  articleType: ArticleType;
}

export interface ReviewCategoryScores {
  exteriorDesign: number; // 0-10
  interiorComfort: number; // 0-10
  technology: number; // 0-10
  performance: number; // 0-10
  practicality: number; // 0-10
  safety: number; // 0-10
}

export interface CarReview {
  id: string;
  slug: string;
  title: string;
  vehicleSlug: string;
  variant: string;
  overallScore: number; // 0-10 weighted score
  categoryScores: ReviewCategoryScores;
  verdictSummary: string;
  strengths: string[];
  weaknesses: string[];
  suitableBuyerProfile: string;
  realWorldConsiderations: string;
  reviewerNotes: string;
  testedTrim: string;
  testConditions: string;
  reviewDate: string;
  author: AuthorProfile;
  publicationStatus: PublicationStatus;
  heroImage: string;
  verifiedSpecs: {
    acceleration0to60: string;
    topSpeed: string;
    testedEfficiency: string;
    weight: string;
  };
}

export interface LaunchRecord {
  id: string;
  vehicleName: string;
  manufacturer: string;
  model: string;
  variant: string;
  modelYear: number;
  announcementDate: string;
  marketLaunchDate: string;
  expectedDelivery: string;
  market: string;
  status: 'announced' | 'available' | 'upcoming';
  verificationStatus: VerificationStatus;
  powertrain: 'electric' | 'hybrid' | 'petrol' | 'diesel';
  category: string;
  startingPrice?: number;
  currency?: string;
  headline: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  sourceCheckedDate: string;
  image: string;
  relatedVehicleSlug?: string;
}

export interface ReadingListItem {
  id: string;
  userId: string;
  articleId: string;
  savedAt: string;
}
