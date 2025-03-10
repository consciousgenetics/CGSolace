export type FeaturedProduct = {
  id: string
  title: string
  handle: string
  thumbnail?: string
}

export type VariantPrice = {
  calculated_price_number: number
  calculated_price: string
  original_price_number: number
  original_price: string
  currency_code: string
  price_type: string
  percentage_diff: string
}

export type ProductFilters = {
  collection: {
    id: string
    value: string
  }[]
  type: {
    id: string
    value: string
  }[]
  material: {
    id: string
    value: string
  }[]
}

export type SearchedProduct = {
  id: string
  created_at: string
  title: string
  handle: string
  thumbnail: string
  calculated_price: number | null
  sale_price: string
  variants?: Array<{
    calculated_price?: number
    prices?: Array<{
      amount: number
    }>
  }>
}

export type SearchedProducts = {
  results: SearchedProduct[]
  count: number
}
