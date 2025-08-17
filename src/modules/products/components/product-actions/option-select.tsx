import React from 'react'
import Image from 'next/image'

import { cn } from '@lib/util/cn'
import { getVariantColor } from '@lib/util/get-variant-color'
import { HttpTypes } from '@medusajs/types'
import { Text } from '@modules/common/components/text'
import { VariantColor } from 'types/strapi'

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  variantsColors: VariantColor[]
  title: string
  disabled: boolean
  'data-testid'?: string
  productTitle?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  variantsColors,
  title,
  'data-testid': dataTestId,
  disabled,
  productTitle,
}) => {
  const getSizeOrder = (value: string) => {
    // Size ordering priority - handles both lowercase and proper case
    const normalizedValue = value.toLowerCase().trim()
    const sizeOrder = {
      'xxs': 0,
      'xs': 1,
      's': 2,
      'small': 2,
      'm': 3,
      'medium': 3,
      'l': 4,
      'large': 4,
      'xl': 5,
      'x-large': 5,
      'extra large': 5,
      'extra-large': 5,
      'extralarge': 5,
      'xxl': 6,
      '2xl': 6,
      'xx-large': 6,
      '3xl': 7,
      'xxxl': 7,
      'xxx-large': 7,
      '4xl': 8,
      '5xl': 9
    }
    return sizeOrder[normalizedValue] ?? 999 // Default high value for unknown sizes
  }

  // Function to detect if this option contains size values
  const isSizeOption = (values: any[], optionTitle: string) => {
    if (!values || values.length === 0) return false
    
    // Check if option title suggests it's a size option
    const titleLower = optionTitle.toLowerCase()
    if (titleLower === 'size' || titleLower.includes('size')) {
      return true
    }
    
    // Check if all values look like clothing sizes
    const sizeValues = ['small', 'medium', 'large', 'xl', 'xxl', 's', 'm', 'l', 'xs', 'xxs']
    const allValuesAreSizes = values.every(v => 
      sizeValues.some(size => v.value.toLowerCase().includes(size))
    )
    
    console.log(`Size detection for "${optionTitle}":`, {
      values: values.map(v => v.value),
      allValuesAreSizes,
      titleSuggested: titleLower === 'size' || titleLower.includes('size')
    })
    
    return allValuesAreSizes
  }

  const isSizeOptionDetected = isSizeOption(option.values || [], title)

  const filteredOptions = option.values
    ?.sort((a, b) => {
      if (isSizeOptionDetected) {
        // Custom sort for sizes
        const orderA = getSizeOrder(a.value)
        const orderB = getSizeOrder(b.value)
        console.log(`Size ordering: ${a.value} (${orderA}) vs ${b.value} (${orderB}) for title: ${title}`)
        return orderA - orderB
      }
      // Default alphabetical sort for other options
      return a.value.localeCompare(b.value)
    })
    .map((v) => v.value)

  const getDisplayText = (value: string, title: string) => {
    // For size options, handle specific sizes
    if (isSizeOptionDetected) {
      const normalizedValue = value.toLowerCase().trim()
      
      // Handle various XL representations
      if (normalizedValue === 'extra large' || 
          normalizedValue === 'extralarge' || 
          normalizedValue === 'extra-large' || 
          normalizedValue === 'x-large' ||
          normalizedValue === 'xl') {
        return 'XL'
      }
      
      // Handle Large
      if (normalizedValue === 'large' || normalizedValue === 'l') {
        return 'L'
      }
      
      // Handle Medium
      if (normalizedValue === 'medium' || normalizedValue === 'm') {
        return 'M'
      }
      
      // Handle Small
      if (normalizedValue === 'small' || normalizedValue === 's') {
        return 'S'
      }
      
      // Handle XXL and other sizes
      if (normalizedValue === 'xxl' || normalizedValue === '2xl' || normalizedValue === 'xx-large') {
        return 'XXL'
      }
      
      if (normalizedValue === 'xxxl' || normalizedValue === '3xl' || normalizedValue === 'xxx-large') {
        return 'XXXL'
      }
      
      if (normalizedValue === 'xs') {
        return 'XS'
      }
      
      if (normalizedValue === 'xxs') {
        return 'XXS'
      }
      
      // For other sizes, just use the original value or first letter
      return value.length <= 3 ? value.toUpperCase() : value.charAt(0).toUpperCase()
    }
    // For other options (like seed types), show full name
    return value
  }

  // Function to determine if dropdown should be used
  const shouldUseDropdown = () => {
    // Always use dropdown for pack products
    if (productTitle?.toLowerCase().includes('merch pack') || 
        productTitle?.toLowerCase().includes('5 x favourite pack')) {
      return true
    }

    if (!filteredOptions || filteredOptions.length === 0) {
      return false
    }

    // Check if any variation name is too long
    const maxLength = 12 // Character limit for button display (reduced for better UX)
    const hasLongVariations = filteredOptions.some(option => option.length > maxLength)
    
    // Check if variations contain descriptive text (like "Hemp Grinder: Conscious Genetics")
    const hasDescriptiveVariations = filteredOptions.some(option => 
      option.includes(':') || option.includes(' - ') || option.split(' ').length > 2
    )
    
    // Check if there are too many variations (would cause layout issues)
    const maxVariationsForButtons = 8
    const hasTooManyVariations = filteredOptions.length > maxVariationsForButtons
    
    // Use dropdown if variations are too long, descriptive, or too many
    return hasLongVariations || hasDescriptiveVariations || hasTooManyVariations
  }

  const useDropdown = shouldUseDropdown()

  return (
    <div className="flex flex-col gap-y-3">
      <Text as="p" className="text-md">
        <Text as="span" className="text-secondary">
          {title}:
        </Text>{' '}
        <Text as="span" className="text-basic-primary">
          {current}
        </Text>
      </Text>
      {useDropdown ? (
        // Dropdown for products with long variation names or many variations
        <select
          value={current || ""}
          onChange={(e) => updateOption(option.id, e.target.value)}
          className={cn(
            "w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 bg-white",
            "focus:outline-none focus:ring-2 focus:border-transparent",
            "hover:border-gray-400",
            disabled 
              ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed" 
              : "border-gray-300 focus:ring-[#d67bef] focus:ring-opacity-50"
          )}
          disabled={disabled}
          data-testid="variant-select"
        >
          <option value="" disabled>
            Select {title}
          </option>
          {filteredOptions?.map((v) => (
            <option key={v} value={v} className="py-2">
              {v}
            </option>
          ))}
        </select>
      ) : (
        // Original circular buttons for other products
        <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
          {filteredOptions?.map((v) => {
            const color = getVariantColor(v, variantsColors)
            const image = color?.Image
            const hex = color?.Color
            const displayText = getDisplayText(v, title)

            return image ? (
              <button
                onClick={() => updateOption(option.id, v)}
                key={v}
                className={cn('border-primary h-12 w-12 border relative rounded-full overflow-hidden', {
                  'border-action-primary': v === current,
                })}
                aria-label={`Choose ${title.toLowerCase()} ${v}`}
                disabled={disabled}
                data-testid="option-button"
              >
                <Image
                  src={image.url}
                  alt={image.alternativeText ?? 'Variant color'}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </button>
            ) : (
              <button
                onClick={() => updateOption(option.id, v)}
                key={v}
                className={cn(
                  'border-primary h-12 w-12 border relative flex items-center justify-center text-sm font-medium rounded-full', 
                  {
                    'border-action-primary': v === current,
                  }
                )}
                aria-label={`Choose ${title.toLowerCase()} ${v}`}
                style={{ backgroundColor: hex }}
                disabled={disabled}
                data-testid="option-button"
              >
                <span className={cn(
                  'text-basic-primary',
                  { 'text-white': hex && hex.toLowerCase() !== '#ffffff' }
                )}>
                  {displayText}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OptionSelect