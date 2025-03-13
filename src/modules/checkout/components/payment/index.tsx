'use client'

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { RadioGroup } from '@headlessui/react'
import { isStripe as isStripeFunc, isManual, paymentInfoMap } from '@lib/constants'
import { initiatePaymentSession } from '@lib/data/cart'
import { cn } from '@lib/util/cn'
import ErrorMessage from '@modules/checkout/components/error-message'
import PaymentContainer from '@modules/checkout/components/payment-container'
import { StripeContext } from '@modules/checkout/components/payment-wrapper'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Heading } from '@modules/common/components/heading'
import { Stepper } from '@modules/common/components/stepper'
import { Text } from '@modules/common/components/text'
import { StripeIcon } from '@modules/common/icons'
import { CardElement } from '@stripe/react-stripe-js'
import { StripeCardElementOptions } from '@stripe/stripe-js'

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
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ''
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get('step') === 'payment'

  const isStripe = isStripeFunc(activeSession?.provider_id)
  const stripeReady = useContext(StripeContext)

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: 'Inter, sans-serif',
          color: '#424270',
          '::placeholder': {
            color: 'rgb(107 114 128)',
          },
        },
      },
      classes: {
        base: 'pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover transition-all duration-300 ease-in-out',
      },
    }
  }, [])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + '?' + createQueryString('step', 'payment'), {
      scroll: false,
    })
  }

  const handlePaymentMethodChange = async (value: string) => {
    setSelectedPaymentMethod(value)
    await handleSubmit(value)
    
    // After payment method is selected and session is initiated, update URL to show payment step
    router.push(pathname + '?' + createQueryString('step', 'payment'), {
      scroll: false,
    })
  }

  const handleSubmit = async (paymentMethodId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await initiatePaymentSession(cart, {
        provider_id: paymentMethodId,
      })
      if (result) {
        // Force a refresh of the cart to get the new payment session
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Set payment method if there is only one available or if we're on the payment step
  useEffect(() => {
    setError(null)

    if (
      (availablePaymentMethods.length === 1 || isOpen) &&
      !selectedPaymentMethod &&
      !activeSession
    ) {
      const paymentMethod = availablePaymentMethods[0]?.id
      if (paymentMethod) {
        handlePaymentMethodChange(paymentMethod)
      }
    }
  }, [availablePaymentMethods, selectedPaymentMethod, isOpen, activeSession])

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
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={handlePaymentMethodChange}
              >
                {availablePaymentMethods
                  .sort((a, b) => {
                    return a.provider_id > b.provider_id ? 1 : -1
                  })
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
              {isStripe && stripeReady && (
                <div className="mt-5 transition-all duration-150 ease-in-out">
                  <Text className="mb-3 text-md text-basic-primary">
                    Enter your card details:
                  </Text>
                  <CardElement
                    options={useOptions}
                    onChange={(e) => {
                      setCardBrand(
                        e.brand &&
                          e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
                      )
                      setError(e.error?.message || null)
                      setCardComplete(e.complete)
                    }}
                  />
                </div>
              )}
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col">
              <Text className="txt-medium-plus mb-1 text-ui-fg-base">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
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

          {!activeSession && isStripeFunc(selectedPaymentMethod) && (
            <Button
              className="mt-6"
              onClick={() => handleSubmit(selectedPaymentMethod)}
              isLoading={isLoading}
              disabled={
                (isStripe && !cardComplete) ||
                (!selectedPaymentMethod && !paidByGiftcard)
              }
              data-testid="submit-payment-button"
            >
              Enter card details
            </Button>
          )}
          
          {!activeSession && isManual(selectedPaymentMethod) && (
            <Button
              className="mt-6"
              onClick={() => handleSubmit(selectedPaymentMethod)}
              isLoading={isLoading}
              disabled={!selectedPaymentMethod && !paidByGiftcard}
              data-testid="submit-manual-payment-button"
            >
              Continue with manual payment
            </Button>
          )}
        </Box>

        <Box className={isOpen ? 'hidden' : 'block'}>
          {cart && paymentReady && activeSession ? (
            <Box className="flex flex-col items-start">
              <Box className="flex w-full flex-col p-4">
                <Text size="lg" className="font-normal text-basic-primary">
                  Payment method
                </Text>
                <Text
                  className="font-normal text-secondary"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[selectedPaymentMethod]?.title ||
                    selectedPaymentMethod}
                </Text>
              </Box>
              <Box className="flex w-full flex-col p-4">
                <Text size="lg" className="font-normal text-basic-primary">
                  Payment details
                </Text>
                <div
                  className="flex items-center gap-2 text-md text-basic-primary"
                  data-testid="payment-details-summary"
                >
                  <Box className="flex h-7 w-fit items-center p-2">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <StripeIcon />
                    )}
                  </Box>
                  <Text className="font-normal text-secondary">
                    {isStripeFunc(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : 'Another step will appear'}
                  </Text>
                </div>
              </Box>
            </Box>
          ) : paidByGiftcard ? (
            <Box className="flex w-full flex-col p-4">
              <Text size="lg" className="font-normal text-basic-primary">
                Payment method
              </Text>
              <Text
                className="font-normal text-secondary"
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
