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
  params: Promise<{ category: string[] }>
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
    const { product_categories } = await getCategoryByHandle(params.category)
      .catch(() => ({ product_categories: [] }))

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
    const isRedKachina = category.includes('red-kachina')

    return (
      <div className="bg-white min-h-screen">
        {isRedKachina && (
          <div className="w-full bg-[#FDD729] py-12">
            <div className="max-w-2xl mx-auto px-4 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold font-anton uppercase mb-4">
                REGISTER FOR RED KACHINA
              </h2>
              <p className="text-lg mb-6 font-latto">
                Be the first to know about new collections and exclusive offers.
              </p>
              <div className="flex max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Email"
                  className="flex-grow px-4 py-3 border border-black/10 rounded-l focus:outline-none"
                />
                <button className="bg-black text-white px-6 py-3 font-bold rounded-r hover:bg-black/90 transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>
        )}
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
    console.error("Error rendering category page:", error)
    return notFound()
  }
}
