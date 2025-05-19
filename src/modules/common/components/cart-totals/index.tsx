'use client'

import React from 'react'
import { useParams } from 'next/navigation'

import { Box } from '@modules/common/components/box'
import { convertToLocale } from '@lib/util/money'
import { getCurrencyFromCountry } from '@lib/util/get-product-price'
import { HttpTypes } from '@medusajs/types'
import { Text } from '@modules/common/components/text'

type CartTotalsProps = {
  totals: HttpTypes.StoreCart
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  // Get country code from URL params
  const { countryCode } = useParams();
  const currency = getCurrencyFromCountry(countryCode as string);

  const {
    total,
    tax_total,
    shipping_total,
    discount_total,
    subtotal,
    items,
    region
  } = totals

  // Calculate GBP totals from items
  const gbpSubtotal = items?.reduce((acc, item) => {
    // Only use price if it's a valid positive number
    // Check unit_price or variant calculated_price
    const variantPrice = item.variant?.calculated_price?.calculated_amount;
    
    // Validate we have a proper price before using it
    const hasValidUnitPrice = typeof item.unit_price === 'number' && 
                              !isNaN(item.unit_price) && 
                              item.unit_price > 0;
                              
    const hasValidVariantPrice = typeof variantPrice === 'number' && 
                                !isNaN(variantPrice) && 
                                variantPrice > 0;
    
    // Use the first valid price we find
    let price = 0;
    if (hasValidUnitPrice) {
      price = item.unit_price;
    } else if (hasValidVariantPrice) {
      price = variantPrice;
    }
    
    return acc + (price * (item.quantity || 0));
  }, 0) || 0;

  // Calculate other totals in GBP
  const gbpTotal = gbpSubtotal + (shipping_total || 0) + (tax_total || 0) - (discount_total || 0)

  console.log('CartTotals: Using GBP amounts:', {
    subtotal: gbpSubtotal,
    total: gbpTotal,
    items: items?.map(item => ({
      title: item.title,
      unitPrice: item.unit_price,
      variantPrice: item.variant?.calculated_price?.calculated_amount,
      quantity: item.quantity,
      itemTotal: (
        (typeof item.unit_price === 'number' && !isNaN(item.unit_price) && item.unit_price > 0) 
          ? item.unit_price * item.quantity 
          : 'price unavailable'
      )
    }))
  })

  // Only show warning when there are items but no price data at all
  const hasNoItemsWithPrice = items?.length > 0 && 
    !items.some(item => {
      const hasValidUnitPrice = typeof item.unit_price === 'number' && 
                              !isNaN(item.unit_price) && 
                              item.unit_price > 0;
                              
      const hasValidVariantPrice = typeof item.variant?.calculated_price?.calculated_amount === 'number' && 
                                !isNaN(item.variant?.calculated_price?.calculated_amount) && 
                                item.variant?.calculated_price?.calculated_amount > 0;
                                
      return hasValidUnitPrice || hasValidVariantPrice;
    });
  
  // Display message when prices are completely unavailable
  if (hasNoItemsWithPrice) {
    return (
      <Box className="flex flex-col gap-2 text-gray-700">
        <Text className="text-lg text-gray-500 italic">
          Price information unavailable. Please contact support.
        </Text>
      </Box>
    )
  }

  return (
    <Box className="flex flex-col gap-4 text-md text-black small:gap-5">
      <Box className="flex flex-col gap-2">
        <Box className="flex items-center justify-between">
          <span className="flex items-center gap-x-1 text-black">
            Subtotal (excl. shipping and taxes)
          </span>
          <span
            data-value={gbpSubtotal}
            className="text-lg text-black"
          >
            {convertToLocale({ 
              amount: gbpSubtotal, 
              currency_code: currency
            })}
          </span>
        </Box>
        {!!discount_total && (
          <Box className="flex items-center justify-between">
            <span className="text-black">Discount</span>
            <span
              className="text-black"
              data-testid="cart-discount"
              data-value={discount_total}
            >
              -{' '}
              {convertToLocale({ 
                amount: discount_total || 0, 
                currency_code: currency
              })}
            </span>
          </Box>
        )}
        <Box className="flex items-center justify-between">
          <span className="text-black">Delivery</span>
          <span
            className="text-lg text-black"
            data-value={shipping_total}
          >
            {convertToLocale({ 
              amount: shipping_total || 0, 
              currency_code: currency
            })}
          </span>
        </Box>
        <Box className="flex items-center justify-between">
          <span className="flex items-center gap-x-1 text-black">Taxes</span>
          <span
            data-value={tax_total}
            className="text-lg text-black"
          >
            {convertToLocale({ 
              amount: tax_total || 0, 
              currency_code: currency
            })}
          </span>
        </Box>
      </Box>
      <Box className="h-px w-full border-b border-gray-200" />
      <Box className="flex items-center justify-between text-lg text-black">
        <span>Total</span>
        <span data-value={gbpTotal}>
          {convertToLocale({ 
            amount: gbpTotal, 
            currency_code: currency
          })}
        </span>
      </Box>
    </Box>
  )
}

export default CartTotals
