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
    // Special debug logging for the problematic product
    const isStoner = product.title?.includes('Conscious Stoner Jumper');
    if (isStoner) {
      console.log('Debug Conscious Stoner Jumper:', {
        title: product.title,
        handle: product.handle,
        context: 'Before price calculation',
        productId: product.id,
        variantId: variant?.id
      });
    }

    const { cheapestPrice, variantPrice } = getProductPrice({
      product,
      variantId: variant?.id,
    })

    // Use variant price if available, otherwise use cheapest price
    const selectedPrice = variant ? variantPrice : cheapestPrice
    
    // Debug log for the problematic product after price calc
    if (isStoner) {
      console.log('Debug Stoner Price details:', {
        selectedPrice,
        currency: selectedPrice?.currency_code,
        calculated_price: selectedPrice?.calculated_price,
        amount: selectedPrice?.calculated_price_number,
        rawHtml: selectedPrice?.calculated_price ? `<span>${selectedPrice.calculated_price}</span>` : 'No price'
      });
    }
    
    // Force all prices to be shown in GBP regardless of the product
    if (selectedPrice?.currency_code?.toUpperCase() !== 'GBP') {
      console.log('Converting price to GBP for product:', {
        product: product.title,
        variant: variant?.title || 'Default variant',
        originalCurrency: selectedPrice?.currency_code
      });
      
      // Force GBP for this product
      if (selectedPrice?.calculated_price_number) {
        selectedPrice.calculated_price = convertToLocale({
          amount: selectedPrice.calculated_price_number,
          currency_code: 'GBP',
          productTitle: product.title
        });
      }
      
      if (selectedPrice?.original_price_number) {
        selectedPrice.original_price = convertToLocale({
          amount: selectedPrice.original_price_number,
          currency_code: 'GBP',
          productTitle: product.title
        });
      }
      
      if (selectedPrice) {
        selectedPrice.currency_code = 'GBP';
      }
    } else if (isStoner) {
      // Even if the currency is already GBP, reformat for the Stoner product
      if (selectedPrice?.calculated_price_number) {
        selectedPrice.calculated_price = convertToLocale({
          amount: selectedPrice.calculated_price_number,
          currency_code: 'GBP',
          productTitle: product.title
        });
      }
      
      if (selectedPrice?.original_price_number) {
        selectedPrice.original_price = convertToLocale({
          amount: selectedPrice.original_price_number,
          currency_code: 'GBP',
          productTitle: product.title
        });
      }
    }
    
    // If no price data is available, show a formatted message
    if (!selectedPrice || 
        selectedPrice.calculated_price_number === undefined || 
        selectedPrice.calculated_price_number === null || 
        isNaN(selectedPrice.calculated_price_number)) {
      
      console.log('Missing or invalid price data for product:', product.title)
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

    // Final debug check for the Stoner Jumper
    if (isStoner) {
      console.log('Final Stoner price display:', {
        calculatedPrice: selectedPrice.calculated_price,
        currencyCode: selectedPrice.currency_code
      });
    }

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
            {selectedPrice.calculated_price}
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