/**
 * Transforms URLs to ensure they use HTTPS and proper domain in production
 * @param url The URL to transform
 * @returns The transformed URL
 */
export const transformUrl = (url: string): string => {
  // Handle null or undefined URLs
  if (!url) {
    console.log('transformUrl: Empty URL provided')
    return ''
  }

  try {
    // Check if the URL is already a local path to our public directory
    if (url.startsWith('/') && !url.startsWith('//') && !url.includes('uploads/')) {
      console.log('transformUrl: Local public image detected, keeping as is:', url)
      return url
    }

    // If it's a Strapi URL starting with /uploads/, add the Strapi base URL
    if (url.startsWith('/uploads/')) {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337'
      const absoluteUrl = `${strapiUrl}${url}`
      console.log('transformUrl: Converting Strapi uploads URL to absolute:', absoluteUrl)
      return absoluteUrl.replace('http://', 'https://')
    }
    
    // If it's already an absolute HTTPS URL, return as is
    if (url.startsWith('https://')) {
      console.log('transformUrl: URL already uses HTTPS, returning as is')
      return url
    }
    
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://cgsolacemedusav2-production.up.railway.app'
    
    // For all environments, replace localhost URLs with the backend URL
    if (url.includes('localhost')) {
      const transformed = url.replace(/http:\/\/localhost:\d+/, backendUrl).replace('http://', 'https://')
      console.log('transformUrl: Transformed localhost URL to:', transformed)
      return transformed
    }

    // Convert any HTTP URLs to HTTPS
    if (url.startsWith('http://')) {
      const transformed = url.replace('http://', 'https://')
      console.log('transformUrl: Converted HTTP to HTTPS:', transformed)
      return transformed
    }

    // Handle URLs that might be missing the protocol (//example.com/image.jpg)
    if (url.startsWith('//')) {
      const transformed = `https:${url}`
      console.log('transformUrl: Added https protocol to protocol-relative URL:', transformed)
      return transformed
    }
    
    // Handle case where URL might be just a filename or path without leading slash
    if (!url.match(/^[a-zA-Z]+:\/\//) && !url.startsWith('/')) {
      const transformed = `${backendUrl}/${url}`
      console.log('transformUrl: Adding backend URL to non-absolute URL:', transformed)
      return transformed
    }

    // For any other URL, return as is
    return url
  } catch (error) {
    console.error('transformUrl: Error transforming URL:', error)
    // Return empty string if any error occurs - let the component handle fallback
    return ''
  }
} 