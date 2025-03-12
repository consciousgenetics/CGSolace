import { notFound } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

import { HttpTypes } from '@medusajs/types'

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
// Override the default region to always be 'uk' regardless of environment variable
const DEFAULT_REGION = 'uk'

console.log('Middleware initialized with DEFAULT_REGION:', DEFAULT_REGION)

// Add paths that should be excluded from country code prefixing
const EXCLUDED_PATHS = [
  '/_next',
  '/api',
  '/static',
  '/images',
  '/uploads',
  '/assets',
  '/favicon.ico',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg'
]

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap() {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Add timestamp to prevent caching
    const timestamp = Date.now()
    
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const { regions } = await fetch(`${BACKEND_URL}/store/regions?_t=${timestamp}`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 0, // Disable caching completely
        tags: ['regions'],
      },
      cache: 'no-store', // Prevent caching
    }).then((res) => res.json())

    if (!regions?.length) {
      notFound()
    }

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? '', region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get('x-vercel-ip-country')
      ?.toLowerCase()

    // Replace 'dk' with 'uk' in the vercel country code if present
    const correctedVercelCode = vercelCountryCode === 'dk' ? 'uk' : vercelCountryCode

    const urlCountryCode = request.nextUrl.pathname.split('/')[1]?.toLowerCase()
    
    // Replace 'dk' with 'uk' in the URL country code if present
    const correctedUrlCode = urlCountryCode === 'dk' ? 'uk' : urlCountryCode
    
    console.log('getCountryCode debug:', {
      originalUrlCode: urlCountryCode,
      correctedUrlCode,
      originalVercelCode: vercelCountryCode,
      correctedVercelCode,
      defaultRegion: DEFAULT_REGION,
      regionMapHasDefault: regionMap.has(DEFAULT_REGION),
      regionMapHasUk: regionMap.has('uk'),
      regionMapHasDk: regionMap.has('dk'),
      regionMapEntries: Array.from(regionMap.entries()).map(([key]) => key)
    })

    // Ensure 'dk' is never used
    if (regionMap.has('dk')) {
      const dkRegion = regionMap.get('dk')
      if (!regionMap.has('uk')) {
        regionMap.set('uk', dkRegion as HttpTypes.StoreRegion)
      }
      regionMap.delete('dk')
    }

    if (correctedUrlCode && regionMap.has(correctedUrlCode)) {
      countryCode = correctedUrlCode
      console.log('Using URL country code:', countryCode)
    } else if (correctedVercelCode && regionMap.has(correctedVercelCode)) {
      countryCode = correctedVercelCode
      console.log('Using Vercel country code:', countryCode)
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
      console.log('Using DEFAULT_REGION:', countryCode)
    } else if (regionMap.has('uk')) {
      countryCode = 'uk'
      console.log('Using UK as fallback:', countryCode)
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
      console.log('Using first region in map:', countryCode)
    }

    // Final check to always use 'uk' instead of 'dk'
    if (countryCode === 'dk') {
      countryCode = 'uk'
      console.log('Overriding dk to uk in getCountryCode final check')
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        'Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable?'
      )
    }
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  console.log('Middleware: Processing request for path:', request.nextUrl.pathname);
  
  // Directly catch /dk paths and redirect to /uk
  if (request.nextUrl.pathname.startsWith('/dk')) {
    const newPath = request.nextUrl.pathname.replace(/^\/dk/, '/uk');
    console.log('Middleware: Redirecting dk to uk:', newPath);
    return NextResponse.redirect(
      new URL(newPath + request.nextUrl.search, request.url),
      301
    );
  }
  
  // Check if the path should be excluded from country code handling
  const shouldExclude = EXCLUDED_PATHS.some(path => 
    request.nextUrl.pathname.includes(path) || 
    request.nextUrl.pathname.endsWith(path)
  )
  
  if (shouldExclude) {
    // For image paths, remove the country code if present
    if (request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) {
      const pathWithoutCountry = request.nextUrl.pathname.replace(/^\/[a-z]{2}\//, '/')
      if (pathWithoutCountry !== request.nextUrl.pathname) {
        return NextResponse.redirect(
          new URL(pathWithoutCountry, request.url),
          301
        )
      }
    }
    return NextResponse.next()
  }

  const searchParams = request.nextUrl.searchParams
  const isOnboarding = searchParams.get('onboarding') === 'true'
  const cartId = searchParams.get('cart_id')
  const checkoutStep = searchParams.get('step')
  const onboardingCookie = request.cookies.get('_medusa_onboarding')
  const cartIdCookie = request.cookies.get('_medusa_cart_id')

  // Try to get region map, but handle failures gracefully
  let regionMap = new Map();
  try {
    regionMap = await getRegionMap()
    console.log('Middleware: Got region map:', 
      Array.from(regionMap.entries())
        .map(([code, region]) => `${code}: ${(region as any).currency_code}`)
    );
    
    // Always ensure 'dk' is not in the map and 'uk' is present
    // Replace 'dk' with 'uk' in the region map if 'dk' exists
    if (regionMap.has('dk')) {
      console.log('Middleware: Replacing dk with uk in region map');
      const dkRegion = regionMap.get('dk');
      if (!regionMap.has('uk')) {
        regionMap.set('uk', dkRegion as HttpTypes.StoreRegion);
      }
      regionMap.delete('dk');
      console.log('Middleware: Updated region map:', 
        Array.from(regionMap.entries())
          .map(([code, region]) => `${code}: ${(region as any).currency_code}`)
      );
    }
    
    // If uk is not in the map, add it as a fallback
    if (!regionMap.has('uk')) {
      console.log('Middleware: Adding uk as fallback to region map');
      // Find any region with currency GBP
      const gbpRegion = Array.from(regionMap.values()).find(
        region => (region as any).currency_code?.toLowerCase() === 'gbp'
      );
      
      if (gbpRegion) {
        regionMap.set('uk', gbpRegion as HttpTypes.StoreRegion);
      } else if (regionMap.size > 0) {
        // Use the first available region as a fallback
        const firstRegion = Array.from(regionMap.values())[0];
        regionMap.set('uk', firstRegion as HttpTypes.StoreRegion);
      } else {
        // Don't create a custom region with a fake ID
        // Just set a placeholder marker so we know to redirect to /uk
        regionMap.set('uk', 1);
      }
      
      console.log('Middleware: Updated region map with uk:', 
        Array.from(regionMap.entries())
          .map(([code, region]) => typeof region === 'number' ? `${code}: placeholder` : 
            `${code}: ${(region as any).currency_code}`)
      );
    }
  } catch (error) {
    console.error("Error getting region map in middleware:", error);
    // Instead of creating a region with a fake ID, just add a placeholder
    regionMap.set('uk', 1);
    // Make sure 'dk' is not in the fallback map
    regionMap.delete('dk');
    console.log('Middleware: Added placeholder for UK in region map');
  }

  // Get country code, but force 'uk' if 'dk' is detected
  let countryCode = regionMap && (await getCountryCode(request, regionMap));
  if (countryCode === 'dk') {
    console.log('Middleware: Overriding dk country code to uk');
    countryCode = 'uk';
  }

  // Handle the case where we get 'dk' but we want 'uk'
  const actualCountryCode = countryCode === 'dk' ? 'uk' : countryCode;
  
  // Check if URL already has a valid country code
  const pathSegments = request.nextUrl.pathname.split('/')
  const firstSegment = pathSegments[1] || ''
  
  const urlHasCountryCode =
    actualCountryCode && firstSegment === actualCountryCode
    
  // Check if we're dealing with a /uk/us type of situation
  const hasDoubleCountry = regionMap && 
    pathSegments.length > 2 && 
    regionMap.has(firstSegment) && 
    regionMap.has(pathSegments[2])
    
  // Handle the double country code case
  if (hasDoubleCountry) {
    const newPath = `/${firstSegment}${pathSegments.slice(3).join('/')}`
    const redirectUrl = `${request.nextUrl.origin}${newPath}${request.nextUrl.search}`
    return NextResponse.redirect(redirectUrl, 307)
  }

  // Return early if URL has the correct country code and cookies are set
  if (
    urlHasCountryCode &&
    (!isOnboarding || onboardingCookie) &&
    (!cartId || cartIdCookie)
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next()

  // If no country code is set or it's not correct, redirect to the correct one
  if (!urlHasCountryCode && actualCountryCode) {
    const cleanRedirectPath = request.nextUrl.pathname === '/' ? '' : 
      request.nextUrl.pathname.startsWith('/') ? request.nextUrl.pathname : `/${request.nextUrl.pathname}`
    
    let redirectUrl = `${request.nextUrl.origin}/${actualCountryCode}${cleanRedirectPath}${request.nextUrl.search}`
    
    // Ensure we're not creating a /uk/us situation
    if (redirectUrl.includes(`/${actualCountryCode}/${actualCountryCode}`)) {
      redirectUrl = `${request.nextUrl.origin}/${actualCountryCode}${request.nextUrl.search}`
    }
    
    response = NextResponse.redirect(redirectUrl, 307)
  }

  // If a cart_id is in the params, we set it as a cookie and redirect to the address step.
  if (cartId && !checkoutStep) {
    let redirectUrl = response.headers.get('Location') || request.nextUrl.href
    redirectUrl = `${redirectUrl}${redirectUrl.includes('?') ? '&' : '?'}step=address`
    response = NextResponse.redirect(redirectUrl, 307)
    // Set cookie via response object only, not directly
    response.cookies.set('_medusa_cart_id', cartId, { maxAge: 60 * 60 * 24 })
  }

  // Set a cookie to indicate that we're onboarding. This is used to show the onboarding flow.
  if (isOnboarding) {
    // Set cookie via response object only, not directly
    response.cookies.set('_medusa_onboarding', 'true', {
      maxAge: 60 * 60 * 24,
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)'],
}