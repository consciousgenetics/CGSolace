'use client'

import { Metadata } from "next"
import { Suspense } from "react"

// Import components normally since they have 'use client' directives
import HeroSection from "../components/HeroSection"
import ProductShowcase from "../components/ProductShowcase"
import PackSection from "../components/PackSection"
import MerchSection from "../components/MerchSection"
import CustomerReviews from "../components/CustomerReviews"

// Move metadata to layout.tsx since client components can't export metadata
// export const metadata: Metadata = {
//   title: "Home",
//   description: "Shop the latest products",
// }

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Suspense fallback={<div>Loading...</div>}>
          <HeroSection />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <ProductShowcase />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <PackSection />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <MerchSection />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <CustomerReviews />
        </Suspense>
      </main>
    </div>
  )
} 