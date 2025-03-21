'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
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
    <motion.div 
      className="relative flex h-full w-full items-center justify-center bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
    >
      <PlaceholderImage size={24} />
    </motion.div>
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
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ 
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.02, 1],
            }}
            exit={{ opacity: 0 }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-md"
            style={{
              backgroundSize: '200% 100%',
              backgroundPosition: 'left',
            }}
          />
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Image
          src={imageSrc}
          alt={alt || ''}
          priority={priority}
          loading={loading}
          quality={90}
          className={`${className} transition-all duration-300`}
          fill
          sizes={sizes || "(max-width: 768px) 100vw, 400px"}
          style={{
            objectFit: 'cover',
            backgroundColor: 'transparent',
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
      </motion.div>
    </div>
  )
}
