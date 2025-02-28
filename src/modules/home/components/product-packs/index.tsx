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
    <Box className="w-full overflow-hidden bg-opacity-100" style={{ backgroundColor }}>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-5 md:p-8 flex flex-col justify-center">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wide mb-1" style={{ color: textColor }}>
            {title}
          </h2>
          <p className="text-xl md:text-2xl font-bold mb-3" style={{ color: textColor }}>
            {price}
          </p>
          <p className="text-sm mb-2 leading-snug" style={{ color: textColor }}>
            {description}
          </p>
          {bulletPoints && bulletPoints.length > 0 && (
            <div className="mb-3">
              {bulletPoints.map((point, index) => (
                <p key={index} className="text-xs md:text-sm mb-1 leading-tight" style={{ color: textColor }}>
                  {point}
                </p>
              ))}
            </div>
          )}
          <div className="mt-2 md:mt-4">
            <LocalizedClientLink 
              href={ctaLink}
              className="inline-block rounded-full px-6 py-1.5 text-center font-bold text-xs uppercase tracking-wide hover:opacity-90"
              style={{ 
                backgroundColor: buttonColor,
                color: buttonTextColor
              }}
            >
              {ctaText}
            </LocalizedClientLink>
          </div>
        </div>
        <div className="w-full md:w-1/2 h-60 md:h-auto relative">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </div>
    </Box>
  )
}

export const ProductPacks = () => {
  return (
    <Container className="mt-10 mb-10">
      <Box className="grid grid-cols-1 gap-3">
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
          backgroundColor="#FFDD3C" // Bright yellow background
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
          buttonColor="#FFDD3C" // Bright yellow button
          buttonTextColor="#222222" // Dark text
        />
      </Box>
    </Container>
  )
} 