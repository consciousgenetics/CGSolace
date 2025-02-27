'use client'

import { Suspense, useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import type { SearchedProduct } from 'types/global'

import { storeSortOptions } from '@lib/constants'
import { getCategoryByHandle } from '@lib/data/categories'
import { getProductsList, getStoreFilters } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import RefinementList from '@modules/common/components/sort'
import { Text } from '@modules/common/components/text'
import { ProductCarousel } from '@modules/products/components/product-carousel'
import { search } from '@modules/search/actions'
import SkeletonProductGrid from '@modules/skeletons/templates/skeleton-product-grid'
import SkeletonProductsCarousel from '@modules/skeletons/templates/skeleton-products-carousel'
import ProductFilters from '@modules/store/components/filters'
import ActiveProductFilters from '@modules/store/components/filters/active-filters'
import ProductFiltersDrawer from '@modules/store/components/filters/filters-drawer'
import PaginatedProducts from '@modules/store/templates/paginated-products'

export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

export async function generateStaticParams() {
  const categories = ['seeds', 'shirts', 'sweatshirts', 'pants', 'merch']
  const countryCodes = ['uk', 'us', 'de', 'dk', 'fr']
  
  const params = []
  for (const countryCode of countryCodes) {
    for (const category of categories) {
      params.push({
        countryCode,
        category: [category]
      })
    }
  }
  
  return params
}

interface ClientSideSortProps {
  initialProducts: {
    results: SearchedProduct[]
    count: number
  }
  countryCode: string
  currentCategory: any
  region: any
  filters: any
}

function ClientSideSort({ 
  initialProducts, 
  countryCode, 
  currentCategory,
  region,
  filters 
}: ClientSideSortProps) {
  const [products, setProducts] = useState(initialProducts.results)
  const [count, setCount] = useState(initialProducts.count)
  const [sortBy, setSortBy] = useState('relevance')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function updateSort() {
      if (sortBy === 'relevance') return

      setLoading(true)
      try {
        const results = await search({
          currency_code: region.currency_code,
          category_id: currentCategory.id,
          order: sortBy
        })
        setProducts(results.results)
        setCount(results.count)
      } catch (err) {
        console.error("Error sorting products:", err)
      }
      setLoading(false)
    }

    updateSort()
  }, [sortBy, currentCategory.id, region.currency_code])

  return (
    <>
      <Box className="flex flex-col gap-4">
        <Text className="text-md text-secondary">
          {count === 1 ? `${count} product` : `${count} products`}
        </Text>
        <Box className="grid w-full grid-cols-2 items-center justify-between gap-2 small:flex small:flex-wrap">
          <Box className="hidden small:flex">
            <ProductFilters filters={filters} />
          </Box>
          <ProductFiltersDrawer>
            <ProductFilters filters={filters} />
          </ProductFiltersDrawer>
          <RefinementList
            options={storeSortOptions}
            sortBy={sortBy}
          />
        </Box>
        <ActiveProductFilters
          filters={filters}
          currentCategory={currentCategory}
          countryCode={countryCode}
        />
      </Box>
      <Suspense fallback={<SkeletonProductGrid />}>
        {loading ? (
          <SkeletonProductGrid />
        ) : products && products.length > 0 ? (
          <PaginatedProducts
            products={products}
            total={count}
            page={currentPage}
            countryCode={countryCode}
          />
        ) : (
          <p className="py-10 text-center text-lg text-secondary">
            No products found in this category.
          </p>
        )}
      </Suspense>
    </>
  )
}

export default async function CategoryTemplate({
  params,
}: {
  params: { countryCode: string; category: string[] }
}) {
  try {
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
    const initialProducts = await search({
      currency_code: region.currency_code,
      category_id: currentCategory.id,
      order: 'relevance'
    })

    // Get recommended products safely
    let recommendedProducts = []
    try {
      const productsData = await getProductsList({
        pageParam: 0,
        queryParams: { limit: 9 },
        countryCode: params.countryCode,
      })
      
      if (productsData && productsData.response) {
        recommendedProducts = productsData.response.products || []
      }
    } catch (err) {
      console.error("Error fetching recommended products:", err)
      // Continue with empty recommended products
    }

    return (
      <>
        <Container className="flex flex-col gap-8 !pb-8 !pt-4">
          <ClientSideSort 
            initialProducts={initialProducts}
            countryCode={countryCode}
            currentCategory={currentCategory}
            region={region}
            filters={filters}
          />
        </Container>
        {recommendedProducts && recommendedProducts.length > 0 && (
          <Suspense fallback={<SkeletonProductsCarousel />}>
            <ProductCarousel
              products={recommendedProducts}
              regionId={region.id}
              title="Recommended products"
            />
          </Suspense>
        )}
      </>
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
