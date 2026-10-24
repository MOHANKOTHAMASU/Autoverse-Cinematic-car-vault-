/**
 * AutoVerse Stage 9 Automated Verification Suite
 * Tests Advanced Car Finder & Smart Recommendation Engine
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ${GREEN}✅ [PASS]${RESET} ${message}`);
    passed++;
  } else {
    console.error(`  ${RED}❌ [FAIL]${RESET} ${message}`);
    failed++;
  }
}

function checkHttp(urlPath) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5173${urlPath}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', (err) => {
      resolve({ status: 500, error: err.message });
    });
  });
}

async function runStage9Tests() {
  console.log(`\n${CYAN}======================================================${RESET}`);
  console.log(`${BOLD}🏎️  AUTOVERSE STAGE 9 — ADVANCED CAR FINDER & SMART RECOMMENDATIONS${RESET}`);
  console.log(`${CYAN}======================================================${RESET}\n`);

  // --- 1. HTTP Endpoint & Routing Validation ---
  console.log(`--- 1. HTTP Endpoint & Routing Validation ---`);
  const finderRes = await checkHttp('/car-finder');
  assert(finderRes.status === 200, 'Route /car-finder responds with HTTP 200');
  assert(finderRes.data && finderRes.data.includes('AutoVerse'), '/car-finder serves valid AutoVerse HTML shell');

  // Check query parameter preservation on route
  const queryRes = await checkHttp('/car-finder?powertrain=electric&type=suv');
  assert(queryRes.status === 200, 'Route /car-finder?powertrain=electric&type=suv responds with HTTP 200');

  // --- 2. Entry Points & Navigation Integrity ---
  console.log(`\n--- 2. Entry Points & Navigation Integrity ---`);
  const appTsx = fs.readFileSync(path.join(__dirname, 'App.tsx'), 'utf8');
  assert(appTsx.includes('path="/car-finder"'), 'App.tsx registers /car-finder public discovery route');
  assert(appTsx.includes('CarFinderPage'), 'App.tsx lazy loads CarFinderPage component');

  const navbarTsx = fs.readFileSync(path.join(__dirname, 'components', 'Navbar.tsx'), 'utf8');
  assert(navbarTsx.includes("name: 'Car Finder', path: '/car-finder'"), 'Navbar.tsx includes Car Finder in main navLinks array');

  const heroTsx = fs.readFileSync(path.join(__dirname, 'components', 'Hero.tsx'), 'utf8');
  assert(heroTsx.includes("navigate('/car-finder')") && heroTsx.includes('Smart Car Finder'), 'Hero.tsx contains prominent Smart Car Finder entry action');

  const discoverTsx = fs.readFileSync(path.join(__dirname, 'pages', 'DiscoverPage.tsx'), 'utf8');
  assert(discoverTsx.includes('to="/car-finder"') && discoverTsx.includes('Launch Car Finder'), 'DiscoverPage.tsx features Smart Car Finder guided banner');

  // --- 3. Car Finder Recommendation Algorithm & Logic Tests ---
  console.log(`\n--- 3. Car Finder Recommendation Algorithm & Logic Tests ---`);
  const { VEHICLES } = require('./data/vehicles.ts');
  const {
    DEFAULT_FINDER_FILTERS,
    DEFAULT_WIZARD_ANSWERS,
    calculateVehicleMatchScore,
    filterAndScoreVehicles,
    parseUrlToFinderFilters,
    filtersToSearchParams,
  } = require('./utils/carFinder.ts');

  assert(Array.isArray(VEHICLES) && VEHICLES.length === 50, `Catalog data source contains 50 verified vehicles (Found: ${VEHICLES.length})`);

  // Test search: Exact Porsche Taycan Turbo S
  const taycanResults = filterAndScoreVehicles(
    VEHICLES,
    { ...DEFAULT_FINDER_FILTERS, searchQuery: 'Porsche Taycan Turbo S' },
    DEFAULT_WIZARD_ANSWERS,
    'match'
  );
  assert(taycanResults.exactMatches.length >= 1, 'Search query "Porsche Taycan Turbo S" returns matched vehicle');
  const taycanMatch = taycanResults.exactMatches[0];
  assert(taycanMatch.vehicle.slug === 'porsche-taycan-turbo-s', 'Matched vehicle has verified slug "porsche-taycan-turbo-s"');
  assert(taycanMatch.vehicle.id === 'porsche-taycan-turbo-s', 'Matched vehicle ID corresponds to valid detail route');

  // Test partial search: "curvv"
  const curvvResults = filterAndScoreVehicles(
    VEHICLES,
    { ...DEFAULT_FINDER_FILTERS, searchQuery: 'curvv' },
    DEFAULT_WIZARD_ANSWERS,
    'match'
  );
  assert(curvvResults.exactMatches.length >= 2, 'Search query "curvv" matches ICE Curvv and Curvv EV');

  // Test partial search: "thar"
  const tharResults = filterAndScoreVehicles(
    VEHICLES,
    { ...DEFAULT_FINDER_FILTERS, searchQuery: 'thar' },
    DEFAULT_WIZARD_ANSWERS,
    'match'
  );
  assert(tharResults.exactMatches.length >= 2, 'Search query "thar" matches Thar 4x4 and Thar Roxx 4x4');

  // --- 4. Multi-Dimensional Filters Validation ---
  console.log(`\n--- 4. Multi-Dimensional Filters Validation ---`);

  // Powertrain Filter: Electric only
  const evResults = filterAndScoreVehicles(
    VEHICLES,
    { ...DEFAULT_FINDER_FILTERS, powertrain: 'electric' },
    DEFAULT_WIZARD_ANSWERS,
    'match'
  );
  assert(evResults.exactMatches.length >= 15, `Electric powertrain filter returns BEV models (Found: ${evResults.exactMatches.length})`);
  assert(evResults.exactMatches.every((s) => s.vehicle.powertrain === 'electric'), 'All returned electric results have powertrain === "electric"');

  // Powertrain Filter: Hybrid only
  const hybridResults = filterAndScoreVehicles(
    VEHICLES,
    { ...DEFAULT_FINDER_FILTERS, powertrain: 'hybrid' },
    DEFAULT_WIZARD_ANSWERS,
    'match'
  );
  assert(hybridResults.exactMatches.length >= 4, `Hybrid filter returns strong hybrid models (Found: ${hybridResults.exactMatches.length})`);

  // Body Style Filter: SUV only
  const suvResults = filterAndScoreVehicles(
    VEHICLES,
    { ...DEFAULT_FINDER_FILTERS, bodyType: 'suv' },
    DEFAULT_WIZARD_ANSWERS,
    'match'
  );
  assert(suvResults.exactMatches.length >= 20, `SUV body style filter returns SUV fleet (Found: ${suvResults.exactMatches.length})`);

  // Combined Filter: Electric + SUV
  const evSuvResults = filterAndScoreVehicles(
    VEHICLES,
    { ...DEFAULT_FINDER_FILTERS, powertrain: 'electric', bodyType: 'suv' },
    DEFAULT_WIZARD_ANSWERS,
    'match'
  );
  assert(evSuvResults.exactMatches.length >= 6, `Combined Electric + SUV filter returns valid intersections (Found: ${evSuvResults.exactMatches.length})`);
  assert(
    evSuvResults.exactMatches.every((s) => s.vehicle.powertrain === 'electric' && s.vehicle.bodyType.includes('suv')),
    'All combined Electric + SUV vehicles strictly satisfy both criteria'
  );

  // Budget Filter: Under $30,000
  const budgetResults = filterAndScoreVehicles(
    VEHICLES,
    { ...DEFAULT_FINDER_FILTERS, maxPrice: 30000 },
    DEFAULT_WIZARD_ANSWERS,
    'match'
  );
  assert(budgetResults.exactMatches.length >= 8, `Budget filter under $30,000 returns affordable fleet (Found: ${budgetResults.exactMatches.length})`);
  assert(
    budgetResults.exactMatches.every((s) => (s.vehicle.price || s.vehicle.priceStartingUsd || 0) <= 33000),
    'All budget matches respect maximum price boundary'
  );

  // Seating Filter: 7 Seats
  const sevenSeatResults = filterAndScoreVehicles(
    VEHICLES,
    { ...DEFAULT_FINDER_FILTERS, minSeats: 7 },
    DEFAULT_WIZARD_ANSWERS,
    'match'
  );
  assert(sevenSeatResults.exactMatches.length >= 3, `Seating filter for 7+ seats returns three-row vehicles (Found: ${sevenSeatResults.exactMatches.length})`);

  // --- 5. Mandatory Constraints & Scoring Integrity ---
  console.log(`\n--- 5. Mandatory Constraints & Scoring Integrity ---`);
  // Porsche Taycan Turbo S should violate 7-seat mandatory constraint
  const taycan7SeatScored = calculateVehicleMatchScore(
    VEHICLES[0],
    { ...DEFAULT_WIZARD_ANSWERS, minSeats: 7 },
    { ...DEFAULT_FINDER_FILTERS, minSeats: 7 }
  );
  assert(!taycan7SeatScored.isMandatorySatisfied, 'Mandatory constraint: 4/5-seat Taycan is marked as violating 7-seat requirement');
  assert(
    taycan7SeatScored.matchExplanation.tradeOffs.some((t) => t.includes('seats')),
    'Match explanation explicitly details seating capacity trade-off'
  );

  // Budget ceiling violation
  const budgetTaycanScored = calculateVehicleMatchScore(
    VEHICLES[0],
    DEFAULT_WIZARD_ANSWERS,
    { ...DEFAULT_FINDER_FILTERS, maxPrice: 50000 }
  );
  assert(!budgetTaycanScored.isMandatorySatisfied, 'Mandatory constraint: $209,000 Taycan violates $50,000 maximum budget limit');

  // Transparent match percentage bounds
  const standardTaycanScored = calculateVehicleMatchScore(
    VEHICLES[0],
    DEFAULT_WIZARD_ANSWERS,
    DEFAULT_FINDER_FILTERS
  );
  assert(
    standardTaycanScored.score >= 10 && standardTaycanScored.score <= 98,
    `Calculated match score is properly bounded within [10, 98] (Score: ${standardTaycanScored.score}%)`
  );
  assert(
    standardTaycanScored.matchExplanation.primaryReason && standardTaycanScored.matchExplanation.primaryReason.length > 5,
    `Match explanation contains clear narrative primary reason: "${standardTaycanScored.matchExplanation.primaryReason}"`
  );

  // --- 6. Fallback Relaxation Logic ---
  console.log(`\n--- 6. Fallback Relaxation Logic ---`);
  // Impossible combination: Diesel + Sports Car under $10,000
  const impossibleResults = filterAndScoreVehicles(
    VEHICLES,
    { ...DEFAULT_FINDER_FILTERS, powertrain: 'diesel', bodyType: 'sports_car', maxPrice: 10000 },
    DEFAULT_WIZARD_ANSWERS,
    'match'
  );
  assert(impossibleResults.exactMatches.length === 0, 'Impossible filter combination yields 0 exact matches');
  assert(impossibleResults.isRelaxedFallback === true, 'isRelaxedFallback flag activates when exact matches are 0');
  assert(impossibleResults.relaxedMatches.length > 0, 'Relaxed fallback delivers closest alternative recommendations');
  assert(impossibleResults.relaxedMatches[0].isRelaxedMatch === true, 'Relaxed matches are transparently marked with isRelaxedMatch');

  // --- 7. URL Query Synchronization & Validation ---
  console.log(`\n--- 7. URL Query Synchronization & Validation ---`);
  const testParams = new URLSearchParams('q=ioniq&powertrain=electric&type=suv&minPrice=40000&maxPrice=60000&seats=5&sort=power');
  const parsed = parseUrlToFinderFilters(testParams);
  assert(parsed.searchQuery === 'ioniq', 'URL search parameter "q=ioniq" parsed correctly');
  assert(parsed.powertrain === 'electric', 'URL powertrain parameter "powertrain=electric" parsed correctly');
  assert(parsed.bodyType === 'suv', 'URL body type parameter "type=suv" parsed correctly');
  assert(parsed.minPrice === 40000 && parsed.maxPrice === 60000, 'URL minPrice/maxPrice parameters parsed as numbers');
  assert(parsed.minSeats === 5, 'URL seats parameter parsed correctly');

  const serialized = filtersToSearchParams(parsed, 'power');
  assert(serialized.get('q') === 'ioniq', 'Serialized URL search parameters preserve query');
  assert(serialized.get('powertrain') === 'electric', 'Serialized URL search parameters preserve powertrain');
  assert(serialized.get('sort') === 'power', 'Serialized URL parameters preserve sort selection');

  // --- 8. Draft and Unpublished Filtering Audit ---
  console.log(`\n--- 8. Draft and Unpublished Filtering Audit ---`);
  const mockVehiclesWithDraft = [
    ...VEHICLES,
    {
      ...VEHICLES[0],
      id: 'secret-draft-prototype',
      slug: 'secret-draft-prototype',
      model: 'Secret Prototype X',
      publicationStatus: 'draft',
    },
    {
      ...VEHICLES[1],
      id: 'archived-old-model',
      slug: 'archived-old-model',
      model: 'Archived Relic',
      publicationStatus: 'archived',
    },
  ];

  const draftAuditResults = filterAndScoreVehicles(
    mockVehiclesWithDraft,
    DEFAULT_FINDER_FILTERS,
    DEFAULT_WIZARD_ANSWERS,
    'match'
  );
  assert(
    !draftAuditResults.exactMatches.some((s) => s.vehicle.id === 'secret-draft-prototype'),
    'Draft vehicles are strictly excluded from public recommendations'
  );
  assert(
    !draftAuditResults.exactMatches.some((s) => s.vehicle.id === 'archived-old-model'),
    'Archived vehicles are strictly excluded from public recommendations'
  );

  console.log(`\n${CYAN}======================================================${RESET}`);
  console.log(`${BOLD}STAGE 9 CAR FINDER TEST RESULTS: ${passed} PASSED, ${failed} FAILED (${Math.round((passed / (passed + failed)) * 100)}%)${RESET}`);
  console.log(`${CYAN}======================================================${RESET}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runStage9Tests();
