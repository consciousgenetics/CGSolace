import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface ImageWithLoadingProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  onError?: (e: any) => void
  unoptimized?: boolean
}

export default function ImageWithLoading({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality,
  sizes,
  onError,
  unoptimized = false
}: ImageWithLoadingProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 0.8,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gray-200 rounded-md"
        />
      )}
      <Image
        src={src || '/placeholder.png'}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        sizes={sizes}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
        onLoad={() => setIsLoading(false)}
        onError={onError}
        unoptimized={unoptimized}
      />
    </div>
  )
} 