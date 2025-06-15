/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build
  eslint: {
    // Disable ESLint during builds to prevent deployment failures
    // ESLint can still be run manually during development
    ignoreDuringBuilds: true,
  },
  
  // Handle the fact that we have both mobile and web in same repo
  webpack: (config, { isServer }) => {
    // Ignore mobile-specific files during web build
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
    };
    
    return config;
  },
  
  // No redirects needed - app/page.tsx handles the root route
  async redirects() {
    return [];
  },
  
  // Keep TypeScript checking enabled for type safety
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig; 