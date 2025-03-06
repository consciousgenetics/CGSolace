import { notFound } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

import { HttpTypes } from '@medusajs/types'

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = 'uk'

// Skip middleware for static files
export const config = {
  matcher: [
    /*
     * Match all paths except static files and images
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg)$).*)'
  ],
}

// Default UK region with GBP
const UK_REGION = {
  id: "reg_01",
  name: "United Kingdom",
  currency_code: "gbp",
  countries: [
    { iso_2: "uk", display_name: "United Kingdom" }
  ]
};

/**
 * Middleware to handle region selection and force UK/GBP.
 */
export async function middleware(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const isOnboarding = searchParams.get('onboarding') === 'true'
    const cartId = searchParams.get('cart_id')
    const onboardingCookie = request.cookies.get('_medusa_onboarding')
    const cartIdCookie = request.cookies.get('_medusa_cart_id')

    // Check if URL already has UK country code
    const pathSegments = request.nextUrl.pathname.split('/')
    const firstSegment = pathSegments[1] || ''
    const urlHasUK = firstSegment.toLowerCase() === 'uk'

    // If URL doesn't have UK, redirect to UK version
    if (!urlHasUK) {
      const redirectUrl = new URL(request.url)
      redirectUrl.pathname = `/uk${request.nextUrl.pathname}`
      return NextResponse.redirect(redirectUrl)
    }

    // Return early if URL has UK and cookies are set
    if (
      urlHasUK &&
      (!isOnboarding || onboardingCookie) &&
      (!cartId || cartIdCookie)
    ) {
      return NextResponse.next()
    }

    let response = NextResponse.next()

    // Set onboarding cookie if needed
    if (isOnboarding && !onboardingCookie) {
      response.cookies.set('_medusa_onboarding', '1', {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    }

    // Set cart ID cookie if needed
    if (cartId && !cartIdCookie) {
      response.cookies.set('_medusa_cart_id', cartId, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}
