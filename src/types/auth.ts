// AutoVerse Stage 6: Authentication, User Profiles & Garage Interfaces

export type UserRole = 'admin' | 'driver';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpiresAt: number | null;
  verificationOtp?: string | null;
  verificationPhone?: string | null;
  otpExpiresAt?: number | null;
  resetToken: string | null;
  resetTokenExpiresAt: number | null;
  createdAt: string;
  lastLoginAt: string | null;
  favoriteBrand?: string;
  drivingPreference?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UserPublicProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  favoriteBrand?: string;
  drivingPreference?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  expiresAt: number;
  rememberMe: boolean;
}

export interface SavedComparison {
  id: string;
  name: string;
  slugs: string[];
  savedAt: string;
}

export interface SavedConfiguration {
  id: string;
  vehicleSlug: string;
  vehicleName: string;
  variantId: string;
  variantName: string;
  paintId: string;
  paintName: string;
  paintHex: string;
  wheelId: string;
  wheelName: string;
  interiorId: string;
  interiorName: string;
  packageIds: string[];
  totalPrice: number;
  currency: string;
  savedAt: string;
  customName?: string;
}

export interface UserGarageData {
  userId: string;
  savedSlugs: string[];
  favoriteSlugs: string[];
  savedComparisons: SavedComparison[];
  savedConfigurations?: SavedConfiguration[];
  recentlyViewed: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserPublicProfile;
  token?: string;
  verificationPending?: boolean;
  verificationOtp?: string;
}
