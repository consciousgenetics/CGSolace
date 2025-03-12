'use client'

import { useState } from 'react'

import { cn } from '@lib/util/cn'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { SearchIcon, SolaceLogo, ConsciousGeneticsLogo } from '@modules/common/icons'
import SideMenu from '@modules/layout/components/side-menu'
import { SearchDialog } from '@modules/search/components/search-dialog'
import SearchDropdown from '@modules/search/components/search-dropdown'

import Navigation from './navigation'

export default function NavContent(props: any) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <Box className="flex large:hidden">
        <SideMenu
          productCategories={props.productCategories}
          collections={props.collections}
          strapiCollections={props.strapiCollections}
        />
      </Box>
      
      {/* Flex container for logo and navigation to keep them close together */}
      <Box className="flex items-center flex-1">
        {/* Logo with small right margin */}
        <Box className="flex items-center mr-6">
          <LocalizedClientLink href="/">
            <ConsciousGeneticsLogo className="h-16 xsmall:h-20 medium:h-24" />
          </LocalizedClientLink>
        </Box>
        
        {/* Navigation buttons next to logo */}
        {!isSearchOpen && (
          <Navigation
            countryCode={props.countryCode}
            productCategories={props.productCategories}
            collections={props.collections}
          />
        )}
      </Box>
      
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
      
      {!isSearchOpen && (
        <Button
          variant="icon"
          withIcon
          className="hidden sm:flex ml-auto h-auto !p-1.5 xsmall:!p-2 medium:!p-3.5"
          onClick={() => setIsSearchOpen(true)}
          data-testid="search-button"
        >
          <SearchIcon className="h-5 w-5 xsmall:h-6 xsmall:w-6" />
        </Button>
      )}
    </>
  )
}
