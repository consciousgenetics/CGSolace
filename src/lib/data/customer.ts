'use server'

import { cache } from 'react'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import { sdk } from '@lib/config'

import { getAuthHeaders, removeAuthToken, setAuthToken } from './cookies'

export async function getCustomer() {
  try {
    const authHeaders = await getAuthHeaders()
    
    // If there are no auth headers, don't bother making the API call
    if (!authHeaders || !Object.keys(authHeaders).length) {
      return null
    }
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Use try-catch with an AbortController
    try {
      const response = await sdk.store.customer.retrieve(
        {}, 
        { 
          next: { tags: ['customer'] }, 
          ...authHeaders 
        }
      );
      
      clearTimeout(timeoutId);
      return response.customer;
    } catch (err: any) {
      console.warn("Error retrieving customer:", err?.message || "Unknown error");
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Exception in getCustomer:", error);
    return null;
  }
}

export const updateCustomer = cache(async function (
  _currentState: {
    success: boolean
    error: string | null
  },
  formData: FormData
) {
  const authHeaders = await getAuthHeaders()

  const body = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    phone: formData.get('phone') as string,
  }

  return await sdk.store.customer
    .update(body, {}, authHeaders)
    .then(() => {
      revalidateTag('customer')
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
})

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get('password') as string
  const customerForm = {
    email: formData.get('email') as string,
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    phone: formData.get('phone') as string,
  }

  try {
    const token = await sdk.auth.register('customer', 'emailpass', {
      email: customerForm.email,
      password: password,
    })

    const customHeaders = { authorization: `Bearer ${token}` }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      customHeaders
    )

    const loginToken = await sdk.auth.login('customer', 'emailpass', {
      email: customerForm.email,
      password,
    })

    await setAuthToken(loginToken as string)

    revalidateTag('customer')
    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}

export async function forgotPassword(
  _currentState: unknown,
  formData: FormData
) {
  const email = formData.get('email') as string
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/auth/customer/emailpass/reset-password`,
      {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
        }),
      }
    )
  } catch (error: any) {
    return error.toString()
  }
}

export async function resetPassword(
  _currentState: unknown,
  formData: FormData
) {
  const email = formData.get('email') as string
  const token = formData.get('token') as string
  const password = formData.get('new_password') as string

  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/auth/customer/emailpass/update?token=${token}`,
      {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    )
  } catch (error: any) {
    return error.toString()
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const token = await sdk.auth.login('customer', 'emailpass', {
      email,
      password,
    })
    await setAuthToken(token as string)
    revalidateTag('customer')
  } catch (error: any) {
    return error.toString()
  }
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()
  await removeAuthToken()
  revalidateTag('auth')
  revalidateTag('customer')
  redirect(`/${countryCode}/account`)
}

export const addCustomerAddress = async (
  _currentState: {
    success: boolean
    error: string | null
  },
  formData: FormData
): Promise<any> => {
  const address = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    company: formData.get('company') as string,
    address_1: formData.get('address_1') as string,
    city: formData.get('city') as string,
    postal_code: formData.get('postal_code') as string,
    province: formData.get('province') as string,
    country_code: formData.get('country_code') as string,
    phone: formData.get('phone') as string,
    address_name:
      (formData.get('address_name') as string) ?? 'shipping_address',
    is_default_shipping:
      formData.get('is_default_shipping') === 'on' || 'true' ? true : false,
  }

  const authHeaders = await getAuthHeaders()

  return sdk.store.customer
    .createAddress(address, {}, authHeaders)
    .then(() => {
      revalidateTag('customer')
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const authHeaders = await getAuthHeaders()

  await sdk.store.customer
    .deleteAddress(addressId, authHeaders)
    .then(() => {
      revalidateTag('customer')
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId =
    (currentState.addressId as string) ?? (formData.get('id') as string)

  const address = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    company: formData.get('company') as string,
    address_1: formData.get('address_1') as string,
    address_2: formData.get('address_2') as string,
    city: formData.get('city') as string,
    postal_code: formData.get('postal_code') as string,
    province: formData.get('province') as string,
    country_code: formData.get('country_code') as string,
    phone: formData.get('phone') as string,
    is_default_shipping:
      formData.get('is_default_shipping') === 'on' || 'true' ? true : false,
  }

  const authHeaders = await getAuthHeaders()

  return sdk.store.customer
    .updateAddress(addressId, address, {}, authHeaders)
    .then(() => {
      revalidateTag('customer')
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}
