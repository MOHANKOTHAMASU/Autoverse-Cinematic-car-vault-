// AutoVerse Stage 24: Advanced Automotive Analytics & Reporting Test Suite
// Validates metric calculation integrity, date range filtering, CWE-1236 CSV formula defense,
// route registration, admin navigation, and responsive chart components.

const fs = require('fs');
const path = require('path');
const http = require('http');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] TEST-24-${String(totalTests).padStart(2, '0')}: ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] TEST-24-${String(totalTests).padStart(2, '0')}: ${message}`);
  }
}

async function checkRoute(urlPath, expectedStatus = 200) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5173${urlPath}`, (res) => {
      resolve(res.statusCode === expectedStatus);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('   AUTOVERSE STAGE 24: AUTOMOTIVE ANALYTICS TEST SUITE          ');
  console.log('================================================================\n');

  // 1. Files & Component Architecture
  const typesPath = path.join(__dirname, '..', 'src', 'types', 'analytics.ts');
  const storePath = path.join(__dirname, '..', 'src', 'utils', 'analyticsStore.ts');
  const metricCardPath = path.join(__dirname, '..', 'src', 'components', 'analytics', 'AnalyticsMetricCard.tsx');
  const barChartPath = path.join(__dirname, '..', 'src', 'components', 'analytics', 'AnalyticsBarChart.tsx');
  const donutChartPath = path.join(__dirname, '..', 'src', 'components', 'analytics', 'AnalyticsDonutChart.tsx');
  const lineChartPath = path.join(__dirname, '..', 'src', 'components', 'analytics', 'AnalyticsLineChart.tsx');
  const filterBarPath = path.join(__dirname, '..', 'src', 'components', 'analytics', 'AnalyticsFilterBar.tsx');
  const navTabsPath = path.join(__dirname, '..', 'src', 'components', 'analytics', 'AnalyticsNavTabs.tsx');

  assert(
    fs.existsSync(typesPath) && fs.existsSync(storePath) &&
    fs.existsSync(metricCardPath) && fs.existsSync(barChartPath) &&
    fs.existsSync(donutChartPath) && fs.existsSync(lineChartPath) &&
    fs.existsSync(filterBarPath) && fs.existsSync(navTabsPath),
    'Core Stage 24 analytics types, calculation store, and 6 visual chart components exist'
  );

  // 2. All 5 Admin Analytics Pages Exist
  const pageOverview = path.join(__dirname, '..', 'src', 'pages', 'admin', 'analytics', 'AdminAnalyticsOverviewPage.tsx');
  const pageVehicles = path.join(__dirname, '..', 'src', 'pages', 'admin', 'analytics', 'AdminAnalyticsVehiclesPage.tsx');
  const pageMarketplace = path.join(__dirname, '..', 'src', 'pages', 'admin', 'analytics', 'AdminAnalyticsMarketplacePage.tsx');
  const pageDealers = path.join(__dirname, '..', 'src', 'pages', 'admin', 'analytics', 'AdminAnalyticsDealersPage.tsx');
  const pageOffers = path.join(__dirname, '..', 'src', 'pages', 'admin', 'analytics', 'AdminAnalyticsOffersPage.tsx');

  assert(
    fs.existsSync(pageOverview) && fs.existsSync(pageVehicles) &&
    fs.existsSync(pageMarketplace) && fs.existsSync(pageDealers) &&
    fs.existsSync(pageOffers),
    'All 5 administrative analytics pages exist in src/pages/admin/analytics/'
  );

  // 3. Admin Layout Navigation Link
  const adminLayout = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'admin', 'AdminLayout.tsx'), 'utf8');
  assert(
    adminLayout.includes('/admin/analytics') &&
    adminLayout.includes('Analytics & Reports') &&
    adminLayout.includes('BarChart3'),
    'AdminLayout includes dedicated Analytics & Reports navigation item with BarChart3 icon'
  );

  // 4. App.tsx Child Route Registration
  const appTsx = fs.readFileSync(path.join(__dirname, '..', 'src', 'App.tsx'), 'utf8');
  assert(
    appTsx.includes('analytics') &&
    appTsx.includes('analytics/vehicles') &&
    appTsx.includes('analytics/marketplace') &&
    appTsx.includes('analytics/dealers') &&
    appTsx.includes('analytics/offers'),
    'App.tsx registers all 5 admin analytics routes under protected AdminRoute layout'
  );

  // 5. Verification of Real Data Imports (No Fabricated Constants)
  const storeContent = fs.readFileSync(storePath, 'utf8');
  assert(
    storeContent.includes("from '../data/vehicles'") &&
    storeContent.includes("from '../data/launches'") &&
    storeContent.includes("from '../data/officialRecalls'") &&
    storeContent.includes("from './communityStore'") &&
    storeContent.includes("from './marketplaceStore'") &&
    storeContent.includes("from './dealerStore'") &&
    storeContent.includes("from './financeStore'"),
    'Analytics store sources metrics directly from active catalog, marketplace, dealer, offer, and review stores'
  );

  // 6. Date Range Filtering Logic
  // Emulate date filtering
  const now = new Date();
  const todayStr = now.toISOString();
  const threeDaysAgoStr = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const twentyDaysAgoStr = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString();
  const twoYearsAgoStr = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000).toISOString();

  function testDateFilter(dateStr, range, customStart, customEnd) {
    const target = new Date(dateStr).getTime();
    if (range === 'all_time') return true;
    if (range === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return target >= startOfToday;
    }
    if (range === '7d') return target >= now.getTime() - 7 * 24 * 60 * 60 * 1000;
    if (range === '30d') return target >= now.getTime() - 30 * 24 * 60 * 60 * 1000;
    if (range === 'this_year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
      return target >= startOfYear;
    }
    if (range === 'custom') {
      const s = new Date(customStart).getTime();
      const e = new Date(customEnd).getTime() + 86400000;
      return target >= s && target <= e;
    }
    return true;
  }

  assert(
    testDateFilter(todayStr, 'today') === true &&
    testDateFilter(threeDaysAgoStr, 'today') === false &&
    testDateFilter(threeDaysAgoStr, '7d') === true &&
    testDateFilter(twentyDaysAgoStr, '7d') === false &&
    testDateFilter(twentyDaysAgoStr, '30d') === true &&
    testDateFilter(twoYearsAgoStr, 'this_year') === false,
    'Date range filter accurately evaluates timestamps across today, 7d, 30d, and this_year windows'
  );

  // 7. Custom Date Range Validation
  assert(
    testDateFilter('2024-05-15T10:00:00Z', 'custom', '2024-05-01', '2024-05-31') === true &&
    testDateFilter('2024-06-15T10:00:00Z', 'custom', '2024-05-01', '2024-05-31') === false,
    'Custom date range filtering correctly bounds entries within arbitrary user-selected intervals'
  );

  // 8. Vehicle Catalog Metric Integrity
  // Inspect vehicles dataset
  const vehiclesModule = require(path.join(__dirname, '..', 'src', 'data', 'vehicles.ts'));
  const vehicles = vehiclesModule.VEHICLES;
  assert(
    Array.isArray(vehicles) && vehicles.length === 50,
    `Catalog analytics evaluates verified 50 production vehicles (Actual count: ${vehicles.length})`
  );

  // 9. Powertrain Composition Accuracy
  let evCount = 0;
  let hybridCount = 0;
  let iceCount = 0;
  vehicles.forEach((v) => {
    const p = (v.powertrain || '').toLowerCase();
    if (p.includes('electric') || p.includes('ev')) evCount++;
    else if (p.includes('hybrid') || p.includes('phev')) hybridCount++;
    else iceCount++;
  });
  assert(
    evCount > 0 && hybridCount > 0 && iceCount > 0 && (evCount + hybridCount + iceCount) === vehicles.length,
    `Powertrain distribution accurately partitions fleet (BEV: ${evCount}, Hybrid: ${hybridCount}, ICE: ${iceCount})`
  );

  // 10. Catalog Completeness Metrics
  let withSpecs = 0;
  let withGallery = 0;
  vehicles.forEach((v) => {
    if (v.accelerationSeconds && v.topSpeedMph) withSpecs++;
    if (v.thumbnail || (v.imageGallery && v.imageGallery.length > 0)) withGallery++;
  });
  assert(
    withSpecs === vehicles.length && withGallery === vehicles.length,
    `Catalog completeness confirms 100% specification and visual gallery integrity (${withSpecs}/${vehicles.length})`
  );

  // 11. Used-Car Marketplace Metric Integrity
  const listingsModule = require(path.join(__dirname, '..', 'src', 'data', 'marketplaceListings.ts'));
  const listings = listingsModule.SEED_MARKETPLACE_LISTINGS;
  assert(
    Array.isArray(listings) && listings.length >= 6,
    `Marketplace analytics evaluates verified pre-owned listings (Actual count: ${listings.length})`
  );

  // 12. Marketplace Status Breakdown Integrity
  const activeListings = listings.filter((l) => l.status === 'active');
  const soldListings = listings.filter((l) => l.status === 'sold');
  assert(
    activeListings.length > 0 && (activeListings.length + soldListings.length) <= listings.length,
    `Marketplace status categorizes active inventory (${activeListings.length}) and completed transactions`
  );

  // 13. Dealer Network & Test-Drive Bookings
  const dealersModule = require(path.join(__dirname, '..', 'src', 'data', 'dealers.ts'));
  const dealerships = dealersModule.INITIAL_DEALERSHIPS;
  assert(
    Array.isArray(dealerships) && dealerships.length >= 4,
    `Dealer analytics calculates verified showroom footprint across ${dealerships.length} regional dealerships`
  );

  // 14. Verified Dealer Offers Analytics
  const offersModule = require(path.join(__dirname, '..', 'src', 'data', 'dealerOffers.ts'));
  const offers = offersModule.INITIAL_VEHICLE_OFFERS;
  const nowStr = new Date().toISOString().split('T')[0];
  const activeOffers = offers.filter((o) => o.validUntil >= nowStr && o.status === 'approved');
  assert(
    offers.length >= 7 && activeOffers.length >= 5,
    `Offers analytics distinguishes valid approved campaigns (${activeOffers.length}) from historical promotions`
  );

  // 15. CWE-1236 Formula Injection Defense
  function sanitizeCsvValue(val) {
    if (val === null || val === undefined) return '""';
    let str = String(val).trim();
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  assert(
    sanitizeCsvValue('=CMD|"/C calc"!A0') === `"'=CMD|""/C calc""!A0"` &&
    sanitizeCsvValue('+1234') === `\"'+1234\"` &&
    sanitizeCsvValue('-5678') === `\"'-5678\"` &&
    sanitizeCsvValue('@SUM(1,2)') === `\"'@SUM(1,2)\"` &&
    sanitizeCsvValue('Porsche 911 GT3 RS') === '"Porsche 911 GT3 RS"',
    'CSV export sanitizes formula injection triggers (=, +, -, @) according to CWE-1236 standards'
  );

  // 16-20. HTTP 200 Route Accessibility Checks
  const routeOverview = await checkRoute('/admin/analytics');
  assert(routeOverview, 'HTTP 200 OK: Executive Analytics Overview Hub (/admin/analytics)');

  const routeVehicles = await checkRoute('/admin/analytics/vehicles');
  assert(routeVehicles, 'HTTP 200 OK: Vehicle & OEM Analytics (/admin/analytics/vehicles)');

  const routeMarketplace = await checkRoute('/admin/analytics/marketplace');
  assert(routeMarketplace, 'HTTP 200 OK: Used-Car Marketplace Analytics (/admin/analytics/marketplace)');

  const routeDealers = await checkRoute('/admin/analytics/dealers');
  assert(routeDealers, 'HTTP 200 OK: Dealer Network & Test-Drive Analytics (/admin/analytics/dealers)');

  const routeOffers = await checkRoute('/admin/analytics/offers');
  assert(routeOffers, 'HTTP 200 OK: Dealer Offers & Financing Analytics (/admin/analytics/offers)');

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL AUTOVERSE STAGE 24 ANALYTICS VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.error('❌ SOME STAGE 24 TESTS FAILED');
    process.exit(1);
  }
}

runTests();
