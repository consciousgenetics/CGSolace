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
    
    // Special handling for problematic product
    const isStoner = productTitle?.includes('Conscious Stoner Jumper');
    if (isStoner) {
      console.log('Money formatting for Conscious Stoner Jumper:', {
        amount,
        originalCurrency: currency_code,
        locale
      });
    }
    
    // Force uppercase to standardize currency code and always default to GBP if empty or invalid
    let normalizedCurrencyCode = (currency_code || '').toUpperCase();
    
    // Always use GBP for this site
    if (!normalizedCurrencyCode || normalizedCurrencyCode !== 'GBP') {
      if (isStoner) {
        console.log('Forcing GBP currency for Stoner Jumper from:', normalizedCurrencyCode);
      }
      normalizedCurrencyCode = 'GBP';
    }
    
    // Create a cache key for this formatter configuration
    const cacheKey = `${normalizedCurrencyCode}_${locale}_${minimumFractionDigits ?? ''}_${maximumFractionDigits ?? ''}`;
    
    // Don't use cache for the problematic product
    if (!isStoner && formatterCache.has(cacheKey)) {
      const formatted = formatterCache.get(cacheKey)!.format(amount);
      return formatted;
    }
    
    // Create and cache the formatter
    try {
      // Create a new formatter with explicit GBP for the problematic product
      const currency = isStoner ? 'GBP' : normalizedCurrencyCode;
      
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
      });
      
      // Cache the formatter unless it's for the problematic product
      if (!isStoner) {
        formatterCache.set(cacheKey, formatter);
      }
      
      // Format the amount
      const formatted = formatter.format(amount);
      
      if (isStoner) {
        console.log('Formatted Stoner price:', {
          amount,
          currency,
          result: formatted
        });
      }
      
      return formatted;
    } catch (error) {
      // Fall back to GBP
      const gbpFormatter = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits,
        maximumFractionDigits,
      });
      
      // Cache the formatter unless it's for the problematic product
      if (!isStoner) {
        formatterCache.set(`GBP_${locale}_${minimumFractionDigits ?? ''}_${maximumFractionDigits ?? ''}`, gbpFormatter);
      }
      
      const formatted = gbpFormatter.format(amount);
      
      if (isStoner) {
        console.log('Fallback formatted Stoner price:', {
          amount,
          currency: 'GBP',
          result: formatted
        });
      }
      
      return formatted;
    }
  } catch (error) {
    // Safe fallback that won't produce NaN
    const formatted = `£${(amount && !isNaN(amount) ? amount : 0).toFixed(2)}`;
    
    if (productTitle?.includes('Conscious Stoner Jumper')) {
      console.log('Emergency fallback for Stoner price:', {
        amount,
        result: formatted
      });
    }
    
    return formatted;
  }
}
