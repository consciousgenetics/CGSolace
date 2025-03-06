import { getProductPrice } from '@lib/util/get-product-price'
import { StoreProduct } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

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
    
    // Use the exact same approach as the product page
    // This hardcoded URL is from a working product page - ensure it matches exactly what works there
    const productPageImage = "https://cgsolacemedusav2-production.up.railway.app/uploads/female_model_t_shirt_2_6d4e8cc3b5.jpg"
    
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
  // Process products to fix any thumbnail issues
  const processedProducts = products.map(fixProductThumbnail)
  
  return (
    <div 
      className="w-full min-h-[500px] py-10 small:py-16 flex items-center relative"
      style={{
        backgroundImage: 'url("/127-wide.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* No overlay to allow full visibility of the background image */}
      
      <Container className="overflow-hidden !p-0 w-full max-w-[95%] 2xl:max-w-[90%] relative z-10" data-testid={testId}>
        <Box className="flex flex-col gap-6 small:gap-8 medium:gap-12 w-full">
          <CarouselWrapper title={title} subtitle={subtitle} productsCount={products.length}>
            {processedProducts.map((item, index) => {
              // Get the cheapest variant price
              let calculatedPrice = 'N/A'
              let originalPrice = 'N/A'

              if (item.variants && item.variants.length > 0) {
                // Debug variant prices
                console.log(`Product ${item.title} variants:`, item.variants.map(v => ({
                  id: v.id,
                  prices: v.prices
                })))

                // Find the cheapest variant
                const variantWithPrice = item.variants
                  .filter(variant => variant.prices && variant.prices.length > 0)
                  .sort((a, b) => {
                    const aPrice = a.prices?.[0]?.amount || Infinity
                    const bPrice = b.prices?.[0]?.amount || Infinity
                    return aPrice - bPrice
                  })[0]

                if (variantWithPrice && variantWithPrice.prices && variantWithPrice.prices.length > 0) {
                  const price = variantWithPrice.prices[0]
                  console.log(`Selected price for ${item.title}:`, price)
                  
                  // Convert price from smallest unit to main unit
                  const priceInPounds = Number(price.amount)
                  console.log(`Price in smallest unit: ${price.amount}, converted to pounds: ${priceInPounds}`)
                  
                  calculatedPrice = `£${priceInPounds.toFixed(2)}`
                  originalPrice = calculatedPrice
                  
                  console.log(`Final formatted price: ${calculatedPrice}`)
                }
              } else {
                console.log(`No variants found for product ${item.title}`)
              }

              return (
                <Box
                  className="flex-[0_0_85%] xsmall:flex-[0_0_65%] small:flex-[0_0_50%] medium:flex-[0_0_33.333%] large:flex-[0_0_25%] pl-2"
                  key={index}
                >
                  <ProductTile
                    product={{
                      id: item.id,
                      created_at: item.created_at,
                      title: item.title,
                      handle: item.handle,
                      thumbnail: item.thumbnail,
                      calculatedPrice,
                      salePrice: originalPrice,
                    }}
                    regionId={regionId}
                  />
                </Box>
              )
            })}
          </CarouselWrapper>
          {viewAll && (
            <Button asChild className="mx-auto mt-6 small:mt-8">
              <LocalizedClientLink
                href={viewAll.link}
                style={{ color: '#FFD700' }} 
                className="w-max !px-8 small:!px-10 !py-3 small:!py-4 text-lg small:text-xl font-bold bg-white hover:bg-gray-100 transition-colors rounded-full uppercase"
              >
                SHOP ALL
              </LocalizedClientLink>
            </Button>
          )}
        </Box>
      </Container>
    </div>
  )
}
