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
  // CRITICAL FIX: Direct image override for Conscious Stoner T-Shirt Female
  // If this is the problematic image or product, use the working image directly
  if ((alt && alt.toLowerCase().includes('conscious') && alt.toLowerCase().includes('female')) ||
      (src && src.includes('conscious') && (src.includes('shirt') || src.includes('tshirt')) && src.includes('female'))) {
    
    // Use the hardcoded image that works, bypassing all normal logic
    const workingImageUrl = "https://cgsolacemedusav2-production.up.railway.app/uploads/female_model_t_shirt_2_6d4e8cc3b5.jpg";
    console.log("DIRECT IMAGE OVERRIDE in LoadingImage for Conscious Stoner T-Shirt Female");
    console.log("Original src:", src);
    console.log("Using direct image URL:", workingImageUrl);
    
    return (
      <div className="relative h-full w-full">
        <Image
          src={workingImageUrl}
          alt={alt || 'Conscious Stoner T-Shirt Female'}
          priority={true} // Only use priority, not loading
          quality={100} // Use highest quality
          className={className}
          fill
          sizes={sizes}
          style={{
            objectFit: 'cover',
          }}
          onClick={onClick}
        />
      </div>
    );
  }
  
  // Normal flow for other images
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)
  const [fallbackAttempt, setFallbackAttempt] = useState(0)
  
  // Define fallback options for problematic images
  const getFallbacksForUrl = (url: string) => {
    // For conscious stoner t-shirt female
    if (url.includes('conscious') && (url.includes('shirt') || url.includes('tshirt')) && url.includes('female')) {
      return [
        '/uploads/products/female_tshirt.jpg',
        '/uploads/products/conscious_stoner_female.jpg',
        '/uploads/products/conscious_female.jpg',
        '/uploads/products/female_t_shirt.jpg'
      ]
    }
    
    // For merch pack
    if (url.includes('merch-pack') || url.includes('merch_pack')) {
      return [
        '/uploads/products/merch_pack.jpg',
        '/uploads/products/merch.jpg'
      ]
    }
    
    // Default fallback - just the URL itself
    return [url]
  }
  
  // Handle loading errors by trying the next fallback
  const handleImageError = () => {
    console.error(`LoadingImage: Error loading image (attempt ${fallbackAttempt + 1}):`, imageSrc)
    
    const fallbacks = getFallbacksForUrl(src)
    
    // If we have more fallbacks to try
    if (fallbackAttempt < fallbacks.length - 1) {
      const nextAttempt = fallbackAttempt + 1
      const nextFallback = fallbacks[nextAttempt]
      
      console.log(`LoadingImage: Trying fallback ${nextAttempt + 1}/${fallbacks.length}:`, nextFallback)
      
      setFallbackAttempt(nextAttempt)
      setImageSrc(nextFallback)
      setIsLoading(true)
    } else {
      // We've tried all fallbacks, show placeholder
      console.log('LoadingImage: All fallbacks failed, showing placeholder')
      setHasError(true)
      setIsLoading(false)
    }
  }
  
  // Reset state when src changes
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setFallbackAttempt(0)
    
    // Try to fix the URL if it matches known problematic patterns
    const fallbacks = getFallbacksForUrl(src)
    setImageSrc(fallbacks[0])
    
    console.log('LoadingImage: Source changed, initial URL:', src)
    console.log('LoadingImage: Using URL:', fallbacks[0])
    console.log('LoadingImage: Available fallbacks:', fallbacks)
  }, [src])
  
  // Add debug logging
  console.log('LoadingImage rendering with src:', src, 'current:', imageSrc, 'attempt:', fallbackAttempt)
  
  const renderPlaceholder = () => (
    <div className="relative flex h-full w-full items-center justify-center bg-gray-100" onClick={onClick}>
      <PlaceholderImage size={24} />
    </div>
  )
  
  if (!src) {
    console.log('No image source provided, rendering placeholder')
    return renderPlaceholder()
  }

  // If an error occurred and we've tried all fallbacks, show the placeholder
  if (hasError) {
    console.log('Image had an error with all fallbacks, rendering placeholder')
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
        sizes={sizes}
        style={{
          objectFit: 'cover',
        }}
        onLoad={() => {
          console.log('Image loaded successfully:', imageSrc)
          console.log('Product name from alt text:', alt)
          // This will help us identify which image URL works for this product
          if (alt.includes('Conscious Stoner') || src.includes('conscious') || alt.includes('conscious')) {
            console.log('SUCCESSFUL IMAGE LOAD FOR CONSCIOUS STONER T-SHIRT:', {
              src: src,
              currentImageSrc: imageSrc,
              alt: alt
            })
          }
          setIsLoading(false)
        }}
        onError={(e) => {
          // Try the next fallback instead of immediately showing error
          handleImageError()
        }}
        onClick={onClick}
      />
    </div>
  )
}
