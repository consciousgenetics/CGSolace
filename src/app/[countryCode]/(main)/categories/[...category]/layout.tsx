import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getCategoryByHandle, listCategories } from '@lib/data/categories'
import { listRegions } from '@lib/data/regions'
import { StoreProductCategory, StoreRegion } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'

// Set dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic'

interface CategoryPageLayoutProps {
  children: React.ReactNode
  params: Promise<{ category: string[]; countryCode: string }>
}

// Skip static params completely for now to ensure build succeeds
export async function generateStaticParams() {
  // Simply return an empty array to avoid build-time data fetching
  return []
}

export async function generateMetadata(
  props: CategoryPageLayoutProps
): Promise<Metadata> {
  try {
    const params = await props.params
    const categoryData = await getCategoryByHandle(params.category)
      .catch(() => ({ product_categories: [] }))
    
    const { product_categories } = categoryData || { product_categories: [] }

    if (!product_categories || product_categories.length === 0) {
      return {
        title: "Category | Conscious Genetics",
        description: "Category page",
      }
    }

    const title = product_categories
      .map((category: StoreProductCategory) => category.name)
      .join(' | ')

    const description =
      product_categories[product_categories.length - 1]?.description ??
      `${title} category.`

    return {
      title: `${title} | Conscious Genetics`,
      description,
      alternates: {
        canonical: `${params.category.join('/')}`,
      },
    }
  } catch (error) {
    console.error("Error generating category metadata:", error)
    return {
      title: "Category | Conscious Genetics",
      description: "Category page",
    }
  }
}

export default async function CategoryPageLayout(
  props: CategoryPageLayoutProps
) {
  try {
    const params = await props.params
    const { category } = params
    const { children } = props

    const { product_categories } = await getCategoryByHandle(category)
      .catch(() => ({ product_categories: [] }))

    if (!product_categories || product_categories.length === 0) {
      return notFound()
    }

    const currentCategory = product_categories[product_categories.length - 1]
    
    return (
      <div className="bg-white min-h-screen">
        <Container className="flex flex-col gap-8 !py-8">
          <Box className="flex flex-col gap-4">
            <StoreBreadcrumbs breadcrumb={currentCategory.name} />
            <Heading
              as="h1"
              className="text-4xl text-black dark:text-black small:text-5xl"
            >
              {currentCategory.name}
            </Heading>
          </Box>
        </Container>
        {children}
      </div>
    )
  } catch (error) {
    console.error('Error in category layout:', error)
    return notFound()
  }
}
