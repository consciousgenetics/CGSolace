'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

/**
 * Client component that handles cart initialization
 * This avoids calling revalidateTag during server rendering
 */
export function CartInitializer() {
  const { countryCode } = useParams()
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    const initializeCart = async () => {
      try {
        setIsInitializing(true)
        
        // Check if we have a cart ID
        const response = await fetch('/api/cart', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to check cart')
        }
        
        const data = await response.json()
        
        // If no cart exists, create one
        if (!data.cartId) {
          // Create a new cart for the current region
          await fetch('/api/cart/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              countryCode: countryCode || 'uk' 
            }),
          })
        }
      } catch (error) {
        console.error('Error initializing cart:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeCart()
  }, [countryCode])

  // This component doesn't render anything visible
  return null
} 