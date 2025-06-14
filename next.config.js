/** @type {import('next').NextConfig} */
const nextConfig = {
  // Point to the web app directory
  distDir: '.next',
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
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
};

module.exports = nextConfig; 