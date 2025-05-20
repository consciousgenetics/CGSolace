'use client'

/**
 * Client-side utility for setting the cart ID cookie via the API
 */
export const setCartIdCookie = async (cartId: string) => {
  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartId }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to set cart cookie')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error setting cart cookie:', error)
    throw error
  }
}

/**
 * Client-side utility for getting the cart ID from cookies
 */
export const getCartIdFromCookie = async (retryCount = 0) => {
  try {
    const response = await fetch('/api/cart', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Ensure we don't get a cached response
    })
    
    if (!response.ok) {
      // If we get a server error, retry a couple times
      if (response.status >= 500 && retryCount < 2) {
        console.warn(`Cart cookie fetch failed (${response.status}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 800 * (retryCount + 1))); // Increasing backoff
        return getCartIdFromCookie(retryCount + 1);
      }
      
      console.error(`Failed to get cart cookie: ${response.status}`);
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Error response:', errorText);
      return null;
    }
    
    const data = await response.json()
    return data.cartId
  } catch (error) {
    // If it's a network error, retry a couple times
    if (error instanceof TypeError && retryCount < 2) {
      console.warn('Network error getting cart cookie, retrying...');
      await new Promise(resolve => setTimeout(resolve, 800 * (retryCount + 1))); // Increasing backoff
      return getCartIdFromCookie(retryCount + 1);
    }
    
    console.error('Error getting cart cookie:', error)
    return null
  }
}

/**
 * Client-side utility for removing the cart ID cookie
 */
export const removeCartIdCookie = async () => {
  try {
    const response = await fetch('/api/cart', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to remove cart cookie')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error removing cart cookie:', error)
    throw error
  }
} 