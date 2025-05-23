import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

import { sdk } from '@lib/config'
import { getAuthHeaders, getCartId } from '@lib/data/cookies'

// Update cart properties
export async function POST(request: NextRequest) {
  try {
    const cartId = await getCartId()
    if (!cartId) {
      return NextResponse.json({ error: 'No cart found' }, { status: 400 })
    }
    
    const authHeaders = await getAuthHeaders()
    const body = await request.json()
    
    // Only allow updating specific properties
    const allowedProps = ['email']
    const updateData = {}
    
    for (const prop of allowedProps) {
      if (body[prop]) {
        updateData[prop] = body[prop]
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid properties to update' }, { status: 400 })
    }
    
    // Update the cart
    await sdk.store.cart.update(
      cartId,
      updateData,
      {},
      authHeaders
    )
    
    // Revalidate cart data
    revalidateTag('cart')
    
    return NextResponse.json({
      success: true,
      message: 'Cart updated successfully'
    })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json({ 
      error: 'Failed to update cart' 
    }, { status: 500 })
  }
} 