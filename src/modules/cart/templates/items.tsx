import React from 'react'

import repeat from '@lib/util/repeat'
import { HttpTypes } from '@medusajs/types'
import Item from '@modules/cart/components/item'
import SkeletonLineItem from '@modules/skeletons/components/skeleton-line-item'

type ItemsTemplateProps = {
  items?: HttpTypes.StoreCartLineItem[]
}

const ItemsTemplate = ({ items }: ItemsTemplateProps) => {
  return (
    <>
      {items && items.length > 0
        ? items
            .sort((a, b) => {
              // Stable sort to prevent unnecessary reordering
              if ((a.created_at ?? '') === (b.created_at ?? '')) {
                return a.id > b.id ? 1 : -1;
              }
              return (a.created_at ?? '') > (b.created_at ?? '') ? -1 : 1
            })
            // Only render items that have required properties
            .filter(item => item && item.id)
            .map((item) => {
              return <Item key={item.id} item={item} />
            })
        : repeat(5).map((i) => {
            return <SkeletonLineItem key={i} />
          })}
    </>
  )
}

export default ItemsTemplate
