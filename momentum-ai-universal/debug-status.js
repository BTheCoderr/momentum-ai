const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 MOMENTUM AI DEBUG STATUS CHECK');
console.log('================================\n');

// Check current network IP
exec('ifconfig | grep "inet " | grep -v 127.0.0.1', (error, stdout) => {
  if (!error) {
    console.log('📡 Current Network IP:', stdout.trim());
  }
});

// Check app.json configuration
try {
  const appJsonPath = path.join(__dirname, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  console.log('⚙️  API URL in app.json:', appJson.expo.extra.apiUrl);
} catch (error) {
  console.log('❌ Error reading app.json:', error.message);
}

// Check if web server is running
exec('lsof -i :3000', (error, stdout) => {
  if (stdout) {
    console.log('✅ Web server running on port 3000');
  } else {
    console.log('❌ No web server found on port 3000');
  }
});

exec('lsof -i :3001', (error, stdout) => {
  if (stdout) {
    console.log('✅ Web server running on port 3001');
  } else {
    console.log('❌ No web server found on port 3001');
  }
});

// Check if mobile metro is running
exec('lsof -i :8081', (error, stdout) => {
  if (stdout) {
    console.log('✅ Metro bundler running on port 8081');
  } else {
    console.log('❌ No Metro bundler found on port 8081');
  }
});

setTimeout(() => {
  console.log('\n🚀 RECOMMENDATIONS:');
  console.log('1. Make sure web server is running: npm run dev');
  console.log('2. Make sure mobile app is running: npx expo start --clear');
  console.log('3. Check that API URL in app.json matches your network IP');
  console.log('4. Restart mobile app if API URL was changed');
}, 2000); 