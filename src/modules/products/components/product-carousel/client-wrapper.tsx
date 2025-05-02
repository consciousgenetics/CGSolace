'use client'

import { ProductCarousel } from './index'

export default function ProductCarouselClientWrapper(props: React.ComponentProps<typeof ProductCarousel>) {
  return <ProductCarousel {...props} />
} 