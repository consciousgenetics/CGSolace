import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

interface ProductPackProps {
  title: string
  price: string
  description: string
  bulletPoints?: string[]
  imageSrc: string
  imageAlt: string
  ctaText?: string
  ctaLink: string
  backgroundColor: string
  textColor: string
  buttonColor: string
  buttonTextColor: string
}

const ProductPack = ({
  title,
  price,
  description,
  bulletPoints,
  imageSrc,
  imageAlt,
  ctaText = 'SHOP NOW',
  ctaLink,
  backgroundColor,
  textColor,
  buttonColor,
  buttonTextColor,
}: ProductPackProps) => {
  return (
    <Box 
      className="w-full h-full"
      style={{ backgroundColor }}
    >
      <Box className="grid md:grid-cols-2 grid-cols-1">
        <Box className="p-8 flex flex-col justify-center">
          <Heading 
            className="text-2xl font-black uppercase mb-2" 
            style={{ color: textColor }}
          >
            {title}
          </Heading>
          <Text 
            className="text-2xl font-semibold mb-4" 
            style={{ color: textColor }}
          >
            {price}
          </Text>
          <Text 
            className="mb-3 text-sm" 
            style={{ color: textColor }}
          >
            {description}
          </Text>
          {bulletPoints && bulletPoints.length > 0 && (
            <Box className="mb-4">
              {bulletPoints.map((point, index) => (
                <Text 
                  key={index} 
                  className="text-sm mb-1" 
                  style={{ color: textColor }}
                >
                  {point}
                </Text>
              ))}
            </Box>
          )}
          <Box className="mt-4">
            <LocalizedClientLink 
              href={ctaLink}
              className="inline-block rounded-full px-8 py-2 text-center font-semibold text-sm uppercase transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: buttonColor,
                color: buttonTextColor
              }}
            >
              {ctaText}
            </LocalizedClientLink>
          </Box>
        </Box>
        <Box className="relative h-64 md:h-auto">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </Box>
      </Box>
    </Box>
  )
}

export const ProductPacks = () => {
  return (
    <Container className="mt-16 mb-16">
      <Box className="grid grid-cols-1 gap-6">
        <ProductPack
          title="ALL 7 STRAINS PACK"
          price="£350.00"
          description="If you want to try feminized seeds from our temporary breeding bank, you will receive all 7 genetics:"
          bulletPoints={[
            "ZAMALAK 2.0 | DAWN CHORUS | ORANGE KUSH CAKE |",
            "BLOOD DIAMOND 2.0 | PINK PANTHER 2.0 | PINK FROST | PINK QUARTZ",
            "Plus Bonus Specials:"
          ]}
          imageSrc="/images/product-packs/all-strains-pack.jpg"
          imageAlt="All 7 strains pack product image showing seed packets"
          ctaText="SHOP NOW"
          ctaLink="/products/all-7-strains-pack"
          backgroundColor="#F7D13B" // Yellow background
          textColor="#222222" // Dark text
          buttonColor="#5D2C90" // Purple button
          buttonTextColor="#FFFFFF" // White text
        />
        <ProductPack
          title="MERCH PACK"
          price="£50.00"
          description="If you like a specific design that a merch pack includes:"
          bulletPoints={[
            "T-shirt",
            "Ash tray",
            "Sticker",
            "Lighter"
          ]}
          imageSrc="/images/product-packs/merch-pack.jpg"
          imageAlt="Merch pack product image showing hoodie/merchandise"
          ctaText="SHOP NOW"
          ctaLink="/products/merch-pack"
          backgroundColor="#7A4294" // Purple background
          textColor="#FFFFFF" // White text
          buttonColor="#FFDF38" // Yellow button
          buttonTextColor="#222222" // Dark text
        />
      </Box>
    </Container>
  )
} 