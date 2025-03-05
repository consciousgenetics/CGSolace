import Medusa from '@medusajs/js-sdk'

// Get the backend URL from environment variables
const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

if (!MEDUSA_BACKEND_URL) {
  throw new Error('NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable is not set')
}

// Ensure the backend URL has the proper protocol
const finalBackendUrl = MEDUSA_BACKEND_URL.startsWith('http') 
  ? MEDUSA_BACKEND_URL 
  : `https://${MEDUSA_BACKEND_URL}`

// Log the backend URL for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Medusa Backend URL:', finalBackendUrl)
}

export const sdk = new Medusa({
  baseUrl: finalBackendUrl,
  debug: process.env.NODE_ENV === 'development',
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
