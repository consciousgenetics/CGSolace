import React, { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { SearchedProduct } from 'types/global'
import type { StoreProductsListRes } from '@medusajs/medusa'
import { getProductPrice } from '@lib/util/get-product-price'

import { storeSortOptions } from '@lib/constants'
import { getCategoryByHandle } from '@lib/data/categories'
import { getProductsList, getStoreFilters } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Text } from '@modules/common/components/text'
import { ProductCarousel } from '@modules/products/components/product-carousel'
import { search } from '@modules/search/actions'
import SkeletonProductGrid from '@modules/skeletons/templates/skeleton-product-grid'
import SkeletonProductsCarousel from '@modules/skeletons/templates/skeleton-products-carousel'
import ProductFilters from '@modules/store/components/filters'
import ActiveProductFilters from '@modules/store/components/filters/active-filters'
import ProductFiltersDrawer from '@modules/store/components/filters/filters-drawer'
import PaginatedProducts from '@modules/store/templates/paginated-products'
import ClientSideSort from './client-side-sort'
import { CountdownTimer } from '@modules/layout/components/countdown-timer'
import DynamicCountdownWrapper from './dynamic-countdown-wrapper'
import CategoryContent from './category-content'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 minutes instead of disabling revalidation

export async function generateStaticParams() {
  const categories = [
    'seeds', 
    'seeds/feminized-seeds', 
    'seeds/regular-seeds', 
    'merchandise', 
    'shirts', 
    'sweatshirts', 
    'pants', 
    'merch',
    'mens'
  ]
  const countryCodes = ['uk', 'us', 'de', 'fr']
  
  const params = []
  for (const countryCode of countryCodes) {
    for (const category of categories) {
      params.push({
        countryCode,
        category: category.split('/')
      })
    }
  }
  
  return params
}

// Helper function to check if the countdown has ended
function isCountdownEnded() {
  // Always return true to bypass the countdown and show products
  return true
}

export default async function CategoryTemplate({
  params,
}: {
  params: { countryCode: string; category: string[] }
}) {
  try {
    // Use params directly without awaiting
    const { countryCode, category } = params

    // Get region data - if not found, show 404
    const region = await getRegion(countryCode)
    if (!region) {
      console.error(`Region not found for country code: ${countryCode}`)
      notFound()
    }
    
    // Get category data safely
    let categoryData;
    try {
      categoryData = await getCategoryByHandle(category)
    } catch (err) {
      console.error(`Error fetching category data: ${err}`)
      return (
        <Container>
          <p className="py-10 text-center text-lg text-secondary">
            There was an error loading this category. Please try again later.
          </p>
        </Container>
      )
    }
    
    const product_categories = categoryData?.product_categories || []
    
    // Try to get the current category from the array
    const currentCategory = product_categories[product_categories.length - 1]
    if (!currentCategory) {
      console.error(`Category not found for handle: ${category.join('/')}`)
      notFound()
    }

    // Get filters data with error handling
    const filters = await getStoreFilters()
    
    // Get initial products with default sorting
    let initialProducts = { results: [], count: 0 };
    
    try {
      const initialProductsData = await getProductsList({
        pageParam: 0,
        queryParams: { 
          category_id: [currentCategory.id],
          limit: 24,
          offset: 0
        },
        countryCode: countryCode
      })
      
      if (initialProductsData && initialProductsData.response) {
        initialProducts = {
          results: initialProductsData.response.products || [],
          count: initialProductsData.response.count || 0
        }
      } else {
        console.error(`Error getting initial products for category: ${currentCategory.handle}`)
      }
    } catch (error) {
      console.error(`Error in initial products fetch: ${error}`)
    }

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <CategoryContent
          category={category}
                initialProducts={initialProducts}
                countryCode={countryCode}
                currentCategory={currentCategory}
                region={region}
                filters={filters}
              />
      </Suspense>
    )
  } catch (error) {
    console.error('Error in CategoryTemplate:', error)
    return (
      <Container>
        <p className="py-10 text-center text-lg text-secondary">
          There was an error loading this category. Please try again later.
        </p>
      </Container>
    )
  }
}
