import { convertToLocale } from '@lib/util/money'
import { HttpTypes } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import Divider from '@modules/common/components/divider'

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const getAmount = (amount?: number | null) => {
    if (!amount) {
      return
    }

    return convertToLocale({
      amount,
      currency_code: order.currency_code,
    })
  }

  return (
    <Box className="flex flex-col gap-5 bg-primary p-5 text-md">
      <Box className="flex flex-col gap-2">
        <Box className="flex items-center justify-between">
          <span className="text-black">Items</span>
          <span className="text-lg text-black">
            {getAmount(order.item_total)}
          </span>
        </Box>
        <Box className="flex flex-col gap-2">
          {order.discount_total > 0 && (
            <Box className="flex items-center justify-between">
              <span className="text-black">Discount</span>
              <span className="text-black">
                - {getAmount(order.discount_total)}
              </span>
            </Box>
          )}
          {order.gift_card_total > 0 && (
            <Box className="flex items-center justify-between">
              <span className="text-black">Discount</span>
              <span className="text-black">
                - {getAmount(order.gift_card_total)}
              </span>
            </Box>
          )}
          <Box className="flex items-center justify-between">
            <span className="text-black">Shipping</span>
            <span className="text-black">
              {getAmount(order.shipping_total)}
            </span>
          </Box>
        </Box>
      </Box>
      <Divider />
      <Box className="flex items-center justify-between">
        <span className="text-black">Total</span>
        <span className="text-xl font-medium text-black">
          {getAmount(order.total)}
        </span>
      </Box>
    </Box>
  )
}

export default OrderSummary
