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

// Set dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic'

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  try {
    const params = await props.params
    const { countryCode } = params

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
        // Get all products first as a fallback
        const allProductsResult = await getProductsList({
          pageParam: 0,
          queryParams: { limit: 16 },
          countryCode: countryCode,
        })
          .then(({ response }) => response)
          .catch(() => ({ products: [] }));
        
        const allProducts = allProductsResult?.products || [];
        
        // Try to find collection IDs for seeds
        const seedCollections = collectionsList.filter(collection => {
          const title = (collection.title || '').toLowerCase();
          const handle = (collection.handle || '').toLowerCase();
          
          // Log each collection for debugging
          console.log('Checking collection:', {
            title,
            handle,
            id: collection.id,
            full: collection
          });
          
          // Check for seed collections
          return handle.includes('seed') || 
                 title.includes('seed') || 
                 handle.includes('regular') || 
                 title.includes('regular') ||
                 handle.includes('feminized') || 
                 title.includes('feminized');
        });

        // Separate regular and feminized collections
        const regularSeedCollections = seedCollections.filter(collection => {
          const title = (collection.title || '').toLowerCase();
          const handle = (collection.handle || '').toLowerCase();
          return handle.includes('regular') || title.includes('regular');
        });

        const feminizedSeedCollections = seedCollections.filter(collection => {
          const title = (collection.title || '').toLowerCase();
          const handle = (collection.handle || '').toLowerCase();
          return handle.includes('feminized') || title.includes('feminized');
        });

        // Log collections for debugging
        console.log('Regular seed collections:', regularSeedCollections.map(c => ({
          id: c.id,
          title: c.title,
          handle: c.handle
        })));
        
        console.log('Feminized seed collections:', feminizedSeedCollections.map(c => ({
          id: c.id,
          title: c.title,
          handle: c.handle
        })));

        // Find all clothing-related collections
        const clothingCollections = collectionsList.filter(collection => {
          const title = (collection.title || '').toLowerCase();
          const handle = (collection.handle || '').toLowerCase();
          
          // Log each collection for debugging
          console.log('Checking clothing collection:', {
            title,
            handle,
            id: collection.id
          });
          
          return handle.includes('mens-merch') || 
                 handle.includes('womens-merch') || 
                 handle.includes('accessories') ||
                 title.includes('mens merch') ||
                 title.includes('womens merch') ||
                 title.includes('accessories');
        });

        // Log found clothing collections
        console.log('Found clothing collections:', clothingCollections.map(c => ({
          id: c.id,
          title: c.title,
          handle: c.handle
        })));

        // If we found seed collections, try to fetch those products specifically
        if (seedCollections.length > 0) {
          try {
            // Fetch regular seed products
            const regularSeedProductsResult = await getProductsList({
              pageParam: 0,
              queryParams: { 
                limit: 9, 
                collection_id: regularSeedCollections.map(collection => collection.id)
              },
              countryCode: countryCode,
            })
              .then(({ response }) => response)
              .catch(() => ({ products: [] }));

            // Fetch feminized seed products
            const feminizedSeedProductsResult = await getProductsList({
              pageParam: 0,
              queryParams: { 
                limit: 9, 
                collection_id: feminizedSeedCollections.map(collection => collection.id)
              },
              countryCode: countryCode,
            })
              .then(({ response }) => response)
              .catch(() => ({ products: [] }));

            // Combine both types of products
            seedProducts = [
              ...regularSeedProductsResult?.products || [],
              ...feminizedSeedProductsResult?.products || []
            ];
          } catch (error) {
            console.error("Error fetching seed products:", error);
          }
        }
        
        // If we found any clothing collections, try to fetch those products
        if (clothingCollections.length > 0) {
          try {
            const clothingProductsResult = await getProductsList({
              pageParam: 0,
              queryParams: { 
                limit: 12, 
                collection_id: clothingCollections.map(collection => collection.id)
              },
              countryCode: countryCode,
            })
              .then(({ response }) => response)
              .catch(() => ({ products: [] }));
            clothingProducts = clothingProductsResult?.products || [];
          } catch (error) {
            console.error("Error fetching clothing products:", error);
          }
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
        {heroBannerData?.data?.HeroBanner && <Hero data={heroBannerData} />}
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
                  testId="seeds-section"
                  products={seedProducts}
                  regionId={region.id}
                  title="Feminized Seeds"
                  subtitle="Premium quality feminized seeds for your growing needs."
                  viewAll={{
                    link: `/${countryCode}/shop`,
                    text: 'View all',
                  }}
                />
              </Suspense>
            )}
            {/* Seed Line Section */}
            <div className="w-full bg-black text-white py-0 my-0">
              <div className="max-w-7xl mx-auto px-4 py-8 sm:py-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4">SEED LINE</h2>
                <p className="text-center text-base sm:text-lg md:text-xl mb-8 sm:mb-12 px-4">Every genetic that we drop is a stable, trichome covered, terpene loaded gem!</p>
                
                {/* Grid container with responsive layout */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-4 items-center justify-center">
                  {/* Zappet Card */}
                  <div className="bg-black rounded-2xl border-2 w-full lg:w-1/4 aspect-square max-w-[280px]" style={{ borderColor: '#fdd729' }}>
                    <div className="w-full h-full relative overflow-hidden rounded-2xl">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img 
                          src="/Zapplez.png" 
                          alt="Zappet" 
                          className="w-full h-full object-contain p-4"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Pink Waferz Card */}
                  <div className="bg-black rounded-2xl border-2 w-full lg:w-1/4 aspect-square max-w-[280px]" style={{ borderColor: '#fdd729' }}>
                    <div className="w-full h-full relative overflow-hidden rounded-2xl">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img 
                          src="/Pink-waflfles.png" 
                          alt="Pink Waferz" 
                          className="w-full h-full object-contain p-4"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Chronic's Kush Card */}
                  <div className="bg-black rounded-2xl border-2 w-full lg:w-1/4 aspect-square max-w-[280px]" style={{ borderColor: '#fdd729' }}>
                    <div className="w-full h-full relative overflow-hidden rounded-2xl">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img 
                          src="/Chronic_kush.png" 
                          alt="Chronic's Kush" 
                          className="w-full h-full object-contain p-4"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Conscious Genetics Card */}
                  <div className="bg-black rounded-2xl border-2 w-full lg:w-1/4 aspect-square max-w-[280px]" style={{ borderColor: '#fdd729' }}>
                    <div className="w-full h-full relative overflow-hidden rounded-2xl">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img 
                          src="/conscious-genetics-logo.png" 
                          alt="Conscious Genetics" 
                          className="w-full h-full object-contain p-4"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Countdown Timer */}
                <SeedLineCountdown />
              </div>
            </div>
            {clothingProducts && clothingProducts.length > 0 && region && (
              <Suspense fallback={<SkeletonProductsCarousel />}>
                <ProductCarousel
                  testId="clothing-section"
                  products={clothingProducts}
                  regionId={region.id}
                  title="Clothing & Apparel"
                  subtitle="Browse our complete collection of merchandise including men's and women's apparel."
                  viewAll={{
                    link: `/${countryCode}/shop`,
                    text: 'Shop All',
                  }}
                />
              </Suspense>
            )}
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
