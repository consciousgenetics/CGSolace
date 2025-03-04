import { getProductPrice } from '@lib/util/get-product-price'
import { StoreProduct } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

import { ProductTile } from '../product-tile'
import CarouselWrapper from './carousel-wrapper'

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
  return (
    <div className="w-full bg-amber-50 h-screen flex items-center">
      <Container className="overflow-hidden !p-0 w-full max-w-[95%] 2xl:max-w-[90%]" data-testid={testId}>
        <Box className="flex flex-col gap-8 small:gap-12 h-full w-full">
          <CarouselWrapper title={title} subtitle={subtitle} productsCount={products.length}>
            {products.map((item, index) => {
              const priceData = getProductPrice({
                product: item,
              });

              // Add null checks for cheapestPrice
              const calculatedPrice = priceData.cheapestPrice?.calculated_price || 'N/A';
              const originalPrice = priceData.cheapestPrice?.original_price || null;

              return (
                <Box
                  className="flex-[0_0_calc(100%/4-12px)] small:flex-[0_0_calc(100%/4-12px)] medium:flex-[0_0_calc(100%/4-12px)] large:flex-[0_0_calc(100%/4-12px)] xl:flex-[0_0_calc(100%/4-12px)] 2xl:flex-[0_0_calc(100%/4-12px)] pl-2"
                  key={index}
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
          {viewAll && (
            <Button asChild>
              <LocalizedClientLink
                href={viewAll.link}
                className="mx-auto w-max !px-8 !py-4 text-lg font-bold bg-purple-700 text-white hover:bg-purple-800 transition-colors"
              >
                Shop All
              </LocalizedClientLink>
            </Button>
          )}
        </Box>
      </Container>
    </div>
  )
}
