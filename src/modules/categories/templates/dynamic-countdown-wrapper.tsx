'use client'

import React from 'react'
import nextDynamic from 'next/dynamic'

// Dynamic import in a client component is allowed with ssr: false
const ClientCountdownDisplay = nextDynamic(() => import('./client-countdown-display'), { ssr: false })

export default function DynamicCountdownWrapper() {
  return <ClientCountdownDisplay />
} 