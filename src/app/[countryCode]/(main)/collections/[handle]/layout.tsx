import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  getCollectionByHandle,
  getCollectionsList,
} from '@lib/data/collections'
import { listRegions } from '@lib/data/regions'
import { StoreCollection, StoreRegion } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'

// Set dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic'

interface CollectionPageLayoutProps {
  children: React.ReactNode
  params: Promise<{ handle: string; countryCode: string }>
}

// Skip static params completely for now to ensure build succeeds
export async function generateStaticParams() {
  // Simply return an empty array to avoid build-time data fetching
  return []
}

export async function generateMetadata(
  props: CollectionPageLayoutProps
): Promise<Metadata> {
  try {
    const params = await props.params
    const collection = await getCollectionByHandle(params.handle).catch(() => null)

    if (!collection) {
      return {
        title: "Collection | Solace Medusa Starter",
        description: "Collection page",
      }
    }

    return {
      title: `${collection.title} | Solace Medusa Starter`,
      description: `${collection.title} collection`,
    }
  } catch (error) {
    console.error("Error generating collection metadata:", error)
    return {
      title: "Collection | Solace Medusa Starter",
      description: "Collection page",
    }
  }
}

export default async function CollectionPageLayout(
  props: CollectionPageLayoutProps
) {
  try {
    const params = await props.params
    const { handle } = params
    const { children } = props

    const currentCollection = await getCollectionByHandle(handle)
      .then((collection: StoreCollection) => collection)
      .catch(() => null)

    if (!currentCollection) {
      return notFound()
    }

    return (
      <>
        <Container className="flex flex-col gap-8 !py-8">
          <Box className="flex flex-col gap-4">
            <StoreBreadcrumbs breadcrumb={currentCollection.title} />
            <Heading
              as="h1"
              className="text-4xl text-basic-primary small:text-5xl"
            >
              {currentCollection.title}
            </Heading>
          </Box>
        </Container>
        {children}
      </>
    )
  } catch (error) {
    console.error("Error rendering collection page:", error)
    return notFound()
  }
}
