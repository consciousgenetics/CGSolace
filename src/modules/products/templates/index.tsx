import { Suspense } from 'react'

import { retrieveCart } from '@lib/data/cart'
import { getProductVariantsColors } from '@lib/data/fetch'
import { getProductsListByCollectionId } from '@lib/data/products'
import { HttpTypes } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import ImageGallery from '@modules/products/components/image-gallery'
import ProductTabs from '@modules/products/components/product-tabs'
import ProductInfo from '@modules/products/templates/product-info'
import SkeletonProductActions from '@modules/skeletons/components/skeleton-product-actions'
import SkeletonProductsCarousel from '@modules/skeletons/templates/skeleton-products-carousel'

import { ProductCarousel } from '../components/product-carousel'
import ProductBreadcrumbs from './breadcrumbs'
import ProductActionsWrapper from './product-actions-wrapper'

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = async ({
  product,
  region,
  countryCode,
}: ProductTemplateProps) => {
  // Fetch variant colors with error handling
  let variantColorsData = [];
  try {
    const variantsColors = await getProductVariantsColors()
    variantColorsData = variantsColors?.data || []
  } catch (error) {
    console.error("Error loading product variant colors:", error)
  }

  const { response: productsList } = await getProductsListByCollectionId({
    collectionId: product.collection_id,
    countryCode,
    excludeProductId: product.id,
  })

  const cart = await retrieveCart()

  return (
    <div data-testid="product-container" className="pt-6 small:pt-8 medium:pt-10 mt-0">
      <Container
        className="relative flex flex-col gap-y-4 small:gap-y-6 medium:gap-y-12"
      >
        <div aria-hidden id="top-of-product" className="!h-0 !m-0 !p-0"></div>
        <div className="flex flex-col gap-y-4 small:gap-y-6 !mt-0 !pt-0">
          <ProductBreadcrumbs
            product={product}
            countryCode={countryCode}
          />
          <Box className="relative flex flex-col gap-y-4 small:gap-y-6 large:flex-row large:items-start large:gap-x-8 xl:gap-x-[120px]">
            <Box className="relative block w-full">
              <ImageGallery
                title={product.title}
                images={product?.images || []}
              />
            </Box>
            <Box className="flex w-full flex-col gap-y-4 small:gap-y-6 py-4 small:py-8 large:sticky large:top-24 large:max-w-[440px] large:py-0">
              <ProductInfo product={product} />
              <Suspense fallback={<SkeletonProductActions />}>
                <ProductActionsWrapper
                  id={product.id}
                  region={region}
                  cartItems={cart?.items}
                  colors={variantColorsData}
                />
              </Suspense>
              <ProductTabs product={product} />
            </Box>
          </Box>
        </div>
      </Container>

      {productsList.products.length > 0 && (
        <Suspense fallback={<SkeletonProductsCarousel />}>
          <ProductCarousel
            title="Recommended"
            products={productsList.products.map(product => ({
              ...product,
              category: product.collection
            }))}
            regionId={region.id}
          />
        </Suspense>
      )}
    </div>
  )
}

export default ProductTemplate
