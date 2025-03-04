import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { HeroBanner, HeroBannerData } from 'types/strapi'

export const Banner = ({ data }: { data: HeroBannerData }) => {
  const bannerData = data?.data?.HeroBanner
  
  if (!bannerData) {
    return null
  }

  const { Image: bannerImage, CTA, Headline, Text: text } = bannerData

  if (!bannerImage?.url) {
    return null
  }

  return (
    <Container className="h-screen flex items-center justify-center">
      <Box className="relative h-full w-full">
        <Image
          src={bannerImage.url}
          alt={bannerImage.alternativeText ?? 'Banner image'}
          fill
          className="object-cover object-right-top"
          sizes="100vw"
          priority
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center text-white">
          <Heading className="text-3xl">{Headline}</Heading>

          <Text size="lg" className="mt-2 medium:max-w-[600px]">
            {text}
          </Text>
          {CTA && (
            <Button className="mt-8" asChild>
              <LocalizedClientLink href={CTA.BtnLink}>
                {CTA.BtnText}
              </LocalizedClientLink>
            </Button>
          )}
        </div>
      </Box>
    </Container>
  )
}
