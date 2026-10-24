import type { PowertrainType } from './index';

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP';

export type PriceBasis = 'ex_showroom' | 'on_road' | 'transaction' | 'user_entered';

export type PurchaseMode = 'cash' | 'financed';

export type OwnershipPeriod = 1 | 3 | 5 | 8;

export interface RegionPricingProfile {
  id: string;
  name: string;
  country: string;
  currency: CurrencyCode;
  currencySymbol: string;
  defaultRtoPercentIce: number; // Registration % for ICE
  defaultRtoPercentEv: number; // Registration % for EV (often 0 or subsidized)
  defaultInsurancePercent: number; // % of ex-showroom
  standardCharges: number; // e.g. Fastag, TCS, green cess, registration fee
  defaultFuelPricePetrol: number; // per liter
  defaultFuelPriceDiesel: number; // per liter
  defaultHomeElectricityTariff: number; // per kWh
  defaultPublicChargingTariff: number; // per kWh
  isVerified: boolean;
  source: string;
  lastVerifiedDate: string;
}

export interface OnRoadCostBreakdown {
  exShowroomPrice: number;
  registrationRoadTax: number;
  insurance: number;
  mandatoryCharges: number; // TCS, Fastag, Green cess, RTO fee
  accessories: number;
  otherCosts: number;
  totalOnRoadPrice: number;
  priceBasis: PriceBasis;
  region: string;
  isEstimate: boolean;
  verifiedSource?: string;
  verifiedDate?: string;
}

export interface LoanParameters {
  vehiclePrice: number;
  downPayment: number;
  principalFinanced: number;
  annualInterestRate: number; // Percentage (e.g., 8.5)
  loanTenureMonths: number; // e.g., 12, 24, 36, 48, 60, 72, 84
  processingFee: number;
  additionalUpfrontCosts: number;
}

export interface LoanCalculationResult {
  downPayment: number;
  principalFinanced: number;
  monthlyEmi: number;
  totalScheduledPayments: number;
  totalInterest: number;
  totalAmountPayable: number;
  processingFee: number;
  effectiveAnnualRate: number;
  isZeroInterest: boolean;
  tenureMonths: number;
}

export interface AmortizationScheduleEntry {
  installmentNumber: number;
  paymentAmount: number;
  principalPortion: number;
  interestPortion: number;
  remainingBalance: number;
}

export interface EnergyParameters {
  powertrain: PowertrainType;
  annualDistanceKm: number;
  // Fuel parameters
  fuelEconomyKmL?: number;
  fuelPricePerLiter?: number;
  // EV parameters
  evEfficiencyKwh100Km?: number;
  homeChargingPercent?: number; // 0-100
  publicChargingPercent?: number; // 0-100
  homeElectricityTariff?: number; // per kWh
  publicChargingTariff?: number; // per kWh
  chargingLossPercent?: number; // e.g. 10%
  // Hybrid parameters
  hybridEvSharePercent?: number; // % electric vs fuel
}

export interface EnergyCostResult {
  annualFuelCost: number;
  annualChargingCost: number;
  totalAnnualEnergyCost: number;
  periodEnergyCost: number; // annual * years
  annualFuelConsumptionLiters: number;
  annualEnergyConsumptionKwh: number;
  sourceNotes: string;
}

export interface MaintenanceAndInsuranceParameters {
  annualRoutineService: number;
  annualRepairsAndTyres: number;
  annualInsuranceRenewal: number;
  annualRoadTaxRenewals: number;
  oneTimeChargerEquipment: number; // e.g., Level 2 wallbox installation for EV
  otherRecurringAnnual: number;
  isImportedFromGarage?: boolean;
}

export interface TcoParameters {
  vehicleId: string;
  vehicleSlug: string;
  vehicleName: string;
  variant: string;
  brand: string;
  currency: CurrencyCode;
  region: string;
  purchaseMode: PurchaseMode;
  ownershipPeriodYears: OwnershipPeriod;
  onRoadCost: OnRoadCostBreakdown;
  loan: LoanParameters;
  energy: EnergyParameters;
  maintenance: MaintenanceAndInsuranceParameters;
  estimatedResaleValue?: number;
  resaleValueMethod: 'none' | 'depreciation_percent' | 'custom_amount';
  depreciationRatePercentPerYear?: number;
}

export interface TcoResult {
  ownershipPeriodYears: number;
  purchaseMode: PurchaseMode;
  initialOutlay: number; // Down payment + upfront fees OR full cash price
  totalFinancingPayments: number; // Loan principal + interest (0 for cash)
  totalLoanInterest: number; // Interest component only
  totalEnergyCost: number;
  totalMaintenanceAndRepairs: number;
  totalInsuranceRenewals: number;
  totalOtherFees: number;
  grossTco: number; // Sum of all real expenditures over ownership period
  resaleValue: number; // 0 if not entered
  netTco: number; // grossTco - resaleValue
  costPerYear: number;
  costPerKm: number;
  totalDistanceKm: number;
  accountingMethod: string;
  disclaimer: string;
}

export interface SavedTcoScenario {
  id: string;
  userId: string;
  scenarioName: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: string;
  parameters: TcoParameters;
  results: TcoResult;
}

export interface MultiVehicleComparisonItem {
  vehicleId: string;
  vehicleSlug: string;
  name: string;
  variant: string;
  brand: string;
  thumbnail: string;
  powertrain: PowertrainType;
  price: number;
  currency: CurrencyCode;
  parameters: TcoParameters;
  results: TcoResult;
}
