'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { PlaceholderImage } from '@modules/common/icons'

type LoadingImageProps = {
  src: string
  alt: string
  priority?: boolean
  loading?: 'eager' | 'lazy'
  sizes?: string
  className?: string
  onClick?: () => void
}

export const LoadingImage = ({
  src,
  alt,
  priority,
  loading,
  sizes,
  className,
  onClick,
}: LoadingImageProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  
  // Reset state when src changes
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    
    if (!src) {
      console.log('LoadingImage: Source is null or undefined')
      // Try to use a fallback based on the alt text
      if (alt?.toLowerCase().includes('all 7 strains')) {
        setImageSrc('/special-packs.png')
      } else {
        setHasError(true)
        setIsLoading(false)
      }
      return
    }
    
    // Log the image source for debugging
    console.log('LoadingImage: Loading image:', {
      src,
      alt
    })
    
    setImageSrc(src)
  }, [src, alt])
  
  const renderPlaceholder = () => (
    <div className="relative flex h-full w-full items-center justify-center bg-gray-100" onClick={onClick}>
      <PlaceholderImage size={24} />
    </div>
  )
  
  if (!imageSrc) {
    console.log('No image source provided, rendering placeholder')
    return renderPlaceholder()
  }

  // If an error occurred, show the placeholder
  if (hasError) {
    console.log('Image had an error, rendering placeholder')
    return renderPlaceholder()
  }

  return (
    <div className="relative h-full w-full">
      <div
        className={`absolute ${
          isLoading ? 'block animate-pulse bg-gray-200' : 'hidden'
        } h-full w-full`}
      />
      <Image
        src={imageSrc}
        alt={alt || ''}
        priority={priority}
        loading={loading}
        quality={90}
        className={className}
        fill
        sizes={sizes || "(max-width: 768px) 100vw, 400px"}
        style={{
          objectFit: 'cover',
          backgroundColor: 'white',
        }}
        onLoad={() => {
          console.log('LoadingImage: Successfully loaded:', imageSrc)
          setIsLoading(false)
          setHasError(false)
        }}
        onError={() => {
          console.log('LoadingImage: Failed to load:', imageSrc)
          // Try to use a fallback based on the alt text
          if (alt?.toLowerCase().includes('all 7 strains')) {
            setImageSrc('/special-packs.png')
          } else {
            setHasError(true)
            setIsLoading(false)
          }
        }}
        onClick={onClick}
      />
    </div>
  )
}
