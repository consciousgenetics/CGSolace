import { Suspense } from 'react'
import { notFound } from 'next/navigation'

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

export const runtime = 'edge'

export default async function CategoryTemplate({
  searchParams,
  params,
}: {
  searchParams: Record<string, string>
  params: { countryCode: string; category: string[] }
}) {
  try {
    const { sortBy, page, collection, type, material, price } = searchParams
    const { countryCode, category } = params

    // Log params for debugging
    console.log(`Rendering category page for: ${countryCode}/${category.join('/')}`);
    console.log(`Search params: ${JSON.stringify(searchParams)}`);

    // Get region data - if not found, show 404
    const region = await getRegion(countryCode)
    if (!region) {
      console.error(`Region not found for country code: ${countryCode}`);
      notFound()
    }
    
    // Get category data safely
    let categoryData;
    try {
      categoryData = await getCategoryByHandle(category)
    } catch (err) {
      console.error(`Error fetching category data: ${err}`);
      return (
        <Container>
          <p className="py-10 text-center text-lg text-secondary">
            There was an error loading this category. Please try again later.
          </p>
        </Container>
      );
    }
    
    const product_categories = categoryData?.product_categories || []
    
    // Try to get the current category from the array
    const currentCategory = product_categories[product_categories.length - 1]
    if (!currentCategory) {
      console.error(`Category not found for handle: ${category.join('/')}`);
      notFound()
    }

    // Safely parse page number 
    const pageNumber = page ? parseInt(page) : 1
    
    // Get filters data with error handling
    let filters: { 
      collection: { id: string; value: string }[]; 
      type: { id: string; value: string }[]; 
      material: { id: string; value: string }[]; 
    } = {
      collection: [],
      type: [],
      material: []
    }
    
    try {
      filters = await getStoreFilters()
    } catch (err) {
      console.error("Error fetching store filters:", err)
      // Continue with empty filters
    }
    
    // Search for products with error handling
    let results = []
    let count = 0
    try {
      const searchResults = await search({
        currency_code: region.currency_code,
        category_id: currentCategory.id,
        order: sortBy,
        page: pageNumber,
        collection: collection?.split(','),
        type: type?.split(','),
        material: material?.split(','),
        price: price?.split(','),
      })
      
      results = searchResults.results
      count = searchResults.count
    } catch (err) {
      console.error("Error searching for products:", err)
      // Continue with empty results
    }

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
                sortBy={sortBy || 'relevance'}
              />
            </Box>
            <ActiveProductFilters
              filters={filters}
              currentCategory={currentCategory}
              countryCode={countryCode}
            />
          </Box>
          <Suspense fallback={<SkeletonProductGrid />}>
            {results && results.length > 0 ? (
              <PaginatedProducts
                products={results}
                page={pageNumber}
                total={count}
                countryCode={countryCode}
              />
            ) : (
              <p className="py-10 text-center text-lg text-secondary">
                No products found in this category.
              </p>
            )}
          </Suspense>
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
    console.error("Error in CategoryTemplate:", error)
    return (
      <Container>
        <p className="py-10 text-center text-lg text-secondary">
          There was an error loading this category. Please try again later.
        </p>
      </Container>
    );
  }
}
