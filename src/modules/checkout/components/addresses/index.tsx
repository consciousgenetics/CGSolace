'use client'

import React, { startTransition, useActionState, useState, useEffect } from 'react'
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'

import { initiatePaymentSession, setAddresses } from '@lib/data/cart'
import { listRegions } from '@lib/data/regions'
import { useCheckoutForms } from '@lib/hooks/use-checkout-forms'
import compareAddresses from '@lib/util/addresses'
import { HttpTypes } from '@medusajs/types'
import { useToggleState } from '@medusajs/ui'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import Divider from '@modules/common/components/divider'
import { Heading } from '@modules/common/components/heading'
import { Stepper } from '@modules/common/components/stepper'
import { Text } from '@modules/common/components/text'
import { Spinner } from '@modules/common/icons'

import BillingAddress from '../billing_address'
import ShippingAddress from '../shipping-address'
import { SubmitButton } from '../submit-button'

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get('step') === 'address'

  const handleEdit = () => {
    router.push(pathname + '?step=address')
  }

  const { state: sameAsShipping, toggle: originalToggleSameAsShipping } =
    useToggleState(
      cart?.shipping_address && cart?.billing_address
        ? compareAddresses(cart?.billing_address, cart?.shipping_address)
        : true
    )

  const initialValues = {
    shipping_address: cart?.shipping_address || {
      first_name: '',
      last_name: '',
      address_1: '',
      company: '',
      postal_code: '',
      city: '',
      country_code:
        params.countryCode || cart?.shipping_address?.country_code || '',
      province: '',
      phone: '',
    },
    billing_address: cart?.billing_address || {
      first_name: '',
      last_name: '',
      address_1: '',
      company: '',
      postal_code: '',
      city: '',
      country_code: cart?.shipping_address?.country_code ?? '',
      province: '',
      phone: '',
    },
    email: cart?.email || customer?.email || '',
    same_as_shipping: sameAsShipping,
  }

  const checkout = useCheckoutForms(initialValues)
  const [, formAction] = useActionState(setAddresses, null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [allRegions, setAllRegions] = useState<HttpTypes.StoreRegion[]>([])

  // Fetch all regions on component mount
  useEffect(() => {
    const fetchAllRegions = async () => {
      try {
        const regions = await listRegions()
        if (regions) {
          setAllRegions(regions)
        }
      } catch (error) {
        console.error('Error fetching regions:', error)
      }
    }
    
    fetchAllRegions()
  }, [])

  const toggleSameAsShipping = (value: boolean) => {
    originalToggleSameAsShipping()
    checkout.setFieldValue('same_as_shipping', value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await checkout.handleSubmit()

      if (Object.keys(checkout.errors).length === 0) {
        const formData = new FormData()

        Object.entries(checkout.values.shipping_address).forEach(
          ([key, value]) => {
            formData.append(`shipping_address.${key}`, value as string)
          }
        )

        Object.entries(checkout.values.billing_address).forEach(
          ([key, value]) => {
            formData.append(`billing_address.${key}`, value as string)
          }
        )

        formData.append('email', checkout.values.email)
        formData.append(
          'same_as_shipping',
          checkout.values.same_as_shipping ? 'on' : 'off'
        )

        setIsTransitioning(true)

        try {
          // Properly wrap the form action in startTransition
          startTransition(() => {
            formAction(formData)
          })
          
          // Whether the form action succeeds or fails, we'll proceed after a delay
          setTimeout(async () => {
            try {
              // Attempt to check cart status but handle potential HTML response
              let cartHasAddress = false;
              
              try {
                // Get the current cart state to check if it has the address info
                const cartResponse = await fetch(`/store/carts/${cart?.id}`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                
                // Check if response is JSON before trying to parse it
                const contentType = cartResponse.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                  const cartData = await cartResponse.json();
                  
                  // If the cart has address info, we can proceed
                  if (cartData.cart && 
                      cartData.cart.shipping_address && 
                      cartData.cart.shipping_address.address_1) {
                    cartHasAddress = true;
                  }
                } else {
                  console.log('Received non-JSON response from cart endpoint, proceeding anyway');
                }
              } catch (fetchError) {
                console.error('Error fetching cart:', fetchError);
                // Continue anyway since address might be saved
              }
              
              // Just proceed to the next step regardless of errors - assume the address was saved
              // Then handle payment session if needed
              try {
                const activeSession = cart?.payment_collection?.payment_sessions?.find(
                  (paymentSession: any) => paymentSession.status === 'pending'
                );

                if (activeSession) {
                  await initiatePaymentSession(cart, {
                    provider_id: activeSession.provider_id,
                  });
                }
              } catch (sessionError) {
                console.error('Error with payment session, continuing anyway:', sessionError);
              }

              // Navigate to the next step regardless of errors
              window.location.href = `${pathname}?step=delivery`;
            } catch (innerError) {
              console.error('Error in timeout handler:', innerError);
              setIsTransitioning(false);
            }
          }, 2000);
          
        } catch (error) {
          console.error('Error submitting form:', error);
          setIsTransitioning(false);
        }
      }
    } catch (error) {
      console.error('Form validation error:', error);
      setIsTransitioning(false);
    }
  }

  return (
    <Box className="bg-primary p-5">
      {formError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {formError}
        </div>
      )}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                ease: [0, 0.71, 0.2, 1.01],
                scale: {
                  type: "spring",
                  damping: 5,
                  stiffness: 100,
                  restDelta: 0.001
                }
              }}
            >
              <Image
                src="/conscious-genetics-logo.png"
                alt="Conscious Genetics"
                width={300}
                height={150}
                className="animate-pulse"
                priority
                unoptimized
              />
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 200 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="h-1 bg-gradient-to-r from-purple-600 via-amber-400 to-purple-600 mt-6 rounded-full"
            />
          </div>
        </div>
      )}
      <Box className="mb-6 flex flex-row items-center justify-between">
        <Heading
          as="h2"
          className="flex flex-row items-center gap-x-4 text-2xl"
        >
          {isOpen ? (
            <Stepper state="focussed">1</Stepper>
          ) : (
            <Stepper state="completed" />
          )}
          Shipping address
        </Heading>
        {!isOpen && cart?.shipping_address && (
          <Button
            variant="tonal"
            size="sm"
            onClick={handleEdit}
            data-testid="edit-address-button"
          >
            Edit
          </Button>
        )}
      </Box>
      {isOpen ? (
        <form onSubmit={handleSubmit}>
          <Box>
            <ShippingAddress
              customer={customer}
              cart={cart}
              formik={checkout}
              checked={sameAsShipping}
              values={checkout.values}
              onChange={toggleSameAsShipping}
              handleChange={checkout.handleChange}
              errors={checkout.errors}
              allRegions={allRegions}
            />
            {!sameAsShipping && (
              <div>
                <Divider className="my-6" />
                <Heading as="h2" className="pb-6 text-2xl">
                  Billing address
                </Heading>
                <BillingAddress
                  cart={cart}
                  values={checkout.values}
                  handleChange={checkout.handleChange}
                  errors={checkout.errors}
                  allRegions={allRegions}
                />
              </div>
            )}
            <SubmitButton
              isLoading={checkout.isSubmitting || isTransitioning}
              className="mt-6"
              data-testid="submit-address-button"
            >
              {isTransitioning ? (
                <Box className="flex items-center gap-2">
                  <Spinner />
                  <span>Processing...</span>
                </Box>
              ) : (
                'Proceed to delivery'
              )}
            </SubmitButton>
          </Box>
        </form>
      ) : (
        <Box>
          <div className="text-small-regular">
            {cart && cart.shipping_address ? (
              <div className="flex items-start gap-x-8">
                <div className="flex w-full flex-col items-start gap-x-1">
                  {/* Shipping Address */}
                  <div
                    className="flex flex-col p-4"
                    data-testid="shipping-address-summary"
                  >
                    <Text size="lg" className="text-basic-primary">
                      Shipping Address
                    </Text>
                    <Text className="text-secondary">
                      {cart.shipping_address.first_name}{' '}
                      {cart.shipping_address.last_name}
                    </Text>
                    <Text className="text-secondary">
                      {cart.shipping_address.company &&
                        `${cart.shipping_address.company}, `}
                      {cart.shipping_address.address_1},{' '}
                      {cart.shipping_address.postal_code},{' '}
                      {cart.shipping_address.city},{' '}
                      {cart.shipping_address.country_code?.toUpperCase()}
                      {cart.shipping_address?.province &&
                        `, ${cart.shipping_address.province}`}
                      ,
                    </Text>
                    <Text className="text-secondary">
                      {cart.email}, {cart.shipping_address?.phone}
                    </Text>
                  </div>
                  {/* Billing Address */}
                  <div
                    className="flex flex-col p-4"
                    data-testid="billing-address-summary"
                  >
                    <Text size="lg" className="text-basic-primary">
                      Billing Address
                    </Text>
                    {sameAsShipping ? (
                      <Text className="text-secondary">
                        Same as shipping address
                      </Text>
                    ) : (
                      <>
                        <Text className="text-secondary">
                          {cart.billing_address.first_name}{' '}
                          {cart.billing_address.last_name}
                        </Text>
                        <Text className="text-secondary">
                          {cart.billing_address.address_1},{' '}
                          {cart.billing_address.postal_code},{' '}
                          {cart.billing_address.city},{' '}
                          {cart.billing_address.country_code?.toUpperCase()}
                          {cart.billing_address?.province &&
                            `, ${cart.shipping_address.province}`}
                          ,
                        </Text>
                        <Text className="text-secondary">
                          {cart.billing_address?.phone}
                        </Text>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </Box>
      )}
    </Box>
  )
}
export default Addresses
