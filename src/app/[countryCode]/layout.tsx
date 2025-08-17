import React from 'react'
import { Metadata } from 'next'

import { getBaseURL } from '@lib/util/env'
import { CountdownProvider } from '@lib/context/CountdownContext'
import AgeVerificationWrapper from '@modules/common/components/age-verification/wrapper'
import NavWrapper from '@modules/layout/templates/nav'
import Footer from '@modules/layout/templates/footer'
import SubscribeSectionWrapper from '@modules/common/components/subscribe-section/wrapper'

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export const revalidate = 300 // Revalidate at most every 5 minutes

// This is a server component
export default async function CountryLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { countryCode: string }
}) {
  // Extract countryCode
  const { countryCode } = await params
  
  return (
    <CountdownProvider>
      <div>
        <AgeVerificationWrapper />
        <NavWrapper countryCode={countryCode} />
        <main className="relative flex-grow">
          {children}
        </main>
        <SubscribeSectionWrapper />
        <Footer countryCode={countryCode} />
      </div>
    </CountdownProvider>
  )
} 