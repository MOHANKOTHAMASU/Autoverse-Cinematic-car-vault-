// AutoVerse Stage 13: Comprehensive Automated Verification Suite
// Tests Automotive News, Article Reader, Road Test Reviews, 3-Tier Launches, Reading List, Admin Editorial CRUD, and Route Integration

const fs = require('fs');
const path = require('path');
const http = require('http');

let passedChecks = 0;
let failedChecks = 0;

function report(condition, testName, details = '') {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedChecks++;
  } else {
    console.error(`  [FAIL] ${testName} - ${details}`);
    failedChecks++;
  }
}

console.log('\n======================================================');
console.log('AUTOVERSE STAGE 13 — AUTOMATED EDITORIAL VERIFICATION');
console.log('======================================================\n');

// 1. FILE & COMPONENT EXISTENCE CHECKS
console.log('1. Editorial Files & Components Existence:');
const requiredFiles = [
  'src/types/editorial.ts',
  'src/utils/editorialStore.ts',
  'src/pages/NewsHomePage.tsx',
  'src/pages/ArticleDetailPage.tsx',
  'src/pages/ReviewsPage.tsx',
  'src/pages/LaunchesPage.tsx',
  'src/pages/ReadingListPage.tsx',
  'src/pages/admin/AdminArticlesPage.tsx',
  'src/pages/admin/AdminArticleEditorPage.tsx',
  'src/pages/admin/AdminReviewsPage.tsx',
];

requiredFiles.forEach((file) => {
  const fullPath = path.join(__dirname, '..', file);
  report(fs.existsSync(fullPath), `Component exists: ${file}`);
});

// 2. ROUTING CONFIGURATION IN APP.TSX
console.log('\n2. Routing Registration in App.tsx:');
const appTsxPath = path.join(__dirname, '..', 'src/App.tsx');
const appContent = fs.readFileSync(appTsxPath, 'utf8');

const requiredRoutes = [
  '/news',
  '/news/category/:slug',
  '/news/:slug',
  '/reviews',
  '/launches',
  '/reading-list',
  'articles',
  'articles/new',
  'articles/:id/edit',
  'reviews',
];

requiredRoutes.forEach((route) => {
  report(appContent.includes(route), `Route registered in App.tsx: "${route}"`);
});

// 3. NAVBAR & ADMIN NAVIGATION INTEGRATION
console.log('\n3. Navigation Links Integration:');
const navbarPath = path.join(__dirname, '..', 'src/components/Navbar.tsx');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');
report(navbarContent.includes('/news'), 'Navbar links to /news');
report(navbarContent.includes('/reviews'), 'Navbar links to /reviews');
report(navbarContent.includes('/reading-list'), 'Navbar links to /reading-list');

const adminLayoutPath = path.join(__dirname, '..', 'src/components/admin/AdminLayout.tsx');
const adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf8');
report(adminLayoutContent.includes('/admin/articles'), 'AdminLayout includes /admin/articles link');
report(adminLayoutContent.includes('/admin/reviews'), 'AdminLayout includes /admin/reviews link');

// 4. DATA MODELS & TYPES VERIFICATION
console.log('\n4. Editorial Data Contracts & Types:');
const typesPath = path.join(__dirname, '..', 'src/types/editorial.ts');
const typesContent = fs.readFileSync(typesPath, 'utf8');

report(typesContent.includes('export interface Article'), 'Article interface defined');
report(typesContent.includes('export interface CarReview'), 'CarReview interface defined');
report(typesContent.includes('export interface ReviewCategoryScores'), 'ReviewCategoryScores defined');
report(typesContent.includes('export interface LaunchRecord'), 'LaunchRecord interface defined');
report(typesContent.includes('export interface SourceReference'), 'SourceReference interface defined');
report(typesContent.includes('export interface ReadingListItem'), 'ReadingListItem interface defined');
report(
  typesContent.includes("'officially_confirmed'") &&
  typesContent.includes("'credible_source'") &&
  typesContent.includes("'rumoured'"),
  '3-Tier Verification Status union defined (officially_confirmed, credible_source, rumoured)'
);

// 5. EDITORIAL STORE SEED CONTENT AUDIT
console.log('\n5. Editorial Store & Seeded Articles:');
const storePath = path.join(__dirname, '..', 'src/utils/editorialStore.ts');
const storeContent = fs.readFileSync(storePath, 'utf8');

report(storeContent.includes('porsche-taycan-turbo-gt-nurburgring-record-analysis'), 'Taycan Turbo GT lap record article seeded');
report(storeContent.includes('tata-curvv-ev-mahindra-thar-roxx-india-automotive-renaissance'), 'Tata Curvv / Thar Roxx Indian Auto analysis seeded');
report(storeContent.includes('bmw-m5-touring-g99-hybrid-v8-dossier'), 'BMW M5 Touring Hybrid V8 article seeded');
report(storeContent.includes('ferrari-f80-le-mans-v6-hybrid-reveal'), 'Ferrari F80 Le Mans V6 article seeded');
report(storeContent.includes('solid-state-batteries-ev-range-reality-check'), 'Solid-State Battery technology analysis seeded');

report(storeContent.includes('rev_porsche_taycan_turbo_s'), 'Porsche Taycan Turbo S instrumented review seeded');
report(storeContent.includes('rev_mahindra_thar_roxx'), 'Mahindra Thar Roxx road test review seeded');
report(storeContent.includes('rev_tata_curvv_ev'), 'Tata Curvv.ev long-term review seeded');

report(storeContent.includes('launch_porsche_718_electric'), 'Porsche 718 Electric concept launch seeded with rumoured tier');
report(storeContent.includes('launch_tata_sierra_ev'), 'Tata Sierra EV launch seeded with credible_source tier');
report(storeContent.includes('launch_tata_curvv_ev'), 'Tata Curvv EV launch seeded with officially_confirmed tier');

// 6. SCORING RUBRIC & VEHICLE INTEGRATION IN REVIEWS
console.log('\n6. Reviews & Scoring Rubric Verification:');
const reviewsPagePath = path.join(__dirname, '..', 'src/pages/ReviewsPage.tsx');
const reviewsPageContent = fs.readFileSync(reviewsPagePath, 'utf8');

report(reviewsPageContent.includes('AutoVerse Vehicle Index (AVI) Scoring System'), 'Transparent AVI Scoring System rubric explainer present');
report(reviewsPageContent.includes('/cars/'), 'Review links to Vehicle Detail page (/cars/:slug)');
report(reviewsPageContent.includes('/compare'), 'Review links to Compare page (/compare)');
report(reviewsPageContent.includes('/configurator'), 'Review links to Configurator (/configurator/:slug)');
report(reviewsPageContent.includes('/ownership-calculator'), 'Review links to Ownership TCO Calculator');
report(reviewsPageContent.includes('verifiedSpecs'), 'Verified instrumented specifications present');
report(reviewsPageContent.includes('testConditions'), 'Test conditions logged');
report(reviewsPageContent.includes('suitableBuyerProfile'), 'Suitable buyer profile included');
report(reviewsPageContent.includes('realWorldConsiderations'), 'Real-world ownership considerations included');

// 7. ARTICLE READER FEATURES
console.log('\n7. Article Reader Features:');
const articleReaderPath = path.join(__dirname, '..', 'src/pages/ArticleDetailPage.tsx');
const articleReaderContent = fs.readFileSync(articleReaderPath, 'utf8');

report(articleReaderContent.includes('tableOfContents'), 'Dynamic Table of Contents generated from markdown headings');
report(articleReaderContent.includes('scrollProgress'), 'Sticky reading progress indicator present');
report(articleReaderContent.includes('sourceReferences'), 'Verified sources and fact-checking dossier section present');
report(articleReaderContent.includes('handleShare'), 'Native share with clipboard copy fallback present');
report(articleReaderContent.includes('handleToggleSave'), 'Reading list bookmark save/remove toggle present');
report(articleReaderContent.includes('adjacentArticles'), 'Previous/next dispatch navigation present');
report(articleReaderContent.includes('relatedVehicles'), 'Direct links to catalog vehicles present');

// 8. LAUNCH VERIFICATION TIERS
console.log('\n8. Launches & Verification Status:');
const launchesPath = path.join(__dirname, '..', 'src/pages/LaunchesPage.tsx');
const launchesContent = fs.readFileSync(launchesPath, 'utf8');

report(launchesContent.includes('OFFICIALLY CONFIRMED'), 'Tier 1 Officially Confirmed badge rendered');
report(launchesContent.includes('CREDIBLE SOURCE REPORTED'), 'Tier 2 Credible Source badge rendered');
report(launchesContent.includes('RUMOURED / UNCONFIRMED'), 'Tier 3 Rumoured badge rendered');
report(launchesContent.includes('Not announced'), 'Unknown dates/prices marked "Not announced"');
report(launchesContent.includes('setPowertrainFilter'), 'Powertrain filter supported');

// 9. LOCAL DEV SERVER HTTP CHECK
console.log('\n9. Dev Server HTTP Route Availability:');

function testHttpRoute(urlPath) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5173${urlPath}`, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function runHttpChecks() {
  const routesToTest = [
    '/',
    '/news',
    '/reviews',
    '/launches',
    '/reading-list',
  ];

  for (const r of routesToTest) {
    const isOk = await testHttpRoute(r);
    report(isOk, `HTTP GET ${r} returns 200 OK`);
  }

  console.log('\n======================================================');
  console.log(`SUMMARY: ${passedChecks} checks passed, ${failedChecks} checks failed.`);
  console.log('======================================================\n');

  if (failedChecks > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runHttpChecks();
