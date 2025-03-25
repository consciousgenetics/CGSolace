import type { ImageProps } from 'next/image'
import Image from 'next/image'

export const ConsciousGeneticsLogo = ({ 
  className, 
  width = 200,
  height = 80,
  ...props 
}: Omit<ImageProps, 'src' | 'alt'>) => {
  return (
    <Image
      src={'/conscious-genetics-logo.png'}
      alt="Conscious Genetics Logo"
      width={width}
      height={height}
      className={`${className} object-contain`}
      priority
      unoptimized
      {...props}
    />
  )
} 