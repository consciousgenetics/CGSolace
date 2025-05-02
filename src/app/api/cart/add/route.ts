import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { sdk } from '@lib/config'
import { getAuthHeaders } from '@lib/data/cookies'
import { getRegion } from '@lib/data/regions'
import { revalidateTag } from 'next/cache'

// API endpoint to add items to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { variantId, quantity, countryCode } = body
    
    if (!variantId || !quantity || !countryCode) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required parameters: variantId, quantity, and countryCode are required'
      }, { status: 400 })
    }
    
    // Get the region
    const region = await getRegion(countryCode)
    if (!region) {
      return NextResponse.json({ 
        success: false,
        error: `Region not found for country code: ${countryCode}`
      }, { status: 400 })
    }
    
    const authHeaders = await getAuthHeaders()
    const cookieStore = await cookies()
    const cartId = cookieStore.get('_medusa_cart_id')?.value
    
    // Create or retrieve cart
    let cart
    
    if (!cartId) {
      // Create new cart if no cartId exists
      const cartResponse = await sdk.store.cart.create(
        { region_id: region.id },
        {},
        authHeaders
      )
      cart = cartResponse.cart
      
      // Set cart ID cookie in the response
      const response = NextResponse.json({
        success: true,
        message: 'Cart created and item added',
        cart
      })
      
      response.cookies.set('_medusa_cart_id', cart.id, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      })
      
      // Add the line item to the cart
      await sdk.store.cart.createLineItem(
        cart.id,
        { variant_id: variantId, quantity },
        {},
        authHeaders
      )
      
      revalidateTag('cart')
      return response
    } else {
      // Use existing cart
      try {
        // First check if the cart exists and matches the region
        const cartResponse = await sdk.store.cart.retrieve(cartId, {}, { ...authHeaders })
        cart = cartResponse.cart
        
        // Update region if needed
        if (cart.region_id !== region.id) {
          await sdk.store.cart.update(
            cart.id,
            { region_id: region.id },
            {},
            authHeaders
          )
        }
        
        // Add the line item
        await sdk.store.cart.createLineItem(
          cart.id,
          { variant_id: variantId, quantity },
          {},
          authHeaders
        )
        
        revalidateTag('cart')
        
        return NextResponse.json({
          success: true,
          message: 'Item added to cart',
          cart
        })
      } catch (error) {
        // If cart retrieval fails, create a new one
        const cartResponse = await sdk.store.cart.create(
          { region_id: region.id },
          {},
          authHeaders
        )
        cart = cartResponse.cart
        
        // Set cart ID cookie in the response
        const response = NextResponse.json({
          success: true,
          message: 'New cart created and item added',
          cart
        })
        
        response.cookies.set('_medusa_cart_id', cart.id, {
          maxAge: 60 * 60 * 24 * 7,
          httpOnly: true,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
        })
        
        // Add the line item to the cart
        await sdk.store.cart.createLineItem(
          cart.id,
          { variant_id: variantId, quantity },
          {},
          authHeaders
        )
        
        revalidateTag('cart')
        return response
      }
    }
  } catch (error) {
    console.error('Error in add to cart API route:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add item to cart'
    }, { status: 500 })
  }
} 