'use client'

import { Suspense, useEffect, useState } from 'react'
import type { SearchedProduct } from 'types/global'

import { Box } from '@modules/common/components/box'
import { Text } from '@modules/common/components/text'
import { search } from '@modules/search/actions'
import SkeletonProductGrid from '@modules/skeletons/templates/skeleton-product-grid'
import ProductFilters from '@modules/store/components/filters'
import ActiveProductFilters from '@modules/store/components/filters/active-filters'
import ProductFiltersDrawer from '@modules/store/components/filters/filters-drawer'
import PaginatedProducts from '@modules/store/templates/paginated-products'

type ClientSideSortProps = {
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
  const [products, setProducts] = useState(initialProducts.results)
  const [count, setCount] = useState(initialProducts.count)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Always use default 'relevance' sort order
  const sortBy = 'relevance'

  useEffect(() => {
    // Update state with initialProducts if needed
    if (products !== initialProducts.results) {
      setProducts(initialProducts.results);
      setCount(initialProducts.count);
    }
  }, [initialProducts, products])
  
  // Log region info for debugging price issues
  useEffect(() => {
    console.log(`ClientSideSort: Country: ${countryCode}, Region:`, {
      id: region?.id,
      currency: region?.currency_code
    });
    
    // Check if region currency matches expected country currency
    const expectedCurrency = countryCode === 'gb' ? 'GBP' : countryCode === 'us' ? 'USD' : 'EUR';
    if (region?.currency_code && region.currency_code.toUpperCase() !== expectedCurrency) {
      console.warn(`Currency mismatch: Region has ${region.currency_code} but expected ${expectedCurrency} for ${countryCode}`);
    }
  }, [countryCode, region]);

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
          {/* Sort feature removed */}
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