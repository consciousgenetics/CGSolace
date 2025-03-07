import React from 'react'
import { Metadata } from 'next'

import { getBaseURL } from '@lib/util/env'
import Footer from '@modules/layout/templates/footer'
import NavWrapper from '@modules/layout/templates/nav'

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: {
  params: Promise<{ countryCode: string }>
  children: React.ReactNode
}) {
  const { countryCode } = await props.params

  return (
    <>
      <NavWrapper countryCode={countryCode} />
      <div className="min-h-screen">
        <div className="[&>*:not(:has(.hero-banner))]:pt-[80px] [&>*:not(:has(.hero-banner))]:xsmall:pt-[90px] [&>*:not(:has(.hero-banner))]:medium:pt-[110px]">
          {props.children}
        </div>
      </div>
      <Footer countryCode={countryCode} />
    </>
  )
}
