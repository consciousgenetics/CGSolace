import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { HeroBannerData } from 'types/strapi'

const Hero = ({ data }: { data: HeroBannerData }) => {
  const bannerData = data?.data?.HeroBanner
  
  if (!bannerData) {
    return null
  }

  const { Headline, Text: text, CTA, Image: bannerImage } = bannerData

  if (!bannerImage?.url) {
    return null
  }

  return (
    <>
      <Box className="relative h-[600px] w-full">
        <div className="absolute inset-0 w-1/2 bg-black"></div>
        <div className="absolute right-0 top-0 h-full w-1/2">
          <Image
            src={bannerImage.url}
            alt={bannerImage.alternativeText ?? 'Banner image'}
            className="h-full w-full object-cover object-center"
            width={1000}
            height={1200}
            priority
          />
        </div>
        <Container className="relative h-full">
          <div className="flex h-full flex-col justify-center gap-8 text-white max-w-[600px]">
            <Heading className="text-5xl font-bold uppercase tracking-wide medium:text-7xl">
              {Headline}
            </Heading>
            {CTA && (
              <Button asChild className="w-max bg-yellow-400 px-8 py-4 text-lg font-semibold text-black hover:bg-yellow-500">
                <LocalizedClientLink href={CTA.BtnLink}>
                  {CTA.BtnText}
                </LocalizedClientLink>
              </Button>
            )}
            <Text
              size="lg"
              className="max-w-[410px] text-white text-xl"
            >
              {text}
            </Text>
          </div>
        </Container>
      </Box>
    </>
  )
}

export default Hero
