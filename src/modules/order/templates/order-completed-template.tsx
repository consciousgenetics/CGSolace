'use client'

import { HttpTypes } from '@medusajs/types'
import { Heading } from '@medusajs/ui'
import { Box } from '@modules/common/components/box'
import CartTotals from '@modules/common/components/cart-totals'
import { Container } from '@modules/common/components/container'
import { Text } from '@modules/common/components/text'
import Items from '@modules/order/components/items'
import OrderDetails from '@modules/order/components/order-details'
import PaymentDetails from '@modules/order/components/payment-details'
import ShippingDetails from '@modules/order/components/shipping-details'
import PaymentInstructions from '@modules/order/components/payment-instructions'
import PaymentTimer from '@modules/order/components/payment-timer'
import { useParams } from 'next/navigation'

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder & { status: string }
}

export default function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  // Get the country code from URL params for correct currency display
  const { countryCode } = useParams();
  
  // Adapt the order to match the expected StoreCart type for CartTotals
  const cartLikeOrder = {
    ...order,
    // Add cart_id to each line item to satisfy TypeScript
    items: order.items.map(item => ({
      ...item,
      cart_id: order.id,
      cart: { id: order.id } as any
    })),
    // Add countryCode for currency handling
    countryCode
  }
  
  // Check if payment is made already
  const paymentStatus = order.payment_status
  const isPaid = paymentStatus === "captured" || paymentStatus === "partially_captured"
  
  return (
    <Box className="bg-secondary">
      <Container className="mx-auto py-8">
        <Box
          className="mx-auto flex h-full w-full max-w-2xl flex-col gap-4"
          data-testid="order-complete-container"
        >
          <Box className="flex flex-col items-center gap-2 py-6 text-center">
            <Heading
              level="h1"
              className="text-xl font-normal text-basic-primary small:max-w-md medium:text-2xl"
            >
              Thank you! Your order was placed successfully.
            </Heading>
            <Text size="md" className="text-secondary">
              We have sent the order confirmation details to {order.email}.
            </Text>
            
            {/* Show payment timer for unpaid orders right after the heading for better visibility */}
            {!isPaid && (
              <Box className="w-full mt-4">
                <PaymentTimer 
                  orderId={order.id} 
                  displayId={order.display_id || order.id}
                />
              </Box>
            )}
          </Box>
          
          <OrderDetails order={order} />
          <PaymentInstructions order={order} />
          <Items items={order.items} />
          <div className="rounded-lg bg-primary p-4">
            <CartTotals totals={cartLikeOrder as any} />
          </div>
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
        </Box>
      </Container>
    </Box>
  )
}
