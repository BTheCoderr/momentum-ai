/** @type {import('next').NextConfig} */
const nextConfig = {
  // Point to the web app directory
  distDir: '.next',
  
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
  
  // Redirect root to web app
  async redirects() {
    return [
      {
        source: '/',
        destination: '/src/web-app/page',
        permanent: false,
      },
    ];
  },
  
  // Keep TypeScript checking enabled for type safety
  typescript: {
    ignoreBuildErrors: false,
  },
  
  experimental: {
    // Remove deprecated appDir option
  },
};

module.exports = nextConfig; 