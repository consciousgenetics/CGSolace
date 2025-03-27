import React, { Suspense } from 'react'
import { getCollectionsList } from '@lib/data/collections'
import {
  getCollectionsData,
  getHeroBannerData,
} from '@lib/data/fetch'
import { getProductsList } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import { Banner } from '@modules/home/components/banner'
import Collections from '@modules/home/components/collections'
import Hero from '@modules/home/components/hero'
import { ProductCarousel } from '@modules/products/components/product-carousel'
import { ReviewSection } from '@modules/common/components/reviews'
import SkeletonProductsCarousel from '@modules/skeletons/templates/skeleton-products-carousel'
import { CollectionsData, HeroBannerData } from 'types/strapi'
import SeedLineCountdown from '@modules/home/components/seed-line-countdown'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { cache } from 'react'

// Set dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic'

// Add revalidation time to reduce API call frequency
export const revalidate = 300 // revalidate content every 5 minutes

// Cache the category fetch operation
const getCachedCategories = cache(async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/product-categories`, {
      headers: {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "temp",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { product_categories: [] };
  }
});

export default async function Home(props: {
  params: { countryCode: string }
}) {
  try {
    const { countryCode } = props.params

    let collectionsList = [];
    let seedProducts = [];
    let clothingProducts = [];
    let region = null;
    let strapiCollections = null;
    let heroBannerData = null;
    
    try {
      // Split the data fetching into separate try-catch blocks
      // to prevent one failure from affecting the entire page
      const collectionsResult = await getCollectionsList()
        .catch(() => ({ collections: [] }));
      collectionsList = collectionsResult?.collections || [];
      
      region = await getRegion(countryCode)
        .catch(() => null);
        
      if (region) {
        let allProducts = [];
        // Fetch all products in a single call with proper filtering
        try {
          // First, fetch all product categories to get the correct IDs
          const categoriesResponse = await getCachedCategories();

          // Find the categories
          const regularSeedsCategory = categoriesResponse.product_categories?.find(
            cat => cat.handle === 'seeds'
          );
          const feminizedSeedsCategory = categoriesResponse.product_categories?.find(
            cat => cat.handle === 'feminized-seeds'
          );

          // Fetch all products in a single call with expanded fields
          const allProductsResult = await getProductsList({
            pageParam: 0,
            queryParams: { 
              limit: 100, // Increased limit to get all products at once
              fields: '*images,*thumbnail,*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices,*categories,+metadata'
            },
            countryCode: countryCode,
          });

          allProducts = allProductsResult.response.products || [];

          // Filter products by category
          seedProducts = allProducts.filter(product => {
            const productCategories = product.categories?.map(c => c.id) || [];
            return productCategories.includes(regularSeedsCategory?.id) || 
                   productCategories.includes(feminizedSeedsCategory?.id);
          });

          clothingProducts = allProducts.filter(product => {
            const productCategories = product.categories?.map(c => c.id) || [];
            const isMens = productCategories.includes(categoriesResponse.product_categories?.find(
              cat => cat.handle === 'mens'
            )?.id);
            const isWomens = productCategories.includes(categoriesResponse.product_categories?.find(
              cat => cat.handle === 'womens'
            )?.id);
            
            if (isMens || isWomens) {
              product.clothing_type = isMens ? 'mens' : 'womens';
              return true;
            }
            return false;
          });

        } catch (error) {
          console.error("Error fetching and filtering products:", error);
        }
        
        // Use all products as fallback if either collection was not found
        if (seedProducts.length === 0 && allProducts.length > 0) {
          seedProducts = allProducts.slice(0, Math.ceil(allProducts.length / 2));
        }
        
        if (clothingProducts.length === 0 && allProducts.length > 0) {
          clothingProducts = allProducts.slice(Math.ceil(allProducts.length / 2));
        }
      }
    } catch (error) {
      console.error("Error fetching main data:", error);
    }

    if (!region) {
      // Return minimal content if region data is not available
      return (
        <div className="py-10">
          <h1 className="text-2xl font-bold text-center">
            Welcome to Conscious Genetics
          </h1>
          <p className="text-center mt-4">
            Unable to load store data. Please try again later.
          </p>
        </div>
      );
    }

    try {
      [
        strapiCollections,
        heroBannerData,
      ] = await Promise.all([
        getCollectionsData().catch(() => null),
        getHeroBannerData().catch(() => null),
      ]) as [CollectionsData | null, HeroBannerData | null];
    } catch (error) {
      console.error("Error fetching CMS data:", error);
    }

    return (
      <>
        <Suspense fallback={
          <div className="w-full h-screen bg-black animate-pulse" />
        }>
          {heroBannerData?.data?.HeroBanner && <Hero data={heroBannerData} />}
        </Suspense>
        {strapiCollections && collectionsList && collectionsList.length > 0 && (
          <Collections
            cmsCollections={strapiCollections}
            medusaCollections={collectionsList}
          />
        )}
        <div className="w-full flex items-center justify-center relative overflow-hidden">
          <div className="w-full relative z-10">
            {seedProducts && seedProducts.length > 0 && region && (
              <Suspense fallback={<SkeletonProductsCarousel />}>
                <ProductCarousel
                  products={seedProducts}
                  regionId={region.id}
                  title="Feminized Seeds"
                  viewAll={{link: "/categories/seeds/feminized-seeds", text: "View all feminized"}}
                  testId="seeds-section"
                />
              </Suspense>
            )}
            {/* Seed Line Section */}
            <div className="w-full bg-black text-white py-0 my-0">
              <div className="max-w-[1400px] mx-auto px-4 py-8 sm:py-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 font-['Anton']">SEED LINE</h2>
                <p className="text-center text-base sm:text-lg md:text-xl mb-8 sm:mb-12 px-4 font-latto">Every genetic that we drop is a stable, trichome covered, terpene loaded gem!</p>
                
                {/* Card container */}
                <div className="grid grid-cols-2 medium:grid-cols-2 large:grid-cols-4 gap-6 small:gap-8">
                  {/* Zapplez Card */}
                  <LocalizedClientLink href="/categories/zapplez" className="block">
                    <div className="relative group w-full flex flex-col">
                      <div className="bg-black rounded-xl border-[3px] aspect-square flex-shrink-0 overflow-hidden" style={{ borderColor: '#fdd729' }}>
                        <div className="w-full h-full relative p-6">
                          <img 
                            src="/Zapplez.png" 
                            alt="Zapplez" 
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      </div>
                      <div className="mt-2 relative">
                        <div className="rounded-xl py-3 px-4 relative overflow-hidden">
                          <img 
                            src="/127.png"
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="bg-white relative overflow-hidden rounded-full px-3 py-0.5 w-fit mx-auto mb-1">
                            <span 
                              className="inline-block text-xs font-bold uppercase relative z-10"
                              style={{
                                background: `url('/127.png')`,
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent',
                                backgroundSize: 'cover'
                              }}
                            >
                              SEEDS
                            </span>
                          </div>
                          <h3 className="text-black text-xl font-bold text-center uppercase relative z-10">ZAPPLEZ</h3>
                        </div>
                      </div>
                    </div>
                  </LocalizedClientLink>

                  {/* Pink Waferz Card */}
                  <LocalizedClientLink href="/categories/pink-waferz" className="block">
                    <div className="relative group w-full flex flex-col">
                      <div className="bg-black rounded-xl border-[3px] aspect-square flex-shrink-0 overflow-hidden" style={{ borderColor: '#fdd729' }}>
                        <div className="w-full h-full relative p-6">
                          <img 
                            src="/Pink-waflfles.png" 
                            alt="Pink Waferz" 
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      </div>
                      <div className="mt-2 relative">
                        <div className="rounded-xl py-3 px-4 relative overflow-hidden">
                          <img 
                            src="/127.png"
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="bg-white relative overflow-hidden rounded-full px-3 py-0.5 w-fit mx-auto mb-1">
                            <span 
                              className="inline-block text-xs font-bold uppercase relative z-10"
                              style={{
                                background: `url('/127.png')`,
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent',
                                backgroundSize: 'cover'
                              }}
                            >
                              SEEDS
                            </span>
                          </div>
                          <h3 className="text-black text-xl font-bold text-center uppercase relative z-10">PINK WAFERZ</h3>
                        </div>
                      </div>
                    </div>
                  </LocalizedClientLink>

                  {/* Red Kachina Card */}
                  <LocalizedClientLink href="/categories/red-kachina" className="block">
                    <div className="relative group w-full flex flex-col">
                      <div className="bg-black rounded-xl border-[3px] aspect-square flex-shrink-0 overflow-hidden" style={{ borderColor: '#fdd729' }}>
                        <div className="w-full h-full relative p-6">
                          <img 
                            src="/redkachinaicon.png" 
                            alt="Red Kachina" 
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      </div>
                      <div className="mt-2 relative">
                        <div className="rounded-xl py-3 px-4 relative overflow-hidden">
                          <img 
                            src="/127.png"
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="bg-white relative overflow-hidden rounded-full px-3 py-0.5 w-fit mx-auto mb-1">
                            <span 
                              className="inline-block text-xs font-bold uppercase relative z-10"
                              style={{
                                background: `url('/127.png')`,
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent',
                                backgroundSize: 'cover'
                              }}
                            >
                              SEEDS
                            </span>
                          </div>
                          <h3 className="text-black text-xl font-bold text-center uppercase relative z-10">RED KACHINA</h3>
                        </div>
                      </div>
                    </div>
                  </LocalizedClientLink>

                  {/* Chronic's Kush Card */}
                  <LocalizedClientLink href="/categories/chronics-kush" className="block">
                    <div className="relative group w-full flex flex-col">
                      <div className="bg-black rounded-xl border-[3px] aspect-square flex-shrink-0 overflow-hidden" style={{ borderColor: '#fdd729' }}>
                        <div className="w-full h-full relative p-6">
                          <img 
                            src="/Chronic_kush.png" 
                            alt="Chronic's Kush" 
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      </div>
                      <div className="mt-2 relative">
                        <div className="rounded-xl py-3 px-4 relative overflow-hidden">
                          <img 
                            src="/127.png"
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="bg-white relative overflow-hidden rounded-full px-3 py-0.5 w-fit mx-auto mb-1">
                            <span 
                              className="inline-block text-xs font-bold uppercase relative z-10"
                              style={{
                                background: `url('/127.png')`,
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent',
                                backgroundSize: 'cover'
                              }}
                            >
                              SEEDS
                            </span>
                          </div>
                          <h3 className="text-black text-xl font-bold text-center uppercase relative z-10">CHRONIC'S KUSH</h3>
                        </div>
                      </div>
                    </div>
                  </LocalizedClientLink>
                </div>
              </div>
            </div>
            {clothingProducts && clothingProducts.length > 0 && region && (
              <Suspense fallback={<SkeletonProductsCarousel />}>
                <ProductCarousel
                  products={clothingProducts.map(product => ({
                    ...product,
                    category: product.collection
                  }))}
                  regionId={region.id}
                  title="Clothing & Apparel"
                  viewAll={{
                    link: `/categories/mens`,
                    text: 'Shop All',
                    alternateLink: `/categories/womens-merch`
                  }}
                  testId="clothing-section"
                />
              </Suspense>
            )}

            {/* Grinders, Lighters & Ashtray Section */}
            <div className="w-full bg-white text-black py-0 my-0 relative">
              <div className="absolute inset-0 w-full h-full opacity-0">
                <img 
                  src="/126.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="max-w-[1400px] mx-auto px-4 py-8 sm:py-16 pb-0 relative z-10">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 font-latto text-[#d67bef]">GRINDERS, LIGHTERS & ASHTRAY</h2>
                <p className="text-center text-base sm:text-lg md:text-xl mb-8 sm:mb-12 px-4 font-latto text-gray-600">Every genetic that we drop is a stable, trichome covered, terpene loaded gem!</p>
                
                {/* Card container */}
                <div className="w-full flex justify-center">
                  <div className="grid grid-cols-1 medium:grid-cols-2 large:grid-cols-3 gap-6 small:gap-8 w-full max-w-[1400px] mx-auto px-4">
                    {/* Grinders Card */}
                    <div className="bg-[#8b2a9b] rounded-3xl p-8 pb-12 flex flex-col items-center relative overflow-hidden w-full sm:w-[320px] h-[500px] mx-auto">
                      <div className="absolute inset-0 opacity-100">
                        <img 
                          src="/126.png"
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-56 h-56">
                          <img 
                            src="/cg-grinder.png" 
                            alt="Grinders" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex flex-col items-center mt-8">
                          <div className="bg-white/20 px-5 py-2 rounded-full mb-4">
                            <span className="text-white text-lg font-medium font-latto">MERCH</span>
                          </div>
                          <h3 className="text-white text-3xl font-bold mb-5 text-center">GRINDERS</h3>
                          <div className="flex mb-6 justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className="w-7 h-7 text-[#fdd729]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <div className="text-center">
                            <LocalizedClientLink
                              href="/products/conscious-genetics-grinders"
                              className="text-white underline font-medium hover:text-gray-200 transition-colors text-lg font-latto"
                            >
                              SHOP NOW
                            </LocalizedClientLink>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lighters Card */}
                    <div className="bg-[#8b2a9b] rounded-3xl p-8 pb-12 flex flex-col items-center relative overflow-hidden w-full sm:w-[320px] h-[500px] mx-auto">
                      <div className="absolute inset-0 opacity-100">
                        <img 
                          src="/126.png"
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-56 h-56">
                          <img 
                            src="/cg-lighter.png" 
                            alt="Lighters" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex flex-col items-center mt-8">
                          <div className="bg-white/20 px-5 py-2 rounded-full mb-4">
                            <span className="text-white text-lg font-medium font-latto">MERCH</span>
                          </div>
                          <h3 className="text-white text-3xl font-bold mb-5 text-center">LIGHTERS</h3>
                          <div className="flex mb-6 justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className="w-7 h-7 text-[#fdd729]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <div className="text-center">
                            <LocalizedClientLink
                              href="/products/conscious-genetics-lighters"
                              className="text-white underline font-medium hover:text-gray-200 transition-colors text-lg font-latto"
                            >
                              SHOP NOW
                            </LocalizedClientLink>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ashtray Card */}
                    <div className="bg-[#8b2a9b] rounded-3xl p-8 pb-12 flex flex-col items-center relative overflow-hidden w-full sm:w-[320px] h-[500px] mx-auto">
                      <div className="absolute inset-0 opacity-100">
                        <img 
                          src="/126.png"
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-56 h-56">
                          <img 
                            src="/cg-ashtray.png" 
                            alt="Ashtray" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex flex-col items-center mt-8">
                          <div className="bg-white/20 px-5 py-2 rounded-full mb-4">
                            <span className="text-white text-lg font-medium font-latto">MERCH</span>
                          </div>
                          <h3 className="text-white text-3xl font-bold mb-5 text-center">ASHTRAY</h3>
                          <div className="flex mb-6 justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className="w-7 h-7 text-[#fdd729]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <div className="text-center">
                            <LocalizedClientLink
                              href="/products/conscious-genetics-ashtrays"
                              className="text-white underline font-medium hover:text-gray-200 transition-colors text-lg font-latto"
                            >
                              SHOP NOW
                            </LocalizedClientLink>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop All Button */}
            <div className="w-full flex justify-center py-8 bg-white relative -mt-0">
              <div className="absolute inset-0 w-full h-full opacity-0">
                <img 
                  src="/126.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative z-10">
                <LocalizedClientLink
                  href="/categories/accessories"
                  className="bg-[#d67bef] hover:bg-[#c15ed6] text-black transition-colors rounded-full uppercase tracking-wider px-8 py-3 text-xl font-bold font-latto inline-block"
                >
                  SHOP ALL
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        </div>
        <ReviewSection />
      </>
    )
  } catch (error) {
    console.error("Critical error in home page:", error);
    // Return a minimalist page in case of critical errors
    return (
      <div className="py-10">
        <h1 className="text-2xl font-bold text-center">
          Welcome to Conscious Genetics
        </h1>
        <p className="text-center mt-4">
          Something went wrong. Please try again later.
        </p>
      </div>
    );
  }
}