'use client'

import dynamic from 'next/dynamic'

// Dynamically import the RedKachinaHero component with SSR disabled
const RedKachinaHero = dynamic(
  () => import('./red-kachina-hero'),
  { ssr: false }
)

const RedKachinaHeroWrapper = () => {
  return <RedKachinaHero />
}

export default RedKachinaHeroWrapper 