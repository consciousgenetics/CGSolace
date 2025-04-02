import React from 'react'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getBaseURL } from '@lib/util/env'
import NavWrapper from '@modules/layout/templates/nav'

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function PageLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { countryCode: string }
}) {
  return (
    <>
      <NavWrapper countryCode={params.countryCode} />
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
