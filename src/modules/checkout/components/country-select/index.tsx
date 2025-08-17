import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'

import { cn } from '@lib/util/cn'
import { HttpTypes } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Label } from '@modules/common/components/label'
import NativeSelect, {
  NativeSelectProps,
} from '@modules/common/components/native-select'
import { listRegions } from '@lib/data/regions'

const CountrySelect = forwardRef<
  HTMLSelectElement,
  NativeSelectProps & {
    region?: HttpTypes.StoreRegion
    error?: string
    allRegions?: HttpTypes.StoreRegion[]
  }
>(({ placeholder = 'Country', region, error, defaultValue, allRegions, ...props }, ref) => {
  const innerRef = useRef<HTMLSelectElement>(null)

  useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
    ref,
    () => innerRef.current
  )

  const countryOptions = useMemo(() => {
    // If allRegions is provided, collect all countries from all regions
    if (allRegions && allRegions.length > 0) {
      const allCountries = new Map()
      
      allRegions.forEach(reg => {
        reg.countries?.forEach(country => {
          if (country.iso_2 && country.display_name) {
            allCountries.set(country.iso_2, {
              value: country.iso_2,
              label: country.display_name,
            })
          }
        })
      })
      
      // Convert to array and sort alphabetically
      return Array.from(allCountries.values()).sort((a, b) => 
        a.label.localeCompare(b.label)
      )
    }
    
    // Fallback to current region only
    if (!region) {
      return []
    }

    return region.countries?.map((country) => ({
      value: country.iso_2,
      label: country.display_name,
    })) || []
  }, [region, allRegions])

  return (
    <Box className="flex flex-col gap-2">
      {props.label && (
        <Label
          size="sm"
          htmlFor={props.name}
          className={cn('text-secondary', { 'text-negative': !!error })}
        >
          {props.label}
        </Label>
      )}
      <NativeSelect
        ref={innerRef}
        placeholder={placeholder}
        defaultValue={defaultValue}
        error={error}
        {...props}
      >
        {countryOptions?.map(({ value, label }, index) => (
          <option key={index} value={value}>
            {label}
          </option>
        ))}
      </NativeSelect>
    </Box>
  )
})

CountrySelect.displayName = 'CountrySelect'

export default CountrySelect
