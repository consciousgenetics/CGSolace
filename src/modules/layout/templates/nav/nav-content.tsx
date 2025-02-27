'use client'

import { useState } from 'react'

import { cn } from '@lib/util/cn'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { SearchIcon, SolaceLogo } from '@modules/common/icons'
import SideMenu from '@modules/layout/components/side-menu'
import { SearchDialog } from '@modules/search/components/search-dialog'
import SearchDropdown from '@modules/search/components/search-dropdown'

import Navigation from './navigation'

export default function NavContent(props: any) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Ensure props have default values to prevent errors
  const safeProps = {
    productCategories: props.productCategories || [],
    collections: props.collections || [],
    strapiCollections: props.strapiCollections || { data: [] },
    products: props.products || [],
    countryCode: props.countryCode || 'us'
  }

  return (
    <>
      <Box className="flex large:hidden">
        <SideMenu
          productCategories={safeProps.productCategories}
          collections={safeProps.collections}
          strapiCollections={safeProps.strapiCollections}
        />
      </Box>
      {!isSearchOpen && (
        <Navigation
          countryCode={safeProps.countryCode}
          productCategories={safeProps.productCategories}
          collections={safeProps.collections}
          strapiCollections={safeProps.strapiCollections}
        />
      )}
      {isSearchOpen && (
        <SearchDropdown
          setIsOpen={setIsSearchOpen}
          recommendedProducts={safeProps.products}
          isOpen={isSearchOpen}
          countryCode={safeProps.countryCode}
        />
      )}
      <SearchDialog
        recommendedProducts={safeProps.products}
        countryCode={safeProps.countryCode}
        isOpen={isSearchOpen}
        handleOpenDialogChange={setIsSearchOpen}
      />
      <Box
        className={cn('block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2', {
          'z-40': isSearchOpen,
        })}
      >
        <LocalizedClientLink href="/">
          <SolaceLogo className="h-10 w-auto" />
        </LocalizedClientLink>
      </Box>
      {!isSearchOpen && (
        <Button
          variant="icon"
          withIcon
          className="ml-auto h-auto !p-2 text-white xsmall:!p-3.5"
          onClick={() => setIsSearchOpen(true)}
          data-testid="search-button"
        >
          <SearchIcon />
        </Button>
      )}
    </>
  )
}
