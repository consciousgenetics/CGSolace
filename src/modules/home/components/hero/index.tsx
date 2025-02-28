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
        <Container className="absolute inset-0 flex flex-col justify-center">
          <div className="flex flex-col gap-6">
            <Heading className="max-w-[600px] text-[4.5rem] font-bold leading-none tracking-tight text-white uppercase">
              {Headline}
            </Heading>
            <Text
              size="lg"
              className="text-[2rem] text-white font-light"
            >
              {text}
            </Text>
          </div>
          <Box className="flex flex-col gap-8 mt-8">
            {CTA && (
              <Button asChild className="w-max bg-yellow-400 px-8 py-4 text-lg font-bold text-black hover:bg-yellow-500 uppercase rounded-full">
                <LocalizedClientLink href={CTA.BtnLink}>
                  {CTA.BtnText}
                </LocalizedClientLink>
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </>
  )
}

export default Hero
