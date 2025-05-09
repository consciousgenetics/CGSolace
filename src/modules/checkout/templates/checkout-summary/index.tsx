'use client'

import ItemsPreviewTemplate from '@modules/cart/templates/preview'
import DiscountCode from '@modules/checkout/components/discount-code'
import PaymentButton from '@modules/checkout/components/payment-button'
import Customization from '@modules/checkout/components/customization'
import { Box } from '@modules/common/components/box'
import CartTotals from '@modules/common/components/cart-totals'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { useEffect, useMemo } from 'react'

const CheckoutSummary = ({
  cart,
  searchParams,
}: {
  cart: any
  searchParams: { step?: string }
}) => {
  // Check if all required shipping profiles have methods selected
  const allShippingProfilesSatisfied = useMemo(() => {
    if (!cart || !cart.items || cart.items.length === 0) return false
    
    // Check if we have any shipping methods at all
    if (!cart.shipping_methods || cart.shipping_methods.length === 0) {
      console.log('No shipping methods selected yet');
      return false;
    }
    
    // Get unique shipping profile IDs from cart items
    const requiredProfileIds = new Set(
      cart.items
        .filter(item => item.variant?.product?.shipping_profile_id)
        .map(item => item.variant.product.shipping_profile_id)
    )
    
    // If no shipping profiles are required, consider it satisfied
    if (requiredProfileIds.size === 0) {
      console.log('No shipping profiles required, considering all satisfied');
      return true;
    }
    
    // Get shipping profile IDs that have methods selected
    const selectedProfileIds = new Set(
      (cart.shipping_methods || [])
        .map(method => {
          // Find the corresponding shipping option to get its profile ID
          const item = cart.items.find(item => 
            item.variant?.product?.shipping_profile_id && 
            item.shipping_methods?.some(sm => sm.shipping_option_id === method.shipping_option_id)
          )
          return item?.variant?.product?.shipping_profile_id
        })
        .filter(Boolean)
    )
    
    // For debug purposes
    console.log('Shipping profile check:', {
      required: Array.from(requiredProfileIds),
      selected: Array.from(selectedProfileIds),
      satisfied: requiredProfileIds.size <= selectedProfileIds.size
    });
    
    // If at least one shipping method is selected, consider it good enough
    if (requiredProfileIds.size > 0 && selectedProfileIds.size > 0) {
      return true;
    }
    
    // Check if all required profiles have methods selected
    return requiredProfileIds.size <= selectedProfileIds.size
  }, [cart])

  // Determine if payment button should be shown
  const showPaymentButton = useMemo(() => {
    // Show if we're on the payment step
    if (searchParams?.step === 'payment') return true
    
    // Show if there's a pending payment session
    if (cart?.payment_collection?.payment_sessions?.some(s => s.status === 'pending')) {
      // But only if all shipping profiles are satisfied
      return allShippingProfilesSatisfied
    }
    
    return false
  }, [searchParams, cart, allShippingProfilesSatisfied])
  
  // Debug info
  useEffect(() => {
    console.log('CheckoutSummary debug:', {
      step: searchParams?.step,
      hasPaymentSessions: cart?.payment_collection?.payment_sessions?.some(s => s.status === 'pending'),
      allShippingProfilesSatisfied,
      showPaymentButton
    });
  }, [searchParams, cart, allShippingProfilesSatisfied, showPaymentButton]);

  return (
    <Box className="relative">
      <Box className="sticky top-8 flex flex-col gap-y-4">
        <ItemsPreviewTemplate items={cart?.items} />
        <DiscountCode cart={cart} />
        <Box className="flex flex-col gap-5 bg-primary p-5">
          <CartTotals totals={cart} />
          <Customization cart={cart} />
          {!showPaymentButton && cart?.shipping_methods && cart.shipping_methods.length > 0 && !allShippingProfilesSatisfied && (
            <div className="mt-4 rounded-md bg-amber-50 p-4">
              <Text className="text-amber-800">
                Some items in your cart require additional shipping methods. 
                Please go back to the delivery step to select all required shipping methods.
              </Text>
            </div>
          )}
          {showPaymentButton && (
            <Box className="flex flex-col gap-5">
              <PaymentButton cart={cart} data-testid="submit-order-button" />
              <Box className="flex w-full">
                <Text className="text-center text-sm text-secondary">
                  By clicking the Place order button, you confirm that you have
                  read, understand and accept our{' '}
                  <LocalizedClientLink href="#" className="underline">
                    Terms of Use
                  </LocalizedClientLink>
                  ,{' '}
                  <LocalizedClientLink href="#" className="underline">
                    Terms of Sale
                  </LocalizedClientLink>{' '}
                  and{' '}
                  <LocalizedClientLink href="#" className="underline">
                    Returns Policy
                  </LocalizedClientLink>
                  .
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default CheckoutSummary
