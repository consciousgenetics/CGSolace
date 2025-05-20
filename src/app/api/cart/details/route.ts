import { NextRequest, NextResponse } from 'next/server'
import { sdk } from '@lib/config'
import { getAuthHeaders } from '@lib/data/cookies'

// Get cart details by cartId - this avoids direct cookie manipulation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cartId = searchParams.get('cartId')
    
    if (!cartId) {
      console.log('Missing cartId in request params');
      return NextResponse.json({ 
        error: 'Cart ID is required in query params'
      }, { status: 400 })
    }
    
    // Log the cart ID for debugging
    console.log(`Fetching cart details for cart ID: ${cartId}`);
    
    try {
      // Get auth headers
      const authHeaders = await getAuthHeaders()
      
      try {
        // Simple approach - just use the SDK with a try/catch
        console.log('Attempting to retrieve cart from Medusa');
        const result = await sdk.store.cart.retrieve(
          cartId, 
          {}, 
          { 
            next: { tags: ['cart'] }, 
            ...authHeaders
          }
        );
        
        // Make sure cart exists and has expected structure
        if (!result || !result.cart) {
          console.log(`Cart not found or invalid for ID: ${cartId}`);
          return NextResponse.json({ 
            error: 'Cart not found or invalid response',
            cart: null
          }, { status: 404 })
        }
        
        const { cart } = result;
        
        // Log success for debugging
        console.log(`Successfully fetched cart with ${cart.items?.length || 0} items`);
        
        return NextResponse.json({
          cart: cart
        });
      } catch (error) {
        console.error('Error during cart retrieval:', error);

        if (error.message?.includes('not found')) {
          return NextResponse.json({ 
            error: 'Cart not found',
            details: 'The specified cart ID could not be found'
          }, { status: 404 })
        }
        
        throw error; // Re-throw to be caught by outer catch
      }
    } catch (sdkError) {
      console.error('Caught SDK error:', sdkError);
      return NextResponse.json({ 
        error: 'Error retrieving cart from Medusa',
        details: sdkError instanceof Error ? sdkError.message : 'Unknown SDK error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Fatal error in cart details API route:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve cart details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 