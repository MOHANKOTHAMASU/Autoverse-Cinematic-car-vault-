// AutoVerse Stage 20: Dealer Network & Test-Drive Booking System Types
// Defines verified dealership profiles, inventory associations, availability slots,
// and the end-to-end test-drive booking lifecycle.

export type DealershipService =
  | 'new_cars'
  | 'pre_owned'
  | 'service_center'
  | 'test_drives'
  | 'ev_charging'
  | 'bespoke_studio';

export interface DealershipAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl: string;
}

export interface DealershipOpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface DealershipSlotConfig {
  daysInAdvance: number; // e.g. 14 days bookable
  slotTimes: string[]; // e.g. ["10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"]
  maxSimultaneousDrives: number; // Concurrency limit per slot (usually 1 or 2)
}

export interface Dealership {
  id: string;
  slug: string;
  name: string;
  legalEntityName: string;
  tagline: string;
  description: string;
  bannerImage: string;
  logoImage?: string;
  address: DealershipAddress;
  phone: string;
  email: string;
  websiteUrl: string;
  supportedBrands: string[]; // e.g. ['Porsche', 'Audi']
  services: DealershipService[];
  openingHours: DealershipOpeningHours;
  slotConfig: DealershipSlotConfig;
  verified: boolean;
  active: boolean;
  rating: number; // Real benchmark rating
  reviewCount: number;
  inventoryVehicleIds: string[]; // Slugs or IDs of vehicles in stock / eligible for drive
  createdAt: string;
  updatedAt: string;
}

export type TestDriveStatus =
  | 'requested'
  | 'pending_confirmation'
  | 'confirmed'
  | 'reschedule_requested'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'no_show';

export interface BookingStatusHistoryEntry {
  status: TestDriveStatus;
  timestamp: string;
  actor: 'user' | 'dealer' | 'admin' | 'system';
  actorName: string;
  notes?: string;
}

export interface TestDriveBooking {
  id: string;
  bookingReference: string; // e.g. "ATV-TD-784192"
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  dealerId: string;
  dealerSlug: string;
  dealerName: string;
  dealerAddressText: string;
  vehicleSlug: string;
  vehicleName: string;
  vehicleBrand: string;
  variantId?: string;
  variantName?: string;
  vehicleImageUrl?: string;
  preferredDate: string; // YYYY-MM-DD
  preferredTimeSlot: string; // e.g. "11:30 AM"
  confirmedDate?: string;
  confirmedTimeSlot?: string;
  proposedRescheduleDate?: string;
  proposedRescheduleTime?: string;
  rescheduleReason?: string;
  status: TestDriveStatus;
  userNotes?: string;
  dealerNotes?: string;
  userConsentGiven: boolean;
  drivingLicenseVerified?: boolean;
  statusHistory: BookingStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface DealerFilterParams {
  searchQuery?: string;
  city?: string;
  state?: string;
  country?: string;
  brand?: string;
  service?: DealershipService;
  activeOnly?: boolean;
}

export interface CreateBookingPayload {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  dealerId: string;
  vehicleSlug: string;
  variantId?: string;
  variantName?: string;
  preferredDate: string;
  preferredTimeSlot: string;
  userNotes?: string;
  userConsentGiven: boolean;
}
