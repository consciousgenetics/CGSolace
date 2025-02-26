import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getCategoryByHandle, listCategories } from '@lib/data/categories'
import { listRegions } from '@lib/data/regions'
import { StoreProductCategory, StoreRegion } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'

interface CategoryPageLayoutProps {
  children: React.ReactNode
  params: Promise<{ category: string[] }>
}

export async function generateStaticParams() {
  // Skip category static generation during Vercel builds
  if (process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL) {
    console.log('Skipping category static params generation in Vercel environment');
    return [
      { countryCode: 'us', category: ['placeholder'] }
    ];
  }

  try {
    const product_categories = await listCategories();

    if (!product_categories || product_categories.length === 0) {
      console.log('No categories found, using fallback');
      return [
        { countryCode: 'us', category: ['placeholder'] }
      ];
    }

    try {
      const countryCodes = await listRegions()
        .then((regions: StoreRegion[]) =>
          regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
        )
        .catch(() => ['us']);

      if (!countryCodes || countryCodes.length === 0) {
        console.log('No country codes found, using fallback');
        return product_categories.map((category: any) => ({
          countryCode: 'us',
          category: [category.handle || 'placeholder'],
        }));
      }

      const categoryHandles = product_categories.map(
        (category: any) => category.handle || 'placeholder'
      );

      const staticParams = countryCodes
        ?.map((countryCode: string | undefined) =>
          categoryHandles.map((handle: any) => ({
            countryCode: countryCode || 'us',
            category: [handle || 'placeholder'],
          }))
        )
        .flat();

      return staticParams;
    } catch (error) {
      console.error('Error processing regions:', error);
      return product_categories.map((category: any) => ({
        countryCode: 'us',
        category: [category.handle || 'placeholder'],
      }));
    }
  } catch (error) {
    console.error('Error in generateStaticParams for categories:', error);
    return [
      { countryCode: 'us', category: ['placeholder'] }
    ];
  }
}

export async function generateMetadata(
  props: CategoryPageLayoutProps
): Promise<Metadata> {
  const params = await props.params
  try {
    const { product_categories } = await getCategoryByHandle(params.category)

    const title = product_categories
      .map((category: StoreProductCategory) => category.name)
      .join(' | ')

    const description =
      product_categories[product_categories.length - 1].description ??
      `${title} category.`

    return {
      title: `${title} | Solace Medusa Starter`,
      description,
      alternates: {
        canonical: `${params.category.join('/')}`,
      },
    }
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPageLayout(
  props: CategoryPageLayoutProps
) {
  const params = await props.params

  const { category } = params

  const { children } = props

  const { product_categories } = await getCategoryByHandle(category)
  const currentCategory = product_categories[product_categories.length - 1]

  return (
    <>
      <Container className="flex flex-col gap-8 !py-8">
        <Box className="flex flex-col gap-4">
          <StoreBreadcrumbs breadcrumb={currentCategory.name} />
          <Heading
            as="h1"
            className="text-4xl text-basic-primary small:text-5xl"
          >
            {currentCategory.name}
          </Heading>
        </Box>
      </Container>
      {children}
    </>
  )
}
