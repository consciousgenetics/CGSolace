'use client'

import React from 'react'

import { Box } from '@modules/common/components/box'
import { convertToLocale } from '@lib/util/money'
import { HttpTypes } from '@medusajs/types'
import { Text } from '@modules/common/components/text'

type CartTotalsProps = {
  totals: HttpTypes.StoreCart
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
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
    // Use unit_price which should be in GBP from enrichLineItems
    return acc + (item.unit_price || 0) * (item.quantity || 0)
  }, 0) || 0

  // Calculate other totals in GBP
  const gbpTotal = gbpSubtotal + (shipping_total || 0) + (tax_total || 0) - (discount_total || 0)

  console.log('CartTotals: Using GBP amounts:', {
    subtotal: gbpSubtotal,
    total: gbpTotal,
    items: items?.map(item => ({
      title: item.title,
      unitPrice: item.unit_price,
      quantity: item.quantity,
      total: item.unit_price * item.quantity
    }))
  })

  // Only show warning when there are items but no price data at all
  const hasNoItemsWithPrice = items?.length > 0 && !items.some(item => item.unit_price !== undefined);
  
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
            {convertToLocale({ amount: gbpSubtotal, currency_code: 'gbp' })}
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
              {convertToLocale({ amount: discount_total || 0, currency_code: 'gbp' })}
            </span>
          </Box>
        )}
        <Box className="flex items-center justify-between">
          <span className="text-black">Delivery</span>
          <span
            className="text-lg text-black"
            data-value={shipping_total}
          >
            {convertToLocale({ amount: shipping_total || 0, currency_code: 'gbp' })}
          </span>
        </Box>
        <Box className="flex items-center justify-between">
          <span className="flex items-center gap-x-1 text-black">Taxes</span>
          <span
            data-value={tax_total}
            className="text-lg text-black"
          >
            {convertToLocale({ amount: tax_total || 0, currency_code: 'gbp' })}
          </span>
        </Box>
      </Box>
      <Box className="h-px w-full border-b border-gray-200" />
      <Box className="flex items-center justify-between text-lg text-black">
        <span>Total</span>
        <span data-value={gbpTotal}>
          {convertToLocale({ amount: gbpTotal, currency_code: 'gbp' })}
        </span>
      </Box>
    </Box>
  )
}

export default CartTotals
