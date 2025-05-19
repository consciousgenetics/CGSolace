import { HttpTypes } from '@medusajs/types'

import { getPercentageDiff } from './get-precentage-diff'
import { convertToLocale } from './money'

// Remove hardcoded prices - we will now rely on Medusa for all product pricing
// This encourages proper data management through the Medusa admin panel

// Cache product prices to prevent recalculation for the same variant
const priceCache = new Map()

// Map country codes to currency codes
const countryCurrencyMap = {
  'gb': 'GBP',
  'us': 'USD',
  'dk': 'EUR',
};

// Get currency code from country code
export const getCurrencyFromCountry = (countryCode?: string) => {
  if (!countryCode) return 'GBP';
  return countryCurrencyMap[countryCode.toLowerCase()] || 'GBP';
};

// Clear cache entry for specific product
export const clearPriceCache = (variantId: string) => {
  if (priceCache.has(variantId)) {
    priceCache.delete(variantId)
    return true
  }
  return false
}

export const getPricesForVariant = (variant: any, countryCode?: string) => {
  if (!variant) {
    return null
  }

  // Determine target currency based on country code
  const targetCurrency = getCurrencyFromCountry(countryCode);

  // Create a cache key that includes the country code
  const cacheKey = countryCode ? `${variant.id}_${countryCode}` : variant.id;
  
  if (cacheKey && priceCache.has(cacheKey)) {
    return priceCache.get(cacheKey)
  }

  // If we have prices array, find the right price for this country
  if (variant.prices && variant.prices.length > 0) {
    // Find a price matching the target currency
    const price = variant.prices.find(p => 
      p.currency_code?.toUpperCase() === targetCurrency
    );
    
    // Use the matching price if found
    if (price && typeof price.amount === 'number' && !isNaN(price.amount)) {
      const result = {
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
      
      // Cache the result
      if (cacheKey) priceCache.set(cacheKey, result)
      
      return result
    }
    
    // If no matching currency found, use the first price
    // but log a warning
    const fallbackPrice = variant.prices[0];
    if (fallbackPrice && typeof fallbackPrice.amount === 'number' && !isNaN(fallbackPrice.amount)) {
      console.warn(`No price found for currency ${targetCurrency}, using fallback currency ${fallbackPrice.currency_code}`);
      
      const result = {
        calculated_price_number: fallbackPrice.amount,
        calculated_price: convertToLocale({
          amount: fallbackPrice.amount,
          currency_code: fallbackPrice.currency_code
        }),
        original_price_number: fallbackPrice.amount,
        original_price: convertToLocale({
          amount: fallbackPrice.amount,
          currency_code: fallbackPrice.currency_code
        }),
        currency_code: fallbackPrice.currency_code,
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
    const currencyCode = variant.calculated_price.currency_code ?? targetCurrency

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

  // Return null when no price is available
  return null;
}

export function getProductPrice({
  product,
  variantId,
  countryCode,
}: {
  product: HttpTypes.StoreProduct
  variantId?: string
  countryCode?: string
}) {
  if (!product || !product.id) {
    throw new Error('No product provided')
  }

  const cheapestPrice = () => {
    // If no variants, return null
    if (!product.variants || !product.variants.length) {
      return null
    }

    // Get prices for all variants
    const prices = product.variants
      .map((v) => {
        const price = getPricesForVariant(v, countryCode)
        if (!price) return null
        return {
          ...price,
          variant_id: v.id,
        }
      })
      .filter(Boolean)

    // If no prices, return null
    if (!prices.length) {
      return null
    }

    // Find the cheapest price
    const cheapest = prices.reduce((acc, curr) => {
      if (
        acc.calculated_price_number === undefined ||
        curr.calculated_price_number < acc.calculated_price_number
      ) {
        return curr
      }
      return acc
    })

    return cheapest
  }

  const variantPriceData = () => {
    // If no variants or no variantId, return null
    if (!product.variants || !product.variants.length || !variantId) {
      return null
    }

    // Find the variant
    const variant = product.variants.find((v) => v.id === variantId)
    if (!variant) {
      return null
    }

    // Get price for the variant
    const price = getPricesForVariant(variant, countryCode)
    if (!price) {
      return null
    }

    return {
      ...price,
      variant_id: variant.id,
    }
  }

  // Get the cheapest price and the variant price
  const cheapest = cheapestPrice()
  const variant = variantPriceData()

  return {
    cheapestPrice: cheapest,
    variantPrice: variant,
  }
}