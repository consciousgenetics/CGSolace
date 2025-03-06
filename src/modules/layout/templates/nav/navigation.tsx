'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

import { createNavigation } from '@lib/constants'
import { cn } from '@lib/util/cn'
import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import { StoreCollection, StoreProductCategory } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { NavigationItem } from '@modules/common/components/navigation-item'
import { CollectionsData } from 'types/strapi'

import CollectionsMenu from './collections-menu'
import DropdownMenu from './dropdown-menu'

export default function Navigation({
  countryCode,
  productCategories,
  collections,
  strapiCollections,
}: {
  countryCode: string
  productCategories: StoreProductCategory[]
  collections: StoreCollection[]
  strapiCollections: CollectionsData
}) {
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState<{
    name: string
    handle: string
  } | null>(null)

  // Generate a stable navigation structure for consistent rendering
  const navigation = useMemo(
    () => createNavigation(productCategories, collections),
    [productCategories, collections]
  )

  return (
    <Box className="hidden gap-6 self-stretch large:flex">
      {navigation.map((item: any, index: number) => {
        const handle = item.name.toLowerCase().replace(' ', '-')
        const isCategories =
          handle === 'shop' && pathname.includes(`/${countryCode}/categories`)
        const active = pathname.includes(`/${countryCode}/${handle}`)

        return (
          <DropdownMenu
            key={`nav-item-${handle}-${index}`}
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
                className={cn('relative !py-2 px-3 text-[15px] font-medium tracking-wide transition-colors hover:text-action-primary', {
                  'text-action-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-action-primary after:transition-transform': active || isCategories,
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
