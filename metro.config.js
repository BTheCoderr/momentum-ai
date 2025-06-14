const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable Expo Router
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure we don't use app directory for routing
config.watchFolders = [__dirname];

module.exports = config; 