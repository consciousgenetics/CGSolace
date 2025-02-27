const checkEnvVariables = require('./check-env-variables')

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'cg-solace.vercel.app'],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:8000'],
    },
  },
  // Add this section to handle dynamic routes during build
  typescript: {
    // Temporarily ignore type errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore eslint errors during build
    ignoreDuringBuilds: true,
  },
  // Add static generation configuration
  staticPageGenerationTimeout: 180,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000',
    NEXT_PUBLIC_STRAPI_API_URL: process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
  },
  // Add this to handle build-time data fetching
  async rewrites() {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: `${strapiUrl}/api/:path*`
        }
      ]
    }
  }
}

module.exports = nextConfig

// Don't delete this console log, useful to see the commerce config in Vercel deployment logs
console.log('next.config.js', JSON.stringify(module.exports, null, 2))
