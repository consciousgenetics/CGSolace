'use client'

import React, { useState } from 'react'
import { isManual } from '@lib/constants'
import { placeOrder } from '@lib/data/cart'
import { HttpTypes } from '@medusajs/types'
import { Button } from '@modules/common/components/button'
import ErrorMessage from '../error-message'

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  'data-testid': string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  'data-testid': dataTestId,
}) => {
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
      await placeOrder()
    } catch (err: any) {
      console.error('Error placing order:', err)
      
      // Provide more user-friendly error messages
      if (err.message && err.message.includes('shipping profiles')) {
        setErrorMessage('Some items in your cart require different shipping methods. Please go back to the delivery step and select all required shipping methods.')
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
