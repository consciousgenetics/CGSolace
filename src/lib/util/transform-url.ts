/**
 * Transforms URLs to ensure they use HTTPS and proper domain in production
 * @param url The URL to transform
 * @returns The transformed URL
 */
export const transformUrl = (url: string): string => {
  // Log the input for debugging
  console.log('transformUrl input:', url)
  
  // Handle null or undefined URLs
  if (!url) {
    console.log('transformUrl: Empty URL provided')
    return ''
  }

  try {
    // IMPORTANT: If this is the working T-shirt image, don't transform it - return as is
    if (url.includes('female_model_t_shirt_2_6d4e8cc3b5.jpg')) {
      console.log('transformUrl: Preserving working T-shirt image URL')
      return url
    }
    
    // Special case handling for specific product handles
    const productHandleMap = {
      'conscious-stoner-t-shirt-female': 'female_model_t_shirt_2_6d4e8cc3b5.jpg',
      'conscious_stoner_t_shirt_female': 'female_model_t_shirt_2_6d4e8cc3b5.jpg',
      'merch-pack': 'merch_pack'
    };
    
    // Check if URL contains any of our problematic product handles
    for (const [pattern, replacement] of Object.entries(productHandleMap)) {
      if (url.includes(pattern)) {
        // For the conscious stoner t-shirt, use the fully qualified URL that works
        if (pattern.includes('conscious')) {
          const newUrl = `https://cgsolacemedusav2-production.up.railway.app/uploads/${replacement}`;
          console.log(`transformUrl: Using known working image for "${pattern}": ${newUrl}`);
          return newUrl;
        }
        
        // For other products, use the standard approach
        const newUrl = `/uploads/products/${replacement}.jpg`;
        console.log(`transformUrl: Special product handle "${pattern}" detected, using dedicated image path: ${newUrl}`);
        
        return newUrl.startsWith('/') ? 
          `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://cgsolacemedusav2-production.up.railway.app'}${newUrl}` : 
          newUrl;
      }
    }
    
    // If it's already an absolute HTTPS URL, return as is
    if (url.startsWith('https://')) {
      console.log('transformUrl: URL already uses HTTPS, returning as is')
      return url
    }
    
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://cgsolacemedusav2-production.up.railway.app'
    console.log('transformUrl: Using backend URL:', backendUrl)

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
    if (url.startsWith('/')) {
      const transformed = `${backendUrl}${url}`
      console.log('transformUrl: Converted relative URL to absolute:', transformed)
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
    
    // If URL is from strapi but doesn't have the full URL structure
    if (url.includes('/uploads/') && !url.match(/^https?:\/\//)) {
      const transformed = `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`
      console.log('transformUrl: Added backend URL to Strapi uploads path:', transformed)
      return transformed
    }
    
    // Handle case where URL might be just a filename or path without leading slash
    if (!url.match(/^[a-zA-Z]+:\/\//) && !url.startsWith('/')) {
      const transformed = `${backendUrl}/${url}`
      console.log('transformUrl: Adding backend URL to non-absolute URL:', transformed)
      return transformed
    }

    console.log('transformUrl: No transformation applied, returning original URL')
    return url
  } catch (error) {
    console.error('transformUrl: Error transforming URL:', error)
    // Return the original URL if any error occurs
    return url
  }
} 