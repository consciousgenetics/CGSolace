'use client'

import { usePathname } from 'next/navigation'
import SubscribeSection from '.'

export default function SubscribeSectionWrapper() {
  const pathname = usePathname()
  const isContactPage = pathname?.includes('/contact')

  if (isContactPage) {
    return null
  }

  return <SubscribeSection />
} 