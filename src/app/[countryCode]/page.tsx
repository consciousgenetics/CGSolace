import { Metadata } from "next"
import dynamic from 'next/dynamic'

// Dynamically import client components with ssr disabled
const HeroSection = dynamic(() => import("../components/HeroSection"), { ssr: false })
const ProductShowcase = dynamic(() => import("../components/ProductShowcase"), { ssr: false })
const PackSection = dynamic(() => import("../components/PackSection"), { ssr: false })
const MerchSection = dynamic(() => import("../components/MerchSection"), { ssr: false })
const CustomerReviews = dynamic(() => import("../components/CustomerReviews"), { ssr: false })

export const metadata: Metadata = {
  title: "Home",
  description: "Shop the latest products",
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Home() {
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