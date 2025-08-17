'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { isManual } from '@lib/constants'
import { placeOrder } from '@lib/data/cart'
import { HttpTypes } from '@medusajs/types'
import { Button } from '@modules/common/components/button'
import ErrorMessage from '../error-message'

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  'data-testid': string
  comment?: string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  'data-testid': dataTestId,
  comment
}) => {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Only require essential fields for checkout
  const notReady =
    !cart ||
    !cart.shipping_address ||  // Need shipping address
    !cart.email ||            // Need email for order confirmation
    (cart.shipping_methods?.length ?? 0) < 1  // Need shipping method

  // If guest checkout, use shipping address as billing address
  if (!cart.billing_address && cart.shipping_address) {
    cart.billing_address = cart.shipping_address
  }

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === 'pending'
  )

  // If no payment session is selected yet, show a disabled button
  if (!paymentSession) {
    return <Button disabled>Select a payment method</Button>
  }

  // Only allow manual payment
  if (!isManual(paymentSession?.provider_id)) {
    return <Button disabled>Invalid payment method</Button>
  }

  const handleOrder = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    try {
      // Use a try-catch inside a try-catch to handle potential NEXT_REDIRECT errors
      try {
        const result = await placeOrder(comment)
        
        if (result.success && result.orderId) {
          // Use client-side navigation to redirect to order confirmation
          // Adding small delay to ensure server action completes before navigation
          setTimeout(() => {
            router.push(`/${result.countryCode}/order/confirmed/${result.orderId}`)
          }, 100)
          return
        }
        
        // If we get here, something went wrong but without throwing an error
        setErrorMessage('Unable to complete your order. Please try again.')
      } catch (innerError: any) {
        // Handle NEXT_REDIRECT error specifically (it's an internal Next.js error)
        if (innerError.message && innerError.message.includes('NEXT_REDIRECT')) {
          // Get the orderId and countryCode from the cart
          const orderId = cart.id
          const countryCode = cart.shipping_address?.country_code?.toLowerCase() || 'gb'
          
          // Navigate to a reasonable guess of where it was trying to redirect
          setTimeout(() => {
            router.push(`/${countryCode}/order/confirmed/${orderId}`)
          }, 100)
          return
        }
        
        // Re-throw if it's not a NEXT_REDIRECT error
        throw innerError
      }
    } catch (err: any) {
      console.error('Error placing order:', err)
      
      // Provide more user-friendly error messages
      if (err.message && err.message.includes('shipping profiles')) {
        setErrorMessage(
          'Your cart contains different types of products that require separate shipping methods. ' +
          'Please go back to the delivery step and make sure you select a shipping option for each product type.'
        )
      } else {
        setErrorMessage(err.message || 'An error occurred while placing your order. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleOrder}
        isLoading={submitting}
        disabled={notReady}
        data-testid={dataTestId}
      >
        Place order
      </Button>
      <ErrorMessage error={errorMessage} data-testid="manual-payment-error-message" />
    </>
  )
}

export default PaymentButton
