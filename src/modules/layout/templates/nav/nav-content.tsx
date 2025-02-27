'use client'

import { useState } from 'react'
import Image from 'next/image'

import { cn } from '@lib/util/cn'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { SearchIcon, SolaceLogo } from '@modules/common/icons'
import SideMenu from '@modules/layout/components/side-menu'
import { SearchDialog } from '@modules/search/components/search-dialog'
import SearchDropdown from '@modules/search/components/search-dropdown'
import { HeaderData } from 'types/strapi'

import Navigation from './navigation'

export default function NavContent(props: any) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const strapiHeader = props.strapiHeader as HeaderData

  // Check if we have valid Strapi header data
  const hasHeader = strapiHeader?.data && strapiHeader.data.Logo?.Image?.url

  return (
    <>
      <Box className="flex large:hidden">
        <SideMenu
          productCategories={props.productCategories}
          collections={props.collections}
          strapiCollections={props.strapiCollections}
        />
      </Box>
      {!isSearchOpen && (
        <Navigation
          countryCode={props.countryCode}
          productCategories={props.productCategories}
          collections={props.collections}
          strapiCollections={props.strapiCollections}
          strapiHeader={strapiHeader}
        />
      )}
      {isSearchOpen && (
        <SearchDropdown
          setIsOpen={setIsSearchOpen}
          recommendedProducts={props.products}
          isOpen={isSearchOpen}
          countryCode={props.countryCode}
        />
      )}
      <SearchDialog
        recommendedProducts={props.products}
        countryCode={props.countryCode}
        isOpen={isSearchOpen}
        handleOpenDialogChange={setIsSearchOpen}
      />
      <Box
        className={cn('relative block', {
          'medium:absolute medium:left-1/2 medium:top-1/2 medium:-translate-x-1/2 medium:-translate-y-1/2':
            !isSearchOpen,
          'right-0 z-40': isSearchOpen,
        })}
      >
        <LocalizedClientLink href="/">
          {hasHeader ? (
            <Image 
              src={strapiHeader.data.Logo.Image.url}
              alt={strapiHeader.data.Logo.AltText || "Solace Logo"}
              width={150}
              height={40}
              className="h-6 medium:h-7 object-contain"
              priority
            />
          ) : (
            <SolaceLogo className="h-6 medium:h-7" />
          )}
        </LocalizedClientLink>
      </Box>
      {!isSearchOpen && (
        <Button
          variant="icon"
          withIcon
          className="ml-auto h-auto !p-2 xsmall:!p-3.5"
          onClick={() => setIsSearchOpen(true)}
          data-testid="search-button"
        >
          <SearchIcon />
        </Button>
      )}
    </>
  )
}
