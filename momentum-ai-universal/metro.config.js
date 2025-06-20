const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure we're resolving from the correct directory
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add support for TypeScript files
config.resolver.sourceExts.push('tsx', 'ts');

module.exports = config; 