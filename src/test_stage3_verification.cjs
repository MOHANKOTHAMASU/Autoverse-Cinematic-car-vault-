// AutoVerse Stage 3 Verification Script
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('--- AUTOVERSE STAGE 3 DATA & ROUTING VERIFICATION ---');

// 1. Data Integrity Audit
const vehiclesFile = fs.readFileSync(path.join(__dirname, 'data', 'vehicles.ts'), 'utf8');

const requiredSlugs = [
  'porsche-taycan-turbo-s',
  'tesla-model-s-plaid',
  'audi-rs-etron-gt',
  'mercedes-amg-gt-63-s',
  'bmw-m4-competition',
  'porsche-911-gt3-rs'
];

let allSlugsFound = true;
requiredSlugs.forEach(slug => {
  if (vehiclesFile.includes(slug)) {
    console.log(`[PASS] Vehicle slug verified: ${slug}`);
  } else {
    console.error(`[FAIL] Missing slug: ${slug}`);
    allSlugsFound = false;
  }
});

// Check critical Stage 3 engineering modules
const requiredKeywords = [
  'performanceDetails',
  'interiorDetails',
  'manufacturingDetails',
  'safetyDetails',
  'efficiencyDetails',
  'adasLimitationNotice',
  'coldWeatherImpact',
  'highwayCruisingImpact',
  'wheelSizeImpact',
  'assemblyPlantLocation'
];

let allKeywordsFound = true;
requiredKeywords.forEach(kw => {
  if (vehiclesFile.includes(kw)) {
    console.log(`[PASS] Stage 3 module field present: ${kw}`);
  } else {
    console.error(`[FAIL] Missing keyword: ${kw}`);
    allKeywordsFound = false;
  }
});

// 2. HTTP Server Check
const routesToTest = [
  '/',
  '/discover',
  '/garage',
  '/compare',
  '/cars/porsche-taycan-turbo-s',
  '/cars/tesla-model-s-plaid',
  '/cars/audi-rs-etron-gt',
  '/cars/mercedes-amg-gt-63-s',
  '/cars/bmw-m4-competition',
  '/cars/porsche-911-gt3-rs',
  '/cars/unknown-vehicle-404-test'
];

function testRoute(route) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:5173${route}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`[PASS] HTTP ${res.statusCode} on route ${route}`);
          resolve(true);
        } else {
          console.error(`[FAIL] HTTP ${res.statusCode} on route ${route}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.error(`[FAIL] Request failed on ${route}:`, err.message);
      resolve(false);
    });
  });
}

async function runAll() {
  let passedCount = 0;
  for (const r of routesToTest) {
    const ok = await testRoute(r);
    if (ok) passedCount++;
  }

  console.log(`\n=== STAGE 3 SUMMARY: ${passedCount}/${routesToTest.length} Routes Verified ===`);
  if (allSlugsFound && allKeywordsFound && passedCount === routesToTest.length) {
    console.log('>>> ALL AUTOVERSE STAGE 3 SPECIFICATIONS & ROUTES VERIFIED SUCCESSFULLY! <<<');
  } else {
    process.exit(1);
  }
}

runAll();
