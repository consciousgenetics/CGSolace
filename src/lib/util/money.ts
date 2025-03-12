import { isEmpty } from './isEmpty'

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

// Cache for formatters to avoid recreating them
const formatterCache = new Map<string, Intl.NumberFormat>();

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = 'en-GB',
}: ConvertToLocaleParams) => {
  try {
    // Make sure amount is a valid number
    if (amount === undefined || amount === null || isNaN(amount)) {
      amount = 0
    }
    
    // Force uppercase to standardize currency code
    const normalizedCurrencyCode = (currency_code || '').toUpperCase() || 'GBP';
    
    // Minimal debug logging
    // console.log(`Formatting ${amount} in ${normalizedCurrencyCode}`)
    
    // Create a cache key for this formatter configuration
    const cacheKey = `${normalizedCurrencyCode}_${locale}_${minimumFractionDigits ?? ''}_${maximumFractionDigits ?? ''}`;
    
    // Try to use a cached formatter
    if (formatterCache.has(cacheKey)) {
      return formatterCache.get(cacheKey)!.format(amount);
    }
    
    // If we have a valid currency code, create and cache formatter
    if (!isEmpty(normalizedCurrencyCode)) {
      try {
        // Create a new formatter
        const formatter = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: normalizedCurrencyCode,
          minimumFractionDigits,
          maximumFractionDigits,
        });
        
        // Cache the formatter
        formatterCache.set(cacheKey, formatter);
        
        // Format the amount
        return formatter.format(amount);
      } catch (currencyError) {
        // Fall back to GBP
        const gbpFormatter = new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'GBP',
          minimumFractionDigits,
          maximumFractionDigits,
        });
        
        // Cache the formatter
        formatterCache.set(`GBP_${locale}_${minimumFractionDigits ?? ''}_${maximumFractionDigits ?? ''}`, gbpFormatter);
        
        return gbpFormatter.format(amount);
      }
    }
    
    // Default to GBP if no currency code is provided
    const defaultFormatter = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits,
      maximumFractionDigits,
    });
    
    // Cache the formatter
    const defaultKey = `GBP_${locale}_${minimumFractionDigits ?? ''}_${maximumFractionDigits ?? ''}`;
    formatterCache.set(defaultKey, defaultFormatter);
    
    return defaultFormatter.format(amount);
  } catch (error) {
    // Safe fallback that won't produce NaN - no logging to improve performance
    return `£${(amount && !isNaN(amount) ? amount : 0).toFixed(2)}`;
  }
}
