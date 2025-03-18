'use client'

import { useState } from 'react'

import { cn } from '@lib/util/cn'
import { Box } from '@modules/common/components/box'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { ConsciousGeneticsLogo } from '@modules/common/icons'
import SideMenu from '@modules/layout/components/side-menu'
import { SearchDialog } from '@modules/search/components/search-dialog'
import SearchDropdown from '@modules/search/components/search-dropdown'

import Navigation from './navigation'

export default function NavContent(props: any) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      {/* Mobile Layout */}
      <Box className="flex w-full items-center justify-between large:hidden">
        <Box className="flex">
          <SideMenu
            productCategories={props.productCategories}
            collections={props.collections}
            strapiCollections={props.strapiCollections}
          />
        </Box>
        
        <Box className="absolute left-1/2 transform -translate-x-1/2">
          <LocalizedClientLink href="/">
            <ConsciousGeneticsLogo className="h-16 xsmall:h-20" />
          </LocalizedClientLink>
        </Box>
      </Box>

      {/* Desktop Layout */}
      <Box className="hidden large:flex items-center flex-1">
        <Box className="flex items-center mr-6">
          <LocalizedClientLink href="/">
            <ConsciousGeneticsLogo className="h-24" />
          </LocalizedClientLink>
        </Box>
        
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
    </>
  )
}
