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
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  variantsColors,
  title,
  'data-testid': dataTestId,
  disabled,
}) => {
  const filteredOptions = option.values
    ?.sort((a, b) => a.value.localeCompare(b.value))
    .map((v) => v.value)

  const getDisplayText = (value: string, title: string) => {
    // For size options, show first letter
    if (title.toLowerCase() === 'size') {
      return value.charAt(0).toUpperCase()
    }
    // For other options (like seed types), show full name
    return value
  }

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
    </div>
  )
}

export default OptionSelect