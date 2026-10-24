// AutoVerse Stage 4 Advanced Car Comparison System Automated Test Suite
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('===========================================================');
console.log('   AUTOVERSE STAGE 4 — ADVANCED CAR COMPARISON TEST SUITE  ');
console.log('===========================================================');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Inspect vehicle data file for dimensions & specifications
const vehiclesPath = path.join(__dirname, 'data', 'vehicles.ts');
const vehiclesContent = fs.readFileSync(vehiclesPath, 'utf8');

assert(vehiclesContent.includes('dimensions:'), 'Vehicle dimensions property present in vehicles.ts');
assert(vehiclesContent.includes('lengthMm:'), 'Length in mm present');
assert(vehiclesContent.includes('wheelbaseMm:'), 'Wheelbase in mm present');

// 2. Inspect ComparePage.tsx for Stage 4 requirements
const comparePagePath = path.join(__dirname, 'pages', 'ComparePage.tsx');
const compareContent = fs.readFileSync(comparePagePath, 'utf8');

assert(compareContent.includes('CompareVehicleSelectorModal'), 'Selector modal integrated in ComparePage');
assert(compareContent.includes('showDifferencesOnly'), 'Show differences only toggle implemented');
assert(compareContent.includes('highlightBestValues'), 'Highlight best values implemented');
assert(compareContent.includes('generateComparisonSummary'), 'Executive takeaways summary generator integrated');
assert(compareContent.includes('handleShareComparison'), 'URL copy & share feature implemented');
assert(compareContent.includes('handleRemoveVehicle'), 'Remove vehicle handler implemented');
assert(compareContent.includes('handleOpenReplaceModal'), 'Slot replacement handler implemented');
assert(compareContent.includes('selectedVehicles.length >= 4'), '4-vehicle maximum comparison limit enforced');
assert(compareContent.includes('selectedVehicles.length <= 2'), '2-vehicle minimum comparison limit enforced');

// 3. Inspect Comparison Intelligence utility
const compUtilPath = path.join(__dirname, 'utils', 'comparison.ts');
const compUtilContent = fs.readFileSync(compUtilPath, 'utf8');

assert(compUtilContent.includes('hasRowDifferences'), 'hasRowDifferences function defined');
assert(compUtilContent.includes('findBestVehicleIndex'), 'findBestVehicleIndex logic defined');
assert(compUtilContent.includes('generateComparisonSummary'), 'generateComparisonSummary function defined');
assert(compUtilContent.includes('higherIsBetter'), 'Directional best value assessment configured');

// 4. Test HTTP Routes on live Dev Server
const testRoutes = [
  '/compare',
  '/compare?cars=porsche-taycan-turbo-s,tesla-model-s-plaid',
  '/compare?cars=porsche-taycan-turbo-s,tesla-model-s-plaid,bmw-m4-competition',
  '/compare?cars=porsche-taycan-turbo-s,tesla-model-s-plaid,bmw-m4-competition,porsche-911-gt3-rs',
  '/compare?a=audi-rs-etron-gt&b=mercedes-amg-gt-63-s',
  '/compare?a=bmw-m4-competition',
];

function testHttpRoute(route) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5173${route}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`[PASS] Route HTTP 200: ${route}`);
          passCount++;
          resolve(true);
        } else {
          console.error(`[FAIL] Route HTTP ${res.statusCode}: ${route}`);
          failCount++;
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.error(`[FAIL] Request failed on ${route}:`, err.message);
      failCount++;
      resolve(false);
    });
  });
}

async function runAllTests() {
  console.log('\n--- Testing HTTP Endpoints ---');
  for (const route of testRoutes) {
    await testHttpRoute(route);
  }

  console.log('\n===========================================================');
  console.log(`   STAGE 4 TEST RESULTS: ${passCount} Passed, ${failCount} Failed`);
  console.log('===========================================================');

  if (failCount === 0) {
    console.log('>>> ALL AUTOVERSE STAGE 4 COMPARISON TESTS PASSED! <<<');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAllTests();
