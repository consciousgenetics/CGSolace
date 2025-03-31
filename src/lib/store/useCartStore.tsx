import { create } from 'zustand'
import { HttpTypes } from '@medusajs/types'

interface CartStore {
  cartItems: HttpTypes.StoreCartLineItem[] | null 
  setCartItems: (items: HttpTypes.StoreCartLineItem[] | null) => void
  isCartUpdated: boolean
  setCartUpdated: (updated: boolean) => void
}

export const useCartStore = create<CartStore>((set, get) => {
  return {
    cartItems: null,
    setCartItems: (items) => {
      const currentItems = get().cartItems;
      
      // Check if the items are the same (by comparing length and first item ID)
      // This helps prevent unnecessary updates
      const isSameItems = 
        (items === null && currentItems === null) ||
        (items !== null && currentItems !== null && 
         items.length === currentItems.length &&
         (items.length === 0 || items[0].id === currentItems[0].id));
      
      if (!isSameItems) {
        set(() => ({
          cartItems: items,
          isCartUpdated: true,
        }));
      }
    },
    isCartUpdated: false,
    setCartUpdated: (updated) =>
      set(() => ({
        isCartUpdated: updated,
      })),
  }
})