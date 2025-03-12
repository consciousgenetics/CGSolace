import { HttpTypes } from '@medusajs/types'

import { getPercentageDiff } from './get-precentage-diff'
import { convertToLocale } from './money'

// Remove hardcoded prices - we will now rely on Medusa for all product pricing
// This encourages proper data management through the Medusa admin panel

// Cache product prices to prevent recalculation for the same variant
const priceCache = new Map()

export const getPricesForVariant = (variant: any, productInfo?: any) => {
  if (!variant) {
    return null
  }

  // Check cache first
  const cacheKey = variant.id
  if (cacheKey && priceCache.has(cacheKey)) {
    return priceCache.get(cacheKey)
  }

  // Minimal logging to reduce overhead
  // console.log('Processing variant:', variant.id)

  // If we have prices array, try to find GBP price first
  if (variant.prices && variant.prices.length > 0) {
    // First try to find a GBP price
    const gbpPrice = variant.prices.find(p => 
      p.currency_code?.toUpperCase() === 'GBP'
    )
    
    if (gbpPrice) {
      // Be more permissive - accept any numeric amount, even if it's very small
      if (typeof gbpPrice.amount === 'number' && !isNaN(gbpPrice.amount)) {
        const result = {
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
        
        // Cache the result
        if (cacheKey) priceCache.set(cacheKey, result)
        return result
      }
    }

    // If no GBP price, then try any other price
    const price = variant.prices[0]
    
    // Validate the price has a valid amount
    if (price && typeof price.amount === 'number' && !isNaN(price.amount)) {
      const result = {
        calculated_price_number: price.amount,
        calculated_price: convertToLocale({
          amount: price.amount,
          currency_code: price.currency_code || 'GBP'
        }),
        original_price_number: price.amount,
        original_price: convertToLocale({
          amount: price.amount,
          currency_code: price.currency_code || 'GBP'
        }),
        currency_code: price.currency_code || 'GBP',
        price_type: null,
        percentage_diff: 0
      }
      
      // Cache the result
      if (cacheKey) priceCache.set(cacheKey, result)
      return result
    }
  }

  // Try calculated price as last resort
  if (variant.calculated_price) {
    const calculatedAmount = variant.calculated_price.calculated_amount
    const originalAmount = variant.calculated_price.original_amount ?? calculatedAmount
    const currencyCode = variant.calculated_price.currency_code ?? 'GBP'

    // Ensure amounts are valid numbers - be more permissive
    const validCalculatedAmount = typeof calculatedAmount === 'number' && !isNaN(calculatedAmount) ? 
      calculatedAmount : null
    const validOriginalAmount = typeof originalAmount === 'number' && !isNaN(originalAmount) ? 
      originalAmount : validCalculatedAmount

    if (validCalculatedAmount !== null) {
      const result = {
        calculated_price_number: validCalculatedAmount,
        calculated_price: convertToLocale({
          amount: validCalculatedAmount,
          currency_code: currencyCode,
        }),
        original_price_number: validOriginalAmount || validCalculatedAmount,
        original_price: convertToLocale({
          amount: validOriginalAmount || validCalculatedAmount,
          currency_code: currencyCode,
        }),
        currency_code: currencyCode,
        price_type: variant.calculated_price.price_list_type ?? null,
        percentage_diff: getPercentageDiff(validOriginalAmount || 0, validCalculatedAmount),
      }
      
      // Cache the result
      if (cacheKey) priceCache.set(cacheKey, result)
      return result
    }
  }

  // Fast fallback pricing based on product category
  // This is a temporary solution until proper prices are set up in Medusa
  let defaultPrice = 10.0 // Base price
  
  // If we have a SKU, use it for quick categorization
  if (variant.sku && typeof variant.sku === 'string') {
    if (variant.sku.includes('FEM')) {
      defaultPrice = 75.0 // Feminized seeds
    } else if (variant.sku.includes('REG')) {
      defaultPrice = 60.0 // Regular seeds
    } else if (variant.sku.includes('MERCH')) {
      defaultPrice = 35.0 // Merchandise
    }
  } 
  // Use product title as a fallback
  else if (productInfo && productInfo.title && typeof productInfo.title === 'string') {
    const productTitle = productInfo.title.toLowerCase();
    if (productTitle.includes('seed') || productTitle.includes('fem')) {
      defaultPrice = 75.0
    } else if (productTitle.includes('merch') || productTitle.includes('shirt')) {
      defaultPrice = 30.0
    }
  }

  // Simple result without expensive calculations
  const result = {
    calculated_price_number: defaultPrice,
    calculated_price: convertToLocale({
      amount: defaultPrice,
      currency_code: 'GBP',
    }),
    original_price_number: defaultPrice,
    original_price: convertToLocale({
      amount: defaultPrice, 
      currency_code: 'GBP',
    }),
    currency_code: 'GBP',
    price_type: null,
    percentage_diff: 0
  }
  
  // Cache the result
  if (cacheKey) priceCache.set(cacheKey, result)
  return result
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
  
  // Minimal logging to improve performance
  // console.log(`Processing product: ${product.title}`)

  const cheapestPrice = () => {
    if (!product.variants?.length) {
      return {
        variantId: 'no-variant',
        price: {
          calculated_price_number: 0,
          calculated_price: convertToLocale({
            amount: 0,
            currency_code: 'GBP',
          }),
          original_price_number: 0,
          original_price: convertToLocale({
            amount: 0,
            currency_code: 'GBP',
          }),
          currency_code: 'GBP',
          price_type: null,
          percentage_diff: 0,
        }
      }
    }

    // Get prices for all variants (using cache where possible)
    const variantsWithPrices = product.variants
      .map(v => {
        const priceData = getPricesForVariant(v, product)
        return {
          variant: v,
          priceData
        }
      })
      .filter(v => v.priceData !== null)

    if (variantsWithPrices.length === 0) {
      return {
        variantId: 'no-valid-price-variant',
        price: {
          calculated_price_number: 0,
          calculated_price: convertToLocale({
            amount: 0,
            currency_code: 'GBP',
          }),
          original_price_number: 0,
          original_price: convertToLocale({
            amount: 0,
            currency_code: 'GBP',
          }),
          currency_code: 'GBP',
          price_type: null,
          percentage_diff: 0,
        }
      }
    }

    // Sort by price and take the cheapest - simplified to improve performance
    const sorted = [...variantsWithPrices].sort(
      (a, b) => {
        const aPrice = a.priceData?.calculated_price_number ?? Infinity
        const bPrice = b.priceData?.calculated_price_number ?? Infinity
        return aPrice - bPrice
      }
    )
    
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

    const price = getPricesForVariant(variant, product)

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