'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

import { createNavigation } from '@lib/constants'
import { cn } from '@lib/util/cn'
import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import { StoreCollection, StoreProductCategory } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { NavigationItem } from '@modules/common/components/navigation-item'
import { CollectionsData, HeaderData } from 'types/strapi'

import CollectionsMenu from './collections-menu'
import DropdownMenu from './dropdown-menu'

export default function Navigation({
  countryCode,
  productCategories,
  collections,
  strapiCollections,
  strapiHeader,
}: {
  countryCode: string
  productCategories: StoreProductCategory[]
  collections: StoreCollection[]
  strapiCollections: CollectionsData
  strapiHeader?: HeaderData
}) {
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState<{
    name: string
    handle: string
  } | null>(null)

  const navigation = useMemo(
    () => createNavigation(productCategories, collections),
    [productCategories, collections]
  )

  // Use Strapi header links if available
  const hasCustomLinks = strapiHeader?.data?.Links && strapiHeader.data.Links.length > 0
  
  if (hasCustomLinks) {
    // Sort custom links by order property
    const orderedLinks = [...strapiHeader.data.Links].sort((a, b) => a.order - b.order)
    
    return (
      <Box className="hidden gap-4 self-stretch large:flex">
        {orderedLinks.map((item, index) => {
          const isActive = pathname.includes(item.Url)
          
          return (
            <div
              key={index}
              className="flex h-full items-center"
              data-testid={formatNameForTestId(`${item.Title}-link`)}
            >
              <NavigationItem
                href={`/${countryCode}${item.Url}`}
                className={cn('!py-2 px-2', {
                  'border-b border-action-primary': isActive || item.isActive,
                })}
              >
                {item.Title}
              </NavigationItem>
            </div>
          )
        })}
      </Box>
    )
  }

  // Fall back to old navigation if Strapi header is not available
  return (
    <Box className="hidden gap-4 self-stretch large:flex">
      {navigation.map((item: any, index: number) => {
        const handle = item.name.toLowerCase().replace(' ', '-')
        const isCategories =
          handle === 'shop' && pathname.includes(`/${countryCode}/categories`)
        const active = pathname.includes(`/${countryCode}/${handle}`)

        return (
          <DropdownMenu
            key={index}
            item={item}
            activeItem={openDropdown}
            isOpen={openDropdown?.name === item.name}
            onOpenChange={(open) => {
              setOpenDropdown(
                open ? { name: item.name, handle: item.handle } : null
              )
            }}
            customContent={
              item.name === 'Collections' ? (
                <CollectionsMenu
                  cmsCollections={strapiCollections}
                  medusaCollections={collections}
                />
              ) : undefined
            }
          >
            <div
              className="flex h-full items-center"
              data-testid={formatNameForTestId(`${item.name}-dropdown`)}
            >
              <NavigationItem
                href={`/${countryCode}${item.handle}`}
                className={cn('!py-2 px-2', {
                  'border-b border-action-primary': active || isCategories,
                })}
              >
                {item.name}
              </NavigationItem>
            </div>
          </DropdownMenu>
        )
      })}
    </Box>
  )
}
