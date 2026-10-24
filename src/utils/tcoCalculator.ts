import type {
  CurrencyCode,
  RegionPricingProfile,
  OnRoadCostBreakdown,
  LoanParameters,
  LoanCalculationResult,
  AmortizationScheduleEntry,
  EnergyParameters,
  EnergyCostResult,
  MaintenanceAndInsuranceParameters,
  TcoParameters,
  TcoResult,
  SavedTcoScenario,
  OwnershipPeriod,
} from '../types/calculator';
import type { Vehicle } from '../types';

export const REGIONAL_PROFILES: Record<string, RegionPricingProfile> = {
  delhi: {
    id: 'delhi',
    name: 'Delhi NCR (India)',
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    defaultRtoPercentIce: 10.0,
    defaultRtoPercentEv: 0.0, // Delhi EV Policy 0% Road Tax
    defaultInsurancePercent: 3.5,
    standardCharges: 1500, // Fastag, basic RTO smart card & cess
    defaultFuelPricePetrol: 94.72,
    defaultFuelPriceDiesel: 87.62,
    defaultHomeElectricityTariff: 6.5,
    defaultPublicChargingTariff: 18.0,
    isVerified: true,
    source: 'Delhi Transport Dept & DERC Official Tariffs',
    lastVerifiedDate: 'October 2024',
  },
  maharashtra: {
    id: 'maharashtra',
    name: 'Maharashtra / Mumbai (India)',
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    defaultRtoPercentIce: 12.0,
    defaultRtoPercentEv: 0.0,
    defaultInsurancePercent: 3.5,
    standardCharges: 2000,
    defaultFuelPricePetrol: 103.44,
    defaultFuelPriceDiesel: 89.97,
    defaultHomeElectricityTariff: 8.5,
    defaultPublicChargingTariff: 21.0,
    isVerified: true,
    source: 'Maharashtra Motor Vehicles Dept & MERC Tariffs',
    lastVerifiedDate: 'October 2024',
  },
  karnataka: {
    id: 'karnataka',
    name: 'Karnataka / Bengaluru (India)',
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    defaultRtoPercentIce: 15.0,
    defaultRtoPercentEv: 4.0, // Subsidized EV tax
    defaultInsurancePercent: 3.5,
    standardCharges: 2500,
    defaultFuelPricePetrol: 102.86,
    defaultFuelPriceDiesel: 88.94,
    defaultHomeElectricityTariff: 7.5,
    defaultPublicChargingTariff: 22.0,
    isVerified: true,
    source: 'Karnataka Transport Dept & BESCOM Tariff Schedule',
    lastVerifiedDate: 'October 2024',
  },
  tamil_nadu: {
    id: 'tamil_nadu',
    name: 'Tamil Nadu / Chennai (India)',
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    defaultRtoPercentIce: 11.0,
    defaultRtoPercentEv: 0.0,
    defaultInsurancePercent: 3.5,
    standardCharges: 1800,
    defaultFuelPricePetrol: 100.75,
    defaultFuelPriceDiesel: 92.34,
    defaultHomeElectricityTariff: 6.8,
    defaultPublicChargingTariff: 19.0,
    isVerified: true,
    source: 'Tamil Nadu Motor Vehicles Rules & TANGEDCO',
    lastVerifiedDate: 'October 2024',
  },
  telangana: {
    id: 'telangana',
    name: 'Telangana / Hyderabad (India)',
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    defaultRtoPercentIce: 13.0,
    defaultRtoPercentEv: 0.0,
    defaultInsurancePercent: 3.5,
    standardCharges: 1800,
    defaultFuelPricePetrol: 107.41,
    defaultFuelPriceDiesel: 95.65,
    defaultHomeElectricityTariff: 7.2,
    defaultPublicChargingTariff: 20.0,
    isVerified: true,
    source: 'Telangana Transport Dept & TSSPDCL Tariffs',
    lastVerifiedDate: 'October 2024',
  },
  gujarat: {
    id: 'gujarat',
    name: 'Gujarat / Ahmedabad (India)',
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    defaultRtoPercentIce: 6.0,
    defaultRtoPercentEv: 0.0,
    defaultInsurancePercent: 3.2,
    standardCharges: 1500,
    defaultFuelPricePetrol: 94.42,
    defaultFuelPriceDiesel: 90.12,
    defaultHomeElectricityTariff: 6.2,
    defaultPublicChargingTariff: 17.5,
    isVerified: true,
    source: 'Gujarat Motor Vehicle Tax Schedule & GUVNL',
    lastVerifiedDate: 'October 2024',
  },
  us_general: {
    id: 'us_general',
    name: 'United States (National Average)',
    country: 'USA',
    currency: 'USD',
    currencySymbol: '$',
    defaultRtoPercentIce: 7.0, // Sales tax + DMV
    defaultRtoPercentEv: 5.0,
    defaultInsurancePercent: 3.0,
    standardCharges: 450, // Documentation & registration fees
    defaultFuelPricePetrol: 0.95, // ~$3.60 / gallon in liters ($0.95/L)
    defaultFuelPriceDiesel: 1.05,
    defaultHomeElectricityTariff: 0.16, // $0.16 / kWh
    defaultPublicChargingTariff: 0.42, // $0.42 / kWh DC Fast
    isVerified: true,
    source: 'US EIA & Bureau of Transportation Statistics',
    lastVerifiedDate: 'October 2024',
  },
  uk_general: {
    id: 'uk_general',
    name: 'United Kingdom (National Average)',
    country: 'UK',
    currency: 'GBP',
    currencySymbol: '£',
    defaultRtoPercentIce: 5.0, // VED first year + registration
    defaultRtoPercentEv: 1.0,
    defaultInsurancePercent: 4.0,
    standardCharges: 250,
    defaultFuelPricePetrol: 1.42, // £1.42 / L
    defaultFuelPriceDiesel: 1.48,
    defaultHomeElectricityTariff: 0.24, // £0.24 / kWh
    defaultPublicChargingTariff: 0.65, // £0.65 / kWh Rapid
    isVerified: true,
    source: 'UK Department for Transport & Ofgem',
    lastVerifiedDate: 'October 2024',
  },
  eu_germany: {
    id: 'eu_germany',
    name: 'Germany / European Union',
    country: 'Germany',
    currency: 'EUR',
    currencySymbol: '€',
    defaultRtoPercentIce: 4.0, // Registration and initial tax
    defaultRtoPercentEv: 0.5,
    defaultInsurancePercent: 3.8,
    standardCharges: 200,
    defaultFuelPricePetrol: 1.75, // €1.75 / L
    defaultFuelPriceDiesel: 1.65,
    defaultHomeElectricityTariff: 0.38, // €0.38 / kWh
    defaultPublicChargingTariff: 0.55, // €0.55 / kWh
    isVerified: true,
    source: 'Federal Ministry for Economic Affairs and Climate Action (BMWK)',
    lastVerifiedDate: 'October 2024',
  },
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
};

// Conversion baseline approximate multiplier if user switches currencies
export const CURRENCY_RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1.0,
  INR: 0.012, // ~₹83.5 per $1
  EUR: 1.08,
  GBP: 1.3,
};

/**
 * Format a number as regional currency with clean rounding
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  if (isNaN(amount) || !isFinite(amount)) return `${CURRENCY_SYMBOLS[currency]}0`;

  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  if (currency === 'INR') {
    // Format in Indian Lakh / Crore notation
    const rounded = Math.round(amount);
    const abs = Math.abs(rounded);
    const sign = rounded < 0 ? '-' : '';

    if (abs >= 10000000) {
      // Crore
      return `${sign}${symbol}${(abs / 10000000).toFixed(2)} Cr`;
    } else if (abs >= 100000) {
      // Lakh
      return `${sign}${symbol}${(abs / 100000).toFixed(2)} Lakh`;
    }
    return `${sign}${symbol}${abs.toLocaleString('en-IN')}`;
  }

  // Western formatting for USD, EUR, GBP
  return `${symbol}${Math.round(amount).toLocaleString('en-US')}`;
}

/**
 * Calculate On-Road Cost Breakdown
 */
export function calculateOnRoadPrice(
  exShowroom: number,
  powertrain: string,
  regionKey: string,
  customTax?: number,
  customInsurance?: number,
  customAccessories: number = 0,
  customOther: number = 0
): OnRoadCostBreakdown {
  const profile = REGIONAL_PROFILES[regionKey] || REGIONAL_PROFILES.delhi;
  const isEv = powertrain.toLowerCase() === 'electric';

  const rtoPercent =
    customTax !== undefined
      ? customTax
      : isEv
      ? profile.defaultRtoPercentEv
      : profile.defaultRtoPercentIce;

  const insurancePercent =
    customInsurance !== undefined ? customInsurance : profile.defaultInsurancePercent;

  const validExShowroom = Math.max(0, exShowroom || 0);

  const registrationRoadTax = Math.round((validExShowroom * rtoPercent) / 100);
  const insurance = Math.round((validExShowroom * insurancePercent) / 100);

  // Mandatory charges (TCS 1% if above ₹10 Lakhs or $15,000 USD, plus standard fee)
  let mandatory = profile.standardCharges;
  if (profile.currency === 'INR' && validExShowroom > 1000000) {
    mandatory += Math.round(validExShowroom * 0.01); // 1% TCS
  } else if (profile.currency === 'USD' && validExShowroom > 20000) {
    mandatory += Math.round(validExShowroom * 0.005);
  }

  const accessories = Math.max(0, customAccessories || 0);
  const otherCosts = Math.max(0, customOther || 0);

  const totalOnRoadPrice =
    validExShowroom + registrationRoadTax + insurance + mandatory + accessories + otherCosts;

  return {
    exShowroomPrice: validExShowroom,
    registrationRoadTax,
    insurance,
    mandatoryCharges: mandatory,
    accessories,
    otherCosts,
    totalOnRoadPrice,
    priceBasis: 'on_road',
    region: profile.name,
    isEstimate: true,
    verifiedSource: profile.source,
    verifiedDate: profile.lastVerifiedDate,
  };
}

/**
 * Precise Loan and Monthly EMI calculation
 * Formula: EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
 * Zero-interest handle: EMI = P / n
 */
export function calculateLoanEmi(params: LoanParameters): LoanCalculationResult {
  const vehiclePrice = Math.max(0, params.vehiclePrice || 0);
  const downPayment = Math.min(vehiclePrice, Math.max(0, params.downPayment || 0));
  const principalFinanced = Math.max(0, vehiclePrice - downPayment);
  const annualRate = Math.max(0, params.annualInterestRate || 0);
  const tenureMonths = Math.max(1, Math.round(params.loanTenureMonths || 60));
  const processingFee = Math.max(0, params.processingFee || 0);

  if (principalFinanced === 0) {
    return {
      downPayment,
      principalFinanced: 0,
      monthlyEmi: 0,
      totalScheduledPayments: 0,
      totalInterest: 0,
      totalAmountPayable: downPayment + processingFee,
      processingFee,
      effectiveAnnualRate: annualRate,
      isZeroInterest: true,
      tenureMonths,
    };
  }

  // Handle 0% interest loans without division by zero
  if (annualRate === 0) {
    const monthlyEmi = principalFinanced / tenureMonths;
    const totalScheduledPayments = principalFinanced;
    const totalAmountPayable = principalFinanced + processingFee;

    return {
      downPayment,
      principalFinanced,
      monthlyEmi,
      totalScheduledPayments,
      totalInterest: 0,
      totalAmountPayable,
      processingFee,
      effectiveAnnualRate: 0,
      isZeroInterest: true,
      tenureMonths,
    };
  }

  // Monthly interest rate as a decimal
  const monthlyRate = annualRate / 12 / 100;

  // (1 + r)^n
  const compoundFactor = Math.pow(1 + monthlyRate, tenureMonths);

  // EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const monthlyEmi = (principalFinanced * monthlyRate * compoundFactor) / (compoundFactor - 1);
  const totalScheduledPayments = monthlyEmi * tenureMonths;
  const totalInterest = Math.max(0, totalScheduledPayments - principalFinanced);
  const totalAmountPayable = totalScheduledPayments + processingFee;

  return {
    downPayment,
    principalFinanced,
    monthlyEmi,
    totalScheduledPayments,
    totalInterest,
    totalAmountPayable,
    processingFee,
    effectiveAnnualRate: annualRate,
    isZeroInterest: false,
    tenureMonths,
  };
}

/**
 * Generate Complete Amortization Schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): AmortizationScheduleEntry[] {
  const schedule: AmortizationScheduleEntry[] = [];
  const P = Math.max(0, principal);
  const rate = Math.max(0, annualInterestRate);
  const n = Math.max(1, Math.round(tenureMonths));

  if (P === 0) return schedule;

  const monthlyRate = rate / 12 / 100;
  let remainingBalance = P;

  let emi: number;
  if (rate === 0) {
    emi = P / n;
  } else {
    const factor = Math.pow(1 + monthlyRate, n);
    emi = (P * monthlyRate * factor) / (factor - 1);
  }

  for (let month = 1; month <= n; month++) {
    let interestPortion = rate === 0 ? 0 : remainingBalance * monthlyRate;
    let principalPortion = emi - interestPortion;

    // Final month rounding adjustment
    if (month === n || principalPortion > remainingBalance) {
      principalPortion = remainingBalance;
      emi = principalPortion + interestPortion;
      remainingBalance = 0;
    } else {
      remainingBalance = Math.max(0, remainingBalance - principalPortion);
    }

    schedule.push({
      installmentNumber: month,
      paymentAmount: emi,
      principalPortion,
      interestPortion,
      remainingBalance,
    });

    if (remainingBalance <= 0) break;
  }

  return schedule;
}

/**
 * Calculate Fuel and EV Energy Consumption & Cost
 */
export function calculateEnergyExpenses(
  params: EnergyParameters,
  ownershipYears: OwnershipPeriod
): EnergyCostResult {
  const distance = Math.max(0, params.annualDistanceKm || 15000);
  const pType = (params.powertrain || 'petrol').toLowerCase();

  let annualFuelCost = 0;
  let annualChargingCost = 0;
  let annualFuelConsumptionLiters = 0;
  let annualEnergyConsumptionKwh = 0;
  let sourceNotes = '';

  if (pType === 'electric') {
    // Pure EV
    const efficiencyKwh100Km = Math.max(5, params.evEfficiencyKwh100Km || 16.5);
    const lossMultiplier = 1 + Math.max(0, (params.chargingLossPercent || 10) / 100);

    // Normalize home + public percentages
    let rawHome = params.homeChargingPercent ?? 80;
    let rawPublic = params.publicChargingPercent ?? 20;
    const totalP = rawHome + rawPublic;
    const homeRatio = totalP > 0 ? rawHome / totalP : 0.8;
    const publicRatio = totalP > 0 ? rawPublic / totalP : 0.2;

    const netKwhNeeded = (distance / 100) * efficiencyKwh100Km;
    const grossKwhDrawn = netKwhNeeded * lossMultiplier;
    annualEnergyConsumptionKwh = grossKwhDrawn;

    const homeKwh = grossKwhDrawn * homeRatio;
    const publicKwh = grossKwhDrawn * publicRatio;

    const homeTariff = Math.max(0, params.homeElectricityTariff || 6.5);
    const publicTariff = Math.max(0, params.publicChargingTariff || 18.0);

    annualChargingCost = homeKwh * homeTariff + publicKwh * publicTariff;
    sourceNotes = `Electric: ${efficiencyKwh100Km.toFixed(1)} kWh/100km, ${Math.round(
      homeRatio * 100
    )}% Home (@${homeTariff}/kWh) / ${Math.round(
      publicRatio * 100
    )}% Public (@${publicTariff}/kWh) with ${(lossMultiplier - 1) * 100}% charging overhead`;
  } else if (pType === 'hybrid' || pType === 'plug-in hybrid') {
    // Hybrid / PHEV modeled split
    const evShare = Math.min(100, Math.max(0, params.hybridEvSharePercent ?? 40)) / 100;
    const fuelShare = 1 - evShare;

    const evDistance = distance * evShare;
    const fuelDistance = distance * fuelShare;

    // EV side
    const efficiencyKwh100Km = Math.max(5, params.evEfficiencyKwh100Km || 14.0);
    const grossKwhDrawn = (evDistance / 100) * efficiencyKwh100Km * 1.1; // 10% overhead
    annualEnergyConsumptionKwh = grossKwhDrawn;
    const homeTariff = Math.max(0, params.homeElectricityTariff || 6.5);
    annualChargingCost = grossKwhDrawn * homeTariff;

    // Fuel side
    const fuelEconomy = Math.max(3, params.fuelEconomyKmL || 22.0);
    const fuelPrice = Math.max(0, params.fuelPricePerLiter || 95.0);
    annualFuelConsumptionLiters = fuelDistance / fuelEconomy;
    annualFuelCost = annualFuelConsumptionLiters * fuelPrice;

    sourceNotes = `Hybrid Split: ${Math.round(evShare * 100)}% Electric mode (@${efficiencyKwh100Km} kWh/100km) + ${Math.round(
      fuelShare * 100
    )}% Fuel mode (@${fuelEconomy} km/L, ${fuelPrice}/L)`;
  } else {
    // Petrol / Diesel (ICE)
    const fuelEconomy = Math.max(2, params.fuelEconomyKmL || (pType === 'diesel' ? 16.5 : 14.0));
    const fuelPrice = Math.max(
      0,
      params.fuelPricePerLiter || (pType === 'diesel' ? 88.0 : 95.0)
    );

    annualFuelConsumptionLiters = distance / fuelEconomy;
    annualFuelCost = annualFuelConsumptionLiters * fuelPrice;
    sourceNotes = `${pType.toUpperCase()}: ${fuelEconomy.toFixed(1)} km/L efficiency @ ${fuelPrice.toFixed(
      2
    )}/L`;
  }

  const totalAnnualEnergyCost = annualFuelCost + annualChargingCost;
  const periodEnergyCost = totalAnnualEnergyCost * ownershipYears;

  return {
    annualFuelCost,
    annualChargingCost,
    totalAnnualEnergyCost,
    periodEnergyCost,
    annualFuelConsumptionLiters,
    annualEnergyConsumptionKwh,
    sourceNotes,
  };
}

/**
 * Calculate Estimated Resale Value after Y years
 * Automotive standard depreciation guideline:
 * Year 1: ~80% remaining (20% loss)
 * Year 3: ~60% remaining (40% loss)
 * Year 5: ~45% remaining (55% loss)
 * Year 8: ~30% remaining (70% loss)
 */
export function calculateEstimatedResaleValue(
  originalPrice: number,
  ownershipYears: OwnershipPeriod,
  method: 'none' | 'depreciation_percent' | 'custom_amount' = 'depreciation_percent',
  customAmount?: number,
  customAnnualRate?: number
): number {
  if (method === 'none') return 0;
  if (method === 'custom_amount') return Math.max(0, customAmount || 0);

  const price = Math.max(0, originalPrice || 0);
  if (customAnnualRate !== undefined) {
    const retainedFactor = Math.pow(1 - customAnnualRate / 100, ownershipYears);
    return Math.round(price * retainedFactor);
  }

  // Standard industry curve
  switch (ownershipYears) {
    case 1:
      return Math.round(price * 0.82);
    case 3:
      return Math.round(price * 0.62);
    case 5:
      return Math.round(price * 0.46);
    case 8:
      return Math.round(price * 0.3);
    default:
      return Math.round(price * 0.5);
  }
}

/**
 * Comprehensive Total Cost of Ownership (TCO) Calculator
 * Transparent accounting:
 * Cash: TCO = Initial Outlay (On-Road Price) + Operating + Maintenance + Insurance - Resale
 * Financed: TCO = Down Payment + Upfront Fees + Total Scheduled Loan Payments during period + Operating + Maintenance + Insurance - Resale
 * STRICT RULE: No double-counting vehicle purchase price and financed principal!
 */
export function calculateTco(params: TcoParameters): TcoResult {
  const years = params.ownershipPeriodYears || 5;
  const isFinanced = params.purchaseMode === 'financed';
  const onRoad = params.onRoadCost;
  const loan = params.loan;
  const energy = calculateEnergyExpenses(params.energy, years);

  const annualService = Math.max(0, params.maintenance.annualRoutineService || 0);
  const annualRepairs = Math.max(0, params.maintenance.annualRepairsAndTyres || 0);
  const annualInsurance = Math.max(0, params.maintenance.annualInsuranceRenewal || 0);
  const annualRoadTax = Math.max(0, params.maintenance.annualRoadTaxRenewals || 0);
  const oneTimeWallbox = Math.max(0, params.maintenance.oneTimeChargerEquipment || 0);
  const otherRecurring = Math.max(0, params.maintenance.otherRecurringAnnual || 0);

  const totalMaintenanceAndRepairs = (annualService + annualRepairs) * years + oneTimeWallbox;
  const totalInsuranceRenewals = annualInsurance * years;
  const totalOtherFees = (annualRoadTax + otherRecurring) * years;
  const totalEnergyCost = energy.periodEnergyCost;

  let initialOutlay = 0;
  let totalFinancingPayments = 0;
  let totalLoanInterest = 0;

  if (!isFinanced) {
    // CASH PURCHASE
    // Initial outlay is the full on-road price
    initialOutlay = onRoad.totalOnRoadPrice;
  } else {
    // FINANCED PURCHASE
    // Down payment + processing fee + additional upfront costs
    const loanResult = calculateLoanEmi(loan);

    initialOutlay =
      loan.downPayment +
      loan.processingFee +
      loan.additionalUpfrontCosts +
      onRoad.accessories +
      onRoad.otherCosts;

    // Number of months vehicle is held
    const heldMonths = years * 12;
    const loanMonths = loanResult.tenureMonths;

    if (heldMonths >= loanMonths) {
      // Loan is fully paid off within ownership duration
      totalFinancingPayments = loanResult.totalScheduledPayments;
      totalLoanInterest = loanResult.totalInterest;
    } else {
      // Vehicle sold before loan maturity:
      // Scheduled payments made for heldMonths + remaining principal payoff at exit
      const amortSchedule = generateAmortizationSchedule(
        loanResult.principalFinanced,
        loanResult.effectiveAnnualRate,
        loanMonths
      );

      let paidSoFar = 0;
      let interestSoFar = 0;
      let remainingBalanceAtExit = 0;

      for (let i = 0; i < heldMonths && i < amortSchedule.length; i++) {
        paidSoFar += amortSchedule[i].paymentAmount;
        interestSoFar += amortSchedule[i].interestPortion;
      }

      if (heldMonths < amortSchedule.length) {
        remainingBalanceAtExit = amortSchedule[heldMonths - 1].remainingBalance;
      }

      // Total money paid to lender = payments made + remaining principal paid off upon sale
      totalFinancingPayments = paidSoFar + remainingBalanceAtExit;
      totalLoanInterest = interestSoFar;
    }
  }

  // Calculate resale value
  const basePriceForResale = onRoad.exShowroomPrice || onRoad.totalOnRoadPrice;
  const resaleValue = calculateEstimatedResaleValue(
    basePriceForResale,
    years,
    params.resaleValueMethod,
    params.estimatedResaleValue,
    params.depreciationRatePercentPerYear
  );

  // Gross real money out of pocket over the ownership duration
  const grossTco =
    initialOutlay +
    totalFinancingPayments +
    totalEnergyCost +
    totalMaintenanceAndRepairs +
    totalInsuranceRenewals +
    totalOtherFees;

  // Net TCO after deducting resale capital recouped
  const netTco = Math.max(0, grossTco - resaleValue);

  const totalDistanceKm = (params.energy.annualDistanceKm || 15000) * years;
  const costPerYear = netTco / years;
  const costPerKm = totalDistanceKm > 0 ? netTco / totalDistanceKm : 0;

  const accountingMethod = isFinanced
    ? `Financed TCO: Down Payment (${formatCurrency(
        loan.downPayment,
        params.currency
      )}) + Upfront Fees + Financing Payments (${formatCurrency(
        totalFinancingPayments,
        params.currency
      )}) + Energy + Maintenance + Insurance - Resale (${formatCurrency(
        resaleValue,
        params.currency
      )})`
    : `Cash TCO: Total On-Road Purchase Outlay (${formatCurrency(
        initialOutlay,
        params.currency
      )}) + Energy + Maintenance + Insurance - Resale (${formatCurrency(
        resaleValue,
        params.currency
      )})`;

  const disclaimer =
    'Financial projections, road tax assessments, fuel tariffs, and depreciation curves are computational estimates for exploratory guidance and do not constitute a formal loan sanction or guaranteed valuation.';

  return {
    ownershipPeriodYears: years,
    purchaseMode: params.purchaseMode,
    initialOutlay,
    totalFinancingPayments,
    totalLoanInterest,
    totalEnergyCost,
    totalMaintenanceAndRepairs,
    totalInsuranceRenewals,
    totalOtherFees,
    grossTco,
    resaleValue,
    netTco,
    costPerYear,
    costPerKm,
    totalDistanceKm,
    accountingMethod,
    disclaimer,
  };
}

/**
 * Generate Default TCO Parameters from a Vehicle and Regional Profile
 */
export function createDefaultTcoParameters(
  vehicle: Vehicle,
  regionKey: string = 'delhi',
  currency: CurrencyCode = 'INR'
): TcoParameters {
  const profile = REGIONAL_PROFILES[regionKey] || REGIONAL_PROFILES.delhi;
  const isEv = vehicle.powertrain === 'electric';
  const isHybrid = vehicle.powertrain === 'hybrid' || vehicle.powertrain === 'plug-in hybrid';

  // Base price
  let basePrice = vehicle.price || vehicle.priceStartingUsd || 25000;
  if (currency === 'INR' && vehicle.currency !== 'INR') {
    basePrice = Math.round(basePrice * (1 / CURRENCY_RATES_TO_USD.INR));
  } else if (currency === 'USD' && vehicle.currency === 'INR') {
    basePrice = Math.round(basePrice * CURRENCY_RATES_TO_USD.INR);
  }

  const onRoad = calculateOnRoadPrice(basePrice, vehicle.powertrain, regionKey);

  // Loan defaults: 20% down, 8.5% interest, 5 years (60 months)
  const downPayment = Math.round(onRoad.totalOnRoadPrice * 0.2);
  const principalFinanced = onRoad.totalOnRoadPrice - downPayment;

  const loan: LoanParameters = {
    vehiclePrice: onRoad.totalOnRoadPrice,
    downPayment,
    principalFinanced,
    annualInterestRate: currency === 'INR' ? 8.75 : 6.5,
    loanTenureMonths: 60,
    processingFee: currency === 'INR' ? 2500 : 250,
    additionalUpfrontCosts: 0,
  };

  const energy: EnergyParameters = {
    powertrain: vehicle.powertrain,
    annualDistanceKm: 15000,
    fuelEconomyKmL: isHybrid ? 22.0 : vehicle.powertrain === 'diesel' ? 16.5 : 14.5,
    fuelPricePerLiter:
      vehicle.powertrain === 'diesel'
        ? profile.defaultFuelPriceDiesel
        : profile.defaultFuelPricePetrol,
    evEfficiencyKwh100Km: vehicle.efficiencyDetails?.energyConsumptionKwh100Km || 16.5,
    homeChargingPercent: 80,
    publicChargingPercent: 20,
    homeElectricityTariff: profile.defaultHomeElectricityTariff,
    publicChargingTariff: profile.defaultPublicChargingTariff,
    chargingLossPercent: 10,
    hybridEvSharePercent: 40,
  };

  // Maintenance defaults: ICE vs EV
  const annualRoutineService = isEv
    ? currency === 'INR'
      ? 8000
      : 250
    : currency === 'INR'
    ? 16000
    : 600;

  const annualRepairsAndTyres = currency === 'INR' ? 12000 : 400;
  const annualInsuranceRenewal = Math.round(onRoad.insurance * 0.85); // renewals usually depreciate IDV

  const maintenance: MaintenanceAndInsuranceParameters = {
    annualRoutineService,
    annualRepairsAndTyres,
    annualInsuranceRenewal,
    annualRoadTaxRenewals: 0, // In India road tax is 15-year one-time
    oneTimeChargerEquipment: isEv ? (currency === 'INR' ? 25000 : 800) : 0,
    otherRecurringAnnual: currency === 'INR' ? 2000 : 100,
    isImportedFromGarage: false,
  };

  return {
    vehicleId: vehicle.id,
    vehicleSlug: vehicle.slug,
    vehicleName: vehicle.name || `${vehicle.brand} ${vehicle.model}`,
    variant: vehicle.variant || 'Standard',
    brand: vehicle.brand,
    currency,
    region: profile.name,
    purchaseMode: 'financed',
    ownershipPeriodYears: 5,
    onRoadCost: onRoad,
    loan,
    energy,
    maintenance,
    resaleValueMethod: 'depreciation_percent',
  };
}

/**
 * Storage CRUD for Saved Scenarios
 */
const SCENARIOS_STORAGE_KEY = 'autoverse_saved_tco_scenarios';

export function getSavedScenarios(userId?: string): SavedTcoScenario[] {
  try {
    const raw = localStorage.getItem(SCENARIOS_STORAGE_KEY);
    if (!raw) return [];
    const all: SavedTcoScenario[] = JSON.parse(raw);
    if (!userId) return all;
    return all.filter((s) => s.userId === userId);
  } catch (err) {
    console.error('Failed to load saved TCO scenarios:', err);
    return [];
  }
}

export function saveScenario(scenario: SavedTcoScenario): boolean {
  try {
    const existing = getSavedScenarios();
    const index = existing.findIndex((s) => s.id === scenario.id);
    if (index >= 0) {
      existing[index] = scenario;
    } else {
      existing.unshift(scenario);
    }
    localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch (err) {
    console.error('Failed to save TCO scenario:', err);
    return false;
  }
}

export function deleteScenario(scenarioId: string, userId?: string): boolean {
  try {
    const existing = getSavedScenarios();
    const filtered = existing.filter((s) => {
      if (s.id !== scenarioId) return true;
      if (userId && s.userId !== userId) return true; // prevent unauthorized delete
      return false;
    });
    localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Failed to delete TCO scenario:', err);
    return false;
  }
}

/**
 * Export Scenario Breakdown to CSV
 */
export function exportTcoToCsv(scenario: SavedTcoScenario): string {
  const { parameters: p, results: r } = scenario;
  const c = p.currency;

  const rows = [
    ['AUTOVERSE TOTAL COST OF OWNERSHIP (TCO) & FINANCE REPORT'],
    ['Generated On', new Date(scenario.createdAt).toLocaleString()],
    ['Scenario Name', scenario.scenarioName],
    ['Vehicle', `${p.brand} ${p.vehicleName} (${p.variant})`],
    ['Region', p.region],
    ['Currency', c],
    ['Ownership Duration', `${r.ownershipPeriodYears} Years`],
    ['Purchase Mode', r.purchaseMode.toUpperCase()],
    [],
    ['--- ON-ROAD PURCHASE BREAKDOWN ---'],
    ['Ex-Showroom Price', r.purchaseMode === 'cash' ? r.initialOutlay : p.onRoadCost.exShowroomPrice],
    ['Registration & Road Tax', p.onRoadCost.registrationRoadTax],
    ['First Year Insurance', p.onRoadCost.insurance],
    ['Mandatory Charges (TCS/Fastag)', p.onRoadCost.mandatoryCharges],
    ['Accessories', p.onRoadCost.accessories],
    ['Other Upfront Costs', p.onRoadCost.otherCosts],
    ['Total Estimated On-Road Price', p.onRoadCost.totalOnRoadPrice],
    [],
    ['--- FINANCING & LOAN DETAILS ---'],
    ['Down Payment', p.loan.downPayment],
    ['Financed Principal', p.loan.principalFinanced],
    ['Interest Rate (% p.a.)', `${p.loan.annualInterestRate}%`],
    ['Loan Tenure (Months)', p.loan.loanTenureMonths],
    ['Monthly EMI', calculateLoanEmi(p.loan).monthlyEmi.toFixed(2)],
    ['Total Loan Interest Paid', r.totalLoanInterest],
    ['Total Financing Payments Made', r.totalFinancingPayments],
    [],
    ['--- OPERATING & MAINTENANCE EXPENSES ---'],
    ['Total Energy / Fuel Costs', r.totalEnergyCost],
    ['Total Maintenance & Repairs', r.totalMaintenanceAndRepairs],
    ['Total Insurance Renewals', r.totalInsuranceRenewals],
    ['Total Recurring Taxes & Other', r.totalOtherFees],
    [],
    ['--- TOTAL COST OF OWNERSHIP (TCO) ---'],
    ['Gross Real Cash Outlay', r.grossTco],
    ['Estimated Resale Value', r.resaleValue],
    ['Net TCO After Resale', r.netTco],
    ['Average Cost Per Year', r.costPerYear.toFixed(2)],
    ['Average Cost Per Kilometer', r.costPerKm.toFixed(2)],
    ['Total Driven Distance (km)', r.totalDistanceKm],
    [],
    ['--- METHODOLOGY & DISCLAIMER ---'],
    ['Accounting Method', `"${r.accountingMethod}"`],
    ['Disclaimer', `"${r.disclaimer}"`],
  ];

  return rows.map((row) => row.join(',')).join('\n');
}
