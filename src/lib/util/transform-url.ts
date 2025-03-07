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
    
    // Special case handling for specific product handles
    const productHandleMap: Record<string, string> = {
      'conscious-stoner-t-shirt-female': '/conscious-female-tshirt.jpg',
      'conscious_stoner_t_shirt_female': '/conscious-female-tshirt.jpg',
      'merch-pack': '/merch1.jpg'
    };
    
    // Check if URL contains any of our problematic product handles
    for (const [pattern, replacement] of Object.entries(productHandleMap)) {
      if (url.toLowerCase().includes(pattern.toLowerCase())) {
        console.log(`transformUrl: Using local image for "${pattern}": ${replacement}`);
        return replacement;
      }
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

    // Handle relative URLs that start with /
    if (url.startsWith('/uploads/')) {
      // Prefer local fallbacks for known problematic image URLs
      if (url.toLowerCase().includes('female') && url.toLowerCase().includes('shirt')) {
        return '/conscious-female-tshirt.jpg'
      }
      
      const transformed = `${backendUrl}${url}`
      console.log('transformUrl: Converted uploads URL to absolute:', transformed)
      return transformed
    }
    
    // Handle data URLs and other special formats
    if (url.startsWith('data:')) {
      console.log('transformUrl: Data URL detected, returning as is')
      return url
    }
    
    // Handle URLs that might be missing the protocol (//example.com/image.jpg)
    if (url.startsWith('//')) {
      const transformed = `https:${url}`
      console.log('transformUrl: Added https protocol to protocol-relative URL:', transformed)
      return transformed
    }
    
    // If we've detected that the URL is likely to cause issues, use a local fallback
    if (url.includes('product') || url.includes('merch')) {
      const localPath = `/product1.jpg`
      console.log('transformUrl: Using local fallback for product URL:', localPath)
      return localPath
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
    // Return a default image if any error occurs
    return '/product1.jpg'
  }
} 