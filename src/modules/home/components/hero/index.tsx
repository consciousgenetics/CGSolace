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
      <Box className="relative h-screen w-full">
        <Image
          src={bannerImage.url}
          alt={bannerImage.alternativeText ?? 'Banner image'}
          className="h-full w-full object-cover"
          width={1200}
          height={800}
          priority
          quality={100}
        />
        <Container className="absolute inset-0 flex flex-col justify-center">
          <div className="flex flex-col gap-6">
            <Heading className="max-w-[800px] text-[5rem] font-bold leading-none tracking-tight text-white uppercase small:text-[6rem]">
              {Headline}
            </Heading>
            <Text
              size="lg"
              className="text-[2rem] text-white font-light small:text-[2.5rem]"
            >
              {text}
            </Text>
          </div>
          <Box className="flex flex-col gap-8 mt-12">
            {CTA && (
              <Button asChild className="w-max bg-yellow-400 px-12 py-6 text-xl font-bold text-black hover:bg-yellow-500 uppercase rounded-full">
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
