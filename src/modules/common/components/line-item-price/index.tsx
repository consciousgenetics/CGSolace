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
  isInCartDropdown?: boolean
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
  isInCartDropdown = false,
}: LineItemPriceProps) => {
  // Safely get price data with proper typing
  const prices = getPricesForVariant(item.variant) as PriceValues | null;
  
  // Use optional chaining and nullish coalescing for safer access
  const currency_code = prices?.currency_code ?? 'USD';
  const calculated_price_number = prices?.calculated_price_number ?? 0;
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
        isInCartDropdown
          ? 'small:flex-row-reverse'
          : 'small:flex-col small:items-end small:gap-0'
      )}
    >
      {hasReducedPrice && (
        <>
          <div>
            {style === 'default' && (
              <span className="text-basic-primary">Original: </span>
            )}
            <Text
              size="md"
              className="text-secondary line-through"
              data-testid="product-original-price"
            >
              {convertToLocale({
                amount: originalPrice,
                currency_code,
              })}
            </Text>
          </div>
          {style === 'default' && (
            <span className="text-ui-fg-interactive">
              -{getPercentageDiff(originalPrice, currentPrice || 0)}%
            </span>
          )}
        </>
      )}
      <span className="text-lg text-basic-primary" data-testid="product-price">
        {convertToLocale({
          amount: currentPrice,
          currency_code,
        })}
      </span>
    </div>
  )
}

export default LineItemPrice
