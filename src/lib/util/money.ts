import { isEmpty } from './isEmpty'

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = 'en-GB',
}: ConvertToLocaleParams) => {
  try {
    if (currency_code && !isEmpty(currency_code)) {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency_code,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount);
    }
    
    // Default to GBP only if no currency code is provided
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `£${amount.toFixed(2)}`;
  }
}
