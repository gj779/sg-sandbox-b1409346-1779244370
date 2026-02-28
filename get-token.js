// Script to access environment variable and configure git
const { execSync } = require('child_process');

const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.log('❌ GITHUB_TOKEN not found in environment');
  process.exit(1);
}

console.log(`✅ Token found (${token.length} characters)`);

// Configure git remote with token
const remoteUrl = `https://${token}@github.com/gj779/SoftGen-StaffSpace.git`;

try {
  // Remove existing personal remote if it exists
  try {
    execSync('git remote remove personal', { stdio: 'ignore' });
  } catch (e) {
    // Ignore if it doesn't exist
  }
  
  // Add new remote with authentication
  execSync(`git remote add personal ${remoteUrl}`, { stdio: 'inherit' });
  console.log('✅ Git remote configured with authentication');
  
  // Verify
  execSync('git remote -v', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Error configuring git remote:', error.message);
  process.exit(1);
}