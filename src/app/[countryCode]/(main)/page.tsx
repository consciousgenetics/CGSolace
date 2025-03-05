import { Suspense } from 'react'
import { Metadata } from 'next'

import { getCollectionsList } from '@lib/data/collections'
import {
  getCollectionsData,
  getExploreBlogData,
  getHeroBannerData,
  getMidBannerData,
} from '@lib/data/fetch'
import { getProductsList } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import { Banner } from '@modules/home/components/banner'
import Collections from '@modules/home/components/collections'
import { ExploreBlog } from '@modules/home/components/explore-blog'
import Hero from '@modules/home/components/hero'
import ProductGrid from '@modules/home/components/product-grid'
import { ProductCarousel } from '@modules/products/components/product-carousel'
import { ReviewSection } from '@modules/common/components/reviews'
import SkeletonProductsCarousel from '@modules/skeletons/templates/skeleton-products-carousel'
import { BlogData, CollectionsData, HeroBannerData, MidBannerData } from 'types/strapi'

// Set dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Solace Medusa Starter Template',
  description:
    'A performant frontend ecommerce starter template with Next.js 14 and Medusa 2.0.',
}

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
        
        // Try to find collection IDs for seeds and clothing
        const seedCollection = collectionsList.find(collection => 
          collection.title?.toLowerCase().includes('feminized') || 
          collection.title?.toLowerCase().includes('seed'));
        
        const clothingCollection = collectionsList.find(collection => 
          collection.title?.toLowerCase().includes('clothing') || 
          collection.title?.toLowerCase().includes('merch'));
          
        // If we found the seed collection, try to fetch those products specifically
        if (seedCollection) {
          try {
            const seedProductsResult = await getProductsList({
              pageParam: 0,
              queryParams: { 
                limit: 9, 
                collection_id: [seedCollection.id]
              },
              countryCode: countryCode,
            })
              .then(({ response }) => response)
              .catch(() => ({ products: [] }));
            seedProducts = seedProductsResult?.products || [];
          } catch (error) {
            console.error("Error fetching seed products:", error);
          }
        }
        
        // If we found the clothing collection, try to fetch those products specifically
        if (clothingCollection) {
          try {
            const clothingProductsResult = await getProductsList({
              pageParam: 0,
              queryParams: { 
                limit: 9, 
                collection_id: [clothingCollection.id]
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
            Welcome to Solace Medusa Store
          </h1>
          <p className="text-center mt-4">
            Unable to load store data. Please try again later.
          </p>
        </div>
      );
    }

    // CMS data with error handling
    let strapiCollections = null;
    let heroBannerData = null;
    let midBannerData = null;
    let posts = [];

    try {
      [
        strapiCollections,
        heroBannerData,
        midBannerData,
        { data: posts = [] },
      ] = await Promise.all([
        getCollectionsData().catch(() => null),
        getHeroBannerData().catch(() => null),
        getMidBannerData().catch(() => null),
        getExploreBlogData().catch(() => ({ data: [] })),
      ]) as [CollectionsData | null, HeroBannerData | null, MidBannerData | null, BlogData | { data: [] }];
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
        {seedProducts && seedProducts.length > 0 && region && (
          <Suspense fallback={<SkeletonProductsCarousel />}>
            <ProductCarousel
              testId="seeds-section"
              products={seedProducts}
              regionId={region.id}
              title="Feminized Seeds"
              subtitle="Premium quality feminized seeds for your growing needs."
              viewAll={{
                link: '/shop',
                text: 'View all',
              }}
            />
          </Suspense>
        )}
        <ProductGrid />
        {clothingProducts && clothingProducts.length > 0 && region && (
          <Suspense fallback={<SkeletonProductsCarousel />}>
            <ProductCarousel
              testId="clothing-section"
              products={clothingProducts}
              regionId={region.id}
              title="Clothing"
              subtitle="Our merchandise is more than a logo printed on a product, it's also more than design."
              viewAll={{
                link: '/shop',
                text: 'Shop All',
              }}
            />
          </Suspense>
        )}
        <ReviewSection />
        {midBannerData?.data?.MidBanner && (
          <Banner data={{ data: { HeroBanner: midBannerData.data.MidBanner } }} />
        )}
        {posts && posts.length > 0 && <ExploreBlog posts={posts} />}
      </>
    )
  } catch (error) {
    console.error("Critical error in home page:", error);
    // Return a minimalist page in case of critical errors
    return (
      <div className="py-10">
        <h1 className="text-2xl font-bold text-center">
          Welcome to Solace Medusa Store
        </h1>
        <p className="text-center mt-4">
          Something went wrong. Please try again later.
        </p>
      </div>
    );
  }
}
