'use client'

import React from 'react'
import { useParams } from 'next/navigation'

import { Box } from '@modules/common/components/box'
import { convertToLocale } from '@lib/util/money'
import { getCurrencyFromCountry, getPricesForVariant } from '@lib/util/get-product-price'
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

  // Calculate totals using the appropriate currency for the region
  const calculatedSubtotal = items?.reduce((acc, item) => {
    // Get the price for this variant in the correct currency
    const variantPrices = getPricesForVariant(item.variant, countryCode as string);
    
    // If we have a calculated price from variant, use that
    if (variantPrices && 
        typeof variantPrices.calculated_price_number === 'number' && 
        !isNaN(variantPrices.calculated_price_number)) {
      return acc + (variantPrices.calculated_price_number * (item.quantity || 0));
    }
    
    // Fallback to unit_price if available
    const hasValidUnitPrice = typeof item.unit_price === 'number' && 
                             !isNaN(item.unit_price) && 
                             item.unit_price > 0;
    
    if (hasValidUnitPrice) {
      return acc + (item.unit_price * (item.quantity || 0));
    }
    
    // Return acc unchanged if no valid price found
    return acc;
  }, 0) || 0;

  // Calculate other totals based on the calculated subtotal
  const calculatedTotal = calculatedSubtotal + (shipping_total || 0) + (tax_total || 0) - (discount_total || 0)

  console.log('CartTotals: Using correct currency amounts:', {
    currency,
    subtotal: calculatedSubtotal,
    total: calculatedTotal,
    items: items?.map(item => {
      const variantPrices = getPricesForVariant(item.variant, countryCode as string);
      return {
        title: item.title,
        unitPrice: item.unit_price,
        variantPrice: variantPrices?.calculated_price_number,
        quantity: item.quantity,
        currency: variantPrices?.currency_code || currency
      };
    })
  });

  // Only show warning when there are items but no price data at all
  const hasNoItemsWithPrice = items?.length > 0 && 
    !items.some(item => {
      const variantPrices = getPricesForVariant(item.variant, countryCode as string);
      
      const hasValidUnitPrice = typeof item.unit_price === 'number' && 
                              !isNaN(item.unit_price) && 
                              item.unit_price > 0;
                              
      const hasValidVariantPrice = typeof variantPrices?.calculated_price_number === 'number' && 
                                !isNaN(variantPrices?.calculated_price_number) && 
                                variantPrices?.calculated_price_number > 0;
                                
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
            data-value={calculatedSubtotal}
            className="text-lg text-black"
          >
            {convertToLocale({ 
              amount: calculatedSubtotal, 
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
        <span data-value={calculatedTotal}>
          {convertToLocale({ 
            amount: calculatedTotal, 
            currency_code: currency
          })}
        </span>
      </Box>
    </Box>
  )
}

export default CartTotals
