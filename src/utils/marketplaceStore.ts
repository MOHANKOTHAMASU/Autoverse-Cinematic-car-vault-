// AutoVerse Stage 21: Used-Car Marketplace Store Engine
// Client-side persistence, concurrency-safe transitions, enquiry dispatch, and moderation engine.

import type {
  MarketplaceListing,
  MarketplaceEnquiry,
  MarketplaceReport,
  SavedListing,
  MarketplaceFilterParams,
  CreateListingPayload,
  CreateEnquiryPayload,
  CreateReportPayload,
  ListingStatus,
} from '../types/marketplace';
import type { User, UserPublicProfile } from '../types/auth';
import { SEED_MARKETPLACE_LISTINGS } from '../data/marketplaceListings';
import { createNotification } from './notificationStore';

export type MarketplaceUser = User | UserPublicProfile;

const STORAGE_LISTINGS_KEY = 'autoverse_marketplace_listings_v21';
const STORAGE_ENQUIRIES_KEY = 'autoverse_marketplace_enquiries_v21';
const STORAGE_SAVED_KEY = 'autoverse_marketplace_saved_v21';
const STORAGE_REPORTS_KEY = 'autoverse_marketplace_reports_v21';

// Initialize with seed data on first load
function initializeListings(): MarketplaceListing[] {
  try {
    const raw = localStorage.getItem(STORAGE_LISTINGS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(SEED_MARKETPLACE_LISTINGS));
      return SEED_MARKETPLACE_LISTINGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load marketplace listings from storage', err);
    return SEED_MARKETPLACE_LISTINGS;
  }
}

// -------------------------------------------------------------
// 1. LISTINGS RETRIEVAL & FILTERING
// -------------------------------------------------------------

export function getAllListings(options?: { includeInactive?: boolean }): MarketplaceListing[] {
  const all = initializeListings();
  if (options?.includeInactive) {
    return all;
  }
  // Public marketplace returns only ACTIVE listings
  return all.filter((l) => l.status === 'active');
}

export function getListingById(id: string): MarketplaceListing | null {
  const all = getAllListings({ includeInactive: true });
  return all.find((l) => l.id === id) || null;
}

export function getListingBySlug(slug: string): MarketplaceListing | null {
  const all = getAllListings({ includeInactive: true });
  return all.find((l) => l.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export function getSellerListings(sellerId: string): MarketplaceListing[] {
  const all = getAllListings({ includeInactive: true });
  return all
    .filter((l) => l.sellerId === sellerId && l.status !== 'removed')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function filterListings(params: MarketplaceFilterParams): {
  listings: MarketplaceListing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
  let list = getAllListings({ includeInactive: false });

  // 1. Text Search (make, model, variant, city, description)
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (l) =>
        l.make.toLowerCase().includes(q) ||
        l.model.toLowerCase().includes(q) ||
        l.variant.toLowerCase().includes(q) ||
        l.locationCity.toLowerCase().includes(q) ||
        (l.locationState && l.locationState.toLowerCase().includes(q)) ||
        l.features.some((f) => f.toLowerCase().includes(q))
    );
  }

  // 2. Make Filter
  if (params.make && params.make !== 'all') {
    const makeLower = params.make.toLowerCase();
    list = list.filter((l) => l.make.toLowerCase() === makeLower);
  }

  // 3. Body Type Filter
  if (params.bodyType && params.bodyType !== 'all') {
    list = list.filter((l) => l.bodyType.toLowerCase() === params.bodyType?.toLowerCase());
  }

  // 4. Fuel Type Filter
  if (params.fuelType && params.fuelType !== 'all') {
    list = list.filter((l) => l.fuelType.toLowerCase() === params.fuelType?.toLowerCase());
  }

  // 5. Transmission Filter
  if (params.transmission && params.transmission !== 'all') {
    list = list.filter((l) => l.transmission.toLowerCase() === params.transmission?.toLowerCase());
  }

  // 6. City Filter
  if (params.city && params.city !== 'all') {
    const cityLower = params.city.toLowerCase();
    list = list.filter((l) => l.locationCity.toLowerCase() === cityLower);
  }

  // 7. Seller Type Filter
  if (params.sellerType && params.sellerType !== 'all') {
    list = list.filter((l) => l.sellerType === params.sellerType);
  }

  // 8. Condition Filter
  if (params.condition && params.condition !== 'all') {
    list = list.filter((l) => l.overallCondition === params.condition);
  }

  // 9. Price Range
  if (typeof params.minPrice === 'number' && !isNaN(params.minPrice)) {
    list = list.filter((l) => l.askingPrice >= (params.minPrice as number));
  }
  if (typeof params.maxPrice === 'number' && !isNaN(params.maxPrice) && params.maxPrice > 0) {
    list = list.filter((l) => l.askingPrice <= (params.maxPrice as number));
  }

  // 10. Year Range
  if (typeof params.minYear === 'number' && !isNaN(params.minYear)) {
    list = list.filter((l) => l.year >= (params.minYear as number));
  }
  if (typeof params.maxYear === 'number' && !isNaN(params.maxYear)) {
    list = list.filter((l) => l.year <= (params.maxYear as number));
  }

  // 11. Max Mileage
  if (typeof params.maxMileage === 'number' && !isNaN(params.maxMileage) && params.maxMileage > 0) {
    list = list.filter((l) => l.mileageKm <= (params.maxMileage as number));
  }

  // 12. Sorting
  const sortBy = params.sortBy || 'newest';
  list.sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.askingPrice - b.askingPrice;
      case 'price_desc':
        return b.askingPrice - a.askingPrice;
      case 'mileage_asc':
        return a.mileageKm - b.mileageKm;
      case 'year_desc':
        return b.year - a.year;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const total = list.length;
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, params.pageSize || 12);
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const paginated = list.slice(startIndex, startIndex + pageSize);

  return {
    listings: paginated,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export function recordListingView(listingId: string): void {
  try {
    const sessionKey = `autoverse_viewed_listing_${listingId}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');

    const all = getAllListings({ includeInactive: true });
    const target = all.find((l) => l.id === listingId);
    if (!target) return;

    target.viewsCount = (target.viewsCount || 0) + 1;
    localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to increment view counter', err);
  }
}

// -------------------------------------------------------------
// 2. LISTING CREATION & VALIDATION
// -------------------------------------------------------------

export function validateListingPayload(payload: CreateListingPayload): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const currentYear = new Date().getFullYear();

  if (!payload.make || payload.make.trim().length < 2) {
    errors.push('Manufacturer make is required (min 2 characters).');
  }
  if (!payload.model || payload.model.trim().length < 1) {
    errors.push('Vehicle model is required.');
  }
  if (!payload.year || payload.year < 1990 || payload.year > currentYear + 1) {
    errors.push(`Model year must be between 1990 and ${currentYear + 1}.`);
  }
  if (typeof payload.askingPrice !== 'number' || payload.askingPrice <= 0) {
    errors.push('Asking price must be a positive number greater than 0.');
  }
  if (typeof payload.mileageKm !== 'number' || payload.mileageKm < 0) {
    errors.push('Odometer mileage must be a non-negative number.');
  }
  if (!payload.bodyType) {
    errors.push('Body type is required.');
  }
  if (!payload.fuelType) {
    errors.push('Fuel / powertrain type is required.');
  }
  if (!payload.transmission) {
    errors.push('Transmission type is required.');
  }
  if (!payload.locationCity || payload.locationCity.trim().length < 2) {
    errors.push('Location city is required.');
  }
  if (!payload.description || payload.description.trim().length < 20) {
    errors.push('Seller description must be at least 20 characters long.');
  }
  if (!payload.images || payload.images.length === 0) {
    errors.push('At least one vehicle photograph is required.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function createListing(
  payload: CreateListingPayload,
  seller: MarketplaceUser,
  options?: { autoApproveIfAdmin?: boolean }
): { success: boolean; listing?: MarketplaceListing; error?: string } {
  const validation = validateListingPayload(payload);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join(' ') };
  }

  const all = getAllListings({ includeInactive: true });

  // Duplicate Check: Same seller with identical make, model, year, and mileage within 100km
  const duplicate = all.find(
    (l) =>
      l.sellerId === seller.id &&
      l.status !== 'removed' &&
      l.make.toLowerCase() === payload.make.trim().toLowerCase() &&
      l.model.toLowerCase() === payload.model.trim().toLowerCase() &&
      l.year === payload.year &&
      Math.abs(l.mileageKm - payload.mileageKm) < 100
  );
  if (duplicate) {
    return {
      success: false,
      error: 'A listing with this exact make, model, year, and mileage already exists in your account.',
    };
  }

  const id = `listing_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanMake = payload.make.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cleanModel = payload.model.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cleanCity = payload.locationCity.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const hash = Math.random().toString(36).substring(2, 6);
  const slug = `${payload.year}-${cleanMake}-${cleanModel}-${cleanCity}-${hash}`;

  const shouldAutoApprove = options?.autoApproveIfAdmin && seller.role === 'admin';
  const initialStatus: ListingStatus = shouldAutoApprove ? 'active' : 'pending_review';

  const now = new Date().toISOString();
  const newListing: MarketplaceListing = {
    id,
    slug,
    sellerId: seller.id,
    sellerName: seller.fullName,
    sellerEmail: seller.email,
    sellerPhone: seller.phone || payload.sellerType === 'dealer' ? '+91 98000 00000' : undefined,
    sellerType: payload.sellerType || (seller.role === 'admin' ? 'dealer' : 'individual'),
    vehicleSlug: payload.vehicleSlug,
    make: payload.make.trim(),
    model: payload.model.trim(),
    variant: payload.variant.trim() || 'Standard Trim',
    year: payload.year,
    askingPrice: payload.askingPrice,
    currency: payload.currency || 'INR',
    mileageKm: payload.mileageKm,
    fuelType: payload.fuelType,
    transmission: payload.transmission,
    bodyType: payload.bodyType,
    color: payload.color.trim() || 'Factory Standard',
    previousOwners: payload.previousOwners || 1,
    locationCity: payload.locationCity.trim(),
    locationState: payload.locationState?.trim(),
    locationCountry: payload.locationCountry || 'India',
    registrationRegionMasked: payload.registrationRegionMasked?.trim(),
    images: payload.images,
    featuredImage: payload.images[0],
    overallCondition: payload.overallCondition,
    declaredDefects: payload.declaredDefects.trim() || 'No major mechanical or cosmetic defects declared by seller.',
    serviceHistory: payload.serviceHistory,
    serviceHistoryNotes: payload.serviceHistoryNotes?.trim(),
    description: payload.description.trim(),
    features: payload.features || [],
    reasonForSelling: payload.reasonForSelling?.trim(),
    status: initialStatus,
    viewsCount: 0,
    enquiriesCount: 0,
    featured: false,
    verifiedSeller: seller.isVerified,
    createdAt: now,
    updatedAt: now,
    auditHistory: [
      {
        timestamp: now,
        actorId: seller.id,
        actorName: seller.fullName,
        actorRole: seller.role === 'admin' ? 'admin' : 'seller',
        action: shouldAutoApprove
          ? 'Created listing with administrator immediate publication'
          : 'Created listing and submitted for marketplace moderation',
        previousStatus: 'draft',
        newStatus: initialStatus,
      },
    ],
  };

  all.unshift(newListing);
  localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(all));

  // Send notification to seller
  createNotification({
    userId: seller.id,
    title: shouldAutoApprove ? 'Listing Published Successfully' : 'Listing Submitted for Review',
    message: shouldAutoApprove
      ? `Your listing for ${newListing.year} ${newListing.make} ${newListing.model} is now active on the marketplace.`
      : `Your listing for ${newListing.year} ${newListing.make} ${newListing.model} is pending review by our moderation desk.`,
    category: 'system',
    actionUrl: `/used-cars/${newListing.slug}`,
  });

  window.dispatchEvent(new CustomEvent('autoverse_marketplace_updated', { detail: newListing }));

  return { success: true, listing: newListing };
}

// -------------------------------------------------------------
// 3. LISTING LIFECYCLE & STATUS MACHINE
// -------------------------------------------------------------

export function setListingStatus(
  listingId: string,
  newStatus: ListingStatus,
  actor: { id: string; name: string; role: 'seller' | 'admin' | 'system' },
  reason?: string
): { success: boolean; error?: string } {
  const all = getAllListings({ includeInactive: true });
  const listing = all.find((l) => l.id === listingId);
  if (!listing) {
    return { success: false, error: 'Listing not found.' };
  }

  const prevStatus = listing.status;

  // Authorization & Transition Rules
  if (actor.role === 'seller') {
    // Seller can only modify their own listing
    if (listing.sellerId !== actor.id) {
      return { success: false, error: 'Unauthorized: You can only update your own listings.' };
    }
    // Seller CANNOT approve their own listing from pending_review
    if (prevStatus === 'pending_review' && newStatus === 'active') {
      return { success: false, error: 'Moderation guard: Sellers cannot approve their own listings.' };
    }
    // Allowed seller transitions:
    // active <-> paused
    // active -> sold
    // paused -> sold
    // draft -> pending_review
    // any -> removed
    const allowed =
      (prevStatus === 'active' && (newStatus === 'paused' || newStatus === 'sold' || newStatus === 'removed')) ||
      (prevStatus === 'paused' && (newStatus === 'active' || newStatus === 'sold' || newStatus === 'removed')) ||
      (prevStatus === 'draft' && (newStatus === 'pending_review' || newStatus === 'removed')) ||
      (prevStatus === 'rejected' && (newStatus === 'pending_review' || newStatus === 'removed')) ||
      newStatus === 'removed';

    if (!allowed) {
      return { success: false, error: `Invalid status transition from ${prevStatus} to ${newStatus} for seller.` };
    }
  }

  // Admin moderation rules
  if (actor.role === 'admin') {
    if (newStatus === 'rejected' && (!reason || reason.trim().length < 5)) {
      return { success: false, error: 'Rejection requires a documented reason for the seller.' };
    }
  }

  const now = new Date().toISOString();
  listing.status = newStatus;
  listing.updatedAt = now;
  if (newStatus === 'rejected' && reason) {
    listing.rejectionReason = reason.trim();
  } else if (newStatus === 'active') {
    listing.rejectionReason = undefined;
  }

  listing.auditHistory.push({
    timestamp: now,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: `Status transitioned from ${prevStatus} to ${newStatus}${reason ? `: ${reason}` : ''}`,
    notes: reason,
    previousStatus: prevStatus,
    newStatus,
  });

  localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(all));

  // Notify seller of status changes
  if (actor.role === 'admin' && listing.sellerId !== actor.id) {
    let title = `Listing Status: ${newStatus.toUpperCase()}`;
    let msg = `Your listing for ${listing.year} ${listing.make} ${listing.model} is now ${newStatus}.`;
    if (newStatus === 'active') {
      title = 'Listing Approved & Published! 🎉';
      msg = `Your listing for ${listing.year} ${listing.make} ${listing.model} has been approved by moderation and is live on the marketplace.`;
    } else if (newStatus === 'rejected') {
      title = 'Listing Moderation Notice';
      msg = `Your listing for ${listing.year} ${listing.make} ${listing.model} was not approved: ${reason}`;
    }

    createNotification({
      userId: listing.sellerId,
      title,
      message: msg,
      category: 'system',
      actionUrl: `/my-listings`,
    });
  }

  window.dispatchEvent(new CustomEvent('autoverse_marketplace_updated', { detail: listing }));
  return { success: true };
}

export function updateListingDetails(
  listingId: string,
  updates: Partial<CreateListingPayload>,
  actor: { id: string; role: 'seller' | 'admin' }
): { success: boolean; error?: string } {
  const all = getAllListings({ includeInactive: true });
  const listing = all.find((l) => l.id === listingId);
  if (!listing) return { success: false, error: 'Listing not found.' };

  if (actor.role === 'seller' && listing.sellerId !== actor.id) {
    return { success: false, error: 'Unauthorized: You can only edit your own listings.' };
  }

  // Update allowed fields
  if (updates.askingPrice && updates.askingPrice > 0) listing.askingPrice = updates.askingPrice;
  if (updates.mileageKm !== undefined && updates.mileageKm >= 0) listing.mileageKm = updates.mileageKm;
  if (updates.description) listing.description = updates.description.trim();
  if (updates.declaredDefects) listing.declaredDefects = updates.declaredDefects.trim();
  if (updates.features) listing.features = updates.features;
  if (updates.images && updates.images.length > 0) {
    listing.images = updates.images;
    listing.featuredImage = updates.images[0];
  }
  if (updates.overallCondition) listing.overallCondition = updates.overallCondition;
  if (updates.locationCity) listing.locationCity = updates.locationCity.trim();

  const now = new Date().toISOString();
  listing.updatedAt = now;
  listing.auditHistory.push({
    timestamp: now,
    actorId: actor.id,
    actorName: actor.role === 'admin' ? 'Administrator' : listing.sellerName,
    actorRole: actor.role,
    action: 'Listing details updated',
  });

  localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent('autoverse_marketplace_updated', { detail: listing }));
  return { success: true };
}

// -------------------------------------------------------------
// 4. SAVED LISTINGS (FAVORITES)
// -------------------------------------------------------------

export function getSavedListings(userId: string): SavedListing[] {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_KEY);
    if (!raw) return [];
    const all: SavedListing[] = JSON.parse(raw);
    return all.filter((s) => s.userId === userId);
  } catch {
    return [];
  }
}

export function isListingSaved(userId: string, listingId: string): boolean {
  const userSaved = getSavedListings(userId);
  return userSaved.some((s) => s.listingId === listingId);
}

export function toggleSaveListing(userId: string, listingId: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_KEY);
    let all: SavedListing[] = raw ? JSON.parse(raw) : [];
    const existing = all.find((s) => s.userId === userId && s.listingId === listingId);

    let isSaved = false;
    if (existing) {
      all = all.filter((s) => !(s.userId === userId && s.listingId === listingId));
      isSaved = false;
    } else {
      all.push({
        userId,
        listingId,
        savedAt: new Date().toISOString(),
      });
      isSaved = true;
    }

    localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('autoverse_saved_listings_updated', { detail: { listingId, isSaved } }));
    return isSaved;
  } catch (err) {
    console.error('Failed to toggle saved listing', err);
    return false;
  }
}

export function getUserSavedListingsWithDetails(userId: string): Array<{
  savedAt: string;
  listing: MarketplaceListing;
  isAvailable: boolean;
}> {
  const saved = getSavedListings(userId);
  const allListings = getAllListings({ includeInactive: true });

  const result: Array<{ savedAt: string; listing: MarketplaceListing; isAvailable: boolean }> = [];
  for (const s of saved) {
    const found = allListings.find((l) => l.id === s.listingId);
    if (found && found.status !== 'removed') {
      result.push({
        savedAt: s.savedAt,
        listing: found,
        isAvailable: found.status === 'active',
      });
    }
  }

  return result.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

// -------------------------------------------------------------
// 5. BUYER ENQUIRIES & MESSAGING
// -------------------------------------------------------------

export function getAllEnquiries(): MarketplaceEnquiry[] {
  try {
    const raw = localStorage.getItem(STORAGE_ENQUIRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function createEnquiry(
  payload: CreateEnquiryPayload,
  buyer: MarketplaceUser
): { success: boolean; enquiry?: MarketplaceEnquiry; error?: string } {
  if (!payload.message || payload.message.trim().length < 10) {
    return { success: false, error: 'Enquiry message must be at least 10 characters long.' };
  }
  if (!payload.consentGiven) {
    return { success: false, error: 'You must consent to share your contact information with the seller.' };
  }

  const listing = getListingById(payload.listingId);
  if (!listing) {
    return { success: false, error: 'Listing not found.' };
  }

  // Prevent self-enquiry
  if (listing.sellerId === buyer.id) {
    return { success: false, error: 'You cannot submit an enquiry on your own vehicle listing.' };
  }

  // Spam rate limiting: Check if buyer submitted identical enquiry in last 5 minutes
  const all = getAllEnquiries();
  const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
  const recentDuplicate = all.find(
    (e) =>
      e.buyerId === buyer.id &&
      e.listingId === payload.listingId &&
      new Date(e.createdAt).getTime() > fiveMinsAgo &&
      e.message.trim() === payload.message.trim()
  );
  if (recentDuplicate) {
    return { success: false, error: 'You recently submitted this exact message. Please allow time for the seller to reply.' };
  }

  const now = new Date().toISOString();
  const enquiry: MarketplaceEnquiry = {
    id: `enq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    listingId: listing.id,
    listingTitle: `${listing.year} ${listing.make} ${listing.model} (${listing.variant})`,
    listingSlug: listing.slug,
    buyerId: buyer.id,
    buyerName: buyer.fullName,
    buyerEmail: buyer.email,
    buyerPhone: payload.contactPhone?.trim() || buyer.phone,
    sellerId: listing.sellerId,
    message: payload.message.trim(),
    offeredPrice: payload.offeredPrice && payload.offeredPrice > 0 ? payload.offeredPrice : undefined,
    preferredContact: payload.preferredContact || 'email',
    consentGiven: true,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  all.unshift(enquiry);
  localStorage.setItem(STORAGE_ENQUIRIES_KEY, JSON.stringify(all));

  // Increment enquiry count on listing
  const allListings = getAllListings({ includeInactive: true });
  const targetListing = allListings.find((l) => l.id === listing.id);
  if (targetListing) {
    targetListing.enquiriesCount = (targetListing.enquiriesCount || 0) + 1;
    localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(allListings));
  }

  // Notify seller of new enquiry
  createNotification({
    userId: listing.sellerId,
    title: 'New Vehicle Enquiry Received',
    message: `${buyer.fullName} submitted an enquiry regarding your ${listing.year} ${listing.make} ${listing.model}.`,
    category: 'system',
    actionUrl: `/my-listings`,
  });

  window.dispatchEvent(new CustomEvent('autoverse_marketplace_enquiries_updated', { detail: enquiry }));
  return { success: true, enquiry };
}

export function getUserEnquiries(userId: string): MarketplaceEnquiry[] {
  const all = getAllEnquiries();
  return all
    .filter((e) => e.buyerId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getSellerEnquiries(sellerId: string): MarketplaceEnquiry[] {
  const all = getAllEnquiries();
  return all
    .filter((e) => e.sellerId === sellerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function replyToEnquiry(
  enquiryId: string,
  replyMessage: string,
  sellerId: string
): { success: boolean; error?: string } {
  if (!replyMessage || replyMessage.trim().length < 5) {
    return { success: false, error: 'Reply message must be at least 5 characters long.' };
  }

  const all = getAllEnquiries();
  const enquiry = all.find((e) => e.id === enquiryId);
  if (!enquiry) return { success: false, error: 'Enquiry not found.' };

  if (enquiry.sellerId !== sellerId) {
    return { success: false, error: 'Unauthorized: You can only reply to enquiries for your own listings.' };
  }

  const now = new Date().toISOString();
  enquiry.sellerReply = replyMessage.trim();
  enquiry.sellerRepliedAt = now;
  enquiry.status = 'replied';
  enquiry.updatedAt = now;

  localStorage.setItem(STORAGE_ENQUIRIES_KEY, JSON.stringify(all));

  // Notify buyer of seller reply
  createNotification({
    userId: enquiry.buyerId,
    title: 'Seller Replied to Your Enquiry',
    message: `The seller of ${enquiry.listingTitle} replied: "${replyMessage.trim().substring(0, 80)}..."`,
    category: 'system',
    actionUrl: `/my-enquiries`,
  });

  window.dispatchEvent(new CustomEvent('autoverse_marketplace_enquiries_updated', { detail: enquiry }));
  return { success: true };
}

// -------------------------------------------------------------
// 6. REPORTS & FRAUD PREVENTION
// -------------------------------------------------------------

export function getAllReports(): MarketplaceReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function createReport(
  payload: CreateReportPayload,
  reporter: { id: string; email: string }
): { success: boolean; error?: string } {
  if (!payload.details || payload.details.trim().length < 10) {
    return { success: false, error: 'Please provide at least 10 characters explaining the issue.' };
  }

  const listing = getListingById(payload.listingId);
  if (!listing) return { success: false, error: 'Listing not found.' };

  const all = getAllReports();
  // Prevent duplicate report by same user
  const existing = all.find((r) => r.reporterId === reporter.id && r.listingId === payload.listingId && r.status === 'pending');
  if (existing) {
    return { success: false, error: 'You have already submitted a pending report for this vehicle listing.' };
  }

  const now = new Date().toISOString();
  const report: MarketplaceReport = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    listingId: listing.id,
    listingTitle: `${listing.year} ${listing.make} ${listing.model}`,
    reporterId: reporter.id,
    reporterEmail: reporter.email,
    reason: payload.reason,
    details: payload.details.trim(),
    status: 'pending',
    createdAt: now,
  };

  all.unshift(report);
  localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent('autoverse_marketplace_reports_updated', { detail: report }));
  return { success: true };
}

export function resolveReport(
  reportId: string,
  resolution: { action: 'dismiss' | 'pause_listing' | 'remove_listing'; notes: string },
  admin: MarketplaceUser
): { success: boolean; error?: string } {
  if (admin.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only platform administrators can resolve reports.' };
  }

  const all = getAllReports();
  const report = all.find((r) => r.id === reportId);
  if (!report) return { success: false, error: 'Report not found.' };

  const now = new Date().toISOString();
  report.status = resolution.action === 'dismiss' ? 'dismissed' : 'action_taken';
  report.moderatorNotes = resolution.notes.trim();
  report.actionTaken = resolution.action;
  report.resolvedAt = now;

  localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(all));

  if (resolution.action === 'pause_listing' || resolution.action === 'remove_listing') {
    const newStatus: ListingStatus = resolution.action === 'pause_listing' ? 'paused' : 'removed';
    setListingStatus(
      report.listingId,
      newStatus,
      { id: admin.id, name: admin.fullName, role: 'admin' },
      `Enforcement action resulting from report #${report.id}: ${resolution.notes}`
    );
  }

  window.dispatchEvent(new CustomEvent('autoverse_marketplace_reports_updated', { detail: report }));
  return { success: true };
}

// -------------------------------------------------------------
// 7. SANITIZED CSV EXPORT (CWE-1236 FORMULA INJECTION PROOF)
// -------------------------------------------------------------

function sanitizeCsvField(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let str = String(value).replace(/"/g, '""');
  // Prevent CSV formula injection by prepending single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str}"`;
}

export function exportMarketplaceListingsCSV(): string {
  const listings = getAllListings({ includeInactive: true });
  const headers = [
    'Listing ID',
    'Title',
    'Make',
    'Model',
    'Variant',
    'Year',
    'Asking Price',
    'Currency',
    'Mileage (km)',
    'Fuel Type',
    'Transmission',
    'Body Type',
    'Condition',
    'Location City',
    'Country',
    'Status',
    'Seller Name',
    'Seller Type',
    'Views',
    'Enquiries',
    'Created At',
  ];

  const rows = listings.map((l) => [
    sanitizeCsvField(l.id),
    sanitizeCsvField(`${l.year} ${l.make} ${l.model} ${l.variant}`),
    sanitizeCsvField(l.make),
    sanitizeCsvField(l.model),
    sanitizeCsvField(l.variant),
    l.year,
    l.askingPrice,
    sanitizeCsvField(l.currency),
    l.mileageKm,
    sanitizeCsvField(l.fuelType),
    sanitizeCsvField(l.transmission),
    sanitizeCsvField(l.bodyType),
    sanitizeCsvField(l.overallCondition),
    sanitizeCsvField(l.locationCity),
    sanitizeCsvField(l.locationCountry),
    sanitizeCsvField(l.status),
    sanitizeCsvField(l.sellerName),
    sanitizeCsvField(l.sellerType),
    l.viewsCount,
    l.enquiriesCount,
    sanitizeCsvField(l.createdAt),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

// Helper to format currency accurately for Indian and International markets
export function formatMarketplacePrice(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    // Format in Lakhs / Crores if large or standard Indian numeric
    if (amount >= 10000000) {
      const cr = (amount / 10000000).toFixed(2);
      return `₹${cr} Crore`;
    } else if (amount >= 100000) {
      const lakh = (amount / 100000).toFixed(2);
      return `₹${lakh} Lakh`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  const sym = symbols[currency] || `${currency} `;
  return `${sym}${amount.toLocaleString('en-US')}`;
}
