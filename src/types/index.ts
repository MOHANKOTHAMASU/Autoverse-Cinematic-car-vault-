export type BodyType = 'sedan' | 'suv' | 'coupe' | 'sports_car' | 'estate' | 'hatchback';
export type PowertrainType = 'electric' | 'hybrid' | 'plug-in hybrid' | 'petrol' | 'diesel';
export type AvailabilityStatus = 'announced' | 'available' | 'upcoming' | 'in_deliveries';

export interface VehicleSpec {
  acceleration0to60: number; // in seconds
  acceleration0to100Kmh?: number; // 0-100 km/h in seconds
  horsepower: number; // HP
  powerKw?: number; // kW
  torqueNm?: number; // Nm
  topSpeedMph: number; // mph
  topSpeedKmh?: number; // km/h
  electricRangeMiles?: number; // EPA or WLTP miles
  electricRangeKm?: number;
  engineType: string; // e.g. "Dual Permanent Magnet Electric Motors", "4.0L Twin-Turbo V8"
  drivetrain: string; // e.g. "All-Wheel Drive (AWD)", "Rear-Wheel Drive (RWD)"
  transmission: string;
  curbWeightLbs: number;
  curbWeightKg?: number;
  batteryCapacityKwh?: number;
  voltageArchitecture?: string; // e.g. "800V Ultra-Fast", "400V"
  verifiedSource: string; // Press release or official manufacturer spec sheet
  verifiedDate: string;
}

// Stage 3 Detailed Engineering & Specification Interfaces

export interface PerformanceDetails {
  engineConfiguration?: string; // e.g. "3.0L Twin-Turbo Inline-6", "4.0L Naturally Aspirated Boxer-6"
  displacementCc?: number; // e.g. 2993 cc, 3996 cc
  valvesPerCylinder?: number;
  compressionRatio?: string;
  maxRpmRedline?: number; // e.g. 9000 RPM, 7200 RPM
  electricMotorCount?: number; // e.g. 2, 3
  motorType?: string; // e.g. "Permanent-Magnet Synchronous with Silicon Carbide Inverters"
  systemPowerHp: number;
  systemPowerKw: number;
  systemTorqueNm: number;
  combustionPowerHp?: number;
  electricMotorPowerHp?: number;
  transmissionType: string;
  gearCount?: number; // e.g. 2 for Taycan rear, 7 for PDK, 8 for Steptronic, 1 for Tesla
  drivetrainLayout: string; // e.g. "Rear-biased All-Wheel Drive with Active M Differential"
  acceleration0to60Mph: number;
  acceleration0to100Kmh: number;
  topSpeedMph: number;
  topSpeedKmh: number;
  testCycle: 'EPA' | 'WLTP' | 'Manufacturer-Certified' | 'Independent Benchmark';
  isIndependentlyBenchmarked?: boolean;
  independentTestNotes?: string;
}

export interface InteriorComfortDetails {
  seatingCapacity: number;
  upholsteryStandard: string;
  upholsteryOptions: string[];
  frontSeatAdjustment: string; // e.g. "18-Way Electric Adaptive Sport Seats with Memory"
  heatingStandard: boolean;
  ventilationStandard: boolean;
  ventilationAvailability: 'Standard' | 'Optional' | 'Trim-Restricted' | 'Not Available';
  massageAvailability: 'Standard' | 'Optional' | 'Trim-Restricted' | 'Not Available';
  rearSeatComfort: string;
  climateControl: string; // e.g. "4-Zone Automatic Climate Control with PM2.5 Microparticle Filtration"
  airFiltration: string;
  ambientLighting: string;
  dashboardTrimMaterials: string;
  infotainmentDisplay: string; // e.g. "Curved 16.8-inch OLED instrument cluster + 10.9-inch central touchscreen"
  audioSystemBrand: string; // e.g. "Burmester 3D High-End Surround Sound", "Bowers & Wilkins Diamond"
  speakerCount: number;
  audioTotalWatts?: number;
  rearPassengerAmenities: string;
  cargoCapacityLiters: number;
  cargoCapacityCuFt: number;
  frunkCapacityLiters?: number;
  frunkCapacityCuFt?: number;
  cabinNoiseAcoustics: string; // e.g. "Double-glazed thermally insulated acoustic glass"
}

export interface ManufacturingDetails {
  chassisConstruction: string; // e.g. "Aluminum-steel hybrid lightweight monocoque with high-strength hot-formed steels"
  materialsComposition: string; // e.g. "Aluminum body panels, carbon fiber reinforced polymer (CFRP) roof"
  batteryChemistry?: string; // e.g. "Nickel-Manganese-Cobalt (NMC) 811 Lithium-Ion pouch cells"
  batteryThermalManagement?: string;
  electricMotorTech?: string; // e.g. "Hairpin-winding technology with pulse inverters using silicon carbide semiconductors"
  structuralDesign: string;
  assemblyPlantLocation: string; // e.g. "Zuffenhausen Factory, Stuttgart, Baden-Württemberg, Germany"
  assemblyProcessesDisclosed: string;
  sustainableMaterials: string;
  safetyCellDesign: string;
  torsionalRigidityNmDeg?: number;
}

export interface SafetyDetails {
  airbagCount: number;
  airbagLocations: string[];
  activeSafetySystems: string[];
  driverAssistanceSuite: string; // e.g. "Porsche InnoDrive with Adaptive Cruise Control and Active Lane Guidance"
  adasLevel: string; // e.g. "Level 2 SAE Driver Assistance"
  adasLimitationNotice: string; // Explicit statement distinguishing driver assistance from autonomous driving
  parkingAssistance: string;
  crashTestRating?: {
    agency: 'Euro NCAP' | 'NHTSA' | 'IIHS' | 'Bharat NCAP' | 'Global NCAP';
    score: string; // e.g. "5 Stars", "Top Safety Pick+"
    testYear: number;
  };
  brakingHardware: string; // e.g. "Porsche Ceramic Composite Brakes (PCCB) 10-piston front calipers, 420mm ceramic discs"
  stabilitySystems: string;
}

export interface EfficiencyDetails {
  ratedRangeMiles?: number;
  ratedRangeKm?: number;
  rangeTestCycle?: 'EPA' | 'WLTP' | 'Combined';
  batteryGrossKwh?: number;
  batteryUsableKwh?: number;
  energyConsumptionKwh100Km?: number;
  energyConsumptionMpge?: number;
  fuelEconomyMpgCombined?: number;
  fuelEconomyLiters100Km?: number;
  fuelTankCapacityLiters?: number;
  fuelTankCapacityGallons?: number;
  chargingMaxDcKw?: number; // e.g. 320 kW
  chargingTimeDc10to80?: string; // e.g. "18 minutes under optimal conditions (800V DC Fast Charging)"
  chargingMaxAcKw?: number; // e.g. 11 kW / 22 kW
  realWorldRangeFactors: {
    coldWeatherImpact: string; // e.g. "Estimated 15-22% range decrease below 0°C (32°F)"
    highwayCruisingImpact: string; // e.g. "Higher aerodynamic drag at 75 mph reduces efficiency by ~18%"
    wheelSizeImpact: string; // e.g. "21-inch performance wheels reduce range by ~12-15 miles vs 20-inch aero wheels"
  };
}

export interface VehicleDimensions {
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wheelbaseMm?: number;
  groundClearanceMm?: number;
}

export interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  variant: string;
  modelYear: number;
  generation?: string;
  bodyType: BodyType;
  powertrain: PowertrainType;
  market: string;
  announcementDate: string;
  marketLaunchDate: string;
  availabilityStatus: AvailabilityStatus;
  publicationStatus?: 'draft' | 'published' | 'unpublished' | 'archived';
  price?: number;
  currency?: string;
  horsepower: number;
  powerKw?: number;
  torqueNm?: number;
  accelerationSeconds: number;
  topSpeedKmh?: number;
  topSpeedMph: number;
  electricRangeKm?: number;
  electricRangeMiles?: number;
  batteryCapacityKWh?: number;
  transmission?: string;
  drivetrain?: string;
  dimensions?: VehicleDimensions;
  imageGallery: string[];
  thumbnail: string;
  officialUrl: string;
  specificationSource: string;
  lastVerifiedAt: string;

  // Stage 3 Detailed Engineering Modules
  performanceDetails?: PerformanceDetails;
  interiorDetails?: InteriorComfortDetails;
  manufacturingDetails?: ManufacturingDetails;
  safetyDetails?: SafetyDetails;
  efficiencyDetails?: EfficiencyDetails;

  // Backwards-compatible aliases for Stage 1 & 2 components
  name: string;
  manufacturerId: string;
  manufacturerName: string;
  year: number;
  tagline: string;
  category: 'electric' | 'hybrid' | 'petrol' | 'diesel' | 'track';
  priceStartingUsd: number;
  specs: VehicleSpec;
  heroImage: string;
  sideImage?: string;
  interiorImage: string;
  accentColor: string;
  description: string;
  featured: boolean;
  highlightSpecs: {
    label: string;
    value: string;
    unit?: string;
  }[];
}

export interface Manufacturer {
  id: string;
  name: string;
  country: string;
  founded: number;
  headquarters: string;
  tagline: string;
  description: string;
  flagshipFocus: string;
  brandColor: string;
  accentRgb: string;
  verifiedModelsCount: number;
  image?: string;
  officialWebsite?: string;
  signatureModels?: string[];
  publicationStatus?: 'draft' | 'published' | 'unpublished' | 'archived';
  displayOrder?: number;
}

export interface LaunchItem {
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
  status: 'announced' | 'available' | 'upcoming' | 'Global Premiere' | 'Order Banks Open' | 'Production Started' | 'In Deliveries';
  publicationStatus?: 'draft' | 'published' | 'unpublished' | 'archived';
  startingPrice?: number;
  currency?: string;
  headline: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  image: string;
  lastVerifiedAt: string;
}

export interface RoadFilm {
  id: string;
  title: string;
  vehicle: string;
  duration: string;
  location: string;
  description: string;
  thumbnail: string;
  videoUrl?: string;
  directorNote?: string;
  aspectRatio: string;
}
