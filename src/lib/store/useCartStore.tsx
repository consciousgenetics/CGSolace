import { create } from 'zustand'
import { HttpTypes } from '@medusajs/types'

interface CartStore {
  isOpenCartDropdown: boolean
  openCartDropdown: () => void
  closeCartDropdown: () => void
  cartItems: HttpTypes.StoreCartLineItem[] | null 
  setCartItems: (items: HttpTypes.StoreCartLineItem[] | null) => void
  isCartUpdated: boolean
  setCartUpdated: (updated: boolean) => void
}

export const useCartStore = create<CartStore>((set) => {
  return {
    isOpenCartDropdown: false,
    openCartDropdown: () =>
      set(() => ({
        isOpenCartDropdown: true,
      })),
    closeCartDropdown: () =>
      set(() => ({
        isOpenCartDropdown: false,
      })),
    cartItems: null,
    setCartItems: (items) => 
      set(() => ({
        cartItems: items,
        isCartUpdated: true,
      })),
    isCartUpdated: false,
    setCartUpdated: (updated) =>
      set(() => ({
        isCartUpdated: updated,
      })),
  }
})