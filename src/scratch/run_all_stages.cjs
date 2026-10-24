// AutoVerse Master Stage: Comprehensive Multi-Stage Automated Verification Runner
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const testFiles = [
  'test_stage2_routes.cjs',
  'test_stage3_verification.cjs',
  'test_stage4_comparison.cjs',
  'test_stage5_cinema.cjs',
  'test_stage6_auth.cjs',
  'test_stage7_admin.cjs',
  'test_stage8_audit.cjs',
  'test_stage9_car_finder.cjs',
  'test_stage9_top50_safety.cjs',
  'test_stage10_configurator.cjs',
  'test_stage11_ownership.cjs',
  'test_stage12_calculator.cjs',
  'test_stage13_editorial.cjs',
  'test_stage14_community.cjs',
  'test_stage15_assistant.cjs',
  'test_stage16_trip_planner.cjs',
  'test_stage17_safety.cjs',
  'test_stage18_market_intelligence.cjs',
  'test_stage19_dashboard.cjs',
  'test_stage20_dealers.cjs',
  'test_stage21_marketplace.cjs',
  'test_stage22_financing.cjs',
  'test_stage23_pwa.cjs',
  'test_stage24_analytics.cjs',
];

console.log('================================================================');
console.log('      AUTOVERSE MASTER STAGE: COMPREHENSIVE SUITE AUDIT         ');
console.log('================================================================\n');

const results = [];

for (const file of testFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    results.push({ file, status: 'MISSING', error: 'File not found' });
    continue;
  }

  process.stdout.write(`Running ${file.padEnd(36)} ... `);
  try {
    const output = execSync(`node "${filePath}"`, {
      cwd: path.join(__dirname, '..', '..'),
      timeout: 25000,
      encoding: 'utf8',
    });
    
    // Parse pass/fail counts if present
    const passMatch = output.match(/PASSED:\s*(\d+)/i) || output.match(/(\d+)\s+passed/i);
    const failMatch = output.match(/FAILED:\s*(\d+)/i) || output.match(/(\d+)\s+failed/i);
    const totalMatch = output.match(/TOTAL\s+(?:TESTS|CHECKS):\s*(\d+)/i);

    const passed = passMatch ? parseInt(passMatch[1], 10) : 'OK';
    const failed = failMatch ? parseInt(failMatch[1], 10) : 0;
    const total = totalMatch ? parseInt(totalMatch[1], 10) : passed;

    if (failed > 0) {
      console.log(`❌ FAIL (${failed} failed, ${passed} passed)`);
      results.push({ file, status: 'FAIL', passed, failed, total, output });
    } else {
      console.log(`✅ PASS (${passed} checks)`);
      results.push({ file, status: 'PASS', passed, failed: 0, total });
    }
  } catch (err) {
    console.log(`❌ CRASH / EXIT CODE ${err.status}`);
    results.push({ file, status: 'ERROR', error: err.message, stdout: err.stdout, stderr: err.stderr });
  }
}

console.log('\n================================================================');
console.log('                     AUDIT SUMMARY TABLE                        ');
console.log('================================================================');
let allPassed = true;
let totalPassedCount = 0;
let totalFailedCount = 0;

for (const r of results) {
  if (r.status === 'PASS') {
    if (typeof r.passed === 'number') totalPassedCount += r.passed;
    console.log(`  [PASS] ${r.file}`);
  } else {
    allPassed = false;
    if (typeof r.failed === 'number') totalFailedCount += r.failed;
    console.log(`  [${r.status}] ${r.file} - ${r.error || (r.failed + ' failed')}`);
    if (r.stderr) console.log(`         STDERR: ${r.stderr.slice(0, 200)}`);
  }
}

console.log('================================================================');
console.log(`OVERALL STATUS: ${allPassed ? 'ALL STAGES OPERATIONAL 🎉' : 'REGRESSIONS DETECTED ⚠️'}`);
console.log(`TOTAL CHECKS RECORDED: ${totalPassedCount} Passed | ${totalFailedCount} Failed`);
console.log('================================================================\n');
