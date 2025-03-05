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
export const revalidate = false // Disable revalidation for dynamic routes

export default async function CategoryPage({ params }: { 
  params: { countryCode: string; category: string[] } 
}) {
  try {
    // Make sure params is properly awaited before destructuring
    const paramsResolved = await Promise.resolve(params)
    const { countryCode, category } = paramsResolved

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
    
    // Get category data safely
    let categoryData;
    try {
      categoryData = await getCategoryByHandle(category)
    } catch (err) {
      console.error(`Error fetching category data: ${err}`)
      return (
        <Container>
          <p className="py-10 text-center text-lg text-gray-500">
            There was an error loading this category. Please try again later.
          </p>
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
        category.includes('merchandise')
      ) {
        return (
          <Container>
            <Suspense>
              <h1 className="text-2xl font-bold mb-4">{category[category.length-1].replace(/-/g, ' ')}</h1>
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
    return <CategoryTemplate params={paramsResolved} />
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
