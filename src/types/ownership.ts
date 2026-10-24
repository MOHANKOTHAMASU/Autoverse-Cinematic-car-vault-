export type OdometerUnit = 'km' | 'mi';
export type FuelVolumeUnit = 'liters' | 'gallons';
export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP';
export type PowertrainType = 'Electric' | 'Petrol' | 'Diesel' | 'Hybrid' | 'Plug-in Hybrid';

export interface OwnedVehicle {
  id: string;
  userId: string; // Enforces user ownership
  vehicleSlug?: string; // Linked AutoVerse catalog slug (Method A)
  isCustom: boolean; // Method B if true
  make: string;
  model: string;
  variant?: string;
  year: number;
  powertrain: PowertrainType;
  nickname?: string;
  color?: string;
  currentOdometer: number;
  odometerUnit: OdometerUnit;
  odometerLastUpdated: string; // ISO date
  purchaseDate?: string;
  purchasePrice?: number;
  currency: CurrencyCode;
  photoUrl?: string;
  // Private identifiers - never exposed in public views or share links
  licensePlate?: string;
  vin?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MaintenanceStatus = 'upcoming' | 'due' | 'overdue' | 'completed';

export interface MaintenanceTask {
  id: string;
  userId: string;
  ownedVehicleId: string;
  taskName: string;
  category: 'oil_change' | 'brake_inspection' | 'tyre_rotation' | 'battery_check' | 'coolant_fluids' | 'scheduled_service' | 'ev_charging_system' | 'other';
  notes?: string;
  lastServiceDate?: string;
  lastServiceOdometer?: number;
  nextDueDate?: string;
  nextDueOdometer?: number;
  status: MaintenanceStatus;
  statusReason?: string;
  estimatedCost?: number;
  currency: CurrencyCode;
  serviceProvider?: string;
  reminderEnabled: boolean;
  isCompleted: boolean;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRecord {
  id: string;
  userId: string;
  ownedVehicleId: string;
  serviceDate: string;
  odometer: number;
  odometerUnit: OdometerUnit;
  category: 'routine_service' | 'repairs' | 'tyres' | 'battery' | 'inspections' | 'parts' | 'recall' | 'other';
  workPerformed: string;
  partsReplaced?: string;
  serviceProvider: string;
  cost: number;
  currency: CurrencyCode;
  nextServiceRecommendation?: string;
  notes?: string;
  receiptAttachmentName?: string;
  receiptAttachmentSize?: number;
  receiptAttachmentUrl?: string; // Private object reference, authenticated
  isVerifiedByServiceCenter: boolean; // Distinguishes owner-entered from partner verified
  linkedMaintenanceTaskId?: string;
  createdAt: string;
}

export interface FuelChargingLog {
  id: string;
  userId: string;
  ownedVehicleId: string;
  date: string;
  odometer: number;
  odometerUnit: OdometerUnit;
  type: 'fuel' | 'charge';
  // Fuel fields
  fuelQuantity?: number; // Liters or Gallons
  fuelUnit?: FuelVolumeUnit;
  pricePerUnit?: number;
  fullTank?: boolean;
  // EV Charging fields
  energyAddedKwh?: number;
  chargingLocation?: 'home' | 'public' | 'workplace';
  chargingProvider?: string; // e.g. Tesla Supercharger, Tata Power EZ Charge, Electrify America
  // Common
  totalCost: number;
  currency: CurrencyCode;
  notes?: string;
  calculatedEconomy?: string; // e.g., "28.5 MPG" or "8.2 L/100km" or "3.4 mi/kWh"
  createdAt: string;
}

export type ExpenseCategory =
  | 'Fuel'
  | 'EV Charging'
  | 'Maintenance'
  | 'Repairs'
  | 'Insurance'
  | 'Taxes & Registration'
  | 'Accessories'
  | 'Parking & Tolls'
  | 'Other';

export interface VehicleExpense {
  id: string;
  userId: string;
  ownedVehicleId: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: CurrencyCode;
  serviceProvider?: string;
  sourceType: 'manual' | 'service_record' | 'fuel_log';
  sourceRecordId?: string;
  createdAt: string;
}

export type ReminderType = 'maintenance' | 'insurance' | 'registration' | 'tyre_check' | 'emissions' | 'custom';

export interface OwnershipReminder {
  id: string;
  userId: string;
  ownedVehicleId: string;
  title: string;
  type: ReminderType;
  dueDate: string;
  dueOdometer?: number;
  description?: string;
  enabled: boolean;
  isRead: boolean;
  isCompleted: boolean;
  createdAt: string;
}

export interface GarageUserSettings {
  preferredOdometerUnit: OdometerUnit;
  preferredCurrency: CurrencyCode;
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
}
