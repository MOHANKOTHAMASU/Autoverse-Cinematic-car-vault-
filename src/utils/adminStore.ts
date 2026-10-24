// AutoVerse Stage 7: Centralized Administration Store & Audit Activity Engine
// Manages Vehicle CRUD, Marque Publishing, Cinema Reels, Launch Calendars, Audit Logging & Settings

import type { Vehicle, Manufacturer, LaunchItem } from '../types';
import type { CinemaFilm } from '../data/cinemaVideos';
import type {
  AdminActivityLog,
  AdminActionType,
  AdminTargetType,
  AdminDashboardMetrics,
  SystemSettings,
  ContentStatus,
} from '../types/admin';
import { VEHICLES as DEFAULT_VEHICLES } from '../data/vehicles';
import { MANUFACTURERS as DEFAULT_MANUFACTURERS } from '../data/manufacturers';
import { LAUNCHES as DEFAULT_LAUNCHES } from '../data/launches';
import { CINEMA_FILMS as DEFAULT_FILMS } from '../data/cinemaVideos';
import { getCurrentAdmin, getUsersFromDB } from './auth';

// Storage Keys
const VEHICLES_STORAGE_KEY = 'autoverse_vehicles_db';
const VEHICLES_VERSION_KEY = 'autoverse_vehicles_db_version';
const CURRENT_VEHICLES_VERSION = 'v14_real_models_360_view';
const MANUFACTURERS_STORAGE_KEY = 'autoverse_manufacturers_db';
const LAUNCHES_STORAGE_KEY = 'autoverse_launches_db';
const CINEMA_STORAGE_KEY = 'autoverse_cinema_db';
const ACTIVITY_LOGS_STORAGE_KEY = 'autoverse_activity_logs_db';
const SETTINGS_STORAGE_KEY = 'autoverse_system_settings_db';

// Default Platform Settings
const DEFAULT_SETTINGS: SystemSettings = {
  siteName: 'AutoVerse',
  contactEmail: 'concierge@autoverse.com',
  telemetryUnit: 'imperial',
  defaultCurrency: 'USD',
  maintenanceMode: false,
  allowPublicRegistrations: true,
  enforceVerifiedEmail: false,
  enableRoadCinemaAutoPlay: true,
  lastUpdated: new Date().toISOString(),
  lastUpdatedBy: 'System Init',
};

// ==========================================
// 1. AUDIT ACTIVITY LOGGING ENGINE
// ==========================================

export function getAdminActivityLogs(): AdminActivityLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ACTIVITY_LOGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logAdminActivity(
  action: AdminActionType,
  targetType: AdminTargetType,
  targetId: string,
  targetName: string,
  details: string,
  metadata?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  try {
    const currentAdmin = getCurrentAdmin() || {
      id: 'system_root',
      fullName: 'System Automation',
      email: 'admin@autoverse.com',
      role: 'admin' as const,
      status: 'active' as const,
      isVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };

    const newLog: AdminActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      actor: {
        id: currentAdmin.id,
        email: currentAdmin.email,
        fullName: currentAdmin.fullName,
        role: currentAdmin.role,
      },
      action,
      targetType,
      targetId,
      targetName,
      timestamp: new Date().toISOString(),
      details,
      metadata,
    };

    const logs = getAdminActivityLogs();
    logs.unshift(newLog); // Prepend for chronological order
    // Cap at 200 items for high performance
    const capped = logs.slice(0, 200);
    localStorage.setItem(ACTIVITY_LOGS_STORAGE_KEY, JSON.stringify(capped));
    window.dispatchEvent(new CustomEvent('autoverse_admin_activity_updated', { detail: newLog }));
  } catch (err) {
    console.error('Failed to record admin activity log:', err);
  }
}

// ==========================================
// 2. VEHICLE REPOSITORY (ADMIN & PUBLIC)
// ==========================================

export function getAdminVehicles(): Vehicle[] {
  if (typeof window === 'undefined') return DEFAULT_VEHICLES;
  try {
    const raw = localStorage.getItem(VEHICLES_STORAGE_KEY);
    const storedVersion = localStorage.getItem(VEHICLES_VERSION_KEY);
    const defaultSlugMap = new Map<string, Vehicle>(
      DEFAULT_VEHICLES.map((v) => [v.slug || v.id, v])
    );

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Detect if cache has stale palm-tree / generic images or needs version bump
        const hasStaleImages = parsed.some((v: Vehicle) => 
          (typeof v.heroImage === 'string' && (v.heroImage.includes('544829099') || v.heroImage.includes('549399542'))) ||
          (typeof v.thumbnail === 'string' && (v.thumbnail.includes('544829099') || v.thumbnail.includes('549399542'))) ||
          !v.imageGallery || v.imageGallery.length < 4
        );

        if (storedVersion === CURRENT_VEHICLES_VERSION && !hasStaleImages && parsed.length >= DEFAULT_VEHICLES.length) {
          return parsed;
        }

        // Upgrade and synchronize real vehicle photography while preserving custom user data
        const upgraded: Vehicle[] = parsed.map((item: Vehicle) => {
          const canonical = defaultSlugMap.get(item.slug) || defaultSlugMap.get(item.id);
          if (canonical) {
            return {
              ...item,
              heroImage: canonical.heroImage,
              thumbnail: canonical.thumbnail,
              sideImage: canonical.sideImage || canonical.heroImage,
              interiorImage: canonical.interiorImage,
              imageGallery: canonical.imageGallery,
              publicationStatus: (item.publicationStatus || canonical.publicationStatus || 'published') as ContentStatus,
            };
          }
          return item;
        });

        // Add any missing default vehicles
        const upgradedSlugs = new Set(upgraded.map((v) => v.slug || v.id));
        for (const def of DEFAULT_VEHICLES) {
          if (!upgradedSlugs.has(def.slug) && !upgradedSlugs.has(def.id)) {
            upgraded.push({
              ...def,
              publicationStatus: (def.publicationStatus || 'published') as ContentStatus,
            });
          }
        }

        localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(upgraded));
        localStorage.setItem(VEHICLES_VERSION_KEY, CURRENT_VEHICLES_VERSION);
        return upgraded;
      }
    }

    // Initialize default set if empty
    const normalized = DEFAULT_VEHICLES.map((v) => ({
      ...v,
      publicationStatus: (v.publicationStatus || 'published') as ContentStatus,
    }));
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(normalized));
    localStorage.setItem(VEHICLES_VERSION_KEY, CURRENT_VEHICLES_VERSION);
    return normalized;
  } catch {
    return DEFAULT_VEHICLES;
  }
}

export function getPublicVehicles(): Vehicle[] {
  return getAdminVehicles().filter(
    (v) => (v.publicationStatus || 'published') === 'published'
  );
}

export function saveAdminVehicle(vehicle: Vehicle): { success: boolean; message: string; vehicle: Vehicle } {
  const vehicles = getAdminVehicles();
  const isExisting = vehicles.findIndex((v) => v.id === vehicle.id || v.slug === vehicle.slug);

  const normalized: Vehicle = {
    ...vehicle,
    publicationStatus: vehicle.publicationStatus || 'published',
    lastVerifiedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };

  if (isExisting >= 0) {
    vehicles[isExisting] = normalized;
    logAdminActivity(
      'UPDATE',
      'vehicle',
      normalized.id,
      `${normalized.brand} ${normalized.model} ${normalized.variant}`,
      `Vehicle specifications and content updated.`
    );
  } else {
    vehicles.unshift(normalized);
    logAdminActivity(
      'CREATE',
      'vehicle',
      normalized.id,
      `${normalized.brand} ${normalized.model} ${normalized.variant}`,
      `Created new vehicle entry in catalog.`
    );
  }

  localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
  window.dispatchEvent(new CustomEvent('autoverse_vehicles_updated'));
  return {
    success: true,
    message: isExisting >= 0 ? 'Vehicle updated successfully.' : 'Vehicle added to catalog.',
    vehicle: normalized,
  };
}

export function toggleVehiclePublication(idOrSlug: string): { success: boolean; newStatus: ContentStatus } {
  const vehicles = getAdminVehicles();
  const v = vehicles.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
  if (!v) throw new Error('Vehicle not found.');

  const currentStatus = v.publicationStatus || 'published';
  const newStatus: ContentStatus = currentStatus === 'published' ? 'draft' : 'published';
  v.publicationStatus = newStatus;

  localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
  logAdminActivity(
    newStatus === 'published' ? 'PUBLISH' : 'UNPUBLISH',
    'vehicle',
    v.id,
    `${v.brand} ${v.model} ${v.variant}`,
    `Vehicle status changed to ${newStatus}.`
  );

  window.dispatchEvent(new CustomEvent('autoverse_vehicles_updated'));
  return { success: true, newStatus };
}

export function archiveVehicle(idOrSlug: string): { success: boolean } {
  const vehicles = getAdminVehicles();
  const v = vehicles.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
  if (!v) throw new Error('Vehicle not found.');

  v.publicationStatus = 'archived';
  localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
  logAdminActivity(
    'ARCHIVE',
    'vehicle',
    v.id,
    `${v.brand} ${v.model} ${v.variant}`,
    `Vehicle moved to archive.`
  );

  window.dispatchEvent(new CustomEvent('autoverse_vehicles_updated'));
  return { success: true };
}

export function restoreVehicle(idOrSlug: string): { success: boolean } {
  const vehicles = getAdminVehicles();
  const v = vehicles.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
  if (!v) throw new Error('Vehicle not found.');

  v.publicationStatus = 'published';
  localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
  logAdminActivity(
    'RESTORE',
    'vehicle',
    v.id,
    `${v.brand} ${v.model} ${v.variant}`,
    `Vehicle restored from archive to active catalog.`
  );

  window.dispatchEvent(new CustomEvent('autoverse_vehicles_updated'));
  return { success: true };
}

export function deleteVehicle(idOrSlug: string): { success: boolean; message: string } {
  let vehicles = getAdminVehicles();
  const target = vehicles.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
  if (!target) return { success: false, message: 'Vehicle not found.' };

  vehicles = vehicles.filter((item) => item.id !== idOrSlug && item.slug !== idOrSlug);
  localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));

  logAdminActivity(
    'DELETE',
    'vehicle',
    target.id,
    `${target.brand} ${target.model} ${target.variant}`,
    `Vehicle record permanently removed from registry.`
  );

  window.dispatchEvent(new CustomEvent('autoverse_vehicles_updated'));
  return { success: true, message: 'Vehicle deleted permanently.' };
}

// ==========================================
// 3. MANUFACTURER REPOSITORY
// ==========================================

export function getAdminManufacturers(): Manufacturer[] {
  if (typeof window === 'undefined') return DEFAULT_MANUFACTURERS;
  try {
    const raw = localStorage.getItem(MANUFACTURERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const normalized = DEFAULT_MANUFACTURERS.map((m) => ({
      ...m,
      publicationStatus: (m.publicationStatus || 'published') as ContentStatus,
    }));
    localStorage.setItem(MANUFACTURERS_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    return DEFAULT_MANUFACTURERS;
  }
}

export function saveAdminManufacturer(m: Manufacturer): { success: boolean; message: string } {
  const list = getAdminManufacturers();
  const idx = list.findIndex((item) => item.id === m.id);

  if (idx >= 0) {
    list[idx] = m;
    logAdminActivity(
      'UPDATE',
      'manufacturer',
      m.id,
      m.name,
      `Manufacturer profile and flagship focus updated.`
    );
  } else {
    list.push(m);
    logAdminActivity(
      'CREATE',
      'manufacturer',
      m.id,
      m.name,
      `New automotive manufacturer registered in system.`
    );
  }

  localStorage.setItem(MANUFACTURERS_STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('autoverse_manufacturers_updated'));
  return { success: true, message: 'Manufacturer saved successfully.' };
}

export function deleteManufacturer(id: string): { success: boolean; message: string } {
  // Referential Integrity Check: Ensure no vehicles reference this manufacturer
  const vehicles = getAdminVehicles();
  const linkedVehicles = vehicles.filter(
    (v) =>
      v.manufacturerId === id ||
      v.brand.toLowerCase() === id.toLowerCase() ||
      v.manufacturerName.toLowerCase() === id.toLowerCase()
  );

  if (linkedVehicles.length > 0) {
    return {
      success: false,
      message: `Integrity Protection: Cannot delete manufacturer "${id}" because ${linkedVehicles.length} vehicles are currently associated with it. Please reassign or delete these vehicles first.`,
    };
  }

  let list = getAdminManufacturers();
  const target = list.find((m) => m.id === id);
  if (!target) return { success: false, message: 'Manufacturer not found.' };

  list = list.filter((m) => m.id !== id);
  localStorage.setItem(MANUFACTURERS_STORAGE_KEY, JSON.stringify(list));

  logAdminActivity(
    'DELETE',
    'manufacturer',
    target.id,
    target.name,
    `Manufacturer profile removed from system.`
  );

  window.dispatchEvent(new CustomEvent('autoverse_manufacturers_updated'));
  return { success: true, message: 'Manufacturer deleted successfully.' };
}

// ==========================================
// 4. LATEST LAUNCHES REPOSITORY
// ==========================================

export function getAdminLaunches(): LaunchItem[] {
  if (typeof window === 'undefined') return DEFAULT_LAUNCHES;
  try {
    const raw = localStorage.getItem(LAUNCHES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const normalized = DEFAULT_LAUNCHES.map((l) => ({
      ...l,
      publicationStatus: (l.publicationStatus || 'published') as ContentStatus,
    }));
    localStorage.setItem(LAUNCHES_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    return DEFAULT_LAUNCHES;
  }
}

export function saveAdminLaunch(launch: LaunchItem): { success: boolean; message: string } {
  const list = getAdminLaunches();
  const idx = list.findIndex((item) => item.id === launch.id);

  if (idx >= 0) {
    list[idx] = launch;
    logAdminActivity(
      'UPDATE',
      'launch',
      launch.id,
      launch.vehicleName,
      `Launch announcement timeline and release data updated.`
    );
  } else {
    list.unshift(launch);
    logAdminActivity(
      'CREATE',
      'launch',
      launch.id,
      launch.vehicleName,
      `New vehicle premiere registered on Launch calendar.`
    );
  }

  localStorage.setItem(LAUNCHES_STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('autoverse_launches_updated'));
  return { success: true, message: 'Launch entry saved.' };
}

export function deleteAdminLaunch(id: string): { success: boolean } {
  let list = getAdminLaunches();
  const target = list.find((item) => item.id === id);
  if (!target) return { success: false };

  list = list.filter((item) => item.id !== id);
  localStorage.setItem(LAUNCHES_STORAGE_KEY, JSON.stringify(list));

  logAdminActivity(
    'DELETE',
    'launch',
    target.id,
    target.vehicleName,
    `Launch calendar entry deleted.`
  );

  window.dispatchEvent(new CustomEvent('autoverse_launches_updated'));
  return { success: true };
}

// ==========================================
// 5. ROAD CINEMA FILMS REPOSITORY
// ==========================================

export function getAdminCinemaFilms(): CinemaFilm[] {
  if (typeof window === 'undefined') return DEFAULT_FILMS;
  try {
    const raw = localStorage.getItem(CINEMA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const normalized = DEFAULT_FILMS.map((f) => ({
      ...f,
      publicationStatus: (f.publicationStatus || 'published') as ContentStatus,
    }));
    localStorage.setItem(CINEMA_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    return DEFAULT_FILMS;
  }
}

export function saveAdminCinemaFilm(film: CinemaFilm): { success: boolean; message: string } {
  const list = getAdminCinemaFilms();
  const idx = list.findIndex((item) => item.id === film.id);

  if (idx >= 0) {
    list[idx] = film;
    logAdminActivity(
      'UPDATE',
      'cinema_film',
      film.id,
      film.title,
      `Road Cinema reel metadata and video stream sources updated.`
    );
  } else {
    list.unshift(film);
    logAdminActivity(
      'CREATE',
      'cinema_film',
      film.id,
      film.title,
      `New automotive film reel published to Road Cinema library.`
    );
  }

  localStorage.setItem(CINEMA_STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('autoverse_cinema_updated'));
  return { success: true, message: 'Cinema film saved.' };
}

export function deleteAdminCinemaFilm(id: string): { success: boolean } {
  let list = getAdminCinemaFilms();
  const target = list.find((item) => item.id === id);
  if (!target) return { success: false };

  list = list.filter((item) => item.id !== id);
  localStorage.setItem(CINEMA_STORAGE_KEY, JSON.stringify(list));

  logAdminActivity(
    'DELETE',
    'cinema_film',
    target.id,
    target.title,
    `Cinema film removed from library.`
  );

  window.dispatchEvent(new CustomEvent('autoverse_cinema_updated'));
  return { success: true };
}

// ==========================================
// 6. SYSTEM SETTINGS
// ==========================================

export function getSystemSettings(): SystemSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSystemSettings(settings: Partial<SystemSettings>): { success: boolean } {
  const current = getSystemSettings();
  const currentAdmin = getCurrentAdmin();
  const updated: SystemSettings = {
    ...current,
    ...settings,
    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: currentAdmin?.fullName || 'Administrator',
  };

  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
  logAdminActivity(
    'CONFIG_CHANGE',
    'settings',
    'system_settings',
    'System Preferences',
    `Platform configuration settings modified.`
  );
  return { success: true };
}

// ==========================================
// 7. DASHBOARD METRICS CALCULATION
// ==========================================

export function getDashboardMetrics(): AdminDashboardMetrics {
  const vehicles = getAdminVehicles();
  const manufacturers = getAdminManufacturers();
  const launches = getAdminLaunches();
  const films = getAdminCinemaFilms();
  const users = getUsersFromDB();

  const publishedVehicles = vehicles.filter(
    (v) => (v.publicationStatus || 'published') === 'published'
  ).length;
  const draftVehicles = vehicles.filter((v) => v.publicationStatus === 'draft').length;
  const archivedVehicles = vehicles.filter((v) => v.publicationStatus === 'archived').length;

  const activeUsers = users.filter((u) => u.status === 'active').length;
  const adminUsersCount = users.filter((u) => u.role === 'admin').length;

  return {
    totalVehicles: vehicles.length,
    publishedVehicles,
    draftVehicles,
    archivedVehicles,
    totalManufacturers: manufacturers.length,
    totalLaunches: launches.length,
    totalFilms: films.length,
    totalUsers: users.length,
    activeUsers,
    adminUsersCount,
  };
}
