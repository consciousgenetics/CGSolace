'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchedProduct } from 'types/global'

import { storeSortOptions } from '@lib/constants'
import { Box } from '@modules/common/components/box'
import RefinementList from '@modules/common/components/sort'
import { Text } from '@modules/common/components/text'
import { search } from '@modules/search/actions'
import SkeletonProductGrid from '@modules/skeletons/templates/skeleton-product-grid'
import ProductFilters from '@modules/store/components/filters'
import ActiveProductFilters from '@modules/store/components/filters/active-filters'
import ProductFiltersDrawer from '@modules/store/components/filters/filters-drawer'
import PaginatedProducts from '@modules/store/templates/paginated-products'

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

export default function ClientSideSort({ 
  initialProducts, 
  countryCode, 
  currentCategory,
  region,
  filters 
}: ClientSideSortProps) {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState(initialProducts.results)
  const [count, setCount] = useState(initialProducts.count)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Get sortBy from URL params or default to 'relevance'
  const sortBy = searchParams.get('order') || 'relevance'

  useEffect(() => {
    // Don't refetch if using default sort (already provided in initialProducts)
    if (sortBy === 'relevance' && initialProducts.results.length > 0) {
      // Update state with initialProducts if needed
      if (products !== initialProducts.results) {
        setProducts(initialProducts.results);
        setCount(initialProducts.count);
      }
      return;
    }

    // Use Promise approach instead of async/await for client component compatibility
    setLoading(true)
    
    search({
      currency_code: region.currency_code,
      category_id: currentCategory.id,
      order: sortBy
    })
    .then(results => {
      setProducts(results.results)
      setCount(results.count)
    })
    .catch(err => {
      console.error("Error sorting products:", err)
    })
    .finally(() => {
      setLoading(false)
    })
  }, [sortBy, currentCategory.id, region.currency_code, initialProducts])

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
            regionData={region}
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