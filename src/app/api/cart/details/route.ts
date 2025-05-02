import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { sdk } from '@lib/config'
import { getAuthHeaders } from '@lib/data/cookies'

// Get cart details by cartId - this avoids direct cookie manipulation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cartId = searchParams.get('cartId')
    
    if (!cartId) {
      return NextResponse.json({ 
        error: 'Cart ID is required in query params'
      }, { status: 400 })
    }
    
    const authHeaders = await getAuthHeaders()
    
    // Fetch cart from Medusa using the SDK
    const result = await sdk.store.cart
      .retrieve(cartId, {}, { next: { tags: ['cart'] }, ...authHeaders })
      .then(({ cart }) => cart)
      .catch((error) => {
        console.error('Error retrieving cart from Medusa:', error)
        return null
      })
    
    if (!result) {
      return NextResponse.json({ 
        error: 'Cart not found',
        cart: null
      }, { status: 404 })
    }
    
    return NextResponse.json({
      cart: result
    })
  } catch (error) {
    console.error('Error in cart details API route:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve cart details',
      cart: null
    }, { status: 500 })
  }
} 