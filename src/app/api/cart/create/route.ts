import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

import { sdk } from '@lib/config'
import { getAuthHeaders } from '@lib/data/cookies'
import { getRegion } from '@lib/data/regions'
import { checkServerSideCookieConsent } from '@lib/util/cookie-consent'

// Create a new cart and set the cookie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { countryCode = 'uk' } = body

    // Check cookie consent
    const cookieHeader = request.headers.get('cookie')
    const hasConsent = checkServerSideCookieConsent(cookieHeader || '')
    
    // Get the region for the country code
    const region = await getRegion(countryCode)
    
    if (!region) {
      return NextResponse.json({ 
        error: `Region not found for country code: ${countryCode}`
      }, { status: 400 })
    }
    
    const authHeaders = await getAuthHeaders()
    
    // Create a new cart with the region
    const cartResponse = await sdk.store.cart.create(
      { region_id: region.id },
      {},
      authHeaders
    )
    
    const cart = cartResponse.cart
    
    // Create a response
    const response = NextResponse.json({
      success: true,
      cart: cart,
      cookieConsentRequired: !hasConsent
    })
    
    // Only set the cart ID cookie if user has consented
    if (hasConsent) {
      response.cookies.set('_medusa_cart_id', cart.id, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      })
    }
    
    // Safe to call revalidateTag here since we're in an API route
    revalidateTag('cart')
    
    return response
  } catch (error) {
    console.error('Error creating cart:', error)
    return NextResponse.json({ 
      error: 'Failed to create cart'
    }, { status: 500 })
  }
} 