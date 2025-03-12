import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to set cart ID cookie properly within a route handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartId } = body
    
    if (!cartId) {
      return NextResponse.json({ 
        error: 'Cart ID is required'
      }, { status: 400 })
    }
    
    // Create a response
    const response = NextResponse.json({ 
      success: true,
      message: 'Cart ID cookie set successfully'
    })
    
    // Set cookie on the response
    response.cookies.set('_medusa_cart_id', cartId, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('Error in cart API route:', error)
    return NextResponse.json({ 
      error: 'Failed to process cart operation'
    }, { status: 500 })
  }
}

// Helper to delete cart ID cookie
export async function DELETE() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Cart ID cookie removed successfully'
    })
    
    response.cookies.set('_medusa_cart_id', '', {
      maxAge: -1,
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('Error in cart API route (DELETE):', error)
    return NextResponse.json({ 
      error: 'Failed to delete cart cookie'
    }, { status: 500 })
  }
}

// Helper to get cart ID from cookie
export async function GET() {
  try {
    const cookieStore = await cookies()
    const cartId = cookieStore.get('_medusa_cart_id')?.value
    
    return NextResponse.json({
      cartId: cartId || null
    })
  } catch (error) {
    console.error('Error in cart API route (GET):', error)
    return NextResponse.json({ 
      error: 'Failed to get cart ID'
    }, { status: 500 })
  }
} 