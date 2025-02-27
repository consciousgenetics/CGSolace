import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { HttpTypes } from '@medusajs/types'
import ProductActionsWrapper from '@modules/products/templates/product-actions-wrapper'
import ProductInfo from '@modules/products/templates/product-info'
import ProductTabs from '@modules/products/components/product-tabs'
import { ProductCarousel } from '@modules/products/components/product-carousel'
import SkeletonProductActions from '@modules/skeletons/components/skeleton-product-actions'

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate = async ({
  product,
  region,
  countryCode,
}: ProductTemplateProps) => {
  if (!product || !region) {
    return notFound()
  }

  // Skip the variant colors fetch completely by using an empty array
  // This is a temporary change to test if variant colors are causing issues
  const variantColorsData: any[] = [];
  
  return (
    <div>
      <div className="container relative flex flex-col py-6 small:flex-row small:items-start">
        <div className="flex flex-col gap-y-8 small:sticky small:top-20 small:w-[45%] small:py-8">
          <Suspense
            fallback={<SkeletonProductActions />}
          >
            <ProductInfo product={product} />
          </Suspense>
        </div>
        <div className="flex w-full flex-col py-8 small:w-[55%] small:py-8">
          <ProductActionsWrapper
            id={product.id}
            region={region}
            cartItems={[]}
            colors={variantColorsData}
          />
          <ProductTabs product={product} />
        </div>
      </div>
      <div className="w-full py-16">
        <ProductCarousel
          products={[]}
          regionId={region.id}
          title="Complete the look"
        />
      </div>
    </div>
  )
}

export default ProductTemplate
