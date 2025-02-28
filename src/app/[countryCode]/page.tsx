import { Metadata } from "next"
import HeroSection from "../components/HeroSection"
import ProductShowcase from "../components/ProductShowcase"
import PackSection from "../components/PackSection"
import MerchSection from "../components/MerchSection"
import CustomerReviews from "../components/CustomerReviews"

export const metadata: Metadata = {
  title: "Home",
  description: "Shop the latest products",
}

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