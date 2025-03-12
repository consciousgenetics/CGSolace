'use client'

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
    BtnText: "SUBSCRIBE",
    BtnLink: "/subscribe"
  }

  // Use fallback if data is not available
  const imageUrl = data?.data?.HeroBanner?.Image?.url 
    ? transformUrl(data.data.HeroBanner.Image.url)
    : fallbackImage

  return (
    <div className="fixed top-0 left-0 h-screen w-full z-0">
      {/* Background Image */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {/* Mobile-specific styling */}
        <style jsx global>{`
          @media (max-width: 767px) {
            .hero-image-container {
              transform: translateX(0) scale(1);
              width: 100%;
              transform-origin: center center;
            }
            .hero-image {
              object-position: center center;
            }
          }
          
          /* Add space after the fixed hero banner */
          body {
            padding-top: 100vh;
          }
        `}</style>
        
        {/* Container for the image with transformable width */}
        <div className="hero-image-container fixed h-full w-full transition-all">
          <Image
            src={imageUrl}
            alt="Banner image"
            className="hero-image h-full w-full object-cover"
            fill
            priority
            quality={100}
            sizes="100vw"
          />
        </div>
      </div>

      {/* Content Container */}
      <div className="fixed inset-0 z-10">
        <Container className="h-full max-w-screen-2xl mx-auto relative">
          {/* Button Container - Always visible regardless of scroll */}
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[40%] sm:left-auto sm:transform-none sm:bottom-[50%] sm:right-[15%] hero-cta-button">
            <Button asChild className="font-inter w-max bg-[#A86721] px-8 py-4 sm:px-12 sm:py-6 md:px-20 md:py-8 lg:px-24 lg:py-10 text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white hover:bg-[#8B551B] rounded-[20px] sm:rounded-[25px] md:rounded-[30px] flex items-center shadow-lg">
              <LocalizedClientLink href="/subscribe" className="flex items-center">
                SUBSCRIBE
                <span className="text-sm sm:text-lg md:text-xl lg:text-2xl ml-2 sm:ml-3 md:ml-4">▶</span>
              </LocalizedClientLink>
            </Button>
          </div>
        </Container>
      </div>
    </div>
  )
}

export default Hero
