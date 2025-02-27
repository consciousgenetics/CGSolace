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
import { CollectionsData, HeaderData } from 'types/strapi'

interface CategoryItem {
  name: string
  handle: string
}

const SideMenu = ({
  productCategories,
  collections,
  strapiCollections,
  strapiHeader,
}: {
  productCategories: StoreProductCategory[]
  collections: StoreCollection[]
  strapiCollections: CollectionsData
  strapiHeader?: HeaderData
}) => {
  const [categoryStack, setCategoryStack] = useState<CategoryItem[]>([])
  const currentCategory = categoryStack[categoryStack.length - 1] || null
  const [isOpen, setIsOpen] = useState(false)

  const navigation = useMemo(
    () => createNavigation(productCategories, collections),
    [productCategories, collections]
  )

  const handleCategoryClick = (category: CategoryItem) => {
    setCategoryStack([
      ...categoryStack,
      { name: category.name, handle: category.handle },
    ])
  }

  const handleBack = () => {
    setCategoryStack(categoryStack.slice(0, -1))
  }

  const handleOpenDialogChange = (open: boolean) => {
    setIsOpen(open)

    if (!open) {
      setCategoryStack([])
    }
  }

  // Use Strapi header links if available
  const hasCustomLinks = strapiHeader?.data?.Links && strapiHeader.data.Links.length > 0
  
  const renderStrapiLinks = () => {
    if (!hasCustomLinks) return null
    
    // Sort custom links by order property
    const orderedLinks = [...strapiHeader.data.Links].sort((a, b) => a.order - b.order)
    
    return orderedLinks.map((item, index) => (
      <Fragment key={index}>
        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={() => handleOpenDialogChange(false)}
          asChild
        >
          <LocalizedClientLink href={item.Url}>
            <span className="flex items-center gap-4">
              {item.Title}
            </span>
          </LocalizedClientLink>
        </Button>
        {index === orderedLinks.length - 1 && (
          <Divider className="my-4 -ml-4 w-[calc(100%+2rem)]" />
        )}
      </Fragment>
    ))
  }

  const renderCategories = (categories: any[]) => {
    return categories.map((item, index) => {
      const hasChildren =
        item.category_children && item.category_children.length > 0

      const lastCategoryIndex = categories.findLastIndex(
        (cat) => cat.type === 'parent_category'
      )

      const strapiCollection = strapiCollections.data.find(
        (cmsCollection) => cmsCollection.Handle === item.handle_id
      )

      return item.type === 'collection' && strapiCollection ? (
        <LocalizedClientLink
          key={index}
          href={item.handle}
          className="relative mb-2"
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
      ) : (
        <Fragment key={index}>
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={
              hasChildren
                ? () =>
                    handleCategoryClick({
                      name: item.name,
                      handle: item.handle,
                    })
                : () => handleOpenDialogChange(false)
            }
            asChild={!hasChildren}
          >
            {hasChildren ? (
              <>
                <span className="flex items-center gap-4">
                  {item.icon && item.icon}
                  {item.name}
                </span>
                <ChevronRightIcon className="h-5 w-5" />
              </>
            ) : (
              <LocalizedClientLink href={item.handle}>
                <span className="flex items-center gap-4">
                  {item.icon && item.icon}
                  {item.name}
                </span>
              </LocalizedClientLink>
            )}
          </Button>
          {index === lastCategoryIndex && (
            <Divider className="my-4 -ml-4 w-[calc(100%+2rem)]" />
          )}
        </Fragment>
      )
    })
  }

  const getActiveCategories = () => {
    let currentCategories = [
      ...(navigation[0]?.category_children || []),
      ...navigation.slice(1),
    ]

    for (const category of categoryStack) {
      const found = currentCategories.find(
        (item) => item.name === category.name
      )
      if (found?.category_children) {
        currentCategories = found.category_children.map((category) => ({
          ...category,
          icon: null,
        }))
      } else {
        break
      }
    }
    return currentCategories
  }

  const shouldRenderButton =
    !currentCategory || currentCategory.name !== 'Collections'

  return (
    <Dialog onOpenChange={handleOpenDialogChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button
          aria-label="Open menu"
          variant="icon"
          withIcon
          className="h-auto !p-2 xsmall:!p-3.5"
        >
          <BarsIcon />
          <VisuallyHidden.Root>Open Menu</VisuallyHidden.Root>
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="xs:items-stretch md:items-center">
          <DialogContent
            className="bg-primary text-primary p-0 pb-0"
          >
            <DialogHeader className="mb-0 flex flex-row items-center gap-2 px-6 pb-4 pt-8">
              <DialogTitle>
                {currentCategory ? (
                  <Button
                    onClick={handleBack}
                    variant="ghost"
                    className="flex w-full items-center justify-start gap-2 !px-0"
                  >
                    <ArrowLeftIcon className="h-6 w-6" />
                    <span className="flex-1">
                      {categoryStack.length === 1
                        ? 'Main Menu'
                        : categoryStack[categoryStack.length - 2].name}
                    </span>
                  </Button>
                ) : (
                  <span>Main Menu</span>
                )}
              </DialogTitle>
              <Button
                onClick={() => handleOpenDialogChange(false)}
                variant="ghost"
                className="ml-auto !px-3 !py-3"
              >
                <XIcon className="h-6 w-6" />
                <VisuallyHidden.Root>Close</VisuallyHidden.Root>
              </Button>
            </DialogHeader>
            <DialogBody className="content-start gap-0 px-6 pb-8">
              <Box className="flex flex-col">
                {currentCategory ? (
                  renderCategories(
                    currentCategory.handle === 'shop'
                      ? [
                          ...navigation[0].category_children.flatMap(
                            (item) => item.category_children
                          ),
                          ...navigation[1]?.category_children || [],
                        ]
                      : navigation.find(
                          (category) => category.handle === currentCategory.handle
                        )?.category_children || []
                  )
                ) : (
                  <>
                    {hasCustomLinks ? renderStrapiLinks() : null}
                    {renderCategories(getActiveCategories())}
                  </>
                )}
              </Box>
            </DialogBody>
          </DialogContent>
        </DialogOverlay>
      </DialogPortal>
    </Dialog>
  )
}

export default SideMenu
