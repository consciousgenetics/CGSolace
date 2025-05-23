'use client'

import { HttpTypes } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import { convertToLocale } from '@lib/util/money'
import { useParams } from 'next/navigation'
import { getCurrencyFromCountry } from '@lib/util/get-product-price'
import { noDivisionCurrencies } from '@lib/constants'

type PaymentInstructionsProps = {
  order: HttpTypes.StoreOrder & { status: string }
}

const PaymentInstructions = ({ order }: PaymentInstructionsProps) => {
  // Get country code from URL params
  const { countryCode } = useParams() as { countryCode: string };
  const currency = order.currency_code || getCurrencyFromCountry(countryCode);

  // Format the total amount with currency
  const formatAmount = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "N/A"
    
    // Check if we need to divide by 100 for this currency
    // In Medusa, some currencies store amounts in cents and need division
    const normalizedAmount = noDivisionCurrencies.includes(currency.toLowerCase())
      ? amount  // For currencies that don't need division
      : amount; // For currencies that might need division if amount is stored as cents
    
    // Use the order's currency code and convertToLocale helper
    return convertToLocale({
      amount: normalizedAmount,
      currency_code: currency
    })
  }

  const formattedAmount = formatAmount(order.total)

  // Check if payment is made already
  const paymentStatus = order.payment_status
  const isPaid = paymentStatus === "captured" || paymentStatus === "partially_captured"

  // If payment is already completed, don't show payment instructions
  if (isPaid) {
    return null
  }

  return (
    <Box className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 my-6">
      <Heading as="h2" className="text-2xl font-bold text-yellow-800 mb-4">
        PAY NOW - BANK TRANSFER REQUIRED
      </Heading>
      
      <Box className="bg-white rounded-lg p-4 mb-4">
        <Heading as="h3" className="text-lg font-semibold mb-2">
          Transfer Amount: {formattedAmount}
        </Heading>
        <Text className="text-gray-700">Order #: {order.display_id}</Text>
      </Box>
      
      <Heading as="h3" className="text-lg font-semibold mb-3">
        Bank Transfer Instructions:
      </Heading>
      
      <Box className="space-y-6">
        <Box className="flex flex-col space-y-1">
          <Box className="flex items-center">
            <Box className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold mr-2">1</Box>
            <Text className="font-medium">Make a bank transfer with these details:</Text>
          </Box>
          <Box className="ml-10 bg-white p-3 rounded-md">
            <ul className="space-y-2">
              <li><span className="font-semibold">Name:</span> Conscious Accessories</li>
              <li><span className="font-semibold">Account Number:</span> 19831543</li>
              <li><span className="font-semibold">Sort Code:</span> 04-06-05</li>
              <li><span className="font-semibold">IBAN:</span> GB41 CLRB 0406 0519 8315 43</li>
              <li><span className="font-semibold">SWIFT:</span> CLRBGB22</li>
              <li><span className="font-semibold">Address:</span> 4th Floor, The Featherstone Building, 66 City Road, London, EC1Y 2AL</li>
            </ul>
          </Box>
        </Box>
        
        <Box className="flex flex-col space-y-1">
          <Box className="flex items-center">
            <Box className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold mr-2">2</Box>
            <Text className="font-medium">Enter the exact amount: <span className="text-yellow-600 font-bold text-lg bg-yellow-100 px-2 py-1 rounded-md">{formattedAmount}</span></Text>
          </Box>
        </Box>
        
        <Box className="flex flex-col space-y-1">
          <Box className="flex items-center">
            <Box className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold mr-2">3</Box>
            <Text className="font-medium">Include your order number in the reference:</Text>
          </Box>
          <Box className="ml-10 bg-white p-3 rounded-md">
            <Text className="font-semibold">Reference: Order #{order.display_id}</Text>
          </Box>
        </Box>
      </Box>
      
      <Box className="mt-6 border-t border-yellow-300 pt-4">
        <Text className="font-semibold text-yellow-800">
          Your order will be processed once payment is confirmed.
        </Text>
        <Text className="mt-3 text-red-600 font-medium bg-red-50 p-2 rounded-md border border-red-200">
          ⚠️ IMPORTANT: If you are sending payment from outside the UK, please use the IBAN number when making your transfer.
        </Text>
      </Box>
    </Box>
  )
}

export default PaymentInstructions 