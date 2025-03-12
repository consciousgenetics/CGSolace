'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import { sdk } from '@lib/config'
import medusaError from '@lib/util/medusa-error'
import { HttpTypes } from '@medusajs/types'
import { omit } from 'lodash'

import { getAuthHeaders, getCartId, removeCartId, setCartId } from './cookies'
import { getProductByHandle, getProductsById } from './products'
import { getRegion } from './regions'

// Add type definition
type ProductVariantWithPrices = HttpTypes.StoreProductVariant & {
  prices?: Array<{ currency_code: string; amount: number }>
}

const createCart = async (data: {
  region_id: string
  country_code: string
}) => {
  try {
    // Only send region_id to the Medusa backend
    const result = await sdk.store.cart.create({
      region_id: data.region_id
    });
    return result.cart;
  } catch (error) {
    console.error('createCart: Error creating cart:', error);
    return null;
  }
}

export async function retrieveCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return null
  }

  const authHeaders = await getAuthHeaders()

  return await sdk.store.cart
    .retrieve(cartId, {}, { next: { tags: ['cart'] }, ...authHeaders })
    .then(({ cart }) => cart)
    .catch(() => {
      return null
    })
}

// Alternate function that uses the Route API to set cart ID
const setCartIdViaAPI = async (cartId: string) => {
  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartId }),
    })
    
    if (!response.ok) {
      console.error('Error setting cart ID via API:', response.statusText)
    }
    
    return response.ok
  } catch (error) {
    console.error('Failed to set cart ID via API:', error)
    return false
  }
}

export const getOrSetCart = async (countryCode: string = 'uk') => {
  try {
    const existingCartId = await getCartId()
    const region = await getRegion(countryCode)

    if (!region) {
      console.error('getOrSetCart: Region not found for country code:', countryCode)
      return null
    }

    // If we have an existing cart, try to retrieve it
    if (existingCartId) {
      try {
        const authHeaders = await getAuthHeaders()
        const { cart } = await sdk.store.cart.retrieve(existingCartId, {}, authHeaders)

        // Check if the cart exists and has the correct region
        if (cart && cart.region_id === region.id) {
          return cart
        }

        // If cart doesn't exist or has wrong region, remove the cart ID
        await removeCartId()
      } catch (error) {
        console.error('getOrSetCart: Error retrieving existing cart:', error)
        await removeCartId()
      }
    }

    // Create a new cart with only region_id
    const cart = await createCart({
      region_id: region.id,
      country_code: countryCode, // This won't be used in the API call but kept for logging
    })

    if (!cart) {
      console.error('getOrSetCart: Failed to create new cart')
      return null
    }

    try {
      // Try the API method first
      const success = await setCartIdViaAPI(cart.id)
      if (!success) {
        // Fall back to direct cookie setting if API fails
        await setCartId(cart.id)
      }
    } catch (e) {
      console.error('Error setting cart ID:', e)
    }
    
    return cart
  } catch (error) {
    console.error('getOrSetCart: Error:', error)
    return null
  }
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error('No existing cart found, please create one before updating')
  }

  const authHeaders = await getAuthHeaders()

  return sdk.store.cart
    .update(cartId, data, {}, authHeaders)
    .then(({ cart }) => {
      revalidateTag('cart')
      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error('Missing variant ID when adding to cart')
  }

  try {
    // First, ensure we have a valid region
    const region = await getRegion(countryCode)
    if (!region) {
      throw new Error(`Region not found for country code: ${countryCode}`)
    }

    // Get or create cart with the correct region
    const cart = await getOrSetCart(countryCode)
    if (!cart) {
      throw new Error('Failed to create or retrieve cart')
    }

    // Ensure the cart has the correct region
    if (cart.region_id !== region.id) {
      try {
        await updateCart({ region_id: region.id })
      } catch (error) {
        console.error('Error updating cart region:', error)
        throw new Error('Failed to update cart region')
      }
    }

    const authHeaders = await getAuthHeaders()

    // Add the item to cart with error handling
    try {
      const response = await sdk.store.cart.createLineItem(
        cart.id,
        {
          variant_id: variantId,
          quantity,
        },
        {},
        authHeaders
      )

      if (!response.cart) {
        throw new Error('Failed to add item to cart')
      }

      revalidateTag('cart')
      return response.cart
    } catch (error) {
      console.error('addToCart: Error adding line item:', error)
      if (error.response?.status >= 500) {
        throw new Error('Server error occurred while adding to cart. Please try again.')
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error('addToCart: Error in main try block:', error)
    throw error
  }
}

export async function addToCartCheapestVariant({
  productHandle,
  regionId,
  countryCode,
}: {
  productHandle: string
  regionId: string
  countryCode: string
}) {
  if (!productHandle || !regionId || !countryCode) {
    return {
      success: false,
      error: 'Missing required parameters',
    }
  }

  try {
    const detailedProduct = await getProductByHandle(productHandle, regionId)

    if (!detailedProduct) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    // Find the cheapest variant with valid price and inventory
    const variants = detailedProduct.variants as ProductVariantWithPrices[]
    const cheapestVariant = variants
      .filter(variant => 
        variant.prices?.some(p => p.currency_code?.toUpperCase() === 'GBP') && 
        (variant.inventory_quantity === null || variant.inventory_quantity > 0)
      )
      .reduce((cheapest, current) => {
        const currentGbpPrice = current.prices?.find(p => p.currency_code?.toUpperCase() === 'GBP')
        const cheapestGbpPrice = cheapest?.prices?.find(p => p.currency_code?.toUpperCase() === 'GBP')
        
        if (!currentGbpPrice) return cheapest
        if (!cheapestGbpPrice) return current
        
        return currentGbpPrice.amount < cheapestGbpPrice.amount ? current : cheapest
      }, variants[0])

    if (!cheapestVariant || !cheapestVariant.id) {
      return {
        success: false,
        error: 'No available variants found',
      }
    }

    if (cheapestVariant.inventory_quantity !== null && cheapestVariant.inventory_quantity <= 0) {
      return {
        success: false,
        error: 'Product is out of stock',
      }
    }

    const result = await addToCart({
      variantId: cheapestVariant.id,
      quantity: 1,
      countryCode,
    })

    return {
      success: true,
      message: 'Product added to cart',
      cart: result
    }
  } catch (error) {
    console.error('Error adding product to cart:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error('Missing lineItem ID when updating line item')
  }

  const cartId = await getCartId()
  if (!cartId) {
    throw new Error('Missing cart ID when updating line item')
  }

  const authHeaders = await getAuthHeaders()

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, authHeaders)
    .then(() => {
      revalidateTag('cart')
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error('Missing lineItem ID when deleting line item')
  }

  const cartId = await getCartId()
  if (!cartId) {
    throw new Error('Missing cart ID when deleting line item')
  }

  const authHeaders = await getAuthHeaders()

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, authHeaders)
    .then(() => {
      revalidateTag('cart')
    })
    .catch(medusaError)

  revalidateTag('cart')
}

export async function enrichLineItems(
  lineItems:
    | HttpTypes.StoreCartLineItem[]
    | HttpTypes.StoreOrderLineItem[]
    | null,
  regionId: string
) {
  if (!lineItems) return []

  // Get the UK region to ensure we use GBP prices
  const ukRegion = await getRegion('uk')
  if (!ukRegion) {
    console.error('enrichLineItems: Failed to get UK region');
    return lineItems;
  }

  // Prepare query parameters with UK region
  const queryParams = {
    ids: lineItems.map((lineItem) => lineItem.product_id!),
    regionId: ukRegion.id, // Use UK region ID to get GBP prices
  }

  // Fetch products by their IDs
  const products = await getProductsById(queryParams)
  if (!lineItems?.length || !products) {
    return []
  }

  let cartSubtotal = 0;
  let cartTotal = 0;

  // Enrich line items with product and variant information
  const enrichedItems = lineItems.map((item) => {
    const product = products.find((p: any) => p.id === item.product_id)
    const variant = product?.variants?.find(
      (v: any) => v.id === item.variant_id
    ) as HttpTypes.StoreProductVariant & { prices?: Array<{ currency_code: string; amount: number }> }

    if (!product || !variant) {
      return item
    }

    // Find GBP price for the variant
    const gbpPrice = variant.prices?.find(p => 
      p.currency_code?.toUpperCase() === 'GBP'
    )

    // If we found a GBP price, use it to calculate totals
    if (gbpPrice && item.quantity) {
      console.log(`enrichLineItems: Using GBP price for variant ${variant.id}:`, {
        amount: gbpPrice.amount,
        quantity: item.quantity
      });

      const itemTotal = gbpPrice.amount * item.quantity;
      
      // Update item with GBP prices
      item.unit_price = gbpPrice.amount;
      item.subtotal = itemTotal;
      item.total = itemTotal;
      
      // Add to cart totals
      cartSubtotal += itemTotal;
      cartTotal += itemTotal;

      console.log('enrichLineItems: Updated line item totals:', {
        variantId: variant.id,
        unitPrice: item.unit_price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        total: item.total
      });
    }

    return {
      ...item,
      variant: {
        ...variant,
        product: omit(product, 'variants'),
      },
    }
  }) as HttpTypes.StoreCartLineItem[]

  // Update cart with GBP totals
  const cartId = await getCartId();
  if (cartId) {
    try {
      const authHeaders = await getAuthHeaders();
      
      console.log('enrichLineItems: Updating cart region to UK:', {
        cartId,
        regionId: ukRegion.id
      });

      // Update cart to use UK region
      await sdk.store.cart.update(
        cartId,
        { region_id: ukRegion.id },
        {},
        authHeaders
      );

      // Don't call revalidateTag here as it's not allowed during render
    } catch (error) {
      console.error('enrichLineItems: Error updating cart:', error);
    }
  }

  return enrichedItems;
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const authHeaders = await getAuthHeaders()

  try {
    // First get the cart to check existing shipping methods
    const cartResponse = await sdk.store.cart.retrieve(cartId, {}, authHeaders)
    const cart = cartResponse.cart

    // Get all shipping methods for this cart
    const shippingOptions = await sdk.store.fulfillment.listCartOptions(
      { cart_id: cartId },
      {},
      authHeaders
    )

    // Group shipping options by profile
    const optionsByProfile = shippingOptions.shipping_options.reduce((acc, option) => {
      if (!acc[option.shipping_profile_id]) {
        acc[option.shipping_profile_id] = []
      }
      acc[option.shipping_profile_id].push(option)
      return acc
    }, {} as Record<string, any[]>)

    // Get the profile ID of the selected shipping method
    const selectedOption = shippingOptions.shipping_options.find(
      option => option.id === shippingMethodId
    )

    if (!selectedOption) {
      throw new Error('Selected shipping method not found')
    }

    // Add the shipping method
    await sdk.store.cart.addShippingMethod(
      cartId,
      { option_id: shippingMethodId },
      {},
      authHeaders
    )

    revalidateTag('cart')
    return true
  } catch (error) {
    console.error('Error setting shipping method:', error)
    throw error
  }
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: {
    provider_id: string
    context?: Record<string, unknown>
  }
) {
  // Make authentication optional by using empty object if no auth headers
  const authHeaders = await getAuthHeaders().catch(() => ({}))

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, authHeaders)
    .then((resp) => {
      revalidateTag('cart')
      return resp
    })
    .catch(medusaError)
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error('No existing cart found')
  }

  await updateCart({ promo_codes: codes })
    .then(() => {
      revalidateTag('cart')
    })
    .catch(medusaError)
}

// export async function applyGiftCard(code: string) {
//   //   const cartId = getCartId()
//   //   if (!cartId) return "No cartId cookie found"
//   //   try {
//   //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
//   //       revalidateTag("cart")
//   //     })
//   //   } catch (error: any) {
//   //     throw error
//   //   }
// }

// export async function removeDiscount(code: string) {
//   // const cartId = getCartId()
//   // if (!cartId) return "No cartId cookie found"
//   // try {
//   //   await deleteDiscount(cartId, code)
//   //   revalidateTag("cart")
//   // } catch (error: any) {
//   //   throw error
//   // }
// }

// export async function removeGiftCard(
//   codeToRemove: string,
//   giftCards: any[]
//   // giftCards: GiftCard[]
// ) {
//   //   const cartId = getCartId()
//   //   if (!cartId) return "No cartId cookie found"
//   //   try {
//   //     await updateCart(cartId, {
//   //       gift_cards: [...giftCards]
//   //         .filter((gc) => gc.code !== codeToRemove)
//   //         .map((gc) => ({ code: gc.code })),
//   //     }).then(() => {
//   //       revalidateTag("cart")
//   //     })
//   //   } catch (error: any) {
//   //     throw error
//   //   }
// }

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get('code') as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error('No form data found when setting addresses')
    }
    const cartId = getCartId()
    if (!cartId) {
      throw new Error('No existing cart found when setting addresses')
    }

    const data = {
      shipping_address: {
        first_name: formData.get('shipping_address.first_name'),
        last_name: formData.get('shipping_address.last_name'),
        address_1: formData.get('shipping_address.address_1'),
        address_2: '',
        company: formData.get('shipping_address.company'),
        postal_code: formData.get('shipping_address.postal_code'),
        city: formData.get('shipping_address.city'),
        country_code: formData.get('shipping_address.country_code'),
        province: formData.get('shipping_address.province'),
        phone: formData.get('shipping_address.phone'),
      },
      email: formData.get('email'),
    } as any

    const sameAsShipping = formData.get('same_as_shipping')
    if (sameAsShipping === 'on') data.billing_address = data.shipping_address

    if (sameAsShipping !== 'on')
      data.billing_address = {
        first_name: formData.get('billing_address.first_name'),
        last_name: formData.get('billing_address.last_name'),
        address_1: formData.get('billing_address.address_1'),
        address_2: '',
        company: formData.get('billing_address.company'),
        postal_code: formData.get('billing_address.postal_code'),
        city: formData.get('billing_address.city'),
        country_code: formData.get('billing_address.country_code'),
        province: formData.get('billing_address.province'),
        phone: formData.get('billing_address.phone'),
      }
    await updateCart(data)
  } catch (e: any) {
    return e.message
  }

  redirect(
    `/${formData.get('shipping_address.country_code') as string}/checkout?step=delivery`
  )
}

export async function placeOrder() {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error('No existing cart found when placing an order')
  }

  const authHeaders = await getAuthHeaders()

  try {
    // First, check if the cart has shipping methods
    const cartResponse = await sdk.store.cart.retrieve(cartId, {}, authHeaders)
    const cart = cartResponse.cart
    
    if (!cart.shipping_methods || cart.shipping_methods.length === 0) {
      throw new Error('No shipping methods selected. Please select a shipping method before placing your order.')
    }

    // Get all required shipping profiles from cart items
    const requiredProfiles = new Set(
      cart.items
        .filter(item => item.variant?.product?.shipping_profile_id)
        .map(item => item.variant.product.shipping_profile_id)
    )

    // Check if all required profiles have a shipping method
    const selectedProfiles = new Set(
      cart.shipping_methods.map(method => {
        const item = cart.items.find(item => 
          item.variant?.product?.shipping_profile_id && 
          item.shipping_methods?.some(sm => sm.shipping_option_id === method.shipping_option_id)
        )
        return item?.variant?.product?.shipping_profile_id
      }).filter(Boolean)
    )

    // Compare required vs selected profiles
    if (requiredProfiles.size !== selectedProfiles.size) {
      throw new Error('Some items in your cart require different shipping methods. Please go back to the delivery step and select all required shipping methods.')
    }

    // Log shipping methods for debugging
    console.log('Placing order with shipping methods:', {
      required: Array.from(requiredProfiles),
      selected: Array.from(selectedProfiles),
      methods: cart.shipping_methods
    })

    const cartRes = await sdk.store.cart
      .complete(cartId, {}, authHeaders)
      .then((cartRes) => {
        revalidateTag('cart')
        return cartRes
      })
      .catch((error) => {
        console.error('Error completing cart:', error)
        throw error
      })

    if (cartRes?.type === 'order') {
      const countryCode =
        cartRes.order.shipping_address?.country_code?.toLowerCase()
      removeCartId()
      redirect(`/${countryCode}/order/confirmed/${cartRes?.order.id}`)
    }

    return cartRes.cart
  } catch (error) {
    console.error('Error placing order:', error)
    
    // Check if it's a shipping profile error
    if (error.message && error.message.includes('shipping profiles')) {
      throw new Error('Some items in your cart require different shipping methods. Please go back to the delivery step and select all required shipping methods.')
    }
    
    // Re-throw the original error
    throw error
  }
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    revalidateTag('cart')
  }

  revalidateTag('regions')
  revalidateTag('products')

  redirect(`/${countryCode}${currentPath}`)
}
