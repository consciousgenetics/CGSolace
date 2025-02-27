import { HttpTypes } from '@medusajs/types'

import { getPercentageDiff } from './get-precentage-diff'
import { convertToLocale } from './money'

export const getPricesForVariant = (variant: any) => {
  if (!variant || !variant.calculated_price) {
    return null
  }

  const calculatedAmount = variant.calculated_price.calculated_amount ?? 0
  const originalAmount = variant.calculated_price.original_amount ?? calculatedAmount
  const currencyCode = variant.calculated_price.currency_code ?? 'USD'

  return {
    calculated_price_number: calculatedAmount,
    calculated_price: convertToLocale({
      amount: calculatedAmount,
      currency_code: currencyCode,
    }),
    original_price_number: originalAmount,
    original_price: convertToLocale({
      amount: originalAmount,
      currency_code: currencyCode,
    }),
    currency_code: currencyCode,
    price_type: variant.calculated_price.calculated_price?.price_list_type ?? null,
    percentage_diff: getPercentageDiff(
      originalAmount,
      calculatedAmount
    ),
  }
}

export function getProductPrice({
  product,
  variantId,
}: {
  product: HttpTypes.StoreProduct
  variantId?: string
}) {
  if (!product || !product.id) {
    throw new Error('No product provided')
  }

  const cheapestPrice = () => {
    if (!product || !product.variants?.length) {
      return null
    }

    const variantsWithPrice = product.variants
      .filter((v: any) => v && v.calculated_price);
    
    if (variantsWithPrice.length === 0) {
      return null;
    }

    const cheapestVariant: any = variantsWithPrice
      .sort((a: any, b: any) => {
        const aPrice = a.calculated_price?.calculated_amount ?? Infinity;
        const bPrice = b.calculated_price?.calculated_amount ?? Infinity;
        return aPrice - bPrice;
      })[0]

    return getPricesForVariant(cheapestVariant)
  }

  const variantPrice = () => {
    if (!product || !variantId) {
      return null
    }

    const variant: any = product.variants?.find(
      (v) => v.id === variantId || v.sku === variantId
    )

    if (!variant) {
      return null
    }

    return getPricesForVariant(variant)
  }

  return {
    product,
    cheapestPrice: cheapestPrice(),
    variantPrice: variantPrice(),
  }
}
