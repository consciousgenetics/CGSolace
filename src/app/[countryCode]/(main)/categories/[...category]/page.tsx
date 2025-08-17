import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { getCategoryByHandle } from '@lib/data/categories'
import { getProductsList, getStoreFilters } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import { Container } from '@modules/common/components/container'
import { search } from '@modules/search/actions'
import CategoryTemplate from '@modules/categories/templates'

// Set dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 minutes instead of disabling revalidation

export default async function CategoryPage({ params }: { 
  params: { countryCode: string; category: string[] } 
}) {
  try {
    // Await params as required by Next.js 15
    const { countryCode, category } = await params

    // Get region data - if not found, show 404
    const region = await getRegion(countryCode)
      .catch(error => {
        console.error(`Error getting region for ${countryCode}:`, error);
        return null;
      });
      
    if (!region) {
      console.error(`Region not found for country code: ${countryCode}`)
      return notFound()
    }
    
    // Get category data safely with additional timeout protection
    let categoryData;
    try {
      // Add an additional timeout wrapper
      const categoryPromise = getCategoryByHandle(category)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Category page timeout')), 3000)
      })
      
      categoryData = await Promise.race([categoryPromise, timeoutPromise])
    } catch (err) {
      console.error(`Error fetching category data: ${err}`)
      // Instead of showing error, redirect to category template with fallback
      return (
        <Container>
          <div className="py-10 text-center">
            <h1 className="text-2xl font-bold mb-4">
              {category[category.length - 1]?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h1>
            <p className="text-lg text-gray-500 mb-8">
              This category is temporarily unavailable. Please check back soon.
            </p>
            <div className="text-sm text-gray-400">
              Category: {category.join(' > ')}
            </div>
          </div>
        </Container>
      )
    }
    
    const product_categories = categoryData?.product_categories || []
    
    // Try to get the current category from the array
    const currentCategory = product_categories[product_categories.length - 1]
    if (!currentCategory) {
      // If category is one of our custom categories, provide a default response
      if (
        category.includes('feminized-seeds') || 
        category.includes('regular-seeds') ||
        category.includes('merchandise') ||
        category.includes('mens')
      ) {
        return (
          <Container>
            <Suspense>
              <h1 className="text-2xl font-bold mb-4">{category[category.length-1].replace(/-/g, ' ').replace(/mens/, "Men's")}</h1>
              <p className="py-4 text-center text-lg">
                Coming soon! We're working on adding products to this category.
              </p>
            </Suspense>
          </Container>
        )
      }
      
      console.error(`Category not found for handle: ${category.join('/')}`)
      return notFound()
    }

    // Pass to the template component with the resolved params
    return <CategoryTemplate params={params} />
  } catch (error) {
    console.error('Error in CategoryPage:', error)
    return (
      <Container>
        <p className="py-10 text-center text-lg text-gray-500">
          There was an error loading this category. Please try again later.
        </p>
      </Container>
    )
  }
}
