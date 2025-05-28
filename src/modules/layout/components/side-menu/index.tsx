'use client'

import React, { Fragment, useMemo, useState, useEffect } from 'react'
import Image from 'next/image'

import { createNavigation } from '@lib/constants'
import { StoreCollection, StoreProductCategory } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import Divider from '@modules/common/components/divider'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import {
  ArrowLeftIcon,
  BarsIcon,
  ChevronRightIcon,
  XIcon,
} from '@modules/common/icons'
import { CollectionsData } from 'types/strapi'

// Import currency dropdown functionality
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

type Currency = {
  code: string
  symbol: string
  name: string
  countryCode: string
}

const currencies: Currency[] = [
  { code: 'GBP', symbol: '£', name: 'British Pound', countryCode: 'gb' },
  { code: 'USD', symbol: '$', name: 'US Dollar', countryCode: 'us' },
  { code: 'EUR', symbol: '€', name: 'Euro', countryCode: 'dk' },
]

interface CategoryItem {
  name: string
  handle: string
}

const SideMenu = ({
  productCategories,
  collections,
  strapiCollections,
}: {
  productCategories: StoreProductCategory[]
  collections: StoreCollection[]
  strapiCollections: CollectionsData
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const [categoryStack, setCategoryStack] = useState<CategoryItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0])
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false)

  const navigation = useMemo(
    () => createNavigation(productCategories, collections),
    [productCategories, collections]
  )

  // Determine the current currency based on the URL path
  useEffect(() => {
    const countryCode = pathname.split('/')[1]?.toLowerCase()
    const currency = currencies.find(c => c.countryCode === countryCode) || currencies[0]
    setSelectedCurrency(currency)
  }, [pathname])

  // Handle currency change
  const handleCurrencyChange = (currency: Currency) => {
    setIsCurrencyOpen(false)
    
    // Get the current path without the current country code
    const pathParts = pathname.split('/')
    
    // If we have a valid path structure with country code
    if (pathParts.length >= 2) {
      // Remove the country code part (index 1) and take the rest of the path
      // If there's nothing after the country code, use an empty string
      const pathWithoutCountry = pathParts.length > 2 ? 
        '/' + pathParts.slice(2).join('/') : 
        ''
      
      // Navigate to the new URL with the selected country code
      router.push(`/${currency.countryCode}${pathWithoutCountry}`)
    } else {
      // Fallback for unexpected URL structure
      router.push(`/${currency.countryCode}`)
    }
    
    // Close the sidebar after currency change
    handleCloseSidebar()
  }

  // Handle category click - just expand/collapse, no navigation
  const handleCategoryClick = (category: CategoryItem, hasChildren: boolean) => {
    if (hasChildren) {
      setExpandedCategories(prev => {
        if (prev.includes(category.name)) {
          return prev.filter(name => name !== category.name);
        }
        return [...prev, category.name];
      });
    }
  }

  const handleToggleSidebar = () => {
    console.log('Toggle sidebar called, current isOpen:', isOpen)
    setIsOpen(!isOpen)
  }

  const handleCloseSidebar = () => {
    console.log('Close sidebar called')
    setIsOpen(false)
    setCategoryStack([])
    setExpandedCategories([])
  }

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCloseSidebar()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // We'll render a recursive menu structure
  const renderMenuItems = (items: any[], level = 0) => {
    return items.map((item, index) => {
      const hasChildren = item.category_children && item.category_children.length > 0;
      const isExpanded = expandedCategories.includes(item.name);
      const isCollection = item.type === 'collection';
      const isSeedItem = item.name.toUpperCase().includes('SEED');
      
      const strapiCollection = isCollection ? strapiCollections.data.find(
        (cmsCollection) => cmsCollection.Handle === item.handle_id
      ) : null;

      // For collections with images
      if (isCollection && strapiCollection) {
        return (
          <LocalizedClientLink
            key={`${level}-${index}`}
            href={item.handle}
            className="relative mb-2 block"
            onClick={handleCloseSidebar}
          >
            <Image
              src={strapiCollection.Image.url}
              alt={strapiCollection.Title}
              width={600}
              height={160}
              className="h-[160px] w-full object-cover"
            />
            <Box className="absolute bottom-6 left-6">
              <Heading as="h3" className="text-2xl text-static">
                {strapiCollection.Title}
              </Heading>
            </Box>
          </LocalizedClientLink>
        );
      }

      // Render category or subcategory
      return (
        <div key={`${level}-${index}`} className={`w-full`}>
          <div className={`${level > 0 ? "pl-4" : ""}`}>
            {hasChildren ? (
              <Button
                variant="ghost"
                className={`w-full justify-between py-3 text-black ${isSeedItem ? 'font-semibold' : ''} ${isExpanded ? 'bg-gray-50' : ''} font-anton hover:bg-gray-100`}
                onClick={() => handleCategoryClick(
                  { name: item.name, handle: item.handle },
                  hasChildren
                )}
              >
                <span className="flex items-center gap-4 text-left">
                  {item.icon && item.icon}
                  {item.name}
                </span>
                <ChevronRightIcon 
                  className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                />
              </Button>
            ) : (
              <Button
                variant="ghost"
                className={`w-full justify-between py-3 text-black ${isSeedItem ? 'font-semibold' : ''} font-anton hover:bg-gray-100`}
                onClick={handleCloseSidebar}
                asChild
              >
                <LocalizedClientLink href={item.handle}>
                  <span className="flex items-center gap-4 text-left">
                    {item.icon && item.icon}
                    {item.name}
                  </span>
                </LocalizedClientLink>
              </Button>
            )}
          </div>

          {/* Render children if expanded */}
          {hasChildren && isExpanded && (
            <div className="border-l-2 border-gray-200 ml-4 mt-1 mb-1">
              {item.category_children && renderMenuItems(item.category_children, level + 1)}
            </div>
          )}
          
          {/* Add divider between parent categories */}
          {level === 0 && items.findIndex(cat => cat.type === 'parent_category') > -1 && 
           index === items.findLastIndex(cat => cat.type === 'parent_category') && (
            <Divider className="my-4 -ml-4 w-[calc(100%+2rem)]" />
          )}
        </div>
      );
    });
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <Button
        variant="icon"
        withIcon
        className={`flex h-auto !p-2 xsmall:!p-3.5 large:hidden text-white relative z-[70] transition-opacity duration-300 ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={handleToggleSidebar}
      >
        <BarsIcon color="white" />
      </Button>

      {/* Sidebar */}
      <div className={`fixed inset-0 w-screen h-screen bg-white z-[65] transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-center gap-4 p-4 text-xl font-bold border-b border-gray-200 bg-white text-black flex-shrink-0 relative">
          <span>MENU</span>
          <Button
            onClick={handleCloseSidebar}
            variant="icon"
            withIcon
            size="sm"
            className="absolute right-4 p-2 text-black"
          >
            <XIcon />
          </Button>
        </div>
        
        {/* Body */}
        <div className="p-4 flex-1 overflow-y-auto bg-white text-black">
          <Box className="flex flex-col">
            {/* Currency Selector */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-600">Currency</span>
              </div>
              <div className="relative">
                <button
                  className="flex items-center justify-between w-full px-4 py-3 text-left bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                >
                  <span className="flex items-center">
                    <span className="mr-2 text-lg">{selectedCurrency.symbol}</span>
                    <span className="font-medium">{selectedCurrency.name}</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isCurrencyOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                        onClick={() => handleCurrencyChange(currency)}
                      >
                        <span className="mr-3 text-lg">{currency.symbol}</span>
                        <span className="font-medium">{currency.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {renderMenuItems(navigation)}
          </Box>
        </div>
      </div>
    </>
  )
}

export default SideMenu
