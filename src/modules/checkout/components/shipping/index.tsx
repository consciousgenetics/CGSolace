'use client'

import { useEffect, useState, useMemo, startTransition, useActionState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'

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
import { Spinner } from '@modules/common/icons'
import { SubmitButton } from '@modules/checkout/components/submit-button'

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
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

    return grouped
  }, [availableShippingMethods])

  // Get required shipping profiles from cart items
  const requiredShippingProfiles = useMemo(() => {
    if (!cart?.items) return new Set<string>()
    
    const profiles = new Set<string>()
    cart.items.forEach((item: HttpTypes.StoreCartLineItem) => {
      // Try to get shipping profile ID from product using type assertion
      const profileId = item.variant?.product ? 
        (item.variant.product as any).shipping_profile_id : undefined
      
      if (profileId) {
        profiles.add(profileId as string)
      }
    })

    // If there are shipping options but no profiles detected,
    // add at least one profile from the options to ensure something is selected
    if (profiles.size === 0 && availableShippingMethods && availableShippingMethods.length > 0) {
      // Find all unique profile IDs from available shipping options
      const availableProfiles = new Set<string>()
      availableShippingMethods.forEach(method => {
        if (method.shipping_profile_id) {
          availableProfiles.add(method.shipping_profile_id)
        }
      })
      
      // Add all available profiles to required profiles
      availableProfiles.forEach(profileId => profiles.add(profileId))
      
      console.log(`No profiles detected from items, using ${profiles.size} profiles from available options:`, 
        Array.from(profiles))
    }
    
    return profiles
  }, [cart?.items, availableShippingMethods])

  // Initialize selected methods from cart - more efficiently
  useEffect(() => {
    if (cart.shipping_methods && cart.shipping_methods.length > 0) {
      setSelectedMethods(cart.shipping_methods.reduce((acc, method) => {
        const option = availableShippingMethods?.find(
          opt => opt.id === method.shipping_option_id
        )
        if (option) {
          acc[option.shipping_profile_id] = option.id
        }
        return acc
      }, {} as Record<string, string>))
    }
  }, [cart.shipping_methods, availableShippingMethods])

  const handleEdit = () => {
    router.push(pathname + '?step=delivery', { scroll: false })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    // Prevent multiple submissions or if already transitioning
    if (isTransitioning || isLoading) {
      return
    }

    // Check if all required profiles have a selected method
    const missingProfiles = Array.from(requiredShippingProfiles).filter(
      profileId => !selectedMethods[profileId]
    )
    
    if (missingProfiles.length > 0) {
      const missingTypes = missingProfiles.map(profileId => getProfileName(profileId)).join(', ')
      setError(`Please select shipping methods for: ${missingTypes}`)
      return
    }

    // Set transitioning state immediately to show loading UI
    setIsTransitioning(true)
    
    // Use simple direct navigation for best performance
    window.location.href = `${pathname}?step=payment`;
  }

  const set = (id: string, profileId: string) => {
    // Don't do anything if this shipping method is already selected
    if (selectedMethods[profileId] === id) return
    
    setIsLoading(true)
    setError(null)
    
    // Update local state first for better UX
    setSelectedMethods(prev => ({
      ...prev,
      [profileId]: id
    }))
    
    // Set shipping method in background with promise
    setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .then(() => {
        // Success case is already handled by updating the state
      })
      .catch(err => {
        console.error('Error setting shipping method:', err)
        setError(err.message)
        // Revert the local state update on error
        setSelectedMethods(prev => {
          const newState = { ...prev }
          delete newState[profileId]
          return newState
        })
      })
      .finally(() => {
        setIsLoading(false)
      })
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

  // Check if we have multiple shipping profiles
  const hasMultipleProfiles = Object.keys(shippingOptionsByProfile).length > 1

  return (
    <Box className="bg-primary p-5">
      <style jsx global>{`
        /* Add styles to ensure the radio button selection is visible */
        .radio-selected {
          background-color: transparent !important;
          border-color: #000 !important;
        }
        
        /* Make the indicator more prominent */
        [data-state="checked"] .h-5.w-5 {
          border-width: 6px !important;
          border-color: #000 !important;
        }
        
        /* Style the RadioGroupIndicator */
        [data-radix-ui-radio-group-item][data-state="checked"] {
          border-color: #000 !important;
        }
        
        /* Ensure the inner dot is visible */
        [data-radix-ui-radio-group-indicator] {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        [data-radix-ui-radio-group-indicator][data-state="checked"]::after {
          content: '';
          display: block !important;
          width: 7px !important;
          height: 7px !important;
          border-radius: 50% !important;
          background-color: #000 !important;
        }
      `}</style>
      
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
          
          <form onSubmit={handleSubmit}>
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
                            'border-action-primary border-2 bg-gray-50':
                              option.id === selectedMethods[profileId],
                          }
                        )}
                      >
                        <Box className="flex w-full items-center gap-x-2">
                          <RadioGroupRoot className="m-3">
                            <RadioGroupItem
                              id={option.id}
                              value={option.id}
                              className={cn({
                                'radio-selected': option.id === selectedMethods[profileId]
                              })}
                            >
                              <RadioGroupIndicator className={cn({
                                'opacity-100': option.id === selectedMethods[profileId],
                                'opacity-0': option.id !== selectedMethods[profileId]
                              })} />
                              {option.id === selectedMethods[profileId] && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-2.5 h-2.5 rounded-full bg-black" />
                                </div>
                              )}
                            </RadioGroupItem>
                          </RadioGroupRoot>
                          <Box className="flex w-full flex-col gap-1 small:flex-row small:items-center small:justify-between">
                            <span className="text-lg">{option.name}</span>
                            <span className="justify-self-end text-md">
                              {convertToLocale({
                                amount: option.amount,
                                currency_code: 'GBP',
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
            <SubmitButton
              isLoading={isLoading || isTransitioning}
              className="mt-6"
              data-testid="submit-delivery-button"
            >
              {isTransitioning ? (
                <Box className="flex items-center gap-2">
                  <Spinner />
                  <span>Processing...</span>
                </Box>
              ) : (
                'Proceed to payment'
              )}
            </SubmitButton>
          </form>
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
                      currency_code: 'GBP',
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
