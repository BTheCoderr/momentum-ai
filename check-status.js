#!/usr/bin/env node

const http = require('http');

console.log('🔍 Checking server status...\n');

// Check Next.js API server
function checkAPI() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/api/goals', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Next.js API Server (port 3000): Running');
        console.log(`   Response: ${data.trim() || '[]'}`);
        resolve(true);
      });
    });
    
    req.on('error', () => {
      console.log('❌ Next.js API Server (port 3000): Not running');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('⏰ Next.js API Server (port 3000): Timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Check Expo server
function checkExpo() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:8082', (res) => {
      console.log('✅ Expo Development Server (port 8082): Running');
      resolve(true);
    });
    
    req.on('error', () => {
      console.log('❌ Expo Development Server (port 8082): Not running');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('⏰ Expo Development Server (port 8082): Timeout');
      req.destroy();
      resolve(false);
    });
  });
}

async function checkAll() {
  const apiStatus = await checkAPI();
  const expoStatus = await checkExpo();
  
  console.log('\n📊 SUMMARY');
  console.log('='.repeat(40));
  
  if (apiStatus && expoStatus) {
    console.log('🎉 All systems running! Your app is ready to test.');
    console.log('\n📱 To test:');
    console.log('1. Open Expo Go app on your phone');
    console.log('2. Scan the QR code from the Expo terminal');
    console.log('3. Or press "i" in Expo terminal for iOS simulator');
  } else {
    console.log('⚠️  Some services are not running.');
    if (!apiStatus) console.log('   • Start API: npm run dev');
    if (!expoStatus) console.log('   • Start Expo: npx expo start --port 8082');
  }
}

checkAll().catch(console.error); 