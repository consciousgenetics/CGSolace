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
          
          {/* Local Payments Section */}
          <Box className="ml-10 bg-white p-4 rounded-md border-l-4 border-green-500">
            <Heading as="h4" className="text-md font-semibold mb-3 text-green-700">
              For Local UK Payments:
            </Heading>
            <ul className="space-y-2">
              <li><span className="font-semibold">Reference:</span> Conscious Accessories</li>
              <li><span className="font-semibold">Account Number:</span> 13560733</li>
              <li><span className="font-semibold">Sort Code:</span> 08-71-99</li>
            </ul>
          </Box>

          {/* International Payments Section */}
          <Box className="ml-10 bg-white p-4 rounded-md border-l-4 border-blue-500 mt-4">
            <Heading as="h4" className="text-md font-semibold mb-3 text-blue-700">
              For International Payments:
            </Heading>
            <ul className="space-y-2">
              <li><span className="font-semibold">Description / Reference:</span> Zempler13560733</li>
              <li><span className="font-semibold">IBAN:</span> GB72NWBK60721442217830</li>
              <li><span className="font-semibold">Account Number:</span> 42217830 <span className="text-sm text-gray-600">(This number is specifically for international payments only)</span></li>
              <li><span className="font-semibold">SWIFT / BIC:</span> NWBKGB2L</li>
              <li><span className="font-semibold">Bank Address:</span> NatWest Bank PLC, 250 Bishopsgate, London, EC2M 4AA, UK</li>
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
            <Text className="font-medium">Include the required reference in your transfer:</Text>
          </Box>
          <Box className="ml-10 space-y-3">
            <Box className="bg-green-50 p-3 rounded-md border border-green-200">
              <Text className="font-semibold text-green-700">For Local UK Payments:</Text>
              <Text className="text-sm text-green-600">Reference: Conscious Accessories</Text>
            </Box>
            <Box className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <Text className="font-semibold text-blue-700">For International Payments:</Text>
              <Text className="text-sm text-blue-600">Reference: Zempler13560733</Text>
            </Box>
            <Box className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <Text className="text-sm text-gray-600">Order #: {order.display_id}</Text>
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Box className="mt-6 border-t border-yellow-300 pt-4">
        <Text className="font-semibold text-yellow-800">
          Your order will be processed once payment is confirmed.
        </Text>
        <Text className="mt-3 text-blue-600 font-medium bg-blue-50 p-2 rounded-md border border-blue-200">
          💡 Make sure the person sending the payment uses the correct account details based on whether they are making an international or local UK payment.
        </Text>
      </Box>
    </Box>
  )
}

export default PaymentInstructions 