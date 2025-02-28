import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Home",
  description: "Shop the latest products",
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 