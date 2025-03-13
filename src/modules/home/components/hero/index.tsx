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
    <div className="fixed top-[80px] left-0 h-screen w-full z-0">
      {/* Background Image */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {/* Mobile-specific styling */}
        <style jsx global>{`
          @media (max-width: 767px) {
            .hero-image-container {
              transform: translateX(0) scale(1);
              width: 100%;
              transform-origin: center center;
              top: 80px;
            }
            .hero-image {
              object-position: center center;
            }
            .coming-soon-container {
              background: transparent !important;
            }
          }
          
          /* Add space after the fixed hero banner */
          body {
            padding-top: 80vh;
          }

          @keyframes glow {
            0% { 
              text-shadow: 0 0 10px rgba(255, 255, 255, 0.6),
                         0 0 20px rgba(255, 255, 255, 0.6),
                         0 0 30px rgba(255, 215, 0, 0.3);
              opacity: 0.8;
            }
            50% { 
              text-shadow: 0 0 15px rgba(255, 255, 255, 0.8),
                         0 0 25px rgba(255, 255, 255, 0.8),
                         0 0 35px rgba(255, 215, 0, 0.5),
                         0 0 45px rgba(255, 215, 0, 0.3);
              opacity: 1;
            }
            100% { 
              text-shadow: 0 0 10px rgba(255, 255, 255, 0.6),
                         0 0 20px rgba(255, 255, 255, 0.6),
                         0 0 30px rgba(255, 215, 0, 0.3);
              opacity: 0.8;
            }
          }
          
          .coming-soon-text {
            animation: glow 2s ease-in-out infinite;
            letter-spacing: 4px;
          }
        `}</style>
        
        {/* Container for the image with transformable width */}
        <div className="hero-image-container fixed h-full w-full transition-all">
          <Image
            src={imageUrl}
            alt="Banner image"
            className="hero-image h-full w-full object-cover object-top"
            fill
            priority
            quality={100}
            sizes="100vw"
          />
        </div>
      </div>

      {/* Content Container */}
      <div className="fixed inset-0 z-5">
        <Container className="h-full max-w-screen-2xl mx-auto relative">
          {/* Coming Soon text - positioned higher */}
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[60%] sm:left-auto sm:transform-none sm:bottom-[50%] sm:right-[15%] flex flex-col items-center sm:items-end">
            <div className="px-10 py-5 sm:px-12 sm:py-6 md:px-14 md:py-7 rounded-[30px] border border-white/10 bg-black/5 backdrop-blur-[2px]">
              <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold coming-soon-text">COMING SOON</h2>
            </div>
          </div>
          
          {/* Button Container - moved lower */}
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[30%] sm:left-auto sm:transform-none sm:bottom-[35%] sm:right-[15%] hero-cta-button">
            <Button asChild className="font-inter w-max bg-[#A86721] px-10 py-5 sm:px-14 sm:py-7 md:px-24 md:py-10 lg:px-28 lg:py-12 text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white hover:bg-[#8B551B] rounded-[25px] sm:rounded-[30px] md:rounded-[35px] flex items-center shadow-xl">
              <LocalizedClientLink href="/subscribe" className="flex items-center">
                SUBSCRIBE
                <svg 
                  className="ml-3 sm:ml-4 md:ml-5 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  <path d="M12 11v6" />
                  <path d="M9 14h6" />
                </svg>
              </LocalizedClientLink>
            </Button>
          </div>
        </Container>
      </div>
    </div>
  )
}

export default Hero
