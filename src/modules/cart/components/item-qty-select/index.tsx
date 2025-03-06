'use client'

import { cn } from '@lib/util/cn'
import { Button } from '@modules/common/components/button'

type ItemQtyProps = {
  qty: number
  maxQuantity: number
  action: (qty: number) => void
}

const ItemQtySelect = ({ qty, maxQuantity, action }: ItemQtyProps) => {
  const handleQtyChange = (type: 'inc' | 'dec') => {
    if (type === 'inc' && qty < maxQuantity) {
      action(qty + 1)
    }
    if (type === 'dec' && qty > 1) {
      action(qty - 1)
    }
  }

  return (
    <div className="flex h-9 items-center rounded-md border border-gray-200">
      <Button
        onClick={() => handleQtyChange('dec')}
        disabled={qty === 1}
        variant="ghost"
        className={cn(
          'h-full w-8 flex items-center justify-center text-lg font-medium',
          {
            'opacity-50 cursor-not-allowed': qty === 1,
          }
        )}
        data-testid="decrease-quantity"
      >
        −
      </Button>
      <span className="flex h-full w-8 items-center justify-center text-sm">
        {qty}
      </span>
      <Button
        onClick={() => handleQtyChange('inc')}
        disabled={qty === maxQuantity}
        variant="ghost"
        className={cn(
          'h-full w-8 flex items-center justify-center text-lg font-medium',
          {
            'opacity-50 cursor-not-allowed': qty === maxQuantity,
          }
        )}
        data-testid="increase-quantity"
      >
        +
      </Button>
    </div>
  )
}

export default ItemQtySelect
