const { execSync } = require('child_process');

const message = process.argv.slice(2).join(' ') || 'chore: update platform features and assets';

console.log('🚀 [AutoVerse Pipeline] Starting pre-flight verification & deployment push...\n');

try {
  console.log('1️⃣  Step 1: Running TypeScript & Vite production build check...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Production build verified cleanly!\n');

  console.log('2️⃣  Step 2: Checking Git staging status...');
  execSync('git add -A', { stdio: 'inherit' });
  
  const status = execSync('git status --porcelain').toString().trim();
  if (status) {
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    console.log(`✅ Committed changes: "${message}"\n`);
  } else {
    console.log('ℹ️  Working tree is already clean. No new changes to commit.\n');
  }

  console.log('3️⃣  Step 3: Pushing commit to GitHub repository (origin main)...');
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ Successfully synchronized with GitHub main branch!\n');

  console.log('🌐 ==============================================================');
  console.log('🎉 [Vercel Continuous Deployment Triggered]');
  console.log('   Vercel automatically detects this push to main and rebuilds');
  console.log('   your production website in ~30 seconds!');
  console.log('   - Vercel Dashboard:   https://vercel.com/dashboard');
  console.log('   - Supabase Console:   https://supabase.com/dashboard');
  console.log('   - GitHub Repository:  https://github.com/MOHANKOTHAMASU/Autoverse-Cinematic-car-vault-');
  console.log('=================================================================\n');

} catch (err) {
  console.error('\n❌ Pipeline stopped with error:', err.message);
  process.exit(1);
}
