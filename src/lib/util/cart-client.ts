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
export const getCartIdFromCookie = async () => {
  try {
    const response = await fetch('/api/cart', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to get cart cookie')
    }
    
    const data = await response.json()
    return data.cartId
  } catch (error) {
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