import React, { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { SearchedProduct } from 'types/global'

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

export const dynamic = 'force-dynamic'
export const revalidate = false // Disable revalidation for dynamic routes

export async function generateStaticParams() {
  const categories = [
    'seeds', 
    'seeds/feminized-seeds', 
    'seeds/regular-seeds', 
    'merchandise', 
    'shirts', 
    'sweatshirts', 
    'pants', 
    'merch'
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

export default async function CategoryTemplate({
  params,
}: {
  params: { countryCode: string; category: string[] }
}) {
  try {
    // Make sure params is properly awaited before destructuring
    const paramsResolved = await Promise.resolve(params)
    const { countryCode, category } = paramsResolved

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
      initialProducts = await search({
        currency_code: region.currency_code,
        category_id: currentCategory.id,
        order: 'relevance'
      });
    } catch (err) {
      console.error("Error fetching category products:", err);
      // Continue with empty initial products
    }

    // If search API failed, try to load products directly from product API
    if (initialProducts.results.length === 0) {
      try {
        console.log("Search API returned no results. Attempting to fetch products directly...");
        const productsData = await getProductsList({
          pageParam: 1,
          queryParams: { 
            category_id: [currentCategory.id],
            limit: 12
          },
          countryCode: countryCode, // Use the resolved countryCode
        });
        
        if (productsData && productsData.response && productsData.response.products) {
          // Transform products to match SearchedProduct format
          initialProducts = {
            results: productsData.response.products.map(p => ({
              id: p.id,
              title: p.title,
              handle: p.handle,
              thumbnail: p.thumbnail,
              created_at: p.created_at,
              calculatedPrice: p.variants[0]?.calculated_price?.toString() || "",
              salePrice: p.variants[0]?.calculated_price?.toString() || "",
            })),
            count: productsData.response.count,
          };
          console.log(`Found ${initialProducts.results.length} products using direct product API`);
        }
      } catch (directErr) {
        console.error("Error fetching products directly:", directErr);
        // Continue with empty initialProducts
      }
    }

    // Get related products for the current category
    let recommendedProducts = []
    try {
      // First try to get products from the same category
      const relatedProductsData = await getProductsList({
        pageParam: 0,
        queryParams: { 
          limit: 9,
          category_id: [currentCategory.id],
          order: "created_at"
        },
        countryCode: countryCode
      })
      
      if (relatedProductsData && relatedProductsData.response) {
        // Get products from this category, excluding any that might already be in the initial results
        const initialProductIds = new Set(initialProducts.results.map(p => p.id))
        recommendedProducts = relatedProductsData.response.products?.filter(p => !initialProductIds.has(p.id)) || []
        
        // If we don't have enough related products, get some general recommendations
        if (recommendedProducts.length < 4) {
          const generalProductsData = await getProductsList({
            pageParam: 0,
            queryParams: { limit: 9 },
            countryCode: countryCode
          })
          
          if (generalProductsData && generalProductsData.response) {
            const generalProducts = generalProductsData.response.products || []
            // Add general products that aren't already in our recommended list or initial results
            const recommendedIds = new Set(recommendedProducts.map(p => p.id))
            const additionalProducts = generalProducts.filter(p => 
              !initialProductIds.has(p.id) && !recommendedIds.has(p.id)
            )
            
            // Add enough additional products to get to at least 4 total
            recommendedProducts = [
              ...recommendedProducts,
              ...additionalProducts.slice(0, Math.max(0, 4 - recommendedProducts.length))
            ]
          }
        }
        
        // Make sure each product has valid variants and prices to prevent NaN
        recommendedProducts = recommendedProducts.map(product => {
          // Ensure product has variants
          if (!product.variants || product.variants.length === 0) {
            console.warn(`Product ${product.id} has no variants, adding dummy variant`)
            return {
              ...product,
              variants: [{
                id: 'dummy-variant',
                title: 'Default',
                prices: [{
                  currency_code: region.currency_code,
                  amount: 0
                }],
                calculated_price: {
                  calculated_amount: 0,
                  original_amount: 0,
                  currency_code: region.currency_code
                }
              }]
            }
          }
          
          // Ensure variants have prices
          const variantsWithPrices = product.variants.map(variant => {
            // Use type assertion for variant to handle prices property
            const variantAny = variant as any;
            if (!variantAny.prices || variantAny.prices.length === 0) {
              console.warn(`Variant ${variant.id} has no prices, adding dummy price`)
              return {
                ...variant,
                prices: [{
                  currency_code: region.currency_code,
                  amount: 0
                }]
              }
            }
            return variant
          })
          
          return {
            ...product,
            variants: variantsWithPrices
          }
        })
      }
    } catch (err) {
      console.error("Error fetching related products:", err)
      // Continue with empty recommended products
    }

    return (
      <>
        {/* Apply white background to entire page */}
        <div className="bg-white min-h-screen w-full">
          <Container className="flex flex-col gap-8 !pb-8 !pt-4">
            {/* Pink Waferz special description section */}
            {category.includes('pink-waferz') && (
              <div className="my-8 max-w-5xl">
                <div className="border-l-4 border-pink-500 pl-6">
                  <h1 className="text-4xl font-bold tracking-tight mb-2">PINK WAFERZ LINE</h1>
                  <h2 className="text-2xl font-medium text-gray-600 mb-6">Biscotti × Pink Champagne BX1</h2>
                </div>
                
                <div className="mt-8 grid grid-cols-1 gap-8">
                  <div className="prose prose-lg max-w-none">
                    <h3 className="text-xl font-semibold mb-4 uppercase tracking-wide">Line Description</h3>
                    
                    <div className="space-y-6 text-gray-700">
                      <p className="leading-relaxed">
                        For this line, we chose to reverse another popular and well-favored strain of ours, the Pink Wafers. 
                        This strain is known for its high yields, dense colorful buds, and gassy, creamy, and musky aromas. 
                        The flower from this strain even made its way to being stocked at Cookies Thailand.
                      </p>
                      
                      <p className="leading-relaxed">
                        We selected a roughly 70% Biscotti-dominant and 30% Pink Champagne phenotype, 'Pheno #5,' as the donor plant. 
                        Pheno #5 was chosen for multiple reasons, including its vigorous plant structure, trichome coverage, high yields, and dense bud formation. 
                        It also had great bag appeal, with purple hues inherited from the Purps in the Pink Champagne BX1 mother.
                      </p>
                      
                      <p className="leading-relaxed">
                        By crossing these strains with our Pink Waferz #5, we envisioned creating a line of strains that pack heavy terps 
                        while also improving yields, plant structure, and bud formation.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 border-b border-gray-200"></div>
              </div>
            )}
            
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
                title="Related Products"
                hideToggleButtons={true}
              />
            </Suspense>
          )}
        </div>
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
