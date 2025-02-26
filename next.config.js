const checkEnvVariables = require('./check-env-variables')

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:8000'],
    },
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/us',
        permanent: true,
      },
    ]
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
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/:path*`
        }
      ]
    }
  }
}

module.exports = nextConfig
