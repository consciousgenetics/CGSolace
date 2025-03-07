'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'

import useEmblaCarousel from 'embla-carousel-react'

type ImageCarouselProps = {
  images: { id: string; url: string }[]
  openDialog: (index: number | null) => void
}

const ImageCarousel = ({ images, openDialog }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentIndex(emblaApi.selectedScrollSnap())
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

  const slideWidth = 100 / images.length
  const isOnlyOneImage = images.length === 1

  return (
    <>
      <div
        className="overflow-hidden medium:hidden"
        ref={isOnlyOneImage ? null : emblaRef}
      >
        <div className="flex">
          {images.map((image, index) => (
            <div
              className="relative aspect-[29/34] max-h-[400px] w-full shrink-0"
              key={image.id}
            >
              <Image
                onClick={() => openDialog(index)}
                src={image.url}
                alt={`Product image ${index + 1}`}
                fill
                priority={index <= 2}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 992px) 780px"
                onError={(e: any) => {
                  console.error('Image failed to load, using fallback:', image.url);
                  const imgElement = e.currentTarget as HTMLImageElement;
                  
                  // If it's a localhost URL, try to convert it to the backend URL
                  if (imgElement.src.includes('localhost:9000')) {
                    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://cgsolacemedusav2-production.up.railway.app'
                    const path = imgElement.src.split('localhost:9000')[1]
                    const absoluteUrl = `${backendUrl}${path}`
                    console.log('ImageCarousel: Converting localhost URL to backend URL:', absoluteUrl)
                    imgElement.src = absoluteUrl;
                    return;
                  }
                  
                  // If it's not already using the fallback, use it
                  if (!imgElement.src.includes('special-packs.png')) {
                    imgElement.src = '/special-packs.png';
                  }
                }}
                unoptimized={true}
              />
            </div>
          ))}
        </div>
      </div>

      {!isOnlyOneImage && (
        <div className="absolute bottom-3 left-3 right-3 h-1 bg-primary/30 medium:hidden">
          <div
            className="absolute h-full bg-primary transition-all duration-200 ease-out"
            style={{
              width: `${slideWidth}%`,
              left: `${currentIndex * slideWidth}%`,
            }}
          />
        </div>
      )}
    </>
  )
}

export default ImageCarousel
