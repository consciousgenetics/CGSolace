'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// Remove the direct import from server functions
// import { addToCartCheapestVariant } from '@lib/data/cart'
import { useCartStore } from '@lib/store/useCartStore'
import { cn } from '@lib/util/cn'
import { Button } from '@modules/common/components/button'
import { toast } from '@modules/common/components/toast'
import { BagIcon, Spinner } from '@modules/common/icons'

export function ProductActions({
  productHandle,
  regionId,
}: {
  productHandle: string
  regionId: string
}) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { setCartUpdated } = useCartStore()
  const countryCode = useParams().countryCode as string
  const router = useRouter()

  const handleAddToCart = async () => {
    setIsAddingToCart(true)

    try {
      // Use the API endpoint instead of direct server function call
      const response = await fetch('/api/cart/add-cheapest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productHandle,
          regionId,
          countryCode,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add item to cart');
      }
      
      const result = await response.json();

      if (result.success) {
        toast('success', result.message)
        
        // Signal that cart was updated
        setCartUpdated(true)
      } else {
        toast('error', result.error)
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast('error', errorMessage);
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Button
      withIcon
      disabled={isAddingToCart}
      className={cn(
        'absolute bottom-2 right-2 opacity-100 p-1.5 small:p-2 transition-opacity duration-300 group-hover:opacity-100 small:bottom-3 small:right-3 medium:bottom-4 medium:right-4 large:opacity-0',
        { 'pointer-events-none !px-3 small:!px-4': isAddingToCart }
      )}
      onClick={handleAddToCart}
    >
      {isAddingToCart ? 
        <Spinner className="h-4 w-4 small:h-5 small:w-5" /> : 
        <BagIcon className="h-4 w-4 small:h-5 small:w-5" />
      }
    </Button>
  )
}
