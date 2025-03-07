import { notFound } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

import { HttpTypes } from '@medusajs/types'

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || 'us'

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
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: ['regions'],
      },
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

    const urlCountryCode = request.nextUrl.pathname.split('/')[1]?.toLowerCase()

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
  } catch (error) {
    console.error("Error getting region map in middleware:", error)
    // Create a fallback map with UK using GBP
    const ukRegion = {
      id: 'reg_01',
      name: 'United Kingdom',
      currency_code: 'gbp',
      countries: [{ iso_2: 'uk', display_name: 'United Kingdom' }]
    };
    regionMap.set('uk', ukRegion as HttpTypes.StoreRegion);
    console.log('Middleware: Using fallback UK region with GBP');
  }

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  // Check if URL already has a valid country code
  const pathSegments = request.nextUrl.pathname.split('/')
  const firstSegment = pathSegments[1] || ''
  
  const urlHasCountryCode =
    countryCode && firstSegment === countryCode
    
  // Check if we're dealing with a /dk/us type of situation
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
  if (!urlHasCountryCode && countryCode) {
    const cleanRedirectPath = request.nextUrl.pathname === '/' ? '' : 
      request.nextUrl.pathname.startsWith('/') ? request.nextUrl.pathname : `/${request.nextUrl.pathname}`
    
    let redirectUrl = `${request.nextUrl.origin}/${countryCode}${cleanRedirectPath}${request.nextUrl.search}`
    
    // Ensure we're not creating a /uk/us situation
    if (redirectUrl.includes(`/${countryCode}/${countryCode}`)) {
      redirectUrl = `${request.nextUrl.origin}/${countryCode}${request.nextUrl.search}`
    }
    
    response = NextResponse.redirect(redirectUrl, 307)
  }

  // If a cart_id is in the params, we set it as a cookie and redirect to the address step.
  if (cartId && !checkoutStep) {
    let redirectUrl = response.headers.get('Location') || request.nextUrl.href
    redirectUrl = `${redirectUrl}${redirectUrl.includes('?') ? '&' : '?'}step=address`
    response = NextResponse.redirect(redirectUrl, 307)
    response.cookies.set('_medusa_cart_id', cartId, { maxAge: 60 * 60 * 24 })
  }

  // Set a cookie to indicate that we're onboarding. This is used to show the onboarding flow.
  if (isOnboarding) {
    response.cookies.set('_medusa_onboarding', 'true', {
      maxAge: 60 * 60 * 24,
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)'],
}