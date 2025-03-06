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
    <>
      <Container
        className="relative flex flex-col gap-y-4 small:gap-y-6 !py-4 small:!py-8 medium:gap-y-12"
        data-testid="product-container"
      >
        <div aria-hidden id="top-of-product"></div>
        <div className="flex flex-col gap-y-4 small:gap-y-6">
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
            products={productsList.products}
            regionId={region.id}
            title="Complete the look"
          />
        </Suspense>
      )}
    </>
  )
}

export default ProductTemplate
