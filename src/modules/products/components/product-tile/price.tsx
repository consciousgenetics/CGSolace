import { Box } from '@modules/common/components/box'
import { Text } from '@modules/common/components/text'

export default function ProductPrice({
  calculatedPrice,
  salePrice,
}: {
  calculatedPrice: string
  salePrice: string
}) {
  if (!calculatedPrice) {
    return null
  }

  return (
    <Box className="flex items-center justify-center gap-1 small:gap-2">
      {salePrice !== calculatedPrice && (
        <Text className="text-sm small:text-base text-black line-through">
          {salePrice}
        </Text>
      )}
      <Text className="text-base small:text-lg font-bold text-black">
        {calculatedPrice}
      </Text>
    </Box>
  )
}
