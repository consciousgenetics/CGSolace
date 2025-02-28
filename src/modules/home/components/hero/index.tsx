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
      <Box className="relative h-[168px] max-h-[368px] w-full small:h-[368px] 2xl:h-[468px] 2xl:max-h-[468px]">
        <Image
          src={bannerImage.url}
          alt={bannerImage.alternativeText ?? 'Banner image'}
          className="h-full w-full object-cover"
          width={1000}
          height={600}
          priority
        />
        <Container className="absolute inset-0 flex flex-col justify-center gap-4">
          <Heading className="max-w-full text-4xl text-white small:max-w-[510px] medium:text-5xl">
            {Headline}
          </Heading>
          <Box className="flex flex-col-reverse gap-8 medium:flex-row medium:items-center">
            {CTA && (
              <Button asChild className="w-max bg-white text-basic-primary hover:bg-gray-100">
                <LocalizedClientLink href={CTA.BtnLink}>
                  {CTA.BtnText}
                </LocalizedClientLink>
              </Button>
            )}
            <Text
              size="lg"
              className="max-w-full text-white medium:max-w-[410px] medium:text-end"
            >
              {text}
            </Text>
          </Box>
        </Container>
      </Box>
    </>
  )
}

export default Hero
