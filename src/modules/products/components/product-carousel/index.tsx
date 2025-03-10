'use client'

import { getProductPrice } from '@lib/util/get-product-price'
import { StoreProduct } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import Image from 'next/image'
import { useState } from 'react'
import { Heading } from '@modules/common/components/heading'

import { ProductTile } from '../product-tile'
import CarouselWrapper from './carousel-wrapper'

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
    // Construct a fallback thumbnail path based on handle
    const fallbackPath = `/uploads/products/${product.handle.replace(/-/g, '_')}.jpg`
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
}

export function ProductCarousel({
  products,
  regionId,
  title,
  subtitle,
  viewAll,
  testId,
}: ProductCarouselProps) {
  // Add state for clothing type
  const [clothingType, setClothingType] = useState<'mens' | 'womens' | 'accessories'>('mens')
  const [seedType, setSeedType] = useState<'feminized' | 'regular'>('feminized')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left')
  
  // Handle clothing type change with animation
  const handleClothingTypeChange = (type: 'mens' | 'womens' | 'accessories') => {
    if (type === clothingType) return;
    
    // Set slide direction based on button order
    const order = { mens: 0, womens: 1, accessories: 2 };
    const currentIndex = order[clothingType];
    const newIndex = order[type];
    setSlideDirection(newIndex < currentIndex ? 'right' : 'left');
    
    setIsTransitioning(true);
    
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

        switch (clothingType) {
          case 'mens':
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
            
          case 'womens':
            // Only show products that are explicitly marked as women's
            const isWomensProduct = (
              productCollection === 'womens-merch' || 
              productCollectionTitle === 'womens merch' ||
              productTitle.includes("women's") || 
              productTitle.includes('womens')
            );
            console.log(`Is women's product check for "${productTitle}":`, { isWomensProduct });
            return isWomensProduct;
            
          case 'accessories':
            // Only show products that are explicitly marked as accessories
            const isAccessory = (
              productCollection === 'accessories' || 
              productCollectionTitle === 'accessories' ||
              productTitle.includes('accessory') || 
              productTitle.includes('accessories') || 
              productTitle.includes('hat') || 
              productTitle.includes('bag')
            );
            console.log(`Is accessory check for "${productTitle}":`, { isAccessory });
            return isAccessory;
            
          default:
            return true;
        }
      }
      return true;
    });

  // Log the filtered products for debugging
  console.log(`Filtered ${testId === 'seeds-section' ? seedType : clothingType} products:`, 
    processedProducts.map(p => ({ title: p.title, handle: p.handle }))
  );

  // Dynamic title based on type
  const displayTitle = testId === 'seeds-section' 
    ? (seedType === 'regular' ? 'Regular Seeds' : 'Feminized Seeds')
    : `${clothingType === 'mens' ? "Men's Merch" : 
        clothingType === 'womens' ? "Women's Merch" : 
        'Accessories'} Collection`;
    
  const displaySubtitle = testId === 'seeds-section'
    ? (seedType === 'regular' 
        ? 'Premium quality regular seeds for traditional breeding.' 
        : 'Premium quality feminized seeds for your growing needs.')
    : getClothingSubtitle(clothingType);

  function getClothingSubtitle(type: 'mens' | 'womens' | 'accessories') {
    switch (type) {
      case 'mens':
        return "Quality merchandise designed for the modern gentleman.";
      case 'womens':
        return "Stylish and comfortable women's merchandise collection.";
      case 'accessories':
        return "Complete your look with our premium accessories.";
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
      <div className="w-full pt-8 small:pt-10 pb-6 small:pb-8 flex items-center relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-white"></div>
        <Container className="overflow-hidden !p-0 w-full max-w-[95%] 2xl:max-w-[90%] relative z-10" data-testid={testId}>
          <Box className="flex flex-col gap-4 small:gap-6 w-full">
            <div className="flex flex-col items-center mx-auto max-w-[800px] pt-2">
              {testId === 'seeds-section' ? (
                <div className="flex items-center justify-center gap-2 mb-3 bg-amber-50 p-1 rounded-full shadow-inner">
                  <button
                    onClick={() => handleSeedTypeChange('feminized')}
                    className={`relative px-6 py-2 rounded-full text-base font-bold transition-all duration-500 ${
                      seedType === 'feminized'
                        ? 'text-black shadow-lg scale-105 z-10'
                        : 'text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200'
                    }`}
                  >
                    <span className={`relative z-10 ${seedType === 'feminized' ? 'text-black' : ''}`}>Feminized</span>
                    {seedType === 'feminized' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full shadow-lg transition-all duration-500 animate-glow"></div>
                    )}
                  </button>
                  <button
                    onClick={() => handleSeedTypeChange('regular')}
                    className={`relative px-6 py-2 rounded-full text-base font-bold transition-all duration-500 ${
                      seedType === 'regular'
                        ? 'text-black shadow-lg scale-105 z-10'
                        : 'text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200'
                    }`}
                  >
                    <span className={`relative z-10 ${seedType === 'regular' ? 'text-black' : ''}`}>Regular</span>
                    {seedType === 'regular' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full shadow-lg transition-all duration-500 animate-glow"></div>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-3 bg-amber-50 p-1 rounded-full shadow-inner">
                  <button
                    onClick={() => handleClothingTypeChange('mens')}
                    className={`relative px-6 py-2 rounded-full text-base font-bold transition-all duration-500 ${
                      clothingType === 'mens'
                        ? 'text-black shadow-lg scale-105 z-10'
                        : 'text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200'
                    }`}
                  >
                    <span className={`relative z-10 ${clothingType === 'mens' ? 'text-black' : ''}`}>Men's Merch</span>
                    {clothingType === 'mens' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full shadow-lg transition-all duration-500 animate-glow"></div>
                    )}
                  </button>
                  <button
                    onClick={() => handleClothingTypeChange('womens')}
                    className={`relative px-6 py-2 rounded-full text-base font-bold transition-all duration-500 ${
                      clothingType === 'womens'
                        ? 'text-black shadow-lg scale-105 z-10'
                        : 'text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200'
                    }`}
                  >
                    <span className={`relative z-10 ${clothingType === 'womens' ? 'text-black' : ''}`}>Women's Merch</span>
                    {clothingType === 'womens' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full shadow-lg transition-all duration-500 animate-glow"></div>
                    )}
                  </button>
                  <button
                    onClick={() => handleClothingTypeChange('accessories')}
                    className={`relative px-6 py-2 rounded-full text-base font-bold transition-all duration-500 ${
                      clothingType === 'accessories'
                        ? 'text-black shadow-lg scale-105 z-10'
                        : 'text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200'
                    }`}
                  >
                    <span className={`relative z-10 ${clothingType === 'accessories' ? 'text-black' : ''}`}>Accessories</span>
                    {clothingType === 'accessories' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full shadow-lg transition-all duration-500 animate-glow"></div>
                    )}
                  </button>
                </div>
              )}
              <div 
                className={`blur-transition ${
                  isTransitioning 
                    ? 'transitioning'
                    : 'entering'
                }`}
              >
                <Heading as="h2" className="text-xl small:text-2xl medium:text-3xl text-black font-bold text-center mb-1">
                  {displayTitle}
                </Heading>
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
              <CarouselWrapper productsCount={processedProducts.length}>
                {processedProducts.map((item, index) => {
                  // Get the cheapest price using the utility function
                  const { cheapestPrice } = getProductPrice({
                    product: item,
                  })

                  const calculatedPrice = cheapestPrice?.calculated_price || 'N/A'
                  const originalPrice = cheapestPrice?.original_price || calculatedPrice

              return (
                <Box
                      className="flex-[0_0_85%] xsmall:flex-[0_0_65%] small:flex-[0_0_50%] medium:flex-[0_0_33.333%] large:flex-[0_0_25%] pl-2 transition-all duration-500"
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
                    }}
                    regionId={regionId}
                  />
                </Box>
              )
            })}
          </CarouselWrapper>
            </div>
          {viewAll && (
              <Button asChild className={`mx-auto -mt-16 blur-transition ${
                isTransitioning 
                  ? 'transitioning'
                  : 'entering'
              }`}>
              <LocalizedClientLink
                href={viewAll.link}
                  className="w-max !px-10 small:!px-12 !py-3 small:!py-4 text-lg small:text-xl font-bold bg-amber-400 hover:bg-amber-500 text-black transition-colors rounded-full uppercase tracking-wider"
              >
                SHOP ALL
              </LocalizedClientLink>
            </Button>
          )}
        </Box>
      </Container>
    </div>
    </>
  )
}
