/**
 * Transforms URLs to ensure they use HTTPS and proper domain in production
 * @param url The URL to transform
 * @returns The transformed URL
 */
export const transformUrl = (url: string): string => {
  if (!url) return url

  // If it's already an absolute HTTPS URL, return as is
  if (url.startsWith('https://')) return url

  // For production environment
  if (process.env.NODE_ENV === 'production') {
    // If it's a localhost URL, replace with the production backend URL
    if (url.includes('localhost')) {
      const prodBackendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://your-backend-url.com'
      return url.replace(/http:\/\/localhost:\d+/, prodBackendUrl).replace('http://', 'https://')
    }

    // Convert any HTTP URLs to HTTPS
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://')
    }
  }

  // Handle relative URLs
  if (url.startsWith('/')) {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? (process.env.NEXT_PUBLIC_BASE_URL || 'https://cg-solace.vercel.app')
      : (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000')
    
    return `${baseUrl}${url}`
  }

  return url
} 