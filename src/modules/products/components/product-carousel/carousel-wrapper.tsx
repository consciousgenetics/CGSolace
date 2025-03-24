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

  // Keep consistent height regardless of screen size
  const minHeight = '600px';

  return (
    <div className="relative w-full" style={{ minHeight }}>
      <div
        className="embla overflow-hidden w-full h-full"
        ref={emblaRef}
      >
        <div className={cn(
          "w-full h-full",
          isMobile 
            ? "grid grid-cols-2 gap-4 px-4" 
            : "flex justify-center gap-0 small:gap-0 pl-4 small:pl-6 -mx-2"
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}
