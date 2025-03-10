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
          className="group relative flex w-full items-center justify-between !px-4 !py-2 text-[13px] font-medium bg-amber-400 hover:bg-amber-500 text-black transition-all duration-300 rounded-lg overflow-hidden"
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
              className="group relative flex items-center justify-between w-full px-4 py-2 text-[13px] font-medium text-black hover:bg-amber-500/50 transition-all duration-300"
              data-testid={formatNameForTestId(
                `${subItem.name}-category-title`
              )}
            >
              <span className="relative z-10 group-hover:text-black transition-colors duration-300">{subItem.name}</span>
            </NavigationItem>
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
            'absolute left-0 top-full z-50 translate-y-1 bg-amber-400 backdrop-blur-md border border-amber-500/20 shadow-lg rounded-lg transition-all duration-300',
            isOpen
              ? 'pointer-events-auto opacity-100 translate-y-0.5'
              : 'pointer-events-none invisible opacity-0 translate-y-2'
          )}
        >
          {customContent ?? renderSubcategories(item.category_children)}
        </div>
      )}
    </div>
  )
}

export default DropdownMenu
