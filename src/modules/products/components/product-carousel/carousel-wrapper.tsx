'use client'

import { useCallback, useEffect, useState } from 'react'

import { cn } from '@lib/util/cn'
import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { useWindowSize } from '@lib/hooks/use-window-size'

interface CarouselWrapperProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  productsCount: number
}

export default function CarouselWrapper({
  children,
  productsCount,
}: CarouselWrapperProps) {
  const windowSize = useWindowSize()
  const isMobile = windowSize.width ? windowSize.width < 640 : false // 640px is the 'small' breakpoint

  // Modify carousel options for mobile to show 2 items at once
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    loop: false,
    slidesToScroll: isMobile ? 2 : 1, // On mobile, scroll 2 items at a time
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  // Reinitialize carousel when screen size changes or product count changes
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit()
    }
  }, [emblaApi, isMobile])
  
  // Separate effect for product count changes to avoid dependency array size issues
  useEffect(() => {
    if (emblaApi && productsCount > 0) {
      emblaApi.reInit()
    }
  }, [emblaApi, productsCount])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  // Adjust min-height based on the number of products when in grid view
  const minHeight = isMobile ? 
    (productsCount <= 2 ? '300px' : productsCount <= 4 ? '600px' : '850px') : 
    '600px';

  return (
    <div className={`w-full max-w-full relative`} style={{ minHeight }}>
      <div className="relative z-10 p-0">
        <div className="relative w-full">
          <div className="w-full max-w-full overflow-hidden px-0 cursor-grab" ref={emblaRef}>
            {/* For mobile, use a grid layout with 2 columns, otherwise use flex */}
            <div className={cn(
              "w-full pl-0",
              isMobile 
                ? "grid grid-cols-2 gap-3" // 2x2 grid layout for mobile
                : "flex gap-3 small:gap-4"  // Original flex layout for larger screens
            )}>
              {children}
            </div>
          </div>
          
          {/* Navigation buttons - only show if there are enough products to scroll */}
          {((isMobile && productsCount > 2) || (!isMobile && productsCount > 1)) && (
            <>
              <button 
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className={`absolute left-1 small:left-2 top-1/2 -translate-y-1/2 z-10 backdrop-blur-md bg-white/80 rounded-full p-2 small:p-3 shadow-lg transition-all duration-300 ease-out transform hover:scale-110 ${!canScrollPrev ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:shadow-xl active:scale-95'}`}
                aria-label="Previous products"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="small:w-5 small:h-5 text-gray-800">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button 
                onClick={scrollNext}
                disabled={!canScrollNext}
                className={`absolute right-1 small:right-2 top-1/2 -translate-y-1/2 z-10 backdrop-blur-md bg-white/80 rounded-full p-2 small:p-3 shadow-lg transition-all duration-300 ease-out transform hover:scale-110 ${!canScrollNext ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:shadow-xl active:scale-95'}`}
                aria-label="Next products"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="small:w-5 small:h-5 text-gray-800">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
