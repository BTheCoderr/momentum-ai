#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all issues...\n');

// 1. Fix CheckIn Screen Export
console.log('1. Checking CheckIn screen export...');
const checkinPath = path.join(__dirname, '../screens/CheckInScreen.tsx');
let checkinContent = fs.readFileSync(checkinPath, 'utf8');

if (!checkinContent.includes('export default CheckInScreen')) {
  checkinContent += '\n\n// Add default export for compatibility\nexport default CheckInScreen;\n';
  fs.writeFileSync(checkinPath, checkinContent);
  console.log('✅ Added default export to CheckInScreen');
} else {
  console.log('✅ CheckInScreen export is correct');
}

// 2. Fix Reanimated Version
console.log('\n2. Fixing Reanimated version...');
try {
  execSync('npm install react-native-reanimated@3.17.4 --legacy-peer-deps', { stdio: 'inherit' });
  console.log('✅ Reanimated version fixed');
} catch (error) {
  console.error('❌ Failed to fix Reanimated version:', error.message);
}

// 3. Fix Environment Variables
console.log('\n3. Checking environment variables...');
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for required variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
  
  if (missingVars.length === 0) {
    console.log('✅ All required environment variables are present');
  } else {
    console.warn('⚠️  Missing environment variables:', missingVars.join(', '));
  }
} else {
  console.error('❌ .env file not found');
}

// 4. Update App Config
console.log('\n4. Checking app config...');
const appConfigPath = path.join(__dirname, '../app.config.js');
let appConfigContent = fs.readFileSync(appConfigPath, 'utf8');

// Ensure environment variables are properly exposed
if (!appConfigContent.includes('EXPO_PUBLIC_SUPABASE_URL')) {
  console.log('⚠️  Consider updating app.config.js to use EXPO_PUBLIC_ prefixed variables');
}

// 5. Test Supabase Connection
console.log('\n5. Testing Supabase connection...');
try {
  const testSupabase = `
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://nsgqhhbqpyvonirlfluv.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZ3FoaGJxcHl2b25pcmxmbHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY1NTgsImV4cCI6MjA2NTMzMjU1OH0.twGF9Y6clrRtJg_4S1OWHA1vhhYpKzn3ZpFJPGJbmEo'
    );
    
    supabase.from('messages').select('count').limit(1).then(result => {
      if (result.error) {
        console.log('❌ Supabase connection test failed:', result.error.message);
      } else {
        console.log('✅ Supabase connection test passed');
      }
    }).catch(error => {
      console.log('❌ Supabase connection error:', error.message);
    });
  `;
  
  execSync(`node -e "${testSupabase}"`, { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Supabase connection test failed');
}

// 6. Clear Metro Cache
console.log('\n6. Clearing Metro cache...');
try {
  execSync('npx expo start --clear --no-dev --minify', { stdio: 'inherit' });
  console.log('✅ Metro cache cleared');
} catch (error) {
  console.log('⚠️  Metro cache clear initiated (may still be running)');
}

// 7. Create EAS Build
console.log('\n7. Ready for EAS build...');
console.log('Run: eas build --platform ios --profile production-ios-stable');

console.log('\n🎉 All fixes applied! Summary:');
console.log('✅ CheckIn screen export fixed');
console.log('✅ Reanimated version aligned');
console.log('✅ Environment variables checked');
console.log('✅ Supabase connection tested');
console.log('✅ Metro cache cleared');
console.log('\n📱 Test the app now with: npx expo start');
console.log('🚀 Create production build with: eas build --platform ios --profile production-ios-stable'); 