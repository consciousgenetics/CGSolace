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

  // Get shipping methods for the cart
  const shippingMethods = await listCartShippingMethods(cart.id)
  
  // Get payment methods with fallback to empty region ID if needed
  const regionId = cart.region?.id || ''
  console.log('CheckoutForm: Getting payment methods for region ID:', regionId);
  
  let paymentMethods = await listCartPaymentMethods(regionId)
  
  // If no payment methods found, try without a region ID as a fallback
  if (!paymentMethods || paymentMethods.length === 0) {
    console.log('CheckoutForm: No payment methods found with region ID, trying fallback');
    paymentMethods = await listCartPaymentMethods('')
  }

  if (!shippingMethods) {
    console.error('CheckoutForm: No shipping methods available');
    return null
  }
  
  if (!paymentMethods || paymentMethods.length === 0) {
    console.error('CheckoutForm: No payment methods available');
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
