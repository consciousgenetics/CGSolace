'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { RadioGroup } from '@headlessui/react'
import { isManual, paymentInfoMap } from '@lib/constants'
import { initiatePaymentSession } from '@lib/data/cart'
import { cn } from '@lib/util/cn'
import ErrorMessage from '@modules/checkout/components/error-message'
import PaymentContainer from '@modules/checkout/components/payment-container'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Heading } from '@modules/common/components/heading'
import { Stepper } from '@modules/common/components/stepper'
import { Text } from '@modules/common/components/text'

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart?.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === 'pending'
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ''
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get('step') === 'payment'

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const handleSubmit = useCallback(async (paymentMethodId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await initiatePaymentSession(cart, {
        provider_id: paymentMethodId,
      })
      // Only reload if we're not in the initial automatic selection
      if (selectedPaymentMethod !== '') {
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }, [cart, selectedPaymentMethod])

  const handlePaymentMethodChange = useCallback(async (value: string) => {
    // Only trigger the payment session update if the method actually changed
    if (value !== selectedPaymentMethod) {
      setSelectedPaymentMethod(value)
      await handleSubmit(value)
    }
  }, [handleSubmit, selectedPaymentMethod])

  const handleEdit = useCallback(() => {
    router.push(pathname + '?' + createQueryString('step', 'payment'), {
      scroll: false,
    })
  }, [router, pathname, createQueryString])

  // Automatically select manual payment when payment page is opened
  useEffect(() => {
    if (!paidByGiftcard && availablePaymentMethods?.length && isOpen && !selectedPaymentMethod) {
      const manualMethod = availablePaymentMethods.find(method => isManual(method.id))
      if (manualMethod) {
        setSelectedPaymentMethod(manualMethod.id)
        // Initialize the payment session without reloading
        handleSubmit(manualMethod.id)
      }
    }
  }, [availablePaymentMethods, isOpen, selectedPaymentMethod, paidByGiftcard, handleSubmit])

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <Box className="bg-primary p-5">
      <Box className="mb-6 flex flex-row items-center justify-between">
        <Heading
          as="h2"
          className={cn('flex flex-row items-center gap-x-4 text-2xl', {
            'pointer-events-none select-none': !isOpen && !paymentReady,
          })}
        >
          {!isOpen && !paymentReady ? (
            <Stepper>3</Stepper>
          ) : !isOpen && paymentReady ? (
            <Stepper state="completed" />
          ) : (
            <Stepper state="focussed">3</Stepper>
          )}
          Payment
        </Heading>
        {!isOpen && paymentReady && (
          <Button
            variant="tonal"
            size="sm"
            onClick={handleEdit}
            data-testid="edit-payment-button"
          >
            Edit
          </Button>
        )}
      </Box>
      <Box>
        <Box className={isOpen ? 'block' : 'hidden'}>
          {!paidByGiftcard && availablePaymentMethods?.length && (
            <>
              <Text className="mb-4 text-base text-black">
                Your order will be processed after we receive your bank transfer payment. Bank details will be provided in your order confirmation email.
              </Text>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={handlePaymentMethodChange}
              >
                {availablePaymentMethods
                  .filter(method => isManual(method.id))
                  .map((paymentMethod) => {
                    return (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        key={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                    )
                  })}
              </RadioGroup>
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col">
              <Text className="txt-medium-plus mb-1 text-black">
                Payment method
              </Text>
              <Text
                className="txt-medium text-black"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />
        </Box>

        <Box className={isOpen ? 'hidden' : 'block'}>
          {cart && paymentReady && activeSession ? (
            <Box className="flex flex-col items-start">
              <Box className="flex w-full flex-col p-4">
                <Text size="lg" className="font-normal text-black">
                  Payment method
                </Text>
                <Text
                  className="font-normal text-black"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[selectedPaymentMethod]?.title ||
                    selectedPaymentMethod}
                </Text>
              </Box>
            </Box>
          ) : paidByGiftcard ? (
            <Box className="flex w-full flex-col p-4">
              <Text size="lg" className="font-normal text-black">
                Payment method
              </Text>
              <Text
                className="font-normal text-black"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  )
}

export default Payment
