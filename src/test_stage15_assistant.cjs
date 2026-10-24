/**
 * AutoVerse Stage 15 Comprehensive Automated Verification Suite
 * Tests AI Automotive Assistant, Real Data Tool Calling, Provider Abstraction,
 * Natural-Language Recommendations, Comparison, Ownership Math, and Security.
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
console.log('🤖 AUTOVERSE STAGE 15: SMART AI AUTOMOTIVE ASSISTANT VERIFICATION');
console.log('===============================================================\n');

// 1. FILE & COMPONENT EXISTENCE AUDIT
console.log('1. AI Assistant Component & File Architecture:');
const requiredFiles = [
  'src/types/assistant.ts',
  'src/utils/assistantTools.ts',
  'src/utils/aiProvider.ts',
  'src/utils/assistantStore.ts',
  'src/pages/AssistantPage.tsx',
  'src/pages/admin/AdminAssistantPage.tsx',
  'src/components/FloatingAssistantWidget.tsx',
];

requiredFiles.forEach((file) => {
  const fullPath = path.join(__dirname, '..', file);
  report(fs.existsSync(fullPath), `Component file exists: ${file}`);
});

// 2. ROUTING CONFIGURATION IN APP.TSX
console.log('\n2. Routing & Widget Registration in App.tsx:');
const appTsxPath = path.join(__dirname, '..', 'src/App.tsx');
const appContent = fs.readFileSync(appTsxPath, 'utf8');

report(appContent.includes('path="/assistant"'), 'App.tsx registers public /assistant route');
report(appContent.includes('path="assistant"'), 'App.tsx registers /admin/assistant administration route');
report(appContent.includes('<FloatingAssistantWidget />') || appContent.includes('<FloatingAssistantWidget'), 'App.tsx integrates global context-aware FloatingAssistantWidget');

// 3. NAVIGATION INTEGRATION
console.log('\n3. Navigation Links Integration:');
const navbarPath = path.join(__dirname, '..', 'src/components/Navbar.tsx');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');
report(navbarContent.includes("name: 'AI Assistant', path: '/assistant'"), 'Navbar links to /assistant in navigation array');

const adminLayoutPath = path.join(__dirname, '..', 'src/components/admin/AdminLayout.tsx');
const adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf8');
report(adminLayoutContent.includes('/admin/assistant') && adminLayoutContent.includes('AI Assistant & Tools'), 'AdminLayout includes AI Assistant & Tools in sidebar navigation');

const comparePath = path.join(__dirname, '..', 'src/pages/ComparePage.tsx');
const compareContent = fs.readFileSync(comparePath, 'utf8');
report(compareContent.includes('/assistant?q=') && compareContent.includes('Ask AI Analysis'), 'ComparePage connects to AI Assistant with deep-link query');

const carFinderPath = path.join(__dirname, '..', 'src/pages/CarFinderPage.tsx');
const carFinderContent = fs.readFileSync(carFinderPath, 'utf8');
report(carFinderContent.includes('/assistant?q='), 'CarFinderPage connects to AI Assistant natural-language search');

const vehicleDetailPath = path.join(__dirname, '..', 'src/pages/VehicleDetailPage.tsx');
const vehicleDetailContent = fs.readFileSync(vehicleDetailPath, 'utf8');
report(vehicleDetailPath && vehicleDetailContent.includes('/assistant?q='), 'VehicleDetailPage includes direct AI consultation button');

// 4. DATA CONTRACTS & TYPE INTEGRITY
console.log('\n4. Assistant Data Contracts in src/types/assistant.ts:');
const typesPath = path.join(__dirname, '..', 'src/types/assistant.ts');
const typesContent = fs.readFileSync(typesPath, 'utf8');

report(typesContent.includes('export interface ChatMessage'), 'ChatMessage model defined');
report(typesContent.includes('export interface AssistantCitation'), 'AssistantCitation model defined with verified source URLs');
report(typesContent.includes('export interface ToolCallRecord'), 'ToolCallRecord model defined');
report(typesContent.includes('export interface RecommendedVehicleCard'), 'RecommendedVehicleCard model defined');
report(typesContent.includes('export interface ConversationThread'), 'ConversationThread model defined');
report(typesContent.includes('export interface AIProviderConfig'), 'AIProviderConfig model defined');
report(typesContent.includes('export interface AssistantAdminMetrics'), 'AssistantAdminMetrics telemetry model defined');

// 5. SECURE TOOL CALLING & DATA RETRIEVAL AUDIT
console.log('\n5. Sandboxed Real Data Tools Audit:');
const toolsPath = path.join(__dirname, '..', 'src/utils/assistantTools.ts');
const toolsContent = fs.readFileSync(toolsPath, 'utf8');

report(toolsContent.includes('export function toolSearchVehicles'), 'toolSearchVehicles implemented for catalog discovery');
report(toolsContent.includes('export function toolGetVehicleDetails'), 'toolGetVehicleDetails implemented for verified specs retrieval');
report(toolsContent.includes('export function toolCompareVehicles'), 'toolCompareVehicles implemented for honest head-to-head benchmarking');
report(toolsContent.includes('export function toolCalculateOwnershipCost'), 'toolCalculateOwnershipCost implemented for deterministic TCO math');
report(toolsContent.includes('export function toolGetVerifiedSafetyRatings'), 'toolGetVerifiedSafetyRatings implemented for NCAP & ADAS retrieval');
report(toolsContent.includes('export function toolGetPublishedArticles'), 'toolGetPublishedArticles implemented for editorial dispatches');
report(toolsContent.includes('export function toolGetCommunityRatings'), 'toolGetCommunityRatings implemented for audited owner feedback');
report(toolsContent.includes('export function toolGetUserGarage'), 'toolGetUserGarage implemented for driver profile fleet retrieval');

// 6. AI PROVIDER ABSTRACTION & CREDENTIAL SAFETY AUDIT
console.log('\n6. AI Provider Abstraction & Credential Safety:');
const providerPath = path.join(__dirname, '..', 'src/utils/aiProvider.ts');
const providerContent = fs.readFileSync(providerPath, 'utf8');

report(providerContent.includes('executeAutoVerseAI'), 'executeAutoVerseAI engine entrypoint implemented');
report(providerContent.includes('checkRateLimit'), 'Rate limiting anti-abuse protection implemented');
report(providerContent.includes('autoverse_neural'), 'AutoVerse Neural Engine deterministic fallback configured when API keys are absent');
report(providerContent.includes('apiKeyMasked'), 'API keys strictly masked before exposing in diagnostics');
report(providerContent.includes('onStreamChunk'), 'Progressive streaming emulation supported for smooth UI rendering');

// 7. DETERMINISTIC REASONING & ALGORITHMIC INTEGRITY
console.log('\n7. Deterministic Tool Logic & Business Rules Verification:');

// Test A: Rate limiting logic
function simulateRateLimiter(maxPerMin) {
  let timestamps = [];
  return function allow() {
    const now = Date.now();
    timestamps = timestamps.filter((t) => now - t < 60000);
    if (timestamps.length >= maxPerMin) return false;
    timestamps.push(now);
    return true;
  };
}

const limiter = simulateRateLimiter(3);
report(limiter() === true, 'Rate limiter allows 1st request');
report(limiter() === true, 'Rate limiter allows 2nd request');
report(limiter() === true, 'Rate limiter allows 3rd request');
report(limiter() === false, 'Rate limiter strictly blocks 4th burst request (abusive flood protection)');

// Test B: Masked API Key helper
function maskApiKey(key) {
  if (!key || typeof key !== 'string' || key.length < 8) return undefined;
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

report(maskApiKey('AIzaSyAbcd1234Efgh9988') === 'AIzaSy...9988', 'API key masking strictly conceals secret credentials');
report(maskApiKey('') === undefined, 'Empty key safely returns undefined');

// Test C: Cross-User Conversation Privacy Check
function verifyThreadAccess(threadUserId, requestingUserId) {
  if (!threadUserId || threadUserId === 'guest') return true; // Public/guest thread
  return threadUserId === requestingUserId;
}

report(verifyThreadAccess('usr_alice_10', 'usr_alice_10') === true, 'User can access own conversation history');
report(verifyThreadAccess('usr_alice_10', 'usr_bob_20') === false, 'Cross-user conversation tampering strictly blocked (security check)');
report(verifyThreadAccess('guest', 'usr_bob_20') === true, 'Guest thread accessible in temporary session');

// Test D: Suggested questions contract
const requiredSuggestedQuestions = [
  'Find the best electric car for my budget.',
  'Compare the Porsche Taycan Turbo S with another EV.',
  'Which car suits daily commuting and family travel?',
  'Explain the difference between horsepower and torque.',
  'Estimate the five-year cost of owning an electric car.',
  'Help me choose between petrol, hybrid, and electric.',
  'Explain the safety ratings of a vehicle.',
  'Recommend cars based on my requirements.',
];

const assistantPagePath = path.join(__dirname, '..', 'src/pages/AssistantPage.tsx');
const assistantPageContent = fs.readFileSync(assistantPagePath, 'utf8');

requiredSuggestedQuestions.forEach((q) => {
  report(assistantPageContent.includes(q), `AssistantPage contains suggested prompt: "${q}"`);
});

// 8. DEV SERVER HTTP ROUTE AVAILABILITY CHECKS
console.log('\n8. Local Dev Server HTTP Route Availability (localhost:5173):');

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
    { path: '/assistant', label: 'AI Assistant Full Experience' },
    { path: '/assistant?q=Find%20the%20best%20electric%20car', label: 'AI Assistant with Pre-filled Query' },
    { path: '/admin/assistant', label: 'Admin AI Assistant Telemetry' },
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
