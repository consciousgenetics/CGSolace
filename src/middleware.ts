import { notFound } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

import { HttpTypes } from '@medusajs/types'

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || 'uk'
// Use 'dk' as fallback if 'uk' doesn't exist in the region map
const FALLBACK_REGION = 'dk'

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

    console.log('Available regions:', regions.map((r: HttpTypes.StoreRegion) => r.name));
    
    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? '', region)
        console.log(`Mapping country ${c.iso_2} to region ${region.name}`);
      })
    })

    // Add 'uk' to point to the same region as 'dk' if 'uk' doesn't exist but 'dk' does
    if (!regionMapCache.regionMap.has('uk') && regionMapCache.regionMap.has('dk')) {
      const dkRegion = regionMapCache.regionMap.get('dk');
      regionMapCache.regionMap.set('uk', dkRegion as HttpTypes.StoreRegion);
      console.log('Mapped "uk" to the same region as "dk"');
    }

    // Log all available country codes
    console.log('Available country codes:', Array.from(regionMapCache.regionMap.keys()));

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
    
    console.log('Vercel detected country:', vercelCountryCode)

    const urlCountryCode = request.nextUrl.pathname.split('/')[1]?.toLowerCase()
    console.log('URL country code:', urlCountryCode)

    // Special case: If URL is explicitly /uk or /dk, keep it 
    if (urlCountryCode === 'uk' || urlCountryCode === 'dk') {
      return urlCountryCode;
    }

    // Check if the detected country code exists in the region map
    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else {
      // Always default to UK or DK if UK isn't available
      countryCode = regionMap.has('uk') ? 'uk' : FALLBACK_REGION;
    }

    console.log('Selected country code:', countryCode)
    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        'Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable?'
      )
    }
    // Default to UK or fallback to DK in case of errors
    return 'uk'
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const isOnboarding = searchParams.get('onboarding') === 'true'
    const cartId = searchParams.get('cart_id')
    const checkoutStep = searchParams.get('step')
    const onboardingCookie = request.cookies.get('_medusa_onboarding')
    const cartIdCookie = request.cookies.get('_medusa_cart_id')

    const regionMap = await getRegionMap()

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

    const redirectPath =
      request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname

    const queryString = request.nextUrl.search ? request.nextUrl.search : ''

    let redirectUrl = request.nextUrl.href

    // Initialize response as NextResponse.next() by default
    // This helps prevent potential infinite redirect loops
    let response = NextResponse.next()

    // If no country code is set, we redirect to the relevant region.
    if (!urlHasCountryCode && countryCode) {
      // Prevent duplicate slashes when redirecting from root
      const cleanRedirectPath = redirectPath.startsWith('/') && redirectPath !== '/' 
        ? redirectPath 
        : redirectPath === '/' ? '' : `/${redirectPath}`
      
      redirectUrl = `${request.nextUrl.origin}/${countryCode}${cleanRedirectPath}${queryString}`
      response = NextResponse.redirect(redirectUrl, 307)
    }

    // If a cart_id is in the params, we set it as a cookie and redirect to the address step.
    if (cartId && !checkoutStep) {
      // Use the already set redirectUrl from above to avoid overwriting it
      if (response instanceof NextResponse && response.headers.get('Location')) {
        redirectUrl = response.headers.get('Location') || redirectUrl
      }
      
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
  } catch (error) {
    console.error('Middleware error:', error)
    // Return NextResponse.next() to allow the request to continue even if there's an error
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)'],
}
