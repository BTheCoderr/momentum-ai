#!/usr/bin/env node

/**
 * Production Build Script for Momentum AI
 * 
 * This script builds production-ready versions of the app for iOS and Android
 * using Expo Application Services (EAS).
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Momentum AI Production Build Script');
console.log('=====================================\n');

// Check if EAS CLI is installed
try {
  execSync('npx eas --version', { stdio: 'ignore' });
  console.log('✅ EAS CLI is available');
} catch (error) {
  console.log('❌ EAS CLI not found. Installing...');
  execSync('npm install -g eas-cli', { stdio: 'inherit' });
}

// Verify project configuration
console.log('\n📋 Verifying project configuration...');

const appConfig = require('../app.config.js');
console.log(`✅ App Name: ${appConfig.name}`);
console.log(`✅ Slug: ${appConfig.slug}`);
console.log(`✅ Version: ${appConfig.version}`);
console.log(`✅ iOS Bundle ID: ${appConfig.ios.bundleIdentifier}`);
console.log(`✅ Android Package: ${appConfig.android.package}`);

// Check EAS configuration
const easConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../eas.json'), 'utf8'));
console.log(`✅ EAS Project ID: ${appConfig.extra.eas.projectId}`);

console.log('\n🔧 Build Profiles Available:');
Object.keys(easConfig.build).forEach(profile => {
  console.log(`  - ${profile}`);
});

// Build commands
console.log('\n📱 Production Build Commands:');
console.log('===============================');

console.log('\n🍎 iOS Production Build:');
console.log('npx eas build --platform ios --profile production');
console.log('  - Creates production IPA for App Store submission');
console.log('  - Auto-increments build number');
console.log('  - Uses m-medium resource class');

console.log('\n🤖 Android Production Build:');
console.log('npx eas build --platform android --profile production');
console.log('  - Creates production AAB for Google Play Store');
console.log('  - Auto-increments version code');
console.log('  - Optimized for store distribution');

console.log('\n🔄 Both Platforms:');
console.log('npx eas build --platform all --profile production');
console.log('  - Builds for both iOS and Android simultaneously');

console.log('\n📦 Preview Builds (for testing):');
console.log('npx eas build --platform ios --profile preview');
console.log('npx eas build --platform android --profile preview');
console.log('  - Creates internal distribution builds');
console.log('  - Faster build times');
console.log('  - Good for testing before production');

console.log('\n🚀 Submission Commands:');
console.log('========================');
console.log('npx eas submit --platform ios');
console.log('npx eas submit --platform android');

console.log('\n📋 Pre-Build Checklist:');
console.log('========================');
console.log('□ Update version in app.config.js');
console.log('□ Test app thoroughly on devices');
console.log('□ Verify all API endpoints work');
console.log('□ Check app icons and splash screens');
console.log('□ Review app store metadata');
console.log('□ Ensure certificates are valid');

console.log('\n💡 Next Steps:');
console.log('==============');
console.log('1. Run: npx eas build --platform all --profile production');
console.log('2. Wait for builds to complete (~10-20 minutes)');
console.log('3. Download and test builds');
console.log('4. Submit to app stores when ready');

console.log('\n✨ Build script ready! Run the commands above to create production builds.'); 