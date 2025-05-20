import React, { useEffect } from 'react'
import { useParams } from 'next/navigation'

import { getProductPrice, getCurrencyFromCountry, clearPriceCache } from '@lib/util/get-product-price'
import { HttpTypes } from '@medusajs/types'
import { convertToLocale } from '@lib/util/money'

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  // Get country code from URL params
  const { countryCode } = useParams();
  
  // Clear any cached prices when the component mounts to ensure fresh calculation
  useEffect(() => {
    if (product?.variants) {
      product.variants.forEach(v => {
        clearPriceCache(v.id);
      });
    }
  }, [product?.id, countryCode]);
  
  try {
    // Get the currency for the current country
    const targetCurrency = getCurrencyFromCountry(countryCode as string);
    
    console.log(`ProductPrice: Fetching price for product ${product.title} with country ${countryCode}, currency ${targetCurrency}`);
    
    const { cheapestPrice, variantPrice } = getProductPrice({
      product,
      variantId: variant?.id,
      countryCode: countryCode as string
    })

    // Use variant price if available, otherwise use cheapest price
    const selectedPrice = variant ? variantPrice : cheapestPrice
    
    // Extra check to ensure currency matches expected
    if (selectedPrice && selectedPrice.currency_code !== targetCurrency) {
      console.warn(`Currency mismatch in ProductPrice: got ${selectedPrice.currency_code}, expected ${targetCurrency} for product ${product.title}`);
    }
    
    // If no price data is available, show a formatted message
    if (!selectedPrice || 
        selectedPrice.calculated_price_number === undefined || 
        selectedPrice.calculated_price_number === null || 
        isNaN(selectedPrice.calculated_price_number)) {
      
      return (
        <div className="flex items-center gap-x-2">
          <span className="text-2xl text-black">
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

    // Format prices with the appropriate currency
    const calculatedPrice = convertToLocale({
      amount: selectedPrice.calculated_price_number,
      currency_code: targetCurrency // Always use target currency
    });
    
    const originalPrice = selectedPrice.original_price_number ? 
      convertToLocale({
        amount: selectedPrice.original_price_number,
        currency_code: targetCurrency // Always use target currency
      }) : calculatedPrice;

    // Standard price display for valid prices
    return (
      <div className="flex items-center gap-x-2">
        <span className="text-2xl text-black">
          {!variant && 'From '}
          <span
            data-testid="product-price"
            data-value={selectedPrice.calculated_price_number}
            className="text-black"
          >
            {calculatedPrice}
          </span>
        </span>
        {selectedPrice.price_type === 'sale' && (
          <>
            <p>
              <span
                className="text-md text-gray-500 line-through"
                data-testid="original-product-price"
                data-value={selectedPrice.original_price_number}
              >
                {originalPrice}
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
        <span className="text-2xl text-black">
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