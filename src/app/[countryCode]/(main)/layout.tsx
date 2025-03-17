import React from 'react'
import { Metadata } from 'next'

import { getBaseURL } from '@lib/util/env'
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
      <div className="min-h-screen bg-gray-50">
        <div className="pt-[110px] xsmall:pt-[120px] medium:pt-[140px] [&>*:has(.hero-banner)]:!pt-0">
          {props.children}
        </div>
      </div>
    </>
  )
}
