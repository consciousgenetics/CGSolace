import { unstable_cache as cache } from 'next/cache'
import { listCartShippingMethods } from '@lib/data/fulfillment'
import { listCartPaymentMethods } from '@lib/data/payment'
import { HttpTypes } from '@medusajs/types'
import Addresses from '@modules/checkout/components/addresses'
import Payment from '@modules/checkout/components/payment'
import Shipping from '@modules/checkout/components/shipping'
import { Box } from '@modules/common/components/box'
import { Text } from '@modules/common/components/text'

// Cache shipping methods fetching
const getShippingMethods = cache(
  (cartId: string) => listCartShippingMethods(cartId),
  ['shipping-methods'],
  { revalidate: 10 }
)

// Cache payment methods fetching
const getPaymentMethods = cache(
  async (regionId: string) => {
    // Try with region ID first
    const methods = await listCartPaymentMethods(regionId)
    
    // If no methods found, try without region ID
    if (!methods || methods.length === 0) {
      return listCartPaymentMethods('')
    }
    
    return methods
  },
  ['payment-methods'],
  { revalidate: 10 }
)

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

  // Fetch both shipping and payment methods in parallel
  const regionId = cart.region?.id || ''
  const [shippingMethods, paymentMethods] = await Promise.all([
    getShippingMethods(cart.id),
    getPaymentMethods(regionId)
  ])

  if (!shippingMethods) {
    return (
      <Box className="p-4 bg-error-light rounded-lg">
        <Text className="text-error">No shipping methods available. Please contact support.</Text>
      </Box>
    )
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
      <Payment cart={cart} availablePaymentMethods={paymentMethods || []} />
    </Box>
  )
}
