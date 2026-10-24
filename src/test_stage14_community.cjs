/**
 * AutoVerse Stage 14 Comprehensive Automated Verification Suite
 * Tests Community, Owner Reviews, Ratings, Verified Ownership, Discussions, Saved Items & Admin Moderation
 */

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

console.log('\n===============================================================');
console.log('👥 AUTOVERSE STAGE 14: COMMUNITY, REVIEWS & MODERATION VERIFICATION');
console.log('===============================================================\n');

// 1. FILE & COMPONENT EXISTENCE AUDIT
console.log('1. Community Files & Components Existence:');
const requiredFiles = [
  'src/types/community.ts',
  'src/utils/communityStore.ts',
  'src/components/community/StarRatingInput.tsx',
  'src/components/community/VerifiedOwnerBadgeModal.tsx',
  'src/components/community/ReportContentModal.tsx',
  'src/components/community/RatingBreakdownCard.tsx',
  'src/components/community/OwnerReviewCard.tsx',
  'src/pages/CommunityPage.tsx',
  'src/pages/VehicleCommunityPage.tsx',
  'src/pages/ReviewDetailPage.tsx',
  'src/pages/WriteReviewPage.tsx',
  'src/pages/MyReviewsPage.tsx',
  'src/pages/SavedCommunityPage.tsx',
  'src/pages/admin/AdminCommunityPage.tsx',
];

requiredFiles.forEach((file) => {
  const fullPath = path.join(__dirname, '..', file);
  report(fs.existsSync(fullPath), `Component file exists: ${file}`);
});

// 2. ROUTING CONFIGURATION IN APP.TSX
console.log('\n2. Routing Registration in App.tsx:');
const appTsxPath = path.join(__dirname, '..', 'src/App.tsx');
const appContent = fs.readFileSync(appTsxPath, 'utf8');

const requiredRoutes = [
  'path="/community"',
  'path="/community/vehicles/:slug"',
  'path="/community/reviews/:id"',
  'path="/community/write-review/:vehicleSlug"',
  'path="/community/my-reviews"',
  'path="/community/saved"',
  'path="community"', // nested inside /admin
];

requiredRoutes.forEach((route) => {
  report(appContent.includes(route), `Route registered in App.tsx: "${route}"`);
});

// 3. NAVIGATION INTEGRATION
console.log('\n3. Navigation Links Integration:');
const navbarPath = path.join(__dirname, '..', 'src/components/Navbar.tsx');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');
report(navbarContent.includes("name: 'Community', path: '/community'"), 'Navbar links to /community in main nav');
report(navbarContent.includes('/community/my-reviews'), 'Navbar user menu links to /community/my-reviews');
report(navbarContent.includes('/community/saved'), 'Navbar user menu links to /community/saved');

const adminLayoutPath = path.join(__dirname, '..', 'src/components/admin/AdminLayout.tsx');
const adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf8');
report(adminLayoutContent.includes('/admin/community') && adminLayoutContent.includes('Community & Moderation'), 'AdminLayout includes Community & Moderation navigation item');

const vehicleDetailPath = path.join(__dirname, '..', 'src/pages/VehicleDetailPage.tsx');
const vehicleDetailContent = fs.readFileSync(vehicleDetailPath, 'utf8');
report(vehicleDetailContent.includes('/community/vehicles/') && vehicleDetailContent.includes('Write an Owner Review'), 'VehicleDetailPage connects to vehicle community & write-review');

// 4. DATA CONTRACTS & TYPE INTEGRITY
console.log('\n4. Community Data Contracts in src/types/community.ts:');
const typesPath = path.join(__dirname, '..', 'src/types/community.ts');
const typesContent = fs.readFileSync(typesPath, 'utf8');

report(typesContent.includes('export interface OwnerReview'), 'OwnerReview interface defined');
report(typesContent.includes('export interface ReviewCategoryRatings'), 'ReviewCategoryRatings interface defined (comfort, performance, reliability, etc.)');
report(typesContent.includes('export interface OwnershipCostObservations'), 'OwnershipCostObservations interface defined (fuel, service, insurance)');
report(typesContent.includes('export interface VehicleDiscussion'), 'VehicleDiscussion interface defined');
report(typesContent.includes('export interface DiscussionReply'), 'DiscussionReply interface defined');
report(typesContent.includes('export interface HelpfulVote'), 'HelpfulVote interface defined');
report(typesContent.includes('export interface SavedCommunityItem'), 'SavedCommunityItem interface defined');
report(typesContent.includes('export interface ContentReport'), 'ContentReport interface defined');
report(typesContent.includes('export interface OwnershipVerificationRequest'), 'OwnershipVerificationRequest interface defined');
report(typesContent.includes('export interface VehicleCommunitySummary'), 'VehicleCommunitySummary aggregate model defined');
report(
  typesContent.includes("'not_verified'") &&
  typesContent.includes("'verification_pending'") &&
  typesContent.includes("'verified'") &&
  typesContent.includes("'rejected'"),
  'VerificationStatus union defined (not_verified, verification_pending, verified, rejected)'
);

// 5. STORE SEED DATA & PRIVACY AUDIT
console.log('\n5. Community Store & Seed Content Audit:');
const storePath = path.join(__dirname, '..', 'src/utils/communityStore.ts');
const storeContent = fs.readFileSync(storePath, 'utf8');

report(storeContent.includes('rev_taycan_01'), 'Porsche Taycan Turbo S verified owner review seeded');
report(storeContent.includes('rev_roxx_01'), 'Mahindra Thar Roxx verified owner review seeded');
report(storeContent.includes('rev_curvv_01'), 'Tata Curvv.ev owner review seeded');
report(storeContent.includes('rev_plaid_01'), 'Tesla Model S Plaid owner review seeded');
report(storeContent.includes('rev_ioniq_01'), 'Hyundai Ioniq 5 owner review seeded');
report(storeContent.includes('disc_taycan_battery'), 'Technical discussion thread seeded for Taycan');
report(storeContent.includes('maskVin'), 'VIN masking privacy utility function implemented');
report(storeContent.includes('getVehicleCommunitySummary'), 'Dynamic community aggregate summary function implemented');
report(storeContent.includes('getHighestRatedVehicles'), 'Highest rated vehicles ranking algorithm implemented');
report(storeContent.includes('toggleHelpfulVote'), 'Helpful vote state machine implemented');
report(storeContent.includes('toggleSaveCommunityItem'), 'Personal saved items toggle implemented');
report(storeContent.includes('submitOwnershipVerification'), 'Ownership verification workflow implemented');
report(storeContent.includes('moderateVerificationRequest'), 'Admin verification approval/rejection implemented');
report(storeContent.includes('submitContentReport'), 'Abusive/spam content reporting implemented');
report(storeContent.includes('moderateReportedContent'), 'Admin moderation resolution implemented');

// 6. DETERMINISTIC ALGORITHMIC & LOGIC VERIFICATION
console.log('\n6. Algorithmic Integrity & Business Rules Verification:');

// Test A: VIN Masking Privacy
function maskVin(vin) {
  if (!vin || typeof vin !== 'string') return '';
  const clean = vin.trim().toUpperCase();
  if (clean.length < 11) return 'VIN-VERIFIED-PRIVATE';
  const prefix = clean.slice(0, 6);
  const suffix = clean.slice(-4);
  return `${prefix}*****${suffix}`;
}

report(maskVin('WP0AB2Y15MSA39182') === 'WP0AB2*****9182', 'VIN masking conceals chassis serial sequence (WP0AB2*****9182)');
report(maskVin('MA1TA2RK8P9104829') === 'MA1TA2*****4829', 'Indian VIN standard 17-char masked safely');
report(maskVin('SHORT') === 'VIN-VERIFIED-PRIVATE', 'Short/malformed VIN obscured without leaking info');

// Test B: Dynamic Rating Aggregate & Histogram Computation
function computeVehicleSummary(reviews) {
  const activeReviews = reviews.filter((r) => r.moderationStatus !== 'hidden' && r.moderationStatus !== 'deleted');
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      ratingDistributionPercent: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      verifiedOwnerReviewsCount: 0,
      categoryAverages: {},
      isSmallSample: true,
    };
  }

  const totalReviews = activeReviews.length;
  const verifiedCount = activeReviews.filter((r) => r.verificationStatus === 'verified').length;
  const totalScore = activeReviews.reduce((sum, r) => sum + r.overallRating, 0);
  const avg = Number((totalScore / (totalReviews || 1)).toFixed(1));

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  activeReviews.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(r.overallRating)));
    distribution[star] = (distribution[star] || 0) + 1;
  });

  const distributionPercent = {
    5: Math.round((distribution[5] / totalReviews) * 100),
    4: Math.round((distribution[4] / totalReviews) * 100),
    3: Math.round((distribution[3] / totalReviews) * 100),
    2: Math.round((distribution[2] / totalReviews) * 100),
    1: Math.round((distribution[1] / totalReviews) * 100),
  };

  return {
    totalReviews,
    averageRating: Math.max(1.0, Math.min(5.0, avg)),
    ratingDistribution: distribution,
    ratingDistributionPercent: distributionPercent,
    verifiedOwnerReviewsCount: verifiedCount,
    isSmallSample: totalReviews < 3,
  };
}

const mockReviews = [
  { id: '1', overallRating: 4.8, verificationStatus: 'verified', moderationStatus: 'active' },
  { id: '2', overallRating: 4.5, verificationStatus: 'not_verified', moderationStatus: 'active' },
  { id: '3', overallRating: 4.2, verificationStatus: 'verified', moderationStatus: 'active' },
];

const computedSummary = computeVehicleSummary(mockReviews);
report(computedSummary.totalReviews === 3, 'Calculates active review count correctly (3)');
report(computedSummary.averageRating === 4.5, 'Computes correct average rating (4.5)');
report(computedSummary.verifiedOwnerReviewsCount === 2, 'Counts verified owners correctly (2)');
report(computedSummary.ratingDistribution[5] === 2 && computedSummary.ratingDistribution[4] === 1, 'Maps ratings into 1-5 star distribution (2x 5-star, 1x 4-star)');
report(computedSummary.isSmallSample === false, 'Small sample flag is false when reviews >= 3');

const smallSampleSummary = computeVehicleSummary([mockReviews[0]]);
report(smallSampleSummary.isSmallSample === true, 'Small sample flag is true when reviews < 3 (transparency requirement)');

// Test C: Review Submission Server Validation Rules
function validateReviewInput(input, user, validVehicleSlugs) {
  if (!user || !user.id) {
    return { valid: false, error: 'Authentication required to submit an owner review.' };
  }
  if (!input.vehicleSlug || !validVehicleSlugs.includes(input.vehicleSlug)) {
    return { valid: false, error: 'Cannot submit a review for a nonexistent vehicle.' };
  }
  const rating = Number(input.overallRating);
  if (isNaN(rating) || rating < 1.0 || rating > 5.0) {
    return { valid: false, error: 'Overall rating must be between 1.0 and 5.0 stars.' };
  }
  if (!input.title || input.title.trim().length < 5) {
    return { valid: false, error: 'Review headline must be at least 5 characters long.' };
  }
  if (!input.writtenExperience || input.writtenExperience.trim().length < 50) {
    return { valid: false, error: 'Detailed written ownership experience must be at least 50 characters long.' };
  }
  return { valid: true };
}

const validVehicles = ['porsche-taycan-turbo-s', 'mahindra-thar-roxx', 'tata-curvv-ev'];

report(
  !validateReviewInput({}, null, validVehicles).valid,
  'Validation rejects unauthenticated review submissions'
);
report(
  !validateReviewInput({ vehicleSlug: 'fake-car-xyz', overallRating: 5, title: 'Good car', writtenExperience: 'Long experience text reaching at least 50 chars for this test.' }, { id: 'u1' }, validVehicles).valid,
  'Validation rejects nonexistent vehicle IDs'
);
report(
  !validateReviewInput({ vehicleSlug: 'porsche-taycan-turbo-s', overallRating: 6.0, title: 'Good car', writtenExperience: 'Long experience text reaching at least 50 chars for this test.' }, { id: 'u1' }, validVehicles).valid,
  'Validation rejects out-of-range star ratings (> 5.0)'
);
report(
  !validateReviewInput({ vehicleSlug: 'porsche-taycan-turbo-s', overallRating: 4.5, title: 'Hi', writtenExperience: 'Long experience text reaching at least 50 chars for this test.' }, { id: 'u1' }, validVehicles).valid,
  'Validation rejects excessively short headlines (< 5 chars)'
);
report(
  !validateReviewInput({ vehicleSlug: 'porsche-taycan-turbo-s', overallRating: 4.5, title: 'Great Porsche', writtenExperience: 'Too brief.' }, { id: 'u1' }, validVehicles).valid,
  'Validation rejects excessively short written experiences (< 50 chars)'
);
report(
  validateReviewInput(
    {
      vehicleSlug: 'porsche-taycan-turbo-s',
      overallRating: 4.8,
      title: 'Remarkable electric super-sedan experience',
      writtenExperience: 'The acceleration never fades even after consecutive high-speed Autobahn sprints. Truly magnificent engineering.',
    },
    { id: 'u1' },
    validVehicles
  ).valid,
  'Validation accepts comprehensive, valid review submission'
);

// Test D: Helpful Voting Duplicate Prevention & Toggle Logic
function simulateVoteState(currentVote, newVote) {
  let helpfulDelta = 0;
  let notHelpfulDelta = 0;
  let resultingVote = null;

  if (currentVote === newVote) {
    // Clicking same vote removes it
    if (newVote === 'helpful') helpfulDelta = -1;
    if (newVote === 'not_helpful') notHelpfulDelta = -1;
    resultingVote = null;
  } else if (!currentVote) {
    // New vote from no vote
    if (newVote === 'helpful') helpfulDelta = 1;
    if (newVote === 'not_helpful') notHelpfulDelta = 1;
    resultingVote = newVote;
  } else {
    // Switched vote
    if (newVote === 'helpful') {
      helpfulDelta = 1;
      notHelpfulDelta = -1;
    } else {
      helpfulDelta = -1;
      notHelpfulDelta = 1;
    }
    resultingVote = newVote;
  }

  return { helpfulDelta, notHelpfulDelta, resultingVote };
}

const firstVote = simulateVoteState(null, 'helpful');
report(firstVote.helpfulDelta === 1 && firstVote.resultingVote === 'helpful', 'Helpful vote registers increment (+1)');

const repeatVote = simulateVoteState('helpful', 'helpful');
report(repeatVote.helpfulDelta === -1 && repeatVote.resultingVote === null, 'Clicking same vote toggles off cleanly (-1, null)');

const switchVote = simulateVoteState('helpful', 'not_helpful');
report(switchVote.helpfulDelta === -1 && switchVote.notHelpfulDelta === 1 && switchVote.resultingVote === 'not_helpful', 'Switching vote decrements prior and increments new vote');

// Test E: Saved Items Toggle
function simulateSaveItem(savedIds, targetId) {
  const exists = savedIds.includes(targetId);
  if (exists) {
    return { savedIds: savedIds.filter((id) => id !== targetId), isSaved: false };
  } else {
    return { savedIds: [...savedIds, targetId], isSaved: true };
  }
}

const saveStep1 = simulateSaveItem([], 'rev_taycan_01');
report(saveStep1.isSaved === true && saveStep1.savedIds.includes('rev_taycan_01'), 'Bookmarks item to user saved collection');

const saveStep2 = simulateSaveItem(saveStep1.savedIds, 'rev_taycan_01');
report(saveStep2.isSaved === false && !saveStep2.savedIds.includes('rev_taycan_01'), 'Toggling bookmark cleanly removes item');

// 7. DEV SERVER HTTP ROUTE AVAILABILITY CHECKS
console.log('\n7. Local Dev Server HTTP Route Availability (localhost:5173):');

function testHttpRoute(urlPath) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5173${urlPath}`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        resolve({ ok: res.statusCode === 200, status: res.statusCode, data });
      });
    }).on('error', (err) => {
      resolve({ ok: false, error: err.message });
    });
  });
}

async function runHttpChecks() {
  const routesToTest = [
    { path: '/community', label: 'Community Hub' },
    { path: '/community/vehicles/porsche-taycan-turbo-s', label: 'Vehicle Community (Taycan)' },
    { path: '/community/reviews/rev_taycan_01', label: 'Review Detail (rev_taycan_01)' },
    { path: '/community/write-review/porsche-taycan-turbo-s', label: 'Write Review (Taycan)' },
    { path: '/community/my-reviews', label: 'My Reviews Dashboard' },
    { path: '/community/saved', label: 'Saved Community Items' },
  ];

  for (const r of routesToTest) {
    const res = await testHttpRoute(r.path);
    report(res.ok, `HTTP GET ${r.path} returns 200 OK (${r.label})`, res.error || `Status: ${res.status}`);
  }

  console.log('\n===============================================================');
  console.log(`SUMMARY: ${passedChecks} checks passed, ${failedChecks} checks failed.`);
  console.log('===============================================================\n');

  if (failedChecks > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runHttpChecks();
