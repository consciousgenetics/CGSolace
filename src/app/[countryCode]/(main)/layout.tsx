import React from 'react'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getBaseURL } from '@lib/util/env'
import NavWrapper from '@modules/layout/templates/nav'
import { CartInitializer } from '@modules/cart/components/cart-initializer'

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { countryCode: string }
}) {
  const { countryCode } = await params;
  
  return (
    <>
      <NavWrapper countryCode={countryCode} />
      {/* Client component to initialize cart if needed */}
      <Suspense fallback={null}>
        <CartInitializer />
      </Suspense>
      <Suspense>
        <main 
          id="content"
          className="pt-[110px] xsmall:pt-[120px] medium:pt-[140px] [&>*:has(.hero-banner)]:!pt-0"
          data-testid="main-content"
        >
          {children}
        </main>
      </Suspense>
    </>
  )
}
