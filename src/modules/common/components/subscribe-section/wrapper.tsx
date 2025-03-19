'use client'

import { usePathname } from 'next/navigation'
import SubscribeSection from '.'

export default function SubscribeSectionWrapper() {
  const pathname = usePathname()
  const isContactPage = pathname?.includes('/contact')
  const isPrivacyPolicyPage = pathname?.includes('/privacy-policy')
  const isTermsPage = pathname?.includes('/terms-and-conditions')
  const isOrderConfirmationPage = pathname?.includes('/order/confirmed')
  const isPaymentInstructionsPage = pathname?.includes('/payment-instructions')

  if (isContactPage || isPrivacyPolicyPage || isTermsPage || isOrderConfirmationPage || isPaymentInstructionsPage) {
    return null
  }

  return <SubscribeSection />
} 