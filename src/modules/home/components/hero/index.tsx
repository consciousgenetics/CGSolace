import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { HeroBannerData } from 'types/strapi'
import { transformUrl } from '@lib/util/transform-url'

const Hero = ({ data }: { data: HeroBannerData }) => {
  const bannerData = data?.data?.HeroBanner
  
  if (!bannerData) {
    return null
  }

  const { Headline, Text: text, CTA, Image: bannerImage } = bannerData

  if (!bannerImage?.url) {
    return null
  }

  // Transform the banner image URL
  const imageUrl = transformUrl(bannerImage.url)

  return (
    <>
      <Box className="relative h-screen w-full overflow-hidden">
        <div className="fixed left-0 right-0 top-0 h-screen z-[-1]">
          <Image
            src={imageUrl}
            alt={bannerImage.alternativeText ?? 'Banner image'}
            className="h-full w-full object-cover object-center"
            fill
            priority
            quality={100}
            sizes="100vw"
            style={{ 
              objectFit: 'cover',
              maxWidth: '100%'
            }}
          />
        </div>
        <Container className="fixed z-10 h-full flex flex-col justify-center mx-auto max-w-screen-2xl inset-0">
          {CTA && (
            <div className="fixed top-[65%] right-[15%] transform translate-y-1/2 z-[5] hero-cta-button" style={{ 
              opacity: 'var(--button-opacity, 1)',
              transition: 'opacity 0.3s ease-out'
             }}>
              <Button asChild className="font-inter w-max bg-[#A86721] px-24 py-10 text-4xl font-bold text-white hover:bg-[#8B551B] rounded-[30px] flex items-center shadow-lg">
                <LocalizedClientLink href={CTA.BtnLink} className="flex items-center">
                  {CTA.BtnText}
                  <span className="text-4xl ml-4">▶</span>
                </LocalizedClientLink>
              </Button>
            </div>
          )}
        </Container>
      </Box>
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('scroll', function() {
            const footer = document.querySelector('footer');
            const reviewSection = document.querySelector('[data-testid="reviews-section"]');
            const button = document.querySelector('.hero-cta-button');
            
            if (footer && reviewSection && button) {
              const footerRect = footer.getBoundingClientRect();
              const reviewRect = reviewSection.getBoundingClientRect();
              
              // Check if either footer or review section is in view
              const shouldHideButton = 
                footerRect.top <= window.innerHeight || 
                reviewRect.top <= window.innerHeight;
              
              document.documentElement.style.setProperty(
                '--button-opacity', 
                shouldHideButton ? '0' : '1'
              );
            }
          });
        `
      }} />
    </>
  )
}

export default Hero
