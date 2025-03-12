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
      (src && src.toLowerCase && src.toLowerCase().includes('conscious') && 
      (src.toLowerCase().includes('shirt') || src.toLowerCase().includes('tshirt')) && 
      src.toLowerCase().includes('female'))) {
    
    // Use the hardcoded remote URL that works
    const workingImageUrl = "https://cgsolacemedusav2-production.up.railway.app/uploads/female_model_t_shirt_2_6d4e8cc3b5.jpg";
    console.log("DIRECT IMAGE OVERRIDE in LoadingImage for Conscious Stoner T-Shirt Female");
    console.log("Original src:", src);
    console.log("Using direct image URL:", workingImageUrl);
    
    return (
      <div className="relative h-full w-full">
        <Image
          src={workingImageUrl}
          alt={alt || 'Conscious Stoner T-Shirt Female'}
          priority={true}
          quality={100}
          className={className}
          fill
          sizes={sizes || "(max-width: 768px) 100vw, 400px"}
          style={{
            objectFit: 'cover',
          }}
          onClick={onClick}
          unoptimized={false}
        />
      </div>
    );
  }
  
  // Normal flow for other images
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [fallbackAttempt, setFallbackAttempt] = useState(0)
  
  // Define fallback options for problematic images
  const getFallbacksForUrl = (url: string | null | undefined): string[] => {
    // Safety check for null or undefined URLs
    if (!url) {
      console.log('LoadingImage: URL is null or undefined in getFallbacksForUrl')
      return ['/product1.jpg'] // Use local image as fallback
    }

    // Extract the actual image path if it's in the Next.js Image format
    const imageMatch = url.match(/image\?url=([^&]+)/)
    const decodedUrl = imageMatch ? decodeURIComponent(imageMatch[1]) : url
    
    // Remove any query parameters
    const cleanUrl = decodedUrl.split('?')[0]

    // Remove country code prefix if present (e.g., /uk/, /us/, etc.)
    const withoutCountryCode = cleanUrl.replace(/^\/[a-z]{2}\//, '/')
    
    // For remote URLs (starting with http/https), use them directly
    if (withoutCountryCode.startsWith('http')) {
      return [withoutCountryCode]
    }
    
    console.log('LoadingImage: URL processing:', {
      original: url,
      decoded: decodedUrl,
      clean: cleanUrl,
      withoutCountryCode
    })
    
    // Handle numeric image names (like "126-wide.png")
    if (withoutCountryCode.match(/^\d+.*\.(png|jpg|jpeg|gif|webp)$/i)) {
      console.log('LoadingImage: Handling numeric image name:', withoutCountryCode)
      // Try multiple possible paths for the numeric image
      return [
        withoutCountryCode.startsWith('/') ? withoutCountryCode : `/${withoutCountryCode}`,
        `/uploads/${withoutCountryCode.replace(/^\//, '')}`,
        `/images/${withoutCountryCode.replace(/^\//, '')}`,
        '/product1.jpg'
      ].map(path => path.replace(/^\/[a-z]{2}\//, '/')) // Remove any country code prefix
    }
    
    // For conscious stoner t-shirt female
    if (withoutCountryCode.toLowerCase().includes('conscious') && 
        (withoutCountryCode.toLowerCase().includes('shirt') || withoutCountryCode.toLowerCase().includes('tshirt')) && 
        withoutCountryCode.toLowerCase().includes('female')) {
      return [
        '/conscious-female-tshirt.jpg',
        '/product1.jpg'
      ]
    }
    
    // For merch pack
    if (withoutCountryCode.toLowerCase().includes('merch-pack') || withoutCountryCode.toLowerCase().includes('merch_pack')) {
      return [
        '/merch-pack.jpg',
        '/product1.jpg'
      ]
    }
    
    // Check if the URL is a relative path without leading slash
    if (!withoutCountryCode.startsWith('/') && !withoutCountryCode.startsWith('http')) {
      console.log('LoadingImage: Adding leading slash to relative path:', withoutCountryCode)
      return [`/${withoutCountryCode}`, '/product1.jpg']
    }
    
    // Default fallback chain
    return [withoutCountryCode, '/product1.jpg', '/product2.jpg']
  }
  
  // Handle loading errors by trying the next fallback
  const handleImageError = (error: any) => {
    // Get the current image details
    const currentImageDetails = {
      currentSrc: imageSrc,
      originalSrc: src,
      attempt: fallbackAttempt + 1
    }
    
    console.log('LoadingImage: Image failed to load:', currentImageDetails)
    
    // Get fallback options
    const fallbacks = getFallbacksForUrl(src)
    console.log('LoadingImage: Available fallbacks:', fallbacks)
    
    // If we have more fallbacks to try
    if (fallbackAttempt < fallbacks.length - 1) {
      const nextAttempt = fallbackAttempt + 1
      const nextFallback = fallbacks[nextAttempt]
      
      console.log(`LoadingImage: Trying fallback ${nextAttempt + 1}/${fallbacks.length}:`, nextFallback)
      
      setFallbackAttempt(nextAttempt)
      setImageSrc(nextFallback)
      setIsLoading(true)
      setHasError(false)
    } else {
      // We've tried all fallbacks, show placeholder
      console.log('LoadingImage: All fallbacks exhausted, showing placeholder')
      setHasError(true)
      setIsLoading(false)
    }
  }
  
  // Reset state when src changes
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setFallbackAttempt(0)
    
    if (!src) {
      console.log('LoadingImage: Source is null or undefined in useEffect')
      setHasError(true)
      setIsLoading(false)
      return
    }
    
    // Get the fallbacks and use the first one
    const fallbacks = getFallbacksForUrl(src)
    
    // Log the complete state for debugging
    console.log('LoadingImage: Complete state:', {
      originalSrc: src,
      fallbacks,
      currentAttempt: fallbackAttempt,
      isLoading,
      hasError
    })
    
    // If the source is a Next.js image URL, try to load it directly first
    if (src.includes('/_next/image')) {
      setImageSrc(src)
    } else {
      setImageSrc(fallbacks[0])
    }
    
    console.log('LoadingImage: Source changed, initial URL:', src)
    console.log('LoadingImage: Using URL:', fallbacks[0])
  }, [src])
  
  const renderPlaceholder = () => (
    <div className="relative flex h-full w-full items-center justify-center bg-gray-100" onClick={onClick}>
      <PlaceholderImage size={24} />
    </div>
  )
  
  if (!imageSrc) {
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
          handleImageError({
            src: imageSrc,
            fallbackAttempt
          })
        }}
        onClick={onClick}
        unoptimized={true}
      />
    </div>
  )
}
