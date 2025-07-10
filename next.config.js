/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude React Native dependencies from the web build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "react-native": false,
        "expo-constants": false,
        "expo-device": false,
        "@react-native-async-storage/async-storage": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig; 