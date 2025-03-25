import { notFound } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

import { HttpTypes } from '@medusajs/types'

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || 'gb'

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
    try {
      // Log the environment variables (without sensitive data)
      console.log('Fetching regions with backend URL:', BACKEND_URL)
      
      if (!BACKEND_URL) {
        throw new Error('NEXT_PUBLIC_MEDUSA_BACKEND_URL is not set')
      }
      
      if (!PUBLISHABLE_API_KEY) {
        throw new Error('NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set')
      }

      const response = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_API_KEY,
        },
        next: {
          revalidate: 3600,
          tags: ['regions'],
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch regions: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data?.regions?.length) {
        throw new Error('No regions found in the response')
      }

      // Create a map of country codes to regions.
      data.regions.forEach((region: HttpTypes.StoreRegion) => {
        region.countries?.forEach((c) => {
          regionMapCache.regionMap.set(c.iso_2 ?? '', region)
        })
      })

      regionMapCache.regionMapUpdated = Date.now()
      
      // Log success
      console.log('Successfully fetched and cached regions')
      
    } catch (error) {
      console.error('Error fetching regions:', error)
      
      // If we have cached regions, use them as fallback
      if (regionMap.keys().next().value) {
        console.log('Using cached regions as fallback')
        return regionMap
      }
      
      // If no cached regions and fetch failed, use default region
      console.log('Using default region as fallback')
      regionMapCache.regionMap.set(DEFAULT_REGION, {
        id: 'default',
        name: 'Default Region',
        currency_code: 'usd',
        tax_rate: 0,
        countries: [{ id: 'default-country', iso_2: DEFAULT_REGION }],
      } as HttpTypes.StoreRegion)
      regionMapCache.regionMapUpdated = Date.now()
    }
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

    const urlPathParts = request.nextUrl.pathname.split('/')
    const urlCountryCode = urlPathParts[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
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
  const searchParams = request.nextUrl.searchParams
  const isOnboarding = searchParams.get('onboarding') === 'true'
  const cartId = searchParams.get('cart_id')
  const checkoutStep = searchParams.get('step')
  const onboardingCookie = request.cookies.get('_medusa_onboarding')
  const cartIdCookie = request.cookies.get('_medusa_cart_id')

  const regionMap = await getRegionMap()
  
  // Check if the URL already has a valid country code
  const pathParts = request.nextUrl.pathname.split('/')
  const firstPathPart = pathParts[1]?.toLowerCase()
  
  // Prevent redirect loops by checking if we're already in a nested country code path
  if (pathParts.length > 2 && regionMap.has(pathParts[2]?.toLowerCase())) {
    // We're in a nested path like /dk/uk - redirect to the first valid country code
    const validCountryCode = firstPathPart && regionMap.has(firstPathPart) 
      ? firstPathPart 
      : DEFAULT_REGION
      
    const newPath = `/${validCountryCode}${pathParts.slice(3).join('/')}`
    return NextResponse.redirect(`${request.nextUrl.origin}${newPath}${request.nextUrl.search}`, 307)
  }
  
  const urlHasValidCountryCode = firstPathPart && regionMap.has(firstPathPart)
  
  // If URL already has a valid country code, proceed normally
  if (
    urlHasValidCountryCode &&
    (!isOnboarding || onboardingCookie) &&
    (!cartId || cartIdCookie)
  ) {
    return NextResponse.next()
  }

  // Get the appropriate country code to redirect to
  const countryCode = regionMap && (await getCountryCode(request, regionMap))
  
  // If no valid country code is in the URL, redirect to the relevant region
  if (!urlHasValidCountryCode && countryCode) {
    const redirectPath = request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname
    const queryString = request.nextUrl.search ? request.nextUrl.search : ''
    const redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    
    let response = NextResponse.redirect(redirectUrl, 307)
    
    // If a cart_id is in the params, set it as a cookie and redirect to the address step
    if (cartId && !checkoutStep) {
      response = NextResponse.redirect(`${redirectUrl}&step=address`, 307)
      response.cookies.set('_medusa_cart_id', cartId, { maxAge: 60 * 60 * 24 })
    }
    
    // Set onboarding cookie if needed
    if (isOnboarding) {
      response.cookies.set('_medusa_onboarding', 'true', {
        maxAge: 60 * 60 * 24,
      })
    }
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)'],
}