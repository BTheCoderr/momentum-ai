console.log('🔍 MOBILE APP DIAGNOSTIC');
console.log('========================');

// Test imports
try {
  console.log('✅ Testing React Native imports...');
  require('react-native');
  console.log('✅ React Native imported successfully');
} catch (error) {
  console.log('❌ React Native import failed:', error.message);
}

try {
  console.log('✅ Testing AsyncStorage...');
  require('@react-native-async-storage/async-storage');
  console.log('✅ AsyncStorage imported successfully');
} catch (error) {
  console.log('❌ AsyncStorage import failed:', error.message);
}

try {
  console.log('✅ Testing Navigation...');
  require('@react-navigation/native');
  require('@react-navigation/bottom-tabs');
  require('@react-navigation/stack');
  console.log('✅ Navigation libraries imported successfully');
} catch (error) {
  console.log('❌ Navigation import failed:', error.message);
}

try {
  console.log('✅ Testing Axios...');
  require('axios');
  console.log('✅ Axios imported successfully');
} catch (error) {
  console.log('❌ Axios import failed:', error.message);
}

try {
  console.log('✅ Testing Expo Constants...');
  const Constants = require('expo-constants');
  console.log('✅ Expo Constants imported successfully');
  console.log('📱 App Config:', Constants.expoConfig?.extra || 'No extra config found');
} catch (error) {
  console.log('❌ Expo Constants import failed:', error.message);
}

console.log('🎯 Diagnostic complete!'); 