import { HttpTypes } from '@medusajs/types'

import { getPercentageDiff } from './get-precentage-diff'
import { convertToLocale } from './money'

// Remove hardcoded prices - we will now rely on Medusa for all product pricing
// This encourages proper data management through the Medusa admin panel

export const getPricesForVariant = (variant: any) => {
  if (!variant) {
    console.warn('getPricesForVariant: No variant provided')
    return null
  }

  console.log('getPricesForVariant: Processing variant:', {
    id: variant.id,
    sku: variant.sku,
    calculated_price: variant.calculated_price,
    has_prices_array: Boolean(variant.prices),
    prices_length: variant.prices?.length,
    prices: variant.prices?.map(p => ({ currency: p.currency_code, amount: p.amount }))
  })

  // If we have prices array, try to find GBP price first
  if (variant.prices && variant.prices.length > 0) {
    console.log('getPricesForVariant: Searching for GBP price first')
    
    // First try to find a GBP price
    const gbpPrice = variant.prices.find(p => 
      p.currency_code?.toUpperCase() === 'GBP'
    )
    
    if (gbpPrice) {
      console.log('getPricesForVariant: Found GBP price:', gbpPrice)
      return {
        calculated_price_number: gbpPrice.amount,
        calculated_price: convertToLocale({
          amount: gbpPrice.amount,
          currency_code: 'GBP',
          locale: 'en-GB'
        }),
        original_price_number: gbpPrice.amount,
        original_price: convertToLocale({
          amount: gbpPrice.amount,
          currency_code: 'GBP',
          locale: 'en-GB'
        }),
        currency_code: 'GBP',
        price_type: null,
        percentage_diff: 0
      }
    }

    // If no GBP price, then try EUR or others
    console.log('getPricesForVariant: No GBP price found, using first available price')
    const price = variant.prices[0]
    return {
      calculated_price_number: price.amount,
      calculated_price: convertToLocale({
        amount: price.amount,
        currency_code: price.currency_code
      }),
      original_price_number: price.amount,
      original_price: convertToLocale({
        amount: price.amount,
        currency_code: price.currency_code
      }),
      currency_code: price.currency_code,
      price_type: null,
      percentage_diff: 0
    }
  }

  // Try calculated price as last resort
  if (variant.calculated_price) {
    const calculatedAmount = variant.calculated_price.calculated_amount ?? 0
    const originalAmount = variant.calculated_price.original_amount ?? calculatedAmount
    const currencyCode = variant.calculated_price.currency_code ?? 'GBP'

    console.log('getPricesForVariant: Using calculated price:', {
      calculatedAmount,
      originalAmount,
      currencyCode
    })

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
      price_type: variant.calculated_price.price_list_type ?? null,
      percentage_diff: getPercentageDiff(originalAmount, calculatedAmount),
    }
  }

  console.warn('getPricesForVariant: No valid price found for variant:', variant.id)
  return null
}

export function getProductPrice({
  product,
  variantId,
}: {
  product: HttpTypes.StoreProduct
  variantId?: string
}) {
  if (!product || !product.id) {
    console.warn('getProductPrice: No product provided')
    throw new Error('No product provided')
  }
  
  console.log(`getProductPrice: Processing product "${product.title}" (${product.id})`)

  const cheapestPrice = () => {
    console.log(`getProductPrice: Calculating cheapest price for "${product.title}"`)
    
    if (!product.variants?.length) {
      console.warn(`getProductPrice: No variants found for "${product.title}"`)
      return null
    }

    // Get prices for all variants
    const variantsWithPrices = product.variants
      .map(v => {
        const priceData = getPricesForVariant(v)
        return {
          variant: v,
          priceData
        }
      })
      .filter(v => v.priceData !== null)

    console.log(`getProductPrice: Found ${variantsWithPrices.length} variants with prices for "${product.title}"`)

    if (variantsWithPrices.length === 0) {
      console.warn(`getProductPrice: No variants with valid prices found for "${product.title}"`)
      return null
    }

    // Sort by price and take the cheapest
    const sorted = [...variantsWithPrices].sort(
      (a, b) => a.priceData!.calculated_price_number - b.priceData!.calculated_price_number
    )
    
    console.log(`getProductPrice: Cheapest variant for "${product.title}" is:`, sorted[0].variant.id)
    
    return {
      variantId: sorted[0].variant.id,
      price: sorted[0].priceData,
    }
  }

  // Find cheapest price across all variants
  const cheapest = cheapestPrice()

  // Find price for specific variant if variantId is provided
  const variantPriceData = () => {
    if (!variantId) {
      return cheapest?.price || null
    }

    const variant = product.variants.find((v) => v.id === variantId)

    if (!variant) {
      return cheapest?.price || null
    }

    const price = getPricesForVariant(variant)

    if (!price) {
      return cheapest?.price || null
    }

    return price
  }

  return {
    product,
    cheapestPrice: cheapest?.price || null,
    variantPrice: variantPriceData(),
  }
}
