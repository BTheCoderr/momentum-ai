/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build
  eslint: {
    // Disable ESLint during builds to prevent deployment failures
    // ESLint can still be run manually during development
    ignoreDuringBuilds: true,
  },
  
  // Keep TypeScript checking enabled for type safety
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig; 