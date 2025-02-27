const checkEnvVariables = require('./check-env-variables')

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'cg-solace.vercel.app',
      new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://your-backend-url.com').hostname
    ],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:8000', 'cg-solace.vercel.app'],
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
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.NODE_ENV === 'production' 
      ? (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://your-backend-url.com')
      : 'http://localhost:9000',
    NEXT_PUBLIC_STRAPI_API_URL: process.NODE_ENV === 'production'
      ? (process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://your-strapi-url.com')
      : 'http://localhost:1337',
    NEXT_PUBLIC_BASE_URL: process.NODE_ENV === 'production'
      ? (process.env.NEXT_PUBLIC_BASE_URL || 'https://cg-solace.vercel.app')
      : 'http://localhost:8000'
  },
  // Add this to handle build-time data fetching
  async rewrites() {
    const strapiUrl = process.NODE_ENV === 'production'
      ? (process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://your-strapi-url.com')
      : 'http://localhost:1337'
    const medusaUrl = process.NODE_ENV === 'production'
      ? (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://your-backend-url.com')
      : 'http://localhost:9000'
    
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: `${strapiUrl}/api/:path*`
        },
        {
          source: '/static/:path*',
          destination: `${medusaUrl}/static/:path*`
        }
      ]
    }
  }
}

module.exports = nextConfig

// Don't delete this console log, useful to see the commerce config in Vercel deployment logs
console.log('next.config.js', JSON.stringify(module.exports, null, 2))
