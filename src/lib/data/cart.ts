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

export async function getOrSetCart(countryCode: string) {
  let cart = await retrieveCart()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  const authHeaders = await getAuthHeaders()

  if (!cart) {
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id },
      {},
      authHeaders
    )
    cart = cartResp.cart
    
    // Save the cart ID to cookies instead of revalidating here
    await setCartId(cart.id)
    // Don't call revalidateTag during rendering
  }

  if (cart && cart?.region_id !== region.id) {
    const authHeaders = await getAuthHeaders()

    await sdk.store.cart.update(
      cart.id,
      { region_id: region.id },
      {},
      authHeaders
    )
    // Don't call revalidateTag during rendering
  }

  return cart
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

  const cart = await getOrSetCart(countryCode)
  if (!cart) {
    throw new Error('Error retrieving or creating cart')
  }

  const authHeaders = await getAuthHeaders()

  await sdk.store.cart
    .createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      {},
      authHeaders
    )
    .then(() => {
      revalidateTag('cart')
    })
    .catch(medusaError)
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

    // Find the cheapest variant
    const cheapestVariant = detailedProduct.variants.reduce(
      (cheapest, current) =>
        cheapest.calculated_price.original_amount <
        current.calculated_price.original_amount
          ? cheapest
          : current
    )

    if (cheapestVariant.inventory_quantity <= 0) {
      return {
        success: false,
        error: 'Product is out of stock',
      }
    }

    await addToCart({
      variantId: cheapestVariant.id, // Add the cheapest variant to the cart
      quantity: 1,
      countryCode,
    })

    return {
      success: true,
      message: 'Product added to cart',
    }
  } catch (error) {
    console.error('Error adding product to cart:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
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

  // Direct SDK call with minimal fields for better performance
  const products = await sdk.store.product
    .list(
      {
        id: lineItems.map((lineItem) => lineItem.product_id!),
        region_id: regionId,
        fields: 'id,title,thumbnail,variants.id,variants.calculated_price,variants.inventory_quantity',
      },
      { next: { tags: ['products'] } }
    )
    .then(({ products }) => products)
    .catch(() => null)

  // If there are no line items or products, return an empty array
  if (!lineItems?.length || !products) {
    return []
  }

  // Create a minimal enriched item with only necessary data
  const enrichedItems = lineItems.map((item) => {
    const product = products.find((p) => p.id === item.product_id)
    
    if (!product) return item
    
    const variant = product.variants?.find((v) => v.id === item.variant_id)
    
    if (!variant) return item
    
    // Only add unit_price if calculated_amount is a valid number
    const calculatedAmount = variant.calculated_price?.calculated_amount;
    const hasValidPrice = typeof calculatedAmount === 'number' && !isNaN(calculatedAmount) && calculatedAmount > 0;
    
    // Base enriched item
    const enrichedItem = {
      ...item,
      variant: {
        id: variant.id,
        calculated_price: variant.calculated_price,
        inventory_quantity: variant.inventory_quantity,
        product: {
          id: product.id,
          title: product.title,
          thumbnail: product.thumbnail,
        },
      },
    };
    
    // Only add unit_price if we have a valid price
    if (hasValidPrice) {
      return {
        ...enrichedItem,
        unit_price: calculatedAmount,
      };
    }
    
    return enrichedItem;
  }) as HttpTypes.StoreCartLineItem[]

  return enrichedItems
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const authHeaders = await getAuthHeaders()

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, authHeaders)
    .then(() => {
      revalidateTag('cart')
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: {
    provider_id: string
    context?: Record<string, unknown>
  }
) {
  const authHeaders = await getAuthHeaders()

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

export async function placeOrder(comment: any) {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error('No existing cart found when placing an order')
  }

  const authHeaders = await getAuthHeaders()

  // Get the cart first to validate shipping methods
  const cartResponse = await sdk.store.cart.retrieve(cartId, {}, authHeaders)
    .catch(medusaError);
    
  const cart = cartResponse.cart;
  
  // Validate that all required shipping profiles have shipping methods assigned
  if (cart.items && cart.items.length > 0) {
    // Extract required profile IDs from cart items
    const requiredProfileIds = new Set(
      cart.items
        .filter((item: any) => item.variant?.product?.shipping_profile_id)
        .map((item: any) => item.variant.product.shipping_profile_id)
    );
    
    // If there are required profiles, check if they have shipping methods
    if (requiredProfileIds.size > 0) {
      // Get shipping profile IDs covered by selected shipping methods
      const selectedProfileIds = new Set();
      
      // For each shipping method, try to find which profile it covers
      (cart.shipping_methods || []).forEach((method: any) => {
        // For each item with a shipping profile
        cart.items.forEach((item: any) => {
          if (item.variant?.product?.shipping_profile_id) {
            // If this item's shipping methods include the current method
            if (item.shipping_methods && item.shipping_methods.some(
              (sm: any) => sm.shipping_option_id === method.shipping_option_id
            )) {
              selectedProfileIds.add(item.variant.product.shipping_profile_id);
            }
          }
        });
      });
      
      // Debug information
      console.log('Shipping profile validation:', {
        required: Array.from(requiredProfileIds),
        selected: Array.from(selectedProfileIds)
      });
      
      // Check if any required profiles are missing shipping methods
      const missingProfiles = Array.from(requiredProfileIds)
        .filter(id => !selectedProfileIds.has(id));
        
      if (missingProfiles.length > 0) {
        throw new Error(
          'The cart items require shipping profiles that are not satisfied by the current shipping methods'
        );
      }
    }
  }

  // Add comment to cart metadata if provided
  if (comment) {
    await updateCart({ metadata: {comment} })
  }

  const cartRes = await sdk.store.cart
    .complete(cartId, {}, authHeaders)
    .then((cartRes) => {
      revalidateTag('cart')
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === 'order') {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()
    removeCartId()
    // Instead of redirecting, return the order ID and country code
    return {
      success: true,
      orderId: cartRes.order.id,
      countryCode
    }
  }

  return { success: false, cart: cartRes.cart }
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

// Create a separate action function for revalidation
export async function refreshCartCache() {
  'use server'
  revalidateTag('cart')
}