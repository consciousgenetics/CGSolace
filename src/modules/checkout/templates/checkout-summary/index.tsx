'use client'

import { Label, Textarea } from '@medusajs/ui'
import ItemsPreviewTemplate from '@modules/cart/templates/preview'
import DiscountCode from '@modules/checkout/components/discount-code'
import PaymentButton from '@modules/checkout/components/payment-button'
import { Box } from '@modules/common/components/box'
import CartTotals from '@modules/common/components/cart-totals'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { useEffect, useMemo, useState } from 'react'
import { listCartShippingMethods } from '@lib/data/fulfillment'

// Add this function at the top to check for valid pricing
const validateCartPricing = (cart: any) => {
  if (!cart || !cart.items) return { isValid: true, message: '' };
  
  // Check if any variants are missing prices
  const itemsWithoutPrices = cart.items.filter((item: any) => {
    // Check if the item has a valid unit price
    const validUnitPrice = typeof item.unit_price === 'number' && 
                          !isNaN(item.unit_price) && 
                          item.unit_price > 0;
                          
    // Check if variant has calculated price
    const validCalculatedPrice = item.variant?.calculated_price?.calculated_amount &&
                               typeof item.variant.calculated_price.calculated_amount === 'number' &&
                               !isNaN(item.variant.calculated_price.calculated_amount);
                               
    return !validUnitPrice && !validCalculatedPrice;
  });
  
  if (itemsWithoutPrices.length > 0) {
    const itemTitles = itemsWithoutPrices.map((item: any) => item.title).join(', ');
    return {
      isValid: false,
      message: `The following items don't have valid prices: ${itemTitles}. Please contact customer service.`
    };
  }
  
  return { isValid: true, message: '' };
};

const CheckoutSummary = ({
  cart,
  searchParams,
}: {
  cart: any
  searchParams: { step?: string }
}) => {
    const [comment, setComment] = useState<string>('');
    const [pricingError, setPricingError] = useState<string>('');
  // State for shipping methods
  const [availableShippingMethods, setAvailableShippingMethods] = useState<any[] | null>(null);

  // Fetch shipping methods when cart changes
  useEffect(() => {
    if (cart?.id) {
      listCartShippingMethods(cart.id)
        .then(setAvailableShippingMethods)
        .catch(console.error);
    }
  }, [cart?.id]);

  // Check if all required shipping profiles have methods selected
  const allShippingProfilesSatisfied = useMemo(() => {
    if (!cart || !cart.items || cart.items.length === 0) return false
    
    // Check if we have any shipping methods at all
    if (!cart.shipping_methods || cart.shipping_methods.length === 0) {
      console.log('No shipping methods selected yet');
      return false;
    }
    
    // Get unique shipping profile IDs from cart items
    const requiredProfileIds = new Set(
      cart.items
        .filter(item => item.variant?.product?.shipping_profile_id)
        .map(item => item.variant.product.shipping_profile_id)
    )
    
    // If no shipping profiles are required, consider it satisfied
    if (requiredProfileIds.size === 0) {
      console.log('No shipping profiles required, considering all satisfied');
      return true;
    }
    
    // Get shipping profile IDs that have methods selected
    const selectedProfileIds = new Set();
    
    // For each shipping method, find the corresponding shipping option to get its profile
    (cart.shipping_methods || []).forEach((method) => {
      // Find the shipping option that corresponds to this method
      const shippingOption = availableShippingMethods?.find(
        (option) => option.id === method.shipping_option_id
      );
      
      if (shippingOption?.shipping_profile_id) {
        selectedProfileIds.add(shippingOption.shipping_profile_id);
      }
      // Fallback: if the shipping method has a nested shipping_option object
      else if (method.shipping_option?.shipping_profile_id) {
        selectedProfileIds.add(method.shipping_option.shipping_profile_id);
      }
    });
    
    // For debug purposes
    console.log('Shipping profile check:', {
      required: Array.from(requiredProfileIds),
      selected: Array.from(selectedProfileIds),
      satisfied: requiredProfileIds.size <= selectedProfileIds.size,
      shippingMethods: cart.shipping_methods?.map((m) => ({
        id: m.id,
        shipping_option_id: m.shipping_option_id,
        shipping_option: m.shipping_option
      })),
      availableOptions: availableShippingMethods?.map((opt) => ({
        id: opt.id,
        name: opt.name,
        shipping_profile_id: opt.shipping_profile_id
      }))
    });
    
    // Check if any required profiles are missing shipping methods
    const missingProfiles = Array.from(requiredProfileIds)
      .filter(id => !selectedProfileIds.has(id));
      
    return missingProfiles.length === 0;
  }, [cart, availableShippingMethods])

  // Determine if payment button should be shown
  const showPaymentButton = useMemo(() => {
    // Show if we're on the payment step
    if (searchParams?.step === 'payment') return true
    
    // Show if there's a pending payment session
    if (cart?.payment_collection?.payment_sessions?.some(s => s.status === 'pending')) {
      // But only if all shipping profiles are satisfied
      return allShippingProfilesSatisfied
    }
    
    return false
  }, [searchParams, cart, allShippingProfilesSatisfied])
  
  // Debug info
  useEffect(() => {
    console.log('CheckoutSummary debug:', {
      step: searchParams?.step,
      hasPaymentSessions: cart?.payment_collection?.payment_sessions?.some(s => s.status === 'pending'),
      allShippingProfilesSatisfied,
      showPaymentButton
    });
  }, [searchParams, cart, allShippingProfilesSatisfied, showPaymentButton]);

  // Validate pricing on component mount and when cart changes
  useEffect(() => {
    if (cart) {
      const { isValid, message } = validateCartPricing(cart);
      setPricingError(message);
    }
  }, [cart]);

  return (
    <Box className="relative">
      <Box className="sticky top-8 flex flex-col gap-y-4">
        <ItemsPreviewTemplate items={cart?.items} />
        <DiscountCode cart={cart} />
         {
            showPaymentButton && (
              <Box className='flex flex-col gap-1 p-2 bg-white'>
                <Label className="text-primary">Add a comment</Label>
                  <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Your comment here.." className="w-full bg-white p-2 text-black" />
              </Box>
            )
          }
        <Box className="flex flex-col gap-5 bg-primary p-5">
          <CartTotals totals={cart} />
          {cart?.shipping_methods && cart.shipping_methods.length > 0 && !allShippingProfilesSatisfied && (
            <div className="mt-4 rounded-md bg-amber-50 p-4">
              <Text className="text-amber-800 font-medium">
                Multiple shipping methods required
              </Text>
              <Text className="mt-2 text-amber-800">
                Some items in your cart require separate shipping methods. 
                Please select shipping options for all product types in your cart 
                by going back to the delivery step.
              </Text>
            </div>
          )}
         
          {pricingError && (
            <Box className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
              <Text className="text-red-600">{pricingError}</Text>
              <Text className="mt-2 text-sm text-red-500">
                This error may occur if the product doesn't have pricing for your region.
              </Text>
            </Box>
          )}
         
          {showPaymentButton && (
            <Box className="flex flex-col gap-5">
              {!pricingError && allShippingProfilesSatisfied && <PaymentButton cart={cart} data-testid="submit-order-button" comment={comment} />}
              <Box className="flex w-full">
                <Text className="text-center text-sm text-secondary">
                  By clicking the Place order button, you confirm that you have
                  read, understand and accept our{' '}
                  <LocalizedClientLink href="#" className="underline">
                    Terms of Use
                  </LocalizedClientLink>
                  ,{' '}
                  <LocalizedClientLink href="#" className="underline">
                    Terms of Sale
                  </LocalizedClientLink>{' '}
                  and{' '}
                  <LocalizedClientLink href="#" className="underline">
                    Returns Policy
                  </LocalizedClientLink>
                  .
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default CheckoutSummary
