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

interface CollectionPageLayoutProps {
  children: React.ReactNode
  params: Promise<{ handle: string; countryCode: string }>
}

export async function generateStaticParams() {
  // Skip collection static generation during Vercel builds
  if (process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL) {
    console.log('Skipping collection static params generation in Vercel environment');
    return [
      { countryCode: 'us', handle: 'placeholder' }
    ];
  }

  try {
    const { collections } = await getCollectionsList();

    if (!collections || collections.length === 0) {
      console.log('No collections found, using fallback');
      return [
        { countryCode: 'us', handle: 'placeholder' }
      ];
    }

    try {
      const countryCodes = await listRegions().then(
        (regions: StoreRegion[]) =>
          regions
            ?.map((r) => r.countries?.map((c) => c.iso_2))
            .flat()
            .filter(Boolean) as string[]
      ).catch(() => ['us']);

      if (!countryCodes || countryCodes.length === 0) {
        console.log('No country codes found, using fallback');
        return collections.map((collection: StoreCollection) => ({
          countryCode: 'us',
          handle: collection.handle || 'placeholder',
        }));
      }

      const collectionHandles = collections.map(
        (collection: StoreCollection) => collection.handle || 'placeholder'
      );

      const staticParams = countryCodes
        ?.map((countryCode: string) =>
          collectionHandles.map((handle: string | undefined) => ({
            countryCode,
            handle: handle || 'placeholder',
          }))
        )
        .flat();

      return staticParams;
    } catch (error) {
      console.error('Error processing regions:', error);
      return collections.map((collection: StoreCollection) => ({
        countryCode: 'us',
        handle: collection.handle || 'placeholder',
      }));
    }
  } catch (error) {
    console.error('Error in generateStaticParams for collections:', error);
    return [
      { countryCode: 'us', handle: 'placeholder' }
    ];
  }
}

export async function generateMetadata(
  props: CollectionPageLayoutProps
): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  const metadata = {
    title: `${collection.title} | Solace Medusa Starter`,
    description: `${collection.title} collection`,
  } as Metadata

  return metadata
}

export default async function CollectionPageLayout(
  props: CollectionPageLayoutProps
) {
  const params = await props.params

  const { handle } = params

  const { children } = props

  const currentCollection = await getCollectionByHandle(handle).then(
    (collection: StoreCollection) => collection
  )

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
}
