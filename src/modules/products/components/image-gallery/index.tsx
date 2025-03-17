'use client'

import { useState } from 'react'

import { cn } from '@lib/util/cn'
import { transformUrl } from '@lib/util/transform-url'
import { HttpTypes } from '@medusajs/types'
import { Button } from '@modules/common/components/button'

import { LoadingImage } from '../product-tile/loading-image'
import { MAX_INITIAL_IMAGES } from './consts'
import { GalleryDialog } from './gallery-dialog'
import ImageCarousel from './image-carousel'

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  title: string
}

const ImageGallery = ({ images, title }: ImageGalleryProps) => {
  const [additionalImages, setAdditionalImages] = useState(0)
  const [selectedImage, setSelectedImage] = useState(null)

  const handleImageClick = (index) => {
    setSelectedImage(index)
  }

  // Enhanced debugging for image URLs
  console.log('ImageGallery rendering for:', title)
  console.log('Original images:', JSON.stringify(images, null, 2))

  // Transform image URLs with additional logging
  const transformedImages = images.map(img => {
    console.log(`Processing image ${img.id}, original URL:`, img.url)
    
    // Handle localhost URLs
    if (img.url && img.url.includes('localhost:9000')) {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://cgsolacemedusav2-production.up.railway.app'
      const path = img.url.split('localhost:9000')[1]
      const absoluteUrl = `${backendUrl}${path}`
      console.log('ImageGallery: Converting localhost URL to backend URL:', absoluteUrl)
      return {
        ...img,
        url: absoluteUrl
      }
    }
    
    // Special handling for Conscious Stoner T-shirt Female
    if (title.toLowerCase().includes('conscious') && 
        title.toLowerCase().includes('stoner') && 
        title.toLowerCase().includes('female')) {
      console.log('ImageGallery: Using fallback image for Conscious Stoner T-shirt Female')
      
      // Check if we have a valid image URL from Medusa
      if (img.url && img.url.startsWith('http') && !img.url.includes('localhost')) {
        console.log('ImageGallery: Found valid remote URL:', img.url)
        return {
          ...img,
          url: img.url
        }
      }
      
      // If the URL is relative, make it absolute
      if (img.url && img.url.startsWith('/')) {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://cgsolacemedusav2-production.up.railway.app'
        const absoluteUrl = `${backendUrl}${img.url}`
        console.log('ImageGallery: Converting relative URL to absolute:', absoluteUrl)
        return {
          ...img,
          url: absoluteUrl
        }
      }
      
      // Fallback to local image if no valid URL found
      console.log('ImageGallery: Using local fallback image')
      return {
        ...img,
        url: "/special-packs.png"
      }
    }
    
    // If the URL is from the problematic domain, try to fix it
    if (img.url && img.url.includes('cgsolacemedusav2-production.up.railway.app')) {
      console.log('ImageGallery: Fixing railway URL:', img.url)
      // Try to use the URL as is first
      return {
        ...img,
        url: img.url.replace('http://', 'https://')
      }
    }
    
    const transformedUrl = transformUrl(img.url)
    console.log(`Transformed URL for image ${img.id}:`, transformedUrl)
    return {
      ...img,
      url: transformedUrl
    }
  })

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="hidden grid-cols-2 gap-1 medium:grid">
        {transformedImages
          .slice(0, MAX_INITIAL_IMAGES + additionalImages)
          .map((image, index) => (
            <div
              className={cn(
                'relative w-full shrink-0 z-0',
                index === 0
                  ? 'col-span-2 aspect-[29/20] max-h-[540px]'
                  : 'col-span-1 aspect-[29/34] max-h-[440px]'
              )}
              key={image.id}
              style={{ pointerEvents: 'auto' }}
            >
              <LoadingImage
                src={image.url}
                alt={`${title} - product image`}
                sizes="(max-width: 768px) 100vw, (max-width: 992px) 780px"
                className="object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <div 
                className="absolute inset-0 z-30 cursor-pointer"
                onClick={() => handleImageClick(index)}
                style={{ touchAction: 'none' }}
              />
            </div>
          ))}
      </div>
      {additionalImages + MAX_INITIAL_IMAGES < transformedImages.length && (
        <Button
          className="mx-auto hidden w-fit outline-none medium:flex"
          variant="tonal"
          size="sm"
          onClick={() => {
            additionalImages + MAX_INITIAL_IMAGES < transformedImages.length &&
              setAdditionalImages((prev) => prev + 2)
          }}
        >
          See more images
        </Button>
      )}
      <GalleryDialog
        activeImg={selectedImage}
        onChange={setSelectedImage}
        images={transformedImages}
        title={title}
      />
      <ImageCarousel images={transformedImages} openDialog={setSelectedImage} />
    </div>
  )
}

export default ImageGallery
