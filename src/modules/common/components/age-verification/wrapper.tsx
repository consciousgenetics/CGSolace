'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const AgeVerification = dynamic(
  () => import('./index'),
  { 
    ssr: false,
    loading: () => null
  }
)

export const AgeVerificationWrapper = () => {
  return (
    <Suspense fallback={null}>
      <AgeVerification />
    </Suspense>
  )
}

export default AgeVerificationWrapper 