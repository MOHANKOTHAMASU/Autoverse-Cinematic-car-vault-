// AutoVerse Stage 6 Unified Garage Persistence Layer
// Synchronizes both authenticated user cloud profiles and guest local storage

import { getActiveSession, getAllUserGarages, saveAllUserGarages, initializeUserGarage } from './auth';
import type { SavedComparison, SavedConfiguration } from '../types/auth';

const GUEST_GARAGE_KEY = 'autoverse_garage';
const GUEST_FAVORITES_KEY = 'autoverse_favorites';
const GUEST_RECENT_KEY = 'autoverse_recent_views';
const GUEST_COMPARISONS_KEY = 'autoverse_saved_comparisons';
const GUEST_CONFIGS_KEY = 'autoverse_saved_configurations';

const DEFAULT_SAVED_SLUGS = ['porsche-taycan-turbo-s', 'audi-rs-etron-gt'];

// 1. Saved Vehicles
export const getSavedGarageSlugs = (): string[] => {
  if (typeof window === 'undefined') return DEFAULT_SAVED_SLUGS;

  const session = getActiveSession();
  if (session) {
    const all = getAllUserGarages();
    initializeUserGarage(session.userId);
    return all[session.userId]?.savedSlugs || DEFAULT_SAVED_SLUGS;
  }

  // Guest storage
  try {
    const raw = localStorage.getItem(GUEST_GARAGE_KEY);
    if (!raw) {
      localStorage.setItem(GUEST_GARAGE_KEY, JSON.stringify(DEFAULT_SAVED_SLUGS));
      return DEFAULT_SAVED_SLUGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SAVED_SLUGS;
  } catch {
    return DEFAULT_SAVED_SLUGS;
  }
};

export const isCarInGarage = (slugOrId: string): boolean => {
  const saved = getSavedGarageSlugs();
  return saved.includes(slugOrId);
};

export const toggleCarInGarage = (slugOrId: string): boolean => {
  if (typeof window === 'undefined') return false;

  const session = getActiveSession();
  const saved = getSavedGarageSlugs();
  const exists = saved.includes(slugOrId);
  const updated = exists ? saved.filter((id) => id !== slugOrId) : [...saved, slugOrId];

  if (session) {
    const all = getAllUserGarages();
    initializeUserGarage(session.userId);
    all[session.userId].savedSlugs = updated;
    saveAllUserGarages(all);
  } else {
    localStorage.setItem(GUEST_GARAGE_KEY, JSON.stringify(updated));
  }

  window.dispatchEvent(new CustomEvent('autoverse_garage_updated', { detail: updated }));
  return !exists;
};

export const removeCarFromGarage = (slugOrId: string): void => {
  if (typeof window === 'undefined') return;

  const session = getActiveSession();
  const saved = getSavedGarageSlugs();
  const updated = saved.filter((id) => id !== slugOrId);

  if (session) {
    const all = getAllUserGarages();
    initializeUserGarage(session.userId);
    all[session.userId].savedSlugs = updated;
    saveAllUserGarages(all);
  } else {
    localStorage.setItem(GUEST_GARAGE_KEY, JSON.stringify(updated));
  }

  window.dispatchEvent(new CustomEvent('autoverse_garage_updated', { detail: updated }));
};

// 2. Favorite Vehicles
export const getFavoriteSlugs = (): string[] => {
  if (typeof window === 'undefined') return [];

  const session = getActiveSession();
  if (session) {
    const all = getAllUserGarages();
    initializeUserGarage(session.userId);
    return all[session.userId]?.favoriteSlugs || [];
  }

  try {
    const raw = localStorage.getItem(GUEST_FAVORITES_KEY);
    return raw ? JSON.parse(raw) : ['porsche-taycan-turbo-s'];
  } catch {
    return [];
  }
};

export const isFavorite = (slugOrId: string): boolean => {
  return getFavoriteSlugs().includes(slugOrId);
};

export const toggleFavorite = (slugOrId: string): boolean => {
  if (typeof window === 'undefined') return false;

  const session = getActiveSession();
  const favorites = getFavoriteSlugs();
  const exists = favorites.includes(slugOrId);
  const updated = exists ? favorites.filter((id) => id !== slugOrId) : [...favorites, slugOrId];

  if (session) {
    const all = getAllUserGarages();
    initializeUserGarage(session.userId);
    all[session.userId].favoriteSlugs = updated;
    saveAllUserGarages(all);
  } else {
    localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(updated));
  }

  window.dispatchEvent(new CustomEvent('autoverse_garage_updated', { detail: updated }));
  return !exists;
};

// 3. Recently Viewed Vehicles
export const getRecentlyViewedSlugs = (): string[] => {
  if (typeof window === 'undefined') return [];

  const session = getActiveSession();
  if (session) {
    const all = getAllUserGarages();
    initializeUserGarage(session.userId);
    return all[session.userId]?.recentlyViewed || [];
  }

  try {
    const raw = localStorage.getItem(GUEST_RECENT_KEY);
    return raw ? JSON.parse(raw) : ['porsche-taycan-turbo-s', 'audi-rs-etron-gt', 'tesla-model-s-plaid'];
  } catch {
    return [];
  }
};

export const recordRecentlyViewed = (slug: string): void => {
  if (typeof window === 'undefined' || !slug) return;

  const current = getRecentlyViewedSlugs();
  // Place newly viewed at front, limit to 8
  const updated = [slug, ...current.filter((s) => s !== slug)].slice(0, 8);

  const session = getActiveSession();
  if (session) {
    const all = getAllUserGarages();
    initializeUserGarage(session.userId);
    all[session.userId].recentlyViewed = updated;
    saveAllUserGarages(all);
  } else {
    localStorage.setItem(GUEST_RECENT_KEY, JSON.stringify(updated));
  }

  window.dispatchEvent(new CustomEvent('autoverse_recent_updated', { detail: updated }));
};

// 4. Saved Comparisons
export const getSavedComparisons = (): SavedComparison[] => {
  if (typeof window === 'undefined') return [];

  const session = getActiveSession();
  if (session) {
    const all = getAllUserGarages();
    initializeUserGarage(session.userId);
    return all[session.userId]?.savedComparisons || [];
  }

  try {
    const raw = localStorage.getItem(GUEST_COMPARISONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveComparison = (name: string, slugs: string[]): SavedComparison => {
  const newComp: SavedComparison = {
    id: `cmp_${Date.now()}`,
    name: name.trim() || `Comparison (${slugs.length} vehicles)`,
    slugs,
    savedAt: new Date().toISOString(),
  };

  const current = getSavedComparisons();
  const updated = [newComp, ...current];

  const session = getActiveSession();
  if (session) {
    const all = getAllUserGarages();
    initializeUserGarage(session.userId);
    all[session.userId].savedComparisons = updated;
    saveAllUserGarages(all);
  } else {
    localStorage.setItem(GUEST_COMPARISONS_KEY, JSON.stringify(updated));
  }

  window.dispatchEvent(new CustomEvent('autoverse_comparisons_updated', { detail: updated }));
  return newComp;
};

export const deleteSavedComparison = (id: string): void => {
  const current = getSavedComparisons();
  const updated = current.filter((c) => c.id !== id);

  const session = getActiveSession();
  if (session) {
    const all = getAllUserGarages();
    initializeUserGarage(session.userId);
    all[session.userId].savedComparisons = updated;
    saveAllUserGarages(all);
  } else {
    localStorage.setItem(GUEST_COMPARISONS_KEY, JSON.stringify(updated));
  }

  window.dispatchEvent(new CustomEvent('autoverse_comparisons_updated', { detail: updated }));
};

// ==========================================
// 5. Saved Custom Vehicle Configurations (Stage 10)
// ==========================================

export const getSavedConfigurations = (): SavedConfiguration[] => {
  if (typeof window === 'undefined') return [];

  const session = getActiveSession();
  if (session) {
    const all = getAllUserGarages();
    initializeUserGarage(session.userId);
    return all[session.userId]?.savedConfigurations || [];
  }

  try {
    const raw = localStorage.getItem(GUEST_CONFIGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveVehicleConfiguration = (config: SavedConfiguration): SavedConfiguration => {
  const current = getSavedConfigurations();
  // If configuration with same ID exists, update it; otherwise prepend
  const existsIndex = current.findIndex((c) => c.id === config.id);
  let updated: SavedConfiguration[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = config;
  } else {
    updated = [config, ...current];
  }

  const session = getActiveSession();
  if (session) {
    const all = getAllUserGarages();
    initializeUserGarage(session.userId);
    all[session.userId].savedConfigurations = updated;
    saveAllUserGarages(all);
  } else {
    localStorage.setItem(GUEST_CONFIGS_KEY, JSON.stringify(updated));
  }

  window.dispatchEvent(new CustomEvent('autoverse_configurations_updated', { detail: updated }));
  return config;
};

export const deleteSavedConfiguration = (id: string): void => {
  const current = getSavedConfigurations();
  const updated = current.filter((c) => c.id !== id);

  const session = getActiveSession();
  if (session) {
    const all = getAllUserGarages();
    initializeUserGarage(session.userId);
    all[session.userId].savedConfigurations = updated;
    saveAllUserGarages(all);
  } else {
    localStorage.setItem(GUEST_CONFIGS_KEY, JSON.stringify(updated));
  }

  window.dispatchEvent(new CustomEvent('autoverse_configurations_updated', { detail: updated }));
};

export const renameSavedConfiguration = (id: string, newName: string): void => {
  const current = getSavedConfigurations();
  const updated = current.map((c) => (c.id === id ? { ...c, customName: newName } : c));

  const session = getActiveSession();
  if (session) {
    const all = getAllUserGarages();
    initializeUserGarage(session.userId);
    all[session.userId].savedConfigurations = updated;
    saveAllUserGarages(all);
  } else {
    localStorage.setItem(GUEST_CONFIGS_KEY, JSON.stringify(updated));
  }

  window.dispatchEvent(new CustomEvent('autoverse_configurations_updated', { detail: updated }));
};

