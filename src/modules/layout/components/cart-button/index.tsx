'use client'

import { useEffect, useState } from 'react'
import { Box } from '@modules/common/components/box'
import { BagIcon } from '@modules/common/icons/bag'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getCartIdFromCookie } from '@lib/util/cart-client'
import { useCartStore } from '@lib/store/useCartStore'

export default function CartButton() {
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isCartUpdated, setCartUpdated } = useCartStore()

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get the cart ID from the cookie via API
        const cartId = await getCartIdFromCookie()
        
        if (!cartId) {
          setTotalItems(0)
          setIsLoading(false)
          return
        }
        
        // Fetch cart details using the cartId
        const cart = await fetchCartDetails(cartId)
        
        if (cart && cart.items) {
          const items = cart.items.reduce((acc, item) => {
            return acc + item.quantity
          }, 0)
          setTotalItems(items)
        } else {
          setTotalItems(0)
        }
        
        // Reset the cart updated flag
        setCartUpdated(false)
      } catch (error) {
        console.error('Error fetching cart:', error)
        setError(error instanceof Error ? error.message : 'Unknown error fetching cart')
        // Keep previous total if there was an error
      } finally {
        setIsLoading(false)
      }
    }

    // Helper function to fetch cart details using cartId
    const fetchCartDetails = async (cartId: string, retryCount = 0) => {
      if (!cartId) return null
      
      try {
        const response = await fetch(`/api/cart/details?cartId=${cartId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Cart details response not OK:', response.status, errorData)
          
          // If server error and we haven't tried too many times, retry
          if (response.status >= 500 && retryCount < 2) {
            console.log(`Retrying cart details fetch (attempt ${retryCount + 1})`)
            await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
            return fetchCartDetails(cartId, retryCount + 1)
          }
          
          throw new Error(errorData.error || `Failed to fetch cart details: ${response.status}`)
        }
        
        const data = await response.json()
        return data.cart
      } catch (error) {
        console.error('Error fetching cart details:', error)
        
        // If network error and we haven't tried too many times, retry
        if (error instanceof TypeError && retryCount < 2) {
          console.log(`Retrying cart details fetch after network error (attempt ${retryCount + 1})`)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          return fetchCartDetails(cartId, retryCount + 1)
        }
        
        throw error
      }
    }

    fetchCartData()
    
    // Set up an interval to refresh cart data periodically
    const intervalId = setInterval(fetchCartData, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(intervalId)
  }, [isCartUpdated, setCartUpdated])
  
  return (
    <Box className="z-50 h-full">
      <LocalizedClientLink href="/cart" data-testid="nav-cart-link">
        <Box className="relative rounded-full bg-transparent !p-2 text-white hover:bg-black/20 hover:text-white active:bg-black/30 active:text-white xsmall:!p-3.5">
          <BagIcon />
          {!isLoading && totalItems > 0 && (
            <span 
              style={{backgroundColor: '#FDB022'}} 
              className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full !bg-yellow-400 text-[10px] text-white"
            >
              {`${totalItems}`}
            </span>
          )}
        </Box>
      </LocalizedClientLink>
    </Box>
  )
}