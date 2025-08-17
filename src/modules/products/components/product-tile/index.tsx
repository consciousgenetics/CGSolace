import { useMemo, useState, useEffect } from 'react'
import { differenceInDays } from 'date-fns'

import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import { getProductPrice } from '@lib/util/get-product-price'
import { transformUrl } from '@lib/util/transform-url'
import { sortVariantsBySizeOrder } from '@lib/util/size-ordering'
import { Badge } from '@modules/common/components/badge'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

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
          fill="#FDD729"
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
              <stop offset="50%" stopColor="#FDD729" />
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
  // Check if it's in a recommended carousel (on product pages)
  if (product.category?.name === "Recommended") {
    return "RECOMMENDED";
  }
  
  // Check if it's a seed product
  if (product.category?.title?.toLowerCase().includes('seed') || 
      product.category?.handle?.toLowerCase().includes('seed') ||
      product.title?.toLowerCase().includes('seed')) {
    return "SEEDS";
  }
  
  // Check for merch/clothing
  if (product.category?.title?.toLowerCase().includes('merch') || 
      product.category?.handle?.toLowerCase().includes('merch') ||
      product.title?.toLowerCase().includes('merch')) {
    if (product.title?.toLowerCase().includes('women') || 
        product.title?.toLowerCase().includes("women's") ||
        product.title?.toLowerCase().includes('female') ||
        product.title?.toLowerCase().includes('pink')) {
      return "WOMEN'S";
    }
    if (product.title?.toLowerCase().includes('men') || 
        product.title?.toLowerCase().includes("men's")) {
      return "MEN'S";
    }
    return "MERCH";
  }
  
  // Check for accessories
  if (product.category?.title?.toLowerCase().includes('accessor') || 
      product.category?.handle?.toLowerCase().includes('accessor') ||
      product.title?.toLowerCase().includes('accessor')) {
    return "ACCESSORIES";
  }
  
  // Default tag based on title
  if (product.title?.toLowerCase().includes('women') || 
      product.title?.toLowerCase().includes("women's") ||
      product.title?.toLowerCase().includes('female') ||
      product.title?.toLowerCase().includes('pink')) {
    return "WOMEN'S";
  }
  if (product.title?.toLowerCase().includes('men') || 
      product.title?.toLowerCase().includes("men's")) {
    return "MEN'S";
  }
  
  // Absolute fallback
  return "MERCH";
};

// Type definition for product category
interface ProductCategory {
  id?: string;
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
    priceNumber?: number
    salePriceNumber?: number
    currencyCode?: string
    category?: ProductCategory
    description?: string | null
    variants?: any[]
  }
  regionId: string
  isCarousel?: boolean
}) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]?.id || '')
  const [isRedKachinaPage, setIsRedKachinaPage] = useState(false)
  
  // Check if we're on a Red Kachina category page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      if (pathname.includes('/categories/red-kachina')) {
        setIsRedKachinaPage(true)
      }
    }
  }, [])

  // Function to handle variant selection
  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVariant(e.target.value)
  }

  // Check if this is a pack product that needs variant selection
  const isPackProduct = product.title?.toLowerCase().includes('merch pack') || 
                       product.title?.toLowerCase().includes('5 x favourite pack')

  // Get the category tag for this product
  const categoryTag = getCategoryTag(product);
  
  // Generate a deterministic rating for this product
  const productRating = useMemo(() => getProductRating(product.id), [product.id]);

  // Simple thumbnail transformation
  const transformedThumbnail = product.thumbnail ? transformUrl(product.thumbnail) : null;

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
      <div className="relative w-full max-w-[280px] xs:max-w-[300px] mx-auto">
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
        </Box>

        {/* Product Card - peeking from bottom */}
        <Box className="w-full -mt-2">
          <LocalizedClientLink href={`/products/${product.handle}`} className="block">
            <Box className="text-center px-3 xs:px-5 py-3 pb-4 bg-white rounded-3xl shadow-lg relative hover:shadow-xl transition-all duration-300">
              {/* Product Info */}
              <div className="space-y-2 xs:space-y-3">
                {/* Category Badge - Only show in carousel */}
                {isCarousel && (
                  <span className={`inline-block px-2 py-1 text-xs xs:text-xs xs:px-3 small:text-xs font-bold rounded-full mt-2 mb-1 xs:mb-2 small:mt-3 small:mb-3 max-w-[90%] overflow-hidden text-ellipsis whitespace-nowrap ${
                    product.category?.title?.toLowerCase().includes('merch') || 
                    product.title?.toLowerCase().includes('merch') ||
                    getCategoryTag(product).includes("MEN'S") ||
                    getCategoryTag(product).includes("WOMEN'S")
                      ? 'bg-[#d67bef] text-white'
                      : 'bg-amber-400 text-black'
                  }`}>
                    {getCategoryTag(product)}
                  </span>
                )}

                {/* Product Title */}
                <Text
                  as="span"
                  className="block text-sm xs:text-base small:text-lg medium:text-xl font-bold uppercase text-black line-clamp-1 small:line-clamp-2 tracking-wider font-anton px-0 xs:px-1 small:px-2 min-h-[28px] xs:min-h-[32px] small:min-h-[56px] flex items-center justify-center"
                >
                  {product.title}
                </Text>
                
                {/* Stars */}
                <div className="mb-1">
                  <StarRating rating={productRating} />
                </div>
                
                {/* Description with Read More - Only show in carousel and on non-mobile devices */}
                {isCarousel && product.description && (
                  <div className="text-center px-1 hidden medium:block">
                    <p className="text-gray-600 text-sm font-latto">
                      {product.description.length > 120 
                        ? `${product.description.substring(0, 120)}...` 
                        : product.description
                      }
                    </p>
                    {product.description.length > 120 && (
                      <span 
                        className={`text-sm font-medium hover:text-[#c15ed6] transition-colors mt-0.5 inline-block font-latto ${
                          product.category?.title?.toLowerCase().includes('merch')
                            ? 'text-[#d67bef]'
                            : 'text-[#FDD729]'
                        }`}
                      >
                        Read More
                      </span>
                    )}
                  </div>
                )}
                
                {/* Variant Selection Dropdown - Only show for pack products */}
                {isPackProduct && product.variants && product.variants.length > 0 && (
                  <div className="mb-4">
                    <select
                      value={selectedVariant}
                      onChange={handleVariantChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d67bef]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {sortVariantsBySizeOrder(product.variants).map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Buy Now and Price */}
                <div className="flex items-center justify-center gap-1 xs:gap-2 mt-1">
                  <span className="font-bold text-black text-sm xs:text-base tracking-widest font-latto">
                    {'BUY NOW'}
                  </span>
                  <div className="h-4 w-px bg-gray-200"></div>
                  <ProductPrice 
                    calculatedPrice={product.calculatedPrice}
                    salePrice={product.salePrice}
                    priceNumber={product.priceNumber}
                    salePriceNumber={product.salePriceNumber}
                    currencyCode={product.currencyCode}
                  />
                </div>
              </div>
            </Box>
          </LocalizedClientLink>
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
