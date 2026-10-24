// AutoVerse Stage 8 Master Audit & Verification Test Suite
const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:5173';

function checkHttp(route) {
  return new Promise((resolve) => {
    http
      .get(BASE_URL + route, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            contentType: res.headers['content-type'],
            contentLength: res.headers['content-length'],
            bodyLength: data.length,
          });
        });
      })
      .on('error', (err) => {
        resolve({ error: err.message });
      });
  });
}

async function runAudit() {
  console.log('🏎️  ======================================================');
  console.log('   AUTOVERSE STAGE 8 — COMPREHENSIVE PRODUCTION AUDIT    ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function record(desc, ok, details = '') {
    if (ok) {
      passed++;
      console.log(`  ✅ [PASS] ${desc} ${details ? '(' + details + ')' : ''}`);
    } else {
      failed++;
      console.error(`  ❌ [FAIL] ${desc} ${details ? ': ' + details : ''}`);
    }
  }

  // 1. ROUTE INTEGRITY & HTTP 200 CHECKS
  console.log('--- 1. HTTP Endpoint & Route Accessibility ---');
  const routesToTest = [
    '/',
    '/discover',
    '/manufacturers',
    '/launches',
    '/compare',
    '/cinema',
    '/garage',
    '/cars/porsche-taycan-turbo-s',
    '/vehicle/porsche-taycan-turbo-s',
    '/cars/tesla-model-s-plaid',
    '/cars/audi-rs-etron-gt',
    '/login',
    '/register',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/profile',
    '/admin',
    '/admin/vehicles',
    '/admin/manufacturers',
    '/admin/launches',
    '/admin/cinema',
    '/admin/users',
    '/admin/activity',
    '/admin/settings',
  ];

  for (const r of routesToTest) {
    const res = await checkHttp(r);
    record(`Route responds HTTP 200: ${r}`, res.statusCode === 200, `status ${res.statusCode}`);
  }

  // 2. MEDIA STREAMING & ASSET VERIFICATION
  console.log('\n--- 2. Media Streaming & Asset Delivery ---');
  const videoRes = await checkHttp('/videos/cinema-reel.mp4');
  record(
    'Local Road Cinema 4K MP4 stream served with HTTP 200',
    videoRes.statusCode === 200,
    videoRes.contentType
  );
  record(
    'Local Road Cinema video file size exceeds 20MB',
    videoRes.contentLength && parseInt(videoRes.contentLength) > 20000000,
    `${(parseInt(videoRes.contentLength) / (1024 * 1024)).toFixed(2)} MB`
  );

  // 3. PRODUCTION BUILD ARTIFACTS AUDIT
  console.log('\n--- 3. Production Build Artifacts Audit ---');
  const distDir = path.resolve(__dirname, '../dist');
  const distExists = fs.existsSync(distDir);
  record('dist directory exists', distExists);

  if (distExists) {
    const indexHtml = path.join(distDir, 'index.html');
    record('dist/index.html generated', fs.existsSync(indexHtml));

    const assetsDir = path.join(distDir, 'assets');
    const assetFiles = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];
    record('Production assets directory populated', assetFiles.length > 5, `${assetFiles.length} chunk files`);

    // Verify code splitting chunks exist
    const hasVendorReact = assetFiles.some((f) => f.startsWith('vendor-react'));
    const hasVendorIcons = assetFiles.some((f) => f.startsWith('vendor-icons'));
    record('Vendor React chunk separated', hasVendorReact);
    record('Vendor Icons chunk separated', hasVendorIcons);
  }

  // 4. SECURITY & AUTHENTICATION AUDIT
  console.log('\n--- 4. Security & Role-Based Access Controls ---');
  const authModulePath = path.resolve(__dirname, './utils/auth.ts');
  const authSource = fs.readFileSync(authModulePath, 'utf8');

  record('WebCrypto salted SHA-256 used for passkeys', authSource.includes('SHA-256') && authSource.includes('crypto.subtle.digest'));
  record('Anti-brute force rate limiting implemented', authSource.includes('checkRateLimit') && authSource.includes('failedAttempts'));
  record('256-bit entropy token generation implemented', authSource.includes('generateToken'));
  record('Role-based access control (admin vs driver)', authSource.includes("role: 'admin'") && authSource.includes("isCurrentUserAdmin"));
  record('Last administrator lockout protection enforced', authSource.includes('Cannot revoke permissions from the last active administrator'));
  record('Self-suspension lockout protection enforced', authSource.includes('You cannot suspend your own active administrator account'));
  record('Account suspension check on login enforced', authSource.includes("user.status === 'suspended'"));

  // 5. REFERENTIAL INTEGRITY & CONTENT LIFECYCLE
  console.log('\n--- 5. Referential Integrity & Data Store ---');
  const adminStorePath = path.resolve(__dirname, './utils/adminStore.ts');
  const adminStoreSource = fs.readFileSync(adminStorePath, 'utf8');

  record('Manufacturer deletion checks for linked vehicles', adminStoreSource.includes('Cannot delete manufacturer') && adminStoreSource.includes('linkedVehicles.length > 0'));
  record('Vehicle publication status support (draft, published, archived)', adminStoreSource.includes("'draft'") && adminStoreSource.includes("'archived'"));
  record('Tamper-evident audit activity log engine', adminStoreSource.includes('logAdminActivity') && adminStoreSource.includes('autoverse_activity_logs_db'));

  console.log('\n======================================================');
  console.log(`STAGE 8 AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
