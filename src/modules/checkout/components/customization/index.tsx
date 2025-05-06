'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import Textarea from '@modules/common/components/textarea'
import { updateCart } from '@lib/data/cart'

type CustomizationProps = {
  cart: any
}

const Customization: React.FC<CustomizationProps> = ({ cart }) => {
  const [customization, setCustomization] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  // Initialize the customization field from cart metadata when component mounts or cart changes
  useEffect(() => {
    if (cart?.metadata?.customization) {
      setCustomization(cart.metadata.customization)
    }
  }, [cart?.id, cart?.metadata?.customization])

  // Debounced save function to reduce API calls
  const saveCustomization = useCallback(async (value: string) => {
    if (!cart) return

    try {
      setIsSaving(true)
      await updateCart({ 
        metadata: { 
          ...(cart.metadata || {}),
          customization: value 
        } 
      })
    } catch (error) {
      console.error('Error saving customization:', error)
    } finally {
      setIsSaving(false)
    }
  }, [cart])

  const handleCustomizationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setCustomization(value)
    
    // Clear any existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    
    // Set a new timeout for debounced saving
    const timeout = setTimeout(() => {
      saveCustomization(value)
    }, 500) // 500ms debounce
    
    setSaveTimeout(timeout)
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
    }
  }, [saveTimeout])

  return (
    <Box className="mt-4">
      <Heading 
        as="h3" 
        className="text-base font-medium mb-2"
      >
        Comments
      </Heading>
      <Box>
        <Text className="mb-2 text-sm text-gray-700">
          Add any special instructions or customization details for your order
        </Text>
        <Textarea
          name="customization"
          value={customization}
          onChange={handleCustomizationChange}
          rows={3}
          placeholder="Type your comments here..."
          className="w-full"
        />
        {isSaving && (
          <Text className="mt-1 text-sm text-gray-500">Saving...</Text>
        )}
      </Box>
    </Box>
  )
}

export default Customization 