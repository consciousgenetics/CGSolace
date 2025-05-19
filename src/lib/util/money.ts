import { isEmpty } from './isEmpty'

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
  productTitle?: string
}

// Cache for formatters to avoid recreating them
const formatterCache = new Map<string, Intl.NumberFormat>();

// Map country codes to locales
const countryLocaleMap = {
  'gb': 'en-GB',
  'us': 'en-US',
  'dk': 'da-DK',
};

// Get locale from country code
export const getLocaleFromCountry = (countryCode?: string) => {
  if (!countryCode) return 'en-GB';
  return countryLocaleMap[countryCode.toLowerCase()] || 'en-GB';
};

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = 'en-GB',
  productTitle = ''
}: ConvertToLocaleParams) => {
  try {
    // Make sure amount is a valid number
    if (amount === undefined || amount === null || isNaN(amount)) {
      amount = 0
    }
    
    // Force uppercase to standardize currency code
    const normalizedCurrencyCode = (currency_code || 'GBP').toUpperCase();
    
    // Create a cache key for this formatter configuration
    const cacheKey = `${normalizedCurrencyCode}_${locale}_${minimumFractionDigits ?? ''}_${maximumFractionDigits ?? ''}`;
    
    if (formatterCache.has(cacheKey)) {
      const formatted = formatterCache.get(cacheKey)!.format(amount);
      return formatted;
    }
    
    // Create and cache the formatter
    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: normalizedCurrencyCode,
        minimumFractionDigits,
        maximumFractionDigits,
      });
      
      // Cache the formatter
      formatterCache.set(cacheKey, formatter);
      
      // Format the amount
      const formatted = formatter.format(amount);
      return formatted;
      
    } catch (error) {
      // Fall back to GBP
      const gbpFormatter = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits,
        maximumFractionDigits,
      });
      
      // Cache the formatter
      formatterCache.set(`GBP_${locale}_${minimumFractionDigits ?? ''}_${maximumFractionDigits ?? ''}`, gbpFormatter);
      
      const formatted = gbpFormatter.format(amount);
      return formatted;
    }
  } catch (error) {
    // Safe fallback that won't produce NaN
    const symbol = currency_code === 'USD' ? '$' : 
                  currency_code === 'EUR' ? '€' : '£';
      
    const formatted = `${symbol}${(amount && !isNaN(amount) ? amount : 0).toFixed(2)}`;
    return formatted;
  }
}
