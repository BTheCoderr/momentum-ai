#!/usr/bin/env node

/**
 * App Store Readiness Test Script
 * Tests all critical functionality before App Store submission
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing App Store Readiness...\n');

// Test 1: Check app.json configuration
function testAppConfig() {
  console.log('1️⃣ Testing app.json configuration...');
  
  try {
    const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    const expo = appConfig.expo;
    
    const checks = [
      { name: 'App name', value: expo.name, expected: 'Momentum AI' },
      { name: 'Bundle ID (iOS)', value: expo.ios?.bundleIdentifier, expected: 'com.momentumai.app' },
      { name: 'Package (Android)', value: expo.android?.package, expected: 'com.momentumai.app' },
      { name: 'Version', value: expo.version, expected: '1.0.0' },
      { name: 'Build number', value: expo.ios?.buildNumber, expected: '1' },
      { name: 'Version code', value: expo.android?.versionCode, expected: 1 },
    ];
    
    let passed = 0;
    checks.forEach(check => {
      if (check.value === check.expected) {
        console.log(`   ✅ ${check.name}: ${check.value}`);
        passed++;
      } else {
        console.log(`   ❌ ${check.name}: ${check.value} (expected: ${check.expected})`);
      }
    });
    
    console.log(`   Result: ${passed}/${checks.length} checks passed\n`);
    return passed === checks.length;
  } catch (error) {
    console.log(`   ❌ Error reading app.json: ${error.message}\n`);
    return false;
  }
}

// Test 2: Check for required assets
function testAssets() {
  console.log('2️⃣ Testing required assets...');
  
  const requiredAssets = [
    'assets/icon.png',
    'assets/splash.png',
    'assets/adaptive-icon.png',
    'assets/favicon.png'
  ];
  
  let passed = 0;
  requiredAssets.forEach(asset => {
    if (fs.existsSync(asset)) {
      console.log(`   ✅ ${asset} exists`);
      passed++;
    } else {
      console.log(`   ❌ ${asset} missing`);
    }
  });
  
  console.log(`   Result: ${passed}/${requiredAssets.length} assets found\n`);
  return passed === requiredAssets.length;
}

// Test 3: Check for production optimizations
function testProductionOptimizations() {
  console.log('3️⃣ Testing production optimizations...');
  
  const checks = [];
  
  // Check babel config
  if (fs.existsSync('babel.config.js')) {
    const babelConfig = fs.readFileSync('babel.config.js', 'utf8');
    if (babelConfig.includes('transform-remove-console') && babelConfig.includes('babel-preset-expo')) {
      console.log('   ✅ Console.log removal configured with Expo preset');
      checks.push(true);
    } else if (babelConfig.includes('babel-preset-expo')) {
      console.log('   ✅ Babel configured correctly for Expo');
      checks.push(true);
    } else {
      console.log('   ❌ Babel configuration issues detected');
      checks.push(false);
    }
  } else {
    console.log('   ❌ babel.config.js not found');
    checks.push(false);
  }
  
  // Check package.json for production dependencies
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.devDependencies && packageJson.devDependencies['babel-plugin-transform-remove-console']) {
      console.log('   ✅ Console removal plugin installed');
      checks.push(true);
    } else {
      console.log('   ❌ Console removal plugin not installed');
      checks.push(false);
    }
  }
  
  const passed = checks.filter(Boolean).length;
  console.log(`   Result: ${passed}/${checks.length} optimizations configured\n`);
  return passed === checks.length;
}

// Test 4: Check critical files exist
function testCriticalFiles() {
  console.log('4️⃣ Testing critical files...');
  
  const criticalFiles = [
    'App.tsx',
    'src/hooks/useAuth.tsx',
    'src/screens/HomeScreen.tsx',
    'src/screens/GoalsScreen.tsx',
    'src/screens/ChatScreen.tsx',
    'src/screens/ProfileScreen.tsx',
    'src/api/services.ts',
    'app-store-checklist.md'
  ];
  
  let passed = 0;
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file} exists`);
      passed++;
    } else {
      console.log(`   ❌ ${file} missing`);
    }
  });
  
  console.log(`   Result: ${passed}/${criticalFiles.length} critical files found\n`);
  return passed === criticalFiles.length;
}

// Test 5: Check for sensitive data exposure
function testSensitiveData() {
  console.log('5️⃣ Testing for sensitive data exposure...');
  
  const sensitivePatterns = [
    /password\s*=\s*["'][^"']+["']/gi,
    /secret\s*=\s*["'][^"']+["']/gi,
    /private.*key/gi,
    /api.*key.*=.*["'][^"']+["']/gi
  ];
  
  const filesToCheck = [
    'App.tsx',
    'src/api/services.ts',
    'src/lib/supabase.ts'
  ];
  
  let issues = 0;
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      sensitivePatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          console.log(`   ⚠️  Potential sensitive data in ${file}: ${matches[0]}`);
          issues++;
        }
      });
    }
  });
  
  if (issues === 0) {
    console.log('   ✅ No obvious sensitive data exposure found');
  }
  
  console.log(`   Result: ${issues} potential issues found\n`);
  return issues === 0;
}

// Run all tests
async function runAllTests() {
  const results = [
    testAppConfig(),
    testAssets(),
    testProductionOptimizations(),
    testCriticalFiles(),
    testSensitiveData()
  ];
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Tests passed: ${passed}/${total}`);
  console.log(`App Store readiness: ${Math.round((passed/total) * 100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your app is ready for App Store submission.');
    console.log('\nNext steps:');
    console.log('1. Generate app icons and screenshots');
    console.log('2. Test on physical devices');
    console.log('3. Create App Store Connect listing');
    console.log('4. Submit for review');
  } else {
    console.log('\n⚠️  Some tests failed. Please address the issues above before submitting.');
  }
  
  console.log('\n📋 See app-store-checklist.md for complete preparation guide.');
}

// Run the tests
runAllTests().catch(console.error); 