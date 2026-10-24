// AutoVerse Stage 20: Dealer & Test-Drive Booking Engine
// Provides verified dealership directory queries, concurrency-safe test-drive slot booking,
// and strict status lifecycle transitions with audit trails.

import type {
  Dealership,
  TestDriveBooking,
  DealerFilterParams,
  CreateBookingPayload,
  TestDriveStatus,
  BookingStatusHistoryEntry,
} from '../types/dealer';
import { INITIAL_DEALERSHIPS } from '../data/dealers';
import { VEHICLES } from '../data/vehicles';
import { createNotification } from './notificationStore';

const DEALERS_STORAGE_KEY = 'autoverse_dealers_v20';
const BOOKINGS_STORAGE_KEY = 'autoverse_test_drives_v20';

// -------------------------------------------------------------
// DEALERS STORE
// -------------------------------------------------------------

export function getAllDealers(): Dealership[] {
  try {
    const raw = localStorage.getItem(DEALERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DEALERS_STORAGE_KEY, JSON.stringify(INITIAL_DEALERSHIPS));
      return INITIAL_DEALERSHIPS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEALERSHIPS;
  }
}

export function saveAllDealers(dealers: Dealership[]): void {
  try {
    localStorage.setItem(DEALERS_STORAGE_KEY, JSON.stringify(dealers));
    window.dispatchEvent(new CustomEvent('autoverse_dealers_updated'));
  } catch (err) {
    console.error('Failed to save dealerships', err);
  }
}

export function getDealerById(id: string): Dealership | undefined {
  const dealers = getAllDealers();
  return dealers.find((d) => d.id === id);
}

export function getDealerBySlug(slug: string): Dealership | undefined {
  const dealers = getAllDealers();
  return dealers.find((d) => d.slug.toLowerCase() === slug.toLowerCase() || d.id === slug);
}

export function filterDealers(params: DealerFilterParams): Dealership[] {
  const dealers = getAllDealers();

  return dealers.filter((dealer) => {
    if (params.activeOnly !== false && !dealer.active) {
      return false;
    }

    if (params.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.trim().toLowerCase();
      const matchName = dealer.name.toLowerCase().includes(q);
      const matchCity = dealer.address.city.toLowerCase().includes(q);
      const matchState = dealer.address.state.toLowerCase().includes(q);
      const matchCountry = dealer.address.country.toLowerCase().includes(q);
      const matchTagline = dealer.tagline.toLowerCase().includes(q);
      const matchBrand = dealer.supportedBrands.some((b) => b.toLowerCase().includes(q));
      if (!matchName && !matchCity && !matchState && !matchCountry && !matchTagline && !matchBrand) {
        return false;
      }
    }

    if (params.city && params.city !== 'all') {
      if (dealer.address.city.toLowerCase() !== params.city.toLowerCase()) {
        return false;
      }
    }

    if (params.state && params.state !== 'all') {
      if (dealer.address.state.toLowerCase() !== params.state.toLowerCase()) {
        return false;
      }
    }

    if (params.country && params.country !== 'all') {
      if (dealer.address.country.toLowerCase() !== params.country.toLowerCase()) {
        return false;
      }
    }

    if (params.brand && params.brand !== 'all') {
      const bLower = params.brand.toLowerCase();
      if (!dealer.supportedBrands.some((b) => b.toLowerCase() === bLower)) {
        return false;
      }
    }

    if (params.service && params.service !== 'all' as any) {
      if (!dealer.services.includes(params.service)) {
        return false;
      }
    }

    return true;
  });
}

export function addDealer(data: Omit<Dealership, 'id' | 'createdAt' | 'updatedAt'>): Dealership {
  const dealers = getAllDealers();
  const now = new Date().toISOString();
  const id = `dealer_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newDealer: Dealership = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };
  dealers.push(newDealer);
  saveAllDealers(dealers);
  return newDealer;
}

export function updateDealer(id: string, updates: Partial<Dealership>): { success: boolean; dealer?: Dealership; error?: string } {
  const dealers = getAllDealers();
  const index = dealers.findIndex((d) => d.id === id);
  if (index === -1) {
    return { success: false, error: 'Dealership not found.' };
  }

  const updated: Dealership = {
    ...dealers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  dealers[index] = updated;
  saveAllDealers(dealers);
  return { success: true, dealer: updated };
}

export function toggleDealerActive(id: string): { success: boolean; active?: boolean } {
  const dealer = getDealerById(id);
  if (!dealer) return { success: false };
  const res = updateDealer(id, { active: !dealer.active });
  return { success: res.success, active: res.dealer?.active };
}

// -------------------------------------------------------------
// BOOKINGS STORE
// -------------------------------------------------------------

export function getAllBookings(): TestDriveBooking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveAllBookings(bookings: TestDriveBooking[]): void {
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    window.dispatchEvent(new CustomEvent('autoverse_test_drives_updated'));
  } catch (err) {
    console.error('Failed to save bookings', err);
  }
}

export function getBookingById(id: string): TestDriveBooking | undefined {
  const bookings = getAllBookings();
  return bookings.find((b) => b.id === id || b.bookingReference === id);
}

export function getUserBookings(userId: string): TestDriveBooking[] {
  if (!userId) return [];
  const bookings = getAllBookings();
  return bookings
    .filter((b) => b.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Concurrency-safe slot availability validator
export function checkSlotAvailability(
  dealerId: string,
  date: string, // YYYY-MM-DD
  timeSlot: string
): { available: boolean; remainingCapacity: number; reason?: string } {
  const dealer = getDealerById(dealerId);
  if (!dealer) {
    return { available: false, remainingCapacity: 0, reason: 'Dealership does not exist.' };
  }

  if (!dealer.active) {
    return { available: false, remainingCapacity: 0, reason: 'This dealership is currently inactive.' };
  }

  // Validate date format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return { available: false, remainingCapacity: 0, reason: 'Invalid date format.' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [y, m, d] = date.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);
  targetDate.setHours(0, 0, 0, 0);

  if (targetDate.getTime() < today.getTime()) {
    return { available: false, remainingCapacity: 0, reason: 'Cannot book a test drive for a past date.' };
  }

  const maxAdvanceMs = dealer.slotConfig.daysInAdvance * 24 * 60 * 60 * 1000;
  if (targetDate.getTime() - today.getTime() > maxAdvanceMs) {
    return {
      available: false,
      remainingCapacity: 0,
      reason: `Bookings can only be scheduled up to ${dealer.slotConfig.daysInAdvance} days in advance.`,
    };
  }

  // Check valid time slot
  if (!dealer.slotConfig.slotTimes.includes(timeSlot)) {
    return {
      available: false,
      remainingCapacity: 0,
      reason: `Time slot ${timeSlot} is not offered by this dealership.`,
    };
  }

  // Concurrency check against active bookings
  const bookings = getAllBookings();
  const activeBookingsForSlot = bookings.filter((b) => {
    if (b.dealerId !== dealerId) return false;
    // Count both requested date or confirmed date
    const bookingDate = b.confirmedDate || b.preferredDate;
    const bookingTime = b.confirmedTimeSlot || b.preferredTimeSlot;
    if (bookingDate !== date || bookingTime !== timeSlot) return false;

    // Active statuses occupy capacity
    return ['requested', 'pending_confirmation', 'confirmed', 'reschedule_requested'].includes(b.status);
  });

  const capacity = dealer.slotConfig.maxSimultaneousDrives;
  const remaining = capacity - activeBookingsForSlot.length;

  if (remaining <= 0) {
    return {
      available: false,
      remainingCapacity: 0,
      reason: 'This time slot is already fully reserved. Please select an alternate time.',
    };
  }

  return { available: true, remainingCapacity: remaining };
}

// Generate human-friendly reference: ATV-TD-XXXXXX
function generateBookingReference(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `ATV-TD-${num}`;
}

export function createTestDriveBooking(
  payload: CreateBookingPayload
): { success: boolean; booking?: TestDriveBooking; message: string } {
  // 1. Mandatory input checks
  if (!payload.userId || !payload.userName.trim() || !payload.userEmail.trim()) {
    return { success: false, message: 'Driver contact details are required.' };
  }

  if (!payload.userConsentGiven) {
    return { success: false, message: 'Consent to share test-drive details with the dealership is required.' };
  }

  // 2. Validate dealer
  const dealer = getDealerById(payload.dealerId);
  if (!dealer) {
    return { success: false, message: 'Dealership record could not be found.' };
  }

  if (!dealer.active) {
    return { success: false, message: 'The selected dealership is currently not accepting bookings.' };
  }

  // 3. Validate vehicle
  const vehicle = VEHICLES.find((v) => v.slug === payload.vehicleSlug || v.id === payload.vehicleSlug);
  if (!vehicle) {
    return { success: false, message: 'Requested vehicle could not be found in the catalog.' };
  }

  // 4. Validate brand-to-dealer eligibility
  const brandSupported = dealer.supportedBrands.some(
    (b) => b.toLowerCase() === vehicle.brand.toLowerCase()
  );
  const inInventory = dealer.inventoryVehicleIds.includes(vehicle.slug) || dealer.inventoryVehicleIds.includes(vehicle.id);

  if (!brandSupported && !inInventory) {
    return {
      success: false,
      message: `${dealer.name} is not authorized for ${vehicle.brand} vehicles. Please select an authorized dealer.`,
    };
  }

  // 5. Concurrency & Slot Availability Check
  const slotCheck = checkSlotAvailability(dealer.id, payload.preferredDate, payload.preferredTimeSlot);
  if (!slotCheck.available) {
    return { success: false, message: slotCheck.reason || 'Requested time slot is unavailable.' };
  }

  // 6. Prevent immediate duplicate active request by same user for same car & dealer
  const userExisting = getUserBookings(payload.userId);
  const duplicate = userExisting.find(
    (b) =>
      b.dealerId === dealer.id &&
      b.vehicleSlug === vehicle.slug &&
      b.preferredDate === payload.preferredDate &&
      ['requested', 'pending_confirmation', 'confirmed', 'reschedule_requested'].includes(b.status)
  );

  if (duplicate) {
    return {
      success: false,
      message: `You already have an active test-drive booking (${duplicate.bookingReference}) for this date and dealership.`,
    };
  }

  // 7. Atomic creation
  const now = new Date().toISOString();
  const id = `td_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const bookingReference = generateBookingReference();

  // Initial status: if slot has remaining capacity and verified dealer, start as pending_confirmation
  const initialStatus: TestDriveStatus = 'pending_confirmation';

  const historyEntry: BookingStatusHistoryEntry = {
    status: initialStatus,
    timestamp: now,
    actor: 'user',
    actorName: payload.userName,
    notes: 'Test-drive booking requested online via AutoVerse.',
  };

  const newBooking: TestDriveBooking = {
    id,
    bookingReference,
    userId: payload.userId,
    userName: payload.userName.trim(),
    userEmail: payload.userEmail.trim(),
    userPhone: payload.userPhone.trim(),
    dealerId: dealer.id,
    dealerSlug: dealer.slug,
    dealerName: dealer.name,
    dealerAddressText: `${dealer.address.street}, ${dealer.address.city}, ${dealer.address.state}`,
    vehicleSlug: vehicle.slug,
    vehicleName: `${vehicle.brand} ${vehicle.model}`,
    vehicleBrand: vehicle.brand,
    variantId: payload.variantId,
    variantName: payload.variantName || vehicle.variant,
    vehicleImageUrl: vehicle.thumbnail || vehicle.heroImage || vehicle.imageGallery[0],
    preferredDate: payload.preferredDate,
    preferredTimeSlot: payload.preferredTimeSlot,
    status: initialStatus,
    userNotes: payload.userNotes?.trim(),
    userConsentGiven: true,
    drivingLicenseVerified: false,
    statusHistory: [historyEntry],
    createdAt: now,
    updatedAt: now,
  };

  const allBookings = getAllBookings();
  allBookings.unshift(newBooking);
  saveAllBookings(allBookings);

  // Dispatch in-app notification to user
  createNotification({
    userId: payload.userId,
    title: `Test Drive Requested: ${newBooking.vehicleName}`,
    message: `Your test-drive request at ${dealer.name} for ${newBooking.preferredDate} (${newBooking.preferredTimeSlot}) has been received. Reference: ${bookingReference}.`,
    category: 'test_drive',
    referenceId: bookingReference,
    actionUrl: `/test-drive/${newBooking.id}`,
  });

  return {
    success: true,
    booking: newBooking,
    message: 'Test-drive booking request successfully submitted.',
  };
}

// User cancellation
export function cancelBooking(
  bookingId: string,
  userId: string,
  reason?: string
): { success: boolean; message: string; booking?: TestDriveBooking } {
  const bookings = getAllBookings();
  const index = bookings.findIndex((b) => b.id === bookingId || b.bookingReference === bookingId);
  if (index === -1) {
    return { success: false, message: 'Booking record not found.' };
  }

  const booking = bookings[index];

  // Access control check: user must own booking or be admin
  if (booking.userId !== userId && userId !== 'admin') {
    return { success: false, message: 'Unauthorized. You may only cancel your own bookings.' };
  }

  // State check: cannot cancel already finished or cancelled
  if (['completed', 'cancelled', 'rejected', 'no_show'].includes(booking.status)) {
    return { success: false, message: `Cannot cancel a booking that is already ${booking.status}.` };
  }

  const now = new Date().toISOString();
  const historyEntry: BookingStatusHistoryEntry = {
    status: 'cancelled',
    timestamp: now,
    actor: userId === 'admin' ? 'admin' : 'user',
    actorName: booking.userName,
    notes: reason || 'Booking cancelled by user.',
  };

  booking.status = 'cancelled';
  booking.updatedAt = now;
  booking.statusHistory.push(historyEntry);

  bookings[index] = booking;
  saveAllBookings(bookings);

  createNotification({
    userId: booking.userId,
    title: `Test Drive Cancelled: ${booking.bookingReference}`,
    message: `Your booking for ${booking.vehicleName} on ${booking.preferredDate} was successfully cancelled.`,
    category: 'test_drive',
    referenceId: booking.bookingReference,
    actionUrl: `/test-drive/${booking.id}`,
  });

  return { success: true, message: 'Booking successfully cancelled.', booking };
}

// User reschedule request
export function requestReschedule(
  bookingId: string,
  userId: string,
  newDate: string,
  newTimeSlot: string,
  reason?: string
): { success: boolean; message: string; booking?: TestDriveBooking } {
  const bookings = getAllBookings();
  const index = bookings.findIndex((b) => b.id === bookingId || b.bookingReference === bookingId);
  if (index === -1) {
    return { success: false, message: 'Booking record not found.' };
  }

  const booking = bookings[index];

  if (booking.userId !== userId && userId !== 'admin') {
    return { success: false, message: 'Unauthorized. You may only reschedule your own bookings.' };
  }

  if (['completed', 'cancelled', 'rejected', 'no_show'].includes(booking.status)) {
    return { success: false, message: `Cannot reschedule a booking that is ${booking.status}.` };
  }

  // Check slot availability for new requested time
  const slotCheck = checkSlotAvailability(booking.dealerId, newDate, newTimeSlot);
  if (!slotCheck.available) {
    return { success: false, message: slotCheck.reason || 'Requested reschedule time slot is unavailable.' };
  }

  const now = new Date().toISOString();
  booking.proposedRescheduleDate = newDate;
  booking.proposedRescheduleTime = newTimeSlot;
  booking.rescheduleReason = reason;
  booking.status = 'reschedule_requested';
  booking.updatedAt = now;

  booking.statusHistory.push({
    status: 'reschedule_requested',
    timestamp: now,
    actor: 'user',
    actorName: booking.userName,
    notes: `Reschedule requested for ${newDate} at ${newTimeSlot}. Reason: ${reason || 'Schedule adjustment'}`,
  });

  bookings[index] = booking;
  saveAllBookings(bookings);

  createNotification({
    userId: booking.userId,
    title: `Reschedule Requested: ${booking.bookingReference}`,
    message: `Your request to reschedule ${booking.vehicleName} to ${newDate} (${newTimeSlot}) has been logged pending dealership confirmation.`,
    category: 'test_drive',
    referenceId: booking.bookingReference,
    actionUrl: `/test-drive/${booking.id}`,
  });

  return { success: true, message: 'Reschedule request submitted successfully.', booking };
}

// Admin status transition enforcement
export function adminUpdateBookingStatus(
  bookingId: string,
  newStatus: TestDriveStatus,
  adminActorName = 'AutoVerse Operations',
  notes?: string,
  rescheduleDate?: string,
  rescheduleTime?: string
): { success: boolean; message: string; booking?: TestDriveBooking } {
  const bookings = getAllBookings();
  const index = bookings.findIndex((b) => b.id === bookingId || b.bookingReference === bookingId);
  if (index === -1) {
    return { success: false, message: 'Booking record not found.' };
  }

  const booking = bookings[index];

  // Enforce transition rules
  if (booking.status === 'completed' && newStatus !== 'completed') {
    return { success: false, message: 'A completed booking cannot return to prior statuses.' };
  }

  if (booking.status === 'cancelled' && newStatus === 'confirmed') {
    return { success: false, message: 'A cancelled booking cannot be confirmed directly.' };
  }

  const now = new Date().toISOString();

  if (newStatus === 'confirmed') {
    // If reschedule was accepted or confirming requested slot
    booking.confirmedDate = booking.proposedRescheduleDate || booking.preferredDate;
    booking.confirmedTimeSlot = booking.proposedRescheduleTime || booking.preferredTimeSlot;
  } else if (newStatus === 'reschedule_requested' && rescheduleDate && rescheduleTime) {
    booking.proposedRescheduleDate = rescheduleDate;
    booking.proposedRescheduleTime = rescheduleTime;
  }

  booking.status = newStatus;
  booking.dealerNotes = notes || booking.dealerNotes;
  booking.updatedAt = now;

  booking.statusHistory.push({
    status: newStatus,
    timestamp: now,
    actor: 'admin',
    actorName: adminActorName,
    notes: notes || `Status updated to ${newStatus} by ${adminActorName}.`,
  });

  bookings[index] = booking;
  saveAllBookings(bookings);

  // Notify user of status change
  let notifTitle = `Test Drive Updated: ${booking.bookingReference}`;
  let notifMsg = `Your test drive for ${booking.vehicleName} has been updated to ${newStatus}.`;

  if (newStatus === 'confirmed') {
    notifTitle = `Booking Confirmed: ${booking.vehicleName}`;
    notifMsg = `Great news! Your test drive at ${booking.dealerName} is confirmed for ${booking.confirmedDate || booking.preferredDate} at ${booking.confirmedTimeSlot || booking.preferredTimeSlot}.`;
  } else if (newStatus === 'rejected') {
    notifTitle = `Booking Update: Request Declined`;
    notifMsg = `Unfortunately ${booking.dealerName} was unable to accept your request. Reason: ${notes || 'Slot capacity limit'}.`;
  } else if (newStatus === 'completed') {
    notifTitle = `Test Drive Complete!`;
    notifMsg = `Thank you for completing your test drive in the ${booking.vehicleName}. We hope you enjoyed the experience.`;
  }

  createNotification({
    userId: booking.userId,
    title: notifTitle,
    message: notifMsg,
    category: 'test_drive',
    referenceId: booking.bookingReference,
    actionUrl: `/test-drive/${booking.id}`,
  });

  return { success: true, message: `Booking status updated to ${newStatus}.`, booking };
}
