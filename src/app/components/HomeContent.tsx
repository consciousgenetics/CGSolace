'use client'

import HeroSection from "./HeroSection"
import ProductShowcase from "./ProductShowcase"
import PackSection from "./PackSection"
import MerchSection from "./MerchSection"
import CustomerReviews from "./CustomerReviews"

export default function HomeContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <HeroSection />
        <ProductShowcase />
        <PackSection />
        <MerchSection />
        <CustomerReviews />
      </main>
    </div>
  )
} 