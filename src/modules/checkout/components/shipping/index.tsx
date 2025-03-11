'use client'

import { useEffect, useState, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { RadioGroup } from '@headlessui/react'
import { setShippingMethod } from '@lib/data/cart'
import { cn } from '@lib/util/cn'
import { convertToLocale } from '@lib/util/money'
import { HttpTypes } from '@medusajs/types'
import ErrorMessage from '@modules/checkout/components/error-message'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Heading } from '@modules/common/components/heading'
import {
  RadioGroupIndicator,
  RadioGroupItem,
  RadioGroupRoot,
} from '@modules/common/components/radio'
import { Stepper } from '@modules/common/components/stepper'
import { Text } from '@modules/common/components/text'

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMethods, setSelectedMethods] = useState<Record<string, string>>({})

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get('step') === 'delivery'

  // Group shipping options by shipping profile
  const shippingOptionsByProfile = useMemo(() => {
    if (!availableShippingMethods) return {}
    
    const grouped = availableShippingMethods.reduce((acc, method) => {
      const profileId = method.shipping_profile_id
      if (!acc[profileId]) {
        acc[profileId] = []
      }
      acc[profileId].push(method)
      return acc
    }, {} as Record<string, HttpTypes.StoreCartShippingOption[]>)

    console.log('Available shipping options by profile:', grouped)
    return grouped
  }, [availableShippingMethods])

  // Get required shipping profiles from cart items
  const requiredShippingProfiles = useMemo(() => {
    if (!cart?.items) return new Set<string>()
    
    const profiles = new Set<string>()
    cart.items.forEach((item: HttpTypes.StoreCartLineItem) => {
      // Try to get shipping profile ID from metadata first
      const profileId = item.variant?.product?.metadata?.shipping_profile_id
      
      if (profileId) {
        profiles.add(profileId as string)
      }
    })

    // Also add profile IDs from existing shipping methods
    cart.shipping_methods?.forEach(method => {
      const option = availableShippingMethods?.find(
        opt => opt.id === method.shipping_option_id
      )
      if (option?.shipping_profile_id) {
        profiles.add(option.shipping_profile_id)
      }
    })
    
    console.log('Required shipping profiles:', Array.from(profiles))
    return profiles
  }, [cart?.items, cart.shipping_methods, availableShippingMethods])

  // Check if we have multiple shipping profiles
  const hasMultipleProfiles = Object.keys(shippingOptionsByProfile).length > 1

  // Initialize selected methods from cart
  useEffect(() => {
    if (cart.shipping_methods && cart.shipping_methods.length > 0) {
      const methods = cart.shipping_methods.reduce((acc, method) => {
        const option = availableShippingMethods?.find(
          opt => opt.id === method.shipping_option_id
        )
        if (option) {
          acc[option.shipping_profile_id] = option.id
        }
        return acc
      }, {} as Record<string, string>)
      
      console.log('Initializing selected methods:', methods)
      setSelectedMethods(methods)
    }
  }, [cart.shipping_methods, availableShippingMethods])

  const handleEdit = () => {
    router.push(pathname + '?step=delivery', { scroll: false })
  }

  const handleSubmit = () => {
    // Check if all required profiles have a selected method
    const missingProfiles = Array.from(requiredShippingProfiles).filter(
      profileId => !selectedMethods[profileId]
    )
    
    if (missingProfiles.length > 0) {
      const missingTypes = missingProfiles.map(profileId => getProfileName(profileId)).join(', ')
      setError(`Please select shipping methods for: ${missingTypes}`)
      return
    }

    console.log('Submitting with selected methods:', selectedMethods)
    router.push(pathname + '?step=payment', { scroll: false })
  }

  const set = async (id: string, profileId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Setting shipping method:', { id, profileId })
      
      // Update local state first for better UX
      setSelectedMethods(prev => ({
        ...prev,
        [profileId]: id
      }))
      
      await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      console.log('Successfully set shipping method')
    } catch (err) {
      console.error('Error setting shipping method:', err)
      setError(err.message)
      // Revert the local state update on error
      setSelectedMethods(prev => {
        const newState = { ...prev }
        delete newState[profileId]
        return newState
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  // Get profile names for better UX
  const getProfileName = (profileId: string) => {
    const firstOption = shippingOptionsByProfile[profileId]?.[0]
    if (!firstOption) return 'Products'
    
    // Try to extract a meaningful name from the shipping option
    if (firstOption.name.toLowerCase().includes('digital')) return 'Digital Products'
    if (firstOption.name.toLowerCase().includes('gift card')) return 'Gift Cards'
    if (firstOption.name.toLowerCase().includes('seed')) return 'Seeds'
    if (firstOption.name.toLowerCase().includes('merch')) return 'Merchandise'
    return 'Physical Products'
  }

  // Debug information
  console.log('Cart Items:', cart?.items)
  console.log('Required Profiles:', Array.from(requiredShippingProfiles))
  console.log('Selected Methods:', selectedMethods)
  console.log('Available Methods:', shippingOptionsByProfile)

  return (
    <Box className="bg-primary p-5">
      <Box
        className={cn('flex flex-row items-center justify-between', {
          'mb-6': isOpen || (!isOpen && cart.shipping_methods?.length > 0),
        })}
      >
        <Heading
          as="h2"
          className={cn('flex flex-row items-center gap-x-4 text-2xl', {
            'pointer-events-none select-none':
              !isOpen && cart.shipping_methods?.length === 0,
          })}
        >
          {!isOpen && cart.shipping_methods?.length === 0 ? (
            <Stepper>2</Stepper>
          ) : !isOpen && (cart.shipping_methods?.length ?? 0) > 0 ? (
            <Stepper state="completed" />
          ) : (
            <Stepper state="focussed">2</Stepper>
          )}
          Delivery
        </Heading>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Button
              variant="tonal"
              size="sm"
              onClick={handleEdit}
              data-testid="edit-delivery-button"
            >
              Edit
            </Button>
          )}
      </Box>
      {isOpen ? (
        <Box data-testid="delivery-options-container">
          {hasMultipleProfiles && (
            <Text className="mb-4 text-md font-medium text-basic-primary">
              Your cart contains different types of products that require separate shipping methods. 
              Please select a shipping method for each product type below.
            </Text>
          )}
          
          {Object.entries(shippingOptionsByProfile).map(([profileId, options]) => (
            <Box key={profileId} className="mb-6">
              {hasMultipleProfiles && (
                <Text className="mb-2 text-md font-medium text-basic-primary">
                  {getProfileName(profileId)}:
                </Text>
              )}
              
              <RadioGroup 
                value={selectedMethods[profileId] || ''} 
                onChange={(id) => set(id, profileId)}
              >
                {options.map((option) => {
                  return (
                    <RadioGroup.Option
                      key={option.id}
                      value={option.id}
                      data-testid="delivery-option-radio"
                      className={cn(
                        'flex cursor-pointer flex-row items-center justify-between gap-1 border p-2 !pr-4 text-basic-primary transition-all duration-200',
                        {
                          'border-action-primary':
                            option.id === selectedMethods[profileId],
                        }
                      )}
                    >
                      <Box className="flex w-full items-center gap-x-2">
                        <RadioGroupRoot className="m-3">
                          <RadioGroupItem
                            id={option.id}
                            value={option.id}
                            checked={option.id === selectedMethods[profileId]}
                          >
                            <RadioGroupIndicator />
                          </RadioGroupItem>
                        </RadioGroupRoot>
                        <Box className="flex w-full flex-col gap-1 small:flex-row small:items-center small:justify-between">
                          <span className="text-lg">{option.name}</span>
                          <span className="justify-self-end text-md">
                            {convertToLocale({
                              amount: option.amount,
                              currency_code: cart?.currency_code,
                            })}
                          </span>
                        </Box>
                      </Box>
                    </RadioGroup.Option>
                  )
                })}
              </RadioGroup>
            </Box>
          ))}
          
          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />
          <Button
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={Object.keys(selectedMethods).length === 0}
            data-testid="submit-delivery-option-button"
          >
            Proceed to payment
          </Button>
        </Box>
      ) : (
        <Box className="text-small-regular">
          {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
            <div className="flex flex-col p-4">
              <Text size="lg" className="text-basic-primary">
                Delivery method{cart.shipping_methods.length > 1 ? 's' : ''}
              </Text>
              {cart.shipping_methods.map((method) => {
                const option = availableShippingMethods?.find(
                  opt => opt.id === method.shipping_option_id
                )
                
                return option ? (
                  <Text key={method.id} className="text-secondary">
                    {getProfileName(option.shipping_profile_id)}: {option.name},{' '}
                    {convertToLocale({
                      amount: option.amount,
                      currency_code: cart?.currency_code,
                    })}
                  </Text>
                ) : null
              })}
            </div>
          )}
        </Box>
      )}
    </Box>
  )
}

export default Shipping
