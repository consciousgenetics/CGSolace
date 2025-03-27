'use client'

import React, { Fragment, useMemo, useState } from 'react'
import Image from 'next/image'

import { createNavigation } from '@lib/constants'
import { StoreCollection, StoreProductCategory } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@modules/common/components/dialog'
import Divider from '@modules/common/components/divider'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import {
  ArrowLeftIcon,
  BarsIcon,
  ChevronRightIcon,
  XIcon,
} from '@modules/common/icons'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { CollectionsData } from 'types/strapi'

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
  // No longer need categoryStack, but keeping it for now for backward compatibility
  const [categoryStack, setCategoryStack] = useState<CategoryItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  // Track expanded categories for accordion-style dropdowns
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const navigation = useMemo(
    () => createNavigation(productCategories, collections),
    [productCategories, collections]
  )

  // Handle category click - just expand/collapse, no navigation
  const handleCategoryClick = (category: CategoryItem, hasChildren: boolean) => {
    if (hasChildren) {
      // If category has children, toggle its expanded state
      setExpandedCategories(prev => {
        // If already expanded, collapse it
        if (prev.includes(category.name)) {
          return prev.filter(name => name !== category.name);
        }
        // Otherwise expand it
        return [...prev, category.name];
      });
    }
  }

  const handleOpenDialogChange = (open: boolean) => {
    setIsOpen(open)

    if (!open) {
      setCategoryStack([])
      setExpandedCategories([]) // Reset expanded categories when closing the menu
    }
  }

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
            onClick={() => handleOpenDialogChange(false)}
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
          {/* Category header */}
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
                onClick={() => handleOpenDialogChange(false)}
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
    <Dialog open={isOpen} onOpenChange={handleOpenDialogChange}>
      <DialogTrigger asChild>
        <Button
          variant="icon"
          withIcon
          className="flex h-auto !p-2 xsmall:!p-3.5 large:hidden text-white"
        >
          <BarsIcon color="white" />
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          className="!max-h-full !rounded-none !max-w-full overflow-hidden bg-white text-black"
          aria-describedby={undefined}
        >
          <DialogHeader className="flex items-center gap-4 !p-4 text-xl small:text-2xl font-bold border-b border-gray-200 bg-white text-black">
            MENU
            <Button
              onClick={() => handleOpenDialogChange(false)}
              variant="icon"
              withIcon
              size="sm"
              className="ml-auto p-2 text-black"
            >
              <XIcon />
            </Button>
          </DialogHeader>
          <VisuallyHidden.Root>
            <DialogTitle>Menu modal</DialogTitle>
          </VisuallyHidden.Root>
          
          <DialogBody className="p-4 small:p-5 overflow-y-auto bg-white text-black">
            <Box className="flex flex-col">
              <Button
                variant="tonal"
                className="mb-4 w-max bg-black text-white hover:bg-gray-800"
                size="sm"
                onClick={() => handleOpenDialogChange(false)}
                asChild
              >
                <LocalizedClientLink href="/categories/clothing">
                  SHOP ALL
                </LocalizedClientLink>
              </Button>
              {renderMenuItems(navigation)}
            </Box>
          </DialogBody>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

export default SideMenu
