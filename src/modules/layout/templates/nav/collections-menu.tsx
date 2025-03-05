'use client'

import { useMemo } from 'react'
import Image from 'next/image'

import { StoreCollection } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { CollectionsData } from 'types/strapi'

export default function CollectionsMenu({
  cmsCollections,
  medusaCollections,
}: {
  cmsCollections: CollectionsData
  medusaCollections: StoreCollection[]
}) {
  // Categories to exclude from the navigation - must match the one in constants.tsx
  const excludedCategories = [
    'Shirts', 
    'Sweatshirt', 
    'Sweatshirts', 
    'Pants', 
    'Merch',
    'Clothing'
  ];
  
  const validCollections = useMemo(() => {
    if (!cmsCollections.data?.length || !medusaCollections?.length) return null
    
    // Sort collections for stable rendering
    const sortedMedusaCollections = [...medusaCollections].sort((a, b) => 
      a.handle.localeCompare(b.handle)
    );
    
    // Filter out medusa collections to exclude unwanted categories
    const filteredMedusaCollections = sortedMedusaCollections.filter(
      collection => !excludedCategories.some(excluded => 
        collection.title.toLowerCase() === excluded.toLowerCase()
      )
    )
    
    // Sort CMS collections for stable rendering
    const sortedCmsCollections = [...cmsCollections.data].sort((a, b) => 
      (a.Handle || '').localeCompare(b.Handle || '')
    );
    
    // Filter CMS collections based on filtered Medusa collections
    const collections = sortedCmsCollections.filter((cmsCollection) =>
      filteredMedusaCollections.some(
        (medusaCollection) => medusaCollection.handle === cmsCollection.Handle
      )
    )
    
    if (!collections || collections.length < 3) return null
    
    // Sort by id in descending order for consistency
    return collections.sort((a, b) => b.id - a.id)
  }, [cmsCollections, medusaCollections, excludedCategories])

  const newestCollections = useMemo(() => {
    if (!validCollections) return null
    return validCollections.slice(0, 3)
  }, [validCollections])

  if (!newestCollections) return null

  return (
    <Container className="grid grid-cols-3 gap-2 !px-14 !pb-8 !pt-5">
      {newestCollections.map((element, id) => (
        <CollectionTile
          key={`collection-tile-${element.Handle}-${id}`}
          title={element.Title}
          handle={element.Handle}
          imgSrc={element.Image.url}
          description={element.Description}
        />
      ))}
    </Container>
  )
}

const CollectionTile = ({
  title,
  description,
  handle,
  imgSrc,
}: {
  title: string
  description: string
  handle: string
  imgSrc: string
}) => {
  return (
    <Box className="group relative max-h-[282px]">
      <Image
        src={imgSrc}
        alt={`${title} collection image`}
        width={600}
        height={300}
        className="h-full w-full object-cover object-center"
      />
      <Box className="absolute left-0 top-0 flex h-full w-full flex-col p-10">
        <Button
          asChild
          className="w-max self-end transition-all duration-500 ease-in-out"
        >
          <LocalizedClientLink href={`/collections/${handle}`}>
            Discover
          </LocalizedClientLink>
        </Button>
        <Box className="mt-auto flex flex-col gap-2 text-static">
          <LocalizedClientLink
            href={`/collections/${handle}`}
            className="w-max"
          >
            <Heading as="h3" className="mt-auto text-3xl text-static">
              {title}
            </Heading>
          </LocalizedClientLink>
          <Text
            size="lg"
            className="line-clamp-2 transition-all duration-500 ease-in-out"
          >
            {description}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
