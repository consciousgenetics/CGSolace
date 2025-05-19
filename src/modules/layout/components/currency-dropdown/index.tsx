'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Box } from '@modules/common/components/box'

type Currency = {
  code: string
  symbol: string
  name: string
  countryCode: string
}

const currencies: Currency[] = [
  { code: 'GBP', symbol: '£', name: 'British Pound', countryCode: 'gb' },
  { code: 'USD', symbol: '$', name: 'US Dollar', countryCode: 'us' },
  { code: 'EUR', symbol: '€', name: 'Euro', countryCode: 'dk' },
]

export default function CurrencyDropdown() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0])

  useEffect(() => {
    // Determine the current currency based on the URL path
    const countryCode = pathname.split('/')[1]?.toLowerCase()
    const currency = currencies.find(c => c.countryCode === countryCode) || currencies[0]
    setSelectedCurrency(currency)
  }, [pathname])

  const handleCurrencyChange = (currency: Currency) => {
    setIsOpen(false)
    
    // Get the current path without the country code
    const pathParts = pathname.split('/')
    const pathWithoutCountry = pathParts.length > 2 ? pathParts.slice(2).join('/') : ''
    
    // Navigate to the new URL with the selected country code
    router.push(`/${currency.countryCode}/${pathWithoutCountry}`)
  }

  return (
    <Box className="z-50 h-full mr-2">
      <button
        className="flex items-center rounded-full bg-transparent !p-2 text-white hover:bg-black/20 hover:text-white active:bg-black/30 active:text-white xsmall:!p-3.5"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        data-testid="currency-dropdown-button"
      >
        <span className="flex items-center">
          <span className="mr-1">{selectedCurrency.symbol}</span>
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      
      {isOpen && (
        <div 
          className="absolute mt-2 w-40 rounded-md shadow-lg bg-black border border-white/10 z-50"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                role="menuitem"
                onClick={() => handleCurrencyChange(currency)}
              >
                <span className="mr-2">{currency.symbol}</span>
                {currency.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </Box>
  )
} 