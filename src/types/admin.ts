// AutoVerse Stage 7: Administration Dashboard, Vehicle Management & Content Publishing
// Data models for Administrative Operations, Content Lifecycle, and Tamper-Evident Audit Logging

import type { UserRole } from './auth';

export type ContentStatus = 'draft' | 'published' | 'unpublished' | 'archived';

export interface AdminActor {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export type AdminActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'ARCHIVE'
  | 'RESTORE'
  | 'ROLE_CHANGE'
  | 'STATUS_CHANGE'
  | 'CONFIG_CHANGE';

export type AdminTargetType =
  | 'vehicle'
  | 'manufacturer'
  | 'launch'
  | 'cinema_film'
  | 'user'
  | 'settings'
  | 'article'
  | 'review';

export interface AdminActivityLog {
  id: string;
  actor: AdminActor;
  action: AdminActionType;
  targetType: AdminTargetType;
  targetId: string;
  targetName: string;
  timestamp: string;
  details: string;
  metadata?: Record<string, unknown>;
}

export interface AdminDashboardMetrics {
  totalVehicles: number;
  publishedVehicles: number;
  draftVehicles: number;
  archivedVehicles: number;
  totalManufacturers: number;
  totalLaunches: number;
  totalFilms: number;
  totalUsers: number;
  activeUsers: number;
  adminUsersCount: number;
}

export interface SystemSettings {
  siteName: string;
  contactEmail: string;
  telemetryUnit: 'imperial' | 'metric';
  defaultCurrency: 'USD' | 'EUR' | 'GBP';
  maintenanceMode: boolean;
  allowPublicRegistrations: boolean;
  enforceVerifiedEmail: boolean;
  enableRoadCinemaAutoPlay: boolean;
  lastUpdated: string;
  lastUpdatedBy: string;
}
