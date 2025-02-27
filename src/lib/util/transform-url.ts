/**
 * Transforms URLs to ensure they use HTTPS and proper domain in production
 * @param url The URL to transform
 * @returns The transformed URL
 */
export const transformUrl = (url: string): string => {
  if (!url) return url

  // If it's already an absolute URL with HTTPS, return as is
  if (url.startsWith('https://')) return url

  // If it's an absolute URL with HTTP in production, convert to HTTPS
  if (process.env.NODE_ENV === 'production' && url.startsWith('http://')) {
    return url.replace('http://', 'https://')
  }

  // If it's a relative URL starting with /static/, prefix with backend URL
  if (url.startsWith('/static/')) {
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const fullUrl = `${baseUrl}${url}`
    return process.env.NODE_ENV === 'production' 
      ? fullUrl.replace('http://', 'https://')
      : fullUrl
  }

  // If it starts with /, it's a relative URL from the frontend base
  if (url.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'
    const fullUrl = `${baseUrl}${url}`
    return process.env.NODE_ENV === 'production'
      ? fullUrl.replace('http://', 'https://')
      : fullUrl
  }

  return url
} 