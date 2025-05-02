import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { sdk } from '@lib/config'
import { getAuthHeaders } from '@lib/data/cookies'
import { getRegion } from '@lib/data/regions'
import { revalidateTag } from 'next/cache'
import { getProductByHandle } from '@lib/data/products'

// API endpoint to add the cheapest variant of a product to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productHandle, regionId, countryCode } = body
    
    if (!productHandle || !regionId || !countryCode) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required parameters: productHandle, regionId, and countryCode are required'
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
    
    // Get the product details
    const detailedProduct = await getProductByHandle(productHandle, regionId)
    
    if (!detailedProduct) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 })
    }
    
    // Find the cheapest variant
    const cheapestVariant = detailedProduct.variants.reduce(
      (cheapest, current) =>
        cheapest.calculated_price.original_amount <
        current.calculated_price.original_amount
          ? cheapest
          : current
    )
    
    if (cheapestVariant.inventory_quantity <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Product is out of stock'
      }, { status: 400 })
    }
    
    // Now we have the cheapest variant, let's add it to the cart
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
        message: 'Product added to cart',
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
        { variant_id: cheapestVariant.id, quantity: 1 },
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
          { variant_id: cheapestVariant.id, quantity: 1 },
          {},
          authHeaders
        )
        
        revalidateTag('cart')
        
        return NextResponse.json({
          success: true,
          message: 'Product added to cart',
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
          message: 'Product added to cart',
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
          { variant_id: cheapestVariant.id, quantity: 1 },
          {},
          authHeaders
        )
        
        revalidateTag('cart')
        return response
      }
    }
  } catch (error) {
    console.error('Error in add cheapest variant API route:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add item to cart'
    }, { status: 500 })
  }
} 