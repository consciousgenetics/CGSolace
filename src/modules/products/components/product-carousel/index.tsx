'use client'

import { getProductPrice } from '@lib/util/get-product-price'
import { StoreProduct, StoreProductCategory, StoreCollection } from '@medusajs/types'
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

// Define our custom category type that includes all required fields
interface ProductCategory {
  id: string
  handle: string
  title?: string
  name?: string
  parent_category?: ProductCategory | null
  category_children?: ProductCategory[]
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  metadata?: Record<string, unknown> | null
}

// Extended StoreProduct type that preserves the original categories type
interface ExtendedStoreProduct extends StoreProduct {
  collection?: StoreCollection | null
}

// Add specific product fixes
const fixProductThumbnail = (product: StoreProduct) => {
  // Log the product for debugging
  console.log(`ProductCarousel: Processing product ${product.title}`, {
    id: product.id,
    handle: product.handle,
    thumbnail: product.thumbnail,
    categories: product.categories
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
  alternateLink?: string
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
  category?: ProductCategory
  description?: string | null
  variants?: any[]
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

  // Validation logging - Component Props
  useEffect(() => {
    console.log('=== ProductCarousel Props Validation ===');
    console.log('Component Props:', {
      hasProducts: Boolean(products),
      productCount: products?.length || 0,
      testId,
      title
    });
  }, [products, testId, title]);

  // Validation logging - Product Categories
  useEffect(() => {
    if (!products?.length) return;

    console.log('=== Product Categories Validation ===');
    
    // Log unique category handles
    const uniqueHandles = new Set();
    products.forEach(product => {
      product.categories?.forEach(cat => {
        if (cat.handle) uniqueHandles.add(cat.handle);
      });
    });

    console.log('All unique category handles:', Array.from(uniqueHandles));

    // Analyze category structure
    const categoryAnalysis = products.map(product => ({
      title: product.title,
      categoryCount: product.categories?.length || 0,
      handles: product.categories?.map(c => c.handle) || [],
      hasNestedCategories: product.categories?.some(c => c.parent_category !== null),
      parentCategories: product.categories
        ?.filter(c => c.parent_category)
        .map(c => c.parent_category?.handle)
    }));

    console.log('Category structure analysis:', categoryAnalysis);

    // Check for expected seed category handles
    const seedCategoryCheck = {
      hasRegularSeeds: Array.from(uniqueHandles).some(h => 
        h === '/categories/seeds' || h === 'seeds'
      ),
      hasFeminizedSeeds: Array.from(uniqueHandles).some(h => 
        h === '/categories/feminized-seeds' || h === 'feminized-seeds'
      ),
      allSeedRelatedHandles: Array.from(uniqueHandles).filter(h => 
        String(h).includes('seed')
      )
    };

    console.log('Seed category validation:', seedCategoryCheck);
  }, [products]);

  // Validation logging - State Changes
  useEffect(() => {
    console.log('=== State Change Validation ===', {
      seedType,
      testId,
      currentProductCount: products?.length,
      timestamp: new Date().toISOString()
    });
  }, [seedType, testId, products]);

  // Debug log at component mount
  useEffect(() => {
    console.log('ProductCarousel mounted:', {
      testId,
      totalProducts: products?.length,
      products: products?.map(p => ({
        id: p.id,
        title: p.title,
        categories: p.categories?.map(c => ({
          id: c.id,
          handle: c.handle,
          name: c.name
        }))
      }))
    });
  }, [products, testId]);

  // Debug log when seed type changes
  useEffect(() => {
    console.log('Seed type changed:', {
      seedType,
      testId
    });
  }, [seedType, testId]);

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

  // Debug: Log the incoming props
  console.log('ProductCarousel Props:', {
    productsCount: products?.length || 0,
    regionId,
    title,
    testId,
    hideToggleButtons
  });

  // Debug: Log each product's full data
  products.forEach(product => {
    console.log('Product Details:', {
      id: product.id,
      title: product.title,
      handle: product.handle,
      thumbnail: product.thumbnail,
      categories: product.categories,
      collection: product.collection
    });
  });

  // Process products with simplified filtering
  const processedProducts = products.filter(product => {
    // Log each product being processed
    console.log(`Processing product "${product.title}":`, {
      id: product.id,
      categories: product.categories || [],
      testId,
      seedType,
      clothingType
    });

    // If categories is undefined, try to use collection information
    const productCategories = product.categories || [];
    const productCollection = product.collection;
    
    console.log(`Categories and collection for "${product.title}":`, {
      categories: productCategories,
      collection: productCollection
    });

    if (testId === 'seeds-section') {
      // For seeds, if no categories, check collection handle/title
      if (productCategories.length === 0 && productCollection) {
        const collectionHandle = productCollection.handle?.toLowerCase() || '';
        const collectionTitle = productCollection.title?.toLowerCase() || '';
        
        if (seedType === 'regular') {
          return collectionHandle.includes('regular') || 
                 collectionTitle.includes('regular');
        } else {
          return collectionHandle.includes('feminized') || 
                 collectionTitle.includes('feminized');
        }
      }

      // If we have categories, use those
      const categoryHandles = productCategories.map(c => c.handle?.toLowerCase());
      const categoryNames = productCategories.map(c => c.name?.toLowerCase());
      
      console.log(`Seed section - checking product "${product.title}":`, {
        categoryHandles,
        categoryNames,
        seedType
      });

      if (seedType === 'regular') {
        return categoryHandles.some(handle => 
          handle === 'seeds' || 
          handle === '/categories/seeds' ||
          handle?.includes('regular')
        ) || categoryNames.some(name => 
          name?.includes('regular') || 
          name?.includes('seeds')
        );
      } else {
        return categoryHandles.some(handle => 
          handle === 'feminized-seeds' || 
          handle === '/categories/feminized-seeds' ||
          handle?.includes('feminized')
        ) || categoryNames.some(name => 
          name?.includes('feminized')
        );
      }
    } else if (testId === 'clothing-section') {
      // For clothing, if no categories, check collection handle/title
      if (productCategories.length === 0 && productCollection) {
        const collectionHandle = productCollection.handle?.toLowerCase() || '';
        const collectionTitle = productCollection.title?.toLowerCase() || '';
        const productTitle = product.title?.toLowerCase() || '';
        
        if (clothingType === 'mens') {
          // For men's products, explicitly exclude anything with 'women', 'female', or 'pink' in the title
          return ((collectionHandle.includes('men') || collectionTitle.includes('men')) && 
                 !collectionHandle.includes('women') && 
                 !collectionTitle.includes('women') &&
                 !productTitle.includes('women') &&
                 !productTitle.includes('female') &&
                 !productTitle.includes('pink')) ||
                 (product as any).clothing_type === 'mens';
        } else {
          // For women's products, look for 'women', 'female', or 'pink' in the title
          return collectionHandle.includes('women') || 
                 collectionTitle.includes('women') ||
                 productTitle.includes('women') ||
                 productTitle.includes('female') ||
                 productTitle.includes('pink') ||
                 (product as any).clothing_type === 'womens';
        }
      }

      // If we have categories, use those
      const isMensProduct = productCategories.some(cat => {
        const handle = cat.handle?.toLowerCase() || '';
        const name = cat.name?.toLowerCase() || '';
        const productTitle = product.title?.toLowerCase() || '';
        return ((handle.includes('men') || 
               name.includes('men') || 
               handle.includes('mens-merch') || 
               name.includes("men's")) &&
               !productTitle.includes('women') &&
               !productTitle.includes('female') &&
               !productTitle.includes('pink')) ||
               (product as any).clothing_type === 'mens';
      });

      const isWomensProduct = productCategories.some(cat => {
        const handle = cat.handle?.toLowerCase() || '';
        const name = cat.name?.toLowerCase() || '';
        const productTitle = product.title?.toLowerCase() || '';
        return (handle.includes('women') || 
               name.includes('women') || 
               handle.includes('womens-merch') || 
               name.includes("women's") ||
               productTitle.includes('women') ||
               productTitle.includes('female') ||
               productTitle.includes('pink')) ||
               (product as any).clothing_type === 'womens';
      });
      
      console.log(`Clothing section - checking product "${product.title}":`, {
        clothingType,
        isMensProduct,
        isWomensProduct,
        categories: productCategories.map(c => ({
          handle: c.handle,
          name: c.name
        }))
      });
      
      return clothingType === 'mens' ? isMensProduct : isWomensProduct;
    }

    return true;
  }).map(fixProductThumbnail);

  // Log filtered results
  console.log('Filtered products:', {
    testId,
    seedType,
    clothingType,
    totalBefore: products.length,
    totalAfter: processedProducts.length,
    filteredProducts: processedProducts.map(p => ({
      title: p.title,
      categories: p.categories?.map(c => c.handle)
    }))
  });

  const displayedProducts = processedProducts;

  // Debug: Log what will be displayed
  console.log('Products to Display:', {
    count: displayedProducts.length,
    products: displayedProducts.map(p => ({
      id: p.id,
      title: p.title,
      thumbnail: p.thumbnail
    }))
  });

  // Dynamic title based on type
  const displayTitle = testId === 'seeds-section' 
    ? (seedType === 'regular' ? 'Regular Seeds' : 'Feminized Seeds')
    : title === "Recommended" 
      ? "Recommended" 
      : `${clothingType === 'mens' ? "Men's Merch" : "Women's Merch"} Collection`;
    
  // Use the passed subtitle prop instead of internal logic for seeds
  const displaySubtitle = subtitle || (testId === 'seeds-section'
    ? (seedType === 'regular' 
        ? 'All the crosses with our beloved Hell Raiser OG x OG Kush with a variety of bangers' 
        : ' Every genetic that we drop is a stable, trichome covered, terpene loaded gem!')
    : title === "Recommended" ? "" : getClothingSubtitle(clothingType));

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

  // Debug: Log the final state before render
  console.log('Final Render State:', {
    displayTitle,
    displaySubtitle,
    productsToShow: displayedProducts.length,
    testId,
    clothingType,
    seedType
  });
  
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
                <div className="flex items-center justify-center mb-6 relative w-full px-4 small:px-0">
                  <div className="flex bg-white rounded-lg overflow-hidden w-full small:w-auto">
                    <button
                      onClick={() => handleSeedTypeChange('feminized')}
                      className={`relative flex-1 small:flex-initial px-4 small:px-16 py-3 small:py-2 text-xl small:text-2xl font-bold transition-all duration-300 font-latto ${
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
                      className={`relative flex-1 small:flex-initial px-4 small:px-16 py-3 small:py-2 text-xl small:text-2xl font-bold transition-all duration-300 font-latto ${
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
                <div className="flex items-center justify-center mb-6 relative w-full px-4 small:px-0">
                  <div className="flex bg-white rounded-lg overflow-hidden w-full small:w-auto">
                    <button
                      onClick={() => handleClothingTypeChange('mens')}
                      className={`relative flex-1 small:flex-initial px-4 small:px-16 py-3 small:py-2 text-xl small:text-2xl font-bold transition-all duration-300 font-latto ${
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
                      className={`relative flex-1 small:flex-initial px-4 small:px-16 py-3 small:py-2 text-xl small:text-2xl font-bold transition-all duration-300 font-latto ${
                        clothingType === 'womens'
                          ? 'text-[#d67bef] bg-[#d67bef]/5'
                          : 'text-gray-600 hover:text-[#d67bef]'
                      }`}
                    >
                      WOMEN'S
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
                {/* Title - Make it mobile optimized */}
                <h2 className="text-2xl xs:text-3xl small:text-4xl font-bold text-center mb-2 font-anton">
                  {displayTitle}
                </h2>
                
                {testId === 'seeds-section' ? (
                  <p className="text-base text-gray-600 text-center max-w-2xl mx-auto font-anton">
                    Every genetic that we drop is a stable, trichome covered, terpene loaded gem!
                  </p>
                ) : title === "Recommended" ? null : (
                  <p className="text-sm text-gray-600 text-center max-w-2xl mx-auto font-latto">
                    {displaySubtitle}
                  </p>
                )}
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
                        key={`${item.id}-${seedType}-${clothingType}`}
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
                            variants: item.variants,
                            category: {
                              id: item.id,
                              handle: item.handle || '',
                              title: testId === 'clothing-section' 
                                ? (clothingType === 'mens' ? "Men's Merch" : "Women's Merch")
                                : title === "Recommended" ? "Recommended" : 'Seeds',
                              name: testId === 'clothing-section'
                                ? (clothingType === 'mens' ? "Men's Collection" : "Women's Collection")
                                : title === "Recommended" ? "Recommended" : 'Seeds Collection'
                            } as ProductCategory,
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
                          className="w-full small:flex-[0_0_45%] medium:flex-[0_0_30%] large:flex-[0_0_23%] px-0 small:px-1"
                          key={`${item.id}-${seedType}-${clothingType}`}
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
                              variants: item.variants,
                              category: {
                                id: item.id,
                                handle: item.handle || '',
                                title: testId === 'clothing-section' 
                                  ? (clothingType === 'mens' ? "Men's Merch" : "Women's Merch")
                                  : title === "Recommended" ? "Recommended" : 'Seeds',
                                name: testId === 'clothing-section'
                                  ? (clothingType === 'mens' ? "Men's Collection" : "Women's Collection")
                                  : title === "Recommended" ? "Recommended" : 'Seeds Collection'
                              } as ProductCategory,
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
                  className={`px-4 py-3 duration-150 ease-in-out flex gap-2 items-center justify-center active:bg-fg-primary-pressed h-12 blur-transition !px-10 small:!px-12 !py-3 small:!py-4 text-lg small:text-xl font-bold font-latto ${
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
                    href={testId === 'clothing-section' 
                      ? (clothingType === 'mens' ? '/categories/mens' : '/categories/womens-merch')
                      : viewAll.link}
                    className={`w-max !px-10 small:!px-12 !py-3 small:!py-4 text-lg small:text-xl font-bold font-latto ${
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
