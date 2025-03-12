import { getPricesForVariant } from '@lib/util/get-product-price'
import { HttpTypes } from '@medusajs/types'
import { clx } from '@medusajs/ui'
import { convertToLocale } from '@lib/util/money'

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: 'default' | 'tight'
}

// Define a type for price values that matches the actual return type
type PriceValues = {
  original_price?: string;
  calculated_price?: string;
  original_price_number?: number;
  calculated_price_number?: number;
  percentage_diff?: string | number;
  currency_code?: string;
  price_type?: string | null;
}

const LineItemUnitPrice = ({
  item,
  style = 'default',
}: LineItemUnitPriceProps) => {
  // Get prices with a type assertion to unknown first to avoid type errors
  const priceData = getPricesForVariant(item.variant) as unknown as PriceValues | null;
  
  // Special handling for Pink Zeez product - force GBP display
  const isPinkZeez = item.title?.includes('Pink Zeez');
  
  if (isPinkZeez && priceData?.currency_code?.toUpperCase() === 'USD') {
    console.log('Fixing Pink Zeez currency display:', {
      product: item.title,
      originalCurrency: priceData.currency_code,
      forcingToGBP: true
    });
    
    // Override the price data to force GBP display
    if (priceData.calculated_price_number) {
      priceData.calculated_price = convertToLocale({
        amount: priceData.calculated_price_number,
        currency_code: 'GBP'
      });
    }
    
    if (priceData.original_price_number) {
      priceData.original_price = convertToLocale({
        amount: priceData.original_price_number,
        currency_code: 'GBP'
      });
    }
    
    priceData.currency_code = 'GBP';
  }
  
  // Use safe default values
  const original_price = priceData?.original_price ?? 'N/A';
  const calculated_price = priceData?.calculated_price ?? 'N/A';
  const original_price_number = priceData?.original_price_number ?? 0;
  const calculated_price_number = priceData?.calculated_price_number ?? 0;
  const percentage_diff = priceData?.percentage_diff ?? 0;
  
  // Only show reduced price if both values exist and calculated is less than original
  const hasReducedPrice = 
    original_price_number > 0 && 
    calculated_price_number > 0 && 
    calculated_price_number < original_price_number;

  return (
    <div className="flex h-full flex-col justify-center text-ui-fg-muted">
      {hasReducedPrice && (
        <>
          <p>
            {style === 'default' && (
              <span className="text-ui-fg-muted">Original: </span>
            )}
            <span
              className="line-through"
              data-testid="product-unit-original-price"
            >
              {original_price}
            </span>
          </p>
          {style === 'default' && (
            <span className="text-ui-fg-interactive">-{percentage_diff}%</span>
          )}
        </>
      )}
      <span
        className={clx('text-base-regular', {
          'text-ui-fg-interactive': hasReducedPrice,
        })}
        data-testid="product-unit-price"
      >
        {calculated_price}
      </span>
    </div>
  )
}

export default LineItemUnitPrice
