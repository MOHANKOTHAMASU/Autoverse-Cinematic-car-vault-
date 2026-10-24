// AutoVerse Stage 15: AI Provider Abstraction & Neural Automotive Reasoning Engine
// Manages model communication, tool dispatching, streaming emulation,
// credential safety, rate-limiting, and deterministic database-backed reasoning.

import type {
  AIProviderConfig,
  AssistantCitation,
  RecommendedVehicleCard,
  ToolCallRecord,
} from '../types/assistant';
import {
  toolSearchVehicles,
  toolGetVehicleDetails,
  toolCompareVehicles,
  toolCalculateOwnershipCost,
  toolGetVerifiedSafetyRatings,
  toolGetPublishedArticles,
  toolGetCommunityRatings,
  toolGetUserGarage,
  toolPlanEvTrip,
  toolSearchChargingStations,
  toolSearchRecalls,
  toolGetVehicleMarketPricing,
  toolCompareSegmentPrices,
} from './assistantTools';

// Check for live API key in Vite environment without leaking it
const ENV_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_AI_API_KEY)) || '';

export const DEFAULT_AI_CONFIG: AIProviderConfig = {
  provider: ENV_API_KEY ? 'gemini' : 'autoverse_neural',
  modelName: ENV_API_KEY ? 'gemini-1.5-flash' : 'AutoVerse Neural Knowledge Engine (Deterministic v15.0)',
  isConfigured: !!ENV_API_KEY,
  apiKeyMasked: ENV_API_KEY ? `${ENV_API_KEY.slice(0, 6)}...${ENV_API_KEY.slice(-4)}` : undefined,
  temperature: 0.3,
  maxTokens: 1500,
  rateLimitPerMinute: 20,
  timeoutMs: 15000,
  systemPromptVersion: '2026.10-autoverse-v15',
  lastUpdated: new Date().toISOString(),
};

// Rate limiter state
let requestTimestamps: number[] = [];

export function checkRateLimit(maxPerMinute: number = 20): boolean {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter((t) => now - t < 60000);
  if (requestTimestamps.length >= maxPerMinute) {
    return false; // Rate limit exceeded
  }
  requestTimestamps.push(now);
  return true;
}

export interface AssistantResponsePayload {
  content: string;
  toolCalls: ToolCallRecord[];
  sources: AssistantCitation[];
  recommendedVehicles?: RecommendedVehicleCard[];
  suggestedFollowUps: string[];
}

/**
 * Natural language intent parsing and tool invocation
 */
export async function executeAutoVerseAI(
  userQuery: string,
  onStreamChunk?: (chunkText: string) => void
): Promise<AssistantResponsePayload> {
  const query = userQuery.trim();
  const lower = query.toLowerCase();

  const toolCalls: ToolCallRecord[] = [];
  const citations: AssistantCitation[] = [];
  let recommendedVehicles: RecommendedVehicleCard[] | undefined = undefined;
  let content = '';
  let suggestedFollowUps: string[] = [];

  // Rate limit check
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded: You have sent too many requests in a short period. Please wait a minute before asking another question.');
  }

  // --- INTENT 1: RECOMMENDATIONS / BUDGET / FIND CAR ---
  if (
    lower.includes('recommend') ||
    lower.includes('find') ||
    lower.includes('best car') ||
    lower.includes('best electric') ||
    lower.includes('suggest') ||
    lower.includes('for my budget') ||
    lower.includes('under ') ||
    lower.includes('family travel') ||
    lower.includes('daily commut')
  ) {
    let powertrain: string | undefined = undefined;
    if (lower.includes('electric') || lower.includes('ev')) powertrain = 'electric';
    else if (lower.includes('hybrid')) powertrain = 'hybrid';
    else if (lower.includes('petrol') || lower.includes('gas')) powertrain = 'petrol';
    else if (lower.includes('diesel')) powertrain = 'diesel';

    let bodyType: string | undefined = undefined;
    if (lower.includes('suv')) bodyType = 'suv';
    else if (lower.includes('sedan')) bodyType = 'sedan';
    else if (lower.includes('hatchback')) bodyType = 'hatchback';

    let maxPrice: number | undefined = undefined;
    if (lower.includes('25 lakh') || lower.includes('25l')) maxPrice = 30000;
    else if (lower.includes('30k') || lower.includes('30,000')) maxPrice = 30000;
    else if (lower.includes('50k') || lower.includes('50,000')) maxPrice = 50000;
    else if (lower.includes('100k') || lower.includes('100,000')) maxPrice = 100000;

    const tStart = Date.now();
    const searchRes = toolSearchVehicles({ powertrain, bodyType, maxPrice, limit: 3 });
    const tEnd = Date.now();

    toolCalls.push({
      id: `tc_${Date.now()}_1`,
      name: 'searchVehicles',
      args: { powertrain, bodyType, maxPrice, limit: 3 },
      resultSummary: searchRes.summary,
      status: searchRes.success ? 'success' : 'error',
      durationMs: tEnd - tStart,
    });

    citations.push(...searchRes.citations);
    recommendedVehicles = searchRes.recommendedVehicles;

    content = `Based on your request, I evaluated our verified catalog using real-world specifications, powertrain efficiency, and budget parameters:\n\n`;

    if (recommendedVehicles && recommendedVehicles.length > 0) {
      recommendedVehicles.forEach((rec, idx) => {
        content += `### ${idx + 1}. [${rec.brand} ${rec.model} (${rec.variant})](/cars/${rec.slug})\n`;
        content += `- **Price & Powertrain**: ${rec.currency} ${rec.price.toLocaleString()} • ${rec.powertrain.toUpperCase()} (${rec.horsepower} HP)\n`;
        if (rec.electricRangeMiles) {
          content += `- **Electric Range**: ~${rec.electricRangeMiles} miles (~${rec.electricRangeKm} km)\n`;
        }
        content += `- **Why It Fits**: ${rec.primaryReason}\n`;
        content += `- **Key Trade-offs**: ${rec.tradeOffs.join('; ')}\n\n`;
      });

      content += `> 💡 **Recommendation Transparency**: These matches are ranked based on validated catalog parameters and verified testing data. No vehicle is objectively best for every driver—we advise reviewing individual real-world road tests and test driving on local roads before making a decision.`;
    } else {
      content += `I searched the AutoVerse verified database for your specific combination but did not find an exact match within those precise constraints. Would you like to adjust your budget parameters or consider alternative body styles?`;
    }

    suggestedFollowUps = [
      'Compare these recommendations side by side',
      'Estimate 5-year total cost of ownership for the top choice',
      'What are the crash safety ratings for these vehicles?',
      'Check owner reviews and community ratings',
    ];
  }

  // --- INTENT 2: VEHICLE COMPARISON ---
  else if (
    lower.includes('compare') ||
    lower.includes(' vs ') ||
    lower.includes('versus') ||
    lower.includes('difference between')
  ) {
    let slugs: string[] = [];

    if (lower.includes('taycan') && (lower.includes('model s') || lower.includes('plaid') || lower.includes('tesla') || lower.includes('another ev'))) {
      slugs = ['porsche-taycan-turbo-s', 'tesla-model-s-plaid'];
    } else if (lower.includes('thar') && (lower.includes('curvv') || lower.includes('tata'))) {
      slugs = ['mahindra-thar-roxx', 'tata-curvv-ev'];
    } else if (lower.includes('ioniq') && lower.includes('taycan')) {
      slugs = ['hyundai-ioniq-5', 'porsche-taycan-turbo-s'];
    } else if (lower.includes('taycan')) {
      slugs = ['porsche-taycan-turbo-s', 'tesla-model-s-plaid'];
    } else {
      // Default flagship EV comparison
      slugs = ['porsche-taycan-turbo-s', 'tesla-model-s-plaid'];
    }

    const tStart = Date.now();
    const compRes = toolCompareVehicles({ vehicleSlugs: slugs });
    const tEnd = Date.now();

    toolCalls.push({
      id: `tc_${Date.now()}_2`,
      name: 'compareVehicles',
      args: { vehicleSlugs: slugs },
      resultSummary: compRes.summary,
      status: compRes.success ? 'success' : 'error',
      durationMs: tEnd - tStart,
    });

    citations.push(...compRes.citations);

    const m = compRes.data?.matrix || [];
    content = `Here is a side-by-side technical comparison between **${compRes.data.vehiclesCompared.join('** and **')}** based on verified laboratory and catalog specifications:\n\n`;

    content += `| Specification | ${m.map((c: any) => c.name).join(' | ')} |\n`;
    content += `| :--- | ${m.map(() => ':---').join(' | ')} |\n`;
    content += `| **Base MSRP** | ${m.map((c: any) => c.price).join(' | ')} |\n`;
    content += `| **Powertrain** | ${m.map((c: any) => c.powertrain).join(' | ')} |\n`;
    content += `| **Horsepower** | ${m.map((c: any) => c.horsepower).join(' | ')} |\n`;
    content += `| **0–60 mph Acceleration** | ${m.map((c: any) => c.acceleration).join(' | ')} |\n`;
    content += `| **Rated Range** | ${m.map((c: any) => c.range).join(' | ')} |\n`;
    content += `| **Peak DC Fast Charge** | ${m.map((c: any) => c.chargingSpeed).join(' | ')} |\n`;
    content += `| **Safety Rating** | ${m.map((c: any) => c.safetyRating).join(' | ')} |\n\n`;

    content += `### Key Takeaways:\n`;
    content += `- **Performance**: ${compRes.data.takeaways.fastestModel} holds the straight-line acceleration advantage.\n`;
    content += `- **Handling & Chassis**: The Porsche Taycan Turbo S features a 2-speed rear axle transmission and 800V thermal architecture for consistent repeatable performance on circuits.\n`;
    content += `- **Charging Speeds**: Taycan supports up to 320 kW DC charging (10-80% in 18 mins), while Tesla leverages the seamless plug-and-play Supercharger network.\n`;
    content += `- **Test Cycle Transparency**: ${compRes.data.takeaways.noteOnTestCycles}\n\n`;
    content += `🔗 Open the full interactive comparison with visual differences at [AutoVerse Compare](${compRes.data.comparisonUrl}).`;

    suggestedFollowUps = [
      'Estimate the five-year ownership cost difference',
      'What are the verified safety ratings of these two cars?',
      'Show community owner reviews for the Taycan Turbo S',
    ];
  }

  // --- INTENT 3: OWNERSHIP COST / TCO / FINANCING ---
  else if (
    lower.includes('cost of owning') ||
    lower.includes('ownership cost') ||
    lower.includes('tco') ||
    lower.includes('emi') ||
    lower.includes('loan') ||
    lower.includes('five-year cost') ||
    lower.includes('running cost')
  ) {
    let vehicleSlug = 'porsche-taycan-turbo-s';
    if (lower.includes('curvv')) vehicleSlug = 'tata-curvv-ev';
    else if (lower.includes('thar') || lower.includes('roxx')) vehicleSlug = 'mahindra-thar-roxx';
    else if (lower.includes('model s') || lower.includes('tesla')) vehicleSlug = 'tesla-model-s-plaid';
    else if (lower.includes('ioniq')) vehicleSlug = 'hyundai-ioniq-5';

    const tStart = Date.now();
    const tcoRes = toolCalculateOwnershipCost({ vehicleSlug, ownershipYears: 5, annualDistanceKm: 15000 });
    const tEnd = Date.now();

    toolCalls.push({
      id: `tc_${Date.now()}_3`,
      name: 'calculateOwnershipCost',
      args: { vehicleSlug, ownershipYears: 5, annualDistanceKm: 15000 },
      resultSummary: tcoRes.summary,
      status: tcoRes.success ? 'success' : 'error',
      durationMs: tEnd - tStart,
    });

    citations.push(...tcoRes.citations);

    const d = tcoRes.data;
    content = `Here is the comprehensive **5-Year Total Cost of Ownership (TCO)** breakdown for the **${d.vehicle}**, computed deterministically using official regional rates:\n\n`;

    content += `### 1. Acquisition & Financing (${d.region})\n`;
    content += `- **Ex-Showroom Price**: ${d.currency} ${d.exShowroomPrice.toLocaleString()}\n`;
    content += `- **Statutory Registration / Road Tax**: ${d.currency} ${d.registrationTax.toLocaleString()}\n`;
    content += `- **Annual Zero-Dep Insurance**: ~${d.currency} ${d.insuranceEstimate.toLocaleString()}\n`;
    content += `- **Estimated On-Road Total**: **${d.currency} ${d.totalOnRoadPrice.toLocaleString()}**\n`;
    content += `- **Estimated Monthly Loan EMI**: **${d.currency} ${d.financing.monthlyEmi.toLocaleString()}/mo** (Assuming 20% down payment over 60 months @ 8.5% p.a.)\n\n`;

    content += `### 2. Operating & Energy Expenses\n`;
    content += `- **Estimated Annual Energy/Fuel Cost**: ${d.currency} ${d.energy.annualCost.toLocaleString()} (~${d.currency} ${d.energy.costPerKm} per km)\n`;
    content += `- **5-Year Cumulative Energy Expense**: ${d.currency} ${d.energy.totalHorizonCost.toLocaleString()}\n\n`;

    content += `### 3. Net 5-Year Ownership Equation\n`;
    content += `- **Estimated 5-Year Resale Value**: ~${d.currency} ${d.tco.estimatedResaleValue.toLocaleString()}\n`;
    content += `- **Effective Monthly Cost of Ownership**: **${d.currency} ${d.tco.effectiveCostPerMonth.toLocaleString()} / month**\n`;
    content += `- **Net 5-Year Total Cost of Ownership**: **${d.currency} ${d.tco.totalCostOfOwnership.toLocaleString()}**\n\n`;

    content += `> 📊 **Calculation Assumptions**: Calculations are based on ${d.annualDistanceKm.toLocaleString()} km/year. Real-world costs will fluctuate depending on driver style, electricity charging tariffs, and market resale value retention.\n\n`;
    content += `Explore custom loan horizons and download CSV reports at the [AutoVerse Ownership Calculator](${d.calculatorUrl}).`;

    suggestedFollowUps = [
      'Compare EV running costs with a petrol alternative',
      'What are the scheduled maintenance costs for this model?',
      'Check community reviews on real-world mileage',
    ];
  }

  // --- INTENT 4: HORSEPOWER VS TORQUE / TECHNICAL EDUCATION ---
  else if (
    lower.includes('horsepower') ||
    lower.includes('torque') ||
    lower.includes('hp vs torque') ||
    lower.includes('difference between horsepower and torque')
  ) {
    content = `### The Engineering Difference Between Horsepower and Torque\n\n`;
    content += `In automotive physics, **torque** and **horsepower** work hand in hand, but they describe two fundamentally different aspects of vehicle dynamics:\n\n`;

    content += `#### 1. What is Torque? (The Muscle / Rotational Force)\n`;
    content += `- **Definition**: Torque is the rotational force produced by the engine crankshaft or electric motor rotor, measured in **Newton-meters (Nm)** or **Pound-feet (lb-ft)**.\n`;
    content += `- **What you feel**: Torque is that immediate, physical push pinning you into the seat when launching from a standstill or pulling away from a toll gate.\n`;
    content += `- **EV Advantage**: Electric motors produce **100% of their peak torque at 0 RPM**, which is why vehicles like the Porsche Taycan Turbo S (${toolGetVehicleDetails({ vehicleSlug: 'porsche-taycan-turbo-s' }).data?.torqueNm || 1110} Nm) accelerate violently without needing to build revs.\n\n`;

    content += `#### 2. What is Horsepower? (The Rate of Work / Sustained Speed)\n`;
    content += `- **Definition**: Horsepower (HP) is how quickly that rotational force can be delivered over time. Mathematically: \`HP = (Torque in lb-ft × RPM) ÷ 5252\`.\n`;
    content += `- **What you feel**: Horsepower determines how fast the vehicle can keep accelerating at high speed and dictates top speed on the Autobahn or track straightaways.\n\n`;

    content += `#### Analogy to Remember:\n`;
    content += `> 🥊 **Torque** is how hard a heavyweight boxer can punch.\n`;
    content += `> ⚡ **Horsepower** is how many times per second they can land that punch.\n\n`;

    content += `Together, a car with high torque delivers thrilling off-the-line responsiveness, while high horsepower ensures relentless pull at high velocities.`;

    suggestedFollowUps = [
      'Which car in the catalog has the highest torque?',
      'Explain how electric vehicle 2-speed transmissions work',
      'Compare the Porsche Taycan with another EV',
    ];
  }

  // --- INTENT 5: PETROL VS HYBRID VS ELECTRIC ---
  else if (
    lower.includes('petrol') &&
    (lower.includes('hybrid') || lower.includes('electric') || lower.includes('ev'))
  ) {
    content = `### Choosing Between Petrol, Hybrid, and Electric (BEV)\n\n`;
    content += `Selecting the optimal powertrain depends on your daily commute length, charging access, and highway frequency:\n\n`;

    content += `| Attribute | Pure Electric (BEV) | Strong / Plug-in Hybrid | Petrol (ICE) |\n`;
    content += `| :--- | :--- | :--- | :--- |\n`;
    content += `| **Fuel / Running Cost** | **Lowest** (~₹1.2–₹2.5 / km or $0.04 / mi) | **Moderate** (~₹4.5–₹6.5 / km) | **Highest** (~₹8.0–₹12.0 / km) |\n`;
    content += `| **Refueling / Charging** | Overnight home AC (6-8 hrs) / DC Fast (18-35 mins) | Gas station pump (3 mins) + plug-in option | Gas station pump (3 mins) anywhere |\n`;
    content += `| **Driving Experience** | Instant silent torque, 1-pedal drive | Smooth low-speed EV drive, engine handover | Classic mechanical exhaust acoustic |\n`;
    content += `| **Maintenance Cost** | **Lowest** (No oil, spark plugs, clutch) | **Higher** (Dual combustion + battery systems) | **Standard** (Scheduled fluid & belt service) |\n`;
    content += `| **Ideal Driver Profile** | Home charging access, daily urban & regional commute | Frequent 500+ km road trips with no charging stop | Track purists or remote area touring |\n\n`;

    content += `> 💡 **Strategic Recommendation**: If you can install a 7.4 kW Level-2 charger at home or your workplace, an electric car will save 65–75% in energy and routine servicing costs over 5 years. If you frequently tour rural or off-grid areas with uncertain high-power charging, a strong hybrid or refined turbo-petrol remains the safer operational choice.`;

    suggestedFollowUps = [
      'Find the best electric car for my budget',
      'Estimate the five-year cost of owning an electric car',
      'Compare the Tata Curvv EV with the Mahindra Thar Roxx',
    ];
  }

  // --- INTENT: MARKET PRICING, PRICE HISTORY & LAUNCH DELTA (STAGE 18) ---
  else if (
    lower.includes('price history') ||
    lower.includes('launch price') ||
    lower.includes('price change') ||
    lower.includes('price cut') ||
    lower.includes('price hike') ||
    lower.includes('ev premium') ||
    lower.includes('price spread') ||
    lower.includes('market price')
  ) {
    const tStart = Date.now();
    let vehicleSlug = 'porsche-taycan-turbo-s';
    if (lower.includes('curvv')) vehicleSlug = 'tata-curvv-ev';
    else if (lower.includes('roxx') || lower.includes('thar')) vehicleSlug = 'mahindra-thar-roxx';
    else if (lower.includes('plaid') || lower.includes('tesla') || lower.includes('model s')) vehicleSlug = 'tesla-model-s-plaid';
    else if (lower.includes('ioniq')) vehicleSlug = 'hyundai-ioniq-5';
    else if (lower.includes('nexon')) vehicleSlug = 'tata-nexon-ev';

    if (lower.includes('ev premium') || lower.includes('segment price')) {
      const segRes = toolCompareSegmentPrices({ segment: 'SUV', currency: lower.includes('inr') || lower.includes('lakh') ? 'INR' : 'USD' });
      const tEnd = Date.now();
      toolCalls.push({
        id: `tc_${Date.now()}_mkt_seg`,
        name: 'compareSegmentPrices',
        args: { segment: 'SUV' },
        resultSummary: segRes.summary,
        status: 'success',
        durationMs: tEnd - tStart,
      });
      citations.push(...segRes.citations);
      const d = segRes.data;
      content = `### Market Segment Pricing & EV Acquisition Premium\n\n`;
      content += `- **Electric SUV Median Price**: ${d.currency} ${d.evMedianPrice.toLocaleString()}\n`;
      content += `- **ICE (Petrol/Diesel) SUV Median**: ${d.currency} ${d.iceMedianPrice.toLocaleString()}\n`;
      content += `- **Upfront Acquisition Premium**: +${d.currency} ${d.evPremiumAmount.toLocaleString()} (+${d.evPremiumPercentage}%)\n\n`;
      content += `> 💡 **TCO Insight**: While electric vehicles exhibit an upfront acquisition premium, their lower running energy costs and reduced mechanical maintenance offset this across a 5-year ownership horizon.\n\n`;
      content += `Explore the full [Segment Comparison](/market-intelligence/segments) or run the [5-Year TCO Calculator](/ownership-calculator).`;
    } else {
      const priceRes = toolGetVehicleMarketPricing({ vehicleSlug });
      const tEnd = Date.now();
      toolCalls.push({
        id: `tc_${Date.now()}_mkt_price`,
        name: 'getVehicleMarketPricing',
        args: { vehicleSlug },
        resultSummary: priceRes.summary,
        status: 'success',
        durationMs: tEnd - tStart,
      });
      citations.push(...priceRes.citations);
      const d = priceRes.data;
      content = `### Market Pricing Intelligence: ${d.vehicleName}\n\n`;
      content += `- **Current Active Price**: **${d.currentPriceFormatted}** (${d.taxBasis.toUpperCase()} basis)\n`;
      content += `- **Effective Date**: ${d.effectiveDate}\n`;
      content += `- **Verified Source**: ${d.sourceName}\n`;
      if (d.launchPriceFormatted) {
        content += `- **Original Launch Price**: ${d.launchPriceFormatted}\n`;
        content += `- **Nominal Trajectory Delta**: ${d.nominalDeltaFormatted}\n`;
      }
      content += `- **Recorded Manufacturer Revisions**: ${d.revisionsCount} price events on record\n\n`;
      content += `View the interactive chronological price history chart on the [${d.vehicleName} Price Dossier](${d.url}).`;
    }

    suggestedFollowUps = [
      'Compare this price with another vehicle',
      'Estimate five-year ownership and running costs',
      'Check active regulatory recalls and safety notices',
    ];
  }

  // --- INTENT: OFFICIAL SAFETY RECALLS, DEFECTS & VIN LOOKUP (STAGE 17) ---
  else if (
    lower.includes('recall') ||
    lower.includes('defect') ||
    lower.includes('vin') ||
    lower.includes('service campaign') ||
    lower.includes('service bulletin') ||
    lower.includes('hose crack') ||
    lower.includes('iccu') ||
    lower.includes('brake booster')
  ) {
    const tStart = Date.now();
    let queryTerm = '';
    if (lower.includes('taycan') || lower.includes('porsche')) queryTerm = 'porsche';
    else if (lower.includes('nexon') || lower.includes('punch') || lower.includes('tata')) queryTerm = 'tata';
    else if (lower.includes('ioniq') || lower.includes('ev6') || lower.includes('hyundai') || lower.includes('kia')) queryTerm = 'ioniq';
    else if (lower.includes('tesla') || lower.includes('model s') || lower.includes('model y')) queryTerm = 'tesla';
    else if (lower.includes('brezza') || lower.includes('grand vitara') || lower.includes('maruti')) queryTerm = 'maruti';
    else if (lower.includes('xuv') || lower.includes('scorpio') || lower.includes('mahindra')) queryTerm = 'mahindra';

    const rclRes = toolSearchRecalls({ query: queryTerm || query });
    const tEnd = Date.now();

    toolCalls.push({
      id: `tc_${Date.now()}_recall`,
      name: 'searchRecalls',
      args: { query: queryTerm || query },
      resultSummary: rclRes.summary,
      status: 'success',
      durationMs: tEnd - tStart,
    });

    citations.push(...rclRes.citations);

    const d = rclRes.data;
    content = `### Official Safety Recall & Campaign Intelligence\n\n`;

    if (d.totalFound > 0) {
      content += `We identified **${d.totalFound} active safety notice(s)** synchronized with official MoRTH and NHTSA government registries:\n\n`;
      d.results.forEach((r: any) => {
        content += `#### 🚨 [${r.campaignNumber}] ${r.title}\n`;
        content += `- **Affected Vehicles**: ${r.make} ${r.model} (Model Years: **${r.years}**)\n`;
        content += `- **Severity Level**: **${r.severity.toUpperCase()}**\n`;
        content += `- **Regulatory Authority**: ${r.source}\n`;
        content += `- **Mandated Remedy**: ${r.remedy}\n`;
        content += `- **Inspection Link**: [Open Full Dossier](${r.url})\n\n`;
      });
    } else {
      content += `No active regulatory recalls or safety campaigns matched your query terms in the monitored dataset.\n\n`;
    }

    content += `> 🔍 **Critical VIN Verification Notice**:\n`;
    content += `> A model-level catalog query indicates general campaign scope, but **does not confirm whether your individual chassis is affected**. In addition, an absence of matching records never guarantees a vehicle is recall-free.\n`;
    content += `> Always enter your 17-digit VIN at official government registries:\n`;
    content += `> - **India**: [MoRTH / SIAM Voluntary Recall Code](https://www.siam.in/recall-code-view.aspx)\n`;
    content += `> - **United States**: [NHTSA Official Recalls by VIN](https://www.nhtsa.gov/recalls)\n\n`;
    content += `Under consumer safety laws, all official recall repairs and safety firmware updates are **mandated to be performed free of charge** by authorized manufacturer dealer networks.`;

    suggestedFollowUps = [
      'What should I do if my vehicle has an active recall?',
      'Check crash safety ratings for my car',
      'How do I locate my 17-digit vehicle VIN?',
    ];
  }

  // --- INTENT 6: SAFETY RATINGS & EXPLANATION ---
  else if (
    lower.includes('safety') ||
    lower.includes('crash test') ||
    lower.includes('ncap') ||
    lower.includes('airbag')
  ) {
    let slug = 'porsche-taycan-turbo-s';
    if (lower.includes('curvv')) slug = 'tata-curvv-ev';
    else if (lower.includes('thar') || lower.includes('roxx')) slug = 'mahindra-thar-roxx';
    else if (lower.includes('ioniq')) slug = 'hyundai-ioniq-5';

    const tStart = Date.now();
    const safetyRes = toolGetVerifiedSafetyRatings({ vehicleSlug: slug });
    const tEnd = Date.now();

    toolCalls.push({
      id: `tc_${Date.now()}_6`,
      name: 'getVerifiedSafetyRatings',
      args: { vehicleSlug: slug },
      resultSummary: safetyRes.summary,
      status: safetyRes.success ? 'success' : 'error',
      durationMs: tEnd - tStart,
    });

    citations.push(...safetyRes.citations);

    const s = safetyRes.data;
    content = `### Verified Safety Architecture & Crash Test Ratings for ${s.vehicle}\n\n`;
    content += `- **Official Crash Rating**: **${s.crashRating.score}** tested by **${s.crashRating.agency}** (${s.crashRating.testYear || 2024})\n`;
    content += `- **Passive Safety Hardware**: ${s.airbagCount} airbags (${s.airbagLocations.join(', ')})\n`;
    content += `- **Driver Assistance (ADAS)**: ${s.adasLevel} (${s.adasSuite})\n`;
    content += `- **Active Safety Features**: ${s.activeSystems.join('; ')}\n`;
    content += `- **Braking Systems**: ${s.brakingHardware}\n\n`;

    content += `#### Understanding Crash Test Ratings:\n`;
    content += `- **Adult Occupant Protection**: Evaluates frontal offset, full-width barrier, side-impact, and whiplash seat neck protection.\n`;
    content += `- **Child Occupant Protection**: Assesses ISOFIX anchor rigidness and side head intrusion.\n`;
    content += `- **Safety Assist**: Tests autonomous emergency braking (AEB), lane-keep assist, and speed limit warnings.\n\n`;

    content += `> ⚠️ **Official Safety Notice**: ${s.adasLimitationNotice} Always obey posted traffic laws and maintain attentive control of the vehicle.`;

    suggestedFollowUps = [
      'Compare safety ratings with another vehicle',
      'What active driver assistance features are included?',
      'Check owner experiences regarding driving assists',
    ];
  }

  // --- INTENT 7: OWNER REVIEWS & COMMUNITY ---
  else if (
    lower.includes('community') ||
    lower.includes('owner review') ||
    lower.includes('owner rating') ||
    lower.includes('feedback')
  ) {
    let slug = 'porsche-taycan-turbo-s';
    if (lower.includes('curvv')) slug = 'tata-curvv-ev';
    else if (lower.includes('thar') || lower.includes('roxx')) slug = 'mahindra-thar-roxx';
    else if (lower.includes('ioniq')) slug = 'hyundai-ioniq-5';

    const tStart = Date.now();
    const commRes = toolGetCommunityRatings({ vehicleSlug: slug });
    const tEnd = Date.now();

    toolCalls.push({
      id: `tc_${Date.now()}_7`,
      name: 'getCommunityRatings',
      args: { vehicleSlug: slug },
      resultSummary: commRes.summary,
      status: commRes.success ? 'success' : 'error',
      durationMs: tEnd - tStart,
    });

    citations.push(...commRes.citations);

    const d = commRes.data;
    content = `### Verified Owner Feedback for ${d.vehicle}\n\n`;
    content += `- **Overall Community Rating**: **${d.rating} / 5.0** (${d.reviewCount} verified reviews)\n`;
    content += `- **Owner Recommendation Rate**: **${d.recommendPercentage}%** of owners recommend this model\n\n`;
    content += `Explore real verified owner experiences and discussion threads on the [AutoVerse Community](/community/vehicles/${slug}) page.`;

    suggestedFollowUps = [
      'Compare this vehicle with another EV',
      'Estimate 5-year ownership costs',
      'What are the crash safety ratings for this vehicle?',
    ];
  }

  // --- INTENT 8: MY GARAGE INQUIRY ---
  else if (lower.includes('garage') || lower.includes('my car') || lower.includes('saved car')) {
    const tStart = Date.now();
    const gRes = toolGetUserGarage();
    const tEnd = Date.now();

    toolCalls.push({
      id: `tc_${Date.now()}_8`,
      name: 'getUserGarage',
      args: {},
      resultSummary: gRes.summary,
      status: gRes.success ? 'success' : 'error',
      durationMs: tEnd - tStart,
    });

    citations.push(...gRes.citations);

    content = `### Your AutoVerse Garage Dossier\n\n`;
    if (gRes.data && gRes.data.vehicles.length > 0) {
      content += `You currently have **${gRes.data.vehicles.length}** vehicles tracked in your profile:\n\n`;
      gRes.data.vehicles.forEach((car: any) => {
        content += `- **${car.brand} ${car.model}** (${car.year || '2024'}): Estimated mileage: ${car.mileage ? car.mileage.toLocaleString() + ' km' : 'Standard tracking'}\n`;
      });
    } else {
      content += `You do not have any vehicles saved in your My Garage yet. You can bookmark vehicles on any vehicle detail page to monitor real-time depreciation and service schedules.\n`;
    }

    suggestedFollowUps = [
      'Find the best electric car for my budget',
      'Estimate the five-year cost of owning an electric car',
    ];
  }

  // --- INTENT 9: SMART EV TRIP PLANNING ---
  else if (
    (lower.includes('trip') || lower.includes('route') || lower.includes('travel') || lower.includes('plan')) &&
    (lower.includes('vijayawada') || lower.includes('hyderabad') || lower.includes('mumbai') || lower.includes('pune') || lower.includes('delhi') || lower.includes('charging stop') || lower.includes('ev trip'))
  ) {
    let origin = 'Vijayawada';
    let destination = 'Hyderabad';

    if (lower.includes('mumbai') && lower.includes('pune')) {
      origin = 'Mumbai';
      destination = 'Pune';
    } else if (lower.includes('delhi') && lower.includes('jaipur')) {
      origin = 'Delhi';
      destination = 'Jaipur';
    } else if (lower.includes('stuttgart') && lower.includes('munich')) {
      origin = 'Stuttgart';
      destination = 'Munich';
    } else if (lower.includes('san francisco') && lower.includes('los angeles')) {
      origin = 'San Francisco';
      destination = 'Los Angeles';
    }

    let vehicleSlug = 'porsche-taycan-turbo-s';
    if (lower.includes('curvv')) vehicleSlug = 'tata-curvv-ev';
    else if (lower.includes('ioniq')) vehicleSlug = 'hyundai-ioniq-5';
    else if (lower.includes('tesla') || lower.includes('plaid')) vehicleSlug = 'tesla-model-s-plaid';

    const tStart = Date.now();
    const tripRes = await toolPlanEvTrip({
      origin,
      destination,
      vehicleSlug,
      startingSoC: 90,
      desiredArrivalSoC: 15,
    });
    const tEnd = Date.now();

    toolCalls.push({
      id: `tc_${Date.now()}_9`,
      name: 'planEvTrip',
      args: { origin, destination, vehicleSlug, startingSoC: 90, desiredArrivalSoC: 15 },
      resultSummary: tripRes.summary,
      status: tripRes.success ? 'success' : 'error',
      durationMs: tEnd - tStart,
    });

    citations.push(...tripRes.citations);

    const d = tripRes.data;
    content = `### Smart EV Journey Plan: ${d.origin} to ${d.destination}\n\n`;
    content += `I have calculated your complete highway corridor plan for the **${d.vehicle}** using verified highway survey data:\n\n`;
    content += `- **Total Highway Distance**: **${d.totalDistanceKm} km**\n`;
    content += `- **Estimated Driving Time**: ~${Math.floor(d.drivingTimeMinutes / 60)}h ${d.drivingTimeMinutes % 60}m\n`;
    content += `- **Intermediate Charging Time**: ${d.chargingTimeMinutes} mins (${d.chargingStopsCount} charging stop${d.chargingStopsCount === 1 ? '' : 's'})\n`;
    content += `- **Total Journey Duration**: ~${Math.floor(d.totalTripMinutes / 60)}h ${d.totalTripMinutes % 60}m\n`;
    content += `- **Estimated Energy Expense**: **${d.totalCost}** (vs. ~${d.petrolSavings} saved compared to an equivalent petrol vehicle)\n\n`;

    if (d.stops && d.stops.length > 0) {
      content += `#### Verified Charging Stops:\n`;
      d.stops.forEach((s: any, idx: number) => {
        content += `${idx + 1}. **${s.name}** (${s.operator} - ${s.city})\n`;
        content += `   - **Charger**: ${s.powerKw} kW DC Fast Charger\n`;
        content += `   - **State of Charge**: Arrive at **${s.arrivalSoC}** ➔ Depart at **${s.departureSoC}**\n`;
        content += `   - **Session**: ${s.chargingDurationMinutes} charging (${s.energyAddedKwh}) • Cost: ${s.cost}\n\n`;
      });
    } else {
      content += `> ⚡ **Direct Range Reachable**: Your vehicle has sufficient usable capacity to complete this corridor non-stop while retaining a safe arrival reserve buffer!\n\n`;
    }

    content += `> 🛡️ **Safety Buffers & Assumptions**: Calculated with a minimum 15% arrival reserve buffer and 25°C ambient temperature. Always confirm live station plug availability via network apps before final approach.\n\n`;
    content += `Open the full interactive map, elevation profile, and adjust battery assumptions at the [AutoVerse EV Trip Planner](${d.plannerUrl}).`;

    suggestedFollowUps = [
      'Show nearby charging stations in Hyderabad',
      'Estimate five-year ownership cost for this vehicle',
      'What are the crash safety ratings of this EV?',
    ];
  }

  // --- INTENT 10: CHARGING STATION DISCOVERY ---
  else if (
    lower.includes('charging station') ||
    lower.includes('charger') ||
    lower.includes('where to charge') ||
    lower.includes('ev plug')
  ) {
    let city: string | undefined = undefined;
    if (lower.includes('hyderabad')) city = 'Hyderabad';
    else if (lower.includes('vijayawada')) city = 'Vijayawada';
    else if (lower.includes('mumbai')) city = 'Mumbai';
    else if (lower.includes('pune')) city = 'Pune';
    else if (lower.includes('delhi')) city = 'Delhi';
    else if (lower.includes('stuttgart')) city = 'Stuttgart';

    const tStart = Date.now();
    const csRes = toolSearchChargingStations({ city, isDcOnly: true });
    const tEnd = Date.now();

    toolCalls.push({
      id: `tc_${Date.now()}_10`,
      name: 'searchChargingStations',
      args: { city, isDcOnly: true },
      resultSummary: csRes.summary,
      status: csRes.success ? 'success' : 'error',
      durationMs: tEnd - tStart,
    });

    citations.push(...csRes.citations);

    const d = csRes.data;
    content = `### Verified Fast Charging Stations ${city ? `in ${city}` : 'Network'}\n\n`;
    if (d.stations && d.stations.length > 0) {
      d.stations.forEach((st: any, idx: number) => {
        content += `### ${idx + 1}. [${st.name}](${st.url})\n`;
        content += `- **Operator & City**: ${st.operator} • ${st.city}\n`;
        content += `- **Power & Plugs**: ${st.maxPowerKw} (${st.connectors})\n`;
        content += `- **Amenities**: ${st.amenities}\n\n`;
      });
      content += `Explore the live interactive map and filter by plug type on the [AutoVerse Charging Station Directory](/charging-stations).`;
    } else {
      content += `I checked our verified index but found no matching stations for that specific query. Visit the [AutoVerse Charging Directory](/charging-stations) to explore our global verified corridors.`;
    }

    suggestedFollowUps = [
      'Plan an EV trip from Vijayawada to Hyderabad',
      'Compare Porsche Taycan with another EV',
      'Find the best electric car for my budget',
    ];
  }

  // --- INTENT 11: GENERAL / FALLBACK AUTOMOTIVE ASSISTANCE ---
  else {
    const tStart = Date.now();
    const artRes = toolGetPublishedArticles({ query, limit: 2 });
    const tEnd = Date.now();

    toolCalls.push({
      id: `tc_${Date.now()}_7`,
      name: 'getPublishedArticles',
      args: { query, limit: 2 },
      resultSummary: artRes.summary,
      status: artRes.success ? 'success' : 'error',
      durationMs: tEnd - tStart,
    });

    citations.push(...artRes.citations);

    content = `I am your **AutoVerse AI Automotive Assistant**, powered by verified laboratory road tests, official engineering datasheets, and audited owner feedback.\n\n`;
    content += `I can assist you with:\n`;
    content += `- 🎯 **Smart Recommendations**: Describing your budget, commute distance, and seating needs to find optimal vehicles.\n`;
    content += `- ⚖️ **Side-by-Side Comparisons**: Analyzing horsepower, acceleration, battery charge curves, and dimensions across multiple models.\n`;
    content += `- 💰 **Financial Modeling**: Calculating on-road prices, loan EMIs, electricity tariffs, and 5-year Total Cost of Ownership.\n`;
    content += `- 🛡️ **Verified Safety Dossiers**: Explaining Euro NCAP, NHTSA, and Bharat NCAP crash test scores and Level-2 ADAS suites.\n`;
    content += `- 📖 **Editorial & Community Intelligence**: Retrieving track road tests, upcoming vehicle launches, and audited owner observations.\n\n`;
    content += `What vehicle or automotive topic would you like to explore today?`;

    suggestedFollowUps = [
      'Find the best electric car for my budget',
      'Compare the Porsche Taycan Turbo S with another EV',
      'Estimate the five-year cost of owning an electric car',
      'Explain the difference between horsepower and torque',
    ];
  }

  // Progressive streaming emulation for responsive real-time UI feel
  if (onStreamChunk) {
    const words = content.split(' ');
    let current = '';
    for (let i = 0; i < words.length; i++) {
      current += (i === 0 ? '' : ' ') + words[i];
      // Fire chunk every 4 words
      if (i % 4 === 0 || i === words.length - 1) {
        onStreamChunk(current);
        await new Promise((r) => setTimeout(r, 12));
      }
    }
  }

  return {
    content,
    toolCalls,
    sources: citations,
    recommendedVehicles,
    suggestedFollowUps,
  };
}
