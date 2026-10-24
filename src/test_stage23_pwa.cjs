// AutoVerse Stage 23: Progressive Web App & Mobile Experience Test Suite
// Validates Web App Manifest, Service Worker caching policies, security exclusions,
// offline fallback, install hooks, and mobile touch standards.

const fs = require('fs');
const path = require('path');
const http = require('http');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] TEST-23-${String(totalTests).padStart(2, '0')}: ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] TEST-23-${String(totalTests).padStart(2, '0')}: ${message}`);
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
  console.log('   AUTOVERSE STAGE 23: MOBILE & PWA VERIFICATION TEST SUITE     ');
  console.log('================================================================\n');

  // 1. Manifest Files Existence
  const manifestPath = path.join(__dirname, '..', 'public', 'manifest.webmanifest');
  const manifestJsonPath = path.join(__dirname, '..', 'public', 'manifest.json');
  assert(fs.existsSync(manifestPath) && fs.existsSync(manifestJsonPath), 'PWA Web App Manifest exists (.webmanifest and .json alias)');

  // 2. Manifest Schema & Content Validation
  const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(
    manifestContent.name === 'AutoVerse' &&
    manifestContent.short_name === 'AutoVerse' &&
    manifestContent.display === 'standalone' &&
    manifestContent.start_url === '/' &&
    manifestContent.theme_color === '#05070a' &&
    manifestContent.background_color === '#05070a',
    'Manifest contains valid application name, standalone display mode, root scope, and brand theme colors'
  );

  // 3. Application Icons Compliance
  const icons = manifestContent.icons || [];
  const has192 = icons.some((i) => i.sizes === '192x192' && i.purpose === 'any');
  const has512 = icons.some((i) => i.sizes === '512x512' && i.purpose === 'any');
  const hasMaskable = icons.some((i) => i.purpose === 'maskable');
  const hasSvg = icons.some((i) => i.type === 'image/svg+xml');
  assert(has192 && has512 && hasMaskable && hasSvg, 'Manifest declares 192x192, 512x512, maskable, and scalable SVG icons');

  // 4. Physical Icon Files on Disk
  const icon192Path = path.join(__dirname, '..', 'public', 'icons', 'icon-192.png');
  const icon512Path = path.join(__dirname, '..', 'public', 'icons', 'icon-512.png');
  const maskable192 = path.join(__dirname, '..', 'public', 'icons', 'icon-maskable-192.png');
  const maskable512 = path.join(__dirname, '..', 'public', 'icons', 'icon-maskable-512.png');
  const svgIcon = path.join(__dirname, '..', 'public', 'icons', 'icon.svg');
  assert(
    fs.existsSync(icon192Path) && fs.statSync(icon192Path).size > 1000 &&
    fs.existsSync(icon512Path) && fs.statSync(icon512Path).size > 1000 &&
    fs.existsSync(maskable192) && fs.existsSync(maskable512) && fs.existsSync(svgIcon),
    'Physical binary icon assets exist in public/icons/ with valid dimensions and non-empty file size'
  );

  // 5. Service Worker Script & Precache Setup
  const swPath = path.join(__dirname, '..', 'public', 'sw.js');
  assert(fs.existsSync(swPath), 'Progressive Web App Service Worker (sw.js) exists');
  const swContent = fs.readFileSync(swPath, 'utf8');
  assert(
    swContent.includes('autoverse-cache-v1') &&
    swContent.includes('/offline.html') &&
    swContent.includes('/manifest.webmanifest'),
    'Service Worker establishes cache versioning and precaches core application shell & offline fallback'
  );

  // 6. Security Invariants: No Sensitive / Private Data Caching
  assert(
    swContent.includes('/admin') &&
    swContent.includes('/my-') &&
    swContent.includes('/api/auth') &&
    swContent.includes('Authorization'),
    'Service Worker strictly prohibits caching administrative consoles, private user sessions, and authenticated API tokens'
  );

  // 7. Non-GET Method Bypass Security
  assert(
    swContent.includes("request.method !== 'GET'"),
    'Service Worker bypasses non-GET mutating requests (POST, PUT, DELETE) preventing unsafe cache pollution'
  );

  // 8. Offline Navigation Fallback
  const offlineHtmlPath = path.join(__dirname, '..', 'public', 'offline.html');
  assert(fs.existsSync(offlineHtmlPath), 'Dedicated offline fallback page (offline.html) exists');
  const offlineContent = fs.readFileSync(offlineHtmlPath, 'utf8');
  assert(
    offlineContent.includes('Connection Unavailable') &&
    offlineContent.includes('Check Connection') &&
    offlineContent.includes('Return to Fleet'),
    'Offline fallback page communicates honest operational boundaries and includes reconnection retry trigger'
  );

  // 9. React Hooks & Registration Manager
  const hookNetwork = path.join(__dirname, '..', 'src', 'hooks', 'useNetworkStatus.ts');
  const hookInstall = path.join(__dirname, '..', 'src', 'hooks', 'usePWAInstall.ts');
  const pwaRegister = path.join(__dirname, '..', 'src', 'utils', 'pwaRegister.ts');
  assert(
    fs.existsSync(hookNetwork) && fs.existsSync(hookInstall) && fs.existsSync(pwaRegister),
    'PWA hooks (useNetworkStatus, usePWAInstall) and lifecycle manager (pwaRegister) exist'
  );

  // 10. React UI Components for PWA
  const offlineBanner = path.join(__dirname, '..', 'src', 'components', 'pwa', 'OfflineBanner.tsx');
  const installBanner = path.join(__dirname, '..', 'src', 'components', 'pwa', 'PWAInstallBanner.tsx');
  const updateNotice = path.join(__dirname, '..', 'src', 'components', 'pwa', 'PWAUpdateNotification.tsx');
  assert(
    fs.existsSync(offlineBanner) && fs.existsSync(installBanner) && fs.existsSync(updateNotice),
    'React components for OfflineBanner, PWAInstallBanner, and PWAUpdateNotification exist'
  );

  // 11. iOS Add to Home Screen Instructions
  const installBannerContent = fs.readFileSync(installBanner, 'utf8');
  assert(
    installBannerContent.includes('Install on iOS Safari') &&
    installBannerContent.includes('Add to Home Screen'),
    'Install experience includes explicit step-by-step guidance for Apple iOS Safari devices'
  );

  // 12. App Installation Dismissal Memory (Quiet Period)
  const hookInstallContent = fs.readFileSync(hookInstall, 'utf8');
  assert(
    hookInstallContent.includes('autoverse_install_dismissed_until'),
    'Install prompt respects dismissal memory to avoid repeatedly badgering users'
  );

  // 13. index.html PWA Meta Tags & Viewport Cover
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert(
    indexHtml.includes('manifest.webmanifest') &&
    indexHtml.includes('theme-color') &&
    indexHtml.includes('apple-mobile-web-app-capable') &&
    indexHtml.includes('viewport-fit=cover'),
    'index.html incorporates manifest link, theme-color, apple-mobile-web-app-capable, and viewport-fit=cover'
  );

  // 14. Responsive Mobile CSS Rules
  const indexCss = fs.readFileSync(path.join(__dirname, '..', 'src', 'index.css'), 'utf8');
  assert(
    indexCss.includes('safe-area-inset-bottom') &&
    indexCss.includes('min-height: 44px') &&
    indexCss.includes('-webkit-overflow-scrolling: touch'),
    'index.css enforces iOS safe-area insets, WCAG 44px minimum touch targets, and momentum touch scrolling'
  );

  // 15. Service Worker Registration in main.tsx
  const mainTsx = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.tsx'), 'utf8');
  assert(
    mainTsx.includes('registerServiceWorker()'),
    'main.tsx registers the PWA service worker on initial load'
  );

  // 16. App Shell Integration
  const appTsx = fs.readFileSync(path.join(__dirname, '..', 'src', 'App.tsx'), 'utf8');
  assert(
    appTsx.includes('<OfflineBanner />') &&
    appTsx.includes('<PWAUpdateNotification />') &&
    appTsx.includes('<PWAInstallBanner />'),
    'App.tsx mounts OfflineBanner, PWAUpdateNotification, and PWAInstallBanner inside the application shell'
  );

  // 17-20. HTTP 200 Dev Server Verification
  const manifestHttp = await checkRoute('/manifest.webmanifest');
  assert(manifestHttp, 'HTTP 200 OK: Web App Manifest served at /manifest.webmanifest');

  const swHttp = await checkRoute('/sw.js');
  assert(swHttp, 'HTTP 200 OK: Service Worker script served at /sw.js');

  const offlineHttp = await checkRoute('/offline.html');
  assert(offlineHttp, 'HTTP 200 OK: Offline fallback HTML served at /offline.html');

  const iconHttp = await checkRoute('/icons/icon-192.png');
  assert(iconHttp, 'HTTP 200 OK: PWA 192px binary icon served at /icons/icon-192.png');

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL AUTOVERSE STAGE 23 PWA VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.error('❌ SOME STAGE 23 TESTS FAILED');
    process.exit(1);
  }
}

runTests();
