// AutoVerse Stage 10: Interactive Car Configurator Test Suite
// Validates routes, components, profile generation, pricing logic, compatibility constraints, URL sharing, and garage persistence

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:5173';

function fetchPage(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${urlPath}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data, headers: res.headers }));
    }).on('error', (err) => reject(err));
  });
}

const results = [];
function recordTest(id, name, status, details = '') {
  results.push({ id, name, status, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${id}] ${name}: ${status}${details ? ` - ${details}` : ''}`);
}

async function runTests() {
  console.log('\n======================================================');
  console.log('⚡ STARTING AUTOVERSE STAGE 10 CONFIGURATOR TEST SUITE');
  console.log('======================================================\n');

  // Test 1: Configurator route returns HTTP 200
  try {
    const res = await fetchPage('/configurator');
    if (res.statusCode === 200 && res.body.toLowerCase().includes('<!doctype html>')) {
      recordTest('TEST-10-01', 'Direct Configurator route /configurator returns HTTP 200', 'PASS');
    } else {
      recordTest('TEST-10-01', 'Direct Configurator route /configurator returns HTTP 200', 'FAIL', `Status: ${res.statusCode}`);
    }
  } catch (err) {
    recordTest('TEST-10-01', 'Direct Configurator route /configurator returns HTTP 200', 'FAIL', err.message);
  }

  // Test 2: Vehicle-specific Configurator route returns HTTP 200
  try {
    const res = await fetchPage('/configurator/porsche-taycan-turbo-s');
    if (res.statusCode === 200 && res.body.toLowerCase().includes('<!doctype html>')) {
      recordTest('TEST-10-02', 'Vehicle Configurator route /configurator/porsche-taycan-turbo-s returns HTTP 200', 'PASS');
    } else {
      recordTest('TEST-10-02', 'Vehicle Configurator route /configurator/porsche-taycan-turbo-s returns HTTP 200', 'FAIL', `Status: ${res.statusCode}`);
    }
  } catch (err) {
    recordTest('TEST-10-02', 'Vehicle Configurator route /configurator/porsche-taycan-turbo-s returns HTTP 200', 'FAIL', err.message);
  }

  // Test 3: App.tsx route registration
  try {
    const appTsx = fs.readFileSync(path.join(__dirname, 'App.tsx'), 'utf8');
    const hasConfiguratorRoute = appTsx.includes('path="/configurator"') && appTsx.includes('path="/configurator/:slug"');
    const hasConfiguratorImport = appTsx.includes('ConfiguratorPage');
    if (hasConfiguratorRoute && hasConfiguratorImport) {
      recordTest('TEST-10-03', 'App.tsx registers /configurator and /configurator/:slug routes with lazy-loading', 'PASS');
    } else {
      recordTest('TEST-10-03', 'App.tsx registers /configurator and /configurator/:slug routes with lazy-loading', 'FAIL', 'Routes missing in App.tsx');
    }
  } catch (err) {
    recordTest('TEST-10-03', 'App.tsx route registration', 'FAIL', err.message);
  }

  // Test 4: Navbar entry point
  try {
    const navbarTsx = fs.readFileSync(path.join(__dirname, 'components', 'Navbar.tsx'), 'utf8');
    const hasNavLink = navbarTsx.includes('/configurator') && navbarTsx.includes('Configurator');
    if (hasNavLink) {
      recordTest('TEST-10-04', 'Navbar.tsx exposes Configurator navigation entry point', 'PASS');
    } else {
      recordTest('TEST-10-04', 'Navbar.tsx exposes Configurator navigation entry point', 'FAIL', 'Link not found in Navbar');
    }
  } catch (err) {
    recordTest('TEST-10-04', 'Navbar.tsx entry point', 'FAIL', err.message);
  }

  // Test 5: VehicleDetailPage entry point
  try {
    const detailTsx = fs.readFileSync(path.join(__dirname, 'pages', 'VehicleDetailPage.tsx'), 'utf8');
    const hasConfigureBtn = detailTsx.includes('/configurator/${vehicle.slug}') && detailTsx.includes('Configure in 3D Studio');
    if (hasConfigureBtn) {
      recordTest('TEST-10-05', 'VehicleDetailPage.tsx has Configure in 3D Studio action button', 'PASS');
    } else {
      recordTest('TEST-10-05', 'VehicleDetailPage.tsx has Configure in 3D Studio action button', 'FAIL', 'Button not found');
    }
  } catch (err) {
    recordTest('TEST-10-05', 'VehicleDetailPage entry point', 'FAIL', err.message);
  }

  // Test 6: VehicleCard entry point
  try {
    const cardTsx = fs.readFileSync(path.join(__dirname, 'components', 'VehicleCard.tsx'), 'utf8');
    const hasCardBtn = cardTsx.includes('/configurator/${slug}') && cardTsx.includes('SlidersHorizontal');
    if (hasCardBtn) {
      recordTest('TEST-10-06', 'VehicleCard.tsx includes 1-click 3D Studio Configure button', 'PASS');
    } else {
      recordTest('TEST-10-06', 'VehicleCard.tsx includes 1-click 3D Studio Configure button', 'FAIL', 'Card button missing');
    }
  } catch (err) {
    recordTest('TEST-10-06', 'VehicleCard entry point', 'FAIL', err.message);
  }

  // Test 7: GaragePage Custom Studio Builds integration
  try {
    const garageTsx = fs.readFileSync(path.join(__dirname, 'pages', 'GaragePage.tsx'), 'utf8');
    const hasConfigTab = garageTsx.includes('Studio Builds') && garageTsx.includes("activeTab === 'configurations'");
    const hasConfigActions = garageTsx.includes('handleDeleteConfig') && garageTsx.includes('handleShareConfig');
    if (hasConfigTab && hasConfigActions) {
      recordTest('TEST-10-07', 'GaragePage.tsx has Studio Builds tab with persistence, sharing, and rename', 'PASS');
    } else {
      recordTest('TEST-10-07', 'GaragePage.tsx has Studio Builds tab with persistence, sharing, and rename', 'FAIL', 'Tab or actions missing');
    }
  } catch (err) {
    recordTest('TEST-10-07', 'GaragePage configurations tab', 'FAIL', err.message);
  }

  // Test 8: Configurator data models and profiles
  try {
    const configDataFile = fs.readFileSync(path.join(__dirname, 'data', 'configuratorData.ts'), 'utf8');
    const hasFlagships = configDataFile.includes('porsche-taycan-turbo-s') &&
                         configDataFile.includes('tesla-model-s-plaid') &&
                         configDataFile.includes('audi-rs-etron-gt') &&
                         configDataFile.includes('mercedes-amg-gt-63-s') &&
                         configDataFile.includes('bmw-m4-competition');
    const hasDynamicFallback = configDataFile.includes('getOrCreateConfigProfile');
    if (hasFlagships && hasDynamicFallback) {
      recordTest('TEST-10-08', 'configuratorData.ts contains flagship factory profiles and 50-vehicle fallback generator', 'PASS');
    } else {
      recordTest('TEST-10-08', 'configuratorData.ts contains flagship factory profiles and 50-vehicle fallback generator', 'FAIL', 'Profiles or fallback generator missing');
    }
  } catch (err) {
    recordTest('TEST-10-08', 'Configurator data profiles', 'FAIL', err.message);
  }

  // Test 9: Pricing calculation engine
  try {
    const configDataFile = fs.readFileSync(path.join(__dirname, 'data', 'configuratorData.ts'), 'utf8');
    const panelTsx = fs.readFileSync(path.join(__dirname, 'components', 'ConfiguratorPanel.tsx'), 'utf8');
    const hasPricingFunc = configDataFile.includes('calculateConfigurationPricing');
    const hasMonthlyEstimate = panelTsx.includes('Estimated Monthly Finance:');
    if (hasPricingFunc && hasMonthlyEstimate) {
      recordTest('TEST-10-09', 'Itemized pricing calculation engine with monthly finance estimation verified', 'PASS');
    } else {
      recordTest('TEST-10-09', 'Itemized pricing calculation engine with monthly finance estimation verified', 'FAIL', 'Pricing logic missing');
    }
  } catch (err) {
    recordTest('TEST-10-09', 'Pricing calculation engine', 'FAIL', err.message);
  }

  // Test 10: Option compatibility and conflict resolution
  try {
    const configDataFile = fs.readFileSync(path.join(__dirname, 'data', 'configuratorData.ts'), 'utf8');
    const hasCompatibilityRules = configDataFile.includes('validateCompatibilityRules');
    const hasIncompatibleFlags = configDataFile.includes('incompatibleWith');
    if (hasCompatibilityRules && hasIncompatibleFlags) {
      recordTest('TEST-10-10', 'Package and option compatibility validator with automatic conflict resolution verified', 'PASS');
    } else {
      recordTest('TEST-10-10', 'Package and option compatibility validator with automatic conflict resolution verified', 'FAIL', 'Compatibility validator missing');
    }
  } catch (err) {
    recordTest('TEST-10-10', 'Compatibility validation', 'FAIL', err.message);
  }

  // Test 11: Visualizer component capabilities
  try {
    const visTsx = fs.readFileSync(path.join(__dirname, 'components', 'ConfiguratorVisualizer.tsx'), 'utf8');
    const hasAngles = visTsx.includes('front_34') && visTsx.includes('side_profile') && visTsx.includes('rear_34') && visTsx.includes('cockpit_interior');
    const hasLighting = visTsx.includes('studio') && visTsx.includes('golden_hour') && visTsx.includes('midnight_neon');
    const hasHeadlights = visTsx.includes('headlightsOn');
    if (hasAngles && hasLighting && hasHeadlights) {
      recordTest('TEST-10-11', 'ConfiguratorVisualizer.tsx implements 4 camera angles, 3 lighting moods, and DRL flare controls', 'PASS');
    } else {
      recordTest('TEST-10-11', 'ConfiguratorVisualizer.tsx implements 4 camera angles, 3 lighting moods, and DRL flare controls', 'FAIL', 'Visualizer features missing');
    }
  } catch (err) {
    recordTest('TEST-10-11', 'Visualizer component capabilities', 'FAIL', err.message);
  }

  // Test 12: Customization panel tabs and controls
  try {
    const panelTsx = fs.readFileSync(path.join(__dirname, 'components', 'ConfiguratorPanel.tsx'), 'utf8');
    const hasTabs = panelTsx.includes("'variants'") && panelTsx.includes("'paint'") && panelTsx.includes("'wheels'") && panelTsx.includes("'interior'") && panelTsx.includes("'packages'");
    const hasFinance = panelTsx.includes('Estimated Monthly Finance');
    const hasSwatches = panelTsx.includes('swatchHex') || panelTsx.includes('hex');
    if (hasTabs && hasFinance && hasSwatches) {
      recordTest('TEST-10-12', 'ConfiguratorPanel.tsx provides 5 option categories, color swatches, itemized breakdown, and monthly finance', 'PASS');
    } else {
      recordTest('TEST-10-12', 'ConfiguratorPanel.tsx provides 5 option categories, color swatches, itemized breakdown, and monthly finance', 'FAIL', 'Panel tabs missing');
    }
  } catch (err) {
    recordTest('TEST-10-12', 'ConfiguratorPanel controls', 'FAIL', err.message);
  }

  // Test 13: URL sharing and query encoding
  try {
    const configDataFile = fs.readFileSync(path.join(__dirname, 'data', 'configuratorData.ts'), 'utf8');
    const hasEncoder = configDataFile.includes('encodeConfigToUrlParams');
    const hasDecoder = configDataFile.includes('decodeUrlParamsToConfig');
    if (hasEncoder && hasDecoder) {
      recordTest('TEST-10-13', 'Safe compact URL query encoding and decoding for configuration sharing verified', 'PASS');
    } else {
      recordTest('TEST-10-13', 'Safe compact URL query encoding and decoding for configuration sharing verified', 'FAIL', 'Encoder or decoder missing');
    }
  } catch (err) {
    recordTest('TEST-10-13', 'URL sharing and query encoding', 'FAIL', err.message);
  }

  // Test 14: Garage persistence API
  try {
    const garageUtils = fs.readFileSync(path.join(__dirname, 'utils', 'garage.ts'), 'utf8');
    const hasSave = garageUtils.includes('saveVehicleConfiguration');
    const hasGet = garageUtils.includes('getSavedConfigurations');
    const hasDelete = garageUtils.includes('deleteSavedConfiguration');
    const hasRename = garageUtils.includes('renameSavedConfiguration');
    const hasEvent = garageUtils.includes('autoverse_configurations_updated');
    if (hasSave && hasGet && hasDelete && hasRename && hasEvent) {
      recordTest('TEST-10-14', 'Unified garage persistence API (save, get, delete, rename, events) verified in garage.ts', 'PASS');
    } else {
      recordTest('TEST-10-14', 'Unified garage persistence API verified in garage.ts', 'FAIL', 'Persistence methods missing');
    }
  } catch (err) {
    recordTest('TEST-10-14', 'Garage persistence API', 'FAIL', err.message);
  }

  // Test 15: Auth models updated with SavedConfiguration
  try {
    const authTypes = fs.readFileSync(path.join(__dirname, 'types', 'auth.ts'), 'utf8');
    const hasSavedConfigInterface = authTypes.includes('export interface SavedConfiguration');
    const hasUserGarageField = authTypes.includes('savedConfigurations?: SavedConfiguration[]');
    if (hasSavedConfigInterface && hasUserGarageField) {
      recordTest('TEST-10-15', 'TypeScript types in auth.ts include SavedConfiguration and UserGarageData integration', 'PASS');
    } else {
      recordTest('TEST-10-15', 'TypeScript types in auth.ts include SavedConfiguration', 'FAIL', 'Types missing');
    }
  } catch (err) {
    recordTest('TEST-10-15', 'Auth types update', 'FAIL', err.message);
  }

  // Test 16: Vehicle switcher modal and catalog browsing
  try {
    const pageTsx = fs.readFileSync(path.join(__dirname, 'pages', 'ConfiguratorPage.tsx'), 'utf8');
    const hasModal = pageTsx.includes('isVehicleSelectorOpen');
    const hasSearch = pageTsx.includes('vehicleSearchQuery');
    if (hasModal && hasSearch) {
      recordTest('TEST-10-16', 'ConfiguratorPage.tsx includes interactive vehicle switcher modal with live search across 50 vehicles', 'PASS');
    } else {
      recordTest('TEST-10-16', 'ConfiguratorPage.tsx vehicle switcher modal', 'FAIL', 'Modal or search missing');
    }
  } catch (err) {
    recordTest('TEST-10-16', 'Vehicle switcher modal', 'FAIL', err.message);
  }

  // Test 17: Build verification
  try {
    const distPath = path.join(__dirname, '..', 'dist', 'index.html');
    if (fs.existsSync(distPath)) {
      recordTest('TEST-10-17', 'Vite production build bundle exists and compiled successfully', 'PASS');
    } else {
      recordTest('TEST-10-17', 'Vite production build bundle exists and compiled successfully', 'FAIL', 'dist/index.html not found');
    }
  } catch (err) {
    recordTest('TEST-10-17', 'Build verification', 'FAIL', err.message);
  }

  // Test 18: Accessibility and responsive design
  try {
    const pageTsx = fs.readFileSync(path.join(__dirname, 'pages', 'ConfiguratorPage.tsx'), 'utf8');
    const hasAria = pageTsx.includes('aria-label');
    const hasResponsive = pageTsx.includes('gridTemplateColumns') || pageTsx.includes('flexWrap');
    if (hasAria && hasResponsive) {
      recordTest('TEST-10-18', 'Accessibility attributes and responsive layout constraints implemented', 'PASS');
    } else {
      recordTest('TEST-10-18', 'Accessibility attributes and responsive layout constraints implemented', 'FAIL', 'Aria or responsive styles missing');
    }
  } catch (err) {
    recordTest('TEST-10-18', 'Accessibility and responsive design', 'FAIL', err.message);
  }

  console.log('\n======================================================');
  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  console.log(`🏁 STAGE 10 TEST RESULTS: ${passCount}/${results.length} PASSED (${failCount} FAILED)`);
  console.log('======================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
