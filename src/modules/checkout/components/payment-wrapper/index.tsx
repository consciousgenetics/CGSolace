'use client'

import React from 'react'
import { HttpTypes } from '@medusajs/types'

type WrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  return children
}

export default Wrapper
