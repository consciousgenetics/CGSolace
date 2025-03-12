import React from 'react'

import { getProductPrice } from '@lib/util/get-product-price'
import { HttpTypes } from '@medusajs/types'
import { convertToLocale } from '@lib/util/money'

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  try {
    const { cheapestPrice, variantPrice } = getProductPrice({
      product,
      variantId: variant?.id,
    })

    // Use variant price if available, otherwise use cheapest price
    const selectedPrice = variant ? variantPrice : cheapestPrice
    
    console.log(`ProductPrice component for ${product.title}:`, {
      selectedPrice,
      calculated_price_number: selectedPrice?.calculated_price_number,
      calculated_price: selectedPrice?.calculated_price,
      price_type: selectedPrice?.price_type
    })

    // If no price data is available, show a formatted message
    if (!selectedPrice || 
        selectedPrice.calculated_price_number === undefined || 
        selectedPrice.calculated_price_number === null || 
        isNaN(selectedPrice.calculated_price_number)) {
      
      console.log('Missing or invalid price data for product:', product.title)
      return (
        <div className="flex items-center gap-x-2">
          <span className="text-2xl text-basic-primary">
            <span
              data-testid="product-price"
              data-value={0}
              className="text-gray-500 italic"
            >
              Price unavailable
            </span>
          </span>
        </div>
      )
    }

    // Remove the additional check for zero prices - accept any valid number
    // We're being more permissive with price data now
    
    // Standard price display for valid prices
    return (
      <div className="flex items-center gap-x-2">
        <span className="text-2xl text-basic-primary">
          {!variant && 'From '}
          <span
            data-testid="product-price"
            data-value={selectedPrice.calculated_price_number}
          >
            {selectedPrice.calculated_price}
          </span>
        </span>
        {selectedPrice.price_type === 'sale' && (
          <>
            <p>
              <span
                className="text-md text-secondary line-through"
                data-testid="original-product-price"
                data-value={selectedPrice.original_price_number}
              >
                {selectedPrice.original_price}
              </span>
            </p>
          </>
        )}
      </div>
    )
  } catch (error) {
    // If any error occurs during price calculation, show a fallback
    console.error('Error calculating product price:', error)
    return (
      <div className="flex items-center gap-x-2">
        <span className="text-2xl text-basic-primary">
          <span
            data-testid="product-price"
            data-value={0}
            className="text-gray-500 italic"
          >
            Price unavailable
          </span>
        </span>
      </div>
    )
  }
}