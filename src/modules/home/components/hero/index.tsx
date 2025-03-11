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
  // Fallback content when backend is not available
  const fallbackImage = "/hero-banner.jpg" // Make sure this image exists in your public folder
  const fallbackCTA = {
    BtnText: "SHOP NOW",
    BtnLink: "/products"
  }

  // Use fallback if data is not available
  const imageUrl = data?.data?.HeroBanner?.Image?.url 
    ? transformUrl(data.data.HeroBanner.Image.url)
    : fallbackImage

  return (
    <div className="relative h-screen w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt="Banner image"
          className="h-full w-full object-cover object-center"
          fill
          priority
          quality={100}
          sizes="100vw"
        />
      </div>

      {/* Content Container */}
      <div className="relative h-full w-full">
        <Container className="h-full max-w-screen-2xl mx-auto">
          {/* Button Container - Always show button with fallback */}
          <div className="absolute bottom-[20%] right-[15%] hero-cta-button"
               style={{ opacity: 'var(--button-opacity, 1)', transition: 'opacity 0.3s ease-out' }}>
            <Button asChild className="font-inter w-max bg-[#A86721] px-24 py-10 text-4xl font-bold text-white hover:bg-[#8B551B] rounded-[30px] flex items-center shadow-lg">
              <LocalizedClientLink href={data?.data?.HeroBanner?.CTA?.BtnLink || fallbackCTA.BtnLink} className="flex items-center">
                {data?.data?.HeroBanner?.CTA?.BtnText || fallbackCTA.BtnText}
                <span className="text-4xl ml-4">▶</span>
              </LocalizedClientLink>
            </Button>
          </div>
        </Container>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('scroll', function() {
            const footer = document.querySelector('footer');
            const reviewSection = document.querySelector('[data-testid="reviews-section"]');
            const button = document.querySelector('.hero-cta-button');
            
            if (footer && reviewSection && button) {
              const footerRect = footer.getBoundingClientRect();
              const reviewRect = reviewSection.getBoundingClientRect();
              
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
    </div>
  )
}

export default Hero
