const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Completely disable Expo Router
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Prevent app directory from being treated as router
config.resolver.blockList = [
  /app\/.*/,
  /src\/app\/.*/,
];

// Ensure we use React Navigation instead of Expo Router
config.transformer.unstable_allowRequireContext = false;

// Disable router-related transforms completely
config.transformer.routerRoot = undefined;
config.transformer.unstable_transformProfile = undefined;

// Disable any experimental features that might interfere
config.transformer.experimentalImportSupport = false;

// Force disable router detection
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config; 