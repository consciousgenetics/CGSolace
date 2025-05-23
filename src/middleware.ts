import { NextRequest, NextResponse } from 'next/server'
import { HttpTypes } from '@medusajs/types'

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || 'us'

// Additional fallback data to ensure we always have region data
const FALLBACK_REGIONS = [
  { id: 'us-region', countries: [{ iso_2: 'us', display_name: 'United States' }] },
  { id: 'gb-region', countries: [{ iso_2: 'gb', display_name: 'United Kingdom' }] },
  { id: 'eu-region', countries: [{ iso_2: 'dk', display_name: 'Denmark' }] }
] as HttpTypes.StoreRegion[]

// Global cache with longer TTL to reduce API calls
let regionMapCache: {
  regionMap: Map<string, HttpTypes.StoreRegion>
  regionMapUpdated: number
  ttl: number
  fetchPromise: Promise<Map<string, HttpTypes.StoreRegion>> | null
} = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: 0,
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  fetchPromise: null,
}

/**
 * Fetches regions with timeout protection
 */
async function fetchRegionsWithTimeout() {
  // Set a timeout for the fetch operation (3 seconds)
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Region fetch timeout')), 3000)
  })
  
  try {
    // Ensure we have a valid backend URL
    if (!BACKEND_URL) {
      console.warn('No BACKEND_URL provided, using fallback regions')
      return FALLBACK_REGIONS
    }
    
    const fetchPromise = fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          ...(PUBLISHABLE_API_KEY ? { 'x-publishable-api-key': PUBLISHABLE_API_KEY } : {}),
        },
        next: {
          revalidate: regionMapCache.ttl / 1000, // Convert ms to seconds
          tags: ['regions'],
        },
      })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch regions: ${res.status} ${res.statusText}`)
        }
        return res.json()
      })
      .catch(error => {
        console.error('Error in fetchRegionsWithTimeout response:', error)
        return { regions: FALLBACK_REGIONS }
      })

    // Race between fetch and timeout
    const data = await Promise.race([fetchPromise, timeout])
      .catch(() => ({ regions: FALLBACK_REGIONS }))
    
    const regions = data.regions || FALLBACK_REGIONS
    
    // Verify we have valid region data
    if (!Array.isArray(regions) || regions.length === 0) {
      console.warn('Invalid region data received, using fallback regions')
      return FALLBACK_REGIONS
    }
    
    return regions
  } catch (error) {
    console.error('Error fetching regions with timeout:', error)
    // Return fallback data in case of any error
    return FALLBACK_REGIONS
  }
}

async function getRegionMap() {
  const now = Date.now()
  const isCacheValid = 
    regionMapCache.regionMap.size > 0 && 
    (now - regionMapCache.regionMapUpdated < regionMapCache.ttl)
  
  // Return immediately if cache is valid
  if (isCacheValid) {
    return regionMapCache.regionMap
  }
  
  // If there's already a fetch in progress, wait for it
  if (regionMapCache.fetchPromise) {
    try {
      return await regionMapCache.fetchPromise
    } catch (error) {
      // If the existing promise fails, continue to try a new fetch
      regionMapCache.fetchPromise = null
    }
      }

  // Create a new fetch promise
  regionMapCache.fetchPromise = (async () => {
    try {
      const regions = await fetchRegionsWithTimeout()
      
      // If regions fetch failed but we have existing cache, return that instead
      if (!regions?.length && regionMapCache.regionMap.size > 0) {
        return regionMapCache.regionMap
      }
      
      // Otherwise update the cache with new data
      if (regions?.length) {
        const newMap = new Map<string, HttpTypes.StoreRegion>()
        
      regions.forEach((region: HttpTypes.StoreRegion) => {
        region.countries?.forEach((c) => {
            if (c.iso_2) {
              newMap.set(c.iso_2.toLowerCase(), region)
            }
          })
        })
        
        // Only update cache if we got valid data
        if (newMap.size > 0) {
          regionMapCache.regionMap = newMap
          regionMapCache.regionMapUpdated = now
    }
  }

  return regionMapCache.regionMap
    } catch (error) {
      console.error('Region fetch failed:', error)
      // Return existing cache on error
      return regionMapCache.regionMap
    } finally {
      // Clear the promise reference
      regionMapCache.fetchPromise = null
    }
  })()
  
  return regionMapCache.fetchPromise
}

/**
 * Gets country code from request or defaults
 */
function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion>
) {
  try {
    // Early return if region map is empty
    if (regionMap.size === 0) {
      return DEFAULT_REGION
    }

    const vercelCountryCode = request.headers
      .get('x-vercel-ip-country')
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split('/')[1]?.toLowerCase()

    // Check if the URL already contains a valid country code
    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      return urlCountryCode
    } 
    
    if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      return vercelCountryCode
    } 
    
    if (regionMap.has(DEFAULT_REGION)) {
      return DEFAULT_REGION
    } 
    
    // Fallback to first available country code
    return regionMap.keys().next().value || DEFAULT_REGION
  } catch (error) {
    console.error('Error getting country code:', error)
    return DEFAULT_REGION
  }
}

/**
 * Optimized middleware with early returns and timeout protection
 */
export async function middleware(request: NextRequest) {
  // Skip middleware for certain paths to reduce load
  const skipPaths = [
    '/_next',
    '/api',
    '/static',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap',
  ]
  
  const path = request.nextUrl.pathname
  if (skipPaths.some(skipPath => path.startsWith(skipPath))) {
    return NextResponse.next()
  }
  
  // Skip middleware for checkout URLs with step params to avoid double processing
  const isCheckoutWithStep = 
    path.includes('/checkout') && 
    request.nextUrl.search.includes('step=')
  
  if (isCheckoutWithStep) {
    return NextResponse.next()
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const isOnboarding = searchParams.get('onboarding') === 'true'
    const cartId = searchParams.get('cart_id')
    const checkoutStep = searchParams.get('step')
    const onboardingCookie = request.cookies.get('_medusa_onboarding')
    const cartIdCookie = request.cookies.get('_medusa_cart_id')

    // Use Promise.race to set an overall timeout for the middleware
    const timeoutPromise = new Promise<Map<string, HttpTypes.StoreRegion>>((_, reject) => {
      setTimeout(() => reject(new Error('Middleware timeout')), 4500)
    })

    // Race between region map retrieval and timeout
    let regionMap: Map<string, HttpTypes.StoreRegion>
    try {
      regionMap = await Promise.race([getRegionMap(), timeoutPromise])
    } catch (error) {
      console.error('Middleware timed out or failed:', error)
      // Create a simple early response on timeout
      return NextResponse.next()
    }

    const countryCode = getCountryCode(request, regionMap)
    
    // Early exit if countryCode couldn't be determined
    if (!countryCode) {
      return NextResponse.next()
    }

    const urlPathParts = request.nextUrl.pathname.split('/')
    const urlCountryCode = urlPathParts[1]?.toLowerCase()
    
    // Check if URL already has a valid country code
    const hasValidCountryCode = urlCountryCode && regionMap.has(urlCountryCode)
    
    // Check if we're trying to navigate to a path that already has a country code in it
    // This prevents /gb/us issue by checking if the second part is also a country code
    if (urlPathParts.length > 2) {
      const secondPathPart = urlPathParts[2]?.toLowerCase()
      if (secondPathPart && regionMap.has(secondPathPart)) {
        // Redirect to just the requested country code to fix /gb/us -> /us
        const newPath = `/${secondPathPart}${urlPathParts.slice(3).join('/')}`
        return NextResponse.redirect(`${request.nextUrl.origin}${newPath}${request.nextUrl.search}`, 307)
      }
    }

    // Check if we need to do any redirect
    if (
      hasValidCountryCode &&
      (!isOnboarding || onboardingCookie) &&
      (!cartId || cartIdCookie)
    ) {
      return NextResponse.next()
    }

    const redirectPath =
      request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname

    const queryString = request.nextUrl.search ? request.nextUrl.search : ''

    let redirectUrl = request.nextUrl.href
    let response = NextResponse.redirect(redirectUrl, 307)

    // If no country code is set, we redirect to the relevant region.
    if (!hasValidCountryCode && countryCode) {
      redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
      response = NextResponse.redirect(`${redirectUrl}`, 307)
    }

    // If a cart_id is in the params, we set it as a cookie and redirect to the address step.
    if (cartId && !checkoutStep) {
      response.cookies.set('_medusa_cart_id', cartId, { maxAge: 60 * 60 * 24 })
      
      // Only add step=address if we're on a checkout page
      if (request.nextUrl.pathname.includes('/checkout')) {
        redirectUrl = `${redirectUrl}&step=address`
        response = NextResponse.redirect(`${redirectUrl}`, 307)
      }
    }

    // Set a cookie to indicate that we're onboarding. This is used to show the onboarding flow.
    if (isOnboarding) {
      response.cookies.set('_medusa_onboarding', 'true', {
        maxAge: 60 * 60 * 24,
      })
    }

    return response
  } catch (error) {
    // Fail gracefully - allow request to continue
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Exclude static files, API routes and other special paths
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}