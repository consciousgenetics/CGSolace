import React, { useId } from 'react'

import { cn } from '@lib/util/cn'
import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { NavigationItem } from '@modules/common/components/navigation-item'

interface CategoryItem {
  name: string
  handle: string
  category_children?: CategoryItem[]
}

interface DropdownMenuProps {
  item: CategoryItem
  activeItem: {
    name: string
    handle: string
  }
  children: React.ReactNode
  customContent?: React.ReactNode
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  item,
  activeItem,
  children,
  customContent,
  isOpen,
  onOpenChange,
}) => {
  // Generate a stable key for this dropdown instance
  const uniqueId = useId();
  
  const renderSubcategories = (categories: CategoryItem[]) => (
    <div className="py-3 min-w-[240px] backdrop-blur-md">
      <div className="mb-2 px-4">
        <Button
          variant="tonal"
          className="group relative flex w-full items-center justify-between !px-4 !py-2 text-[13px] font-medium bg-amber-50/50 hover:bg-amber-100/50 text-amber-800 transition-all duration-300 rounded-lg overflow-hidden"
          onClick={() => onOpenChange(false)}
          asChild
        >
          <LocalizedClientLink href={`${activeItem?.handle ?? '/'}`} className="relative z-10">
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">
                Browse All
              </span>
              <svg className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </LocalizedClientLink>
        </Button>
      </div>
      <div className="mt-2">
        {categories.map((subItem, index) => (
          <div key={`${subItem.handle}-${index}`} className="group/item relative">
            <NavigationItem
              href={subItem.handle}
              className="group relative flex items-center justify-between w-full px-4 py-2 text-[13px] font-medium text-amber-800/90 hover:bg-amber-50/50 transition-all duration-300"
              data-testid={formatNameForTestId(
                `${subItem.name}-category-title`
              )}
            >
              <span className="relative z-10 group-hover:text-amber-900 transition-colors duration-300">{subItem.name}</span>
              {subItem.category_children && (
                <svg className="w-3.5 h-3.5 text-amber-700/40 group-hover:text-amber-800/60 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </NavigationItem>
            {subItem.category_children && (
              <div className="absolute left-full top-0 ml-1 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 -translate-x-2 group-hover/item:translate-x-0">
                <div className="bg-amber-50/95 backdrop-blur-md shadow-lg border border-amber-200/20 py-3 min-w-[240px] rounded-lg">
                  {subItem.category_children.map((childItem, childIndex) => (
                    <NavigationItem
                      key={`${childItem.handle}-${childIndex}`}
                      href={childItem.handle}
                      className="group relative flex items-center justify-between w-full px-4 py-2 text-[13px] text-amber-800/70 hover:bg-amber-100/50 hover:text-amber-900 transition-all duration-300"
                      data-testid={formatNameForTestId(
                        `${childItem.name}-category-item`
                      )}
                    >
                      <span className="truncate">{childItem.name}</span>
                    </NavigationItem>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div
      className="relative flex"
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
    >
      {children}
      {item.category_children && (
        <div
          key={`dropdown-${uniqueId}-${item.name}`}
          className={cn(
            'absolute left-0 top-full z-50 translate-y-2 bg-amber-50/95 backdrop-blur-md border border-amber-200/20 shadow-lg rounded-lg transition-all duration-300',
            isOpen
              ? 'pointer-events-auto opacity-100 translate-y-1'
              : 'pointer-events-none invisible opacity-0 translate-y-3'
          )}
        >
          {customContent ?? renderSubcategories(item.category_children)}
        </div>
      )}
    </div>
  )
}

export default DropdownMenu
