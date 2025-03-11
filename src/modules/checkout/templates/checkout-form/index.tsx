import { listCartShippingMethods } from '@lib/data/fulfillment'
import { listCartPaymentMethods } from '@lib/data/payment'
import { HttpTypes } from '@medusajs/types'
import Addresses from '@modules/checkout/components/addresses'
import Payment from '@modules/checkout/components/payment'
import Shipping from '@modules/checkout/components/shipping'
import { Box } from '@modules/common/components/box'
import { Text } from '@modules/common/components/text'

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? '')

  if (!shippingMethods || !paymentMethods) {
    return null
  }

  return (
    <Box className="grid w-full grid-cols-1 gap-y-4">
      {!customer && (
        <Box className="p-4 bg-primary rounded-lg">
          <Text className="text-lg mb-2">Checking out as a guest</Text>
          <Text className="text-secondary">
            You can checkout without creating an account. Just provide your email and shipping details.
          </Text>
        </Box>
      )}
      <Addresses cart={cart} customer={customer} />
      <Shipping cart={cart} availableShippingMethods={shippingMethods} />
      <Payment cart={cart} availablePaymentMethods={paymentMethods} />
    </Box>
  )
}
