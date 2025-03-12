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
            padding-top: 80vh;
          }

          @keyframes glow {
            0% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
            50% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 215, 0, 0.6); }
            100% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
          }
          
          .coming-soon-text {
            animation: glow 3s infinite;
            letter-spacing: 6px;
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
          {/* Coming Soon text - positioned higher */}
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[55%] sm:left-auto sm:transform-none sm:bottom-[65%] sm:right-[15%] flex flex-col items-center sm:items-end">
            <div className="bg-black/40 backdrop-blur-sm px-8 py-4 sm:px-10 sm:py-5 md:px-12 md:py-6 rounded-full shadow-lg">
              <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold coming-soon-text">COMING SOON</h2>
            </div>
          </div>
          
          {/* Button Container - moved higher */}
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[40%] sm:left-auto sm:transform-none sm:bottom-[50%] sm:right-[15%] hero-cta-button">
            <Button asChild className="font-inter w-max bg-[#A86721] px-10 py-5 sm:px-14 sm:py-7 md:px-24 md:py-10 lg:px-28 lg:py-12 text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white hover:bg-[#8B551B] rounded-[25px] sm:rounded-[30px] md:rounded-[35px] flex items-center shadow-xl">
              <LocalizedClientLink href="/subscribe" className="flex items-center">
                SUBSCRIBE
                <span className="text-base sm:text-xl md:text-2xl lg:text-3xl ml-3 sm:ml-4 md:ml-5">▶</span>
              </LocalizedClientLink>
            </Button>
          </div>
        </Container>
      </div>
    </div>
  )
}

export default Hero
