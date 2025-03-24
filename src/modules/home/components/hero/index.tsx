'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { HeroBannerData } from 'types/strapi'
import { transformUrl } from '@lib/util/transform-url'

const Hero = ({ data }: { data: HeroBannerData }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    checkMobile()
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile)

    // Add scroll listener for fade effect
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const fadeStart = windowHeight * 0.4 // Start fading when 40% of the viewport is scrolled
      
      if (scrollPosition > fadeStart) {
        const opacity = Math.max(0, 1 - (scrollPosition - fadeStart) / (windowHeight * 0.3))
        setIsVisible(opacity > 0)
        document.querySelector('.hero-content')?.setAttribute('style', `opacity: ${opacity}`)
      } else {
        setIsVisible(true)
        document.querySelector('.hero-content')?.setAttribute('style', 'opacity: 1')
      }
    }

    window.addEventListener('scroll', handleScroll)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Fallback content when backend is not available
  const fallbackDesktopImage = "/hero-banner.jpg"
  const mobileImage = "/CGKmobile-banner.png"
  const fallbackCTA = {
    BtnText: "SUBSCRIBE",
    BtnLink: "/subscribe"
  }

  // Use fallback if data is not available, but only for desktop
  const desktopImageUrl = data?.data?.HeroBanner?.Image?.url 
    ? transformUrl(data.data.HeroBanner.Image.url)
    : fallbackDesktopImage

  // Always use mobile image for mobile view, regardless of Strapi data
  const imageUrl = isMobile ? mobileImage : desktopImageUrl

  return (
    <div className={`fixed top-0 left-0 h-screen w-full z-0 transition-opacity duration-300 ${!isVisible ? 'pointer-events-none' : ''}`}>
      {/* Background Image */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {/* Mobile-specific styling */}
        <style jsx global>{`
          @media (max-width: 767px) {
            .hero-image-container {
              width: 100%;
              height: 100vh;
              transform: none;
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
            }
            .hero-image {
              object-position: center center !important;
              object-fit: cover !important;
              width: 100% !important;
              height: 100% !important;
            }
            .coming-soon-container {
              background: transparent !important;
            }
          }
          
          /* Add space after the fixed hero banner */
          body {
            padding-top: 100vh;
          }

          .hero-image-container {
            height: 100vh;
            transition: opacity 0.3s ease-out;
          }
          
          @keyframes textPulse {
            0% {
              text-shadow: 0 0 3px rgba(255, 255, 255, 0.2),
                         0 0 5px rgba(255, 255, 255, 0.2);
            }
            50% {
              text-shadow: 0 0 8px rgba(255, 255, 255, 0.4),
                         0 0 10px rgba(255, 255, 255, 0.4);
            }
            100% {
              text-shadow: 0 0 3px rgba(255, 255, 255, 0.2),
                         0 0 5px rgba(255, 255, 255, 0.2);
            }
          }
          
          .coming-soon-text {
            letter-spacing: 4px;
            animation: textPulse 4s ease-in-out infinite;
          }
        `}</style>
        
        {/* Container for the image with transformable width */}
        <div className="hero-image-container fixed w-full transition-all">
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
      <div className="fixed inset-0 z-5 hero-content transition-opacity duration-300">
        <div className="h-full w-full relative flex flex-col items-center justify-center">
          {/* Coming Soon text - positioned higher */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="absolute w-full flex flex-col items-center"
            style={{ bottom: '48%' }}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
              className="px-12 py-6 sm:px-16 sm:py-8 md:px-20 md:py-10"
            >
              <h2 className="text-white text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold coming-soon-text font-latto whitespace-nowrap">COMING SOON</h2>
            </motion.div>
          </motion.div>
          
          {/* Button Container - moved closer to text */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
            className="absolute w-full flex justify-center"
            style={{ bottom: '35%' }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center"
            >
              <Button asChild className="font-latto w-max bg-[#FDD729] px-10 py-5 sm:px-14 sm:py-7 md:px-24 md:py-10 lg:px-28 lg:py-12 text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-black hover:bg-[#E5C125] rounded-[25px] sm:rounded-[30px] md:rounded-[35px] flex items-center shadow-xl">
                <LocalizedClientLink href="/categories/red-kachina" className="flex items-center">
                  REGISTER NOW
                  <motion.svg 
                    initial={{ x: -5 }}
                    animate={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.3 }}
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
                  </motion.svg>
                </LocalizedClientLink>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Hero
