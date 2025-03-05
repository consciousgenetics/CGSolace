'use client'

import { useCallback, useEffect, useState } from 'react'

import { cn } from '@lib/util/cn'
import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import useEmblaCarousel from 'embla-carousel-react'

interface CarouselWrapperProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  productsCount: number
}

export default function CarouselWrapper({
  children,
  title,
  subtitle,
  productsCount,
}: CarouselWrapperProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    loop: false,
    slidesToScroll: 1
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

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  return (
    <div className="w-full max-w-full">
      <Box className="flex justify-center flex-col items-center mb-5 small:mb-8 px-4">
        <Heading as="h2" className="text-2xl small:text-3xl medium:text-4xl text-black font-bold text-center">
          {title}
        </Heading>
        <p className="text-sm small:text-base text-gray-600 mt-2 small:mt-3 text-center max-w-2xl">
          {subtitle || "Every genetic that we drop is a stable, trichome covered, terpene loaded gem!"}
        </p>
      </Box>
      
      <div className="relative w-full">
        <div className="w-full max-w-full overflow-hidden px-0 cursor-grab" ref={emblaRef}>
          <div className="w-full pl-0 flex gap-3 small:gap-4">{children}</div>
        </div>
        
        {/* Navigation buttons */}
        <button 
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className={`absolute left-1 small:left-2 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-70 rounded-full p-1 small:p-2 shadow-md ${!canScrollPrev ? 'opacity-30 cursor-not-allowed' : 'hover:bg-opacity-100'}`}
          aria-label="Previous products"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="small:w-6 small:h-6">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button 
          onClick={scrollNext}
          disabled={!canScrollNext}
          className={`absolute right-1 small:right-2 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-70 rounded-full p-1 small:p-2 shadow-md ${!canScrollNext ? 'opacity-30 cursor-not-allowed' : 'hover:bg-opacity-100'}`}
          aria-label="Next products"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="small:w-6 small:h-6">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
