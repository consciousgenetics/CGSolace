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

// Helper function to normalize currency codes for case-insensitive comparison
export const normalizeCurrency = (currency: string): string => {
  return (currency || '').toUpperCase();
};

// Currency conversion rates for fallback scenarios
// These rates should be updated regularly in a production environment
const conversionRates = {
  'EUR_GBP': 0.85,
  'USD_GBP': 0.77,
  'GBP_EUR': 1.18,
  'USD_EUR': 0.91,
  'GBP_USD': 1.30,
  'EUR_USD': 1.10
};

// Helper to convert amount between currencies
const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  // Normalize currency codes to uppercase
  const fromCurrencyNormalized = normalizeCurrency(fromCurrency);
  const toCurrencyNormalized = normalizeCurrency(toCurrency);
  
  if (fromCurrencyNormalized === toCurrencyNormalized) return amount;
  
  const rateKey = `${fromCurrencyNormalized}_${toCurrencyNormalized}`;
  const rate = conversionRates[rateKey];
  
  if (!rate) {
    console.warn(`No conversion rate found for ${rateKey}, using fallback conversion`);
    
    // Add fallback logic for common currency pairs
    if (fromCurrencyNormalized === 'GBP' && toCurrencyNormalized === 'USD') {
      return amount * 1.30; // GBP to USD fallback rate
    } 
    else if (fromCurrencyNormalized === 'USD' && toCurrencyNormalized === 'GBP') {
      return amount * 0.77; // USD to GBP fallback rate
    }
    else if (toCurrencyNormalized === 'USD') {
      // For any currency to USD, use a reasonable fallback
      return amount * 1.2;
    }
    else if (toCurrencyNormalized === 'GBP') {
      // For any currency to GBP, use a reasonable fallback
      return amount * 0.8;
    }
    
    return amount; // Last resort, return unchanged amount
  }
  
  return amount * rate;
};

export const getPricesForVariant = (variant: any, countryCode?: string) => {
  if (!variant) {
    return null
  }

  // Determine target currency based on country code
  const targetCurrency = getCurrencyFromCountry(countryCode);

  // Create a cache key that includes the country code
  const cacheKey = countryCode ? `${variant.id}_${countryCode}` : variant.id;
  
  // Debug logging for price issues
  const debugVariant = variant.id.startsWith('variant_') && variant.id.length > 15;
  
  if (debugVariant) {
    console.log(`Price debug for variant ${variant.id} with country ${countryCode}:`);
    console.log(`- Target currency: ${targetCurrency}`);
    if (variant.prices) {
      console.log(`- Available prices: ${JSON.stringify(variant.prices.map((p: any) => ({ 
        currency: p.currency_code, 
        amount: p.amount 
      })))}`);
    }
  }
  
  if (cacheKey && priceCache.has(cacheKey)) {
    if (debugVariant) console.log(`- Using cached price for ${cacheKey}`);
    return priceCache.get(cacheKey)
  }

  // If we have prices array, find the right price for this country
  if (variant.prices && variant.prices.length > 0) {
    // For GB locale (GBP), first try to find an exact GBP price before anything else
    if (normalizeCurrency(targetCurrency) === 'GBP') {
      // Find ALL GBP prices and pick the lowest one
      const gbpPrices = variant.prices
        .filter((p: any) => normalizeCurrency(p.currency_code) === 'GBP')
        .filter((p: any) => typeof p.amount === 'number' && !isNaN(p.amount));
      
      if (gbpPrices.length > 0) {
        // Sort by amount and take the lowest
        const lowestGbpPrice = gbpPrices.sort((a: any, b: any) => a.amount - b.amount)[0];
        
        if (debugVariant) {
          if (gbpPrices.length > 1) {
            console.log(`- Found ${gbpPrices.length} GBP prices, using lowest: ${lowestGbpPrice.amount}`);
          } else {
            console.log(`- Found GBP price: ${lowestGbpPrice.amount}`);
          }
        }
        
        const result = {
          calculated_price_number: lowestGbpPrice.amount,
          calculated_price: convertToLocale({
            amount: lowestGbpPrice.amount,
            currency_code: 'GBP'
          }),
          original_price_number: lowestGbpPrice.amount,
          original_price: convertToLocale({
            amount: lowestGbpPrice.amount,
            currency_code: 'GBP'
          }),
          currency_code: 'GBP',
          price_type: null,
          percentage_diff: 0
        }
        
        // Cache the result
        if (cacheKey) priceCache.set(cacheKey, result)
        
        return result
      }
      
      if (debugVariant) console.log(`- No GBP price found, will try fallbacks`);
    }
    
    // Find all prices matching the target currency (case insensitive)
    const matchingPrices = variant.prices
      .filter((p: any) => normalizeCurrency(p.currency_code) === normalizeCurrency(targetCurrency))
      .filter((p: any) => typeof p.amount === 'number' && !isNaN(p.amount));
    
    // Use the matching price if found
    if (matchingPrices.length > 0) {
      // Sort by amount and take the lowest price
      const lowestPrice = matchingPrices.sort((a: any, b: any) => a.amount - b.amount)[0];
      
      if (debugVariant) {
        if (matchingPrices.length > 1) {
          console.log(`- Found ${matchingPrices.length} ${targetCurrency} prices, using lowest: ${lowestPrice.amount}`);
        } else {
          console.log(`- Found matching price in ${lowestPrice.currency_code}: ${lowestPrice.amount}`);
        }
      }
      
      const result = {
        calculated_price_number: lowestPrice.amount,
        calculated_price: convertToLocale({
          amount: lowestPrice.amount,
          currency_code: targetCurrency
        }),
        original_price_number: lowestPrice.amount,
        original_price: convertToLocale({
          amount: lowestPrice.amount,
          currency_code: targetCurrency
        }),
        currency_code: targetCurrency,
        price_type: null,
        percentage_diff: 0
      }
      
      // Cache the result
      if (cacheKey) priceCache.set(cacheKey, result)
      
      return result
    }
    
    // If no matching currency found, use the first available price
    // but CONVERT THE AMOUNT to the target currency
    const fallbackPrice = variant.prices[0];
    if (fallbackPrice && typeof fallbackPrice.amount === 'number' && !isNaN(fallbackPrice.amount)) {
      if (debugVariant) {
        console.log(`- No exact price match for currency ${targetCurrency}, converting from ${fallbackPrice.currency_code}`);
      }
      
      // Convert the amount from the fallback currency to the target currency
      const convertedAmount = convertCurrency(
        fallbackPrice.amount, 
        fallbackPrice.currency_code, 
        targetCurrency
      );
      
      if (debugVariant) {
        console.log(`- Converted ${fallbackPrice.amount} ${fallbackPrice.currency_code} to ${convertedAmount} ${targetCurrency}`);
      }
      
      const result = {
        calculated_price_number: convertedAmount,
        calculated_price: convertToLocale({
          amount: convertedAmount,
          currency_code: targetCurrency
        }),
        original_price_number: convertedAmount,
        original_price: convertToLocale({
          amount: convertedAmount,
          currency_code: targetCurrency
        }),
        currency_code: targetCurrency,
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
    if (debugVariant) console.log(`- Using calculated_price as fallback`);
    
    const calculatedAmount = variant.calculated_price.calculated_amount
    const originalAmount = variant.calculated_price.original_amount ?? calculatedAmount
    const srcCurrencyCode = variant.calculated_price.currency_code
    
    // Ensure amounts are valid numbers - be more permissive
    const validCalculatedAmount = typeof calculatedAmount === 'number' && !isNaN(calculatedAmount) ? 
      calculatedAmount : null
    const validOriginalAmount = typeof originalAmount === 'number' && !isNaN(originalAmount) ? 
      originalAmount : validCalculatedAmount

    if (validCalculatedAmount !== null) {
      // If source currency is different from target, convert the amount
      let finalCalculatedAmount = validCalculatedAmount;
      let finalOriginalAmount = validOriginalAmount || validCalculatedAmount;
      
      if (srcCurrencyCode && normalizeCurrency(srcCurrencyCode) !== normalizeCurrency(targetCurrency)) {
        if (debugVariant) {
          console.log(`- Converting calculated price from ${srcCurrencyCode} to ${targetCurrency}`);
        }
        
        finalCalculatedAmount = convertCurrency(
          validCalculatedAmount, 
          srcCurrencyCode, 
          targetCurrency
        );
        
        finalOriginalAmount = convertCurrency(
          validOriginalAmount || validCalculatedAmount,
          srcCurrencyCode,
          targetCurrency
        );
      }
      
      const result = {
        calculated_price_number: finalCalculatedAmount,
        calculated_price: convertToLocale({
          amount: finalCalculatedAmount,
          currency_code: targetCurrency,
        }),
        original_price_number: finalOriginalAmount,
        original_price: convertToLocale({
          amount: finalOriginalAmount,
          currency_code: targetCurrency,
        }),
        currency_code: targetCurrency,
        price_type: variant.calculated_price.price_list_type ?? null,
        percentage_diff: getPercentageDiff(finalOriginalAmount || 0, finalCalculatedAmount),
      }
      
      // Cache the result
      if (cacheKey) priceCache.set(cacheKey, result)
      
      return result
    }
  }

  // Return null when no price is available
  if (debugVariant) console.log(`- No price available for variant ${variant.id}`);
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

    // Find the cheapest price among all prices
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