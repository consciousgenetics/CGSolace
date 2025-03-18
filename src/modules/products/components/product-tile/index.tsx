import { useMemo } from 'react'
import { differenceInDays } from 'date-fns'

import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import { getProductPrice } from '@lib/util/get-product-price'
import { transformUrl } from '@lib/util/transform-url'
import { Badge } from '@modules/common/components/badge'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

import { ProductActions } from './action'
import { LoadingImage } from './loading-image'
import ProductPrice from './price'

// Generate a deterministic rating between 4.5 and 5 stars based on product ID
const getProductRating = (productId: string) => {
  // Use the product ID to generate a deterministic number
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = ((hash << 5) - hash) + productId.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert hash to a number between 0 and 5 (0.1 increments)
  const normalizedHash = Math.abs(hash % 6) / 10;
  // Return a rating between 4.5 and 5
  return 4.5 + normalizedHash;
};

// Star rating component
const StarRating = ({ rating = 4.5 }: { rating?: number }) => {
  // Ensure rating is at least 4.5
  const actualRating = Math.max(rating, 4.5);
  
  // Convert rating to nearest half star
  const fullStars = Math.floor(actualRating);
  const hasHalfStar = actualRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex items-center justify-center mt-2 mb-2">
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <svg 
          key={`full-${i}`} 
          className="w-6 h-6 mx-0.5"
          fill="#FFC107"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <svg 
          className="w-6 h-6 mx-0.5"
          viewBox="0 0 24 24"
        >
          <defs>
            <linearGradient id="halfStarGradient">
              <stop offset="50%" stopColor="#FFC107" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path 
            fill="url(#halfStarGradient)"
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" 
          />
        </svg>
      )}
      
      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <svg 
          key={`empty-${i}`} 
          className="w-6 h-6 mx-0.5"
          fill="#D1D5DB"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
};

// Get category tag for product
const getCategoryTag = (product) => {
  // Check if it's a seed product
  if (product.collection?.title?.toLowerCase().includes('seed') || 
      product.collection?.handle?.toLowerCase().includes('seed') ||
      product.title?.toLowerCase().includes('seed')) {
    return "SEEDS";
  }
  
  // Check for merch/clothing
  if (product.collection?.title?.toLowerCase().includes('merch') || 
      product.collection?.handle?.toLowerCase().includes('merch')) {
    if (product.title?.toLowerCase().includes('women') || 
        product.title?.toLowerCase().includes("women's")) {
      return "WOMEN'S";
    }
    if (product.title?.toLowerCase().includes('men') || 
        product.title?.toLowerCase().includes("men's")) {
      return "MEN'S";
    }
    return "MERCH";
  }
  
  // Check for accessories
  if (product.collection?.title?.toLowerCase().includes('accessor') || 
      product.collection?.handle?.toLowerCase().includes('accessor') ||
      product.title?.toLowerCase().includes('accessor')) {
    return "ACCESSORIES";
  }
  
  // Default fallback
  return "PRODUCT";
};

// Type definition for product collection
interface ProductCollection {
  title?: string;
  handle?: string;
}

// Simple ProductInfo component if it doesn't exist elsewhere
function ProductInfo({
  productHandle,
  productTitle,
  calculatedPrice,
  salePrice,
}: {
  productHandle: string
  productTitle: string
  calculatedPrice: string
  salePrice: string
}) {
  return null; // Empty component that doesn't render anything
}

export function ProductTile({
  product,
  regionId,
  isCarousel = false,
}: {
  product: {
    id: string
    created_at: string
    title: string
    handle: string
    thumbnail: string
    calculatedPrice: string
    salePrice: string
    collection?: ProductCollection
    description?: string | null
  }
  regionId: string
  isCarousel?: boolean
}) {
  // Enhanced debugging for thumbnail URL
  console.log('ProductTile rendering for product:', product.title)
  console.log('Original thumbnail URL:', product.thumbnail)
  
  // Get the category tag for this product
  const categoryTag = getCategoryTag(product);
  
  // Generate a deterministic rating for this product
  const productRating = useMemo(() => getProductRating(product.id), [product.id]);
  
  // CRITICAL FIX: Direct image override for the problem product
  // If this is the problematic product, use the known working image directly
  if (product.handle === "conscious-stoner-t-shirt-female" || 
     (product.title && product.title.toLowerCase().includes("conscious stoner") && 
      product.title.toLowerCase().includes("female"))) {
    console.log("DIRECT IMAGE OVERRIDE in ProductTile for Conscious Stoner T-Shirt Female");
    const workingImageUrl = "https://cgsolacemedusav2-production.up.railway.app/uploads/female_model_t_shirt_2_6d4e8cc3b5.jpg";
    
    // Skip all transformations and use the image directly
    console.log('Using direct image URL:', workingImageUrl);
    
    const isNew = useMemo(() => {
      const createdAt = new Date(product.created_at)
      const currentDate = new Date()
      const differenceInDays =
        (currentDate.getTime() - createdAt.getTime()) / (1000 * 3600 * 24)

      return differenceInDays <= 7
    }, [product.created_at])

    return (
      <Box
        className="group flex h-full flex-col pb-4"
        data-testid={formatNameForTestId(`${product.title}-product-tile`)}
      >
        <div className="relative w-full max-w-[300px] mx-auto">
          {/* Image container - on top */}
          <Box className="relative w-full aspect-square z-10">
            {isNew && (
              <Box className="absolute left-3 top-3 z-20 small:left-4 small:top-4">
                <Badge label="New" variant="brand" className="text-sm py-1 px-2" />
              </Box>
            )}
            <div className="relative w-full h-full">
              <LoadingImage
                src={workingImageUrl}
                alt={product.title}
                loading="lazy"
                className="h-full w-full object-cover rounded-xl border-4 border-black cursor-pointer"
              />
              <LocalizedClientLink 
                href={`/products/${product.handle}`}
                className="absolute inset-0 z-30"
              >
                <span className="sr-only">View {product.title}</span>
              </LocalizedClientLink>
            </div>
            <div className="absolute inset-0 z-20">
              <ProductActions productHandle={product.handle} regionId={regionId} />
            </div>
          </Box>

          {/* Product Card - peeking from bottom */}
          <Box className="w-full -mt-2">
            <Box className="text-center px-5 py-3 pb-4 bg-white rounded-3xl shadow-lg">
              {/* Product Info */}
              <div className="space-y-2">
                {/* Collection Badge - Only show in carousel */}
                {isCarousel && product.collection?.title && (
                  <span className={`inline-block px-2 py-0.5 text-sm font-medium text-gray-600 font-latto ${
                    product.collection.title.toLowerCase().includes('merch') 
                      ? 'bg-[#d67bef]/20'
                      : 'bg-amber-100'
                  } rounded-full mb-1 mt-2`}>
                    {product.collection.title}
                  </span>
                )}

                {/* Product Title */}
                <Text
                  as="span"
                  className="block text-base small:text-xl medium:text-2xl font-bold uppercase text-black line-clamp-2 tracking-wider font-latto px-2"
                >
                  {product.title}
                </Text>
                
                {/* Stars */}
                <div className="mb-1">
                  <StarRating rating={productRating} />
                </div>
                
                {/* Description with Read More - Only show in carousel */}
                {isCarousel && product.description && (
                  <div className="text-center px-1">
                    <p className="text-gray-600 text-sm font-latto">
                      {product.description.length > 120 
                        ? `${product.description.substring(0, 120)}...` 
                        : product.description
                      }
                    </p>
                    {product.description.length > 120 && (
                      <LocalizedClientLink 
                        href={`/products/${product.handle}`}
                        className={`text-sm font-medium hover:text-[#c15ed6] transition-colors mt-0.5 inline-block font-latto ${
                          product.collection?.title?.toLowerCase().includes('merch')
                            ? 'text-[#d67bef]'
                            : 'text-amber-500 hover:text-amber-600'
                        }`}
                      >
                        Read More
                      </LocalizedClientLink>
                    )}
                  </div>
                )}
                
                {/* Buy Now and Price */}
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="font-bold text-black text-base tracking-widest font-latto">BUY NOW</span>
                  <div className="h-4 w-px bg-gray-200"></div>
                  <span className={`font-medium text-base font-latto ${
                    product.collection?.title?.toLowerCase().includes('merch')
                      ? 'text-[#d67bef]'
                      : 'text-amber-400'
                  }`}>
                    {product.calculatedPrice}
                  </span>
                </div>
              </div>
            </Box>
          </Box>
        </div>
        
        <ProductInfo
          productHandle={product.handle}
          productTitle={product.title}
          calculatedPrice={product.calculatedPrice}
          salePrice={product.salePrice}
        />
      </Box>
    )
  }
  
  // Standard processing for other products
  // More robust transformation with error handling
  let transformedThumbnail = null
  try {
    // Special handling for known problematic products
    const problematicProducts = [
      "merch-pack",
      // Add other products that need special handling
    ]
    
    // Check if this is a known problematic product
    if (problematicProducts.includes(product.title.toLowerCase())) {
      console.log(`Special handling for known problematic product: ${product.title}`)
      
      // If the URL is completely missing or invalid, use a default placeholder
      if (!product.thumbnail || product.thumbnail === "null" || product.thumbnail === "undefined") {
        console.log(`Missing thumbnail for ${product.title}, using fallback path construction`)
        // Construct a likely path based on the product handle
        const fallbackPath = `/uploads/products/${product.handle.replace(/-/g, '_')}.jpg`
        transformedThumbnail = transformUrl(fallbackPath)
      } else {
        // Normal transformation with additional fixes
        let urlToTransform = product.thumbnail
        
        // Fix common issues with URLs
        if (urlToTransform.startsWith("null/") || urlToTransform.startsWith("undefined/")) {
          urlToTransform = urlToTransform.substring(urlToTransform.indexOf('/') + 1)
        }
        
        transformedThumbnail = transformUrl(urlToTransform)
      }
    } else {
      // Standard transformation for normal products
      transformedThumbnail = product.thumbnail ? transformUrl(product.thumbnail) : null
    }
    
    console.log('Transformed thumbnail URL:', transformedThumbnail)
  } catch (error) {
    console.error('Error transforming thumbnail URL:', error)
    // Fallback to original URL if transformation fails
    transformedThumbnail = product.thumbnail
  }

  const isNew = useMemo(() => {
    const createdAt = new Date(product.created_at)
    const currentDate = new Date()
    const differenceInDays =
      (currentDate.getTime() - createdAt.getTime()) / (1000 * 3600 * 24)

    return differenceInDays <= 7
  }, [product.created_at])

  return (
    <Box
      className="group flex h-full flex-col pb-4"
      data-testid={formatNameForTestId(`${product.title}-product-tile`)}
    >
      <div className="relative w-full max-w-[300px] mx-auto">
        {/* Image container - on top */}
        <Box className="relative w-full aspect-square z-10">
          {isNew && (
            <Box className="absolute left-3 top-3 z-20 small:left-4 small:top-4">
              <Badge label="New" variant="brand" className="text-sm py-1 px-2" />
            </Box>
          )}
          <div className="relative w-full h-full">
            <LoadingImage
              src={transformedThumbnail}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-cover rounded-xl border-4 border-black cursor-pointer"
            />
            <LocalizedClientLink 
              href={`/products/${product.handle}`}
              className="absolute inset-0 z-30"
            >
              <span className="sr-only">View {product.title}</span>
            </LocalizedClientLink>
          </div>
          <div className="absolute inset-0 z-20">
            <ProductActions productHandle={product.handle} regionId={regionId} />
          </div>
        </Box>

        {/* Product Card - peeking from bottom */}
        <Box className="w-full -mt-2">
          <Box className="text-center px-5 py-3 pb-4 bg-white rounded-3xl shadow-lg">
            {/* Product Info */}
            <div className="space-y-2">
              {/* Collection Badge - Only show in carousel */}
              {isCarousel && product.collection?.title && (
                <span className={`inline-block px-2 py-0.5 text-sm font-medium text-gray-600 font-latto ${
                  product.collection.title.toLowerCase().includes('merch') 
                    ? 'bg-[#d67bef]/20'
                    : 'bg-amber-100'
                } rounded-full mb-1 mt-2`}>
                  {product.collection.title}
                </span>
              )}

              {/* Product Title */}
              <Text
                as="span"
                className="block text-base small:text-xl medium:text-2xl font-bold uppercase text-black line-clamp-2 tracking-wider font-latto px-2"
              >
                {product.title}
              </Text>
              
              {/* Stars */}
              <div className="mb-1">
                <StarRating rating={productRating} />
              </div>
              
              {/* Description with Read More - Only show in carousel */}
              {isCarousel && product.description && (
                <div className="text-center px-1">
                  <p className="text-gray-600 text-sm font-latto">
                    {product.description.length > 120 
                      ? `${product.description.substring(0, 120)}...` 
                      : product.description
                    }
                  </p>
                  {product.description.length > 120 && (
                    <LocalizedClientLink 
                      href={`/products/${product.handle}`}
                      className={`text-sm font-medium hover:text-[#c15ed6] transition-colors mt-0.5 inline-block font-latto ${
                        product.collection?.title?.toLowerCase().includes('merch')
                          ? 'text-[#d67bef]'
                          : 'text-amber-500 hover:text-amber-600'
                      }`}
                    >
                      Read More
                    </LocalizedClientLink>
                  )}
                </div>
              )}
              
              {/* Buy Now and Price */}
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-bold text-black text-base tracking-widest font-latto">BUY NOW</span>
                <div className="h-4 w-px bg-gray-200"></div>
                <span className={`font-medium text-base font-latto ${
                  product.collection?.title?.toLowerCase().includes('merch')
                    ? 'text-[#d67bef]'
                    : 'text-amber-400'
                }`}>
                  {product.calculatedPrice}
                </span>
              </div>
            </div>
          </Box>
        </Box>
      </div>
      
      <ProductInfo
        productHandle={product.handle}
        productTitle={product.title}
        calculatedPrice={product.calculatedPrice}
        salePrice={product.salePrice}
      />
    </Box>
  )
}
