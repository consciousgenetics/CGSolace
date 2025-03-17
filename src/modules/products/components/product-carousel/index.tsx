'use client'

import { getProductPrice } from '@lib/util/get-product-price'
import { StoreProduct } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import Image from 'next/image'
import { useState, useCallback, useEffect, useRef } from 'react'
import { Heading } from '@modules/common/components/heading'
import { motion, useInView } from 'framer-motion'

import { ProductTile } from '../product-tile'
import CarouselWrapper from './carousel-wrapper'

// Add type for product collection
interface ProductCollection {
  title?: string
  handle?: string
}

// Add specific product fixes
const fixProductThumbnail = (product) => {
  // Log the product for debugging
  console.log(`ProductCarousel: Processing product ${product.title}`, {
    id: product.id,
    handle: product.handle,
    thumbnail: product.thumbnail
  })
  
  // Special handling for Conscious Stoner T-Shirt Female
  if (product.handle === "conscious-stoner-t-shirt-female" || 
      (product.title && product.title.toLowerCase().includes("conscious stoner") && 
       product.title.toLowerCase().includes("female"))) {
    console.log(`ProductCarousel: Applying special fix for Conscious Stoner T-Shirt Female`)
    
    // Use the remote URL instead of local path
    const productPageImage = "https://cgsolacemedusav2-production.up.railway.app/uploads/female_model_t_shirt_2_6d4e8cc3b5.jpg"
    
    console.log(`ProductCarousel: Original thumbnail for ${product.title}:`, product.thumbnail)
    console.log(`ProductCarousel: Using fixed URL for ${product.title}:`, productPageImage)
    
    return {
      ...product,
      thumbnail: productPageImage
    }
  }
  
  // Handle products by exact handle
  const handleSpecificFixes = {
    "merch-pack": "/product1.jpg",  // Use existing image instead of merch1.jpg
    "zheez-pink-og": "/product2.jpg" // Use existing image
  }
  
  // Direct handle-based match (most specific)
  if (product.handle && handleSpecificFixes[product.handle]) {
    console.log(`ProductCarousel: Applying handle-specific fix for "${product.handle}"`)
    return {
      ...product,
      thumbnail: handleSpecificFixes[product.handle]
    }
  }
  
  // Check for problematic image URLs
  if (product.thumbnail && product.thumbnail.includes('pink_zheez')) {
    console.log(`ProductCarousel: Fixing problematic pink_zheez image for ${product.title}`)
    return {
      ...product,
      thumbnail: "/product2.jpg"  // Use existing image
    }
  }
  
  // For merch pack
  if (product.title?.toLowerCase().includes("merch-pack") || product.handle?.toLowerCase() === "merch-pack") {
    console.log(`ProductCarousel: Applying special thumbnail fix for "${product.title}"`)
    return {
      ...product,
      thumbnail: "/uploads/products/merch_pack.jpg"
    }
  }
  
  // Check if thumbnail is missing or invalid
  if (!product.thumbnail || product.thumbnail === "null" || product.thumbnail === "undefined") {
    console.log(`ProductCarousel: Missing thumbnail for ${product.title}, generating fallback`)
    // Construct a fallback thumbnail path based on handle, with null check
    const fallbackPath = product.handle 
      ? `/uploads/products/${product.handle.replace(/-/g, '_')}.jpg`
      : '/uploads/products/default.jpg'
    return {
      ...product,
      thumbnail: fallbackPath
    }
  }
  
  return product
}

interface ViewAllProps {
  link: string
  text?: string
}

interface ProductCarouselProps {
  products: StoreProduct[]
  regionId: string
  title: string
  subtitle?: string
  viewAll?: ViewAllProps
  testId?: string
  hideToggleButtons?: boolean
}

// Add type for product with description
interface ProductTileProduct {
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

export function ProductCarousel({
  products,
  regionId,
  title,
  subtitle,
  viewAll,
  testId,
  hideToggleButtons = false,
}: ProductCarouselProps) {
  const [clothingType, setClothingType] = useState<'mens' | 'womens'>('mens')
  const [seedType, setSeedType] = useState<'feminized' | 'regular'>('feminized')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showAllProducts, setShowAllProducts] = useState(false)
  
  // Add ref for scroll animation
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, {
    once: true,
    margin: "-100px 0px"
  })

  // Handle clothing type change with animation
  const handleClothingTypeChange = (type: 'mens' | 'womens') => {
    if (type === clothingType) return;
    
    // Set slide direction based on button order
    const order = { mens: 0, womens: 1 };
    const currentIndex = order[clothingType];
    const newIndex = order[type];
    setSlideDirection(newIndex < currentIndex ? 'right' : 'left');
    
    setIsTransitioning(true);
    setIsDropdownOpen(false);
    
    // First fade out
    setTimeout(() => {
      setClothingType(type);
      // Then fade in
      requestAnimationFrame(() => {
        setIsTransitioning(false);
      });
    }, 300);
  }

  // Handle seed type change with animation
  const handleSeedTypeChange = (type: 'feminized' | 'regular') => {
    if (type === seedType) return;
    
    setSlideDirection(type === 'feminized' ? 'right' : 'left');
    setIsTransitioning(true);
    
    // First fade out
    setTimeout(() => {
      setSeedType(type);
      // Then fade in
      requestAnimationFrame(() => {
        setIsTransitioning(false);
      });
    }, 300);
  }

  // Debug log to see all products
  console.log('All products before filtering:', products.length, products.map(p => ({
    title: p.title,
    handle: p.handle,
    collection: p.collection?.handle,
    testId
  })));
  
  // Process products to fix any thumbnail issues and filter by type
  const processedProducts = products.map(fixProductThumbnail)
    .filter(product => {
      if (testId === 'seeds-section') {
        const productTitle = product.title?.toLowerCase() || '';
        const productHandle = product.handle?.toLowerCase() || '';
        const productCollection = product.collection?.handle?.toLowerCase() || '';
        const productCollectionTitle = product.collection?.title?.toLowerCase() || '';
        
        // More detailed debug logging
        console.log('Processing seed product:', {
          title: productTitle,
          handle: productHandle,
          collection: productCollection,
          collectionTitle: productCollectionTitle,
          seedType,
          testId,
          collection_id: product.collection?.id
        });

        if (seedType === 'feminized') {
          // Show only products from feminized collections
          return productCollection.includes('feminized') || productCollectionTitle.includes('feminized');
        } else {
          // Show only products from regular collections
          return productCollection.includes('regular') || productCollectionTitle.includes('regular');
        }
      } else if (testId === 'clothing-section') {
        const productTitle = product.title?.toLowerCase() || '';
        const productCollection = product.collection?.handle?.toLowerCase() || '';
        const productCollectionTitle = product.collection?.title?.toLowerCase() || '';

        // Debug logging for clothing products
        console.log('Processing clothing product:', {
          title: productTitle,
          collection: productCollection,
          collectionTitle: productCollectionTitle,
          clothingType,
          testId
        });

        if (clothingType === 'mens') {
          // Only show products that are explicitly marked as men's and not women's
          const isMensProduct = (
            productCollection === 'mens-merch' || 
            productCollectionTitle === 'mens merch' ||
            (
              (productTitle.includes("men's") || productTitle.includes('mens')) &&
              !productTitle.includes("women's") && 
              !productTitle.includes('womens')
            )
          );
          console.log(`Is men's product check for "${productTitle}":`, { isMensProduct });
          return isMensProduct;
        } else {
          // Only show products that are explicitly marked as women's
          const isWomensProduct = (
            productCollection === 'womens-merch' || 
            productCollectionTitle === 'womens merch' ||
            productTitle.includes("women's") || 
            productTitle.includes('womens')
          );
          console.log(`Is women's product check for "${productTitle}":`, { isWomensProduct });
          return isWomensProduct;
        }
      }
      return true;
    });

  // Show all products instead of limiting to 4
  const displayedProducts = processedProducts;

  // Log the filtered products for debugging
  console.log(`Filtered ${testId === 'seeds-section' ? seedType : clothingType} products:`, 
    processedProducts.map(p => ({ title: p.title, handle: p.handle }))
  );

  // Dynamic title based on type
  const displayTitle = testId === 'seeds-section' 
    ? (seedType === 'regular' ? 'Regular Seeds' : 'Feminized Seeds')
    : `${clothingType === 'mens' ? "Men's Merch" : "Women's Merch"} Collection`;
    
  // Use the passed subtitle prop instead of internal logic for seeds
  const displaySubtitle = subtitle || (testId === 'seeds-section'
    ? (seedType === 'regular' 
        ? 'All the crosses with our beloved Hell Raiser OG x OG Kush with a variety of bangers' 
        : ' Every genetic that we drop is a stable, trichome covered, terpene loaded gem!')
    : getClothingSubtitle(clothingType));

  function getClothingSubtitle(type: 'mens' | 'womens') {
    switch (type) {
      case 'mens':
        return "Quality merchandise designed for the modern gentleman.";
      case 'womens':
        return "Stylish and comfortable women's merchandise collection.";
      default:
        return "";
    }
  }
  
  return (
    <>
      <style jsx>{`
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(251, 191, 36, 0.4),
                       0 0 20px rgba(251, 191, 36, 0.2);
          }
          50% {
            box-shadow: 0 0 15px rgba(251, 191, 36, 0.5),
                       0 0 25px rgba(251, 191, 36, 0.3);
          }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .transform-gpu {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        .blur-transition {
          transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
          opacity: 1;
          filter: blur(0);
          transform: scale(1) translateX(0);
        }

        .blur-transition.transitioning {
          opacity: 0;
          filter: blur(4px);
          transform: scale(0.98) translateX(${slideDirection === 'left' ? '-10%' : '10%'});
        }

        .blur-transition.entering {
          opacity: 1;
          filter: blur(0);
          transform: scale(1) translateX(0);
        }
      `}</style>
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full pt-8 small:pt-10 pb-16 small:pb-20 flex items-center relative overflow-hidden"
      >
        <div className="absolute inset-0 w-full h-full bg-gray-100"></div>
        <Container className="overflow-hidden !p-0 w-full max-w-[95%] 2xl:max-w-[90%] relative z-10" data-testid={testId}>
          <Box className="flex flex-col gap-2 small:gap-3 w-full">
            <div className="flex flex-col items-center mx-auto max-w-[800px] pt-1">
              {!hideToggleButtons && testId === 'seeds-section' ? (
                <div className="flex items-center justify-center mb-6 relative">
                  <div className="flex bg-white rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleSeedTypeChange('feminized')}
                      className={`relative px-16 py-2 text-2xl font-bold transition-all duration-300 ${
                        seedType === 'feminized'
                          ? 'text-amber-400 bg-amber-400/5'
                          : 'text-gray-600 hover:text-amber-400'
                      }`}
                    >
                      FEMINIZED
                      {seedType === 'feminized' && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-400"></div>
                      )}
                    </button>
                    <button
                      onClick={() => handleSeedTypeChange('regular')}
                      className={`relative px-16 py-2 text-2xl font-bold transition-all duration-300 ${
                        seedType === 'regular'
                          ? 'text-amber-400 bg-amber-400/5'
                          : 'text-gray-600 hover:text-amber-400'
                      }`}
                    >
                      REGULAR
                      {seedType === 'regular' && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-400"></div>
                      )}
                    </button>
                  </div>
                </div>
              ) : !hideToggleButtons && testId === 'clothing-section' ? (
                <div className="flex items-center justify-center mb-6 relative">
                  <div className="flex bg-white rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleClothingTypeChange('mens')}
                      className={`relative px-16 py-2 text-2xl font-bold transition-all duration-300 ${
                        clothingType === 'mens'
                          ? 'text-[#d67bef] bg-[#d67bef]/5'
                          : 'text-gray-600 hover:text-[#d67bef]'
                      }`}
                    >
                      MENS
                      {clothingType === 'mens' && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#d67bef]"></div>
                      )}
                    </button>
                    <button
                      onClick={() => handleClothingTypeChange('womens')}
                      className={`relative px-16 py-2 text-2xl font-bold transition-all duration-300 ${
                        clothingType === 'womens'
                          ? 'text-[#d67bef] bg-[#d67bef]/5'
                          : 'text-gray-600 hover:text-[#d67bef]'
                      }`}
                    >
                      WOMANS
                      {clothingType === 'womens' && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#d67bef]"></div>
                      )}
                    </button>
                  </div>
                </div>
              ) : null}
              <div 
                className={`blur-transition ${
                  isTransitioning 
                    ? 'transitioning'
                    : 'entering'
                }`}
              >
                <p className="text-sm text-gray-600 text-center max-w-2xl mx-auto">
                  {displaySubtitle}
                </p>
              </div>
            </div>
            <div 
              className={`blur-transition ${
                isTransitioning 
                  ? 'transitioning'
                  : 'entering'
              }`}
              style={{
                willChange: 'transform, opacity, filter'
              }}
            >
              <div className={`relative ${showAllProducts ? 'grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 large:grid-cols-4 gap-2' : ''}`}>
                {showAllProducts ? (
                  // Grid view when showing all products
                  processedProducts.map((item) => {
                    // Get the cheapest price using the utility function
                    const { cheapestPrice } = getProductPrice({
                      product: item,
                    })

                    // Better handling of potentially invalid price values
                    const calculated = cheapestPrice?.calculated_price_number
                    const hasValidCalculatedPrice = calculated !== undefined && calculated !== null && !isNaN(calculated) && calculated > 0
                    const calculatedPrice = hasValidCalculatedPrice
                      ? cheapestPrice?.calculated_price
                      : 'Price unavailable'
                    
                    const original = cheapestPrice?.original_price_number
                    const hasValidOriginalPrice = original !== undefined && original !== null && !isNaN(original) && original > 0
                    const originalPrice = hasValidOriginalPrice
                      ? cheapestPrice?.original_price
                      : undefined
                    
                    return (
                      <Box
                        className="w-full px-1"
                        key={`${item.id}-${seedType}`}
                      >
                        <ProductTile
                          product={{
                            id: item.id,
                            created_at: item.created_at,
                            title: item.title,
                            handle: item.handle,
                            thumbnail: item.thumbnail,
                            calculatedPrice: calculatedPrice,
                            salePrice: originalPrice,
                            collection: item.collection,
                            description: item.description
                          } as ProductTileProduct}
                          regionId={regionId}
                          isCarousel={true}
                        />
                      </Box>
                    )
                  })
                ) : (
                  // Carousel view when showing limited products
                  <CarouselWrapper productsCount={processedProducts.length}>
                    {displayedProducts.map((item) => {
                      // Get the cheapest price using the utility function
                      const { cheapestPrice } = getProductPrice({
                        product: item,
                      })

                      // Better handling of potentially invalid price values
                      const calculated = cheapestPrice?.calculated_price_number
                      const hasValidCalculatedPrice = calculated !== undefined && calculated !== null && !isNaN(calculated) && calculated > 0
                      const calculatedPrice = hasValidCalculatedPrice
                        ? cheapestPrice?.calculated_price
                        : 'Price unavailable'
                      
                      const original = cheapestPrice?.original_price_number
                      const hasValidOriginalPrice = original !== undefined && original !== null && !isNaN(original) && original > 0
                      const originalPrice = hasValidOriginalPrice
                        ? cheapestPrice?.original_price
                        : undefined

                      return (
                        <Box
                          className="w-full small:flex-[0_0_45%] medium:flex-[0_0_30%] large:flex-[0_0_23%] px-1"
                          key={`${item.id}-${seedType}`}
                        >
                          <ProductTile
                            product={{
                              id: item.id,
                              created_at: item.created_at,
                              title: item.title,
                              handle: item.handle,
                              thumbnail: item.thumbnail,
                              calculatedPrice: calculatedPrice,
                              salePrice: originalPrice,
                              collection: item.collection,
                              description: item.description
                            } as ProductTileProduct}
                            regionId={regionId}
                            isCarousel={true}
                          />
                        </Box>
                      )
                    })}
                  </CarouselWrapper>
                )}
              </div>
            </div>
            
            {/* View All and Shop All buttons container */}
            <div className="flex flex-col items-center gap-0 mt-0 relative z-20">
              {/* View All/Less button */}
              {processedProducts.length > 4 && (
                <Button
                  onClick={() => setShowAllProducts(!showAllProducts)}
                  className={`px-4 py-3 duration-150 ease-in-out flex gap-2 items-center justify-center active:bg-fg-primary-pressed h-12 blur-transition !px-10 small:!px-12 !py-3 small:!py-4 text-lg small:text-xl font-bold ${
                    testId === 'clothing-section'
                      ? 'bg-[#d67bef] hover:bg-[#c15ed6]'
                      : 'bg-amber-400 hover:bg-amber-500'
                  } text-black transition-colors rounded-full uppercase tracking-wider`}
                >
                  {showAllProducts ? "VIEW LESS" : "VIEW ALL"}
                </Button>
              )}
              
              {/* External Shop All button (only show when not in expanded view) */}
              {viewAll && !showAllProducts && processedProducts.length <= 4 && (
                <Button asChild className={`blur-transition ${
                  isTransitioning 
                    ? 'transitioning'
                    : 'entering'
                }`}>
                  <LocalizedClientLink
                    href={viewAll.link}
                    className={`w-max !px-10 small:!px-12 !py-3 small:!py-4 text-lg small:text-xl font-bold ${
                      testId === 'clothing-section'
                        ? 'bg-[#d67bef] hover:bg-[#c15ed6]'
                        : 'bg-amber-400 hover:bg-amber-500'
                    } text-black transition-colors rounded-full uppercase tracking-wider`}
                  >
                    SHOP ALL
                  </LocalizedClientLink>
                </Button>
              )}
            </div>
          </Box>
        </Container>
      </motion.div>
    </>
  )
}
