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
  // Use the same date calculation as in CountdownContext
  const now = new Date()
  const targetDate = new Date('2025-05-01T00:00:00')
  
  // If current time is past the target date, countdown has ended
  return now >= targetDate
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
              <div className="my-8 max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 large:grid-cols-2 gap-12">
                  {/* Left column - Logo */}
                  <div>
                    <img 
                      src="/Pink-waflfles.png" 
                      alt="Pink Waferz" 
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Right column - Text */}
                  <div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-anton uppercase mb-8">
                      PINK WAFERZ-LINE
                    </h1>

                    <h2 className="text-xl sm:text-2xl font-bold font-anton uppercase mb-6 text-gray-700">
                      Biscotti × Pink Champagne BX1
                    </h2>

                    <div className="prose prose-lg max-w-none text-gray-700">
                      <p className="text-lg sm:text-xl leading-relaxed font-latto italic">
                        For this line, we chose to reverse another popular and well-favored strain of ours, the Pink Wafers.
                      </p>
                      
                      <p className="text-lg sm:text-xl leading-relaxed font-latto">
                        This strain is known for its high yields, dense colorful buds, and gassy, creamy, and musky aromas. 
                        The flower from this strain even made its way to being stocked at Cookies Thailand.
                      </p>
                      
                      <p className="text-lg sm:text-xl leading-relaxed font-latto">
                        We selected a roughly 70% Biscotti-dominant and 30% Pink Champagne phenotype, 'Pheno #5,' as the donor plant. 
                        Pheno #5 was chosen for multiple reasons, including its vigorous plant structure, trichome coverage, high yields, and dense bud formation. 
                        It also had great bag appeal, with purple hues inherited from the Purps in the Pink Champagne BX1 mother.
                      </p>
                      
                      <p className="text-lg sm:text-xl leading-relaxed font-latto">
                        By crossing these strains with our Pink Waferz #5, we envisioned creating a line of strains that pack heavy terps 
                        while also improving yields, plant structure, and bud formation.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 border-b border-gray-200"></div>
              </div>
            )}
            
            {/* Chronic Kush special description section */}
            {category.includes('chronics-kush') && (
              <div className="my-8 max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 large:grid-cols-2 gap-12">
                  {/* Left column - Logo */}
                  <div>
                    <img 
                      src="/Chronic_kush.png" 
                      alt="Chronic Kush" 
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Right column - Text */}
                  <div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-anton uppercase mb-8">
                      CHRONIC'S KUSH-LINE
                    </h1>

                    <h2 className="text-xl sm:text-2xl font-bold font-anton uppercase mb-6 text-gray-700">
                      OG Kush × Hell Raiser
                    </h2>

                    <div className="prose prose-lg max-w-none text-gray-700">
                      <p className="text-lg sm:text-xl leading-relaxed font-latto">
                        This new regular seed line features an OG Kush x Hell Raiser male, meticulously chosen for its dominant OG Kush traits, paired with a variety of other elite strains to create a diverse and dynamic genetic pool. The og kush-dominant male imparts its signature qualities—dense structure, earthy pine flavors, and powerful, calming effects—while allowing the unique characteristics of the other parent strains to shine.
                      </p>
                      
                      <p className="text-lg sm:text-xl leading-relaxed font-latto">
                        Whether crossed with fruity, gassy, or exotic terpene profiles, this seed line offers a range of phenotypes that retain the male's unmistakable Kush backbone. Cultivators can expect vigorous growth, resin-packed buds, and a spectrum of effects, from deeply relaxing to uplifting and cerebral. This collection is perfect for those seeking the reliable potency and structure of OG Kush with the added intrigue of diverse genetic expressions.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 border-b border-gray-200"></div>
              </div>
            )}
            
            {/* Zapplez special description section */}
            {category.includes('zapplez') && (
              <div className="my-8 max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 large:grid-cols-2 gap-12">
                  {/* Left column - Logo */}
                  <div>
                    <img 
                      src="/Zapplez.png" 
                      alt="Zapplez" 
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Right column - Text */}
                  <div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-anton uppercase mb-8">
                      ZAPPLEZ-LINE
                    </h1>

                    <h2 className="text-xl sm:text-2xl font-bold font-anton uppercase mb-6 text-gray-700">
                      All the crosses with our beloved Blue Zushi x Sour Apple Runtz aka "Zapplez"
                    </h2>

                    <div className="prose prose-lg max-w-none text-gray-700">
                      <p className="text-lg sm:text-xl leading-relaxed font-latto italic">
                        For this feminized line, we decided to reverse a phenotype of our "Zapplez" (Blue Zushi x Sour Apple Runtz).
                      </p>
                      
                      <p className="text-lg sm:text-xl leading-relaxed font-latto">
                        We selected this pheno for its sour, creamy apple terps. It's no surprise that Zapplez became our number one best-selling strain. 
                        The frost levels on this strain are exceptional, with most phenotypes showing high levels of trichomes as early as 3 to 4 weeks into flowering. 
                        The selected pheno, #10, was roughly 70% Sour Apple Runtz and 30% Blue Zushi. We chose this particular pheno for its shorter plant structure 
                        and super frosty, dense Cali-style bud structure.
                      </p>
                      
                      <p className="text-lg sm:text-xl leading-relaxed font-latto">
                        We reversed Zapplez #10 onto four super-terpy strains, aiming to infuse the traits of Zapplez #10 with the terps of the recipient strains, 
                        creating one of our best seed lines to date.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 border-b border-gray-200"></div>
              </div>
            )}
            
            {/* Red Kachina special description section */}
            {category.includes('red-kachina') && (
              <div className="my-8 max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 large:grid-cols-2 gap-12">
                  {/* Left column - Logo */}
                  <div>
                    <img 
                      src="/redkachinaicon.png" 
                      alt="Red Kachina" 
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Right column - Text */}
                  <div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-anton uppercase mb-8">
                      RED KACHINA 2.0-LINE
                    </h1>

                    <h2 className="text-xl sm:text-2xl font-bold font-anton uppercase mb-6 text-gray-700">
                      Red Kachina 2.0 Feminized Line
                    </h2>

                    <div className="prose prose-lg max-w-none text-gray-700">
                      <p className="text-lg sm:text-xl leading-relaxed font-latto italic">
                        For this feminized line, we decided to reverse a phenotype of our "Red Kachina" (Jelly Breath x OGKB 2.1).
                      </p>
                      
                      <p className="text-lg sm:text-xl leading-relaxed font-latto">
                        This strain has a striking visual appearance, dense structure, high resin, and amazing terp profile. 
                        This particular pheno, #3, is roughly 30% Jelly Breath and 70% OGKB. 
                        We chose it for its smell, appearance, and denser buds—all improvements over the Original Red Kachina. 
                        Additionally, the pheno finishes earlier than most OGKB cuts and grows bigger trichome heads.
                      </p>
                      
                      <p className="text-lg sm:text-xl leading-relaxed font-latto">
                        This line combines the distinctive traits of Red Kachina with selected phenos of our other top strains. 
                        These crosses create unique expressions with Red Kachina's characteristic density, trichome coverage, 
                        and enhanced flavor profiles.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 border-b border-gray-200"></div>
              </div>
            )}
            
            {/* For Red Kachina page, conditionally render products or countdown */}
            {category.includes('red-kachina') && !isCountdownEnded() ? (
              <DynamicCountdownWrapper />
            ) : (
              <ClientSideSort 
                initialProducts={initialProducts}
                countryCode={countryCode}
                currentCategory={currentCategory}
                region={region}
                filters={filters}
              />
            )}
          </Container>
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
