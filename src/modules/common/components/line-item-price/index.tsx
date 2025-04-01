import React from 'react'

import { cn } from '@lib/util/cn'
import { getPercentageDiff } from '@lib/util/get-precentage-diff'
import { getPricesForVariant } from '@lib/util/get-product-price'
import { convertToLocale } from '@lib/util/money'
import { HttpTypes } from '@medusajs/types'

import { Text } from '../text'

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  className?: string
  style?: 'default' | 'tight'
}

// Define a type for the price values to fix TypeScript errors
type PriceValues = {
  currency_code?: string;
  calculated_price_number?: number;
  original_price_number?: number;
}

const LineItemPrice = ({
  item,
  className,
  style = 'default',
}: LineItemPriceProps) => {
  // Try to get prices from variant first
  const prices = getPricesForVariant(item.variant) as PriceValues | null;
  
  // Check for direct unit_price from enrichLineItems
  const hasValidUnitPrice = typeof item.unit_price === 'number' && 
                           !isNaN(item.unit_price) && 
                           item.unit_price > 0;
  
  // Check for prices from variant calculation
  const hasValidVariantPrice = typeof prices?.calculated_price_number === 'number' && 
                              !isNaN(prices.calculated_price_number) && 
                              prices.calculated_price_number > 0;
  
  // Determine if we have any valid price to display
  const hasAnyValidPrice = hasValidUnitPrice || hasValidVariantPrice;
  
  // If no valid price is available, show price unavailable
  if (!hasAnyValidPrice) {
    return (
      <div className="flex items-center gap-x-2">
        <span className="text-md text-gray-500 italic" data-testid="product-price-unavailable">
          Price unavailable
        </span>
      </div>
    );
  }
  
  // Use optional chaining and nullish coalescing for safer access with fallbacks
  const currency_code = prices?.currency_code ?? 'GBP';
  const calculated_price_number = hasValidVariantPrice ? prices.calculated_price_number : 
                                 (hasValidUnitPrice ? item.unit_price : 0);
  const original_price_number = prices?.original_price_number ?? calculated_price_number;

  const adjustmentsSum = (item.adjustments || []).reduce(
    (acc, adjustment) => adjustment.amount + acc,
    0
  )

  const originalPrice = original_price_number * item.quantity
  const currentPrice = calculated_price_number * item.quantity - adjustmentsSum
  const hasReducedPrice = currentPrice < originalPrice

  return (
    <div
      className={cn(
        'flex flex-row-reverse items-center gap-2',
        className,
        'small:flex-col small:items-end small:gap-0'
      )}
    >
      {hasReducedPrice && (
        <>
          <div>
            {style === 'default' && (
              <span className="text-black">Original: </span>
            )}
            <Text
              size="md"
              className="text-gray-500 line-through"
              data-testid="product-original-price"
            >
              {convertToLocale({
                amount: originalPrice,
                currency_code,
              })}
            </Text>
          </div>
          {style === 'default' && (
            <span className="text-gray-700 font-latto">
              -{getPercentageDiff(originalPrice, currentPrice || 0)}%
            </span>
          )}
        </>
      )}
      <span className="text-lg text-black" data-testid="product-price">
        {convertToLocale({
          amount: currentPrice,
          currency_code,
        })}
      </span>
    </div>
  )
}

export default LineItemPrice
