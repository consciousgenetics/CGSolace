import { Metadata } from "next"
import HomeContent from "../components/HomeContent"

export const metadata: Metadata = {
  title: "Home",
  description: "Shop the latest products",
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Home() {
  return <HomeContent />
} 