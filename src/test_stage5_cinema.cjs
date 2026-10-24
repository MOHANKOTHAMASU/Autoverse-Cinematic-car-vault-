// AutoVerse — Stage 5 Road Cinema Test Suite
const http = require('http');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    }).on('error', (err) => reject(err));
  });
}

async function runStage5Tests() {
  console.log('====================================================');
  console.log('   AUTOVERSE — STAGE 5: ROAD CINEMA TEST SUITE      ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
    }
  }

  try {
    // 1. Verify Vite server is responding on root
    const rootRes = await fetchUrl('http://127.0.0.1:5173/');
    assert(rootRes.statusCode === 200, 'Server responds HTTP 200 on root "/"');
    assert(rootRes.data.includes('AutoVerse') || rootRes.data.includes('<div id="root">'), 'Root HTML served with root container');

    // 2. Verify /cinema route
    const cinemaRes = await fetchUrl('http://127.0.0.1:5173/cinema');
    assert(cinemaRes.statusCode === 200, 'Server responds HTTP 200 on "/cinema"');

    // 3. Verify Stage 5 Video & Meta dataset
    const { CINEMA_FILMS, FILM_CATEGORIES } = require('./data/cinemaVideos.ts');
    assert(Array.isArray(CINEMA_FILMS), 'CINEMA_FILMS dataset is exported');
    assert(CINEMA_FILMS.length === 8, `CINEMA_FILMS contains exactly 8 curated films (found: ${CINEMA_FILMS.length})`);

    // 4. Verify all 7 categories are covered
    const requiredCategories = [
      'Electric Performance',
      'Supercars and Hypercars',
      'Luxury and Comfort',
      'Track and Motorsport',
      'Grand Touring',
      'Night Drives',
      'Engineering and Innovation',
    ];
    for (const cat of requiredCategories) {
      const match = CINEMA_FILMS.some((f) => f.category === cat);
      assert(match, `Curated film exists for category: "${cat}"`);
    }

    // 5. Verify all 5 manufacturers have films
    const requiredBrands = ['Porsche', 'Tesla', 'Audi', 'BMW', 'Mercedes-Benz'];
    for (const brand of requiredBrands) {
      const match = CINEMA_FILMS.some((f) => f.manufacturer === brand);
      assert(match, `Manufacturer film exists for brand: "${brand}"`);
    }

    // 6. Verify each film has complete metadata
    for (const film of CINEMA_FILMS) {
      const valid =
        film.id &&
        film.title &&
        film.subtitle &&
        film.category &&
        film.vehicle &&
        film.vehicleSlug &&
        film.manufacturer &&
        film.modelYear &&
        film.duration &&
        film.durationSeconds > 0 &&
        film.location &&
        film.description &&
        film.aspectRatio &&
        film.poster &&
        film.videoUrl &&
        Array.isArray(film.highlightStats) &&
        film.highlightStats.length >= 3;
      assert(valid, `Film "${film.title}" has complete metadata and >= 3 highlight stats`);
    }

    // 7. Verify regression check on all core stages
    const routesToCheck = [
      { path: '/discover', name: 'Stage 2 Discover' },
      { path: '/manufacturers', name: 'Stage 2 Manufacturers' },
      { path: '/launches', name: 'Stage 2 Launches' },
      { path: '/compare', name: 'Stage 4 Comparison' },
      { path: '/garage', name: 'Garage' },
      { path: '/cars/porsche-taycan-turbo-s', name: 'Stage 3 Vehicle Details' },
    ];

    for (const r of routesToCheck) {
      const res = await fetchUrl(`http://127.0.0.1:5173${r.path}`);
      assert(res.statusCode === 200, `Regression check: ${r.name} (${r.path}) responds HTTP 200`);
    }

  } catch (error) {
    console.error('Test execution error:', error);
  }

  console.log(`\nStage 5 Tests complete: ${passed} / ${total} passed.`);
  if (passed === total) {
    console.log('STATUS: ALL STAGE 5 ROAD CINEMA SPECIFICATIONS VERIFIED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.error('STATUS: SOME TESTS FAILED.\n');
    process.exit(1);
  }
}

runStage5Tests();
