'use client'

import { useParams } from 'next/navigation'
import { HttpTypes } from '@medusajs/types'
import DiscountCode from '@modules/checkout/components/discount-code'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import CartTotals from '@modules/common/components/cart-totals'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const getCheckoutStep = (cart: any) => {
  if (!cart || !cart.items?.length) return 'address'
  
  // If shipping methods are selected but no payment session, go to payment
  if (cart.shipping_methods?.length > 0) {
    return 'payment'
  }
  
  return 'address'
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const { countryCode } = useParams()

  // Use relative URL instead of absolute to avoid HTTPS issues
  const checkoutPath = `/checkout?step=${step}`

  return (
    <Box className="flex w-full flex-col gap-2 large:w-[326px] xl:w-[437px]">
      <DiscountCode cart={cart} />
      <Box className="flex flex-col gap-5 bg-primary p-5">
        <CartTotals totals={cart} />
        <LocalizedClientLink
          href={checkoutPath}
          data-testid="checkout-button"
        >
          <Button className="w-full">Proceed to checkout</Button>
        </LocalizedClientLink>
      </Box>
    </Box>
  )
}

export default Summary