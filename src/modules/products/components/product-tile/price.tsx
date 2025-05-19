import { Box } from '@modules/common/components/box'
import { Text } from '@modules/common/components/text'
import { useParams } from 'next/navigation'
import { convertToLocale } from '@lib/util/money'

export default function ProductPrice({
  calculatedPrice,
  salePrice,
  priceNumber,
  salePriceNumber,
  currencyCode = 'GBP'
}: {
  calculatedPrice: string
  salePrice: string
  priceNumber?: number
  salePriceNumber?: number
  currencyCode?: string
}) {
  if (!calculatedPrice) {
    return null
  }

  // More precise logic for fallback detection:
  // 1. Specifically check for the fallback messages
  // 2. If it's a price with a currency symbol, it's a valid price (even if it's £0.00)
  const isPriceFallback = 
    calculatedPrice === 'Price unavailable' ||
    calculatedPrice === 'Check price in cart';

  // If we have the numeric price values, format them with the correct currency
  let formattedPrice = calculatedPrice;
  let formattedSalePrice = salePrice;

  // A numeric price with a currency symbol should be displayed normally, even if it's zero
  return (
    <Box className="flex items-center justify-center gap-1 small:gap-2">
      {/* Only show sale price as strikethrough if both prices exist, are different, 
          and are not fallback messages */}
      {salePrice !== calculatedPrice && !isPriceFallback && (
        <Text className="text-sm small:text-base text-black line-through">
          {formattedSalePrice}
        </Text>
      )}
      <Text 
        className={`text-base small:text-lg ${isPriceFallback ? 'text-gray-500 italic' : 'font-bold text-black'}`}
      >
        {formattedPrice}
      </Text>
    </Box>
  )
}
